import {requestWithTimeout, createOptions} from '../utils/request';
import * as types from '../actions/actionTypes';
import RequestUtils from "../utils/requestUtils";
import {blogCommentModel, blogModel, getBlogCommentListRequest, getBlogDetailRequest, resolveBlogHtml} from "./blog";

export type newsModel = {

} & blogModel;

export type newsCommentModel = {

} & blogCommentModel;

export type getNewsListRequest = RequestModel<{
  CategoryType: string
  ParentCategoryId: number
  CategoryId: number
  PageIndex: number
}>;

export const getNewsList = (data: getNewsListRequest) => {
  const URL = `https://www.cnblogs.com/AggSite/AggSiteNewsList`;
  return RequestUtils.post<Array<newsModel>>(URL,data.request, {
    resolveResult: resolveBlogHtml
  });
};

export const getHowWeekNewsList = data => {
  const URL = `${gServerPath}/newsitems/@hot-week?pageIndex=${
    data.request.pageIndex
  }&pageSize=${data.request.pageSize}`;
  const options = createOptions(data, 'GET');
  return requestWithTimeout({
    URL,
    data,
    options,
    errorMessage: '获取本周热门新闻列表失败!',
    actionType: types.NEWS_GET_HOT_WREEK_LIST,
  });
};

export const getRecommendedNewsList = data => {
  const URL = `${gServerPath}/newsitems/@recommended?pageIndex=${
    data.request.pageIndex
  }&pageSize=${data.request.pageSize}`;
  const options = createOptions(data, 'GET');
  return requestWithTimeout({
    URL,
    data,
    options,
    errorMessage: '获取推荐新闻列表失败!',
    actionType: types.NEWS_GET_RECOMMENDED_NEWS_LIST,
  });
};

export const getNewsDetail = (data: getBlogDetailRequest) => {
  const URL = `http://wcf.open.cnblogs.com/news/item/${data.request.id}`;
  return RequestUtils.get<{NewsBody:{
      Title: string,
      SourceName: string,
      SubmitDate: string,
      Content: string,
      ImageUrl: string,
      PrevNews: string,
      NextNews: string,
      CommentCount: string,
    }}>(URL);
};

export const commentNews = data => {
  const URL = `${gServerPath}/news/${data.request.newsId}/comments`;
  const options = createOptions(data, 'POST');
  return requestWithTimeout({
    URL,
    data,
    options,
    errorMessage: '评论新闻失败!',
    actionType: types.NEWS_COMMENT,
  });
};


export const getNewsCommentList = (data: RequestModel<{
  postId: number,
  pageIndex: number,
  pageSize: number,
}>) => {
  const URL = `http://wcf.open.cnblogs.com/news/item/${data.request.postId}/comments/${data.request.pageIndex}/${data.request.pageSize}`;
  return RequestUtils.get<Array<blogCommentModel>>(URL, {
    resolveResult: (result)=>{
      //要重新计算楼层，返回的数据的Floor都只是本页的序号
      result = (result || []).map((x, xIndex) => ({
        ...x,
        Floor: (data.request.pageIndex - 1) * data.request.pageSize + xIndex + 1 }));
      return result;
    }
  });
};

//可以删除自己发的评论
export const deleteNewsComment = data => {
  const URL = `${gServerPath}/newscomments/${data.request.id}`;
  const options = createOptions(data, 'DELETE');
  return requestWithTimeout({
    URL,
    data,
    options,
    errorMessage: '删除新闻评论失败!',
    actionType: types.NEWS_COMMENT_DELETE,
  });
};

export const modifyNewsComment = data => {
  const URL = `${gServerPath}/newscomments/${data.request.id}`;
  const options = createOptions(data, 'PATCH');
  return requestWithTimeout({
    URL,
    data,
    options,
    errorMessage: '修改新闻评论失败!',
    actionType: types.NEWS_COMMENT_MODIFY,
  });
};
