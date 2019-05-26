import {takeEvery, takeLatest, put, all, call, fork} from 'redux-saga/effects';
import * as actionTypes from '../../actions/actionTypes';
import {createSagaAction, removePendingSuffix, invokeCommonAPI, takeOrCancel} from "../../utils/reduxUtils";
import API from "../../api";
import {showToast} from '../app_sagas';
import {resetTo, goBack} from '../nav_sagas';
import Toastutils from  '../../utils/toastUtils'
import StringUtils from "../../utils/stringUtils";


export function* getBookmarkList(action) {
    yield* invokeCommonAPI({
        method: API.bookmark.getBookmarkList,
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

        }
    });
}

export function* deleteBookmark(action) {
    yield* invokeCommonAPI({
        method: API.bookmark.deleteBookmark,
        action: action,
        loadingTitle: '删除中...',
        successAction: function* (action, payload) {
            yield call(showToast,{
                type: '',
                payload: {
                    message: '删除成功!'
                }
            });
            //成功后，刷新列表
            yield fork(getBookmarkList,createSagaAction(actionTypes.BOOKMARK_GET_LIST,{
                request: {
                    pageIndex: 1,
                    pageSize: 10
                }
            }));
        }
    });
}

export function* deleteBookmarkByUrl(action) {
    yield* invokeCommonAPI({
        method: API.bookmark.deleteBookmarkByUrl,
        action: action,
        loadingTitle: '删除中...',
        successAction: function* (action, payload) {
            yield call(showToast,{
                type: '',
                payload: {
                    message: '删除成功!'
                }
            });
        }
    });
}

export function* addBookmark(action) {
    yield* invokeCommonAPI({
        method: API.bookmark.addBookmark,
        action: action,
        successAction: function* (action, payload) {

        }
    });
}

export function* modifyBookmark(action) {
    yield* invokeCommonAPI({
        method: API.bookmark.modifyBookmark,
        action: action,
        successAction: function* (action, payload) {
            yield call(showToast,{
                type: '',
                payload: {
                    message: '修改成功！',
                    type: Toastutils.types.success
                }
            });
            yield call(goBack);
        }
    });
}

export function* checkIsBookmark(action) {
    return yield* invokeCommonAPI({
        method: API.bookmark.checkIsBookmark,
        action: action,
        successAction: function* (action, payload) {

        }
    });
}

export function* watchBookmarkIndex() {
    yield all([
        takeOrCancel(actionTypes.BOOKMARK_GET_LIST, actionTypes.BOOKMARK_CLEAR_LIST, getBookmarkList),
        takeOrCancel(actionTypes.BOOKMARK_DELETE, '', deleteBookmark),
        takeOrCancel(actionTypes.BOOKMARK_DELETE_BYURL, '', deleteBookmarkByUrl),
        takeOrCancel(actionTypes.BOOKMARK_ADD, '', addBookmark),
        takeOrCancel(actionTypes.BOOKMARK_MODIFY, '', modifyBookmark),
        takeOrCancel(actionTypes.BOOKMARK_CHECK_IS, '', checkIsBookmark),
    ]);
}
