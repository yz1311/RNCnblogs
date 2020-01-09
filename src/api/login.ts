import {requestWithTimeout, createOptions} from '../utils/request';
import * as types from '../actions/actionTypes';

export const getToken = data => {
  data.request = {
    client_id: gBaseConfig.clientId,
    client_secret: gBaseConfig.clientSecret,
    grant_type: 'client_credentials',
  };
  data.request = `client_id=${data.request.client_id}&client_secret=${
    data.request.client_secret
  }&grant_type=${data.request.grant_type}`;
  const URL = `https://api.cnblogs.com/token`;
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    },
    body: data.request,
  };
  return requestWithTimeout({
    URL,
    data,
    options,
    errorMessage: '获取token失败!',
    actionType: types.LOGIN_GET_TOKEN,
  });
};

export const userLogin = data => {
  const URL = `https://oauth.cnblogs.com/connect/token`;
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    },
    body: data.request,
  };
  return requestWithTimeout({
    URL,
    data,
    options,
    errorMessage: '登录失败!',
    actionType: types.LOGIN_USERLOGIN,
  });
};

export const refreshToken = data => {
  const URL = `https://oauth.cnblogs.com/connect/token`;
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      // 'Authorization':'Basic '+gBaseConfig.clientId+':'+gBaseConfig.clientSecret
    },
    body: data.request,
  };
  return requestWithTimeout({
    URL,
    data,
    options,
    errorMessage: '刷新token失败!',
    actionType: types.LOGIN_USERLOGIN,
  });
};

export const getUserInfo = data => {
  const URL = `${gServerPath}/users`;
  const options = createOptions(data, 'GET');
  return requestWithTimeout({
    URL,
    data,
    options,
    errorMessage: '获取用户信息失败!',
    actionType: types.LOGIN_GET_USER_INFO,
  });
};
