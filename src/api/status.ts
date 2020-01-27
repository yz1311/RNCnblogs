import {requestWithTimeout, createOptions} from '../utils/request';
import * as types from '../actions/actionTypes';
import RequestUtils from "../utils/requestUtils";
import {QuestionTypes} from "../pages/question/question_index";
import {questionModel, resolveQuestion1Html, resolveQuestionHtml, resolveSearchQuestionHtml} from "./question";
import {StatusTypes} from "../pages/status/status_index";
import moment from "moment";
import {SearchParams} from "../pages/home/home_search";

export type statusModel = {
  id: string,
  author: {
    name: string,
    uri: string,
    avatar: string,
    id: string,
    no: string,
  },
  link: string,
  title: string,
  summary: string,
  reply: {
    author: string,
    authorUri: string,
  },
  comments: Array<statusModel>,
  commentCount: number,
  published: string,
  publishedDesc: string,
  hasGetComments: boolean;
};


export type statusCommentModel = {
  id: string,
  author: {
    name: string,
    uri: string,
    avatar: string,
    id: string,
    no: string
  },
  title: string,
  summary: string,
  reply: {
    author: string,
    authorUri: string,
  },
  published: string,
  Floor: number
};

export const getStatusList = (data:RequestModel<{statusType:StatusTypes,pageIndex:number,pageSize:number}>) => {
  const URL = `https://ing.cnblogs.com/ajax/ing/GetIngList?IngListType=${data.request.statusType}&PageIndex=${data.request.pageIndex}&PageSize=${data.request.pageSize}`;
  return RequestUtils.get<Array<questionModel>>(URL, {
    headers: {
      //必须要加这个，否则请求失败
      "x-requested-with": 'XMLHttpRequest'
    },
    resolveResult: resolveStatusHtml
  });
};


export const getOtherStatusList = (data:RequestModel<{userId:string,pageIndex:number,pageSize:number}>) => {
  const URL = `https://ing.cnblogs.com/u/${data.request.userId}/${data.request.pageIndex}`;
  return RequestUtils.get<Array<questionModel>>(URL, {
    headers: {
      //必须要加这个，否则请求失败
      "x-requested-with": 'XMLHttpRequest'
    },
    resolveResult: resolveStatusHtml
  });
};


export const getSearchStatusList = (data: RequestModel<{Keywords: string,
  pageIndex: number,}&Partial<SearchParams>>) => {
  const URL = `https://zzk.cnblogs.com/s/ing?Keywords=${data.request.Keywords}&pageindex=${data.request.pageIndex}
  ${data.request.ViewCount!=undefined?('&ViewCount='+data.request.ViewCount):''}
  ${data.request.DiggCount!=undefined?('&DiggCount='+data.request.DiggCount):''}
  ${data.request.DateTimeRange!=undefined?('&datetimerange='+data.request.DateTimeRange):''}
  ${data.request.DateTimeRange=='Customer'?`&from=${data.request.from}&to=${data.request.to}`:''}`;
  return RequestUtils.get(URL, {
    resolveResult: resolveSearchStatusHtml
  });
};

export const getStatusDetail = data => {
  const URL = `${gServerPath}/statuses/${data.request.id}`;
  const options = createOptions(data, 'GET');
  return requestWithTimeout({
    URL,
    data,
    options,
    errorMessage: '获取闪存详情失败!',
    actionType: types.STATUS_GET_DETAIL,
  });
};

