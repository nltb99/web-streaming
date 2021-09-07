import React, { useState, useEffect, } from 'react'
import { GetOptionsPurchase, } from '../../store/PaymentController'
import { showToast } from '../controls/Toast'
import { } from 'nodemailer';

export default function PurchaseOptions() {
    const [inputValues, setInputValues] = useState({})
    const [options, setOptions] = useState([])

    const onChangeOption = (value, stateName) => {
        setInputValues({ ...inputValues, [stateName]: value })
    }
    const onContinuePurchase = () => {
        const { currency, option, } = inputValues
        window.location.href = `/buy_tokens?token=${option?.token}&amount=${option?.amount}&currency=${currency}`
    }
    const callEffect = async () => {
        try {
            const result = await GetOptionsPurchase()
            setOptions(result?.data || [])
        } catch (e) { showToast('error', e) }
    }
    useEffect(() => {
        callEffect()
    }, [])
    return (
        <div style={{ background: 'rgb(85,107,205)', position: 'fixed', top: 0, left: 0, zIndex: 100000, height: '100vh', width: '100vw', display: 'flex', justifyContent: 'center', alignItems: 'center', }}>
            <div style={{ background: 'white', width: '95%', height: '95%', borderRadius: 10, padding: 20, }}>
                <h4>Token Options</h4>
                <div style={{ display: 'flex', flexDirection: 'column', }}>
                    {options.map((option, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', }}>
                            <input type="radio" name="option" onChange={() => onChangeOption(option, 'option')} />
                            <span style={{ marginLeft: 5, }}>{option.name}</span>
                        </div>
                    ))}
                </div>
                <h4>Payment Options</h4>
                <div style={{ display: 'flex', flexDirection: 'column', }}>
                    {['USD'].map((currency, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', }}>
                            <input type="radio" name="currency" onChange={() => onChangeOption(currency, 'currency')} />
                            <span style={{ marginLeft: 5, }}>{currency}</span>
                        </div>
                    ))}
                </div>
                <button disabled={!inputValues.option || !inputValues.currency} onClick={onContinuePurchase} style={{ background: inputValues.option && inputValues.currency ? 'lightcoral' : 'gray' }}>
                    Continue
                </button>
            </div>
        </div>
    )
}
