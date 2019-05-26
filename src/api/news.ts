import {requestWithTimeout, createOptions} from '../utils/request';
import * as types from "../actions/actionTypes";


export const getNewsList = (data)=>{
    const URL = `${gServerPath}/NewsItems?pageIndex=${data.request.pageIndex}&pageSize=${data.request.pageSize}`;
    const options = createOptions(data, 'GET');
    return requestWithTimeout({
        URL,
        data,
        options,
        errorMessage:'获取新闻列表失败!',
        actionType:types.NEWS_GET_LIST
    });
}


export const getHowWeekNewsList = (data)=>{
    const URL = `${gServerPath}/newsitems/@hot-week?pageIndex=${data.request.pageIndex}&pageSize=${data.request.pageSize}`;
    const options = createOptions(data, 'GET');
    return requestWithTimeout({
        URL,
        data,
        options,
        errorMessage:'获取本周热门新闻列表失败!',
        actionType:types.NEWS_GET_HOT_WREEK_LIST
    });
}

export const getRecommendedNewsList = (data)=>{
    const URL = `${gServerPath}/newsitems/@recommended?pageIndex=${data.request.pageIndex}&pageSize=${data.request.pageSize}`;
    const options = createOptions(data, 'GET');
    return requestWithTimeout({
        URL,
        data,
        options,
        errorMessage:'获取推荐新闻列表失败!',
        actionType:types.NEWS_GET_RECOMMENDED_NEWS_LIST
    });
}

export const getNewsDetail = (data)=>{
    const URL = `${gServerPath}/newsitems/${data.request.id}/body`;
    const options = createOptions(data, 'GET');
    return requestWithTimeout({
        URL,
        data,
        options,
        errorMessage:'获取新闻详情失败!',
        actionType:types.NEWS_GET_DETAIL
    });
}


export const commentNews = (data)=>{
    const URL = `${gServerPath}/news/${data.request.newsId}/comments`;
    const options = createOptions(data, 'POST');
    return requestWithTimeout({
        URL,
        data,
        options,
        errorMessage:'评论新闻失败!',
        actionType:types.NEWS_COMMENT
    });
}


export const getNewsCommentList = (data)=>{
    const URL = `${gServerPath}/news/${data.request.newsId}/comments?pageIndex=${data.request.pageIndex}&pageSize=${data.request.pageSize}`;
    const options = createOptions(data, 'GET');
    return requestWithTimeout({
        URL,
        data,
        options,
        errorMessage:'获取新闻评论列表失败!',
        actionType:types.NEWS_GET_COMMENT_LIST
    });
}

//可以删除自己发的评论
export const deleteNewsComment = (data)=>{
    const URL = `${gServerPath}/newscomments/${data.request.id}`;
    const options = createOptions(data, 'DELETE');
    return requestWithTimeout({
        URL,
        data,
        options,
        errorMessage:'删除新闻评论失败!',
        actionType:types.NEWS_COMMENT_DELETE
    });
}

export const modifyNewsComment = (data)=>{
    const URL = `${gServerPath}/newscomments/${data.request.id}`;
    const options = createOptions(data, 'PATCH');
    return requestWithTimeout({
        URL,
        data,
        options,
        errorMessage:'修改新闻评论失败!',
        actionType:types.NEWS_COMMENT_MODIFY
    });
}