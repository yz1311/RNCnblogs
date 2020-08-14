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
  sagaActionToAction,
  addPendingSuffix,
  SagaAction,
} from '../../utils/reduxUtils';
import API from '../../api';
import moment from 'moment';
import {showToast} from '../app_sagas';
import Toastutils from '../../utils/toastUtils';
import StringUtils from '../../utils/stringUtils';
import {
  getLocalBlogListByPage,
  saveBlogListToLocal,
} from '../blog/blog_index_sagas';
import {ReduxState} from '../../reducers';
import {getUserAliasByUserNameRequest} from '../../api/profile';
import {StyleSheet} from 'react-native';
import flatten = StyleSheet.flatten;
import {saveUserInfoToLocal} from '../home/home_index_sagas';

export function* getPersonInfo(action) {
  // let resultArr = [];
  // try {
  //     resultArr = yield all([
  //         call(API.profile.getPersonInfo, action.payload || {}),
  //         call(API.profile.getPersonSignature, action.payload || {}),
  //     ]);
  //     console.log(resultArr)
  //     //解析结果
  //     // action.error = true;
  //     // yield put(sagaActionToAction(action));
  // }
  // catch (e) {
  //     action.error = true;
  //     yield put(sagaActionToAction(action));
  // }
  //不存在，则报404错误
  yield call(getPersonSignature, {
    ...action,
    payload: {
      //不要传递回调函数
      request: (action.payload || {}).request,
      showErrorToast: false,
    },
    type: addPendingSuffix(actionTypes.PROFILE_GET_PERSON_SIGNATURE),
  });
  //下面这个不存在，则返回空字符串
  yield* invokeCommonAPI({
    method: API.profile.getPersonInfo,
    action: action,
    showErrorToast: false,
    resolveResult: result => {
      console.log(result);
      if (!result.result) {
        throw Error('该用户暂时没有博客！');
      }
      let age = '',
        follows = 0,
        stars = 0,
        nickName = '';
      let matches = result.result.match(/园龄：[\s\S]+?>[\s\S]+?<\//);
      if (matches && matches.length > 0) {
        let temp = matches[0].replace('</', '');
        age = temp
          .substr(temp.lastIndexOf('>'))
          .replace('>', '')
          .replace('"', '')
          .trim();
      }
      matches = result.result.match(/粉丝：[\s\S]+?>[\s\S]+?<\//);
      if (matches && matches.length > 0) {
        let temp = matches[0].replace('</', '');
        follows = temp
          .substr(temp.lastIndexOf('>'))
          .replace('>', '')
          .replace('"', '')
          .trim();
      }
      matches = result.result.match(/关注：[\s\S]+?>[\s\S]+?<\//);
      if (matches && matches.length > 0) {
        let temp = matches[0].replace('</', '');
        stars = temp
          .substr(temp.lastIndexOf('>'))
          .replace('>', '')
          .replace('"', '')
          .trim();
      }
      matches = result.result.match(/昵称：[\s\S]+?>[\s\S]+?<\//);
      if (matches && matches.length > 0) {
        let temp = matches[0].replace('</', '');
        nickName = temp
          .substr(temp.lastIndexOf('>'))
          .replace('>', '')
          .replace('"', '')
          .trim();
      }
      return {
        age: age,
        follows,
        stars,
        nickName,
      };
    },
    successAction: function*(action, payload) {},
  });
}

export function* getPersonSignature(action) {
  yield* invokeCommonAPI({
    method: API.profile.getPersonSignature,
    action: action,
    resolveResult: result => {
      let matches = result.result.match(
        /class="headermaintitle"[\s\S]+?>[\s\S]+?<\/h2/,
      );
      if (matches && matches.length > 0) {
        matches = matches[0].match(/<h2>[\s\S]+?<\/h2/);
      }
      if (matches && matches.length > 0) {
        let temp = matches[0].replace('<h2>', '').replace('</h2', '');
        return temp;
      }
      return '';
    },
    successAction: function*(action, payload) {},
  });
}

export function* getUserAliasByUserName(
  action: SagaAction<getUserAliasByUserNameRequest>,
) {
  yield* invokeCommonAPI({
    method: API.profile.getUserAliasByUserName,
    action: action,
    resolveResult: result => {
      //该接口是模糊搜索，所以需要将结果手动进行手动筛选
      let matches = result.result.match(/entry>[\s\S]+?<\/entry/);
      let userList = [];
      if (matches && matches.length > 0) {
        for (let match of matches) {
          try {
            let temp = match.match(/title type="text">[\s\S]+?<\/title/);
            let userName = temp[0]
              .replace('title type="text">', '')
              .replace('</title', '');
            temp = match.match(/blogapp>[\s\S]+?<\/blogapp/);
            let userAlias = temp[0]
              .replace('blogapp>', '')
              .replace('</blogapp', '');
            temp = match.match(/>[\s\S]+?<\/avatar/);
            let userAvatar = '';
            if (temp && temp.length > 0) {
              userAvatar = temp[0].replace('>', '').replace('</avatar', '');
            }
            userList.push({
              alias: userAlias,
              displayName: userName,
              iconUrl:
                userAvatar || 'https://pic.cnblogs.com/face/sample_face.gif',
              id: action.meta.parData.request.userId + '',
            });
          } catch (e) {}
        }
      }
      console.log(userList);
      //精确搜索
      if (!action.meta.parData.request.fuzzy) {
        let filter = userList.filter(
          x => x.displayName === action.meta.parData.request.userName,
        );
        return filter.length > 0 ? filter[0] : null;
      }

      return userList;
    },
    successAction: function*(action, payload) {
      if (!Array.isArray(payload) && payload && payload.alias) {
        console.log(payload);
        yield fork(saveUserInfoToLocal, action, [payload]);
      }
    },
  });
}

export function* getPersonBlogList(action) {
  const isConnected = yield select(
    (state: ReduxState) => state.app.isConnected,
  );
  //则取本地数据
  if (!isConnected) {
    yield fork(getLocalBlogListByPage, action, 1);
    return;
  }
  yield* invokeCommonAPI({
    method: API.blog.getPersonalBlogList,
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
    successAction: function*(action, payload) {
      yield call(saveBlogListToLocal, action, payload, 1);
    },
  });
}

export function* watchProfileIndex() {
  yield all([
    takeOrCancel(
      actionTypes.PROFILE_GET_PERSON_INFO,
      actionTypes.PROFILE_CLEAR_PERSON_INFO,
      getPersonInfo,
    ),
    takeOrCancel(
      actionTypes.PROFILE_GET_PERSON_BLOG_LIST,
      actionTypes.PROFILE_CLEAR_PERSON_BLOG_LIST,
      getPersonBlogList,
    ),
    // takeOrCancel(actionTypes.PROFILE_GET_PERSON_SIGNATURE, '', getPersonSignature),
    takeOrCancel(
      actionTypes.PROFILE_GET_PERSON_ALIAS_BY_NAME,
      '',
      getUserAliasByUserName,
    ),
  ]);
}
