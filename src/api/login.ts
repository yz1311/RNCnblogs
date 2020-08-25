import {requestWithTimeout, createOptions} from '../utils/request';
import * as types from '../actions/actionTypes';
import RequestUtils from "../utils/requestUtils";


export type userInfoModel = {
  id: string,
  seniority: string,
  follows: string,
  stars: string,
  nickName: string,
  signature: string,
  updated: string,
  link: string,
  blogapp: string,
  avatar: string,
  postcount: string,
};


//为0的时候表示可以连通
export const checkConnectivity = (data:RequestModel<{}>) => {
  const URL = `https://i.cnblogs.com/api/msg`;
  return RequestUtils.get<number>(URL);
};

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

export const getUserAlias = (data:RequestModel<{}>)=>{
  return RequestUtils.get<string>('https://home.cnblogs.com/user/CurrentUserInfo',{
    resolveResult: (result)=>{
      let userId = (result.match(/\/u\/[\s\S]+?(?=\/)/)||[])[0]?.replace(/\/u\//,'');
      return userId;
    }
  });
}
