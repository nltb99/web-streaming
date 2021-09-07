import { ROOM_TAGS, ROOMS_ONLINE, ROOM_ON_START, ROOM_ON_END, ROOM_INFO, ROOM_SNAP_THUMBNAIL, ROOM_SAVE_RECORD, } from '../utils/Urls'
import { GetUserInfo } from "./CredentialController";

const initialState = {
    roomTags: [],
    roomsOnline: [],
}
export const RoomAPI = {
    GetRoomTags: () => async (dispatch, getState) => {
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        };
        const request = await fetch(ROOM_TAGS, options)
        const roomTags = await request.json()
        dispatch({ type: 'GET_ROOM_TAGS', roomTags });
        return roomTags
    },
    GetRoomsOnline: (data) => async (dispatch, getState) => {
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        };
        const request = await fetch(ROOMS_ONLINE, options)
        const roomsOnline = await request.json()
        dispatch({ type: 'GET_ROOMS_ONLINE', roomsOnline });
        return roomsOnline
    },
};
export const OnRoomStart = async (roomData) => {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(roomData)
    };
    const request = await fetch(ROOM_ON_START, options)
    const response = await request.json()
    return response
}
export const OnRoomEnd = async (roomData) => {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(roomData)
    };
    const request = await fetch(ROOM_ON_END, options)
    const response = await request.json()
    return response
}
export const GetRoomInfo = async (data) => {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    };
    const request = await fetch(ROOM_INFO, options)
    const response = await request.json()
    return response
}
export const OnSnapThumbnail = async (data) => {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    };
    const request = await fetch(ROOM_SNAP_THUMBNAIL, options)
    const response = await request.json()
    return response
}
export const OnSaveRecordVideo = async (param) => {
    const { recordData, userInfo } = param;
    const formData = new FormData();
    formData.append('video', recordData, recordData.name);
    const options = {
        method: 'POST',
        headers: {
            title: param.title,
            'user_id': userInfo.id,
            'filename': `${userInfo.id}_${recordData.name}`
        },
        body: formData,
    };
    const request = await fetch(ROOM_SAVE_RECORD, options)
    const response = await request.json()
    return response
}
export const reducer = (state = initialState, action) => {
    switch (action.type) {
        case 'GET_ROOM_TAGS': {
            return {
                ...state,
                roomTags: action.roomTags,
            }
        }
        case 'GET_ROOMS_ONLINE': {
            return {
                ...state,
                roomsOnline: action.roomsOnline,
            }
        }
        default:
            return state;
    }
};