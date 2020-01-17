import {requestWithTimeout, createOptions} from '../utils/request';
import * as types from '../actions/actionTypes';
import RequestUtils from "../utils/requestUtils";
import {
  blogCommentModel,
  blogModel,
  getBlogCommentListRequest,
  getBlogDetailRequest,
  resolveBlogCommentHtml,
  resolveBlogHtml
} from "./blog";
import {NewsTypes} from '../pages/news/news_index';
import {Api} from "./index";
import {AxiosResponse} from "axios";
import {MessageTypes} from '../pages/message/message_index';
import moment from 'moment';
import {statusModel} from './status';

export type messageModel = {
  id: string,
  title: string,
  link: string,
  author: {
    id: string,
    avatar: string,
    uri: string,
    name: string,
    no: string,
  },
  statusDesc: string,
  published: string
};

export type getMessageListRequest = RequestModel<{
  pageIndex: number
}> & {messageType: MessageTypes};

export const getMessageList = (data: getMessageListRequest) => {
  let url = '';
  switch (data.messageType) {
    case MessageTypes.收件箱:
      url = `https://msg.cnblogs.com/inbox/${data.request.pageIndex}`;
      break;
    case MessageTypes.发件箱:
      url = `https://msg.cnblogs.com/outbox/${data.request.pageIndex}`;
      break;
    case MessageTypes.未读消息:
      url = `https://msg.cnblogs.com/unread/${data.request.pageIndex}`;
      break
  }
  return RequestUtils.post<Array<messageModel>>(url,data.request, {
    resolveResult: (result)=>{
      console.log(result)
      let matches = [];
      switch (data.messageType) {
        case MessageTypes.收件箱:
          return resolveInboxHtml(result);
          break;
        case MessageTypes.发件箱:
          return resolveOutboxHtml(result);
          break;
        case MessageTypes.未读消息:

          break
      }
    }
  });
};

export const resolveInboxHtml = (result)=>{
  let items:Array<any> = [];
  let matches = result.match(/id=\"msg_item_[\s\S]+?(?=<\/tr>)/g) || [];
  for (let match of matches) {
    let item:Partial<messageModel> = {};
    item.id = (match.match(/id=\"msg_item_\d+?(?=\")/)||[])[0]?.replace(/id=\"msg_item_/,'');
    item.link = `https://msg.cnblogs.com/item/${item.id}/`;
    item.title = (match.match(/id=\"msg_title_[\s\S]+?(?=<\/a)/)||[])[0]?.replace(/[\s\S]+>/,'')?.trim();
    item.author = {
      id: '',
      avatar: '',
      uri: (match.match(/class=\"contactLink\"[\s\S]+?href=\"[\s\S]+?(?=\")/)||[])[0]?.replace(/[\s\S]+\"/,''),
      name: (match.match(/class=\"contactLink\"[\s\S]+?(?=<\/a)/)||[])[0]?.replace(/[\s\S]+>/,'')?.trim(),
      no: '',
    };
    item.author.no = item.author?.uri?.replace(/^[\s\S]+\/(?=[\s\S]+\/$)/,'').replace('/','');
    if(item.author.uri!=undefined&&item.author.uri!=''&&item.author.uri.indexOf('http')!=0) {
      item.author.uri = 'https:'+item.author.uri;
    }
    item.published = (match.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}/)||[])[0];
    items.push(item);
  }
  return items;
}

export const resolveOutboxHtml = (result)=>{
  let items:Array<any> = [];
  let matches = result.match(/id=\"msg_item_[\s\S]+?(?=<\/tr>)/g) || [];
  for (let match of matches) {
    let item:Partial<messageModel> = {};
    item.id = (match.match(/id=\"msg_item_\d+?(?=\")/)||[])[0]?.replace(/id=\"msg_item_/,'');
    item.link = `https://msg.cnblogs.com/item/${item.id}/`;
    item.statusDesc = (match.match(/<td>[\s\S]+?(?=<\/td>)/)||[])[0]?.replace(/[\s\S]+>/,'');
    item.title = (match.match(/(class=\"text_overflow_ellipsis[\s\S]+?){2}(?=<\/a)/)||[])[0]?.replace(/[\s\S]+>/,'')?.trim();
    item.author = {
      id: '',
      avatar: '',
      uri: (match.match(/class=\"contactLink\"[\s\S]+?href=\"[\s\S]+?(?=\")/)||[])[0]?.replace(/[\s\S]+\"/,''),
      name: (match.match(/class=\"contactLink\"[\s\S]+?(?=<\/a)/)||[])[0]?.replace(/[\s\S]+>/,'')?.trim(),
      no: '',
    };
    item.author.no = item.author?.uri?.replace(/^[\s\S]+\/(?=[\s\S]+\/$)/,'').replace('/','');
    if(item.author.uri!=undefined&&item.author.uri!=''&&item.author.uri.indexOf('http')!=0) {
      item.author.uri = 'https:'+item.author.uri;
    }
    item.published = (match.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}/)||[])[0];
    items.push(item);
  }
  return items;
}

