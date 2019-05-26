import * as types from './actionTypes'
import {createSagaAction} from "../utils/reduxUtils";

export let changeAppNetInfo = connectionInfo => {
    return {
        type: types.APP_CHANGE_NET_INFO,
        payload: {connectionInfo}
    }
}

export let orientationInfoChanged = window => {
    return {
        type: types.APP_ORIENTATION_INFO_CHANGED,
        payload: {window}
    }
}

export let changeStatusBarStyle = (barStyle = 'default') => {
    return {type: types.APP_CHANGE_STATUS_BARSTYLE, payload: {barStyle}}
}

export let changeStatusBarHiddenStatus = (data) => {
    return {
        type: types.APP_CHANGE_STATUS_HIDE,
        payload: {
            parData:data
        }
    }
}

/**
 *
 * @param data
 * @returns {{type, payload: {isFetching,loadingTitle}}}
 */
export const showLoading = (data)=>{
    return{
        type:types.APP_SHOW_LOADING_REQUESTED,
        payload:data
    }
}


export const hideLoading = (data)=>{
    return{
        type:types.APP_HIDE_LOADING_REQUESTED,
        payload:data
    }
}


export const showToast = (message,options=undefined)=>{
    return{
        type:types.APP_SHOW_TOAST_REQUESTED,
        payload:{
            message,
            options
        }
    }
}


export const hideToast = (data)=>{
    return{
        type:types.APP_HIDE_TOAST_REQUESTED,
        payload:data
    }
}
