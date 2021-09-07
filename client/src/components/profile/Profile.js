import React, { useState, useEffect, useRef, } from 'react'
import { HOST_AVATAR, HOST_IMAGE } from '../../utils/Urls'
import { OnSaveAvatar, GetProfileUser, OnUpdateAvatar, GetHistoryDonate, GetHistoryToken, SubscribeChannel, } from '../../store/UserController'
import { showLoading } from '../controls/Loading'
import { showToast } from '../controls/Toast'
import { ROOM_GET_VIDEOS, DELETE_VIDEO } from '../../utils/Urls'
import { GetUserInfo, } from '../../store/CredentialController'
import Page404 from '../controls/Page404'
import "./profile.css";
import { Link } from "react-router-dom"
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import DEFAULT_THUMBNAIL from '../../assets/img/3.png'
import DEFAULT_AVATAR from '../../assets/images/face_.png'
import { FaCog, FaRegGem, } from "react-icons/fa";
import { BsTrashFill, } from "react-icons/bs";
import Update_Video from './update_video'
import { useHistory } from 'react-router-dom'
import ToolkitProvider, { CSVExport } from 'react-bootstrap-table2-toolkit';
import moment from 'moment'

const { ExportCSVButton } = CSVExport;
const UserLogin = {}
let initPathName = ''

