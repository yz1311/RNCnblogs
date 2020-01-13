import {requestWithTimeout, createOptions} from '../utils/request';
import * as types from '../actions/actionTypes';
import RequestUtils from "../utils/requestUtils";
import {blogCommentModel, blogModel, getBlogCommentListRequest, getBlogDetailRequest, resolveBlogHtml} from "./blog";
import {NewsTypes} from '../pages/news/news_index';

export type newsModel = {
  tag: {
    name: string,
    uri: string
  }
} & blogModel;

export type newsCommentModel = {

} & blogCommentModel;

export type getNewsListRequest = RequestModel<{
  CategoryType: string
  ParentCategoryId: number
  CategoryId: number
  PageIndex: number
}> & {newsType: NewsTypes};

export const getNewsList = (data: getNewsListRequest) => {
  const URL = `https://www.cnblogs.com/AggSite/AggSiteNewsList`;
  return RequestUtils.post<Array<newsModel>>(URL,data.request, {
    resolveResult: resolveBlogHtml
  });
};

export const getOtherNewsList = (data: getNewsListRequest) => {
  //页数是30页
  let url = '';
  switch (data.newsType) {
    case NewsTypes.最新:
      url = `https://news.cnblogs.com/n/page/${data.request.PageIndex}`;
      break;
    case NewsTypes.推荐:
      url = `https://news.cnblogs.com/n/recommend?page=${data.request.PageIndex}`;
      break;
    case NewsTypes.热门:
      //type: week today yesterday month
      url = `https://news.cnblogs.com/n/digg?page=${data.request.PageIndex}`;
      break;
  }

  return RequestUtils.get<Array<newsModel>>(url, {
    resolveResult: resolveNewsHtml
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


export const resolveNewsHtml = (result)=>{
  let items:Array<any> = [];
  let matches = result.match(/class=\"news_block\"[\s\S]+?(?=end: content)/g)|| [];
  for (let match of matches) {
    let item:Partial<newsModel> = {};
    //解析digg
    item.diggs = parseInt((match.match(/class=\"diggnum\"[\s\S]+?(?=<)/)||[])[0]?.replace(/[\s\S]+>/,''));
    // item.link = match.match(((/class=\"titlelnk\" href=\"[\s\S]+?(?=\")/))||[])[0]?.replace(/[\s\S]+="/,'');
    //不能根据link来截取，部分link后面并不是id
    // item.id = item.link.replace(/[\s\S]+\//,'').replace(/\.[\s\S]+$/,'');
    item.id = (match.match(/id=\"digg_num_\d+?(?=\")/)||[])[0]?.replace(/id=\"digg_num_/,'');
    item.link = `https://news.cnblogs.com/n/${item.id}/`;
    //onclick="DiggPost('xiaoyangjia',11535486,34640,1)">
    item.title = (match.match(/class=\"news_entry\"[\s\S]+?(?=<\/a)/)||[])[0]?.replace(/[\s\S]+\>/,'');
    //可能有图片，也可能没图片
    item.summary = (match.match((/entry_summary\"[\s\S]+?(?=\<\/div)/))||[])[0]?.replace(/[\s\S]+>/,'').trim();
    item.author = {
      avatar: (match.match(/src=\"[\s\S]+?(?=\" class=\"topic_img)/)||[])[0]?.replace(/[\s\S]+\"/,''),
      uri: (match.match(/class=\"entry_footer\"[\s\S]+?\"[\s\S]+?(?=\")/)||[])[0]?.replace(/[\s\S]+\"/,''),
      name: (match.match(/class=\"entry_footer\"[\s\S]+?(?=<\/a)/)||[])[0]?.replace(/[\s\S]+\>/,'')?.trim(),
    };
    if(item.author.uri!=undefined&&item.author.uri!=''&&item.author.uri.indexOf('http')!=0) {
      item.author.uri = 'https:'+item.author.uri;
    }
    item.tag = {
      name: (match.match(/class=\"tag\"[\s\S]+?(?=<\/a)/)||[])[0]?.replace(/[\s\S]+\>/,'')?.trim(),
      uri: 'https://news.cnblogs.com/'+(match.match(/class=\"tag\"[\s\S]+?\"[\s\S]+?(?=\")/)||[])[0]?.replace(/[\s\S]+\"/,''),
    };
    item.published = match.match(((/发布于 [\s\S]+?(?=<\/span)/))||[])[0]?.replace(/[\s\S]+?>/,'');
    item.comments = parseInt((match.match(/评论\([\s\S]+?(?=\))/)||[])[0]?.replace(/[\s\S]+\(/,''));
    item.views = parseInt((match.match(/class="view"[\s\S]+(?=人浏览)/)||[])[0]?.replace(/[\s\S]+\>/,'')?.trim());
    items.push(item);
  }
  return items;
}
