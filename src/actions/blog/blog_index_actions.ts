import * as actionTypes from '../actionTypes';
import {createSagaAction} from '../../utils/reduxUtils';

export const getPersonalBlogList = (data) => {
    return createSagaAction(actionTypes.BLOG_GET_PERSONAL_BLOGLIST,data);
}

export const clearPersonalBlogList = (data) => {
    return createSagaAction(actionTypes.BLOG_CLEAR_PERSONAL_BLOGLIST,data);
}

export const getPickedBlogList = (data) => {
    return createSagaAction(actionTypes.BLOG_GET_PICKED_BLOGLIST,data);
}

export const clearPickedBlogList = (data) => {
    return createSagaAction(actionTypes.BLOG_CLEAR_PICKED_BLOGLIST,data);
}

export const getHomeBlogList = (data) => {
    return createSagaAction(actionTypes.BLOG_GET_HOME_BLOGLIST,data);
}

export const clearHomeBlogList = (data) => {
    return createSagaAction(actionTypes.BLOG_CLEAR_HOME_BLOGLIST,data);
}

export const getFollowingBlogList = (data) => {
    return createSagaAction(actionTypes.BLOG_GET_FOLLOWING_BLOGLIST,data);
}

export const clearFollowingBlogList = (data) => {
    return createSagaAction(actionTypes.BLOG_CLEAR_FOLLOWING_BLOGLIST,data);
}

export const getBlogDetail = (data) => {
    return createSagaAction(actionTypes.BLOG_GET_DETAIL,data);
}

export const clearBlogDetail = (data) => {
    return createSagaAction(actionTypes.BLOG_CLEAR_DETAIL,data);
}

export const commentBlog = (data) => {
    return createSagaAction(actionTypes.BLOG_COMMENT_BLOG,data);
}

export const setSelectedBlog = (data) => {
    return {
        type: actionTypes.BLOG_SET_SELECTED_BLOG,
        payload: data
    };
}

export const getBlogCommentList = (data) => {
    return createSagaAction(actionTypes.BLOG_GET_BLOG_COMMENT_LIST,data);
}

export const clearBlogCommentList = (data) => {
    return createSagaAction(actionTypes.BLOG_CLEAR_BLOG_COMMENT_LIST,data);
}

export const setBlogScrollPosition = (data) => {
    return {
        type: actionTypes.BLOG_SET_BLOG_SCROLL_POSITION,
        payload: data
    };
    // return createSagaAction(actionTypes.BLOG_SET_BLOG_SCROLL_POSITION,data);
}