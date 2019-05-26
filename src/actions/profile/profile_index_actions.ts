import {createSagaAction} from "../../utils/reduxUtils";
import * as actionTypes from "../actionTypes";
import {getUserAliasByUserNameRequest} from "../../api/profile";

export const getPersonInfo = (data) => {
    return createSagaAction(actionTypes.PROFILE_GET_PERSON_INFO,data);
}

export const clearPersonInfo = (data) => {
    return createSagaAction(actionTypes.PROFILE_CLEAR_PERSON_INFO,data);
}

export const getPersonSignature = (data) => {
    return createSagaAction(actionTypes.PROFILE_GET_PERSON_SIGNATURE,data);
}

export const getPersonBlogList = (data) => {
    return createSagaAction(actionTypes.PROFILE_GET_PERSON_BLOG_LIST,data);
}

export const clearPersonBlogList = (data) => {
    return createSagaAction(actionTypes.PROFILE_CLEAR_PERSON_BLOG_LIST,data);
}

export const getUserAliasByUserName = (data: getUserAliasByUserNameRequest) => {
    return createSagaAction(actionTypes.PROFILE_GET_PERSON_ALIAS_BY_NAME,data);
}
