import * as actionTypes from '../actionTypes';
import {createSagaAction} from '../../utils/reduxUtils';

export const getQuestionList = (data) => {
    return createSagaAction(actionTypes.QUESTION_GET_LIST,data);
}

export const clearQuestionList = (data) => {
    return createSagaAction(actionTypes.QUESTION_CLEAR_LIST,data);
}

export const addQuestion = (data) => {
    return createSagaAction(actionTypes.QUESTION_ADD_QUESTION,data);
}

export const deleteQuestion = (data) => {
    return createSagaAction(actionTypes.QUESTION_DELETE_QUESTION,data);
}

export const modifyQuestion = (data) => {
    return createSagaAction(actionTypes.QUESTION_MODIFY_QUESTION,data);
}