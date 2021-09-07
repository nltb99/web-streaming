const path = require('path');
const express = require('express');
const router = express.Router();
const fs = require('fs');
const dir = path.join(__dirname, '../../assets/images');
const mime = {
    gif: 'image/gif',
    jpg: 'image/jpeg',
    png: 'image/png',
    svg: 'image/svg+xml',
};

router.get('*', function (req, res) {
    const file = path.join(dir, req.path);
    if (file.indexOf(dir + path.sep) !== 0) {
        return res.status(403).end('Forbidden');
    }
    const type = mime[path.extname(file).slice(1)] || 'text/plain';
    const s = fs.createReadStream(file);
    s.on('open', function () {
        res.set('Content-Type', type);
        s.pipe(res);
    });
    s.on('error', function () {
        res.set('Content-Type', 'text/plain');
        res.status(404).end('Not found');
    });
});

module.exports = router;