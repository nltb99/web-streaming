import React, { useState, useEffect, } from 'react'
import { getParamUrl, randColor, } from '../../utils/Helper'
import { showToast, } from '../controls/Toast'
import Emitter from '../controls/EventEmitter'
import { showLoading, } from '../controls/Loading'
import io from "socket.io-client";
import { CONNECTION_PORT, } from '../../utils/Urls'
import { isLoggedIn, } from '../../store/CredentialController'
import { OnDonateToken, } from '../../store/PaymentController'
import moment from 'moment'

let socket;

const Donation = () => {
    const [inputValues, setInputValues] = useState({})

    const onChangeForm = (value, stateName) => {
        setInputValues({ ...inputValues, [stateName]: value })
    }
    const callEffect = async () => {
        showLoading(true)
        // * Socket
        socket = io(CONNECTION_PORT);
        setInputValues({
            ...inputValues,
            'jwt': getParamUrl('q'),
            'streamer_id': getParamUrl('streamer_id'),
            'streamer': getParamUrl('streamer'),
            'viewer': getParamUrl('viewer'),
        })
        showLoading(false)
    }
    const onDonate = async () => {
        if (!isLoggedIn()) {
            Emitter.emit("login_required", {})
            return
        }
        showLoading(true)
        try {
            const { quantity, streamer_id, jwt, message, streamer, viewer, } = inputValues
            const data = {
                quantity: +quantity,
                receiver: +streamer_id
            }
            const result = await OnDonateToken(data, jwt || "")
            if (result?.status === 200) {
                showToast('info', result.msg)
                // * Socket
                const msgToast = `😘🤣 ${viewer} has donated ${quantity} tokens to ${streamer} 💥💥💥 ${message}`
                const msgChatbox = `💰 has donated ${quantity} tokens 💰`
                socket.emit("on_donate", { streamer, message: msgToast, isDonate: true, })
                socket.emit('sendMessage', { message: msgChatbox, userChat: viewer, roomName: streamer, colorRand: randColor(), createdAt: moment() });
                setTimeout(() => window.location.reload(), 1000)
            } else {
                showToast('error', result.msg)
            }
        } catch (e) { showToast(e) }
        showLoading(false)
    }
    useEffect(() => {
        callEffect()
    }, [])
    const { quantity, streamer_id, jwt, message, } = inputValues
    const disableDonate = !quantity || !streamer_id || !jwt || !message
    return (
        <React.Fragment>
            <div style={{ width: '80%', margin: 'auto', marginTop: 20, pointerEvents: 'auto', }}>
                <div style={{ display: 'flex', flexDirection: 'column', }}>
                    <div style={{ display: 'flex', }}>
                        <div style={{ width: '70%', height: 400, }}>
                            <div style={{ border: '1px solid black', borderRadius: 5, background: 'rgb(236, 240, 241)', padding: 20, marginBottom: 20, }}>
                                <h3>Donation</h3>
                                <div className="form-group">
                                    <label htmlFor="quantity">Token</label>
                                    <div id="quantity" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridGap: 10, justifyContent: 'center', marginBottom: 20, }}>
                                        {[10, 20, 40, 100, 200, 500].map((e, idx) => {
                                            return (
                                                <button key={idx} className="btn btn-outline-secondary" onClick={() => onChangeForm(e, 'quantity')}>{e}</button>
                                            )
                                        })}
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="other-token">Other token</label>
                                    <input type="number" className="form-control" id="other-token" value={inputValues?.quantity || ""} onChange={(e) => onChangeForm(e.target.value, 'quantity')} placeholder="Other..." />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="message">Message</label>
                                    <textarea className="form-control" id="message" onChange={(e) => onChangeForm(e.target.value, 'message')} style={{ height: 50, }} placeholder="Message..." />
                                </div>
                            </div>
                        </div>
                        <div style={{ width: '2%', height: 400, }} />
                        <div style={{ width: '28%', height: 400, background: 'rgb(236, 240, 241)', border: '1px solid black', borderRadius: 5, padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', }}>
                            {inputValues.viewer || ''} donated {inputValues.quantity || "{quantity}"}
                            <p style={{ textAlign: 'center', wordBreak: 'break-all', color: 'blueviolet', }}>{inputValues.message || "{message}"}</p>
                        </div>
                    </div>
                    <div style={{ background: 'rgb(236, 240, 241)', marginTop: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid black', borderRadius: 5, padding: 20, }}>
                        <h3>Donate <span style={{ color: 'lightcoral', }}>{inputValues?.quantity || "0"}</span> tokens to <span style={{ color: 'lightcoral', }}>{inputValues?.streamer || ""}</span></h3>
                        <button onClick={onDonate} className={`btn ${disableDonate ? "btn-outline-primary" : "btn-primary"}`} disabled={disableDonate}>Donate</button>
                    </div>
                </div>
            </div>
        </React.Fragment>
    )
}
export default Donation