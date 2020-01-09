import * as actionTypes from '../actionTypes';
import {createSagaAction} from '../../utils/reduxUtils';

export const getBookmarkList = data => {
  return createSagaAction(actionTypes.BOOKMARK_GET_LIST, data);
};

export const clearBookmarkList = data => {
  return createSagaAction(actionTypes.BOOKMARK_CLEAR_LIST, data);
};

export const deleteBookmark = data => {
  return createSagaAction(actionTypes.BOOKMARK_DELETE, data);
};

export const deleteBookmarkByUrl = data => {
  return createSagaAction(actionTypes.BOOKMARK_DELETE_BYURL, data);
};

export const addBookmark = data => {
  return createSagaAction(actionTypes.BOOKMARK_ADD, data);
};

export const modifyBookmark = data => {
  return createSagaAction(actionTypes.BOOKMARK_MODIFY, data);
};

export const checkIsBookmark = data => {
  return createSagaAction(actionTypes.BOOKMARK_CHECK_IS, data);
};

export const setBlogIsFav = data => {
  return {
    type: actionTypes.BOOKMARK_SET_IS_FAV,
    payload: {
      result: data,
    },
  };
};

export const clearBlogIsFav = data => {
  return {
    type: actionTypes.BOOKMARK_CLEAR_IS_FAV,
  };
};
