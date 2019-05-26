import * as actionTypes from '../actionTypes';
import {createSagaAction} from '../../utils/reduxUtils';

export const getKnowledgeBaseList = (data) => {
    return createSagaAction(actionTypes.KNOWLEDGEBASE_GET_IST,data);
}

export const clearKnowledgeBaseList = (data) => {
    return createSagaAction(actionTypes.KNOWLEDGEBASE_CLEAR_IST,data);
}

export const getKnowledgeBaseDetail = (data) => {
    return createSagaAction(actionTypes.KNOWLEDGEBASE_GET_DETAIL,data);
}

export const clearKnowledgeBaseDetail = (data) => {
    return createSagaAction(actionTypes.KNOWLEDGEBASE_CLEAR_DETAIL,data);
}