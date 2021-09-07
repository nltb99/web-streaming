import React, { useState, useEffect, } from 'react'
import { Link } from "react-router-dom"
import { RoomAPI } from '../store/RoomController'
import { getParamUrl, } from '../utils/Helper'
import { HOST_AVATAR, HOST_IMAGE, } from '../utils/Urls'
import DEFAULT_THUMBNAIL from '../assets/img/3.png'
import DEFAULT_AVATAR from '../assets/images/face_.png'
import Page404 from './controls/Page404'
import { useDispatch, } from 'react-redux';
import { showToast } from './controls/Toast'
import { showLoading } from './controls/Loading'

const Home = ({ }) => {
    const [videos, setVideos] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const dispatch = useDispatch();
    const callEffect = async () => {
        showLoading(true)
        setIsLoading(true)
        try {
            const roomsOnline = await dispatch(RoomAPI.GetRoomsOnline({ search: getParamUrl('q') ? decodeURI(getParamUrl('q')) : null }))
            setVideos(roomsOnline?.data || [])
        } catch (e) {
            showToast('error', e)
        }
        showLoading(false)
        setIsLoading(false)
    }
    useEffect(() => {
        callEffect()
    }, [])
    return (
        <React.Fragment>
            {videos.length > 0 ? (
                <div className="list_video_container">
                    {videos.map((video, idx) => {
                        let tags = []
                        try {
                            tags = JSON.parse(video.tags || "[]") || []
                        } catch (e) { tags = [] }
                        return (
                            <Link to={`/user/${video.nickname}`} target="_blank" rel="noopener noreferrer" key={idx} className="list_video_item" style={{ pointerEvents: 'auto', }}>
                                <div className="list_video_status">LIVE</div>
                                <div className="list_video_viewers">{video.viewers || 0} viewers</div>
                                <div className="img-container"><img src={video?.thumbnail ? HOST_IMAGE + video?.thumbnail : DEFAULT_THUMBNAIL} alt="" />
                                </div>
                                <div className="list_video_description">
                                    <img src={video?.photo ? HOST_AVATAR + video?.photo : DEFAULT_AVATAR} alt="" style={{ width: 40, height: 40, borderRadius: '50%', marginRight: 10, }} />
                                    <div className="d-flex flex-column">
                                        <span className="text_primary" style={{ fontSize: 17, fontWeight: 'bold', }}>{video.title}</span>
                                        <span className="text_primary" style={{ fontSize: 14, fontStyle: 'italic', }}>{video.description}</span>
                                        <span className="text_primary" style={{ fontSize: 14, color: "lightgreen" }}>{video.nickname}</span>
                                        <div style={{ minHeight: 30, }}>
                                            {Array.isArray(tags) && tags.map((tag, idxTag) => (
                                                <span key={idxTag} className="list_video_tags text-white p-1 px-2 text-center text_primary" style={{ fontSize: 11 }}>{tag.label}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            ) : !isLoading && (
                <Page404 text={"No Rooms Online Found"} />
            )}
        </React.Fragment>
    )
}
export default Home