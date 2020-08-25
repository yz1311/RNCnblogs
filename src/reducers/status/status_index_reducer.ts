import * as actionTypes from '../../actions/actionTypes';
import {
  handleActions,
  actionToResult,
} from '../../utils/reduxUtils';
import StringUtils from '../../utils/stringUtils';
import {createReducerResult} from "../../utils/requestUtils";

export interface State {
  all: any;
  following: any;
  my: any;
  mycomment: any;
  recentcomment: any;
  mention: any;
  comment: any;
  statusDetail: any;
  getStatusDetailResult: any;

  statusCommentList: Array<any>;
  getStatusCommentListResult: any;
}

const initialState: State = {
  //全站
  all: {
    list: [],
    noMore: false,
    loadDataResult: createReducerResult(),
  },
  //关注
  following: {
    list: [],
    noMore: false,
    loadDataResult: createReducerResult(),
  },
  //我的
  my: {
    list: [],
    noMore: false,
    loadDataResult: createReducerResult(),
  },
  //我回应的
  mycomment: {
    list: [],
    noMore: false,
    loadDataResult: createReducerResult(),
  },
  //新回应
  recentcomment: {
    list: [],
    noMore: false,
    loadDataResult: createReducerResult(),
  },
  //提到我
  mention: {
    list: [],
    noMore: false,
    loadDataResult: createReducerResult(),
  },
  //回复我
  comment: {
    list: [],
    noMore: false,
    loadDataResult: createReducerResult(),
  },

  statusDetail: {},
  getStatusDetailResult: createReducerResult(),

  statusCommentList: [],
  getStatusCommentListResult: createReducerResult(),
};

const statusTypes = [
  'all',
  'following',
  'my',
  'mycomment',
  'recentcomment',
  'mention',
  'comment',
];

export default handleActions(
  {
    [actionTypes.STATUS_GET_LIST]: (state: State, action) => {
      const {payload, meta} = action;
      const {
        request: {pageIndex, pageSize, type},
      } = meta.parData;
      if (!action.error) {
        if (pageIndex === 1) {
          state[type].list = payload.result;
        } else {
          state[type].list = state[type].list
            .slice(0, (pageIndex - 1) * pageSize)
            .concat(payload.result);
        }
        state[type].noMore =
          (payload.result || []).length === 0 ||
          (payload.result || []).length < pageSize;
      }
      if (pageIndex > 1) {
        action.error = undefined;
      }
      state[type].loadDataResult = actionToResult(
        action,
        null,
        state[type].list,
      );
    },
    [actionTypes.STATUS_CLEAR_LIST]: (state: State, action) => {
      const {payload} = action;
      let type = '';
      if (payload) {
        type = payload.type;
      }
      state[type] = initialState[type];
    },
    [actionTypes.STATUS_GET_DETAIL]: (state: State, action) => {
      const {payload} = action;
      if (!action.error) {
        state.statusDetail = payload.result;
      }
      state.getStatusDetailResult = actionToResult(action);
    },
    [actionTypes.STATUS_CLEAR_DETAIL]: (state: State, action) => {
      state.statusDetail = initialState.statusDetail;
      state.getStatusDetailResult = initialState.getStatusDetailResult;
    },
    [actionTypes.STATUS_GET_COMMENT_LIST]: (state: State, action) => {
      const {payload} = action;
      if (!action.error) {
        state.statusCommentList = payload.result;
      }
      state.getStatusCommentListResult = actionToResult(action);
    },
    [actionTypes.STATUS_CLEAR_COMMENT_LIST]: (state: State, action) => {
      state.statusCommentList = initialState.statusCommentList;
      state.getStatusCommentListResult =
        initialState.getStatusCommentListResult;
    },
    [actionTypes.STATUS_DELETE_STATUS]: (state: State, action) => {
      if (!action.error) {
        const {statusId} = action.meta.parData.request;
        //移除所有列表涉及到的该项
        for (let type of statusTypes) {
          state[type].list = state[type].list.filter(x => x.Id !== statusId);
          state[type].loadDataResult = actionToResult(
            action,
            null,
            state[type].list,
          );
        }
      }
    },
    [actionTypes.HOME_REFRESH_DATA_TIME]: (state: State, action) => {
      for (let type of statusTypes) {
        for (let blog of state[type].list) {
          blog.postDateDesc = StringUtils.formatDate(blog.DateAdded);
        }
      }
    },
  },
  initialState,
);
