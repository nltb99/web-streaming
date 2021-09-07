import { USER_SUBSCRIBE, USER_SAVE_AVATAR, USER_GET_PROFILE, USER_UPDATE_PROFILE, USER_DONATE_HISTORY, USER_TOKEN_HISTORY, USER_UPDATE_ROLE, USER_GET_ALL, } from '../utils/Urls'

export const SubscribeChannel = async (data) => {
    try {
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        };
        const request = await fetch(USER_SUBSCRIBE, options)
        const response = await request.json()
        return response
    } catch (e) {
        return e
    }
}
export const OnSaveAvatar = async (data) => {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    };
    const request = await fetch(USER_SAVE_AVATAR, options)
    const response = await request.json()
    return response
}
export const GetProfileUser = async (nickname, host_id) => {
    try {
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'nickname': nickname,
                'host_id': host_id,
            },
        };
        const request = await fetch(USER_GET_PROFILE, options)
        const response = await request.json()
        return response?.data || {}
    } catch (e) {
        return {}
    }
}
export const OnUpdateAvatar = async (data) => {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    };
    const request = await fetch(USER_UPDATE_PROFILE, options)
    const response = await request.json()
    return response
}
export const OnUpdateRole = async (user_id) => {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id }),
    };
    const request = await fetch(USER_UPDATE_ROLE, options)
    const response = await request.json()
    return response
}
export const GetHistoryDonate = async (userId) => {
    try {
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'userid': userId
            },
        };
        const request = await fetch(USER_DONATE_HISTORY, options)
        const response = await request.json()
        return response?.data || []
    } catch (e) {
        return []
    }
}
export const GetHistoryToken = async (userId) => {
    try {
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'userid': userId
            },
        };
        const request = await fetch(USER_TOKEN_HISTORY, options)
        const response = await request.json()
        return response?.data || []
    } catch (e) {
        return []
    }
}
export const GetAllUsers = async (data) => {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    };
    const request = await fetch(USER_GET_ALL, options)
    const response = await request.json()
    return response
}