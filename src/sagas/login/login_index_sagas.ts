import {takeEvery, takeLatest, put, all, call, fork} from 'redux-saga/effects';
import * as actionTypes from '../../actions/actionTypes';
import {
  createSagaAction,
  removePendingSuffix,
  invokeCommonAPI,
  takeOrCancel,
} from '../../utils/reduxUtils';
import API from '../../api';
import moment from 'moment';
import {showToast} from '../app_sagas';
import Toastutils from '../../utils/toastUtils';

export function* getToken(action) {
  yield* invokeCommonAPI({
    method: API.login.getToken,
    action: action,
    showLoading: false,
  });
}

export function* setLoginCode(action) {
  const {payload} = action;
  yield put({
    ...action,
    type: removePendingSuffix(action.type),
  });
  //设置code之后进行登录操作
  // yield fork(userLogin,createSagaAction(actionTypes.LOGIN_USERLOGIN,{
  //     request: {
  //         client_id : gBaseConfig.clientId,
  //         client_secret: gBaseConfig.clientSecret,
  //         grant_type: 'authorization_code',
  //         code: payload.code,
  //         redirect_uri: 'https://oauth.cnblos.com/auth/callback'
  //     }
  // }));
  yield fork(
    userLogin,
    createSagaAction(actionTypes.LOGIN_USERLOGIN, {
      request: `client_id=${gBaseConfig.clientId}&client_secret=${
        gBaseConfig.clientSecret
      }&grant_type=authorization_code&code=${
        payload.code
      }&redirect_uri=https://oauth.cnblogs.com/auth/callback`,
      callback: payload.callback,
    }),
  );
}

export function* userLogin(action) {
  yield* invokeCommonAPI({
    method: API.login.userLogin,
    action: action,
    showLoading: false,
    loadingTitle: '登录中...',
    resolveResult: result => {
      return {
        ...result.result,
        create_time: moment().format('YYYY-MM-DD HH:mm:ss'),
      };
    },
    successAction: function*(action, payload) {
      //登录成功后，跳转到主界面
      // yield call(resetTo,{
      //     payload: {
      //         routeName: 'YZTabBarView'
      //     }
      // });
      const {
        meta: {
          parData: {callback},
        },
      } = action;
      callback && callback();
      NavigationHelper.goBack();
      gStorage.save('loginInfo', payload);
      //获取用户信息
      yield fork(
        getUserInfo,
        createSagaAction(actionTypes.LOGIN_GET_USER_INFO, undefined),
      );
    },
  });
}

export function* refreshToken(action) {
  yield* invokeCommonAPI({
    method: API.login.refreshToken,
    action: action,
    showLoading: false,
    resolveResult: result => {
      return {
        ...result.result,
        create_time: moment().format('YYYY-MM-DD HH:mm:ss'),
      };
    },
    successAction: function*(action, payload) {
      //refresh_token刷新后，前面的refresh_token会失效，需要重新保存
      gStorage.save('loginInfo', payload);
    },
  });
}

export function* getUserInfo(action) {
  yield* invokeCommonAPI({
    method: API.login.getUserInfo,
    action: action,
    showLoading: false,
    successAction: function*(action, payload) {},
  });
}

export function* logout(action) {
  const {
    payload: {successAction},
  } = action;
  //清除本地存储
  yield gStorage.remove('loginInfo');
  yield put({
    type: actionTypes.LOGIN_LOGOUT,
  });
  yield call(showToast, {
    type: '',
    payload: {
      message: '退出成功!',
    },
  });
  successAction && successAction();
}

export function* watchLoginIndex() {
  yield all([
    takeOrCancel(actionTypes.LOGIN_GET_TOKEN, '', getToken),
    takeOrCancel(actionTypes.LOGIN_SET_LOGIN_CODE, '', setLoginCode),
    takeOrCancel(actionTypes.LOGIN_USERLOGIN, '', userLogin),
    takeOrCancel(actionTypes.LOGIN_REFRESH_TOKEN, '', refreshToken),
    takeOrCancel(actionTypes.LOGIN_GET_USER_INFO, '', getUserInfo),
    takeOrCancel(actionTypes.LOGIN_LOGOUT, '', logout),
  ]);
}
