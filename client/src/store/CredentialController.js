import { USER_LOGIN, USER_REGISTER, USER_GETINFO, USER_GET_JWT, USER_UPDATE_PASSWORD, } from '../utils/Urls'
import { getToken } from '../utils/Helper'

const initialState = {
    userInfo: {},
}
export const reducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SAVE_USERINFO': {
            return {
                ...state,
                userInfo: action.userInfo,
            }
        }
        default:
            return state;
    }
};
export const OnUserLogin = async (data) => {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    };
    const request = await fetch(USER_LOGIN, options)
    const response = await request.json()
    return response
}
export const OnUserRegister = async (data) => {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    };
    const request = await fetch(USER_REGISTER, options)
    const response = await request.json()
    return response
}
export const OnSendMailReset = async (data) => {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    };
    const request = await fetch(USER_GET_JWT, options)
    const response = await request.json()
    return response
}
export const OnUpdatePassword = async (data, jwt) => {
    const options = {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + jwt,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    };
    const request = await fetch(USER_UPDATE_PASSWORD, options)
    const response = await request.json()
    return response
}
export const GetUserInfo = async () => {
    try {
        let userInfo = await localStorage.getItem("user_info")
        if (userInfo) {
            userInfo = await JSON.parse(userInfo)
            return userInfo || {}
        } else return {}
    } catch (e) {
        console.log(e)
        return {}
    }
}
export const FetchUserInfo = async () => {
    try {
        const token = getToken(true)
        if (token !== null) {
            const options = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": token,
                },
            };
            const request = await fetch(USER_GETINFO, options)
            const response = await request.json()
            const userInfo = Array.isArray(response?.data) ? {} : response?.data || {}
            localStorage.setItem('user_info', JSON.stringify(userInfo))
            return response?.data || {}
        } else {
            localStorage.clear()
            sessionStorage.clear()
            return {}
        }
    } catch (e) {
        console.log(e)
        return {}
    }
}
export const isLoggedIn = () => {
    return getToken() !== null
}

