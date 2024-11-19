export function includeParamsToUrl(url, params) {
    if (!params) return url;

    let query = Object.keys(params).map(key => {
        let value = params[key];
        // console.log(typeof value, key, value)
        if (typeof value === 'object' && value !== null) {
            return Object.keys(value).map(subKey => {
                return `${encodeURIComponent(key)}${encodeURIComponent("[")}${encodeURIComponent(subKey)}${encodeURIComponent("]")}=${encodeURIComponent(value[subKey])}`;
            }).join('&');
        } else {
            return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
        }
    }).join('&');
    return url + (query ? `?${query}` : '');
}

export function objectIsEmpty(obj) {
    return Object.keys(obj).length === 0;
}