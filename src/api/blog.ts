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
  CategoryType?: string
  ParentCategoryId?: number,
  CategoryId?: number,
  PageIndex: number;
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
  const URL = `https://www.cnblogs.com/AggSite/AggSitePostList`;
  return RequestUtils.post(URL,data.request, {
    resolveResult: resolveBlogHtml
  });
};

export const getHomeBlogList = (data: RequestModel<{pageIndex:number, pageSize: number}>) => {
  const URL = `${gServerPath}/blog//sitehome/paged/${data.request.pageIndex}/${data.request.pageSize}`;
  return RequestUtils.get(URL);
};

export const getFollowingBlogList = (data: getBlogListRequest) => {
  data.request.ParentCategoryId = 0;
  data.request.CategoryId = 108697;
  data.request.CategoryType = '"HomeCandidate"';
  const URL = `https://www.cnblogs.com/AggSite/AggSitePostList`;
  return RequestUtils.post(URL,data.request, {
    resolveResult: resolveBlogHtml
  });
};

export const getBlogDetail = (data: getBlogDetailRequest) => {
  const URL = `http://wcf.open.cnblogs.com/blog/post/body/${data.request.id}`;
  return RequestUtils.get(URL);
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


const resolveBlogHtml = (result)=>{
  let items:Array<any> = [];
  let matches = result.match(/class=\"post_item\"[\s\S]+?(?=(post_item\"))/g);
  for (let match of matches) {
    let item:Partial<blogModel> = {};
    //解析digg
    item.diggs = parseInt(((match.match(/class=\"diggnum\"[\s\S]+?(?=<)/))||[])[0]?.replace(/[\s\S]+>/,''));
    item.link = match.match(((/class=\"titlelnk\" href=\"[\s\S]+?(?=\")/))||[])[0]?.replace(/[\s\S]+="/,'');
    item.title = match.match((/class=\"titlelnk\"[\s\S]+?(?=<)/)||[])[0]?.replace(/[\s\S]+>/,'');
    item.summary = (match.match((/post_item_summary\"[\s\S]+?(?=\<\/p)/))||[])[0]?.replace(/[\s\S]+\>/,'').trim();
    item.author = {
      avatar: (match.match((/class=\"pfs\" src=\"[\s\S]+?(?=\")/))||[])[0]?.replace(/[\s\S]+\"/,''),
      name: match.match(((/class=\"post_item_foot\"[\s\S]+?(?=\<\/a)/))||[])[0]?.replace(/[\s\S]+\>/,''),
      uri: match.match(((/class=\"post_item_foot\"[\s\S]+?href=\"[\s\S]+?(?=\")/))||[])[0]?.replace(/[\s\S]+(?=\")/,''),
    };
    item.published = match.match(((/发布于 [\s\S]+?(?=\s{3,})/))||[])[0]?.replace(/[\s\S]+?(?=\d)/,'');
    item.comments = parseInt(((match.match(/评论\([\s\S]+?(?=)/))||[])[0]?.replace(/[\s\S]+\(/,''));
    item.views = parseInt(((match.match(/阅读\([\s\S]+?(?=)/))||[])[0]?.replace(/[\s\S]+\(/,''));
    items.push(item);
  }
  return items;
}
