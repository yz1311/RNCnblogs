import React, {Component} from 'react';
import {DeviceEventEmitter} from 'react-native';
import {
  takeEvery,
  takeLatest,
  put,
  all,
  call,
  fork,
  select,
} from 'redux-saga/effects';
import * as actionTypes from '../../actions/actionTypes';
import {
  createSagaAction,
  removePendingSuffix,
  invokeCommonAPI,
  takeOrCancel,
  takeEveryOrCancel,
  addPendingSuffix,
} from '../../utils/reduxUtils';
import API from '../../api';
import {checkIsBookmark} from '../bookmark/bookmark_index_sagas';
import {showToast} from '../app_sagas';
import Toastutils from '../../utils/toastUtils';
import html2markdown from 'html2markdown';
import StringUtils from '../../utils/stringUtils';
import {ReduxState} from '../../reducers';
import {saveUserInfoToLocal} from '../home/home_index_sagas';

export function* getQuestionDetail(action) {
  const {url, request} = action.payload;
  const isLogin = yield select((state: ReduxState) => state.loginIndex.isLogin);
  //收藏接口客户端模式无法调用
  if (isLogin) {
    yield fork(function*() {
      let checkAction = yield call(
        checkIsBookmark,
        createSagaAction(actionTypes.BOOKMARK_CHECK_IS, {
          request: {
            //这个接口url返回的是http协议，影响检查是否收藏接口(收藏的链接都是https),所以这个同意改为https
            url: url,
          },
          showLoading: false,
        }),
      );
      yield put({
        ...checkAction,
        type: actionTypes.BOOKMARK_SET_IS_FAV,
      });
    });
  }
  yield* invokeCommonAPI({
    method: API.question.getQuestionDetail,
    action: action,
    showLoading: false,
    resolveResult: result => {
      //拼接新闻网址
      result = {
        ...result.result,
        Url: `https://q.cnblogs.com/q/${result.result.Qid}`,
        postDateDesc: StringUtils.formatDate(result.result.DateAdded),
      };
      //有部分内容依旧是html
      try {
        result.Content = html2markdown(result.Content);
      } catch (e) {
        console.log('parse failed');
      }
      //获取图片
      result.imgList = gUtils.string.getMarkdownImgUrls(result.Content);
      return result;
    },
    successAction: function*(action, payload) {
      yield fork(
        getQuestionAnswerList,
        createSagaAction(actionTypes.QUESTION_GET_ANSWER_LIST, {
          request: {
            id: action.meta.parData.request.id,
          },
        }),
      );
    },
  });
}

export function* getQuestionCommentList(action) {
  return yield* invokeCommonAPI({
    method: API.question.getQuestionCommentList,
    action: action,
    showLoading: false,
    resolveResult: result => {
      //为了刷新时间不必刷新整个列表，新增一个显示字段
      result = result.result.map(x => ({
        ...x,
        postDateDesc: StringUtils.formatDate(x.PostDate),
      }));
      return result;
    },
    successAction: function*(action, payload) {},
  });
}

export function* getQuestionAnswerList(action) {
  return yield* invokeCommonAPI({
    method: API.question.getQuestionAnswerList,
    action: action,
    showLoading: false,
    resolveResult: result => {
      //拼接新闻网址
      result = (result.result || []).map(x => {
        let parsed = {
          ...x,
          postDateDesc: StringUtils.formatDate(x.DateAdded),
        };
        //有部分内容依旧是html
        try {
          parsed.Answer = html2markdown(parsed.Answer);
        } catch (e) {
          console.log('parse failed');
        }
        //获取图片
        result.imgList = gUtils.string.getMarkdownImgUrls(parsed.Answer);
        return parsed;
      });

      return result;
    },
    successAction: function*(action, payload) {
      let userInfoList = [];
      for (let item of payload) {
        if (item.AnswerUserInfo) {
          userInfoList.push({
            id: item.AnswerUserInfo.UserID + '',
            alias: item.AnswerUserInfo.Alias,
            displayName: item.AnswerUserInfo.UserName,
            //IconName为相对路径
            iconUrl:
              'https://pic.cnblogs.com/face/' + item.AnswerUserInfo.IconName,
          });
        }
      }

      yield fork(saveUserInfoToLocal, action, userInfoList);
    },
  });
}

