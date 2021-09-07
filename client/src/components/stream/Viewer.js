import React, { useState, useEffect, } from "react";
import io from "socket.io-client";
import { GetRoomInfo, } from '../../store/RoomController'
import { GetUserInfo, isLoggedIn, } from '../../store/CredentialController'
import { SubscribeChannel, } from '../../store/UserController'
import Page404 from '../controls/Page404'
import { getToken } from '../../utils/Helper'
import { FaThumbsUp, FaRegGem, FaDonate, FaRegEye } from "react-icons/fa";
import { CONNECTION_PORT, HOST_IMAGE, HOST_AVATAR, ROOM_LIKE, } from '../../utils/Urls'
import { showToast } from '../controls/Toast'
import { showLoading } from '../controls/Loading'
import Emitter from '../controls/EventEmitter'
import { delayFunc } from '../../utils/Helper';
import { playDonateSound, } from '../controls/Sound'
import Peer from 'peerjs';
import { ChatBox } from "./chat/ChatBox";
import { Beforeunload } from 'react-beforeunload';
import { useHistory } from 'react-router-dom'
import moment from "moment";

let socket;
let canvas
let getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

function Viewer() {
    const [roomInfo, setRoomInfo] = useState({})
    const [userInfo, setUserInfo] = useState({})
    const [viewers, setViewers] = useState(0)
    const [loading, setLoading] = useState(true)
    const [chatBox, setChatBoxState] = useState(true)
    const [isPlayedVideo, setIsPlayedVideo] = useState(false)
    const [_, setMutate] = useState(false)
    const history = useHistory()
    const blockUser = () => {
        showToast('info', 'The host is locked you from chatting')
        setMutate(e => !e)
    }
    const onPlayVideo = (infoRoom) => {
        onSetLoading(true)
        try {
            const { nickname } = infoRoom
            let peer = new Peer()
            peer.on('open', (id) => {
                setIsPlayedVideo(true)
                getUserMedia({ video: true, audio: true }, (stream) => {
                    const call = peer.call(nickname, stream)
                    socket.emit('user_connect_room', { roomInfo: infoRoom })
                    call.on('stream', (remoteStream) => {
                        const video = document.getElementById("remote-video");
                        video.srcObject = remoteStream;
                        video.play().then(onSetLoading(false));
                    })
                }, (err) => {
                    showToast('error', 'Can not play video')
                    onSetLoading(false)
                })
            })
        } catch (e) {
            showToast('error', e)
            onSetLoading(false)
        }
    }
    const onSetLoading = (boolean) => {
        showLoading(boolean)
        setLoading(boolean)
    }
    const onSubcribe = async () => {
        if (!isLoggedIn()) {
            Emitter.emit("login_required", {})
            return
        }
        const data = {
            host_id: roomInfo.streamer_id,
            follower_id: userInfo.id,
            isSubscribed: roomInfo.isSubscribed,
        }
        const result = await SubscribeChannel(data)
        if (result.status === 200) {
            setRoomInfo({ ...roomInfo, isSubscribed: result?.data?.isSubscribed })
            showToast('info', result.msg)
        } else {
            showToast('error', result.msg)
        }
    }
    const onGotoDonatePage = () => {
        if (!isLoggedIn()) {
            Emitter.emit("login_required", {})
            return
        }
        const { streamer_id, nickname, } = roomInfo
        window.open(`/donation?streamer_id=${streamer_id}&streamer=${nickname}&viewer=${userInfo.nickname}&q=${getToken()}`, '_blank');
    }
    const callEffect = async () => {
        onSetLoading(true)
        try {
            const userInfo = await GetUserInfo()
            setUserInfo(userInfo)
            const room_name = window.location?.pathname?.match(/(?<=\/user\/)[\w].*/g)?.[0]
            const data = {
                roomName: room_name,
                idUser: userInfo?.id || -1,
            }
            const result = await GetRoomInfo(data)
            if (result.status === 200) {
                const info = result.data
                info.tags = info.tags?.trim().length > 0 ? JSON.parse(info.tags) : []
                setViewers(info?.viewers || 0)
                setRoomInfo(info)
                // if (info.streamer_id !== undefined && info.room_status === 1) {
                //     onPlayVideo(info)
                // }
                onPlayVideo(info)
                // * Socket
                socket = io(CONNECTION_PORT);
                socket.emit("open_donate_room", { nickname: room_name })
                socket.on('message_donate', delayFunc(({ message, isDonate, }) => {
                    showToast('dark', message, { position: "bottom-center" })
                    if (isDonate) {
                        playDonateSound()
                    }
                }))
                socket.on('update_viewer_watching', ({ currentViewers }) => setViewers(currentViewers - 2))
                socket.on('update_viewer_watching_on_end', ({ currentViewers }) => setViewers(currentViewers - 4))
                window.onbeforeunload = () => {
                    socket.emit("end", { info })
                }
            }
        } catch (e) { showToast('error', e) }
        onSetLoading(false)
    }
    useEffect(() => {
        canvas = document.createElement("canvas");
        canvas.width = 320;
        canvas.height = 180;
        callEffect()
        return history.listen(() => {
            window.location.reload()
        })
    }, [history]);

    const likeVideo = () => {
        try {
            roomInfo.likes += 1;
            fetch(ROOM_LIKE, {
                body: JSON.stringify({ streamer_id: roomInfo.streamer_id, likes: roomInfo.likes }),
                method: "POST",
                headers: { 'Content-Type': 'application/json', },
            })
            setMutate(e => !e)
        } catch (err) { console.log(err, 'cant like video') }
    }

    return (
        roomInfo.streamer_id !== undefined ? (
            <div className='container-fluid d-flex flex-row m-auto p-4' style={{ zIndex: 999, pointerEvents: 'auto', }}>
                {isPlayedVideo && (
                    <Beforeunload onBeforeunload={(event) => {
                        event.preventDefault()
                        window.location.reload()
                    }} />
                )}
                <div className='h-100 w-100 d-flex flex-column'>
                    <div className='d-flex' style={{ position: "relative" }}>
                        <video id="remote-video" style={{ maxHeight: '80vh', minWidth: '100%', minHeight: 350, background: 'black' }}
                            poster={HOST_IMAGE + (roomInfo?.thumbnail || "")} />
                        <div onClick={() => { setChatBoxState(!chatBox) }} className={chatBox ? 'collapse' : 'text-center mx-2 py-2 text-light'}
                            style={{ width: 30, height: 30, cursor: 'pointer', position: "absolute", right: 0, top: 0, opacity: 0.5 }}>
                            <div className='d-flex'>
                                <img className='m-auto' src={require("../../assets/img/page/show_right_side_panel_48px.png")}
                                    alt="" style={{ height: 30, width: 30 }} />
                            </div>
                        </div>
                    </div>
                    <div className='mt-3'>
                        <div className='d-flex shadow p-3' style={{ minHeight: 120, maxHeight: 200, borderRadius: 15, background: 'rgb(33,33,33,0.5)' }}>
                            <div className='d-flex w-100'>
                                <div className='d-flex w-100'>
                                    <div className='d-flex mr-3' style={{ width: 100, flexDirection: 'column', alignItems: 'center', }}>
                                        <img className='m-auto'
                                            src={roomInfo?.photo ? HOST_AVATAR + roomInfo.photo : require("../../assets/images/Avatar.png")}
                                            alt="" style={{ height: 70, width: 70, borderRadius: '50%', cursor: "pointer", objectFit: 'cover', }} />
                                        <span style={{ color: 'lightgreen', }}>{roomInfo.nickname || "nickname"}</span>
                                    </div>
                                    <div className='d-flex flex-column m-auto px-3 border-bottom w-100'>
                                        <div><h4 className='font-weight-bold text_primary'>{roomInfo.title || 'title'}</h4></div>
                                        <div className="py-1 text_primary">
                                            <div style={{ height: 100, maxWidth: 200, display: "inline" }}>{roomInfo?.description || "description"}</div> | <span className='text-secondary'>{moment(roomInfo?.created_at).endOf('min').fromNow()}</span>
                                        </div>
                                        <div className="d-flex flex-row py-1" >
                                            <div className='d-flex align-items-center w-100 text-light'>
                                                {roomInfo.tags.map((tag, idx) => {
                                                    return (<span key={idx} className="list_video_tags py-1 px-2" style={{ fontSize: 12, }}><li>{tag.label}</li></span>)
                                                })}
                                            </div>
                                            <div className='d-flex justify-content-end w-100 text-light'>
                                                <div className='py-1 px-2 d-flex align-items-center' style={{ fontSize: 18, }}>
                                                    <FaRegEye />
                                                    <div className='px-2'>{Math.max(viewers, 0)?.toString() || "0"}</div>
                                                </div>
                                                <div className='py-1 px-2 d-flex align-items-center interaction_bar_icon' onClick={likeVideo} style={{ cursor: "pointer", fontSize: 18, }}>
                                                    <FaThumbsUp />
                                                    <div className='px-2'>{roomInfo.likes}</div>
                                                </div>
                                                <div className='py-1 px-2 d-flex align-items-center interaction_bar_icon' onClick={onSubcribe} style={{ cursor: "pointer", fontSize: 18, }}>
                                                    <FaRegGem />
                                                    <div className='px-2'>{roomInfo.isSubscribed ? "Unfollow" : "Follow"}</div>
                                                </div>
                                                <div className='py-1 px-2 d-flex align-items-center interaction_bar_icon' onClick={onGotoDonatePage} style={{ cursor: "pointer", fontSize: 18, }}>
                                                    <FaDonate />
                                                    <div className='px-2'>Donate</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={chatBox ? 'ml-3 shadow' : 'collapse'} style={{ width: 350, background: 'rgb(33,33,33,0.5)', borderRadius: 10 }}>
                    <div className='d-flex flex-column' style={{ position: 'relative', height: '100%' }}>
                        <div className='px-3'>
                            <div className='border-bottom w-100 d-flex justify-content-end align-items-center'>
                                <div className='p-2'>
                                    <img className='m-auto' src={require("../../assets/img/page/show_left_side_panel_48px.png")}
                                        alt="" style={{ width: 30, height: 30, cursor: 'pointer' }}
                                        onClick={() => { setChatBoxState(!chatBox) }} />
                                </div>
                            </div>
                        </div>
                        {(userInfo?.nickname) ? <ChatBox roomName={roomInfo.nickname} userChat={userInfo.nickname} streamerProps={null} viewerProps={{ blockUser }} /> : <></>}
                    </div>
                </div>

            </div>
        ) : !loading && (
            <Page404 />
        )
    );
}
export default Viewer;
