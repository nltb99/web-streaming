import React, { useEffect, useState } from "react";
import { showLoading } from '../controls/Loading'
import { HOST_VIDEO } from '../../utils/Urls'
import { getParamUrl, } from '../../utils/Helper'
import { GetUserInfo, } from '../../store/CredentialController'
import { BsReply } from "react-icons/bs"
import "./watch.css";

const VideoStorage = () => {
    const [idVideo, setIdVideo] = useState(-1)
    const [userInfo, setUserInfo] = useState({})

    const callEffect = async () => {
        showLoading(true)
        try {
            const info = await GetUserInfo()
            setUserInfo(info || {})
            setIdVideo(getParamUrl('id') || -1)
        } catch (e) { console.log(e) }
        showLoading(false)
    }
    useEffect(() => {
        callEffect()
    }, [])
    return (
        <div className="watch" style={{ pointerEvents: 'auto', }}>
            <div className="back">
                <BsReply />
                Home
            </div>
            {idVideo !== -1 && (
                <video className="video" autoPlay progress controls
                    src={`${HOST_VIDEO}?idVideo=${idVideo}&idUser=${userInfo.id}`}
                />)}
        </div>
    )
}
export default VideoStorage
