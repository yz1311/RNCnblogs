import * as actionTypes from '../actionTypes';
import {createSagaAction} from '../../utils/reduxUtils';

export const getNewsList = data => {
  return createSagaAction(actionTypes.NEWS_GET_LIST, data);
};

export const clearNewsList = data => {
  return createSagaAction(actionTypes.NEWS_CLEAR_LIST, data);
};

export const getHowWeekNewsList = data => {
  return createSagaAction(actionTypes.NEWS_GET_HOT_WREEK_LIST, data);
};

export const clearHowWeekNewsList = data => {
  return createSagaAction(actionTypes.NEWS_CLEAR_HOT_WREEK_LIST, data);
};

export const getRecommendedNewsList = data => {
  return createSagaAction(actionTypes.NEWS_GET_RECOMMENDED_NEWS_LIST, data);
};

export const clearRecommendedNewsList = data => {
  return createSagaAction(actionTypes.NEWS_CLEAR_RECOMMENDED_NEWS_LIST, data);
};

export const setSelectedDetail = data => {
  return {
    type: actionTypes.NEWS_SET_SELECTED_DETAIL,
    payload: data,
  };
};

export const getNewsDetail = data => {
  return createSagaAction(actionTypes.NEWS_GET_DETAIL, data);
};

export const clearNewsDetail = data => {
  return createSagaAction(actionTypes.NEWS_CLEAR_DETAIL, data);
};

export const commentNews = data => {
  return createSagaAction(actionTypes.NEWS_COMMENT, data);
};

export const getNewsCommentList = data => {
  return createSagaAction(actionTypes.NEWS_GET_COMMENT_LIST, data);
};

export const clearNewsCommentList = data => {
  return createSagaAction(actionTypes.NEWS_CLEAR_COMMENT_LIST, data);
};

export const deleteNewsComment = data => {
  return createSagaAction(actionTypes.NEWS_COMMENT_DELETE, data);
};

export const modifyNewsComment = data => {
  return createSagaAction(actionTypes.NEWS_COMMENT_MODIFY, data);
};

export const setNewsScrollPosition = data => {
  return {
    type: actionTypes.NEWS_SET_NEWS_SCROLL_POSITION,
    payload: data,
  };
};
