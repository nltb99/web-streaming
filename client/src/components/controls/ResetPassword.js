import React, { useState, useEffect, useRef, } from "react";
import { getParamUrl, } from '../../utils/Helper'
import { showToast } from '../controls/Toast'
import { showLoading } from '../controls/Loading'
import { OnUpdatePassword } from '../../store/CredentialController'

const ResetPassword = ({ }) => {
    const [jwt, setJwt] = useState('')
    const [inputValues, setInputValues] = useState({})

    const onChangeForm = (value, stateName) => {
        setInputValues({ ...inputValues, [stateName]: value })
    }
    const onChangePass = async () => {
        showLoading(true)
        try {
            const { password, confirmpassword, } = inputValues
            if (password !== confirmpassword) {
                showToast('warn', 'Password confirmation does not match!')
                return
            }
            const result = await OnUpdatePassword({ password: password?.trim() }, jwt,)
            if (result.status === 200) {
                setInputValues({})
                showToast("info", result.msg)
            } else {
                showToast("error", result.msg)
            }
        } catch (e) { }
        showLoading(false)
    }
    useEffect(() => {
        setJwt(getParamUrl('jwt') || "")
    }, [])
    return (
        <div style={{ height: '70vh', display: 'flex', justifyContent: 'center', alignItems: 'center', pointerEvents: 'auto', }}>
            <div style={{}}>
                <h4 className="text_primary">Reset Password</h4>
                <div className="form-group">
                    <label className="text_primary">New Password:</label>
                    <input type="password" className="form-control" value={inputValues.password || ""} onChange={(e) => onChangeForm(e.target.value, 'password')} placeholder="Password..." />
                </div>
                <div className="form-group">
                    <label className="text_primary">Confirm New Password:</label>
                    <input type="password" className="form-control" value={inputValues.confirmpassword || ""} onChange={(e) => onChangeForm(e.target.value, 'confirmpassword')} placeholder="Confirm password..." />
                </div>
                <button onClick={onChangePass} className="btn btn-primary btn-block">Reset</button>
            </div>
        </div>
    )
}
export default ResetPassword