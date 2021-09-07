import React from 'react'
import BrandImage from '../../assets/images/brand.png'
import { Link } from "react-router-dom"
import { FaEnvelope } from "react-icons/fa";

const Footer = () => {
    const onDisplayPurchase = () => {
        window.open('/purchase_options', '', 'scrollbars=yes,width=650,height=600')
    }
    return (
        <footer style={{ zIndex: 10, marginTop: 20, pointerEvents: 'none', }}>
            <div style={{ background: 'rgb(33,37,49)', opacity: 0.8, height: 400, borderTop: '1px solid #777', padding: 55, overflow: 'hidden', }}>
                <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'no-wrap', }}>
                    <div>
                        <img src={BrandImage} alt="" style={{ width: 80, height: 80, borderRadius: 10, objectFit: 'cover', }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '33px', pointerEvents: 'auto', }}>
                        <p style={{ color: 'lightsalmon', fontWeight: 'bold', }}>BAVK Live Streaming</p>
                        <Link to="/">
                            <p className="text_primary">Home</p>
                        </Link>
                        <Link to="/videos">
                            <p className="text_primary">Videos</p>
                        </Link>
                        <Link to="/members">
                            <p className="text_primary">Members</p>
                        </Link>
                        <div className="href_style_text" onClick={onDisplayPurchase}>
                            <p className="text_primary">Buy Tokens</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '33px', pointerEvents: 'auto', }}>
                        <p style={{ color: 'lightsalmon', fontWeight: 'bold', }}>Resources</p>
                        <Link to="/">
                            <p className="text_primary">Stripe</p>
                        </Link>
                        <Link to="/">
                            <p className="text_primary">Videojs</p>
                        </Link>
                        <Link to="/">
                            <p className="text_primary">Socket</p>
                        </Link>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '33px', pointerEvents: 'auto', }}>
                        <p style={{ color: 'lightsalmon', fontWeight: 'bold', }}>Contact</p>
                        <p style={{ color: 'white', }}><FaEnvelope /> bavklivestreaming@gmail.com</p>
                    </div>
                </div>
                <h5 style={{ color: 'white', textAlign: 'center', marginTop: 40, }}>Copyright © 2021 BAVK Team</h5>
            </div>
        </footer>
    )
}
export default Footer