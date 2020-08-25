import {createOptions, requestWithTimeout} from '../utils/request';
import * as types from '../actions/actionTypes';
import RequestUtils from '../utils/requestUtils';
import {MyQuestionTypes, QuestionTypes} from '../pages/question/question_index';
import {SearchParams} from "../pages/home/home_search";
import {resolveSearchNewsHtml} from "./news";

export type questionModel = {
  id: string,
  link: string,
  //悬赏的金币
  gold: number,
  title: string,
  summary: string,
  author: {
    name: string,
    uri: string,
    id: string,
    avatar: string,
    level?: string,
    peans?: string
  },
  tags: Array<{
    name: string,
    uri: string
  }>,
  diggs: number,
  comments: number,
  commentList: Array<questionCommentModel>;
  views: number,
  published: string,
  publishedDesc: string,
  reply?: {
    author: string,
    authorUri: string,
    summary: string,
    uri: string
  }
};

export type questionCommentModel = {
  isBest: boolean;
  id: string;
  content: string;
  name: string;
  userId: string;
  level: string;
  peans: string;
  published: string;
  supportCount: string;
  rejectCount: string;
  avatar: string;
};

export type personQuestionIndex = {
  userId: string,
  integral: number,   //园豆
  prestige: number,   //声望
  rank: string,  //排名
};

