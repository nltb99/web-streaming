import React, { useEffect, useState, } from "react";
import Particles from "react-particles-js";

const Canvas = () => {
    const [dims, setDims] = useState({})
    useEffect(() => {
        updateWindowDimensions()
        window.addEventListener("resize", updateWindowDimensions);
        return () => {
            window.removeEventListener("resize", updateWindowDimensions);
        }
    }, [])
    const updateWindowDimensions = () => {
        setDims({
            width: `${window.innerWidth}px`,
            height: `${window.innerHeight}px`
        });
    };
    return (
        <Particles width={dims.width} height={dims.height}
            style={{ position: 'fixed', }}
            params={{
                "particles": {
                    "number": {
                        "value": 50,
                        "density": {
                            "enable": false
                        }
                    },
                    "size": {
                        "value": 3,
                        "random": true,
                        "anim": {
                            "speed": 5,
                            "size_min": 0.5
                        }
                    },
                    "line_linked": {
                        "enable": false
                    },
                    "move": {
                        "random": true,
                        "speed": 2,
                        "direction": "top",
                        "out_mode": "out"
                    }
                },
                "interactivity": {
                    "events": {
                        "onhover": {
                            "enable": false,
                            "mode": "bubble"
                        },
                        "onclick": {
                            "enable": true,
                            "mode": "repulse"
                        }
                    },
                    "modes": {
                        "bubble": {
                            "distance": 300,
                            "duration": 10,
                            "size": 0,
                            "opacity": 0,
                        },
                        "repulse": {
                            "distance": 400,
                            "duration": 10,
                        }
                    }
                }
            }} />
    );
}
export default Canvas;
