import React, { useEffect, useState, } from 'react'
import { FaSearch, FaUser, FaVideo, FaPhotoVideo, } from 'react-icons/fa';
import { Link } from "react-router-dom"
import { showToast } from '../controls/Toast'
import { showLoading } from '../controls/Loading'
import { getParamUrl } from '../../utils/Helper'
import { Modal } from 'react-responsive-modal';
import Emitter from './EventEmitter'
import { showConfirmDialog } from '../controls/Confirm'
import { OnUserLogin, OnUserRegister, OnSendMailReset, FetchUserInfo, isLoggedIn, } from '../../store/CredentialController'
import { OnUpdateRole, } from '../../store/UserController'

const Header = ({ }) => {
    const [visibleModal, setVisibleModal] = useState(false);
    const [dataModal, setDataModal] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [iconSearch, setIconSearch] = useState("");
    const [userInfo, setUserInfo] = useState({})
    const [isLogged, setIsLogged] = useState(false);
    const [inputValues, setInputValues] = useState({
        username: '',
        password: '',
        nickname: '',
        email: '',
        search: getParamUrl("q") || ""
    })
    const onDisplayPurchase = () => {
        window.open('/purchase_options', '', 'scrollbars=yes,width=650,height=600')
    }
    const onOpenLoginModal = (type) => {
        onChangeModalType(type)
        setVisibleModal(true)
    }
    const onChangeModalType = (type) => {
        setDataModal({ type })
    }
    const onLogin = async (e) => {
        e.preventDefault()
        const { username, password } = inputValues
        if (!username || !password) {
            showToast("warn", 'Username or password should not be null')
            return
        }
        const result = await OnUserLogin({ username, password })
        if (result.status === 200) {
            const { jwt, user_info } = result?.data || {}
            showToast("info", result.msg)
            setVisibleModal(false)
            setUserInfo(user_info)
            localStorage.setItem('user_info', JSON.stringify(user_info))
            localStorage.setItem('jwt', JSON.stringify(jwt))
            setTimeout(() => window.location.href = "/", 1000)
        } else {
            showToast("error", result.msg)
        }
    }
    const onLogout = () => {
        localStorage.clear()
        sessionStorage.clear()
        showToast("info", "Logout")
        setTimeout(() => window.location.reload(), 1000)
    }
    const onRegister = async () => {
        const { username, password, nickname, email, } = inputValues
        if (!username || !password || !nickname || !email) {
            showToast("warn", 'Info register should not be null')
            return
        }
        if (!(/^\S+@\S+\.\S+$/g).test(email)) {
            showToast("warn", 'Email not in correct format')
            return
        }
        const result = await OnUserRegister({ username, password, nickname, email })
        if (result.status === 200) {
            showToast("info", result.msg)
            onChangeModalType("LOGIN")
        } else {
            showToast("error", result.msg)
        }
    }
    const onSearch = () => {
        const { search } = inputValues
        switch (iconSearch) {
            case "tags":
                window.location.href = `/?q=${encodeURI(search)}`
                break;
            case "members":
                window.location.href = `/members?q=${encodeURI(search)}`
                break;
            case "videos":
                window.location.href = `/videos?q=${encodeURI(search)}`
                break;
        }
    }
    const onUpdateRoleStatus = async () => {
        const result = await OnUpdateRole(userInfo.id)
        if (result.status === 200) {
            showToast('info', 'Update successfully!')
            setTimeout(() => window.location.reload(), 1000)
        }
    }
    const onResetPassword = async (e) => {
        showLoading(true)
        try {
            e.preventDefault()
            const { email } = inputValues
            if (!(/^\S+@\S+\.\S+$/g).test(email)) {
                showToast("warn", 'Email not in correct format')
                showLoading(false)
                return
            }
            const result = await OnSendMailReset({ email, host_origin: window.location.origin })
            if (result.status === 200) {
                showToast('info', `We have sent an email with a link to reset your password. Please check your inbox ${email}.`)
            } else {
                showToast('error', `Request reset password has been failed`)
            }
        } catch (e) { console.log(e) }
        showLoading(false)
    }
    const onChangeForm = (value, stateName) => {
        if (stateName === "nickname" || stateName === "username") {
            value = value?.replace(/\s/g, '_')?.trim()
        }
        setInputValues({ ...inputValues, [stateName]: value })
    }
    const callEffect = async () => {
        showLoading(true)
        setIsLoading(true)
        try {
            // * UserInfo
            if (await isLoggedIn()) {
                setIsLogged(true)
                const userInfo = await FetchUserInfo()
                setUserInfo(userInfo || {})
            }
            // * Search
            const pathName = window.location.pathname
            if (pathName === "/videos") {
                setIconSearch("videos")
            } else if (pathName === "/members") {
                setIconSearch("members")
            } else {
                setIconSearch("tags")
            }
        } catch (e) { console.log(e) }
        showLoading(false)
        setIsLoading(false)
    }
    const listenLoginRequest = () => {
        Emitter.on('login_required', async () => {
            onOpenLoginModal("LOGIN")
        })
    }
    useEffect(() => {
        callEffect()
        listenLoginRequest()
    }, [])
    return (
        <React.Fragment>
            {!isLoading && (
                <div style={{ padding: 10, display: 'flex', alignItems: '100%', justifyContent: 'space-around', zIndex: 2000, pointerEvents: 'none', }}>
                    <Link to="/" style={{ pointerEvents: 'auto', }}>
                        <div style={{ width: '10vw', display: 'flex', alignItems: 'center', justifyContent: 'center', }}>
                            <span className="brand_styling text_primary" style={{ fontSize: 30, }}>BAVK</span>
                        </div>
                    </Link>
                    <div style={{ width: '80vw', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'auto', }}>
                        <input className="text_primary" placeholder="Search..." value={inputValues.search || ""} onChange={(e) => onChangeForm(e.target.value, 'search')} onKeyUp={(e) => e.keyCode === 13 && onSearch()}
                            style={{ background: 'rgb(18,18,18)', borderTopLeftRadius: 5, borderBottomLeftRadius: 5, outline: 'none', border: '1px solid rgb(48,48,48)', padding: '2px 10px', height: 40, width: '40vw', }} />
                        <div className="dropdown">
                            <button data-toggle="dropdown" style={{ background: 'rgb(48,48,48)', outline: 'none', border: 'none', borderRight: '0.5px solid rgb(80,80,80)', height: 40, width: 45, color: 'lightblue', }}>
                                {iconSearch === "members" ? (
                                    <FaUser />
                                ) : iconSearch === "videos" ? (
                                    <FaPhotoVideo />
                                ) : iconSearch === "tags" && (
                                    <FaVideo />
                                )}
                            </button>
                            <div className="dropdown-menu" style={{ background: 'ivory', }}>
                                <div onClick={() => setIconSearch("tags")} className="dropdown-item" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', background: iconSearch === "tags" ? "lightsteelblue" : "" }}>
                                    <FaVideo style={{ marginRight: 7, }} />Streaming Rooms
                                </div>
                                <div onClick={() => setIconSearch("videos")} className="dropdown-item" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', background: iconSearch === "videos" ? "lightsteelblue" : "" }}>
                                    <FaPhotoVideo style={{ marginRight: 7, }} />Videos
                                </div>
                                <div onClick={() => setIconSearch("members")} className="dropdown-item" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', background: iconSearch === "members" ? "lightsteelblue" : "" }}>
                                    <FaUser style={{ marginRight: 7, }} />Members
                                </div>
                            </div>
                        </div>
                        <button onClick={onSearch} style={{ background: 'rgb(48,48,48)', outline: 'none', border: 'none', height: 40, width: 45, borderTopRightRadius: 5, borderBottomRightRadius: 5, color: 'lightblue', }}>
                            <FaSearch />
                        </button>
                    </div>
                    <div style={{ width: '10vw', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'auto', }}>
                        {isLogged ? (
                            <div className="dropdown menu_user">
                                <button className="btn btn-outline-primary dropdown-toggle" data-toggle="dropdown" style={{ background: 'rgb(18,18,18)' }}>
                                    {userInfo.nickname}
                                </button>
                                <div className="dropdown-menu" style={{ background: 'ivory', }}>
                                    <div className="dropdown-item disabled">Tokens {userInfo.token || "0"}</div>
                                    <div className="dropdown-divider"></div>
                                    <h5 className="dropdown-header">Managements</h5>
                                    <Link to={`/profile/${userInfo.nickname}#profile`}>
                                        <div className="dropdown-item">Profile</div>
                                    </Link>
                                    <Link to={`/profile/${userInfo.nickname}#channel`}>
                                        <div className="dropdown-item">Channel</div>
                                    </Link>
                                    <Link to={`/profile/${userInfo.nickname}#history_donate`}>
                                        <div className="dropdown-item">History Donate</div>
                                    </Link>
                                    <Link to={`/profile/${userInfo.nickname}#history_buy_tokens`}>
                                        <div className="dropdown-item">History Buy Tokens</div>
                                    </Link>
                                    <Link to={`/analysis/${userInfo.nickname}`}>
                                        <div className="dropdown-item">Statistics</div>
                                    </Link>
                                    <h5 className="dropdown-header">Feature</h5>
                                    <Link to="/members">
                                        <div className="dropdown-item">List Members</div>
                                    </Link>
                                    <Link to="/videos">
                                        <a className="dropdown-item">List Videos</a>
                                    </Link>
                                    {userInfo.role_user === "STREAMER" && (
                                        <Link to="/streamer">
                                            <div className="dropdown-item">Go Live</div>
                                        </Link>
                                    )}
                                    {userInfo.role_user === "VIEWER" && (
                                        <div onClick={() => showConfirmDialog("Confirm", "Enable Streamer Mode?", onUpdateRoleStatus)} className="dropdown-item href_style_text">Enable Live</div>
                                    )}
                                    <div onClick={onDisplayPurchase} className="dropdown-item href_style_text">Buy Tokens</div>
                                    <div className="dropdown-divider"></div>
                                    <div onClick={onLogout} className="dropdown-item href_style_text">Logout</div>
                                </div>
                            </div>
                        ) : (
                            <button onClick={() => onOpenLoginModal("LOGIN")} className="btn btn-outline-primary" style={{ background: 'rgb(18,18,18)' }}>
                                Login
                            </button>
                        )}
                    </div>
                </div>
            )}
            <Modal open={visibleModal} onClose={() => setVisibleModal(false)} center>
                <div style={{ padding: "auto", width: 400, minHeight: 400, display: "flex", justifyContent: "center", alignItems: "center", borderRadius: "5px", }}>
                    {dataModal.type === "LOGIN" ? (
                        <form onSubmit={onLogin} style={{ display: "flex", flexDirection: "column", width: "80%" }} >
                            <h2 style={{ textAlign: "center", fontWeight: 'bold', }}>Login</h2>
                            <div className="form-group ">
                                <label style={{ fontWeight: "bold" }}>Username</label>
                                <input type="text" className="form-control" value={inputValues.username} onChange={(e) => onChangeForm(e.target.value, 'username')} placeholder="Username..." required />
                            </div>
                            <div className="form-group ">
                                <label style={{ fontWeight: "bold" }}>Password</label>
                                <input type="password" className="form-control" value={inputValues.password} onChange={(e) => onChangeForm(e.target.value, "password")} placeholder="Password..." required />
                            </div>
                            <p onClick={() => onChangeModalType("RESET")} className="href_style_text" style={{ color: "rgb(21,127,251)" }}>Forgot password?</p>
                            <p onClick={() => onChangeModalType("REGISTER")} className="href_style_text" style={{ color: "rgb(21,127,251)" }}>
                                Create account?
                            </p>
                            <button type="submit" style={{ fontSize: "20px", background: "rgb(21,127,251)", color: "whitesmoke", borderRadius: "4px", }}>
                                Login
                            </button>
                        </form>
                    ) : dataModal.type === "REGISTER" ? (
                        <div style={{ display: "flex", flexDirection: "column", width: "80%" }} >
                            <h2 style={{ textAlign: "center", fontWeight: 'bold', }}>Register</h2>
                            <div className="form-group ">
                                <label style={{ fontWeight: "bold" }}>Nickname</label>
                                <input type="text" className="form-control" value={inputValues.nickname} onChange={(e) => onChangeForm(e.target.value, "nickname")} placeholder="Nickname..." />
                            </div>
                            <div className="form-group ">
                                <label style={{ fontWeight: "bold" }}>Email</label>
                                <input type="email" className="form-control" value={inputValues.email} onChange={(e) => onChangeForm(e.target.value, "email")} placeholder="Email..." />
                            </div>
                            <div className="form-group ">
                                <label style={{ fontWeight: "bold" }}>Username</label>
                                <input type="text" className="form-control" value={inputValues.username} onChange={(e) => onChangeForm(e.target.value, "username")} placeholder="Username..." />
                            </div>
                            <div className="form-group ">
                                <label style={{ fontWeight: "bold" }}>Password</label>
                                <input type="password" className="form-control" value={inputValues.password} onChange={(e) => onChangeForm(e.target.value, "password")} placeholder="Password..." />
                            </div>
                            <p onClick={() => onChangeModalType("LOGIN")} className="href_style_text" style={{ color: "rgb(21,127,251)" }} >
                                Already have an account?
                            </p>
                            <button onClick={onRegister} type="submit" style={{ fontSize: "20px", background: "rgb(21,127,251)", color: "whitesmoke", borderRadius: "4px", }}>
                                Register
                            </button>
                        </div>
                    ) : dataModal.type === "RESET" && (
                        <form onSubmit={onResetPassword} style={{ display: "flex", flexDirection: "column", width: "80%" }} >
                            <h2 style={{ textAlign: "center", fontWeight: 'bold', }}>Reset Password</h2>
                            <div className="form-group ">
                                <label style={{ fontWeight: "bold" }}>Email</label>
                                <input type="text" className="form-control" value={inputValues.email} onChange={(e) => onChangeForm(e.target.value, 'email')} placeholder="Email..." required />
                            </div>
                            <p onClick={() => onChangeModalType("LOGIN")} className="href_style_text" style={{ color: "rgb(21,127,251)" }} >
                                Back to login?
                            </p>
                            <button type="submit" style={{ fontSize: "20px", background: "rgb(21,127,251)", color: "whitesmoke", borderRadius: "4px", }}>
                                Reset
                            </button>
                        </form>
                    )}
                </div>
            </Modal>
        </React.Fragment>
    )
}
export default Header