export function* answerQuestion(action) {
  return yield* invokeCommonAPI({
    method: API.question.answerQuestion,
    action: action,
    successAction: function*(action, payload) {
      //刷新详情
      DeviceEventEmitter.emit('reload_question_detail');
    },
    failAction: function*(action, error) {
      yield call(showToast, {
        type: '',
        payload: {
          message: error.message,
          type: Toastutils.types.error,
        },
      });
    },
  });
}

export function* deleteQuestionAnswer(action) {
  return yield* invokeCommonAPI({
    method: API.question.deleteQuestionAnswer,
    action: action,
    successAction: function*(action, payload) {
      //刷新详情
      DeviceEventEmitter.emit('reload_question_detail');
    },
  });
}

export function* modifyQuestionAnswer(action) {
  return yield* invokeCommonAPI({
    method: API.question.modifyQuestionAnswer,
    action: action,
    successAction: function*(action, payload) {
      //刷新详情
      DeviceEventEmitter.emit('reload_question_detail');
    },
  });
}

export function* getAnswerCommentList(action) {
  return yield* invokeCommonAPI({
    method: API.question.getAnswerCommentList,
    action: action,
    showLoading: false,
    resolveResult: result => {
      //要重新计算楼层，返回的数据的Floor都只是本页的序号
      result = (result.result || []).map((x, xIndex) => ({
        ...x,
        Floor: xIndex + 1,
      }));
      return result;
    },
    successAction: function*(action, payload) {},
  });
}

export function* commentAswer(action) {
  return yield* invokeCommonAPI({
    method: API.question.commentAswer,
    action: action,
    successAction: function*(action, payload) {},
  });
}

export function* deleteAnswerComment(action) {
  return yield* invokeCommonAPI({
    method: API.question.deleteAnswerComment,
    action: action,
    successAction: function*(action, payload) {},
  });
}

export function* modifyAnswerComment(action) {
  return yield* invokeCommonAPI({
    method: API.question.modifyAnswerComment,
    action: action,
    successAction: function*(action, payload) {},
  });
}

export function* addQuestion(action) {
  return yield* invokeCommonAPI({
    method: API.question.addQuestion,
    action: action,
    successAction: function*(action, payload) {},
  });
}

export function* watchQuestionDetail() {
  yield all([
    takeOrCancel(
      actionTypes.QUESTION_GET_DETAIL,
      actionTypes.QUESTION_CLEAR_DETAIL,
      getQuestionDetail,
    ),
    takeOrCancel(
      actionTypes.QUESTION_GET_COMMENT_LIST,
      actionTypes.QUESTION_CLEAR_COMMENT_LIST,
      getQuestionCommentList,
    ),
    takeOrCancel(
      actionTypes.QUESTION_GET_ANSWER_LIST,
      actionTypes.QUESTION_CLEAR_ANSWER_LIST,
      getQuestionAnswerList,
    ),
    takeOrCancel(actionTypes.QUESTION_ANSWER, '', answerQuestion),
    takeOrCancel(actionTypes.QUESTION_DELETE_ANSWER, '', deleteQuestionAnswer),
    takeOrCancel(actionTypes.QUESTION_MODIFY_ANSWER, '', modifyQuestionAnswer),
    takeOrCancel(
      actionTypes.QUESTION_GET_ANSWER_COMMENT_LIST,
      actionTypes.QUESTION_CLEAR_ANSWER_COMMENT_LIST,
      getAnswerCommentList,
    ),
    takeOrCancel(actionTypes.QUESTION_COMMENT_ANSWER, '', commentAswer),
    takeOrCancel(
      actionTypes.QUESTION_DELETE_COMMENT_ANSWER,
      '',
      deleteAnswerComment,
    ),
    takeOrCancel(
      actionTypes.QUESTION_MODIFY_COMMENT_ANSWER,
      '',
      modifyAnswerComment,
    ),
    takeOrCancel(actionTypes.QUESTION_ADD_QUESTION, '', addQuestion),
  ]);
}
