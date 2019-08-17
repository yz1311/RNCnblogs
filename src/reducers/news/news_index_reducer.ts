import * as actionTypes from '../../actions/actionTypes';
import {handleActions, createReducerResult, actionToResult} from '../../utils/reduxUtils';
import StringUtils from "../../utils/stringUtils";

export interface State {
    newsList: Array<any>,
    getNewsListResult: any,
    newsList_noMore: boolean,
    hotWeekNewsList: Array<any>,
    getHotWeekNewsListResult: any,
    hotWeekNewsList_noMore: boolean,
    recommendedNewsList: Array<any>,
    getRecommendedNewsListResult: any,
    recommendedNewsList_noMore: boolean,
    selectedNews: any,
    newsDetail: any,
    getNewsDetailResult: any,
    curCommentPageIndex: number,
    newsCommentList: Array<any>,
    newsCommentList_noMore: boolean,
    getNewsCommentListResult: any
}

const initialState: State = {
    newsList: [],
    getNewsListResult: createReducerResult(),
    newsList_noMore: false,
    hotWeekNewsList: [],
    getHotWeekNewsListResult: createReducerResult(),
    hotWeekNewsList_noMore: false,
    recommendedNewsList: [],
    getRecommendedNewsListResult: createReducerResult(),
    recommendedNewsList_noMore: false,
    selectedNews: {},
    newsDetail: {},
    getNewsDetailResult: createReducerResult(),
    curCommentPageIndex: 1,
    newsCommentList: [],
    newsCommentList_noMore: false,
    getNewsCommentListResult: createReducerResult()
}

