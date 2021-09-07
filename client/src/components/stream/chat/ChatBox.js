import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { CONNECTION_PORT, GET_CURRENT_USER_PROFILE } from '../../../utils/Urls'
import { randColor, } from '../../../utils/Helper'
import moment from 'moment'
import { showToast } from '../../controls/Toast'
import Emitter from '../../controls/EventEmitter'
import { isLoggedIn } from '../../../store/CredentialController'
import { FaStopCircle } from "react-icons/fa";
let socket;

export const ChatBox = ({ roomName, userChat, streamerProps, ...viewerProps }) => {
    const [messages, set_] = useState([]);
    const [inputValues, set__] = useState({});
    const [_, setMutate] = useState(false);

    const onChangeForm = (value, stateName) => {
        inputValues[stateName] = value
        setMutate(e => !e)
    }
    const pushToBottom = () => {
        document.querySelector("#chatbox_scroll_frame").scrollTo(0, document.querySelector("#chatbox_scroll_frame").scrollHeight);
    }

    useEffect(() => {
        socket = io(CONNECTION_PORT);
        socket.emit('join', ({ userChat, roomName }));
        socket.on('message', (payload) => {
            try {
                messages.push(payload)
                setMutate(e => !e)
                pushToBottom()
            } catch (e) { console.log(e) }
        });
        socket.on('block', () => {
            try {
                const blockUser = viewerProps?.viewerProps?.blockUser
                blockUser()
            } catch (e) { console.log(e) }
        });
        socket.on('error', ({ message }) => {
            showToast('error', message)
        });
    }, []);
    const sendMessage = () => {
        if (!isLoggedIn()) {
            Emitter.emit("login_required", {})
            return
        }
        if (inputValues?.message?.trim()?.length === 0) { return; }
        const { message } = inputValues
        socket.emit('sendMessage', { message, userChat, roomName, colorRand: randColor(), createdAt: moment() });
        inputValues['message'] = ''
    }
    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
            <div id="chatbox_scroll_frame" className='px-3' style={{ height: 'calc(80vh - 150px)', overflowY: "auto", whiteSpace: "normal" }}>
                {AlwaysScrollToBottom({ messages: messages, roomName: roomName, streamerProps, userChat: userChat })}
            </div>
            <div className='px-3' style={{ marginBottom: 10, background: "transparent" }}>
                <input className='mt-2 text-light shadow text_primary'
                    style={{ background: 'rgba(66,68,73,0.7)', border: 'none', outline: "none", width: '100%', padding: 10, height: 40, borderRadius: 5, boxShadow: '0px 0px 3px black' }}
                    placeholder="Chat..."
                    value={inputValues.message || ""}
                    onChange={(e) => onChangeForm(e.target.value, "message")}
                    onKeyUp={(e) => e.key === 'Enter' && sendMessage()} />
            </div>
        </div>
    );
}

export const AlwaysScrollToBottom = ({ messages, roomName, streamerProps, userChat }) => {
    const blockChat = streamerProps?.blockChat
    const isNotStreamer = blockChat === null || blockChat === undefined
    const openSelectedProfile = (nickname) => {
        window.open(GET_CURRENT_USER_PROFILE(nickname))
    }
    return (
        messages.map((e, idx) => {
            return (
                <div key={idx}>
                    {e.helloText !== undefined &&
                        <div className='text-center py-2 text_primary'>
                            <span>{e.helloText}</span>
                            <span style={{ cursor: "pointer", fontWeight: "bold" }} onClick={() => openSelectedProfile(roomName)}>{roomName} </span>
                            <span> room</span>
                        </div>}
                    {e.welcomeText !== undefined &&
                        <div className='text-secondary text_primary'>
                            <span style={{ cursor: "pointer", fontWeight: "bold" }} onClick={() => openSelectedProfile(e.userChat)}>{e.userChat}</span>
                            <span>{e.welcomeText}</span>
                        </div>}
                    {e.message !== undefined &&
                        <div className='py-2' style={{ wordBreak: 'break-all' }}>
                            <div className="text_primary">
                                <div>
                                    {isNotStreamer ? null :
                                        (roomName === e.userChat ? null :
                                            <div className='text-light d-inline m-auto px-1' style={{ cursor: 'pointer' }} onClick={() => blockChat(e.userChat, roomName, true)}><FaStopCircle /></div>
                                        )
                                    }
                                    <span style={{ cursor: "pointer", fontWeight: "bold", color: e.colorRand }}
                                        onClick={() => openSelectedProfile(e.userChat)}>
                                        {e.userChat} ({moment(e.createdAt).format('LT')})
                                    </span>: <span>{e.message}</span>
                                </div>
                            </div>
                        </div>
                    }
                </div>
            )
        })
    )
}