export const getPersonQuestionIndex = (data:RequestModel<{userId: string}>) => {
  const URL = `https://q.cnblogs.com/u/${data.request.userId}`;
  return RequestUtils.get<personQuestionIndex>(URL, {
    resolveResult: (result)=>{
      let questionIndex = {} as Partial<personQuestionIndex>;
      questionIndex.userId = '';
      questionIndex.integral = parseInt((result.match(/class=\"my_rank\"[\s\S]+?园豆:\d+?(?=\D)/) || [])[0]?.replace(/^[\s\S]+:/,'') || '0');
      questionIndex.prestige = parseInt((result.match(/class=\"my_rank\"[\s\S]+?声望:\d+?(?=<)/) || [])[0]?.replace(/^[\s\S]+:/,'') || '0');
      questionIndex.rank = (result.match(/class=\"my_rank\"[\s\S]+?排名:[\s\S]+?(?=(\"|<))/) || [])[0]?.replace(/^[\s\S]+:/,'');
      return questionIndex;
    }
  });
};

export const getQuestionList = (data:RequestModel<{questionType:QuestionTypes,pageIndex:number}>) => {
  const URL = `https://q.cnblogs.com/list/${data.request.questionType}?page=${data.request.pageIndex}`;
  return RequestUtils.post<Array<questionModel>>(URL,data.request, {
    resolveResult: [QuestionTypes.新回答,QuestionTypes.新评论].indexOf(data.request.questionType)>=0?resolveQuestion1Html:resolveQuestionHtml
  });
};


export const getQuestionListByTag = (data:RequestModel<{tagName: string,pageIndex:number}>) => {
  const URL = `https://q.cnblogs.com/tag/${data.request.tagName}?page=${data.request.pageIndex}`;
  return RequestUtils.post<Array<questionModel>>(URL,data.request, {
    resolveResult: resolveQuestionHtml
  });
};


export const getOtherQuestionList = (data:RequestModel<{myQuestionType:MyQuestionTypes,userId:string,pageIndex:number}>) => {
  const URL = `https://q.cnblogs.com/u/${data.request.userId}/${data.request.myQuestionType}${data.request.pageIndex>1?('/'+data.request.pageIndex):''}`;
  return RequestUtils.get<Array<questionModel>>(URL, {
    resolveResult: resolveQuestionHtml
  });
};

export const getSearchQuestionList = (data: RequestModel<{Keywords: string,
  pageIndex: number,}&Partial<SearchParams>>) => {
  const URL = `https://zzk.cnblogs.com/s/question?Keywords=${data.request.Keywords}&pageindex=${data.request.pageIndex}
  ${data.request.ViewCount!=undefined?('&ViewCount='+data.request.ViewCount):''}
  ${data.request.DiggCount!=undefined?('&DiggCount='+data.request.DiggCount):''}
  ${data.request.DateTimeRange!=undefined?('&datetimerange='+data.request.DateTimeRange):''}
  ${data.request.DateTimeRange=='Customer'?`&from=${data.request.from}&to=${data.request.to}`:''}`;
  return RequestUtils.get(URL, {
    resolveResult: resolveSearchQuestionHtml
  });
};

export const checkIsAnswered = data => {
  const URL = `${gServerPath}/questions/${data.request.questionId}?userId=${
    data.request.userId
  }`;
  const options = createOptions(data, 'HEAD');
  return requestWithTimeout({
    URL,
    data,
    options,
    errorMessage: '检查问题是否回答失败!',
    actionType: types.QUESTION_CHECK_IS_ANSWERED,
  });
};

export const getQuestionDetail = data => {
  const URL = `https://q.cnblogs.com/q/${data.request.id}`;
  const options = createOptions(data, 'GET');
  return RequestUtils.get<questionModel>(URL, {
    resolveResult: (result)=>{
      let match = (result.match(/<div id=\"main[\s\S]+?id=\"right_sidebar\"/g) || [])[0];
      let question = {
        title: (match.match(/id=\"q_title[\s\S]+?(?=<\/a>)/)||[])[0]?.replace(/[\s\S]+>/,''),
        summary: (match.match(/class=\"q_content[\s\S]+?(?=<div class=\"qclear)/)||[])[0]?.trim()?.
        replace(/class=\"q_content\">/,'')?.trim()?.
        replace(/<\/div>/,'')?.trim(),
        author: {
          id: '',
          avatar: (match.match(/class=\"q_avatar\" src=\"[\s\S]+?(?=\")/)||[])[0]?.replace(/[\s\S]+\"/,''),
          name: (match.match(/class=\"question_author\"[\s\S]+?class=\"bluelink\"[\s\S]+?(?=<\/a>)/)||[])[0]?.replace(/[\s\S]+>/,''),
          level: (match.match(/href=\"\/q\/faq#qt\"[\s\S]+?(?=<\/a>)/)||[])[0]?.replace(/[\s\S]+>/,''),
          peans: (match.match(/id=\"question_user_allscore\"[\s\S]+?(?=<\/span>)/)||[])[0]?.replace(/[\s\S]+>/,''),
        },
        published: (match.match(/提问于：\d{4}-\d{2}-\d{2} \d{2}:\d{2}/)||[])[0]?.trim()?.replace(/提问于：/,'')+':00',
        tags: (()=>{
          let tagMatches = match.match(/class=\"detail_tag\"[\s\S]+?(?=<\/a>)/g) || [];
          let tags = [];
          for (let tagMatch of tagMatches) {
            tags.push({
              uri: 'https://q.cnblogs.com'+(tagMatch.match(/href=\"[\s\S]+?(?=\")/)||[])[0]?.replace(/[\s\S]+\"/,'')?.trim(),
              name: (tagMatch.match(/\">[\s\S]+?$/)||[])[0]?.replace(/[\s\S]+>/,''),
            });
          }
          return tags;
        })(),
        commentList: (()=>{
          let comments = [];
          //最佳答案(可能没有)
          let bestMatch = (match.match(/class=\"qitem_best_answer_inner[\s\S]+?(?=<div id=\"panelAnswerList)/)||[])[0];
          if(bestMatch) {
            comments.push({
              isBest: true,
              id: (bestMatch.match(/aid=\"[\s\S]+?(?=\")/)||[])[0]?.replace(/[\s\S]+\"/,''),
              content: (match.match(/class=\"q_content[\s\S]+?(?=id=\"answer_option)/)||[])[0]?.trim()?.
                replace(/class=\"q_content\">/,'')?.trim()?.
                replace(/<\/div>/,'')?.trim(),
              name: (bestMatch.match(/class=\"answer_author\"[\s\S]+?class=\"bluelink\"[\s\S]+?(?=<\/a>)/)||[])[0]?.replace(/[\s\S]+>/,''),
              userId: (bestMatch.match(/href=\"\/u\/[\s\S]+?(?=\/\")/)||[])[0]?.replace(/[\s\S]+\//,''),
              level: (bestMatch.match(/href=\"\/q\/faq#qt\"[\s\S]+?(?=<\/a>)/)||[])[0]?.replace(/[\s\S]+>/,''),
              peans: (bestMatch.match(/园豆：\d+/)||[])[0]?.trim()?.replace(/园豆：/,''),
              published: ((bestMatch.match(/v-split\"[\s\S]+?(?=<\/div>)/)||[])[0]?.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}/)||[])+':00',
              supportCount: (bestMatch.match(/支持\(\[\s\S]+?(?=<\/span>")/)||[])[0]?.trim()?.replace(/[\s\S]+>/,''),
              rejectCount: (bestMatch.match(/反对\(\[\s\S]+?(?=<\/span>")/)||[])[0]?.trim()?.replace(/[\s\S]+>/,''),
            });
          }
          //全部答案(里面不包含最佳答案)
          let allMatch = (match.match(/class=\"qitem_all_answer_inner[\s\S]+?(?=<div id=\"btnendqes)/)||[])[0];
          if(allMatch) {
            let allMatches = allMatch.match(/class=\"q_answeritem[\s\S]+?class=\"anscomment\"/g) || [];
            for (let tempMatch of allMatches) {
              console.log(tempMatch)
              comments.push({
                isBest: false,
                id: (tempMatch.match(/aid=\"[\s\S]+?(?=\")/)||[])[0]?.replace(/[\s\S]+\"/,''),
                content: (tempMatch.match(/class=\"q_content[\s\S]+?(?=id=\"answer_option)/)||[])[0]?.trim()?.
                  replace(/class=\"q_content\">/,'')?.trim()?.
                  replace(/<\/div>/,'')?.trim(),
                name: (tempMatch.match(/class=\"answer_author\"[\s\S]+?class=\"bluelink\"[\s\S]+?(?=<\/a>)/)||[])[0]?.replace(/[\s\S]+>/,''),
                userId: (tempMatch.match(/href=\"\/u\/[\s\S]+?(?=\/\")/)||[])[0]?.replace(/[\s\S]+\//,''),
                level: (()=>{
                  let temp = (tempMatch.match(/href=\"\/q\/faq#qt\"[\s\S]+?(?=<\/a>)/)||[])[0]?.replace(/[\s\S]+>/,'');
                  temp = temp.substr(1);
                  temp = temp.substr(0, temp.length-1);
                  return temp;
                })(),
                peans: (tempMatch.match(/园豆：\d+/)||[])[0]?.trim()?.replace(/园豆：/,''),
                published: ((tempMatch.match(/v-split\"[\s\S]+?(?=<\/div>)/)||[])[0]?.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}/)||[])+':00',
                supportCount: (tempMatch.match(/支持\(\[\s\S]+?(?=<\/span>")/)||[])[0]?.trim()?.replace(/[\s\S]+>/,''),
                rejectCount: (tempMatch.match(/反对\(\[\s\S]+?(?=<\/span>")/)||[])[0]?.trim()?.replace(/[\s\S]+>/,''),
              });
            }
          }
          return comments;
        })(),
      } as Partial<questionModel>;
      return question;
    }
  });
};

export const getQuestionCommentList = data => {
  const URL = `${gServerPath}/questions/answers/${data.request.id}/comments`;
  const options = createOptions(data, 'GET');
  return requestWithTimeout({
    URL,
    data,
    options,
    errorMessage: '获取问题评论失败!',
    actionType: types.QUESTION_GET_COMMENT_LIST,
  });
};

export const getQuestionAnswerList = data => {
  const URL = `${gServerPath}/questions/${data.request.id}/answers`;
  const options = createOptions(data, 'GET');
  return requestWithTimeout({
    URL,
    data,
    options,
    errorMessage: '获取问题回答失败!',
    actionType: types.QUESTION_GET_ANSWER_LIST,
  });
};

export const addQuestion = (data:RequestModel<{Title: string,Content: string,
  Tags?: string,
  PublishOption: boolean, //是否发布在博问首页 false:
  SaveOption: boolean, // 是否存为草稿
  FormatType: number, //2
  Award: number  //悬赏的园豆
  }>) => {
  const URL = `https://q.cnblogs.com/q/AddQuestion`;
  let formData = new FormData();
  for (let key in data.request) {
    formData.append(key,data.request[key]);
  }
  return RequestUtils.post<{isSuccess:boolean,responseText}>(URL, formData);
};

//修改tag无效(修复tags是单独修改的)
export const modifyQuestion = (data:RequestModel<{
  qid: number;
  Title: string;
  Content: string;
  PublishOption: boolean; //是否发布在博问首页 false:
}>) => {
  const URL = `https://q.cnblogs.com/q/ModiQuestion`;
  let formData = new FormData();
  for (let key in data.request) {
    formData.append(key,data.request[key]);
  }
  return RequestUtils.post<{isSuccess:boolean,responseText}>(URL, formData);
};

export const deleteQuestion = (data:RequestModel<{qid:number}>) => {
  const URL = `https://q.cnblogs.com/q/DelQuestion`;
  let formData = new FormData();
  for (let key in data.request) {
    formData.append(key,data.request[key]);
  }
  return RequestUtils.delete(URL, {
    data: formData
  });
};

export const closeQuestion = (data:RequestModel<{qid:number}>) => {
  const URL = `https://q.cnblogs.com/q/NoProperAnswer`;
  let formData = new FormData();
  for (let key in data.request) {
    formData.append(key,data.request[key]);
  }
  return RequestUtils.post(URL, formData);
};


export const answerQuestion = data => {
  const URL = `${gServerPath}/questions/${data.request.id}/answers?loginName=${
    data.request.loginName
  }`;
  const options = createOptions(data);
  return requestWithTimeout({
    URL,
    data,
    options,
    errorMessage: '回答问题失败!',
    actionType: types.QUESTION_ANSWER,
  });
};

//删除问答(只能删除自己的)
export const deleteQuestionAnswer = data => {
  const URL = `${gServerPath}/questions/${data.request.questionId}/answers/${
    data.request.answerId
  }`;
  const options = {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + gUserData.token,
    },
  };
  return requestWithTimeout({
    URL,
    data,
    options,
    errorMessage: '删除回答失败!',
    actionType: types.QUESTION_DELETE_ANSWER,
  });
};

//修改回答(只能修改自己的)
export const modifyQuestionAnswer = data => {
  const URL = `${gServerPath}/questions/${data.request.id}/answers/${
    data.request.answerId
  }`;
  const options = createOptions(data, 'PATCH');
  return requestWithTimeout({
    URL,
    data,
    options,
    errorMessage: '修改回答失败!',
    actionType: types.QUESTION_MODIFY_ANSWER,
  });
};

export const getAnswerCommentList = data => {
  const URL = `${gServerPath}/questions/answers/${
    data.request.answerId
  }/comments`;
  const options = createOptions(data, 'GET');
  return requestWithTimeout({
    URL,
    data,
    options,
    errorMessage: '获取回答评论失败!',
    actionType: types.QUESTION_GET_ANSWER_COMMENT_LIST,
  });
};

export const commentAswer = data => {
  const URL = `${gServerPath}/questions/${data.request.questionId}/answers/${
    data.request.answerId
  }/comments?loginName=${data.request.loginName}`;
  const options = createOptions(data);
  return requestWithTimeout({
    URL,
    data,
    options,
    errorMessage: '评论问题回答失败!',
    actionType: types.QUESTION_COMMENT_ANSWER,
  });
};

export const deleteAnswerComment = data => {
  const URL = `${gServerPath}/questions/${data.request.questionId}/answers/${
    data.request.answerId
  }/comments/${data.request.commentId}`;
  const options = createOptions(data, 'DELETE');
  return requestWithTimeout({
    URL,
    data,
    options,
    errorMessage: '删除评论失败!',
    actionType: types.QUESTION_DELETE_COMMENT_ANSWER,
  });
};

export const modifyAnswerComment = data => {
  const URL = `${gServerPath}/questions/${data.request.questionId}/answers/${
    data.request.answerId
  }/comments/${data.request.commentId}`;
  const options = createOptions(data, 'PATCH');
  return requestWithTimeout({
    URL,
    data,
    options,
    errorMessage: '修改评论失败!',
    actionType: types.QUESTION_MODIFY_COMMENT_ANSWER,
  });
};


export const resolveQuestionHtml = (result)=>{
  let items:Array<any> = [];
  let matches = result.match(/class=\"one_entity\"[\s\S]+?class=\"date\"[\s\S]+?(?=class=\"clear\")/g)|| [];
  for (let match of matches) {
    let item:Partial<questionModel> = {};
    //解析digg
    // item.link = match.match(((/class=\"titlelnk\" href=\"[\s\S]+?(?=\")/))||[])[0]?.replace(/[\s\S]+="/,'');
    //不能根据link来截取，部分link后面并不是id
    // item.id = item.link.replace(/[\s\S]+\//,'').replace(/\.[\s\S]+$/,'');
    item.id = (match.match(/id=\"news_item_\d+?(?=\")/)||[])[0]?.replace(/id=\"news_item_/,'');
    item.link = `https://news.cnblogs.com/q/${item.id}/`;
    item.gold = parseInt((match.match(/class=\"gold\"[\s\S]+?(?=<\/span)/)||[])[0]?.replace(/[\s\S]+>/,'')?.trim()||'0');
    //onclick="DiggPost('xiaoyangjia',11535486,34640,1)">
    item.title = (match.match(/class=\"news_entry\"[\s\S]+?(?=<\/a)/)||[])[0]?.replace(/[\s\S]+\>/,'');
    //可能有图片，也可能没图片
    item.summary = (match.match(/news_summary\"[\s\S]+?(?=\<\/div)/)||[])[0]?.replace(/[\s\S]+>/,'').trim();
    item.author = {
      id: '',
      avatar: (match.match(/的主页\"[\s\S]+?(?=\"\s{0,2}\/>)/)||[])[0]?.replace(/[\s\S]+\"/,''),
      uri: (match.match(/class=\"news_footer_user\"[\s\S]+?\"[\s\S]+?(?=\")/)||[])[0]?.replace(/[\s\S]+\"/,''),
      name: (match.match(/class=\"news_contributor\"[\s\S]+?(?=<\/a)/)||[])[0]?.replace(/[\s\S]+>/,'')?.trim(),
    };
    if(item.author.avatar!=undefined&&item.author.avatar!=''&&item.author.avatar.indexOf('http')!=0) {
      item.author.avatar = 'https:'+item.author.avatar;
    }
    if(item.author.uri!=undefined&&item.author.uri!='') {
      item.author.uri = 'https://q.cnblogs.com/'+item.author.uri;
      item.author.id = item.author?.uri.replace(/^[\s\S]+\/(?=[\s\S]+\/$)/,'').replace('/','');
    }
    let tagMatches = match.match(/class=\"detail_tag\"[\s\S]+?(?=<\/a>)/g) || [];
    item.tags = [];
    for (let tagMatch of tagMatches) {
      item.tags.push({
        uri: 'https://q.cnblogs.com'+(tagMatch.match(/href=\"[\s\S]+?(?=\")/)||[])[0]?.replace(/[\s\S]+\"/,'')?.trim(),
        name: (tagMatch.match(/\">[\s\S]+?$/)||[])[0]?.replace(/[\s\S]+>/,''),
      });
    }
    item.published = (match.match(/title=\"[\s\S]+?(?=class=\"date\")/)||[])[0]?.replace(/[\s\S]+?\"/,'').replace('"','');
    item.publishedDesc = (match.match(/class=\"date\">[\s\S]+?(?=<\/)/)||[])[0]?.replace(/[\s\S]+>/,'').replace('"','');
    item.comments = parseInt((match.match(/class=\"diggnum (answered|unanswered)\"[\s\S]+?(?=<\/div>)/)||[])[0]?.replace(/[\s\S]+>/,''));
    item.views = parseInt((match.match(/浏览\([\s\S]+?(?=\))/)||[])[0]?.replace(/[\s\S]+\(/,''));
    items.push(item);
  }
  return items;
}


export const resolveSearchQuestionHtml = (result)=>{
  let items:Array<any> = [];
  let matches = result.match(/class=\"searchItem\"[\s\S]+?(?=searchURL\"[\s\S]+?<\/div>)/g)|| [];
  for (let match of matches) {
    let item:Partial<questionModel> = {};
    item.id = '';
    item.link = (match.match(/class=\"searchItemTitle\"[\s\S]+?href=\"[\s\S]+?(?=\")/)||[])[0]?.replace(/[\s\S]+="/,'');
    item.gold = -1;
    //onclick="DiggPost('xiaoyangjia',11535486,34640,1)">
    item.title = (match.match(/class=\"searchItemTitle\"[\s\S]+?(?=<\/a)/)||[])[0]?.replace(/[\s\S]+?href=\"[\s\S]+?\">/,'');
    let summaryMatches = match.match(/class=\"searchCon\"[\s\S]+?(?=(<div class=\"searchCon|<!--end: searchCon -->))/)||[];
    //只显示问题，不需要答案
    item.summary = (summaryMatches[0]?.replace(/class=\"searchCon\">/,'').replace('问：','').trim().match(/[\s\S]+(?=<\/div>)/)||[])[0];
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

//新回答和新评论的格式不一样
export const resolveQuestion1Html = (result)=>{
  let items:Array<any> = [];
  let matches = result.match(/class=\"feed_item\"[\s\S]+?class=\"feed_title_tip\"[\s\S]+?(?=class=\"clear\")/g) || [];
  for (let match of matches) {
    let item:Partial<questionModel> = {};
    //解析digg
    // item.link = match.match(((/class=\"titlelnk\" href=\"[\s\S]+?(?=\")/))||[])[0]?.replace(/[\s\S]+="/,'');
    item.id = (match.match(/href=\"\/q\/\d+/)||[])[0]?.replace(/[\s\S]+\//,'');
    item.link = `https://news.cnblogs.com/q/${item.id}/`;
    item.gold = parseInt((match.match(/class=\"gold\"[\s\S]+?(?=<\/span)/)||[])[0]?.replace(/[\s\S]+>/,'')?.trim()||'0');
    //onclick="DiggPost('xiaoyangjia',11535486,34640,1)">
    item.title = '';
    item.summary = (match.match(/class=\"feed_title_tip\"[\s\S]+?(?=<\/div)/)||[])[0]?.replace(/[\s\S]+\>/,'')?.trim();
    item.author = {
      id: '',
      avatar: (match.match(/class=\"feed_avatar\"[\s\S]+?img src=\"[\s\S]+?(?=\")/)||[])[0]?.replace(/[\s\S]+\"/,''),
      uri: (match.match(/class=\"feed_body\"[\s\S]+?href=\"[\s\S]+?(?=\")/)||[])[0]?.replace(/[\s\S]+\"/,''),
      name: (match.match(/class=\"feed_author\"[\s\S]+?(?=<\/a)/)||[])[0]?.replace(/[\s\S]+>/,'')?.trim(),
    };
    if(item.author.avatar!=undefined&&item.author.avatar!=''&&item.author.avatar.indexOf('http')!=0) {
      item.author.avatar = 'https:'+item.author.avatar;
    }
    if(item.author.uri!=undefined&&item.author.uri!='') {
      item.author.uri = 'https://q.cnblogs.com/'+item.author.uri;
    }
    item.tags = [];
    item.published = (match.match(/class=\"replyBox_a\"[\s\S]+?class=\"feed_title_tip\"[\s\S]+?(?=<\/a)/)||[])[0]?.replace(/[\s\S]+>/,'').replace('"','');
    //Todo:
    item.publishedDesc = '';
    item.reply = {
      author: (match.match(/class=\"replyBox\"[\s\S]+?class=\"feed_author\"[\s\S]+?(?=<\/a)/)||[])[0]?.replace(/[\s\S]+>/,'')?.trim(),
      authorUri: (match.match(/class=\"replyBox\"[\s\S]+?href=\"[\s\S]+?(?=\")/)||[])[0]?.replace(/[\s\S]+\"/,'')?.trim(),
      uri: (match.match(/class=\"replyBox_a\"[\s\S]+?href=\"[\s\S]+?(?=\")/)||[])[0]?.replace(/[\s\S]+\"/,'')?.trim(),
      summary: (match.match(/class=\"replyBox_a\"[\s\S]+?href=\"[\s\S]+?(?=<\/a)/)||[])[0]?.replace(/[\s\S]+>/,'')?.trim(),
    }
    item.comments = 0;
    item.views = 0;
    items.push(item);
  }
  return items;
}
