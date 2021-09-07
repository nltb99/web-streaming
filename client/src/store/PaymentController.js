import { PAYMENT_PURCHASE, PAYMENT_OPTIONS, PAYMENT_DONATE, } from '../utils/Urls'

export const OnPurchaseToken = async (data) => {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    };
    const request = await fetch(PAYMENT_PURCHASE, options)
    const response = await request.json()
    return response
}
export const OnDonateToken = async (data, jwt) => {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + jwt
        },
        body: JSON.stringify(data)
    };
    const request = await fetch(PAYMENT_DONATE, options)
    const response = await request.json()
    return response
}

export const GetOptionsPurchase = async () => {
    const options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    };
    const request = await fetch(PAYMENT_OPTIONS, options)
    const response = await request.json()
    return response
}