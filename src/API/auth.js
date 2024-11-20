import { request } from '../constants/alias';
import { API } from "../constants/config";
import {includeParamsToUrl, objectIsEmpty} from "../utils";
import axios from "axios";


/**
 * The rest request which attempts to fetch Usee Clients Data.
 * @param {*} pageable, name, and municipality
 *
 * @returns an object refering to the success or failure of the request
 */
export async function fetchAll(pageable, data) {

    if (!objectIsEmpty(data)) return await request.get(includeParamsToUrl(`${API}useeClient`, pageable !== undefined ? { ...pageable, ...data } : data));
    else return await request.get(includeParamsToUrl(`${API}useeClient`, pageable !== undefined ? pageable : {}));
    return await axios.get(`${API}api/v1/useeClient`, {
        params: {
            pageable,
            data
        },
    });
}
/**
 * The rest request which fetches all available municiaplities.
 *
 * @returns an object containing all available municipalities
 */
export async function fetchMunicipality(data) {
    return await axios.get(`${API}useeClient/municipality`);
}
/**
 * The rest request which attempts to login user from social buttons.
 * @param {*} data A JSON object which contains the token and the method
 *
 * @returns an object refering to the success or failure of the request
 */
export async function login(data) {
    return await request.post(`${API}auth/login`, data);
}
/**
 * The rest request which updates Usse Client Data.
 *
 * @returns an object refering to the success or failure of the request */
export async function updateUser(clientToUpdate) {
    let data = JSON.stringify(clientToUpdate);
// Axios PUT request configuration
    let config = {
        method: 'put',
        maxBodyLength: Infinity,
        url: `${API}useeClient/`,
        headers: {
            'Content-Type': 'application/json',
        },
        data: data,
    };

// Make the request
    return await axios.request(config);
}



const authApi = {
    login, fetchAll, fetchMunicipality, updateUser
}

export default authApi;