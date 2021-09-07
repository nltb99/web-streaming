import React, { useEffect, } from 'react';
import videojs from 'video.js'
import '@videojs/themes/dist/city/index.css';

const VideoPlayer = () => {
    useEffect(() => {
        videojs("remote-video", {
            controls: true,
            width: '100%',
            height: 480,
            fluid: true,
        });
    }, [])
    return (
        <div>
            <div data-vjs-player>
                <video id="remote-video" className="video-js vjs-theme-city"
                    style={{ maxHeight: '100%', maxWidth: '100%', minWidth: '100%', minHeight: 350, }} />
            </div>
        </div>
    )
}

export default VideoPlayer