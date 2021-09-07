import React, { useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import Emitter from './EventEmitter'

const configs = {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
}
const Toast = () => {
    useEffect(() => {
        Emitter.on('show_toast', async (data) => {
            const { message, type, customConfigs } = data
            Object.assign(configs, customConfigs || {})
            switch (type) {
                case "info":
                    toast.info(message, configs);
                    break;
                case "success":
                    toast.success(message, configs);
                    break;
                case "warn":
                    toast.warn(message, configs);
                    break;
                case "error":
                    toast.error(message, configs);
                    break;
                case "dark":
                    toast.dark(message, configs);
                    break;
                default:
                    toast(message, configs);
                    break;
            }
        })
    }, [])
    return (
        <ToastContainer position="top-right" draggable
            autoClose={3000} pauseOnFocusLoss
            hideProgressBar closeOnClick
            newestOnTop={false} pauseOnHover rtl={false} />
    )
}
export default Toast

export const showToast = (type, message, customConfigs) => {
    if (typeof message !== 'string') message = JSON.stringify(message)
    Emitter.emit("show_toast", { type, message, customConfigs })
}