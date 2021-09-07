import React, { useState, useEffect, useRef, } from "react";
import io from "socket.io-client";
import { RoomAPI, OnRoomStart, OnRoomEnd, OnSnapThumbnail, OnSaveRecordVideo, GetRoomInfo } from '../../store/RoomController'
import { GetUserInfo, } from '../../store/CredentialController'
import { CONNECTION_PORT, ROOM_SAVE_RECORD_SNAP, ROOM_BLOCK_USER, ROOM_BLOCK_CHAT } from '../../utils/Urls'
import { playDonateSound, } from '../controls/Sound'
import { FaRegEye, FaHandPointRight, FaClock, FaLock, FaShareSquare, FaStopCircle, FaPause, FaPlay, FaStop } from "react-icons/fa";
import Peer from 'peerjs';
import { showToast } from '../controls/Toast'
import { showLoading } from '../controls/Loading'
import Page404 from '../controls/Page404'
import { Modal } from "react-responsive-modal";
import { useDispatch, } from 'react-redux';
import makeAnimated from 'react-select/animated';
import Select from 'react-select'
import { ChatBox } from './chat/ChatBox';
import DEFAULT_THUMBNAIL from '../../assets/img/3.png'
import { delayFunc, randColor, } from '../../utils/Helper';
import videojs from 'video.js'
import { Beforeunload } from 'react-beforeunload';
import { useHistory } from 'react-router-dom'
import moment from 'moment'
import 'videojs-record/dist/videojs.record.js';
import 'videojs-record/dist/plugins/videojs.record.ts-ebml.js';

const animatedComponents = makeAnimated();

let getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
let socket, local_stream, player, snapInternal, peer
let screenSharingStream;
const connections = [];

