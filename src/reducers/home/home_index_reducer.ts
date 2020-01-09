import * as actionTypes from '../../actions/actionTypes';
import {
  handleActions,
  createReducerResult,
  actionToResult,
  reducerModel,
} from '../../utils/reduxUtils';

export interface State {
  blog: reducerModel<any>;
  news: reducerModel<any>;
  question: reducerModel<any>;
  kb: reducerModel<any>;
}

const initialState: State = {
  blog: {
    list: [],
    noMore: false,
    loadDataResult: createReducerResult(),
  },
  news: {
    list: [],
    noMore: false,
    loadDataResult: createReducerResult(),
  },
  question: {
    list: [],
    noMore: false,
    loadDataResult: createReducerResult(),
  },
  kb: {
    list: [],
    noMore: false,
    loadDataResult: createReducerResult(),
  },
};

export default handleActions(
  {
    [actionTypes.HOME_SEARCH_GET_LIST]: (state: State, action) => {
      const {payload, meta} = action;
      const {
        request: {pageIndex, pageSize, category: type},
      } = meta.parData;
      if (state.hasOwnProperty(type)) {
        if (!action.error) {
          state[type].list = state[type].list
            .slice(0, (pageIndex - 1) * pageSize)
            .concat(payload.result);
          state[type].noMore =
            (payload.result || []).length === 0 ||
            payload.result.length < pageSize;
        }
        state[type].loadDataResult = actionToResult(
          action,
          null,
          state[type].list,
        );
      }
    },
    [actionTypes.HOME_SEARCH_CLEAR_LIST]: (state: State, action) => {
      state['blog'] = initialState['blog'];
      state['news'] = initialState['news'];
      state['question'] = initialState['question'];
      state['kb'] = initialState['kb'];
    },
  },
  initialState,
);
