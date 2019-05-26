import * as actionTypes from '../actionTypes';
import {createSagaAction} from '../../utils/reduxUtils';

export const getQuestionDetail = (data) => {
    return createSagaAction(actionTypes.QUESTION_GET_DETAIL,data);
}

export const clearQuestionDetail = (data) => {
    return createSagaAction(actionTypes.QUESTION_CLEAR_DETAIL,data);
}

export const setSelectedQuestion = (data) => {
    return {
        type: actionTypes.QUESTION_SET_SELECTED_QUESTION,
        payload: data
    };
}

export const getQuestionCommentList = (data) => {
    return createSagaAction(actionTypes.QUESTION_GET_COMMENT_LIST,data);
}

export const clearQuestionCommentList = (data) => {
    return createSagaAction(actionTypes.QUESTION_CLEAR_COMMENT_LIST,data);
}

export const getQuestionAnswerList = (data) => {
    return createSagaAction(actionTypes.QUESTION_GET_ANSWER_LIST,data);
}

export const clearQuestionAnswerList = (data) => {
    return createSagaAction(actionTypes.QUESTION_CLEAR_ANSWER_LIST,data);
}

export const answerQuestion = (data) => {
    return createSagaAction(actionTypes.QUESTION_ANSWER,data);
}

export const deleteQuestionAnswer = (data) => {
    return createSagaAction(actionTypes.QUESTION_DELETE_ANSWER,data);
}

export const modifyQuestionAnswer = (data) => {
    return createSagaAction(actionTypes.QUESTION_MODIFY_ANSWER,data);
}

export const setSelectedAnswer = (data) => {
    return {
      type: actionTypes.QUESTION_SET_SELECTED_ANSWER,
      payload: data
    };
}

export const getAnswerCommentList = (data) => {
    return createSagaAction(actionTypes.QUESTION_GET_ANSWER_COMMENT_LIST,data);
}

export const clearAnswerCommentList = (data) => {
    return createSagaAction(actionTypes.QUESTION_CLEAR_ANSWER_COMMENT_LIST,data);
}

export const commentAswer = (data) => {
    return createSagaAction(actionTypes.QUESTION_COMMENT_ANSWER,data);
}

export const deleteAnswerComment = (data) => {
    return createSagaAction(actionTypes.QUESTION_DELETE_COMMENT_ANSWER,data);
}

export const modifyAnswerComment = (data) => {
    return createSagaAction(actionTypes.QUESTION_MODIFY_COMMENT_ANSWER,data);
}