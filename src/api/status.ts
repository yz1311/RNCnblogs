import {requestWithTimeout, createOptions} from '../utils/request';
import * as types from "../actions/actionTypes";


export const getStatusList = (data)=>{
    //type: all:全部,following:关注,my:我的,mycomment:我回应,recentcomment:新回应,mention:提到我,comment:回复我
    const URL = `${gServerPath}/statuses/@${data.request.type}?pageIndex=${data.request.pageIndex}&pageSize=${data.request.pageSize}&tag=`;
    const options = createOptions(data, 'GET');
    return requestWithTimeout({
        URL,
        data,
        options,
        errorMessage:'获取闪存列表失败!',
        actionType:types.STATUS_GET_LIST
    });
}


export const getStatusDetail = (data)=>{
    const URL = `${gServerPath}/statuses/${data.request.id}`;
    const options = createOptions(data, 'GET');
    return requestWithTimeout({
        URL,
        data,
        options,
        errorMessage:'获取闪存详情失败!',
        actionType:types.STATUS_GET_DETAIL
    });
}

export const getStatusCommentList = (data)=>{
    const URL = `${gServerPath}/statuses/${data.request.id}/comments`;
    const options = createOptions(data, 'GET');
    return requestWithTimeout({
        URL,
        data,
        options,
        errorMessage:'获取闪存评论列表失败!',
        actionType:types.STATUS_GET_COMMENT_LIST
    });
}

export const commentStatus = (data)=>{
    const URL = `${gServerPath}/statuses/${data.request.statusId}/comments`;
    const options = createOptions(data);
    return requestWithTimeout({
        URL,
        data,
        options,
        errorMessage:'评论闪存失败!',
        actionType:types.STATUS_COMMENT_STATUS
    });
}

export const deleteStatusComment = (data)=>{
    const URL = `${gServerPath}/statuses/${data.request.statusId}/comments/${data.request.commentId}`;
    const options = createOptions(data,'DELETE');
    return requestWithTimeout({
        URL,
        data,
        options,
        errorMessage:'删除评论失败!',
        actionType:types.STATUS_DELETE_COMMENT
    });
}


export const deleteStatus = (data)=>{
    const URL = `${gServerPath}/statuses/${data.request.statusId}`;
    const options = createOptions(data,'DELETE');
    return requestWithTimeout({
        URL,
        data,
        options,
        errorMessage:'删除闪存失败!',
        actionType:types.STATUS_DELETE_STATUS
    });
}

export const addStatus = (data)=>{
    const URL = `${gServerPath}/statuses`;
    const options = createOptions(data,);
    return requestWithTimeout({
        URL,
        data,
        options,
        errorMessage:'发布闪存失败!',
        actionType:types.STATUS_ADD_STATUS
    });
}