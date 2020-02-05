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
  sagaActionToAction,
} from '../../utils/reduxUtils';
import API from '../../api';
import {resetTo} from '../nav_sagas';
import {checkIsBookmark} from '../bookmark/bookmark_index_sagas';
import {showToast} from '../app_sagas';
import ToastUtils from '../../utils/toastUtils';
import StringUtils from '../../utils/stringUtils';
import ServiceUtils from '../../utils/serviceUtils';
// import Realm from 'realm';
const Realm = {};
import {tables, blogSchema} from '../../common/database';
import moment from 'moment';
import {ReduxState} from '../../reducers';
import {saveUserInfoToLocal} from '../home/home_index_sagas';

const ICON_REGEX = /face\/\d+?\//;

export function* getPersonalBlogList(action) {
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

export function* getPickedBlogList(action) {
  const isConnected = yield select(
    (state: ReduxState) => state.app.isConnected,
  );
  //则取本地数据
  if (!isConnected) {
    yield fork(getLocalBlogListByPage, action, 3);
    return;
  }
  yield* invokeCommonAPI({
    method: API.blog.getPickedBlogList,
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
      yield call(saveBlogListToLocal, action, payload, 3);
      let userInfoList = [];
      //根据地址截取userId
      //https://pic.cnblogs.com/face/1687889/20190514181658.png
      for (let blog of payload) {
        //有部分只是'https://'
        let userId = ServiceUtils.getUserIdFromAvatorUrl(blog.Avatar);
        if (userId) {
          userInfoList.push({
            id: userId,
            alias: blog.BlogApp,
            displayName: blog.Author,
            iconUrl: blog.Avatar,
          });
        }
      }

      yield fork(saveUserInfoToLocal, action, userInfoList);
    },
  });
}

export function* getHomeBlogList(action) {
  const isConnected = yield select(
    (state: ReduxState) => state.app.isConnected,
  );
  //则取本地数据
  if (!isConnected) {
    yield fork(getLocalBlogListByPage, action, 2);
    return;
  }
  yield* invokeCommonAPI({
    method: API.blog.getHomeBlogList,
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
      yield call(saveBlogListToLocal, action, payload, 2);
      let userInfoList = [];
      //根据地址截取userId
      //https://pic.cnblogs.com/face/1687889/20190514181658.png
      for (let blog of payload) {
        //有部分只是'https://'
        let userId = ServiceUtils.getUserIdFromAvatorUrl(blog.Avatar);
        if (userId) {
          userInfoList.push({
            id: userId,
            alias: blog.BlogApp,
            displayName: blog.Author,
            iconUrl: blog.Avatar,
          });
        }
      }

      yield fork(saveUserInfoToLocal, action, userInfoList);
    },
  });
}

export function* getFollowingBlogList(action) {
  const isConnected = yield select(
    (state: ReduxState) => state.app.isConnected,
  );
  //则取本地数据
  if (!isConnected) {
    yield fork(getLocalBlogListByPage, action, 4);
    return;
  }
  yield* invokeCommonAPI({
    method: API.blog.getFollowingBlogList,
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
      yield call(saveBlogListToLocal, action, payload, 4);
    },
  });
}

export const getLocalBlogListByPage = function*(action, blogType) {
  const {
    request: {pageIndex, pageSize},
  } = action.payload;
  let realm;
  try {
    realm = yield Realm.open({schema: [blogSchema]});
    let blogs = realm.objects(tables.blog);
    let curBlogs = blogs
      .filtered(`blogType = ${blogType}`)
      .sorted('postDate', true);
    let result = curBlogs.slice(
      (pageIndex - 1) * pageSize,
      pageIndex * pageSize,
    );
    yield put(
      sagaActionToAction(
        action,
        result.map(x => ({
          Id: x.id,
          Url: x.url,
          Author: x.author,
          Avatar: x.avator,
          BlogApp: x.blogApp,
          Title: x.title,
          Description: x.description,
          DiggCount: x.diggComment,
          CommentCount: x.commentCount,
          ViewCount: x.viewCount,
          PostDate: moment(x.postDate).format('YYYY-MM-DD HH:mm:ss'),
          postDateDesc: StringUtils.formatDate(x.postDate),
        })),
      ),
    );
  } catch (e) {
    console.log(e);
    action.error = true;
    yield put(sagaActionToAction(action, undefined));
  } finally {
    if (realm) {
      realm.close();
    }
  }
};

