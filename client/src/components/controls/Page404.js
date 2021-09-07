import React from 'react'

const Page404 = ({ text }) => {
    return (
        <div style={{ pointerEvents: 'none', }}>
            <h2 className="brand_styling text_primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh', }}>{text || "Not Found"}</h2>
        </div>
    )
}
export default Page404