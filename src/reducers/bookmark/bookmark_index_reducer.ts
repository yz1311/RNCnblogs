import * as actionTypes from '../../actions/actionTypes';
import {
  handleActions,
  actionToResult,
} from '../../utils/reduxUtils';
import StringUtils from '../../utils/stringUtils';
import {createReducerResult} from "../../utils/requestUtils";

export interface State {
  bookmarkList: Array<any>;
  getBookmarkListResult: any;
  bookmarkList_noMore: boolean;
  //所有详情页面的isFav属性，退出每个详情页面的时候应该重置
  isFav: boolean;
  getIsFavResult: any;
}

const initialState: State = {
  bookmarkList: [],
  getBookmarkListResult: createReducerResult(),
  bookmarkList_noMore: false,
  //所有详情页面的isFav属性，退出每个详情页面的时候应该重置
  isFav: false,
  getIsFavResult: createReducerResult(),
};

export default handleActions(
  {
    [actionTypes.BOOKMARK_GET_LIST]: (state: State, action) => {
      const {type, payload, meta} = action;
      if (!action.error) {
        const {
          request: {pageIndex, pageSize},
        } = meta.parData;
        state.bookmarkList = state.bookmarkList
          .slice(0, (pageIndex - 1) * pageSize)
          .concat(payload.result);
        state.bookmarkList_noMore =
          (payload.result || []).length === 0 ||
          (payload.result || []).length < pageSize;
      }
      state.getBookmarkListResult = actionToResult(
        action,
        null,
        state.bookmarkList,
      );
    },
    [actionTypes.BOOKMARK_CLEAR_LIST]: (state: State, action) => {
      state.bookmarkList = initialState.bookmarkList;
      state.getBookmarkListResult = initialState.getBookmarkListResult;
      state.bookmarkList_noMore = initialState.bookmarkList_noMore;
    },
    [actionTypes.BOOKMARK_SET_IS_FAV]: (state: State, action) => {
      const {payload} = action;
      if (!action.error) {
        state.isFav = payload.result;
      }
      state.getIsFavResult = actionToResult(action);
    },
    [actionTypes.BOOKMARK_CLEAR_IS_FAV]: (state: State, action) => {
      state.isFav = initialState.isFav;
      state.getIsFavResult = initialState.getIsFavResult;
    },
    [actionTypes.BOOKMARK_CHECK_IS]: (state: State, action) => {
      const {payload} = action;
      if (!action.error) {
        state.isFav = payload.result;
      }
      state.getIsFavResult = actionToResult(action);
    },
    [actionTypes.HOME_REFRESH_DATA_TIME]: (state: State, action) => {
      for (let item of state.bookmarkList) {
        item.postDateDesc = StringUtils.formatDate(item.DateAdded);
      }
    },
  },
  initialState,
);
