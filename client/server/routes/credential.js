const express = require('express');
const router = express.Router();
const { executeQuery, payload, } = require("../utilities/connection")
const { resetVerifyToken, } = require("../utilities/authToken")
const bcrypt = require('bcrypt')
const { ACCESS_TOKEN_SECRET } = require('../env')
const jwt = require('jsonwebtoken')

router.post("/login", (req, res) => {
    const { username, password } = req.body
    if (!username || !password) {
        return res.status(403).json(payload(400, "Username or password must not be null"))
    }
    const sql = `CALL User_Login('${username}');`
    executeQuery(sql).then(data => {
        const response = data?.[0]?.[0] || {}
        if (response.password !== undefined) {
            bcrypt.compare(password, response.password, (err, results) => {
                if (err) throw err;
                if (!results) return res.status(400).json(payload(400, "Username or password is incorrect"));
                else if (results) {
                    jwt.sign(
                        { user_id: response.id, },
                        ACCESS_TOKEN_SECRET,
                        { expiresIn: 60 * 60 * 24 * 3 },
                        (err, jwt) => {
                            if (err) throw err;
                            delete response.password
                            return res.status(200).json(payload(200, "Login Successfully", { user_info: response, jwt }))
                        });
                }
            });
        } else {
            return res.status(400).json(payload(400, "Username or password is incorrect"))
        }
    }).catch((err) => {
        return res.status(403).json(payload(403, err))
    })
})

router.post("/register", async (req, res) => {
    try {
        const { username, password, nickname, email } = req.body
        const hashedPassword = await bcrypt.hash(password, 10)
        const sql = `CALL User_Register('${username}','${hashedPassword}','${nickname}','${email}');`
        executeQuery(sql).then(data => {
            const response = data?.[0]?.[0] || {}
            if (response.status === -1) {
                return res.status(400).json(payload(400, response.msg, response))
            } else {
                return res.status(200).json(payload(200, response.msg, response))
            }
        }).catch((err) => {
            return res.status(403).json(payload(403, err))
        })
    } catch (e) {
        return res.status(400).json(payload(400, e))
    }
})

router.post("/update_password", resetVerifyToken, async (req, res) => {
    try {
        const { password } = req.body
        const hashedPassword = await bcrypt.hash(password, 10)
        const sql = `CALL User_Update_Password('${req.emailReset}','${hashedPassword}');`
        await executeQuery(sql).then((data) => {
            return res.status(200).json(payload(200, "Password has been changed successfully", data?.[0] || []))
        }).catch((err) => {
            return res.status(402).json(payload(403, err))
        })
    } catch (e) {
        return res.status(400).json(payload(400, e))
    }
})

module.exports = router;