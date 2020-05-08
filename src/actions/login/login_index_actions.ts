import * as actionTypes from '../actionTypes';
import {createSagaAction} from '../../utils/reduxUtils';

export const getToken = data => {
  return createSagaAction(actionTypes.LOGIN_GET_TOKEN, data);
};

export const userLogin = data => {
  return createSagaAction(actionTypes.LOGIN_USERLOGIN, data);
};

export const refreshToken = data => {
  return createSagaAction(actionTypes.LOGIN_REFRESH_TOKEN, data);
};

export const getUserInfo = data => {
  return createSagaAction(actionTypes.LOGIN_GET_USER_INFO, data);
};

export const setLoginCode = data => {
  return createSagaAction(actionTypes.LOGIN_SET_LOGIN_CODE, data);
};

export const logout = data => {
  return createSagaAction(actionTypes.LOGIN_LOGOUT, data);
};
