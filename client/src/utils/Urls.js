// * HOST
// export const HOST = 'https://bavk-api.herokuapp.com'
// export const CONNECTION_PORT = 'https://bavk-api.herokuapp.com'
export const HOST = 'http://localhost:3002'
export const CONNECTION_PORT = 'http://localhost:3002'
// * Brand Name
export const BRAND = 'BAVK'
// * ASSETS
export const HOST_IMAGE = HOST + '/api/image'
export const HOST_VIDEO = HOST + '/api/video'
export const HOST_AVATAR = HOST + '/api/avatar/'
// * Room
export const ROOMS_ONLINE = HOST + "/api/stream/rooms"
export const ROOM_INFO = HOST + "/api/stream/room_info"
export const ROOM_TAGS = HOST + "/api/stream/tags"
export const ROOM_ON_START = HOST + "/api/stream/on_start"
export const ROOM_ON_END = HOST + "/api/stream/on_end"
export const ROOM_SNAP_THUMBNAIL = HOST + "/api/stream/snap"
export const ROOM_SAVE_RECORD = HOST + "/api/stream/save_record"
export const ROOM_SAVE_RECORD_SNAP = HOST + "/api/stream/save_record_snap"
export const ROOM_GET_VIDEOS = HOST + "/api/stream/videos"
export const ROOM_GET_ALL_VIDEOS = HOST + "/api/stream/videos_all"

export const ROOM_BLOCK_USER = HOST + "/api/stream/blocked_users"
export const ROOM_BLOCK_CHAT = HOST + "/api/stream/block_chat"

export const DELETE_VIDEO = HOST + "/api/stream/delete_video"
export const UPDATE_VIDEO = HOST + "/api/stream/update_video"
export const ROOM_LIKE = HOST + "/api/stream/like"
// * User
export const USER_SUBSCRIBE = HOST + "/api/user/subscribe"
export const USER_GETINFO = HOST + "/api/user/user_info"
export const USER_SAVE_AVATAR = HOST + "/api/user/save_avatar"
export const USER_GET_PROFILE = HOST + "/api/user/profile"
export const USER_UPDATE_PROFILE = HOST + "/api/user/update_profile"
export const USER_UPDATE_ROLE = HOST + "/api/user/update_role"
export const USER_DONATE_HISTORY = HOST + "/api/user/donate_history"
export const USER_TOKEN_HISTORY = HOST + "/api/user/token_history"
export const USER_GET_ALL = HOST + "/api/user/all_users"
// * Payment 
export const PAYMENT_PURCHASE = HOST + "/api/payment/purchase_token"
export const PAYMENT_OPTIONS = HOST + "/api/payment/options_purchase"
// * Credential
export const USER_LOGIN = HOST + "/api/credential/login"
export const USER_REGISTER = HOST + "/api/credential/register"
export const USER_UPDATE_PASSWORD = HOST + "/api/credential/update_password"
export const USER_GET_JWT = HOST + "/api/payment/get_jwt_reset"
export const PAYMENT_DONATE = HOST + "/api/payment/donate_token"
// * Analyze
export const ANALYZE_DATA = HOST + "/api/analysis/get_statistics"

export const GET_CURRENT_USER_PROFILE = (nickname) => '/profile/' + nickname
export const GET_CURRENT_USER_ANALYZE = (nickname) => HOST + '/analysis/' + nickname
