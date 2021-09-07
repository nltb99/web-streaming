import fs from 'fs'
import moment from 'moment'
import mkdirp from 'mkdirp'
import multer from 'multer'
import { executeQuery, payload, } from "../utilities/connection"
const express = require('express');
const router = express.Router();

// * Make Dir
const assetImage = `./assets/images/${moment().format("YYYYMMDD")}`
const assetVideo = `./assets/videos/${moment().format("YYYYMMDD")}`
const makeDir = (path) => {
    fs.access(path, function (error) {
        if (error) {
            mkdirp(path)
        }
    })
}
makeDir(assetImage)
makeDir(assetVideo)

router.post("/room_info", (req, res) => {
    const { roomName, idUser } = req.body
    const sql = `CALL Room_Info('${roomName}',${idUser});`
    executeQuery(sql).then(data => {
        return res.status(200).json(payload(200, 'Succeed', data?.[0]?.[0] || {}))
    }).catch((err) => {
        return res.status(403).json(payload(403, err))
    })
})

router.post("/rooms", (req, res) => {
    const { search } = req.body
    const sql = `CALL Room_RoomsOnline(${search ? `'${search}'` : null});`
    executeQuery(sql).then(data => {
        return res.status(200).json(payload(200, 'Succeed', data?.[0] || []))
    }).catch((err) => {
        return res.status(403).json(payload(403, err))
    })
})

router.get("/tags", (req, res) => {
    const sql = `CALL Room_Tags()`
    executeQuery(sql).then(data => {
        return res.status(200).json(payload(200, 'Succeed', data?.[0] || []))
    }).catch((err) => {
        return res.status(403).json(payload(403, err))
    })
})

router.post("/on_start", (req, res) => {
    const { user_id, title, description, tags, thumbnail } = req.body
    const sql = `CALL Room_OnStart(${user_id},'${title}','${description}','${tags}','${thumbnail}','${JSON.stringify(req.body)}');`
    executeQuery(sql).then((data) => {
        return res.status(200).json(payload(200, 'Succeed', data?.[0]?.[0]))
    }).catch((err) => {
        return res.status(403).json(payload(403, err))
    })
})

router.post("/on_end", (req, res) => {
    const { room_id, streamer_id, status } = req.body
    const sql = `CALL Room_OnEnd(${room_id},${streamer_id},${status});`
    executeQuery(sql).then((data) => {
        return res.status(200).json(payload(200, 'Succeed', data?.[0]?.[0]))
    }).catch((err) => {
        return res.status(403).json(payload(403, err))
    })
})

router.post("/like", (req, res) => {
    const { streamer_id, likes } = req.body
    const sql = `CALL Room_Like(${streamer_id},${likes});`
    executeQuery(sql).then((data) => {
        return res.status(200).json(payload(200, 'Succeed', data?.[0]?.[0]))
    }).catch((err) => {
        return res.status(403).json(payload(403, err))
    })
})

router.post("/snap", async (req, res) => {
    const { fileName, imageBase64, user_id, } = req.body
    const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");
    const BASE = './assets/images/'
    const pathImage = `/${moment().format("YYYYMMDD")}/${fileName}`
    fs.writeFile(BASE + pathImage, base64Data, 'base64', function (err) {
        if (err) throw err;
        const sql = `CALL Room_SnapThumbnail(${user_id},'${pathImage}');`
        executeQuery(sql).then(data => {
            return res.status(200).json(payload(200, 'Succeed', data))
        }).catch((err) => {
            return res.status(403).json(payload(403, err))
        })
    });
})

