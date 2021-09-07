import React, { useState, useEffect, } from 'react'
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js"
import { OnPurchaseToken, } from '../../store/PaymentController'
import { GetUserInfo, } from '../../store/CredentialController'
import { showToast } from '../controls/Toast'
import { showLoading } from '../controls/Loading'
import { getParamUrl, } from '../../utils/Helper'

const CARD_OPTIONS = {
    iconStyle: "solid",
    style: {
        base: {
            iconColor: "#c4f0ff",
            color: "white",
            fontWeight: 500,
            fontFamily: "Roboto, Open Sans, Segoe UI, sans-serif",
            fontSize: "16px",
            fontSmoothing: "antialiased",
            ":-webkit-autofill": { color: "#fce883" },
            "::placeholder": { color: "#87bbfd" }
        },
        invalid: {
            iconColor: "#ffc7ee",
            color: "#ffc7ee"
        }
    }
}
export default function Purchase() {
    const stripe = useStripe()
    const elements = useElements()
    const [isLoading, setIsLoading] = useState(false)
    const [inputValues, setInputValues] = useState({})
    const [userInfo, setUserInfo] = useState({})

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (isLoading) return
        showLoading(true)
        setIsLoading(true)
        try {
            const { error, paymentMethod } = await stripe.createPaymentMethod({
                type: "card",
                card: elements.getElement(CardElement)
            })
            if (!error) {
                try {
                    const { id } = paymentMethod
                    const { currency, amount, token, } = inputValues
                    const data = {
                        id, currency,
                        amount: Math.ceil(amount * 100),
                        token: +token,
                        nickname: userInfo.nickname,
                        email: userInfo.email,
                        idUser: userInfo.id,
                    }
                    const result = await OnPurchaseToken(data)
                    if (result.status === 200) {
                        window.close()
                    } else {
                        showToast('error', result.msg)
                    }
                } catch (error) {
                    showToast('error', error)
                }
            } else {
                showToast('error', error.message)
            }
        } catch (e) { showToast('error', e) }
        showLoading(false)
        setIsLoading(false)
    }
    const callEffect = async () => {
        const info = await GetUserInfo()
        setUserInfo(info || {})
    }
    useEffect(() => {
        const amount = getParamUrl('amount')
        const currency = getParamUrl('currency')
        const token = getParamUrl('token')
        callEffect()
        setInputValues({ amount, currency, token })
    }, [])
    return (
        <form onSubmit={handleSubmit} style={{ position: 'fixed', top: 0, left: 0, background: 'rgb(85,107,205)', height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 5000, }}>
            {/* <p>4242424242424242</p> */}
            <h1 style={{ color: 'white', }}>Payment</h1>
            <span style={{ color: 'white', fontSize: 16, }}>Purchase ${inputValues.amount || '0'} for {inputValues.token || "0"} tokens</span>
            <div style={{ width: '70%', background: 'rgb(112,144,232)', padding: 10, borderRadius: 5, marginBottom: 20, }}>
                <CardElement options={CARD_OPTIONS} />
            </div>
            <button disabled={isLoading} type="submit" style={{ width: '70%', padding: 10, borderRadius: 5, outline: 'none', border: 'none', background: 'rgb(214,147,216)', color: 'white', }}>Pay ${inputValues.amount || "0"}</button>
        </form>
    )
}
