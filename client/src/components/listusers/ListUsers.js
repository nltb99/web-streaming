import React, { useState, useEffect, } from 'react'
import { getParamUrl, } from '../../utils/Helper'
import { isLoggedIn, } from '../../store/CredentialController'
import { HOST_AVATAR, } from '../../utils/Urls'
import DEFAULT_AVATAR from '../../assets/images/face_.png'
import { Link } from "react-router-dom"
import Page404 from '../controls/Page404'
import { showLoading, } from '../controls/Loading'
import { GetAllUsers, } from '../../store/UserController'

const ListUser = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [loggedIn, setLoggedIn] = useState(false)
    const [users, setUsers] = useState([])

    const callEffect = async () => {
        showLoading(true)
        setIsLoading(true)
        setLoggedIn(await isLoggedIn())
        const result = await GetAllUsers({ search: getParamUrl('q') ? decodeURI(getParamUrl('q')) : null })
        if (result.status === 200) {
            setUsers(result.data || [])
        }
        showLoading(false)
        setIsLoading(false)
    }
    useEffect(() => {
        callEffect()
    }, [])
    return (
        <React.Fragment>
            {!loggedIn && !isLoading ? (
                <Page404 text="Login Required" />
            ) : !isLoading && (
                <div style={{ width: '95%', marginLeft: 'auto', marginRight: 'auto', marginTop: 10, zIndex: 100, pointerEvents: 'auto', }}>
                    <h3 style={{ color: 'lightgreen', }}>Users ({users?.length || "0"})</h3>
                    {users.length > 0 ? (
                        <div style={{ display: 'grid', gridGap: 5, gridTemplateColumns: 'repeat(auto-fill, minmax(180px,auto))', }}>
                            {users.map((user, idx) => {
                                return (
                                    <Link to={`/profile/${user.nickname}`}>
                                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', }}>
                                            <img src={user.photo ? HOST_AVATAR + user.photo : DEFAULT_AVATAR} alt="" style={{ width: 180, height: 180, objectFit: 'cover', borderRadius: 10, }} />
                                            <p className="text_primary" style={{ textAlign: 'center', }}>{user.nickname}</p>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    ) : (
                        <Page404 text="No Users Found" />
                    )}
                </div>
            )}
        </React.Fragment>
    )
}
export default ListUser