// * Save Record
const storageRecord = multer.diskStorage({
    destination: `./assets/videos/${moment().format("YYYYMMDD")}`,
    filename: (req, _, cb) => {
        const { filename } = req.headers
        cb(null, filename)
    }
})
const uploadRecord = multer({
    storage: storageRecord,
})
router.post("/save_record", uploadRecord.single('video'), async (req, res) => {
    try {
        const { user_id, filename, title } = req.headers
        const pathRecord = `/${moment().format("YYYYMMDD")}/${filename}`
        const sql = `CALL Room_SaveRecord(${user_id}, '${title}', '${pathRecord}');`
        executeQuery(sql).then(data => {
            return res.status(200).json(payload(200, 'Finished Recording', data))
        }).catch((err) => {
            return res.status(403).json(payload(403, err))
        })
    } catch (err) { return res.status(400).json(payload(400, err)) }
})
router.post("/save_record_snap", (req, res) => {
    try {
        const { user_id, fileName, imageBase64 } = req.body
        const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");
        const BASE = './assets/images/'
        let pathImage = `/${moment().format("YYYYMMDD")}/${escape(fileName)}`
        const sql = `CALL Room_SaveRecordThumbnail(${user_id},'${pathImage}');`
        fs.writeFile(BASE + pathImage, base64Data, 'base64', function (err) {
            if (err) throw err;
            executeQuery(sql).then(data => {
                return res.status(200).json(payload(200, 'Finished Recording', data))
            }).catch((err) => {
                return res.status(403).json(payload(403, err))
            })
        });
    } catch (err) { console.log(err); res.status(400).json(payload(400, err)) }
})
// * Get Videos
router.post("/videos", (req, res) => {
    const { user_id } = req.body
    const sql = `CALL Room_GetAllVideos(${user_id},null);`
    executeQuery(sql).then(data => {
        return res.status(200).json(payload(200, 'Succeed', data?.[0] || []))
    }).catch((err) => {
        return res.status(403).json(payload(403, err))
    })
})
// * Get all videos
router.post("/videos_all", (req, res) => {
    const { search } = req.body
    const sql = `CALL Room_GetAllVideos(-1,${search ? `'${search}'` : null});`
    executeQuery(sql).then(data => {
        return res.status(200).json(payload(200, 'Succeed', data?.[0] || []))
    }).catch((err) => {
        return res.status(403).json(payload(403, err))
    })
})
router.post("/update_video", (req, res) => {
    const video_id = req.body.video_id;
    const title = req.body.title
    const sql = `UPDATE videos SET title='${title}' WHERE id=${video_id};`
    executeQuery(sql).then(() => {
        return res.status(200).json(payload(200, 'Succeed'))
    }).catch((err) => {
        return res.status(403).json(payload(403, err))
    })
})
// * Deleted Videos
router.post("/delete_video", (req, res) => {
    const { video_id } = req.body
    const sql = `DELETE FROM videos WHERE id = ${video_id};`
    executeQuery(sql).then(() => {
        return res.status(200).json(payload(200, 'Succeed'))
    }).catch((err) => {
        return res.status(403).json(payload(403, err))
    })
})

router.post("/blocked_users", (req, res) => {
    const { roomId } = req.body
    const sql = `
        SELECT t2.nickname, t1.created_at AS block_date FROM room_block_chat t1
        INNER JOIN users t2 ON t1.blocked_user_id = t2.id
        WHERE t1.room_id = ${roomId}`
    executeQuery(sql).then(data => {
        return res.status(200).json(payload(200, 'success', data))
    }).catch((err) => {
        return res.status(403).json(payload(403, err))
    })
})
router.post("/block_chat", (req, res) => {
    const { user, roomName, isBlock } = req.body
    let sql = `
        DELETE FROM room_block_chat
        WHERE room_id = (SELECT t1.id FROM rooms t1 INNER JOIN users t2 ON t1.streamer_id = t2.id WHERE t2.nickname = '${roomName}' ORDER BY t1.id DESC LIMIT 1)
        AND blocked_user_id = (SELECT id FROM users WHERE nickname = '${user}')
    `
    if(isBlock === true){
        sql = `
        INSERT INTO room_block_chat(room_id, blocked_user_id) VALUES (
            (SELECT t1.id FROM rooms t1 INNER JOIN users t2 ON t1.streamer_id = t2.id WHERE t2.nickname = '${roomName}' ORDER BY t1.id DESC LIMIT 1)
            ,(SELECT id FROM users WHERE nickname = '${user}')
        )`
    }
    executeQuery(sql).then(() => {
        return res.status(200).json(payload(200, 'Succeed'))
    }).catch((err) => {
        return res.status(403).json(payload(403, err))
    })
})


module.exports = router;