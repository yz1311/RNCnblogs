import {takeEvery, takeLatest, put, all, call, fork, select} from 'redux-saga/effects';
import * as actionTypes from '../../actions/actionTypes';
import {
    createSagaAction,
    removePendingSuffix,
    invokeCommonAPI,
    takeOrCancel,
    takeEveryOrCancel, sagaActionToAction
} from "../../utils/reduxUtils";
import API from "../../api";
import {checkIsBookmark} from "../bookmark/bookmark_index_sagas";
import StringUtils from "../../utils/stringUtils";
import {ReduxState} from "../../reducers";
import {saveUserInfoToLocal} from "../home/home_index_sagas";

const ICON_REGEX = /face\/\d+?\//;

export function* getStatusList(action) {
    yield* invokeCommonAPI({
        method: API.status.getStatusList,
        action: action,
        showLoading: false,
        resolveResult: (result)=>{
            //为了刷新时间不必刷新整个列表，新增一个显示字段
            result = result.result.map(x=>({
                ...x,
                postDateDesc: StringUtils.formatDate(x.DateAdded)
            }));
            return result;
        },
        successAction: function* (action, payload) {
            let userInfoList = [];
            for (let item of payload)
            {
                userInfoList.push({
                    id: item.UserId,
                    alias: item.UserAlias,
                    displayName: item.UserDisplayName,
                    iconUrl: item.UserIconUrl
                });
            }

            yield fork(saveUserInfoToLocal,action,userInfoList);
        }
    });
}


export function* getStatusDetail(action) {
    yield fork(getStatusCommentList,createSagaAction(actionTypes.STATUS_GET_COMMENT_LIST,{
        request: {
            id: action.payload.request.id
        }
    }));
    const isLogin = yield select((state: ReduxState)=>state.loginIndex.isLogin);
    //未登录调用详情会报错
    if(!isLogin) {
        yield put(sagaActionToAction(action, action.payload.item));
        return;
    }
    yield* invokeCommonAPI({
        method: API.status.getStatusDetail,
        action: action,
        showLoading: false,
        resolveResult: (result)=>{
            //为了刷新时间不必刷新整个列表，新增一个显示字段
            result = {
                ...result.result,
                postDateDesc: StringUtils.formatDate(result.result.DateAdded)
            };
            return result;
        },
        successAction: function* (action, payload) {
            // yield fork(getStatusCommentList,createSagaAction(actionTypes.STATUS_GET_COMMENT_LIST,{
            //     request: {
            //         id: action.meta.parData.request.id
            //     }
            // }));
        }
    });
}

export function* getStatusCommentList(action) {
    yield* invokeCommonAPI({
        method: API.status.getStatusCommentList,
        action: action,
        showLoading: false,
        resolveResult: (result)=> {
            result = (result.result || []).map((x,xIndex)=>({
                ...x,
                Floor: xIndex + 1
            }));
            return result;
        },
        successAction: function* (action, payload) {
            let userInfoList = [];
            //根据地址截取userId
            //https://pic.cnblogs.com/face/1687889/20190514181658.png
            for (let item of payload)
            {
                //有部分只是'https://'
                if(item.UserIconUrl&&item.UserIconUrl.length>10)
                {
                    let matches = item.UserIconUrl.match(ICON_REGEX);
                    if(matches && matches.length>0) {
                        userInfoList.push({
                            id: matches[0].replace('face','').replace(/\//g,''),
                            alias: item.UserAlias,
                            displayName: item.UserDisplayName,
                            iconUrl: item.UserIconUrl
                        });
                    }
                }
            }

            yield fork(saveUserInfoToLocal,action,userInfoList);
        }
    });
}

export function* commentStatus(action) {
    yield* invokeCommonAPI({
        method: API.status.commentStatus,
        action: action,
        successAction: function* (action, payload) {

        }
    });
}

export function* deleteStatusComment(action) {
    yield* invokeCommonAPI({
        method: API.status.deleteStatusComment,
        action: action,
        successAction: function* (action, payload) {

        }
    });
}

export function* deleteStatus(action) {
    yield* invokeCommonAPI({
        method: API.status.deleteStatus,
        action: action,
        successAction: function* (action, payload) {

        }
    });
}

export function* addStatus(action) {
    yield* invokeCommonAPI({
        method: API.status.addStatus,
        action: action,
        successAction: function* (action, payload) {

        }
    });
}

export function* watchStatusIndex() {
    yield all([
        takeEveryOrCancel(actionTypes.STATUS_GET_LIST, actionTypes.STATUS_CLEAR_LIST, getStatusList),
        takeOrCancel(actionTypes.STATUS_GET_DETAIL, actionTypes.STATUS_CLEAR_DETAIL, getStatusDetail),
        takeOrCancel(actionTypes.STATUS_GET_COMMENT_LIST, actionTypes.STATUS_CLEAR_COMMENT_LIST, getStatusCommentList),
        takeOrCancel(actionTypes.STATUS_COMMENT_STATUS, '', commentStatus),
        takeOrCancel(actionTypes.STATUS_DELETE_COMMENT, '', deleteStatusComment),
        takeOrCancel(actionTypes.STATUS_DELETE_STATUS, '', deleteStatus),
        takeOrCancel(actionTypes.STATUS_ADD_STATUS, '', addStatus),
    ]);
}
