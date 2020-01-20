import {requestWithTimeout, createOptions} from '../utils/request';
import * as types from '../actions/actionTypes';
import RequestUtils from "../utils/requestUtils";
import {
  blogCommentModel,
  blogModel,
  getBlogCommentListRequest,
  getBlogDetailRequest,
  resolveBlogCommentHtml,
  resolveBlogHtml, resolveSearchBlogHtml
} from "./blog";
import {NewsTypes} from '../pages/news/news_index';
import {Api} from "./index";
import {AxiosResponse} from "axios";
import {SearchParams} from "../pages/home/home_search";

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

export const getSearchNewsList = (data: RequestModel<{Keywords: string,
  pageIndex: number,}&Partial<SearchParams>>) => {
  const URL = `https://zzk.cnblogs.com/s/news?Keywords=${data.request.Keywords}&pageindex=${data.request.pageIndex}
  ${data.request.ViewCount!=undefined?('&ViewCount='+data.request.ViewCount):''}
  ${data.request.DiggCount!=undefined?('&DiggCount='+data.request.DiggCount):''}
  ${data.request.DateTimeRange!=undefined?('&datetimerange='+data.request.DateTimeRange):''}
  ${data.request.DateTimeRange=='Customer'?`&from=${data.request.from}&to=${data.request.to}`:''}`;
  return RequestUtils.get(URL, {
    resolveResult: resolveSearchNewsHtml
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

export const getNewsDetail = (data: RequestModel<{url:string}>) => {
  return RequestUtils.get<{body:string,id:string}>(data.request.url, {
    resolveResult: (result)=>{
      //图片部分没有带协议头，在app中无法显示
      result = result?.replace(/<img src=\"\/\//g,'<img src="https://');
      return {
        body: (result.match(/id=\"news_body\"[\s\S]*?\">[\s\S]+?(?=id=\"news_otherinfo\")/) || [])[0]
            ?.replace(/id=\"news_body\">/,'')?.trim(),
        id: (result.match(/onclick=\"AddToWz\(\d+?(?=\))/)||[])[0]?.replace(/[\s\S]+\(/,''),
      }
    }
  });
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


export const getNewsCommentList = async (data: RequestModel<{
  commentId: number,
  pageIndex: number,
  pageSize: number,
}>) => {
  const URL = `https://news.cnblogs.com/CommentAjax/GetComments?contentId=${data.request.commentId}`;
  return RequestUtils.get<Array<blogCommentModel>>(URL, {
    resolveResult: (result) => {
      let dataList = resolveNewsCommentHtml(result) as Array<blogCommentModel>;
      //要重新计算楼层，返回的数据的Floor都只是本页的序号
      dataList = (dataList || []).map((x, xIndex) => ({
        ...x,
        Floor: (data.request.pageIndex - 1) * data.request.pageSize + xIndex + 1
      }));
      return dataList;
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
    item.summary = (match.match(/entry_summary\"[\s\S]+?(?=\<\/div)/)||[])[0]?.replace(/[\s\S]+>/,'').trim();
    item.author = {
      id: '',
      avatar: (match.match(/src=\"[\s\S]+?(?=\" class=\"topic_img)/)||[])[0]?.replace(/[\s\S]+\"/,''),
      uri: (match.match(/class=\"entry_footer\"[\s\S]+?\"[\s\S]+?(?=\")/)||[])[0]?.replace(/[\s\S]+\"/,''),
      name: (match.match(/class=\"entry_footer\"[\s\S]+?(?=<\/a)/)||[])[0]?.replace(/[\s\S]+\>/,'')?.trim(),
    };
    if(item.author.uri!=undefined&&item.author.uri!=''&&item.author.uri.indexOf('http')!=0) {
      item.author.uri = 'https:'+item.author.uri;
    }
    item.author.id = item.author?.uri.replace(/^[\s\S]+\/(?=[\s\S]+\/$)/,'').replace('/','');
    item.tag = {
      name: (match.match(/class=\"tag\"[\s\S]+?(?=<\/a)/)||[])[0]?.replace(/[\s\S]+\>/,'')?.trim(),
      uri: 'https://news.cnblogs.com/'+(match.match(/class=\"tag\"[\s\S]+?\"[\s\S]+?(?=\")/)||[])[0]?.replace(/[\s\S]+\"/,''),
    };
    item.published = (match.match(/发布于 [\s\S]+?(?=<\/span)/)||[])[0]?.replace(/[\s\S]+?>/,'');
    item.comments = parseInt((match.match(/评论\([\s\S]+?(?=\))/)||[])[0]?.replace(/[\s\S]+\(/,''));
    item.views = parseInt((match.match(/class="view"[\s\S]+(?=人浏览)/)||[])[0]?.replace(/[\s\S]+\>/,'')?.trim());
    items.push(item);
  }
  return items;
}

export const resolveSearchNewsHtml = (result)=>{
  let items:Array<any> = [];
  let matches = result.match(/class=\"searchItem\"[\s\S]+?(?=searchURL\"[\s\S]+?<\/div>)/g)|| [];
  for (let match of matches) {
    let item:Partial<newsModel> = {};
    item.link = (match.match(/class=\"searchItemTitle\"[\s\S]+?href=\"[\s\S]+?(?=\")/)||[])[0]?.replace(/[\s\S]+="/,'');
    //不能根据link来截取，部分link后面并不是id
    // item.id = item.link.replace(/[\s\S]+\//,'').replace(/\.[\s\S]+$/,'');
    //搜索的博客没有id
    item.id = '';
    //onclick="DiggPost('xiaoyangjia',11535486,34640,1)">
    item.blogapp = (match.match(/DiggPost\(([\s\S]+,){2}[\s\S]+?(?=,)/)||[])[0]?.replace(/^([\s\S]+,){2}/,'');
    item.title = (match.match(/class=\"searchItemTitle\"[\s\S]+?(?=<\/a)/)||[])[0]?.replace(/[\s\S]+?href=\"[\s\S]+?\">/,'');
    item.summary = (match.match(/searchCon\"[\s\S]+?(?=\<\/span)/)||[])[0]?.replace(/searchCon\">/,'').trim();
    item.author = {
      id: '',
      avatar: (match.match(/class=\"pfs\" src=\"[\s\S]+?(?=\")/)||[])[0]?.replace(/[\s\S]+\"/,''),
      name: (match.match(/class=\"searchItemInfo-userName\"[\s\S]+?(?=\<\/a)/)||[])[0]?.replace(/[\s\S]+\>/,'')?.trim(),
      uri: (match.match(/class=\"searchItemInfo-userName\"[\s\S]+?href=\"[\s\S]+?(?=\")/)||[])[0]?.replace(/[\s\S]+\"/,''),
    };
    item.author.id = item.author?.uri?.replace(/^[\s\S]+\/(?=[\s\S]+\/$)/,'').replace('/','');
    item.published = (match.match(/class=\"searchItemInfo-publishDate\"[\s\S]+?(?=<\/span>)/)||[])[0]?.replace(/[\s\S]+>/,'')+' 00:00:00';
    item.diggs = parseInt((match.match(/推荐\(\d+?(?=\))/)||[])[0]?.replace(/[\s\S]+\(/,'') || '0');
    item.comments = parseInt((match.match(/评论\(\d+?(?=\))/)||[])[0]?.replace(/[\s\S]+\(/,'') || '0');
    item.views = parseInt((match.match(/浏览\(\d+?(?=\))/)||[])[0]?.replace(/[\s\S]+\(/,'') || '0');
    items.push(item);
  }
  return items;
}


export const resolveNewsCommentHtml = (result)=>{
  let items:Array<any> = [];
  let matches = result.match(/class=\"user_comment\"[\s\S]+?class=\"comment_option\"[\s\S]+?<\/div[\s\S]+?(?=<\/div)/g)|| [];
  for (let match of matches) {
    let item:Partial<blogCommentModel> = {};
    item.title = '';
    item.id = (match.match(/id=\"comment_body_\d+?(?=\")/)||[])[0]?.replace(/id=\"comment_body_/,'');
    item.content = (match.match(/id=\"comment_body_[\s\S]+?(?=<\/div>)/)||[])[0]?.replace(/[\s\S]+\>/,'').trim();
    item.author = {
      id: '',
      uri: (match.match(/class=\"layer_num\"[\s\S]+?href=\"[\s\S]+?(?=\")/)||[])[0]?.replace(/[\s\S]+\"/,''),
      name: (match.match(/class=\"comment-author\"[\s\S]+?(?=\<\/a)/)||[])[0]?.replace(/[\s\S]+>/,'').trim(),
      avatar: '',
    };
    if(item.author.uri!=undefined&&item.author.uri!=''&&item.author.uri.indexOf('http')!=0) {
      item.author.uri = 'https:'+item.author.uri;
    }
    item.author.id = item.author?.uri.replace(/^[\s\S]+\/(?=[\s\S]+\/$)/,'').replace('/','');
    item.published = (match.match(/class=\"time[\s\S]+?(?=<\/span)/)||[])[0]?.replace(/[\s\S]+>/,'')?.replace('发表于 ','')?.trim();
    items.push(item);
  }
  return items;
}
