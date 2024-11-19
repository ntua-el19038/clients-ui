import axios from 'axios';

let config = {
  baseURL: "/",
  // timeout: 60 * 1000, // Timeout
};

const _axios = axios.create(config);

_axios.interceptors.request.use(
  function (config) {
    // Do something before request is sent      
    if (!config.url.includes('/api/v1/auth/login')) {
      let token = localStorage.token;
      // add token to header
      if (token) {
        config.headers.Authorization = 'Bearer ' + token;
      }
    }
    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  },
);

// Add a response interceptor
_axios.interceptors.response.use(
  function (response) {
    // Do something with response data
    if (!response.config.url.includes('/api/v1/auth/login') && response.config.url.includes('/api/v1/auth/login')) {
      _axios
        .post('/api/v1/refresh', localStorage.refresh_token, {
          headers: { 'Content-Type': 'application/json' },
        })
        .then(res => {
          console.log('Token refreshed');
        })
        .catch(error => {
          console.log(error);
        });
    }
    return response;
  },
  function (error) {
    // Do something with response error
    if (error.response.status === 500) {
      console.log(error);
    } else if (error.response.status === 504) {
      console.log(error);
    // } else if (error.response.status === 404) {
    //   window.location.href = '/' + getLanguageFromURL() + '/page-404';
    } else if (error.response.status === 403) {
      // window.location.href = '/' + getLanguageFromURL() + '/page-403';
      // window.location.href = '/' + getLanguageFromURL();
    } else if (error.response.status === 401) {
      if (error.response.config.url.includes('/api/v1/auth')) {
        window.location.href = process.env.REACT_APP_LOGINPATH;
      } else {
        localStorage.clear();
        window.location.href = process.env.REACT_APP_LOGINPATH;
      }
    }
    return Promise.reject(error);
  },
);

export const request = _axios;
