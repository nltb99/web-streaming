
export const getCookie = (name) => {
    const cookieArr = document.cookie.split(";");
    for (let i = 0, lenCookieArr = cookieArr.length; i < lenCookieArr; i++) {
        const cookiePair = cookieArr[i].split("=");
        if (name == cookiePair[0].trim()) {
            return decodeURIComponent(cookiePair[1]);
        }
    }
    return null;
}
export const getToken = (useHeader) => {
    try {
        const jwt = localStorage.getItem('jwt')
        if (jwt) {
            return `${useHeader ? "Bearer " : ""}${JSON.parse(jwt)}`
        }
    } catch (e) { }
    return null
}
export const getParamUrl = (key) => {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get(key)
}
export function customQuery(query) {
    if (!query) {
        return { match_all: {} };
    }
    return { multi_match: { query, type: "phrase", fields: ["email", "fullname", "photo", "name"] } };
}

export const delayFunc = (func, wait, immediate) => {
    let timeout;
    return function () {
        let context = this, args = arguments;
        let callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(function () {
            timeout = null;
            if (!immediate) {
                func.apply(context, args);
            }
        }, wait);
        if (callNow) func.apply(context, args);
    }
}
const COLORS = ['#32CD32', '#FF5F1F', '#4F7942', '#F88379', '#4169E1', '#770737',
    '#32CD32', '#0F52BA', '#4682B4', '#FF4433', '#9F2B68', '#FA5F55', '#FA8072', '#FFAA33',
    '#F4BB44', '#088F8F', '#097969', '#228B22', '#40B5AD', '#6495ED', '#0818A8', '#E3735E', '#FF3131']

export const randColor = () => {
    return COLORS[(Math.random() * COLORS.length) | 0];
}
export const url = "/";