export default handleActions( {
    [actionTypes.NEWS_GET_LIST]:(state: State,action)=> {
        const {type, payload, meta} = action;
        const {request: {pageIndex, pageSize}} = meta.parData;
        if(!action.error) {
            state.newsList = state.newsList.slice(0,(pageIndex-1)*pageSize).concat(payload.result);
            state.newsList_noMore = (payload.result||[]).length === 0 || (payload.result||[]).length < pageSize;
        }
        if(pageIndex>1)
        {
          action.error = undefined;
        }
        state.getNewsListResult = actionToResult(action,null,state.newsList);
    },
    [actionTypes.NEWS_CLEAR_LIST]:(state: State,action)=> {
        state.newsList = initialState.newsList;
        state.getNewsListResult = initialState.getNewsListResult;
        state.newsList_noMore = initialState.newsList_noMore;
    },
    [actionTypes.NEWS_GET_HOT_WREEK_LIST]:(state: State,action)=> {
        const {type, payload, meta} = action;
        const {request: {pageIndex, pageSize}} = meta.parData;
        if(!action.error) {
            state.hotWeekNewsList = state.hotWeekNewsList.slice(0,(pageIndex-1)*pageSize).concat(payload.result);
            state.hotWeekNewsList_noMore = (payload.result||[]).length === 0 || (payload.result||[]).length < pageSize;
        }
        if(pageIndex>1)
        {
          action.error = undefined;
        }
        state.getHotWeekNewsListResult = actionToResult(action,null,state.hotWeekNewsList);
    },
    [actionTypes.NEWS_CLEAR_HOT_WREEK_LIST]:(state: State,action)=> {
        state.hotWeekNewsList = initialState.hotWeekNewsList;
        state.getHotWeekNewsListResult = initialState.getHotWeekNewsListResult;
        state.hotWeekNewsList_noMore = initialState.hotWeekNewsList_noMore;
    },
    [actionTypes.NEWS_GET_RECOMMENDED_NEWS_LIST]:(state: State,action)=> {
        const {type, payload, meta} = action;
        const {request: {pageIndex, pageSize}} = meta.parData;
        if(!action.error) {
            state.recommendedNewsList = state.recommendedNewsList.slice(0,(pageIndex-1)*pageSize).concat(payload.result);
            state.recommendedNewsList_noMore = (payload.result||[]).length === 0 || (payload.result||[]).length < pageSize;
        }
        if(pageIndex>1)
        {
          action.error = undefined;
        }
        state.getRecommendedNewsListResult = actionToResult(action,null,state.recommendedNewsList);
    },
    [actionTypes.NEWS_CLEAR_RECOMMENDED_NEWS_LIST]:(state: State,action)=> {
        state.recommendedNewsList = initialState.recommendedNewsList;
        state.getRecommendedNewsListResult = initialState.getRecommendedNewsListResult;
        state.recommendedNewsList_noMore = initialState.recommendedNewsList_noMore;
    },
    [actionTypes.NEWS_SET_SELECTED_DETAIL]:(state: State,action)=> {
        const {payload} = action;
        state.selectedNews = payload;
    },
    [actionTypes.NEWS_GET_DETAIL]:(state: State,action)=> {
        const {payload} = action;
        if(!action.error) {
            state.newsDetail = payload.result;
        }
        state.getNewsDetailResult = actionToResult(action);
    },
    [actionTypes.NEWS_CLEAR_DETAIL]:(state: State,action)=> {
        state.newsDetail = initialState.newsDetail;
        state.getNewsDetailResult = initialState.getNewsDetailResult;
    },
    [actionTypes.NEWS_GET_COMMENT_LIST]:(state: State,action)=> {
        const {type, payload, meta} = action;
        const {request: {pageIndex, pageSize}} = meta.parData;
        //防止出现数据重复的现象
        if(!action.error) {
            state.newsCommentList = state.newsCommentList.slice(0,(pageIndex-1)*pageSize).concat(payload.result);
            state.newsCommentList_noMore = (payload.result || []).length === 0 || (payload.result || []).length < pageSize;
            state.curCommentPageIndex = pageIndex;
        }
        state.getNewsCommentListResult = actionToResult(action,null,state.newsCommentList);
    },
    [actionTypes.NEWS_CLEAR_COMMENT_LIST]:(state: State,action)=> {
        state.newsCommentList = initialState.newsCommentList;
        state.newsCommentList_noMore = initialState.newsCommentList_noMore;
        state.getNewsCommentListResult = initialState.getNewsCommentListResult;
    },
    [actionTypes.NEWS_COMMENT]:(state: State,action)=> {
        const {meta: {parData: {request: {newsId, id}}}} = action;
        //将回答的评论数量更改
        for (let news of state.newsList)
        {
            if(news.Id === newsId)
            {
                news.CommentCount = news.CommentCount + 1;
                state.selectedNews = news;
                break;
            }
        }
        for (let news of state.hotWeekNewsList)
        {
            if(news.Id === newsId)
            {
                news.CommentCount = news.CommentCount + 1;
                state.selectedNews = news;
                break;
            }
        }
        for (let news of state.recommendedNewsList)
        {
            if(news.Id === newsId)
            {
                news.CommentCount = news.CommentCount + 1;
                state.selectedNews = news;
                break;
            }
        }
    },
    [actionTypes.NEWS_COMMENT_DELETE]:(state: State,action)=> {
        const {meta: {parData: {request: {newsId, id}}}} = action;
        //将回答的评论数量更改
        for (let news of state.newsList)
        {
            if(news.Id === newsId)
            {
                news.CommentCount = news.CommentCount + 1;
                state.selectedNews = news;
                break;
            }
        }
        for (let news of state.hotWeekNewsList)
        {
            if(news.Id === newsId)
            {
                news.CommentCount = news.CommentCount + 1;
                state.selectedNews = news;
                break;
            }
        }
        for (let news of state.recommendedNewsList)
        {
            if(news.Id === newsId)
            {
                news.CommentCount = news.CommentCount + 1;
                state.selectedNews = news;
                break;
            }
        }
    },
    [actionTypes.HOME_REFRESH_DATA_TIME]:(state: State,action)=> {
        for (let item of state.newsList)
        {
            item.postDateDesc = StringUtils.formatDate(item.DateAdded);
        }
        for (let item of state.hotWeekNewsList)
        {
            item.postDateDesc = StringUtils.formatDate(item.DateAdded);
        }
        for (let item of state.recommendedNewsList)
        {
            item.postDateDesc = StringUtils.formatDate(item.DateAdded);
        }
        if(state.selectedNews.postDateDesc)
        {
            state.selectedNews.postDateDesc = StringUtils.formatDate(state.selectedNews.DateAdded);
        }
    },
}, initialState);
