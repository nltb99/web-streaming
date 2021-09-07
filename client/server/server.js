import express from 'express'
import cors from 'cors'
const app = express()
import path from 'path'
import { initSocket } from './socket/call'

// * Middleware
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// * Routes 
app.use('/api/credential', require("./routes/credential"));
app.use('/api/stream', require("./routes/stream"));
app.use('/api/user', require("./routes/user"));
app.use('/api/payment', require("./routes/payment"));
app.use('/api/image', require("./routes/asset_image"));
app.use('/api/video', require("./routes/asset_video"));
app.use('/api/avatar', require("./routes/asset_avatar"));
app.use('/api/analysis', require("./routes/analysis"))

// * Heroku Deploy
// if (process.env.NODE_ENV === 'production') {
//   app.use(express.static(path.join(__dirname, '../build')));
//   app.get('*', function (req, res) {
//     res.sendFile(path.join(__dirname, '../build', 'index.html'));
//   });
// }

// * Runtime
const PORT = process.env.PORT || 3002
const server = app.listen(PORT, () => {
  console.log("Server Running on Port " + PORT);
})

// * Socket.io
initSocket(server)