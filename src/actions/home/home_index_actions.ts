import * as types from '../actionTypes';
import {createSagaAction, createAction} from '../../utils/reduxUtils';

export const searchData = data => {
  return createSagaAction(types.HOME_SEARCH_GET_LIST, data);
};

export const clearSearchData = data => {
  return createSagaAction(types.HOME_SEARCH_CLEAR_LIST, data);
};

export const getDetail = data => {
  return createSagaAction(types.HOME_GET_DETAIL, data);
};

export const clearDetail = data => {
  return createSagaAction(types.HOME_CLEAR_DETAIL, data);
};

export const setDetail = data => {
  return {
    type: types.HOME_SET_DETAIL,
    payload: {
      result: data,
    },
  };
};

//刷新所有涉及到stringUtils.formatDate调用的数据
export const refreshDataTime = data => {
  return createAction(types.HOME_REFRESH_DATA_TIME, () => data, null);
};
