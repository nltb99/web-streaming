const jwt = require('jsonwebtoken');
const { ACCESS_TOKEN_SECRET, RESET_TOKEN_SECRET } = require('../env')
const { payload } = require('./connection')

async function authPrivilege(req, res, next) {
    try {
        const authHeader = await req.headers['authorization'];
        if (!authHeader) return res.status(401).json(payload(401, 'Token must be provided'));
        const token = await authHeader.split(' ')[1];
        if (token === null) return res.status(401).json(payload(401, 'Token not found'));

        await jwt.verify(token, ACCESS_TOKEN_SECRET, (err, payload) => {
            if (err) throw err;
            const { user_id, } = payload;
            req.user_id = user_id;
            next();
        });
    } catch (e) {
        return res.status(400).json(payload(401, 'Invalid token'));
    }
}

async function resetVerifyToken(req, res, next) {
    try {
        const authHeader = await req.headers['authorization'];
        const token = (await authHeader) && authHeader.split(' ')[1];
        if (token === null) return res.sendStatus(401);

        await jwt.verify(token, RESET_TOKEN_SECRET, (err, payload) => {
            if (err) throw err;
            const { email } = payload;
            req.emailReset = email;
            next();
        });
    } catch (e) {
        return res.status(400).json(payload(401, 'Invalid token'));
    }
}

module.exports = {
    authPrivilege,
    resetVerifyToken,
};