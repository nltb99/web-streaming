const path = require('path');
const express = require('express');
const router = express.Router();
import { executeQuery, payload, } from "../utilities/connection"
const fs = require('fs');
const dir = path.join(__dirname, '../../assets/videos');
const mime = {
    mp4: 'video/mp4',
    mov: 'video/quicktime',
};

router.get("*", function (req, res) {
    try {
        const { idVideo, idUser } = req.query
        const sql = `CALL Room_GetVideoPath(${idUser},${idVideo})`
        executeQuery(sql).then(data => {
            const { video_path } = data?.[0]?.[0] || {}
            const range = req.headers.range;
            if (!range) {
                res.status(400).send("Requires Range header");
            }
            const filePath = path.join(dir, req.path) + video_path;
            if (filePath.indexOf(dir + path.sep) !== 0) {
                return res.status(403).end('Forbidden');
            }
            const videoSize = fs.statSync(filePath).size;
            const CHUNK_SIZE = 10 ** 6; // 1MB
            const start = Number(range.replace(/\D/g, ""));
            const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

            const contentLength = end - start + 1;
            const type = mime[path.extname(filePath).slice(1)] || 'text/plain';
            const headers = {
                "Content-Range": `bytes ${start}-${end}/${videoSize}`,
                "Accept-Ranges": "bytes",
                "Content-Length": contentLength,
                "Content-Type": type,
            };
            res.writeHead(206, headers);
            const videoStream = fs.createReadStream(filePath, { start, end });
            videoStream.pipe(res);
            return res.status(200).json(payload(200, 'Succeed'))
        }).catch((err) => {
            return res.status(403).json(payload(403, err))
        })
    } catch (err) {
        return res.status(400).json(payload(400, err))
    }
});

module.exports = router;