export const getStatusCommentList = (data:RequestModel<{id:string,userAlias:string}>) => {
  const URL = `https://ing.cnblogs.com/ajax/ing/SingleIngComments?ingId=${data.request.id}`;
  return RequestUtils.get<Array<statusCommentModel>>(URL, {
    resolveResult: (result)=>{
      let matches = result.match(/<li id=\"comment_[\s\S]+?<\/li>/g) || [];
      let comments = [];
      let index = 1;
      for (let match of matches) {
        let comment = {} as Partial<statusCommentModel>;
        comment.title = '';
        comment.id = (match.match(/id=\"comment_[\s\S]+?(?=\")/)||[])[0]?.replace(/id=\"comment_/,'')?.trim(),
        comment.summary = (match.match(/class=\"ing_comment\"[\s\S]+?(?=<\/span>)/)||[])[0]?.replace(/[\s\S]+?ing_comment\">/,'')?.trim();
        comment.author = {
          id: '',
          uri: (match.match(/id=\"comment_author_[\s\S]+?href=\"[\s\S]+?(?=\")/)||[])[0]?.replace(/[\s\S]+\"/,''),
          name: (match.match(/id=\"comment_author_[\s\S]+?(?=\<\/a)/)||[])[0]?.replace(/[\s\S]+>/,'').trim(),
          avatar: '',
          no: (match.match(/commentReply[\s\S]+?(?=\))/)||[])[0]?.replace(/[\s\S]+,/,'')?.trim(),
        };
        comment.author.id = comment.author?.uri.replace(/^[\s\S]+\/(?=[\s\S]+\/$)/,'').replace('/','');
        comment.published = (match.match(/class=\"ing_comment_time[\s\S]+?(?=<\/a)/)||[])[0]?.replace(/[\s\S]+>/,'').replace('"','');
        if(/^\d{2}:\d{2}$/.test(comment.published)) {
          comment.published =moment().format('YYYY-MM-DD ')+comment.published+':00';
        }
        comment.Floor =  index;
        comments.push(comment)
        index++;
      }
      return comments;
    }
  });
};

export const commentStatus = (data:RequestModel<{
  IngId: number,
  ReplyToUserId: number,
  ParentCommentId: number,
  Content: string
}>) => {
  const URL = `https://ing.cnblogs.com/ajax/ing/PostComment`;
  return RequestUtils.post<{
    id: number,
    isSuccess: boolean,
    message: boolean,
  }>(URL,data.request, {
    headers: {
      //必须要加这个，否则请求失败
      "x-requested-with": 'XMLHttpRequest'
    }
  });
};

export const deleteStatusComment = data => {
  const URL = `${gServerPath}/statuses/${data.request.statusId}/comments/${
    data.request.commentId
  }`;
  const options = createOptions(data, 'DELETE');
  return requestWithTimeout({
    URL,
    data,
    options,
    errorMessage: '删除评论失败!',
    actionType: types.STATUS_DELETE_COMMENT,
  });
};

export const deleteStatus = data => {
  const URL = `${gServerPath}/statuses/${data.request.statusId}`;
  const options = createOptions(data, 'DELETE');
  return requestWithTimeout({
    URL,
    data,
    options,
    errorMessage: '删除闪存失败!',
    actionType: types.STATUS_DELETE_STATUS,
  });
};

export const addStatus = data => {
  const URL = `${gServerPath}/statuses`;
  const options = createOptions(data);
  return requestWithTimeout({
    URL,
    data,
    options,
    errorMessage: '发布闪存失败!',
    actionType: types.STATUS_ADD_STATUS,
  });
};

export const resolveStatusHtml = (result)=>{
  let items:Array<any> = [];
  let matches = result.match(/class=\"entry_(a|b)\"[\s\S]+?clear[\s\S]+?(?=<\/li>[\s\S]*(<li|<\/ul))/g) || [];
  for (let match of matches) {
    let item:Partial<statusModel> = {};
    //解析digg
    // item.link = match.match(((/class=\"titlelnk\" href=\"[\s\S]+?(?=\")/))||[])[0]?.replace(/[\s\S]+="/,'');
    item.id = (match.match(/id=\"feed_content_\d+?(?=\")/)||[])[0]?.replace(/id=\"feed_content_/,'');
    // item.link = `https://news.cnblogs.com/q/${item.id}/`;
    //onclick="DiggPost('xiaoyangjia',11535486,34640,1)">
    item.title = '';
    //有一部分的内容里面是链接，所以不能按照贪婪匹配来replace
    item.summary = (match.match(/class=\"ing_body\"[\s\S]+?(?=<\/span)/)||[])[0]?.replace(/[\s\S]+?>/,'')?.trim();
    item.author = {
      id: '',
      avatar: (match.match(/class=\"feed_avatar\"[\s\S]+?src=\"[\s\S]+?(?=\")/)||[])[0]?.replace(/[\s\S]+\"/,''),
      uri: (match.match(/class=\"feed_avatar\"[\s\S]+?href=\"[\s\S]+?(?=\")/)||[])[0]?.replace(/[\s\S]+\"/,''),
      name: (match.match(/class=\"ing-author\"[\s\S]+?(?=<\/a)/)||[])[0]?.replace(/[\s\S]+>/,'')?.trim(),
      no: (match.match(/commentReply[\s\S]+?(?=\))/)||[])[0]?.replace(/[\s\S]+,/,'')?.trim(),
    };
    item.author.id = item.author?.uri.replace(/^[\s\S]+\/(?=[\s\S]+\/$)/,'').replace('/','');
    if(item.author.avatar!=undefined&&item.author.avatar!=''&&item.author.avatar.indexOf('http')!=0) {
      item.author.avatar = 'https:'+item.author.avatar;
    }
    if(item.author.uri!=undefined&&item.author.uri!=''&&item.author.uri.indexOf('http')!=0) {
      item.author.uri = 'https:'+item.author.uri;
    }
    item.published = (match.match(/class=\"ing_time[\s\S]+?(?=<\/a)/)||[])[0]?.replace(/[\s\S]+>/,'').replace('"','');
    if(/^\d{2}:\d{2}$/.test(item.published)) {
        item.published =moment().format('YYYY-MM-DD ')+item.published+':00';
    }
    //Todo:
    item.publishedDesc = '';
    item.reply = {
      author: (match.match(/class=\"replyBox\"[\s\S]+?class=\"feed_author\"[\s\S]+?(?=<\/a)/)||[])[0]?.replace(/[\s\S]+>/,'')?.trim(),
      authorUri: (match.match(/class=\"replyBox\"[\s\S]+?href=\"[\s\S]+?(?=\")/)||[])[0]?.replace(/[\s\S]+\"/,'')?.trim(),
    }
    item.commentCount = parseInt((match.match(/\d{0,6}回应[\s\S]+?(?=<\/a)/)||[])[0]?.replace(/[\s\S]+>/,'')?.trim(),)
    if(isNaN(item.commentCount)) {
      item.commentCount = 0;
    }
    item.comments = [];
    items.push(item);
  }
  return items;
}


export const resolveSearchStatusHtml = (result)=>{
  let items:Array<any> = [];
  let matches = result.match(/class=\"searchItem searchItem-ing\"[\s\S]+?searchItem-time\"[\s\S]+?[\s\S]+?(?=<\/div>)/g)|| [];
  for (let match of matches) {
    let item:Partial<statusModel> = {};
    item.id = '';
    item.link = (match.match(/class=\"searchItem-content\"[\s\S]+?href=\"[\s\S]+?(?=\")/)||[])[0]?.replace(/[\s\S]+="/,'');
    //onclick="DiggPost('xiaoyangjia',11535486,34640,1)">
    item.title = '';
    item.summary = (match.match(/class=\"searchItem-content\"[\s\S]+?(?=<\/a)/)||[])[0]?.replace(/[\s\S]+?href=\"[\s\S]+?\">/,'');
    item.author = {
      id: '',
      no: '',
      avatar: (match.match(/<img src=\"[\s\S]+?(?=\")/) || [])[0]?.replace(/[\s\S]+\"/,''),
      name: (match.match(/class=\"searchItem-user\"[\s\S]+?(?=\<\/a)/)||[])[0]?.replace(/[\s\S]+\>/,'')?.trim(),
      uri: (match.match(/class=\"searchItem-user\"[\s\S]+?href=\"[\s\S]+?(?=\")/)||[])[0]?.replace(/[\s\S]+\"/,''),
    };
    item.author.id = item.author?.uri?.replace(/^[\s\S]+\/(?=[\s\S]+\/$)/,'').replace('/','');
    item.published = (match.match(/\"searchItem-time\"[\s\S]+?(?=<\/a>)/)||[])[0]?.replace(/[\s\S]+>/,'')+':00';
    items.push(item);
  }
  return items;
}
