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
  isPrivate: boolean;
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

export type statusOtherInfoModel = {
  今日星星排行榜: Array<{
    id: string;
    name: string;
    avatar: string;
    //星星数量
    starNum: number;
  }>,
  今日最热闪存: Array<{
    author: {
      id: string;
      name: string;
    },
    id: string;
    content: string;
    replyCount: number;
  }>,
  今日闪存明星: Array<{
    id: string;
    name: string;
    avatar: string;
  }>,
  最新幸运闪: Array<{
    author: {
      id: string;
      name: string;
    },
    id: string;
    content: string;
    replyCount: number;
  }>
}

export const getStatusList = (data:RequestModel<{statusType:StatusTypes,pageIndex:number,pageSize:number, tag?:string}>) => {
  const URL = `https://ing.cnblogs.com/ajax/ing/GetIngList?IngListType=${data.request.statusType}&PageIndex=${data.request.pageIndex}&PageSize=${data.request.pageSize}${data.request.tag?('&Tag='+data.request.tag):''}`;
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

export const getStatusDetail = (data: RequestModel<{id: string, userId: string}>) => {
  const URL = `https://ing.cnblogs.com/u/${data.request.userId}/status/${data.request.id}/`;
  //Todo:获取详情
  const options = createOptions(data, 'GET');
  return requestWithTimeout({
    URL,
    data,
    options,
    errorMessage: '获取闪存详情失败!',
    actionType: types.STATUS_GET_DETAIL,
  });
};

export const getStatusOtherInfo = data => {
  const URL = `https://ing.cnblogs.com/ajax/ing/SideRight`;
  return RequestUtils.get<statusOtherInfoModel>(URL, {
    resolveResult: (result) => {
      let info = {
        今日星星排行榜: (()=>{
          let tempMatch = (result.match(/今日星星排行榜[\s\S]+?<\/ul>/) || [])[0];
          let items = [];
          if(tempMatch) {
            let matches = tempMatch.match(/class=\"avatar_block_wrapper\"[\s\S]+?<\/li>/g) || [];
            for (let match of matches) {
              items.push({
                id: (match.match(/ing\.cnblogs\.com\/u\/[\s\S]+?(?=\/)/) || [])[0]?.replace(/[\s\S]+\//, ''),
                avatar: (match.match(/<img src=\"[\s\S]+?(?=\" alt)/) || [])[0]?.replace(/[\s\S]+\"/, ''),
                name: (match.match(/class=\"user_name_block[\s\S]+?(?=<\/a>)/) || [])[0]?.replace(/[\s\S]+>/, ''),
                starNum: parseInt((match.match(/\d+?(?=颗星<\/span>)/) || [])[0]),
              });
            }
          }
          return items;
        })(),
        今日最热闪存: (()=>{
          let tempMatch = (result.match(/今日最热闪存[\s\S]+?<\/ul>/) || [])[0];
          let items = [];
          if(tempMatch) {
            let matches = tempMatch.match(/<li>[\s\S]+?<\/li>/g) || [];
            for (let match of matches) {
              items.push({
                author: {
                  id: (match.match(/home\.cnblogs\.com\/u\/[\s\S]+?(?=\/)/)||[])[0]?.replace(/[\s\S]+\//,''),
                  name: (match.match(/home\.cnblogs\.com\/u\/[\s\S]+?(?=<\/a>)/)||[])[0]?.replace(/[\s\S]+>/,''),
                },
                id: (match.match(/\/status\/[\s\S]+?(?=\/)/)||[])[0]?.replace(/[\s\S]+\//,''),
                content: (match.match(/\/status\/[\s\S]+?(?=<\/a>)/)||[])[0]?.replace(/[\s\S]+>/,''),
                replyCount: (match.match(/\(\d+?(?=\))/)||[])[0]?.replace(/\(/,''),
              });
            }
          }
          return items;
        })(),
        今日闪存明星: (()=>{
          let tempMatch = (result.match(/今日闪存明星[\s\S]+?<\/ul>/) || [])[0];
          let items = [];
          if(tempMatch) {
            let matches = result.match(/class=\"avatar_block_wrapper\"[\s\S]+?<\/li>/g) || [];
            for (let match of matches) {
              items.push({
                id: (match.match(/ing\.cnblogs\.com\/u\/[\s\S]+?(?=\/)/) || [])[0]?.replace(/[\s\S]+\//, ''),
                avatar: (match.match(/<img src=\"[\s\S]+?(?=\" alt)/) || [])[0]?.replace(/[\s\S]+\"/, ''),
                name: (match.match(/class=\"user_name_block[\s\S]+?(?=<\/a>)/) || [])[0]?.replace(/[\s\S]+>/, ''),
              });
            }
          }
          return items;
        })(),
        最新幸运闪: (()=>{
          let tempMatch = (result.match(/最新幸运闪[\s\S]+?<\/ul>/) || [])[0];
          let items = [];
          if(tempMatch) {
            let matches = tempMatch.match(/<li>[\s\S]+?<\/li>/g) || [];
            for (let match of matches) {
              items.push({
                author: {
                  id: (match.match(/home\.cnblogs\.com\/u\/[\s\S]+?(?=\/)/)||[])[0]?.replace(/[\s\S]+\//,''),
                  name: (match.match(/home\.cnblogs\.com\/u\/[\s\S]+?(?=<\/a>)/)||[])[0]?.replace(/[\s\S]+>/,''),
                },
                id: (match.match(/\/status\/[\s\S]+?(?=\/)/)||[])[0]?.replace(/[\s\S]+\//,''),
                content: (match.match(/\/status\/[\s\S]+?(?=<\/a>)/)||[])[0]?.replace(/[\s\S]+>/,''),
                replyCount: (match.match(/\(\d+?(?=\))/)||[])[0]?.replace(/\(/,''),
              });
            }
          }
          return items;
        })(),
      }  as statusOtherInfoModel;
      return info;
    }
  });
};

export const getStatusCommentList = (data:RequestModel<{id:string,userAlias:string}>) => {
  //直接接口多了会显示浏览更多
  // const URL = `https://ing.cnblogs.com/ajax/ing/SingleIngComments?ingId=${data.request.id}`;
  const URL = `https://ing.cnblogs.com/u/${data.request.userAlias}/status/${data.request.id}/`;
  return RequestUtils.get<Array<statusCommentModel>>(URL, {
    resolveResult: (result)=>{
      let matches = result.match(/<li id=\"comment_[\s\S]+?<\/li>/g) || [];
      let comments = [];
      let index = 1;
      for (let match of matches) {
        let comment = {} as Partial<statusCommentModel>;
        comment.title = '';
        comment.id = (match.match(/id=\"comment_[\s\S]+?(?=\")/)||[])[0]?.replace(/id=\"comment_/,'')?.trim(),
        comment.summary = (match.match(/<bdo>[\s\S]+?(?=<\/bdo>)/)||[])[0]?.replace(/<bdo>/,'')?.trim();
        comment.author = {
          id: '',
          uri: (match.match(/id=\"comment_author_[\s\S]+?href=\"[\s\S]+?(?=\")/)||[])[0]?.replace(/[\s\S]+\"/,''),
          name: (match.match(/id=\"comment_author_[\s\S]+?(?=\<\/a)/)||[])[0]?.replace(/[\s\S]+>/,'').trim(),
          avatar: ((match.match(/<img src=\"https:\/\/pic.cnblogs.com\/face\/[\s\S]+?\" (?=class=\"ing_comment_face\")/)||[])
              [0]?.match(/\"[\s\S]+?(?=\")/)||[])[0]?.replace(/"/g,""),
          no: (match.match(/commentReply[\s\S]+?(?=\))/)||[])[0]?.replace(/[\s\S]+,/,'')?.trim(),
        };
        comment.author.id = comment.author?.uri.replace(/^[\s\S]+\/(?=[\s\S]+\/$)/,'').replace('/','');
        comment.published = (match.match(/title=\"\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?=\")/)||[])[0]?.replace(/title=\"/,'');
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

export const deleteStatusComment = (data:RequestModel<{commentId: number}>) => {
  const URL = `https://ing.cnblogs.com/ajax/ing/DeleteComment`;
  let formData = new FormData();
  formData.append('commentId',data.request.commentId);
  return RequestUtils.post<{isSuccess:boolean,message:string}>(URL, formData);
};

export const deleteStatus = (data:RequestModel<{ingId: number}>) => {
  const URL = `https://ing.cnblogs.com/ajax/ing/del`;
  let formData = new FormData();
  formData.append('ingId',data.request.ingId);
  return RequestUtils.post<{isSuccess:boolean,responseText}>(URL, formData);
};

export const addStatus = (data:RequestModel<{publicFlag: 1|0,content:string}>) => {
  const URL = `https://ing.cnblogs.com/ajax/ing/Publish`;
  let formData = new FormData();
  formData.append('content',data.request.content);
  formData.append('publicFlag',data.request.publicFlag);
  return RequestUtils.post<{isSuccess:boolean,responseText}>(URL, formData);
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
    item.summary = (match.match(/<bdo>[\s\S]+?(?=<a class=\"ing_time gray)/)||[])[0]?.trim();
    item.author = {
      id: '',
      avatar: (match.match(/class=\"feed_avatar\"[\s\S]+?src=\"[\s\S]+?(?=\")/)||[])[0]?.replace(/[\s\S]+\"/,''),
      uri: (match.match(/class=\"feed_avatar\"[\s\S]+?href=\"[\s\S]+?(?=\")/)||[])[0]?.replace(/[\s\S]+\"/,''),
      name: (match.match(/class=\"ing-author\"[\s\S]+?(?=<\/a)/)||[])[0]?.replace(/[\s\S]+>/,'')?.trim(),
      no: (match.match(/showCommentBox[\s\S]+?(?=\))/)||[])[0]?.replace(/[\s\S]+,/,'')?.trim(),
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
    item.isPrivate = /title=\"私有闪存\"/.test(match);
    items.push(item);
  }
  return items;
}


export const resolveSearchStatusHtml = (result)=>{
  let items:Array<any> = [];
  let matches = result.match(/class=\"searchItem searchItem-ing\"[\s\S]+?searchItem-time\"[\s\S]+?[\s\S]+?(?=<\/div>)/g)|| [];
  for (let match of matches) {
    let item:Partial<statusModel> = {};
    item.link = (match.match(/class=\"searchItem-content\"[\s\S]+?href=\"[\s\S]+?(?=\")/)||[])[0]?.replace(/[\s\S]+="/,'');
    item.id = (item.link.match(/status\/[\s\S]+?(?=\/)/) || [])[0]?.replace(/[\s\S]+\//,'');
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
    item.isPrivate = /title=\"私有闪存\"/.test(match);
    items.push(item);
  }
  return items;
}
