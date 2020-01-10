
import {DrawerActions} from "react-navigation";
import ToastUtils from "../utils/toastUtils";

import {put} from "redux-saga/effects";
import {Action} from "redux-actions";
import _buffer from 'buffer';
import {Api} from "../api";
import {userInfoModel} from "../api/login";
import Model from 'dva-core';

export interface IState {
    isLogin: boolean;
    loginCode: string;
    token: string;
    expiresIn: number;
    tokenType: string;
    refreshToken: string;
    userInfo: Partial<userInfoModel>;
}

const initialState:IState = {
    isLogin: false,
    loginCode: '',
    token: '',
    expiresIn: 0,
    tokenType: '',
    refreshToken: '',
    userInfo: {},
};

export default {
    namespace: 'loginIndex',
    state: initialState,
    reducers: {
        setUserLogin: (state:IState, action:Action<any>) => {
            const {type, payload} = action;
            if (!action.error) {
                state.isLogin = true;
                state.token = payload.result.access_token;
                state.expiresIn = payload.result.expires_in;
                state.tokenType = payload.result.token_type;
                state.refreshToken = payload.result.refresh_token;
                gUserData.token = state.token;
            }
        },
        setLogout: (state:IState, action) => {
            state = initialState;
        },
        setUserInfo: (state:IState, action) => {
            const {userInfo} = action.payload;
            state.userInfo = userInfo;
        },
    },
    effects: {
        * userLogin(action, effects) {
            ToastUtils.showLoading();
            try {
                let response = yield Api.login.userLogin(action.payload);
                const parData = action.payload;
                gStorage.save(gStorageKeys.ServerPath,parData.request.serverPath);
                yield effects.put({
                    type: 'setUserLogin',
                    payload: {
                        token: response.data.results.tokens
                    }
                });
                yield effects.put({
                    type: 'getUserInfo',
                    payload: {

                    }
                });
                NavigationHelper.replace('HomeIndex');
            } catch (e) {

            } finally {
                ToastUtils.hideLoading();
            }
        },
        * getUserInfo(action, effects) {
            console.log('getUserInfo ----------')
            let userInfo:Partial<userInfoModel> = {};
            //首先获取userId
            try {
                let response = yield Api.login.getUserAlias({
                    request: {}
                });
                let userId = response.data;
                userInfo.id = userId as any;
                //继续获取用户详情
                let userInfoResponse = yield Api.profile.getPersonInfo({
                    request: {
                        userAlias: userId
                    }
                });
                userInfo = {
                    ...userInfo,
                    ...userInfoResponse.data
                };
                let signature = '';
                try {
                    //继续获取签名
                    let signature = yield Api.profile.getPersonSignature({
                        request: {
                            userAlias: userId
                        }
                    });
                    userInfo.signature = signature.data;
                } catch (e) {

                }
                gStorage.save(gStorageKeys.CurrentUser,userInfo);
                yield effects.put({
                    type: 'setUserInfo',
                    payload: {
                        userInfo: userInfo
                    }
                });
            } catch (e) {

            } finally {

            }
        },
        * logout(action, effects) {
            yield effects.put({
                type: 'setLogout',
                payload: {

                }
            });
            yield gStorage.remove('token');
            ToastUtils.showToast('退出成功!');
            NavigationHelper.resetTo('LoginIndex');
        },
    }
} as Model;
