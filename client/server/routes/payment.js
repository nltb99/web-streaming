const express = require('express');
const router = express.Router();
const { executeQuery, payload, } = require("../utilities/connection")
const { STRIPE_SECRET_KEY, RESET_TOKEN_SECRET, } = require('../env')
const { authPrivilege } = require('../utilities/authToken')
const stripe = require("stripe")(STRIPE_SECRET_KEY)
const nodemailer = require("nodemailer");
const mail_template = require('../template/mailtemplate')
const jwt = require('jsonwebtoken')

router.get("/options_purchase", async (req, res) => {
    try {
        const sql = `CALL Payment_Options();`
        await executeQuery(sql).then((data) => {
            return res.status(200).json(payload(200, `Succeed`, data?.[0] || []))
        }).catch((err) => {
            return res.status(402).json(payload(403, err))
        })
    } catch (err) {
        return res.status(500).json(payload(500, err))
    }
})

router.post("/purchase_token", async (req, res) => {
    let { id, amount, idUser, nickname, currency, token, } = req.body
    try {
        await stripe.paymentIntents.create({
            amount: amount,
            currency: currency,
            description: nickname,
            payment_method: id,
            confirm: true
        })
        const sql = `CALL Payment_PurchaseToken(${idUser},'${currency}',${token},'${JSON.stringify(req.body)}');`

        await executeQuery(sql).then((data) => {
            const purchasedToken = data?.[0]?.[0]?.purchased_token || 0
            let templateInvoice = mail_template?.invoice?.replace("**********TOKENS**********", token + "")
            templateInvoice = templateInvoice?.replace("____________AMOUNT____________", amount + "")
            mailSender(req.body.email, `[BAVK] Payment Invoice - Purchased ${token}`, templateInvoice)
            return res.status(200).json(payload(200, `You have successfully purchased ${purchasedToken} tokens`, data?.[0]?.[0] || {}))
        }).catch((err) => {
            return res.status(402).json(payload(402, err))
        })

    } catch (err) {
        return res.status(500).json(payload(500, err?.code || err))
    }
})

router.post("/donate_token", authPrivilege, async (req, res) => {
    let { quantity, receiver } = req.body
    const sender = req.user_id
    const sql = `CALL Payment_Donate(${sender}, ${receiver}, ${quantity})`
    await executeQuery(sql).then((data) => {
        const result = data?.[0]?.[0]?.result
        switch (result) {
            case 1:
                return res.status(200).json(payload(200, 'Donate Successful', data?.[0]?.[0] || {}))
            case 2:
                return res.status(403).json(payload(403, 'Not Enough Token', data?.[0]?.[0] || {}))
            case 3:
                return res.status(403).json(payload(403, 'Cannot donate tokens to yourself', data?.[0]?.[0] || {}))
            default:
                return res.status(403).json(payload(403, 'Donate Failed', data?.[0]?.[0] || {}))

        }
    }).catch((err) => {
        return res.status(500).json(payload(500, err))
    })
})

router.post("/get_jwt_reset", generateResetToken, async (req, res) => {
    const { email, host_origin, } = req.body
    console.log(req.body, 'req.body')
    const templateReset = `
        <div style="font-family: Arial, Courier, serif;height:200px;">
            <h2 style="color: lightseagreen;">BAVK - Live Streaming</h2>
            <div>
                <h4>Hello!</h4>
                <h4>You are receiving this email because we received a password reset request for your account.</h4>
                <a href="${host_origin}/reset_password?jwt=${req.resetToken}"
                    style="text-decoration:none;padding:10px;background-color:rgb(72,161,181);color:white;border-radius:5px;width: 200px">
                    Reset Password </a>
            </div>
        </div>
    `
    const email_status = await mailSender(email, 'BAVK - Passwod Reset', templateReset)
    if (email_status === 1) {
        return res.status(200).json(payload(200, "Reset Password Successful"))
    } else {
        return res.status(500).json(payload(500, "Reset Password Failed"))
    }
});

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: 'khoinmps11141@fpt.edu.vn',
        pass: 'Sau5432Mot1',
    },
});

const mailSender = (receiverEmail, subject, template) => {
    return new Promise((resolve, reject) => {
        transporter.sendMail({
            from: "khoinmps11141@fpt.edu.vn",
            to: receiverEmail,
            subject: subject,
            text: '',
            html: template,
            attachments: [{
                filename: 'image.png',
                path: 'https://i.ibb.co/S5fV1Np/image-2.png',
                cid: 'https://i.ibb.co/S5fV1Np/image-2.png'
            }]
        }, (error, _) => {
            if (error) reject(0)
            resolve(1)
        });
    })
}
function generateResetToken(req, res, next) {
    jwt.sign(
        { email: req.body.email, },
        RESET_TOKEN_SECRET,
        { expiresIn: 60 * 60 * 24 * 3 },
        (err, token) => {
            if (err) throw err;
            req.resetToken = token;
            next();
        },
    );
}

module.exports = router;