export const saveBlogListToLocal = function*(action, payload, blogType) {
  let realm;
  try {
    realm = yield Realm.open({schema: [blogSchema]});
    for (let obj of payload) {
      try {
        realm.write(() => {
          realm.create(tables.blog, {
            id: obj.Id + '',
            url: obj.Url,
            author: obj.Author,
            avator: obj.Avatar,
            blogApp: obj.BlogApp,
            title: obj.Title,
            description: obj.Description,
            diggComment: obj.DiggCount,
            commentCount: obj.CommentCount,
            viewCount: obj.ViewCount,
            postDate: moment(obj.PostDate).toDate(),
            blogType: blogType,
            fetchDate: new Date(),
          });
        });
        console.log('写入成功');
      } catch (ee) {
        console.log('写入失败');
      }
    }
  } catch (e) {
    console.log(e);
  } finally {
    if (realm) {
      realm.close();
    }
  }
};

export function* getBlogDetail(action) {
  const {url, item} = action.payload;
  //查询是否有详情数据，有则先返回
  let resultAction: any;
  let realm;
  try {
    realm = yield Realm.open({schema: [blogSchema]});
    let blogs = realm.objects(tables.blog);
    let curBlogs = blogs.filtered(`id = "${item.Id}"`);
    if (
      curBlogs != undefined &&
      curBlogs.length > 0 &&
      curBlogs[0].content != undefined
    ) {
      resultAction = sagaActionToAction(action, {
        body: curBlogs[0].content,
        imgList: gUtils.string.getImgUrls(curBlogs[0].content),
        scrollPosition: curBlogs[0].scrollPosition,
      });
      yield put(resultAction);
    }
  } catch (e) {
    console.log(e);
  } finally {
    if (realm) {
      realm.close();
    }
  }
  const isConnected = yield select(
    (state: ReduxState) => state.app.isConnected,
  );
  if (!isConnected && resultAction != null) {
    return;
  }
  const isLogin = yield select((state: ReduxState) => state.loginIndex.isLogin);
  //收藏接口客户端模式无法调用
  if (isLogin) {
    yield fork(function*() {
      let checkAction = yield call(
        checkIsBookmark,
        createSagaAction(actionTypes.BOOKMARK_CHECK_IS, {
          request: {
            //这个接口url返回的是http协议，影响检查是否收藏接口(收藏的链接都是https),所以这个同意改为https
            url: (url || '').replace('http:', 'https:'),
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
  //获取第一页评论列表
  yield fork(
    getBlogCommentList,
    createSagaAction(actionTypes.BLOG_GET_BLOG_COMMENT_LIST, {
      request: {
        blogApp: item.BlogApp,
        postId: item.Id,
        pageIndex: 1,
        pageSize: 10,
      },
    }),
  );
  yield* invokeCommonAPI({
    method: API.blog.getBlogDetail,
    action: action,
    showLoading: false,
    resolveResult: payload => {
      //去除最后的统计图片代码，因为会导致下面留下很大空白
      payload.result = payload.result.replace(
        /<img[\s\S]{1,10}:\/\/counter[\s\S]+?\/>/,
        '',
      );
      let result = {
        body: payload.result,
        imgList: gUtils.string.getImgUrls(payload.result),
        scrollPosition: 0,
      };
      //赋值scrollPosition
      if (resultAction != null) {
        result = {
          ...result,
          scrollPosition: resultAction.payload.result.scrollPosition,
        };
      }
      return result;
    },
    successAction: function*(action, payload) {
      //保存到本地
      let realm;
      try {
        realm = yield Realm.open({schema: [blogSchema]});
        let blogs = realm.objects(tables.blog);
        let curBlogs = blogs.filtered(`id = "${item.Id}"`);
        if (curBlogs != undefined && curBlogs.length > 0) {
          realm.write(() => {
            curBlogs[0].content = payload.body;
          });
        }
      } catch (e) {
        console.log(e);
      } finally {
        if (realm) {
          realm.close();
        }
      }
    },
  });
}

export function* getBlogCommentList(action) {
  yield* invokeCommonAPI({
    method: API.blog.getBlogCommentList,
    action: action,
    showLoading: false,
    resolveResult: result => {
      //要重新计算楼层，返回的数据的Floor都只是本页的序号
      //根据AuthorUrl截取userId
      result = (result.result || []).map((x, xIndex) => {
        let matches = (x.AuthorUrl || '').match(/u\/[\d]+\//);
        let userId = 0;
        if (matches != null && matches.length > 0) {
          userId = matches[0].replace(/u\//g, '').replace(/\//g, '');
        }
        return {
          ...x,
          UserId: userId,
        };
      });
      return result;
    },
    successAction: function*(action, payload) {},
  });
}

export function* commentBlog(action) {
  yield* invokeCommonAPI({
    method: API.blog.commentBlog,
    action: action,
    showLoading: true,
    successAction: function*(action, payload) {
      yield call(showToast, {
        type: '',
        payload: {
          message: '评论成功！',
          type: ToastUtils.types.success,
        },
      });
    },
  });
}

export function* setBlogScrollPosition(action) {
  const {id, value} = action.payload;
  let realm;
  try {
    realm = yield Realm.open({schema: [blogSchema]});
    let blogs = realm.objects(tables.blog);
    let curBlogs = blogs.filtered(`id = "${id}"`);
    if (curBlogs != undefined && curBlogs.length > 0) {
      realm.write(() => {
        console.log('set to ' + value);
        curBlogs[0].scrollPosition = value;
      });
    }
  } catch (e) {
    console.log(e);
  } finally {
    if (realm) {
      realm.close();
    }
  }
}

export function* watchBlogIndex() {
  yield all([
    takeOrCancel(
      actionTypes.BLOG_GET_PERSONAL_BLOGLIST,
      actionTypes.BLOG_CLEAR_PERSONAL_BLOGLIST,
      getPersonalBlogList,
    ),
    takeOrCancel(
      actionTypes.BLOG_GET_PICKED_BLOGLIST,
      actionTypes.BLOG_CLEAR_PICKED_BLOGLIST,
      getPickedBlogList,
    ),
    takeOrCancel(
      actionTypes.BLOG_GET_HOME_BLOGLIST,
      actionTypes.BLOG_CLEAR_HOME_BLOGLIST,
      getHomeBlogList,
    ),
    takeOrCancel(
      actionTypes.BLOG_GET_FOLLOWING_BLOGLIST,
      actionTypes.BLOG_CLEAR_FOLLOWING_BLOGLIST,
      getFollowingBlogList,
    ),
    takeOrCancel(
      actionTypes.BLOG_GET_DETAIL,
      actionTypes.BLOG_CLEAR_DETAIL,
      getBlogDetail,
    ),
    takeOrCancel(
      actionTypes.BLOG_GET_BLOG_COMMENT_LIST,
      actionTypes.BLOG_CLEAR_BLOG_COMMENT_LIST,
      getBlogCommentList,
    ),
    takeOrCancel(actionTypes.BLOG_COMMENT_BLOG, '', commentBlog),
    takeLatest(
      actionTypes.BLOG_SET_BLOG_SCROLL_POSITION,
      setBlogScrollPosition,
    ),
  ]);
}
