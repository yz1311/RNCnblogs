import {requestWithTimeout, createOptions} from '../utils/request';
import * as types from '../actions/actionTypes';
import RequestUtils from "../utils/requestUtils";
import {QuestionTypes} from "../pages/question/question_index";
import {questionModel, resolveQuestion1Html, resolveQuestionHtml, resolveSearchQuestionHtml} from "./question";
import {StatusTypes} from "../pages/status/status_index";
import moment from "moment";
import {SearchParams} from "../pages/home/home_search";
import {Api} from "./index";
import cheerio from "react-native-cheerio";
import {AxiosResponse} from "axios";

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
  //回复的闪存
  orign: {
    uri: string;
    title: string;
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
  今日最热闪存: Array<statusModel>,
  今日闪存明星: Array<{
    id: string;
    name: string;
    avatar: string;
  }>,
  最新幸运闪: Array<statusModel>
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
  return RequestUtils.get<Array<statusModel>>(URL, {
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


export const getUnviewedStatusCount = (data: RequestModel<{}>) => {
  //获取提到我和回复我的数量
  return new Promise<AxiosResponse<{metionCount: number; replyCount: number;}>>(async (resolve, reject) => {
    try {
      let [mentionResonse, replyResponse] = await Promise.all([
          RequestUtils.get('https://ing.cnblogs.com/ajax/ing/UnviewedMentionCount'),
          RequestUtils.get('https://ing.cnblogs.com/ajax/ing/UnviewedReplyToMeCount'),
      ]);
      resolve({
        data: {
          metionCount: mentionResonse.data,
          replyCount: replyResponse.data,
        }
      } as AxiosResponse);
    } catch (e) {
      reject(e);
    }
  })
};

export const getStatusDetail = (data: RequestModel<{id: string, userId: string}>) => {
  const URL = `https://ing.cnblogs.com/u/${data.request.userId}/status/${data.request.id}/`;
  return RequestUtils.get<statusModel>(URL, {
    resolveResult: (result)=>{
      let detail = {
        id: data.request.id,
        link: URL,
        title: '',
        summary: (result.match(/id=\"ing_detail_body\"[\s\S]+?(?=<\/div>[\s\S]+?<span class=\"text_gray)/)||[])[0]
            ?.replace(/[\s\S]+?>/,'').trim(),
        author: {
          id: data.request.userId,
          name: (result.match(/class=\"ing_item_author\"[\s\S]+?(?=<\/a>)/)||[])[0]?.replace(/[\s\S]+>/,''),
          avatar: (result.match(/class=\"ing_item_face\"[\s\S]+?src=\"[\s\S]+?(?=\")/)||[])[0]?.replace(/[\s\S]+\"/,''),
          uri: `https://home.cnblogs.com/u/${data.request.userId}/`,
        },
        published: (result.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/)||[])[0],
        publishedDesc: '',
        commentCount: parseInt((result.match(/ing_comment_count\">\d{0,6}(?=个回应)/)||[])[0]?.replace(/[\s\S]+>/,'')?.trim(),),
      } as Partial<statusModel>;
      if(isNaN(detail.commentCount)) {
        detail.commentCount = 0;
      }
      return detail;
    }
  });
};

export const getStatusOtherInfo = data => {
  const URL = `https://ing.cnblogs.com/ajax/ing/SideRight`;
  return RequestUtils.get<statusOtherInfoModel>(URL,{
    resolveResult: async (result) => {
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
      let realItems1 = [];
      for (let item of info.今日最热闪存) {
        try {
          let reponse = await Api.status.getStatusDetail({
            request: {
              userId: item.author.id,
              id: item.id
            }
          });
          realItems1.push(reponse.data);
        } catch (e) {

        }
      }
      info.今日最热闪存 = realItems1;
      let realItems2 = [];
      for (let item of info.最新幸运闪) {
        try {
          let reponse = await Api.status.getStatusDetail({
            request: {
              userId: item.author.id,
              id: item.id
            }
          });
          realItems2.push(reponse.data);
        } catch (e) {

        }
      }
      info.最新幸运闪 = realItems2;
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
        } else if(/^\d{1,2}-\d{1,2} \d{2}:\d{2}$/.test(comment.published)) {
          comment.published =moment(moment().year()+'-'+comment.published+':00').format('YYYY-MM-DD HH:mm:ss');
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


/**
 * 设置单个的回复我的闪存为已读
 * @param data
 */
export const updateReplyToMeViewStatus = (data: RequestModel<{commentId: string}>) => {
  const URL = `https://ing.cnblogs.com/ajax/ing/UpdateReplyToMeViewStatus`;
  return RequestUtils.get<statusModel>(URL);
};

/**
 * 设置单个的提及我的闪存为已读
 * @param data
 */
export const updateMentionViewStatus = (data: RequestModel<{commentId: string}>) => {
  const URL = `https://ing.cnblogs.com/ajax/ing/UpdateMentionViewStatus`;
  return RequestUtils.get<statusModel>(URL);
};

export const resolveStatusHtml = (result)=>{
  let items:Array<any> = [];
  const $ = cheerio.load(result, { decodeEntities: false });
  $('li[class^=entry_]').each(function (index, element) {
    let item:Partial<statusModel> = {};
    let match = $(this).html();
    //解析digg
    item.id = (match.match(/id=\"feed_content_\d+?(?=\")/)||[])[0]?.replace(/id=\"feed_content_/,'');
    item.title = '';
    //有一部分的内容里面是链接，所以不能按照贪婪匹配来replace
    item.summary = $(this).find('span[class=ing_body][id^=ing_body_]').html();
    item.author = {
      id: '',
      avatar: $(this).find('div.feed_avatar').find('img').attr('src'),
      uri:
          (match.match(/class=\"feed_avatar\"[\s\S]+?href=\"[\s\S]+?(?=\")/)||[])[0]?.replace(/[\s\S]+\"/,'')
          || $(this).find('a[id^=comment_author_]').attr('href'),
      name: $(this).find('a.ing-author').text() || $(this).find('a[id^=comment_author_]').text(),
      no: (match.match(/showCommentBox[\s\S]+?(?=\))/)||[])[0]?.replace(/[\s\S]+,/,'')?.trim(),
    };
    item.author.id = item.author?.uri.replace(/^[\s\S]+\/(?=[\s\S]+\/$)/,'').replace('/','');
    if(item.author.avatar!=undefined&&item.author.avatar!=''&&item.author.avatar.indexOf('http')!=0) {
      item.author.avatar = 'https:'+item.author.avatar;
    }
    if(item.author.uri!=undefined&&item.author.uri!=''&&item.author.uri.indexOf('http')!=0) {
      item.author.uri = 'https:'+item.author.uri;
    }
    //说明是回复我的
    if($(this).find('div.comment-body-topline').length>0) {
      item.orign = {
        uri: $(this).find('div.comment-body-topline>a:nth-child(2)').attr('href'),
        title: $(this).find('div.comment-body-topline>a:nth-child(2)').text(),
      }
    }
    item.published = $(this).find('a[class^="ing_time"]').text();
    if(/^\d{2}:\d{2}$/.test(item.published)) {
      item.published =moment().format('YYYY-MM-DD ')+item.published+':00';
    } else if(/^\d{1,2}-\d{1,2} \d{2}:\d{2}$/.test(item.published)) {
      item.published =moment(moment().year()+'-'+item.published+':00').format('YYYY-MM-DD HH:mm:ss');
    }
    //Todo:
    item.publishedDesc = '';
    item.commentCount = parseInt($(this).find('a[class^="ing_reply"]').text().replace(/回应/,'')?.trim());
    if(isNaN(item.commentCount)) {
      item.commentCount = 0;
    }
    item.comments = [];
    item.isPrivate = /title=\"私有闪存\"/.test(match);
    items.push(item);
  });
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
