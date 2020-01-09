import * as actionTypes from '../../actions/actionTypes';
import {
  actionToResult,
  handleActions,
  createReducerResult,
} from '../../utils/reduxUtils';
import StringUtils from '../../utils/stringUtils';

export interface State {
  kbList: Array<any>;
  kbList_noMore: boolean;
  getKbListResult: any;
  kbDetail: any;
  getKbDetailResult: any;
}

const initialState: State = {
  kbList: [],
  kbList_noMore: false,
  getKbListResult: createReducerResult(),
  kbDetail: {},
  getKbDetailResult: createReducerResult(),
};

export default handleActions(
  {
    [actionTypes.KNOWLEDGEBASE_GET_IST]: (state: State, action) => {
      const {type, payload, meta} = action;
      if (!action.error) {
        const {
          request: {pageIndex, pageSize},
        } = meta.parData;
        state.kbList = state.kbList
          .slice(0, (pageIndex - 1) * pageSize)
          .concat(payload.result);
        state.kbList_noMore =
          (payload.result || []).length === 0 ||
          (payload.result || []).length < pageSize;
      }
      state.getKbListResult = actionToResult(action, null, state.kbList);
    },
    [actionTypes.KNOWLEDGEBASE_CLEAR_IST]: (state: State, action) => {
      state.kbList = initialState.kbList;
      state.kbList_noMore = initialState.kbList_noMore;
      state.getKbListResult = initialState.getKbListResult;
    },
    [actionTypes.KNOWLEDGEBASE_GET_DETAIL]: (state: State, action) => {
      const {type, payload, meta} = action;
      if (!action.error) {
        state.kbDetail = payload.result;
      }
      state.getKbDetailResult = actionToResult(action);
    },
    [actionTypes.KNOWLEDGEBASE_CLEAR_IST]: (state: State, action) => {
      state.kbDetail = initialState.kbDetail;
      state.getKbDetailResult = initialState.getKbDetailResult;
    },
    [actionTypes.HOME_REFRESH_DATA_TIME]: (state: State, action) => {
      for (let blog of state.kbList) {
        blog.postDateDesc = StringUtils.formatDate(blog.DateAdded);
      }
    },
  },
  initialState,
);
