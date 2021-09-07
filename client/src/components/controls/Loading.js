import React, { useEffect, useState, } from "react";
import Emitter from './EventEmitter'
import PuffLoader from "react-spinners/PuffLoader";
import { css } from "@emotion/react";

const override = css`
    position:fixed;
    top:50%;
    left:50%;
    z-index:100000;
    transform:translate(-50%,-50%);
`;

const Toast = () => {
    const [isLoading, setIsLoading] = useState(false)
    useEffect(() => {
        Emitter.on('show_loading', async ({ boolean }) => {
            setIsLoading(boolean)
        })
    }, [])
    return (
        <PuffLoader color={'black'} loading={isLoading} css={override} size={50} />
    )
}
export default Toast

export const showLoading = (boolean) => {
    Emitter.emit("show_loading", { boolean })
}