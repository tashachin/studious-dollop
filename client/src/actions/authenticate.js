import http_requests from '../utils/http_requests';
import { getCookieStr } from '../utils/utils';
import * as serviceWorker from '../sw';

// action types
export const AUTH_FETCH = 'AUTH_FETCH';
export const AUTH_FETCH_ERR = 'AUTH_FETCH_ERR';
export const AUTH_FETCH_SUCCESS = 'AUTH_FETCH_SUCCESS';

// in udemy tutoral, just reused AUTH_FETCH and AUTH_FETCH_ERR for login and logout
export const LOGIN_FETCH = 'LOGIN_FETCH';
export const LOGIN_FETCH_ERR = 'LOGIN_FETCH_ERR';
//export const LOGIN_FETCH_SUCCESS = 'LOGIN_FETCH_SUCCESS';

export const LOGOUT_FETCH = 'LOGOUT_FETCH';
export const LOGOUT_FETCH_ERR = 'LOGOUT_FETCH_ERR';
export const LOGOUT_FETCH_SUCCESS = 'LOGOUT_FETCH_SUCCESS';

export const REG_FETCH = 'REG_FETCH';


//async
export const register = ({ email, password }) => dispatch => {
  dispatch({ type: REG_FETCH });
  http_requests.Auth.postRegister(email, password)
    .then(resp => {
      if (resp.type === 'error') {
        dispatch({
          type: AUTH_FETCH_ERR,
          message: resp.message
        })
      } else {
        let cookieAr;

        if (resp.cookie && storageAvailable('sessionStorage')) {
          cookieAr = resp.cookie.split('=');
          sessionStorage.setItem(cookieAr[0], cookieAr[1]);
        }
        dispatch({
          type: AUTH_FETCH_SUCCESS,
          message: resp.message,
          authStr: cookieAr[1]
        })
      }
    })
    .catch(err => dispatch({
      type: AUTH_FETCH_ERR,
      message: err.message
    }))
}

//get/save push subscription
export const login = ({ email, password }) => dispatch => {
  dispatch({ type: LOGIN_FETCH });
  http_requests.Auth.postLogin(email, password)
    .then(resp => {
      let cookieAr;

      if (resp.type === 'error') {
        dispatch({
          type: LOGIN_FETCH_ERR,
          message: resp.message
        })
      } else {
        if (resp.cookie && storageAvailable('sessionStorage')) {
          cookieAr = resp.cookie.split('=');
          sessionStorage.setItem(cookieAr[0], cookieAr[1]);
        }
        dispatch({
          type: AUTH_FETCH_SUCCESS,
          message: resp.message,
          authStr: cookieAr[1]
        });
        serviceWorker.subscribeUserToPush();
      }
    })
    .catch(err => dispatch({
      type: LOGIN_FETCH_ERR,
      message: err.message
    }))
}

//remove push subscription
export const logout = () => dispatch => {
  let cookie;
  const cookieKey = 'sessionStr';
  let cookieVal = sessionStorage.getItem(cookieKey);
  cookie = `${cookieKey}=${cookieVal}`;
  let cookieAr = cookieVal.split('|');
  let email = cookieAr[0];

  dispatch({ type: AUTH_FETCH });
  http_requests.Auth.postLogout({ cookie })
    .then(resp => {
      if (resp.type === 'error') {
        dispatch({
          type: LOGOUT_FETCH_ERR,
          message: resp.message
        })
      } else {
        sessionStorage.removeItem(`${cookieKey}`);
        dispatch({
          type: LOGOUT_FETCH_SUCCESS,
          message: resp.message
        });
        serviceWorker.unsubscribeUserFromPush();
      }
    })
    .catch(err => dispatch({
      type: LOGOUT_FETCH_ERR,
      message: err.message
    }))
  http_requests.Auth.putPushSubscription({email})
    .then(resp => console.log('resp', resp))
    .catch(err => console.error('error', err))
}

export const isAuthenticated = () => dispatch => {
  let cookie;
  const cookieKey = 'sessionStr';
  let cookieVal = getCookieStr();
  cookie = `${cookieKey}=${cookieVal}`;

  if (cookieVal) {
    dispatch({ type: AUTH_FETCH });
    //returning fetch because of the logic in index.js
    http_requests.Auth.postAuthenticated({ cookie: cookieVal })
      .then(resp => {
        if ((resp && resp.type === 'error') || !resp) {
          dispatch({
            type: AUTH_FETCH_ERR,
            message: resp.message
          });
          return false;
        } else if (resp) {
          dispatch({
            type: AUTH_FETCH_SUCCESS,
            message: resp.message,
            authStr: cookieVal
          });
          return true;
        }
      })
      .catch(err => {
        dispatch({
          type: LOGOUT_FETCH_ERR,
          message: err.message
        });
        return false;
      })
    } else {
      dispatch({
        type: AUTH_FETCH_ERR,
        message: 'invalid authentication'
      });
      return false;
    }
}

//helper
//https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API

function storageAvailable(type) {
    var storage;
    try {
        storage = window[type];
        var x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }
    catch(e) {
        return e instanceof DOMException && (
            // everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            (storage && storage.length !== 0);
    }
}
