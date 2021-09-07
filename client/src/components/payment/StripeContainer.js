import { Elements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import React from "react"
import Purchase from "./Purchase"

const PUBLIC_KEY = "pk_test_51IuDXGJefHKSb0l8o5FJglhe65YLVctYknMaHW2ophK3U6Cps4Fa1ah14PjWMhPhIoecrhnyFAMYvku5Al7IjqAx005eXf5nZS"

const stripeTestPromise = loadStripe(PUBLIC_KEY)

function StripeContainer() {
    return (
        <Elements stripe={stripeTestPromise}>
            <Purchase />
        </Elements>
    )
}
export default StripeContainer