const Profile = ({ match }) => {
    const [avatarUrl, setAvatarUrl] = useState("")
    const [loading, setLoading] = useState(true)
    const [initNickname, setInitNickname] = useState("")
    const [profileInfo, setProfileInfo] = useState({})
    const [videos, setVideos] = useState([]);
    const [donateHistory, setDonateHistory] = useState([])
    const [tokenHistory, setTokenHistory] = useState([])
    const [_, setMutate] = useState(false)
    const history = useHistory()
    const avatarRef = useRef(null)

    const onImageChange = (event) => {
        showLoading(true)
        try {
            if (event.target.files && event.target.files[0]) {
                const reader = new FileReader();
                reader.readAsDataURL(event.target.files[0]);
                reader.onload = async function () {
                    const data = {
                        fileName: `${profileInfo.id}.png`,
                        imageBase64: reader.result,
                        user_id: profileInfo.id,
                    }
                    const result = await OnSaveAvatar(data)
                    if (result.status === 200) {
                        showToast('info', result.msg)
                        setAvatarUrl(URL.createObjectURL(event.target.files[0]))
                    } else {
                        showToast('error', result.msg)
                    }
                };
            }
        } catch (e) { console.log(e) }
        showLoading(false)
    }
    const onSaveProfile = async () => {
        showLoading(true)
        const result = await OnUpdateAvatar(profileInfo)
        if (result.status === 200) {
            showToast('info', result.msg)
            if (initNickname !== profileInfo.nickname) {
                setTimeout(() => window.location.href = `/profile/${profileInfo.nickname}`, 1000)
            }
        } else {
            showToast('error', result.msg)
        }
        showLoading(false)
    }
    const updateTitleVideo = (index, title) => {
        videos[index].title = title
        setMutate(e => !e)
    }
    const onChangeForm = (value, stateName) => {
        if (stateName === "nickname") {
            value = value?.replace(/\s/g, '_')?.trim()
        }
        setProfileInfo({ ...profileInfo, [stateName]: value })
    }
    const getAllVideo = async (id) => {
        const ok = await fetch(ROOM_GET_VIDEOS, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_id: id })
        })
        const result = await ok.json()
        setVideos(result.data || [])
    }
    const deleteVideos = async (id, e) => {
        showLoading(true)
        try {
            const result = await fetch(DELETE_VIDEO, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ video_id: id })
            })
            if (result.status === 200) {
                showToast('info', "Deleted Successfully")
                getAllVideo(e.streamer_id);
            } else {
                showToast('info', "Delete Failed")
            }
        } catch (e) { console.log(e) }
        showLoading(false)
    }
    const onSubcribe = async () => {
        showLoading(true)
        try {
            const data = {
                host_id: UserLogin.id,
                follower_id: profileInfo.id,
                isSubscribed: profileInfo.isSubscribed,
            }
            const result = await SubscribeChannel(data)
            if (result.status === 200) {
                setProfileInfo({ ...profileInfo, isSubscribed: result?.data?.isSubscribed })
                showToast('info', result.msg)
            } else {
                showToast('error', result.msg)
            }
        } catch (e) { console.log(e) }
        showLoading(false)
    }
    const MyExportCSV = (props) => {
        const handleClick = () => {
            props.onExport();
        };
        return (
            <div>
                <button className="btn btn-success" onClick={handleClick}>Export to CSV</button>
            </div>
        );
    };
    const onSwitchTab = (hashId) => {
        try {
            switch (hashId) {
                case "#profile":
                    document.querySelector('#nav-profile-tab').click()
                    break;
                case "#channel":
                    document.querySelector('#nav-video-tab').click()
                    break;
                case "#history_donate":
                    document.querySelector('#nav-history-tab').click()
                    break;
                case "#history_buy_tokens":
                    document.querySelector('#nav-tokens-tab').click()
                    break;
            }
        } catch (e) { console.log(e) }
    }
    const callEffect = async () => {
        try {
            showLoading(true)
            setLoading(true)
            const logIn = await GetUserInfo()
            if (logIn?.id === undefined) {
                setLoading(false)
                return
            }
            const info = await GetProfileUser(match?.params?.nickname, logIn.id)
            UserLogin.id = logIn?.id
            setProfileInfo(info)
            setInitNickname(info?.nickname || "")
            setDonateHistory(await GetHistoryDonate(info.id) || [])
            setTokenHistory(await GetHistoryToken(info.id) || [])
            setAvatarUrl(info?.photo ? HOST_AVATAR + info?.photo : DEFAULT_AVATAR)
            getAllVideo(info.id);
            showLoading(false)
            initPathName = window.location.pathname
            setLoading(false)
            const hashId = window.location.hash
            onSwitchTab(hashId)
        } catch (e) { console.log(e) }
    }
    useEffect(() => {
        callEffect()
        return history.listen((location) => {
            if (location.hash === window.location.hash && (location.hash !== "" || window.location.hash !== "")) {
                if (window.location.pathname !== initPathName) {
                    window.location.reload()
                } else {
                    onSwitchTab(location?.hash)
                }
            }
        })
    }, [history])
    return (
        <React.Fragment>
            {UserLogin.id === undefined && !loading ? (
                <Page404 text={"Login Required"} />
            ) : (profileInfo?.id !== undefined && !loading) ? (
                <div className="row" style={{ marginTop: 20, pointerEvents: 'auto', }}>
                    <div className="col-12 ">
                        <nav>
                            <div className="nav nav-tabs nav-fill" id="nav-tab" role="tablist">
                                <a onClick={() => window.location.hash = "#profile"} className="text_primary nav-item nav-link" id="nav-profile-tab" data-toggle="tab" href="#nav-home" role="tab" aria-controls="nav-home" aria-selected="true">Profile</a>
                                <a onClick={() => window.location.hash = "#channel"} className="text_primary nav-item nav-link" id="nav-video-tab" data-toggle="tab" href="#nav-profile" role="tab" aria-controls="nav-profile" aria-selected="false">Videos</a>
                                {profileInfo.id === UserLogin.id && (
                                    <a onClick={() => window.location.hash = "#history_donate"} className="text_primary nav-item nav-link" id="nav-history-tab" data-toggle="tab" href="#nav-contact" role="tab" aria-controls="nav-contact" aria-selected="false">Donate History</a>
                                )}
                                {profileInfo.id === UserLogin.id && (
                                    <a onClick={() => window.location.hash = "#history_buy_tokens"} className="text_primary nav-item nav-link" id="nav-tokens-tab" data-toggle="tab" href="#nav-tokens" role="tab" aria-controls="nav-tokens" aria-selected="false">Tokens Buy History</a>
                                )}
                            </div>
                        </nav>
                        <div className="tab-content py-3 px-3 px-sm-0" id="nav-tabContent">
                            <div className="tab-pane fade show active" id="nav-home" role="tabpanel" aria-labelledby="nav-profile-tab" style={{ marginTop: 20, }}>
                                <div style={{ display: 'flex', justifyContent: "center", }}>
                                    <div style={left_info}>
                                        <div style={left_info_container}>
                                            <div style={formGroup}>
                                                <label>Username:</label>
                                                <input value={profileInfo?.username || ""} style={textinput} disabled />
                                            </div>
                                            <div style={formGroup}>
                                                <label>Email address:</label>
                                                <input value={profileInfo?.email || ""} style={textinput} disabled />
                                            </div>
                                            <div style={formGroup}>
                                                <label>Full name:</label>
                                                <input disabled={(profileInfo.id !== UserLogin.id) ? true : false} value={profileInfo?.fullname || ""} onChange={(e) => onChangeForm(e.target.value, 'fullname')} style={textinput} />
                                            </div>
                                            <div style={formGroup} >
                                                <label>Nickname:</label>
                                                <input disabled={(profileInfo.id !== UserLogin.id) ? true : false} value={profileInfo?.nickname || ""} onChange={(e) => onChangeForm(e.target.value, 'nickname')} style={textinput} />
                                            </div>
                                        </div>
                                        <textarea hidden={(profileInfo.id !== UserLogin.id) ? true : false} value={profileInfo?.bio || ""} onChange={(e) => onChangeForm(e.target.value, 'bio')} placeholder="bio" style={{ width: '100%', padding: 10, height: 100, marginTop: 15, }} />
                                        <button hidden={(profileInfo.id !== UserLogin.id) ? true : false} onClick={onSaveProfile} className="btn btn-primary" style={{ width: '100%', marginTop: 15, }}>Save</button>
                                        {profileInfo.id !== UserLogin.id && (
                                            <button onClick={onSubcribe} className="btn btn-primary" style={{ width: '100%', marginTop: 25, }}>
                                                <FaRegGem />  {profileInfo.isSubscribed > 0 ? "Unfollow" : "Follow"}
                                            </button>
                                        )}
                                    </div>
                                    <div style={right_info}>
                                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', }}>
                                            <div style={{ position: 'relative', width: 150, height: 150, }}>
                                                <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: "50%", objectFit: 'cover', }} />
                                                <button hidden={(profileInfo.id !== UserLogin.id) ? true : false} onClick={() => avatarRef?.current?.click()} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, }} />
                                                <input ref={avatarRef} type="file" onChange={onImageChange} style={{ display: 'none', }} />
                                            </div>
                                        </div>
                                        <div style={{ marginTop: 10, display: "flex", justifyContent: 'space-around', alignItems: 'center', }}>
                                            <div style={overview}>
                                                <p style={overview_title}>Followers</p>
                                                <p style={overview_value}>{profileInfo?.followers || "0"}</p>
                                            </div>
                                            <div style={overview}>
                                                <p style={overview_title}>Videos</p>
                                                <p style={overview_value}>{profileInfo?.videos || "0"}</p>
                                            </div>
                                            {profileInfo.id === UserLogin.id && (
                                                <div style={overview}>
                                                    <p style={overview_title}>Token</p>
                                                    <p style={overview_value}>{profileInfo?.token || "0"}</p>
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                                            <p style={{ wordBreak: 'break-all', }}>{profileInfo?.bio}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="tab-pane fade" id="nav-profile" role="tabpanel" aria-labelledby="nav-video-tab">
                                <div style={{ padding: 20, width: '95%', margin: 'auto', marginTop: 5, }}>
                                    {videos?.length > 0 ? (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,auto))', gridGap: 15, justifyContent: 'center', }}>
                                            {videos.map((e, idx) => (
                                                <div key={idx} style={{ display: 'flex', flexDirection: 'column', borderRadius: 10, width: 340, }}>
                                                    <Link to={`/video/${profileInfo.nickname}?id=${e.id}`}>
                                                        <img src={e.thumbnail ? HOST_IMAGE + e.thumbnail : DEFAULT_THUMBNAIL} alt="" style={{ width: 340, height: 210, borderRadius: 5, objectFit: 'cover', }} />
                                                    </Link>
                                                    <div style={{ display: 'flex', paddingLeft: 7, marginTop: 10, widht: '100%', }}>
                                                        <Link to={`/video/${profileInfo.nickname}?id=${e.id}`} style={{ display: 'flex', width: '90%', }}>
                                                            <img src={e.photo ? HOST_AVATAR + e.photo : DEFAULT_AVATAR} alt="" style={{ width: 35, height: 35, borderRadius: '50%', marginRight: 10, objectFit: 'cover', }} />
                                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', }}>
                                                                <span className="text_primary" style={{ fontWeight: 'bold', fontSize: 17, wordBreak: 'break-all', lineHeight: '20px', }}>{e.title?.length > 30 ? e.title?.slice(0, 20) + "..." : e.title}</span>
                                                                <span className="text_primary" style={{ fontSize: 14, }}>{e.nickname}</span>
                                                                <span className="text_primary" style={{ fontSize: 12, fontStyle: 'itatlic', }}>{moment(e.created_at).startOf('min').fromNow()}</span>
                                                            </div>
                                                        </Link>
                                                        {profileInfo.id === e.streamer_id && (
                                                            <div className="dropdown">
                                                                <div data-toggle="dropdown" style={{ background: 'transparent', outline: 'none', border: 'none', color: 'lightblue', cursor: 'pointer', }}>
                                                                    <FaCog className="text_primary" />
                                                                </div>
                                                                <div className="dropdown-menu" style={{ background: 'ivory', }}>
                                                                    <Update_Video videos={e} index={idx} updateTitleVideo={updateTitleVideo} />
                                                                    <div onClick={() => deleteVideos(e.id, e)} className="dropdown-item" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', }}>
                                                                        <BsTrashFill style={{ marginRight: 5, }} /> Remove
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <Page404 text={"No Videos Found"} />
                                    )}
                                </div>
                            </div>
                            <div className="tab-pane fade" id="nav-contact" role="tabpanel" aria-labelledby="nav-history-tab" style={{ marginTop: 20, }}>
                                {donateHistory?.length > 0 ? (
                                    <div className="col-10 m-auto" style={{ background: 'rgb(236, 240, 241)', borderRadius: 10, padding: 15, }}>
                                        <ToolkitProvider
                                            keyField="donate"
                                            data={donateHistory}
                                            columns={donateHistoryTableColumns}
                                            exportCSV>
                                            {props => (
                                                <div>
                                                    <MyExportCSV {...props.csvProps} />
                                                    <hr />
                                                    <BootstrapTable keyField='id' data={donateHistory} columns={donateHistoryTableColumns}
                                                        pagination={paginationFactory(donateHistoryOptions)} hover />
                                                    <div style={{ display: 'none', }}><BootstrapTable {...props.baseProps} /></div>
                                                </div>
                                            )}
                                        </ToolkitProvider>
                                    </div>
                                ) : (
                                    <Page404 text={"No data history"} />
                                )}
                            </div>
                            <div className="tab-pane fade" id="nav-tokens" role="tabpanel" aria-labelledby="nav-tokens-tab" style={{ marginTop: 20, }}>
                                {tokenHistory?.length > 0 ? (
                                    <div className="col-10 m-auto" style={{ background: 'rgb(236, 240, 241)', borderRadius: 10, padding: 15, }}>
                                        <ToolkitProvider
                                            keyField="token"
                                            data={tokenHistory}
                                            columns={tokenHistoryTableColumns}
                                            exportCSV>
                                            {props => (
                                                <div>
                                                    <MyExportCSV {...props.csvProps} />
                                                    <hr />
                                                    <BootstrapTable keyField='id' data={tokenHistory} columns={tokenHistoryTableColumns}
                                                        pagination={paginationFactory(donateHistoryOptions)} hover />
                                                    <div style={{ display: 'none', }}><BootstrapTable {...props.baseProps} /></div>
                                                </div>
                                            )}
                                        </ToolkitProvider>
                                    </div>
                                ) : (
                                    <Page404 text={"No data history"} />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : !loading && (
                <Page404 text={"No User Found"} />
            )}
        </React.Fragment>
    )
}
export default Profile

const left_info = {
    borderRadius: 10,
    boxShadow: "1px 1px 20px #aaaaaa",
    background: "#ecf0f1",
    width: '45%',
    padding: 20,
    marginRight: 20,
}
const right_info = {
    borderRadius: 10,
    boxShadow: "1px 1px 20px #aaaaaa",
    padding: 20,
    background: "#ecf0f1",
    width: '35%',
}
const left_info_container = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(48%,auto))',
    gridGap: 10,
    alignItems: 'center',
    justifyContent: 'center',
}
const formGroup = {
    display: 'flex',
    flexDirection: 'column',
    fontWeight: "bold",
    width: '100%',
}
const textinput = {
    borderRadius: 5,
    padding: 5,
    border: "1px solid #bdc3c7",
}
const overview = { width: '33%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', lineHeight: 1, }
const overview_title = { fontSize: 16, fontWeight: 'bold', }
const overview_value = { fontSize: 15, }

const donateHistoryTableColumns = [{
    dataField: 'STT',
    text: 'STT'
}, {
    dataField: 'sender',
    text: 'Sender'
}, {
    dataField: 'receiver',
    text: 'Receiver'
}, {
    dataField: 'token',
    text: 'Tokens'
},
{
    dataField: 'created_at',
    text: 'Date'
},];
const tokenHistoryTableColumns = [{
    dataField: 'STT',
    text: 'STT'
}, {
    dataField: 'nickname',
    text: 'User'
}, {
    dataField: 'token',
    text: 'Tokens'
}, {
    dataField: 'amount',
    text: 'Amount'
},
{
    dataField: 'created_at',
    text: 'Date'
},];
const donateHistoryOptions = {
    paginationSize: 4,
    pageStartIndex: 1,
    alwaysShowAllBtns: true,
    withFirstAndLast: true,
    hideSizePerPage: true,
    hidePageListOnlyOnePage: false,
    firstPageText: 'First',
    lastPageText: 'Last',
    showTotal: true,
    disablePageTitle: true,
    sizePerPageList: [{ text: '10', value: 10, },
    { text: '10', value: 10 },]
}