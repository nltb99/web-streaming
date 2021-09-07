import socket from 'socket.io'
import { executeQuery} from '../utilities/connection'

const isUserBlocked = async (nickname) => {
    try {
        const sql = `
            SELECT blocked_user_id FROM room_block_chat t1 
            INNER JOIN users t2 ON t1. blocked_user_id = t2.id 
            WHERE t2.nickname='${nickname}'
            AND t1.room_id=(SELECT id FROM rooms ORDER BY id DESC LIMIT 1)`
        const res = await executeQuery(sql)
        return res?.[0]?.blocked_user_id || 0
    } catch (err) {
        return 0
    }
}

const updateRoomViewer = (streamerInfo, isConnect) => {
    const sql = `
        UPDATE rooms T2
        INNER JOIN (SELECT id FROM rooms WHERE streamer_id = ${streamerInfo.streamer_id} ORDER BY id DESC LIMIT 1) T1 ON T1.id = T2.id
        SET T2.viewers = T2.viewers ${isConnect ? ' + 1' : ' - 1'}`
    executeQuery(sql).catch(err => console.log('updateRoomViewer : ', err))
}

export const initSocket = (server) => {
    try {
        const io = socket(server);
        io.on("connection", (socket) => {
            // console.log("Socket connection!")
            // * Stream
            socket.on('open_room', function (roomInfo) {
                const { nickname, } = roomInfo
                socket.join(nickname)
            })
            socket.on('user_connect_room', (userInfo) => {
                const { roomInfo } = userInfo
                socket.join(roomInfo.nickname)
                updateRoomViewer(roomInfo, true);
                const currentViewers = socket.adapter.rooms?.[roomInfo.nickname]?.length || 0
                io.to(roomInfo.nickname).emit('update_viewer_watching', { currentViewers })
            })
            // * Donate
            socket.on('open_donate_room', function ({ nickname }) {
                socket.join(nickname)
            })
            socket.on('on_donate', ({ message, streamer, isDonate, }) => {
                io.to(streamer).emit('message_donate', { message, isDonate, });
            })
            // * Chat
            socket.on('join', ({ userChat, roomName }) => {
                try {
                    socket.join(roomName);
                    socket.emit('message', { roomName, helloText: `Welcome to ` });
                    socket.broadcast.to(roomName).emit('message', { roomName, userChat, welcomeText: ` has joined room` });
                } catch (e) {
                    socket.emit('error', { message: e });
                }
            });
            socket.on('sendMessage', async (payload) => {
                const { message, userChat, colorRand, roomName, createdAt } = payload
                if (await isUserBlocked(userChat) > 0) {
                    io.to(roomName).emit('block');
                    return;
                }
                io.to(roomName).emit('message', { userChat, message, colorRand, createdAt });
            });
            socket.on("disconnect", () => {

            });
            socket.on("end", ({info}) => {
                updateRoomViewer(info, false);
                const currentViewers = (socket.adapter.rooms?.[info.nickname]?.length) || 0
                io.to(info.nickname).emit('update_viewer_watching_on_end', { currentViewers })
                console.log("VIEWER DISCONNECTED");
            });
        });
    } catch (e) { console.log(e, "initSocket") }
}