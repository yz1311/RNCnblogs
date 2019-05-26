import {requestWithTimeout, createOptions} from '../utils/request';
import * as types from "../actions/actionTypes";


export type checkIsBookmarkRequest = RequestModel<{
    url: string
}>;

export const getBookmarkList = (data)=>{
    const URL = `${gServerPath}/Bookmarks?pageIndex=${data.request.pageIndex}&pageSize=${data.request.pageSize}&tag=`;
    const options = createOptions(data, 'GET');
    return requestWithTimeout({
        URL,
        data,
        options,
        errorMessage:'获取书签列表失败!',
        actionType:types.BOOKMARK_GET_LIST
    });
}


export const deleteBookmark = (data)=>{
    const URL = `${gServerPath}/bookmarks/${data.request.id}`;
    const options = {
        method:'DELETE',
        headers:{
            'Content-Type': 'application/json',
            'Authorization':'Bearer '+gUserData.token
        },
    };
    return requestWithTimeout({
        URL,
        data,
        options,
        errorMessage:'删除书签失败!',
        actionType:types.BOOKMARK_DELETE
    });
}

//用户文章中直接取消收藏
export const deleteBookmarkByUrl = (data)=>{
    const URL = `${gServerPath}/bookmarks?url=${data.request.url}`;
    const options = {
        method:'DELETE',
        headers:{
            'Content-Type': 'application/json',
            'Authorization':'Bearer '+gUserData.token
        },
    };
    return requestWithTimeout({
        URL,
        data,
        options,
        errorMessage:'删除书签失败!',
        actionType:types.BOOKMARK_DELETE
    });
}

export const addBookmark = (data)=>{
    const URL = `${gServerPath}/bookmarks`;
    const options = createOptions(data, 'POST');
    return requestWithTimeout({
        URL,
        data,
        options,
        errorMessage:'添加书签失败!',
        actionType:types.BOOKMARK_ADD
    });
}

export const modifyBookmark = (data)=>{
    const URL = `${gServerPath}/bookmarks/${data.request.id}`;
    const options = createOptions(data, 'PATCH');
    return requestWithTimeout({
        URL,
        data,
        options,
        errorMessage:'修改书签失败!',
        actionType:types.BOOKMARK_MODIFY
    });
}

//这个接口很奇怪，statusCode,404为不存在，2xx为存在
export const checkIsBookmark = (data: checkIsBookmarkRequest)=>{
    const URL = `${gServerPath}/bookmarks?url=${data.request.url}`;
    const options = createOptions(data, 'HEAD');
    return requestWithTimeout({
        URL,
        data,
        options,
        errorMessage:'检查书签失败!',
        actionType:types.BOOKMARK_CHECK_IS
    });
}