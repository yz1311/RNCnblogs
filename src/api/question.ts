import {createOptions, requestWithTimeout} from '../utils/request';
import * as types from '../actions/actionTypes';
import RequestUtils from '../utils/requestUtils';
import {QuestionTypes} from '../pages/question/question_index';
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
  },
  tags: Array<{
    name: string,
    uri: string
  }>,
  diggs: number,
  comments: number,
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

export const getQuestionList = (data:RequestModel<{questionType:QuestionTypes,pageIndex:number}>) => {
  const URL = `https://q.cnblogs.com/list/${data.request.questionType}?page=${data.request.pageIndex}`;
  return RequestUtils.post<Array<questionModel>>(URL,data.request, {
    resolveResult: [QuestionTypes.新回答,QuestionTypes.新评论].indexOf(data.request.questionType)>=0?resolveQuestion1Html:resolveQuestionHtml
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
  const URL = `${gServerPath}/questions/${data.request.id}`;
  const options = createOptions(data, 'GET');
  return requestWithTimeout({
    URL,
    data,
    options,
    errorMessage: '获取问题详情失败!',
    actionType: types.QUESTION_GET_DETAIL,
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

export const addQuestion = data => {
  const URL = `${gServerPath}/questions`;
  const options = createOptions(data);
  return requestWithTimeout({
    URL,
    data,
    options,
    errorMessage: '提问失败!',
    actionType: types.QUESTION_ADD_QUESTION,
  });
};

export const deleteQuestion = data => {
  const URL = `${gServerPath}/questions/${data.request.questionId}`;
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
    errorMessage: '删除提问失败!',
    actionType: types.QUESTION_DELETE_QUESTION,
  });
};

//修改tag无效
export const modifyQuestion = data => {
  const URL = `${gServerPath}/questions/${data.request.questionId}`;
  const options = createOptions(data, 'PATCH');
  return requestWithTimeout({
    URL,
    data,
    options,
    errorMessage: '修改问题失败!',
    actionType: types.QUESTION_MODIFY_QUESTION,
  });
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
    item.comments = parseInt((match.match(/回答\([\s\S]+?(?=\))/)||[])[0]?.replace(/[\s\S]+\(/,''));
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

//新回答和新评论的格式不一样
export const resolveQuestion1Html = (result)=>{
  let items:Array<any> = [];
  let matches = result.match(/class=\"feed_item\"[\s\S]+?class=\"feed_title_tip\"[\s\S]+?(?=class=\"clear\")/g) || [];
  for (let match of matches) {
    let item:Partial<questionModel> = {};
    //解析digg
    // item.link = match.match(((/class=\"titlelnk\" href=\"[\s\S]+?(?=\")/))||[])[0]?.replace(/[\s\S]+="/,'');
    item.id = (match.match(/id=\"feed_content_\d+?(?=\")/)||[])[0]?.replace(/id=\"feed_content_/,'');
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
