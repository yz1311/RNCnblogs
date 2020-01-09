import {takeEvery, takeLatest, put, all, call, fork} from 'redux-saga/effects';
import * as actionTypes from '../../actions/actionTypes';
import {
  createSagaAction,
  removePendingSuffix,
  invokeCommonAPI,
  takeOrCancel,
  takeEveryOrCancel,
} from '../../utils/reduxUtils';
import API from '../../api';
import html2markdown from 'html2markdown';
import StringUtils from '../../utils/stringUtils';
import {showToast} from '../app_sagas';
import Toastutils from '../../utils/toastUtils';
import {saveUserInfoToLocal} from '../home/home_index_sagas';

export function* getQuestionList(action) {
  yield* invokeCommonAPI({
    method: API.question.getQuestionList,
    action: action,
    showLoading: false,
    resolveResult: result => {
      //拼接新闻网址
      result = (result.result || []).map(x => {
        let parsed = {
          ...x,
          Url: `https://q.cnblogs.com/q/${x.Qid}`,
          postDateDesc: StringUtils.formatDate(x.DateAdded),
        };
        //有部分内容依旧是html
        try {
          parsed.Content = html2markdown(parsed.Content);
        } catch (e) {}
        return parsed;
      });

      return result;
    },
    successAction: function*(action, payload) {
      let userInfoList = [];
      for (let item of payload) {
        if (item.QuestionUserInfo) {
          userInfoList.push({
            id: item.QuestionUserInfo.UserID + '',
            alias: item.QuestionUserInfo.Alias,
            displayName: item.QuestionUserInfo.UserName,
            iconUrl: item.QuestionUserInfo.Face,
          });
        }
      }

      yield fork(saveUserInfoToLocal, action, userInfoList);
    },
  });
}

export function* checkIsAnswered(action) {
  yield* invokeCommonAPI({
    method: API.question.checkIsAnswered,
    action: action,
    showLoading: false,
    successAction: function*(action, payload) {},
  });
}

export function* deleteQuestion(action) {
  yield* invokeCommonAPI({
    method: API.question.deleteQuestion,
    action: action,
    showLoading: false,
    successAction: function*(action, payload) {
      yield call(showToast, {
        type: '',
        payload: {
          message: '删除成功!',
          type: Toastutils.types.success,
        },
      });
    },
  });
}

export function* modifyQuestion(action) {
  yield* invokeCommonAPI({
    method: API.question.modifyQuestion,
    action: action,
    showLoading: false,
    successAction: function*(action, payload) {},
  });
}

export function* watchQuestionIndex() {
  yield all([
    takeEveryOrCancel(
      actionTypes.QUESTION_GET_LIST,
      actionTypes.QUESTION_CLEAR_LIST,
      getQuestionList,
    ),
    takeOrCancel(actionTypes.QUESTION_CHECK_IS_ANSWERED, '', checkIsAnswered),
    takeOrCancel(actionTypes.QUESTION_DELETE_QUESTION, '', deleteQuestion),
    takeOrCancel(actionTypes.QUESTION_MODIFY_QUESTION, '', modifyQuestion),
  ]);
}
