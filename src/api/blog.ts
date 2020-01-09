import {requestWithTimeout, createOptions} from '../utils/request';
import * as types from '../actions/actionTypes';
import RequestUtils from "../utils/requestUtils";

export type blogModel = {
  id: number;
  title: string;
  link: string;
  summary: string;
  author: {
    name: string,
    uri: string,
    avatar: string
  };
  blogapp: string;
  published: string;
  views: number;
  comments: number;
  diggs: number;
};

export type blogCommentModel = {
  Author: string;
  AuthorUrl: string;
  Body: string;
  DateAdded: string;
  FaceUrl: string;
  Floor: number;
  Id: number;
  //本地新增
  UserId: number | string;
};

export type getBlogListRequest = RequestModel<{
  blogApp?: string;
  pageIndex: number;
  pageSize?: number;
}>;

export type getBlogDetailRequest = RequestModel<{
  id: string;
}>;

export type getBlogCommentListRequest = RequestModel<{
  blogApp: string;
  postId: number;
  pageIndex: number;
  pageSize: number;
}>;

export const getPersonalBlogList = (data: getBlogListRequest) => {
  const URL = `${gServerPath}/blogs/${data.request.blogApp}/posts?pageIndex=${
    data.request.pageIndex
  }`;
  const options = createOptions(data, 'GET');
  return requestWithTimeout({
    URL,
    data,
    options,
    errorMessage: '获取个人博客随笔列表失败!',
    actionType: types.BLOG_GET_PERSONAL_BLOGLIST,
  });
};

export const getPickedBlogList = (data: getBlogListRequest) => {
  const URL = `${gServerPath}/blogposts/@picked?pageIndex=${
    data.request.pageIndex
  }&pageSize=${data.request.pageSize}`;
  const options = createOptions(data, 'GET');
  return requestWithTimeout({
    URL,
    data,
    options,
    errorMessage: '获取精华区博客列表失败!',
    actionType: types.BLOG_GET_PICKED_BLOGLIST,
  });
};

export const getHomeBlogList = (data: getBlogListRequest) => {
  const URL = `${gServerPath}/blog//sitehome/paged/${data.request.pageIndex}/${data.request.pageSize}`;
  return RequestUtils.get(URL);
};

export const getFollowingBlogList = (data: getBlogListRequest) => {
  const URL = `${gServerPath}/blogposts/@following?pageIndex=${
    data.request.pageIndex
  }&pageSize=${data.request.pageSize}`;
  const options = createOptions(data, 'GET');
  return requestWithTimeout({
    URL,
    data,
    options,
    errorMessage: '获取关注博客列表失败!',
    actionType: types.BLOG_GET_FOLLOWING_BLOGLIST,
  });
};

export const getBlogDetail = (data: getBlogDetailRequest) => {
  const URL = `${gServerPath}/blogposts/${data.request.id}/body`;
  const options = createOptions(data, 'GET');
  return requestWithTimeout({
    URL,
    data,
    options,
    errorMessage: '获取首页博客详情失败!',
    actionType: types.BLOG_GET_DETAIL,
  });
};

export const getBlogCommentList = (data: getBlogCommentListRequest) => {
  const URL = `${gServerPath}/blogs/${data.request.blogApp}/posts/${
    data.request.postId
  }/comments?pageIndex=${data.request.pageIndex}&pageSize=${
    data.request.pageSize
  }`;
  const options = createOptions(data, 'GET');
  return requestWithTimeout({
    URL,
    data,
    options,
    errorMessage: '获取博客评论列表失败!',
    actionType: types.BLOG_GET_BLOG_COMMENT_LIST,
  });
};

export const commentBlog = data => {
  const URL = `${gServerPath}/blogs/${data.request.blogApp}/posts/${
    data.request.postId
  }/comments`;
  let options = createOptions(data);
  options.body = data.request.comment;
  options.headers['Content-Type'] = 'text/plain';
  return requestWithTimeout({
    URL,
    data,
    options,
    errorMessage: '评论博客失败!',
    actionType: types.BLOG_COMMENT_BLOG,
  });
};
