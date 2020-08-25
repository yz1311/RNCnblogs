import * as types from './actionTypes';

export let changeAppNetInfo = connectionInfo => {
  return {
    type: types.APP_CHANGE_NET_INFO,
    payload: {connectionInfo},
  };
};

export let orientationInfoChanged = window => {
  return {
    type: types.APP_ORIENTATION_INFO_CHANGED,
    payload: {window},
  };
};

export let changeStatusBarStyle = (barStyle = 'default') => {
  return {type: types.APP_CHANGE_STATUS_BARSTYLE, payload: {barStyle}};
};

export let changeStatusBarHiddenStatus = data => {
  return {
    type: types.APP_CHANGE_STATUS_HIDE,
    payload: {
      parData: data,
    },
  };
};