function Streamer() {
    const [chatBox, setChatBoxState] = useState(true)
    const [inputValues, set_] = useState({})
    const [isLoading, setIsLoading] = useState(true);
    const [userInfo, setUserInfo] = useState({})
    const [tags, setTags] = useState([])
    const [roomTags, setRoomTags] = useState([])
    const [_, setMutate] = useState(false)
    const [viewers, setViewers] = useState(0)
    const [isPlayedVideo, setIsPlayedVideo] = useState(false)
    const [room, setRoom] = useState({})
    const [loggedIn, setLoggedIn] = useState(true)
    const dispatch = useDispatch();
    const videoStatus = useRef(0)
    const roomInfo = useRef({})
    const [visibleModal, setVisibleModal] = useState(false)
    const [isReadyToRecord, setReadyToRecordState] = useState(false)
    const [isFinishRecord, setFinishRecordState] = useState(false)
    const [refreshWithoutAlert, setRefreshWithoutAlert] = useState(false)
    const [isShowBlockedUsers, setShowBlockedUsers] = useState(false)
    const [blockedUsers, setBlockedUsers] = useState([])
    const [isScreenSharing, setScreenSharing] = useState(false)
    const history = useHistory()
    const avatarRef = useRef(null)

    const showBLockedUsers = async () => {
        const isFetchable = roomInfo?.current?.id || 0
        if (isFetchable === 0) {
            showToast('fail', 'Can not get blocked user list')
            return
        }
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomId: roomInfo.current.id })
        };
        const request = await fetch(ROOM_BLOCK_USER, options)
        const response = await request.json()
        setBlockedUsers(response?.data || [])
        setShowBlockedUsers(true)
    }
    const blockChat = async (user, roomName, isBlock) => {
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user, roomName, isBlock })
        };
        const request = await fetch(ROOM_BLOCK_CHAT, options)
        const response = await request.json()
        if (response?.status === 200) {
            if (isBlock) {
                showToast('info', `Blocked user '${user}'`);
            } else {
                showBLockedUsers()
                showToast('info', `Allow user '${user}' to chat`);
            }
        } else {
            showToast('fail', `Can not block user '${user}'`);
        }
        setMutate(e => !e)
    }
    const onChangeForm = (value, stateName) => {
        if (stateName === "tags") {
            setRoomTags(value)
        } else {
            inputValues[stateName] = value
        }
        setMutate(e => !e)
    }
    const snap = async () => {
        const info = await GetUserInfo()
        snapInternal = setInterval(() => {
            try {
                const video = document.getElementById("snap-video");
                const canvas = document.createElement("canvas");
                canvas.width = 500;
                canvas.height = 500;
                canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
                canvas.toBlob((blob) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(blob);
                    reader.onloadend = function () {
                        const base64String = reader.result;
                        const data = {
                            fileName: `${info.id}_${info.nickname}.png`,
                            imageBase64: base64String,
                            user_id: info.id,
                        }
                        OnSnapThumbnail(data)
                    }
                })
            } catch (e) { console.log(e) }
        }, 2000);
    }
    const disableScreenSharing = () => {
        const displayVideo = document.getElementById("screen-sharing");
        const track = local_stream.getVideoTracks()[0]
        connections.forEach(peer => peer.getSenders().find(sender => sender.track.kind === track.kind).replaceTrack(track))
        displayVideo.srcObject = local_stream;
        displayVideo.play()
        setScreenSharing(false)
        screenSharingStream.getTracks().forEach((track) => track.stop())
    }
    const enableScreenSharing = async () => {
        if (!local_stream) return;
        showLoading(true)
        navigator.mediaDevices.getDisplayMedia().then((stream) => {
            const displayVideo = document.getElementById("screen-sharing");
            const screenSharing = stream.getVideoTracks()[0];
            connections.forEach(peer => peer.getSenders().find(sender => sender.track.kind === screenSharing.kind).replaceTrack(screenSharing))
            screenSharing.onended = () => disableScreenSharing()
            displayVideo.srcObject = stream;
            displayVideo.play().then(() => {
                setScreenSharing(true);
                screenSharingStream = stream;
                showLoading(false);
            })
        }).catch(error => {
            showLoading(false)
        })
    }
    const onStartStream = async () => {
        try {
            showLoading(true)
            const { nickname, id, } = await GetUserInfo()
            const { description, title } = inputValues
            const tags = roomTags
            const result = await OnRoomStart({
                user_id: id,
                title: title || '',
                description: description || '',
                tags: tags ? JSON.stringify(tags) : '[]',
                thumbnail: '',
            })
            if (result?.status !== 200) {
                showToast('error', 'Can not go LIVE');
                showLoading(false)
                onEndStream();
                return;
            }
            const prepareStream = () => {
                getUserMedia({ video: true, audio: false }, (stream) => {
                    try {
                        const snapVideo = document.getElementById("snap-video");
                        snapVideo.srcObject = stream;
                        local_stream = stream;
                        snapVideo.play().then(snap)
                        player.record().getDevice()
                        setReadyToRecordState(true)
                        showToast('info', 'Your image is being streaming!')
                        showLoading(false)
                    } catch (e) { }
                })
            }
            if (peer) {
                prepareStream();
                return;
            }
            peer = new Peer(nickname)
            peer.on('open', (id) => {
                socket.emit("open_room", { nickname })
                roomInfo.current = result.data
                prepareStream();
            })
            peer.on('call', (call) => {
                call.on('stream', (stream) => connections.push(call.peerConnection))
                call.answer(local_stream);
            })
        } catch (error) {
            console.log(error, 'error')
            showToast('error', 'Can not go LIVE');
            showLoading(false);
            await onEndStream();
        }
    }
    const onEndStream = async () => {
        try {
            const { id, streamer, streamer_id, } = roomInfo.current || {}
            const data = {
                room_id: id,
                streamer_id: streamer_id,
                status: 0,
            }
            await OnRoomEnd(data)
            const msgToast = `User ${streamer} has ended the live stream`
            const msgChatbox = `User ${streamer} has ended the live stream`
            socket.emit("on_donate", { streamer, message: msgToast, isDonate: false, })
            socket.emit('sendMessage', { message: msgChatbox, userChat: streamer, roomName: streamer, colorRand: randColor(), createdAt: moment() });
        } catch (e) { }
    }
    const onImageChange = (event) => {
        if (event.target.files && event.target.files[0]) {
            inputValues.thumbnail = event.target.files[0]
            setMutate(e => !e)
        }
    }
    const callEffect = async () => {
        showLoading(true)
        setIsLoading(true)
        try {
            // * Info
            const info = await GetUserInfo()
            setUserInfo(info)
            if (info.id === undefined) {
                setLoggedIn(false)
                showLoading(false)
                setIsLoading(false)
                return
            }
            // * Role Checking
            if (info.role_user === "VIEWER") {
                window.location.href = "/"
                showLoading(false)
                setIsLoading(false)
                return
            }
            const tags = await dispatch(RoomAPI.GetRoomTags());
            setTags(tags?.data || [])
            const roomInfo = await GetRoomInfo({ roomName: info.nickname, idUser: info.id })
            setRoomTags(JSON.parse(roomInfo?.data?.tags) || [])
            setRoom(roomInfo?.data || {})
            // * Socket
            socket = io(CONNECTION_PORT);
            socket.emit("open_donate_room", { nickname: info.nickname })
            socket.on('update_viewer_watching', ({ currentViewers }) => setViewers(currentViewers - 2))
            socket.on('update_viewer_watching_on_end', ({ currentViewers }) => setViewers(currentViewers - 4))
            socket.on('message_donate', delayFunc(({ message, isDonate, }) => {
                if (isDonate) {
                    showToast('dark', message, { position: "bottom-center" })
                    playDonateSound()
                }
            }))
        } catch (e) { console.log(e) }
        showLoading(false)
        setIsLoading(false)
    }
    const onSaveVideoRecord = async () => {
        if (!inputValues?.titleThumbnail || !inputValues?.thumbnail) return
        showLoading(true)
        try {
            if (!player?.record()) return
            await local_stream.getVideoTracks()[0].stop();
            if (isScreenSharing) {
                await screenSharingStream.getVideoTracks()[0].stop();
                await setScreenSharing(false);
            }
            await document.querySelector('.vjs-record-button').click()

            setTimeout(async () => {
                const userInfo = await GetUserInfo();
                const param = {
                    userInfo: userInfo,
                    title: inputValues.titleThumbnail,
                    recordData: player.recordedData,
                }
                player.record().reset()
                const result = await OnSaveRecordVideo(param)
                if (result.status === 200) {
                    const reader = new FileReader();
                    reader.readAsDataURL(inputValues.thumbnail);
                    reader.onload = async function () {
                        const options = {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                user_id: userInfo.id,
                                fileName: inputValues?.thumbnail?.name || '',
                                imageBase64: reader.result,
                            }),
                        };
                        await fetch(ROOM_SAVE_RECORD_SNAP, options)
                        await onEndStream()
                        showToast('success', result.msg)
                        setVisibleModal(false)
                        setFinishRecordState(false)
                        setReadyToRecordState(false)
                        setRefreshWithoutAlert(true)
                        setTimeout(() => {
                            window.location.reload()
                        }, 1500)
                    };
                } else {
                    showToast('error', result.msg)
                }
            }, 1000)
        } catch (e) { console.log(e) }
        showLoading(false)
    }
    const closeRoomInfoModal = async (isFinishRecord) => {
        if (isFinishRecord) player.record().reset();
        else {
            await onStartStream();
            await initVideo();
        }
        setVisibleModal(false);
    }
    const startStream = () => {
        setVisibleModal(true);
    }
    useEffect(() => {
        callEffect()
        return history.listen(() => {
            try {
                if (videoStatus.current === 1) {
                    onEndStream()
                    window.location.reload()
                }
                clearInterval(snapInternal)
                player.dispose()
            } catch (e) { }
        })
    }, [history]);
    const pauseVid = () => {
        const isPlaying = local_stream?.getVideoTracks()[0].enabled || null
        if (!isPlaying) return;
        local_stream.getVideoTracks()[0].enabled = false
        if (isScreenSharing) {
            screenSharingStream.getVideoTracks()[0].enabled = false
            document.getElementById('screen-sharing').pause()
        }
        player.pause();
    }
    const resumeVid = () => {
        const isPlaying = local_stream?.getVideoTracks()?.[0].enabled
        if (isPlaying === undefined) return;
        local_stream.getVideoTracks()[0].enabled = true
        if (isScreenSharing) {
            screenSharingStream.getVideoTracks()[0].enabled = true
            document.getElementById('screen-sharing').play()
        }
        player.play();
    }
    const stopVid = () => {
        setVisibleModal(true)
        setFinishRecordState(true)
    }
    const initVideo = () => {
        try {
            const videoMaxLengthInSeconds = 60 * 60;
            player = videojs("local-video", {
                controls: false,
                fluid: false,
                autoplay: true,
                controlBar: {
                    deviceButton: false,
                    recordIndicator: false,
                    cameraButton: false,
                    pipToggle: false,
                    recordToggle: false,
                },
                plugins: {
                    record: {
                        audio: true,
                        video: true,
                        maxLength: (videoMaxLengthInSeconds),
                        convertEngine: 'ts-ebml',
                    }
                }
            });
            player.on('deviceReady', () => {
                player.record().start()
            })
            player.on('error', function (error) {
                console.log('error:', error);
            });
            player.on('play', async function () {
                videoStatus.current = 1
                setIsPlayedVideo(true)
            })
            player.on('pause', function () {
                videoStatus.current = 0
                setMutate(e => !e)
            })
            player.on('finishRecord', async function () {

            });
        } catch (e) { showToast('error', e) }
    }

    return (
        !loggedIn && !isLoading ? (
            <Page404 text="Login Required" />
        ) : !isLoading && (
            <div className='container-fluid d-flex flex-row m-auto p-4' style={{ zIndex: 999, pointerEvents: 'auto', height: '80vh' }}>
                {isPlayedVideo && (
                    <Beforeunload onBeforeunload={(event) => {
                        if (!refreshWithoutAlert) {
                            event.preventDefault()
                            onEndStream()
                            window.location.reload()
                        }
                    }} />
                )}
                <div className='d-flex flex-column h-100 w-100'>
                    <div style={{ width: '100%', height: 'calc(100% - 123px)', position: 'relative', }}>
                        <video className='d-none' id="snap-video" />
                        <div style={isScreenSharing ? { height: '100%', width: '100%', position: "absolute", right: 0, bottom: 0 } : { display: "none" }}>
                            <video className='h-100 w-100' id="screen-sharing" style={{ background: 'black' }} />
                        </div>
                        <div style={isScreenSharing ? { height: '25%', width: '25%', position: "absolute", right: 0, bottom: 0, zIndex: 1 } : { height: '100%', width: '100%' }}>
                            <video className='h-100 w-100 video-js' id="local-video" style={{ background: 'black' }} />
                        </div>
                        <div className={isReadyToRecord ? 'collapse' : 'd-flex w-100 h-100 align-items-center justify-content-center'} style={{ position: "absolute", top: 0 }}>
                            <button className='px-3 py-2 btn btn-outline-primary btn-lg'
                                onClick={startStream}>Start</button></div>
                        <div className={chatBox ? 'collapse' : 'p-2'} style={{ position: "absolute", right: 0, top: 0, opacity: 0.5 }}>
                            <img className='m-auto' src={require("../../assets/img/page/show_right_side_panel_48px.png")}
                                alt="" style={{ width: 30, height: 30, cursor: 'pointer' }}
                                onClick={() => { setChatBoxState(!chatBox) }} /></div>
                    </div>
                    {/* {isPlayedVideo && ( */}
                    <div className="text_primary mt-3 shadow d-flex"
                        style={{ fontSize: 16, background: 'rgba(33, 33, 33, 0.5)', borderRadius: 10, height: 120, padding: '15px' }}>
                        <div className='d-flex flex-column px-3'>
                            <span><FaHandPointRight style={{ marginRight: 10, }} /> {inputValues?.title || "Title"}</span>
                            <span><FaClock style={{ marginRight: 10, }} /> {moment(roomInfo?.current?.created_at).endOf('min').fromNow()}</span>
                            <span><FaRegEye style={{ marginRight: 10, }} /> {Math.max(viewers, 0)?.toString() || "0"}</span>
                        </div>
                        <div className='d-flex flex-column px-3'>
                            <span style={{ cursor: 'pointer', }} onClick={showBLockedUsers}><FaLock style={{ marginRight: 10, }} /> Blocked Users</span>
                            {!local_stream && isScreenSharing ?
                                (
                                    <span onClick={disableScreenSharing} style={{ cursor: 'pointer' }}>
                                        <FaStopCircle style={{ marginRight: 10, }} /> Stop
                                    </span>
                                ) : (
                                    <span onClick={enableScreenSharing} className={local_stream ? '' : 'text-dark'} style={{ cursor: 'pointer' }}>
                                        <FaShareSquare style={{ marginRight: 10, }} /> Share screen
                                    </span>
                                )
                            }
                        </div>
                        <div className='d-flex px-3 align-self-center ml-auto' style={{ height: 50 }}>
                            <div className='bg-dark text_primary shadow-lg btn d-flex px-3 mx-1 align-self-center' onClick={pauseVid}><FaPause /></div>
                            <div className='bg-dark text_primary shadow-lg btn d-flex px-3 mx-1 align-self-center' onClick={resumeVid}><FaPlay /></div>
                            <div className='bg-dark text_primary shadow-lg btn d-flex px-3 mx-1 align-self-center' onClick={stopVid}><FaStop /></div>
                        </div>
                    </div>
                    {/* )} */}
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
                        {(userInfo?.nickname) ? <ChatBox roomName={userInfo.nickname} userChat={userInfo.nickname} streamerProps={{ blockChat }} /> : <></>}
                    </div>
                </div>
                <Modal open={visibleModal} center onClose={() => setVisibleModal(false)}>
                    <div style={{ width: '80vw', maxWidth: '700px', }}>
                        <div className='py-3' style={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'space-around', justifyContent: 'space-around', }}>
                            <div className='w-75'>
                                <input className='border form-control' value={isFinishRecord ? inputValues.titleThumbnail : inputValues.title} placeholder="Title..."
                                    onChange={(e) => onChangeForm(e.target.value, isFinishRecord ? 'titleThumbnail' : 'title')} />
                            </div>
                        </div>
                        {isFinishRecord ?
                            (
                                <>
                                    <div className='py-3' style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'space-around', justifyContent: 'space-around', }}>
                                        <div className='w-75 m-auto d-flex align-items-center'>
                                            <div className='d-flex' style={{ width: '30%' }}><h4>Thumbnail</h4></div>
                                            <div className='' style={{ width: '70%', display: 'flex', justifyContent: 'center', }}>
                                                <div style={{ position: 'relative', width: 300, height: 200, }}>
                                                    <img src={inputValues?.thumbnail ? URL.createObjectURL(inputValues?.thumbnail) : DEFAULT_THUMBNAIL} alt="" style={{ width: '100%', height: '100%', borderRadius: 10, objectFit: 'cover', }} />
                                                    <button onClick={() => avatarRef?.current?.click()} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, }} />
                                                    <input ref={avatarRef} type="file" onChange={onImageChange} style={{ display: 'none', }} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className='py-3' style={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'space-around', justifyContent: 'space-around', }}>
                                        <div className='w-75'>
                                            <textarea className='border form-control' value={inputValues.description}
                                                style={{ width: '100%', height: 100, }} onChange={(e) => onChangeForm(e.target.value, 'description')} placeholder="Description..." />
                                        </div>
                                    </div>
                                    <div className='py-3' style={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'space-around', justifyContent: 'space-around', }}>
                                        <div className='w-75'>
                                            <div style={{ width: '100%', }}>
                                                <Select options={tags} onChange={(e) => onChangeForm(e, 'tags')}
                                                    closeMenuOnSelect={false} components={animatedComponents}
                                                    isMulti placeholder='Tags...'
                                                    value={roomTags} />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )
                        }
                        <div className='pt-3' style={{ width: '75%', display: 'flex', justifyContent: 'flex-end', margin: "auto" }}>
                            <div className='pl-1'><button className='btn btn-primary' onClick={() => setVisibleModal(false)}>Cancel</button></div>
                            <div className='pl-1'><button className='btn btn-primary' onClick={() => isFinishRecord ? onSaveVideoRecord() : closeRoomInfoModal()}>Finish</button></div>
                        </div>
                    </div>
                </Modal>
                <Modal open={isShowBlockedUsers} center onClose={() => setShowBlockedUsers(false)}>
                    <div className='py-4 m-auto' style={{ width: 600 }}>
                        <table class="table table-bordered table-hover" style={{ marginTop: 10, }}>
                            <thead>
                                <tr>
                                    <th>Nickname</th>
                                    <th>Date</th>
                                    <th>Remove</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(blockedUsers || [])?.length === 0 ?
                                    <tr>
                                        <td colspan="3" className='text-center'>No record found</td>
                                    </tr> : null}
                                {(blockedUsers || []).map((user, idx) => {
                                    return (
                                        <tr key={idx}>
                                            <td>{user.nickname}</td>
                                            <td>{moment(user.block_date).format("YYYY/MM/DD")}</td>
                                            <td className='text-center'><button onClick={() => blockChat(user?.nickname || '', room.nickname || '', false)} className='btn btn-success'>Remove</button></td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </Modal>
            </div>
        )
    );
}
export default Streamer;