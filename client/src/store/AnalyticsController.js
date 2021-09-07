import { ANALYZE_DATA, } from '../utils/Urls'

export const GetDataStatistics = async (data) => {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    };
    const request = await fetch(ANALYZE_DATA, options)
    const response = await request.json()
    return response
}

