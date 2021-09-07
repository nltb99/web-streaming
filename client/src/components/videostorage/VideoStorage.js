import React, { useEffect, useState } from "react";
import { ROOM_GET_ALL_VIDEOS, HOST_IMAGE, HOST_AVATAR } from '../../utils/Urls'
import { Link } from "react-router-dom"
import { getParamUrl, } from '../../utils/Helper'
import { isLoggedIn, } from '../../store/CredentialController'
import { showLoading, } from '../controls/Loading'
import { GetUserInfo, } from '../../store/CredentialController'
import "./watch.css";
import DEFAULT_THUMBNAIL from '../../assets/img/3.png'
import DEFAULT_AVATAR from '../../assets/images/face_.png'
import Page404 from '../controls/Page404'
import moment from 'moment'

const VideoStorage = () => {
    const [videos, setVideos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loggedIn, setLoggedIn] = useState(false)
    const [userInfo, setUserInfo] = useState({})

    const callEffect = async () => {
        setIsLoading(true)
        showLoading(true)
        try {
            const info = await GetUserInfo()
            setUserInfo(info || {})
            setLoggedIn(await isLoggedIn())
            const request = await fetch(ROOM_GET_ALL_VIDEOS, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ search: getParamUrl('q') ? decodeURI(getParamUrl('q')) : null })
            })
            const result = await request.json()
            setVideos(result.data || [])
        } catch (e) { console.log(e) }
        setIsLoading(false)
        showLoading(false)
    }
    useEffect(() => {
        callEffect()
    }, [])
    return (
        <div style={{ padding: 20, width: '95%', margin: 'auto', marginTop: 5, }}>
            {!loggedIn && !isLoading ? (
                <Page404 text="Login Required" />
            ) : videos?.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,auto))', gridGap: 15, justifyContent: 'center', pointerEvents: 'auto', }}>
                    {videos.map((e, idx) => (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', borderRadius: 10, width: 340, }}>
                            <Link to={`/video/${userInfo.nickname}?id=${e.id}`}>
                                <img src={e.thumbnail ? HOST_IMAGE + e.thumbnail : DEFAULT_THUMBNAIL} alt="" style={{ width: 340, height: 210, borderRadius: 5, objectFit: 'cover', }} />
                            </Link>
                            <div style={{ display: 'flex', paddingLeft: 7, marginTop: 10, widht: '100%', }}>
                                <Link to={`/video/${userInfo.nickname}?id=${e.id}`} style={{ display: 'flex', width: '90%', }}>
                                    <img src={e.photo ? HOST_AVATAR + e.photo : DEFAULT_AVATAR} alt="" style={{ width: 35, height: 35, borderRadius: '50%', marginRight: 10, objectFit: 'cover', }} />
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', }}>
                                        <span className="text_primary" style={{ fontWeight: 'bold', fontSize: 17, wordBreak: 'break-all', lineHeight: '20px', }}>{e.title?.length > 30 ? e.title?.slice(0, 20) + "..." : e.title}</span>
                                        <span className="text_primary" style={{ fontSize: 14, }}>{e.nickname}</span>
                                        <span className="text_primary" style={{ fontSize: 12, fontStyle: 'itatlic', }}>{moment(e.created_at).startOf('min').fromNow()}</span>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <Page404 text={"No Videos Found"} />
            )}
        </div>
    )
}
export default VideoStorage
