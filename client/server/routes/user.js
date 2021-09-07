
import fs from 'fs'
const express = require('express');
const router = express.Router();
const { executeQuery, payload } = require("../utilities/connection")
const { authPrivilege, } = require('../utilities/authToken')

router.post("/subscribe", (req, res) => {
    const { isSubscribed, host_id, follower_id } = req.body
    const sql = `CALL User_Subscribe(${isSubscribed},${host_id},${follower_id});`
    executeQuery(sql).then(data => {
        const response = data?.[0]?.[0] || {}
        let message = ""
        if (response?.isSubscribed === 1) {
            message = "Followed Successfully"
        } else {
            message = "UnFollowed Successfully"
        }
        return res.status(200).json(payload(200, message, response))
    }).catch((err) => {
        return res.status(403).json(payload(403, err))
    })
})

router.post("/update_role", (req, res) => {
    const { user_id, } = req.body
    const sql = `UPDATE users SET role_user='STREAMER' WHERE id=${user_id}`
    executeQuery(sql).then(() => {
        return res.status(200).json(payload(200, 'Succeed'))
    }).catch((err) => {
        return res.status(403).json(payload(403, err))
    })
})

router.post("/all_users", async (req, res) => {
    const { search } = req.body
    const sql = `
        SELECT id,nickname,fullname,photo 
        FROM users where is_active=1
        ${search ? `AND nickname LIKE '%${search}%'` : ""}
    `
    executeQuery(sql).then(data => {
        return res.status(200).json(payload(200, 'Succeed', data || []))
    }).catch((err) => {
        return res.status(403).json(payload(403, err))
    })
})

router.get("/user_info", authPrivilege, async (req, res) => {
    const sql = `CALL User_GetInfo(${req.user_id});`
    executeQuery(sql).then(data => {
        return res.status(200).json(payload(200, 'Succeed', data?.[0]?.[0] || {}))
    }).catch((err) => {
        return res.status(403).json(payload(403, err))
    })
})

router.get("/profile", async (req, res) => {
    const sql = `CALL User_GetProfileInfo('${req.headers?.nickname}',${req.headers?.host_id});`
    executeQuery(sql).then(data => {
        return res.status(200).json(payload(200, 'Succeed', data?.[0]?.[0] || {}))
    }).catch((err) => {
        return res.status(403).json(payload(403, err))
    })
})

router.post("/save_avatar", async (req, res) => {
    const { fileName, imageBase64, user_id, } = req.body
    const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");
    const BASE = './assets/avatars/'
    const pathImage = `/${fileName}`
    fs.writeFile(BASE + pathImage, base64Data, 'base64', function (err) {
        if (err) throw err;
        const sql = `UPDATE Users u SET u.photo='${fileName}' WHERE u.id=${user_id}`
        executeQuery(sql).then(data => {
            return res.status(200).json(payload(200, 'Đổi hình đại diện thành công', data))
        }).catch((err) => {
            return res.status(403).json(payload(403, err))
        })
    });
})
router.post("/update_profile", async (req, res) => {
    let { id, fullname, nickname, bio, } = req.body
    nickname = nickname?.trim()?.replace(/\s/g, '_')
    const sql = `CALL User_UpdateProfileInfo(${id}, '${fullname}','${nickname}','${bio}')`
    executeQuery(sql).then(data => {
        const response = data?.[0]?.[0] || {}
        if (response.result === 1) {
            return res.status(200).json(payload(200, 'Succeed'))
        } else {
            return res.status(400).json(payload(403, 'Nickname đã tồn tại'))
        }
    }).catch((err) => {
        return res.status(403).json(payload(403, err))
    })
})

router.get("/donate_history", async (req, res) => {
    const sql = `
        SELECT ROW_NUMBER() OVER (ORDER BY hd.created_at DESC) STT,hd.id, u1.nickname as sender, u2.nickname as receiver, hd.token,DATE_FORMAT(hd.created_at,'%Y-%m-%d %T') as created_at FROM history_donate hd
        inner join users u1 on u1.id= hd.sender_id
        inner join users u2 on u2.id= hd.receiver_id WHERE sender_id=${Number(req.headers?.userid) || 0}
        ORDER BY hd.created_at DESC
    `
    executeQuery(sql).then(data => {
        return res.status(200).json(payload(200, 'Succeed', data))
    }).catch((err) => {
        return res.status(403).json(payload(403, err))
    })
})
router.get("/token_history", async (req, res) => {
    const sql = `
        SELECT ROW_NUMBER() OVER (ORDER BY hp.created_at DESC) STT,hp.id, u.nickname as nickname,hp.token,CONCAT('$',hp.amount) as amount,DATE_FORMAT(hp.created_at,'%Y-%m-%d %T') as created_at 
        FROM history_purchase hp
        inner join users u on u.id= hp.user_id
        WHERE hp.user_id=${Number(req.headers?.userid) || 0}
        ORDER BY hp.created_at DESC
    `
    executeQuery(sql).then(data => {
        return res.status(200).json(payload(200, 'Succeed', data))
    }).catch((err) => {
        return res.status(403).json(payload(403, err))
    })
})

module.exports = router;