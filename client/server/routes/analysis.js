import fs from 'fs'
const express = require('express');
const router = express.Router();
const { executeQuery, payload } = require("../utilities/connection")


router.post("/get_statistics", (req, res) => {
    const { user_id } = req.body
    const sql = `CALL DATA_STATISTICS(${user_id});`
    executeQuery(sql).then(data => {
        const payloadSend = {
            stat_trans_token: data?.[0]?.[0] || {},
            stat_trans_banking: data?.[1]?.[0] || {},
            stat_likes: data?.[2] || [],
            stat_viewers: data?.[3] || [],
            stat_subscriptions: data?.[4] || [],
            stat_receive_tokens: data?.[5] || [],
            stat_buy_tokens: data?.[6] || [],
        }
        return res.status(200).json(payload(200, 'Succeed', payloadSend))
    }).catch((err) => {
        return res.status(403).json(payload(403, err))
    })
})
module.exports = router;