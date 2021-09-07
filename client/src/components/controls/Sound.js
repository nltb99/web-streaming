import React, { useEffect, useRef, } from "react";
import Emitter from './EventEmitter'
import useSound from 'use-sound';
import donateSound from '../../assets/sounds/donate.mp3';

const Sound = () => {
    const [onPlay] = useSound(donateSound);
    const refButton = useRef(null)
    useEffect(() => {
        Emitter.on('play_audio_donate', () => {
            refButton.current.click()
        })
    }, [])
    return (
        <button ref={refButton} onClick={onPlay} style={{ display: 'none', }} />
    )
}
export default Sound

export const playDonateSound = () => {
    Emitter.emit("play_audio_donate", {})
}