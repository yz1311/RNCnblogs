import * as actionTypes from '../actionTypes';
import {createSagaAction} from '../../utils/reduxUtils';

export const getStatusList = data => {
  return createSagaAction(actionTypes.STATUS_GET_LIST, data);
};

export const clearStatusList = data => {
  return createSagaAction(actionTypes.STATUS_CLEAR_LIST, data);
};

export const getStatusDetail = data => {
  return createSagaAction(actionTypes.STATUS_GET_DETAIL, data);
};

export const clearStatusDetail = data => {
  return createSagaAction(actionTypes.STATUS_CLEAR_DETAIL, data);
};

export const getStatusCommentList = data => {
  return createSagaAction(actionTypes.STATUS_GET_COMMENT_LIST, data);
};

export const clearStatusCommentList = data => {
  return createSagaAction(actionTypes.STATUS_CLEAR_COMMENT_LIST, data);
};

export const commentStatus = data => {
  return createSagaAction(actionTypes.STATUS_COMMENT_STATUS, data);
};

export const deleteStatusComment = data => {
  return createSagaAction(actionTypes.STATUS_DELETE_COMMENT, data);
};

export const deleteStatus = data => {
  return createSagaAction(actionTypes.STATUS_DELETE_STATUS, data);
};

export const addStatus = data => {
  return createSagaAction(actionTypes.STATUS_ADD_STATUS, data);
};
