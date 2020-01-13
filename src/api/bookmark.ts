import {requestWithTimeout, createOptions} from '../utils/request';
import * as types from '../actions/actionTypes';
import {StatusTypes} from "../pages/status/status_index";
import RequestUtils from "../utils/requestUtils";
import {questionModel} from "./question";
import {resolveStatusHtml} from "./status";
import {blogModel, resolveBlogHtml} from "./blog";
import Axios from "axios";

export type myTagModel = {
  name: string,
  uri: string
};

export type bookmarkModel = {
  id: string,
  link: string,
  title: string,
  summary: string,
  published: string,
  publishedDesc: string,
  collects: number
}

export type checkIsBookmarkRequest = RequestModel<{
  url: string;
}>;

export const getMyTags = (data:RequestModel<{}>) => {
  console.log(global.unescape)
  const URL = `https://wz.cnblogs.com/mytag/`;
  return RequestUtils.get<Array<myTagModel>>(URL, {
    resolveResult: (result)=>{
      let matches = result.match(/data-tagname=\"[\s\S]+?(?=\")/g)|| [];
      return matches.map(x=>{
        let name = x.replace(/[\s\S]+\"/,'');
        return {
          name,
          uri: `https://wz.cnblogs.com/my/tag/${name}`
        } as myTagModel
      })
    }
  });
}

export const getBookmarkList = (data:RequestModel<{bookmarkType:string,pageIndex: number,rangeType?: 'oneday'|'oneweek'|'onemonth'|'all'}>) => {
  let URL = '';
  switch (data.request.bookmarkType) {
    case '热门':
      URL = `https://wz.cnblogs.com/hot/${data.request.rangeType||'oneday'}/${data.request.pageIndex}`;
      break;
    case '我的':
      URL = `https://wz.cnblogs.com/my/${data.request.pageIndex}.html`;
      break;
    default:
      URL = `https://wz.cnblogs.com/my/tag/${data.request.bookmarkType}/${data.request.pageIndex}.html`;
      break;
  }
  return RequestUtils.get(URL, {
    resolveResult: resolveBookmarkHtml
  });
};

export const deleteBookmark = (data:RequestModel<{id: string}>) => {
  const URL = `https://wz.cnblogs.com/api/wz/${data.request.id}`;
  return RequestUtils.delete(URL);
};

//用户文章中直接取消收藏
export const deleteBookmarkByUrl = data => {
  const URL = `${gServerPath}/bookmarks?url=${data.request.url}`;
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
    errorMessage: '删除书签失败!',
    actionType: types.BOOKMARK_DELETE,
  });
};

export const addBookmark = data => {
  const URL = `${gServerPath}/bookmarks`;
  const options = createOptions(data, 'POST');
  return requestWithTimeout({
    URL,
    data,
    options,
    errorMessage: '添加书签失败!',
    actionType: types.BOOKMARK_ADD,
  });
};

export const modifyBookmark = data => {
  const URL = `${gServerPath}/bookmarks/${data.request.id}`;
  const options = createOptions(data, 'PATCH');
  return requestWithTimeout({
    URL,
    data,
    options,
    errorMessage: '修改书签失败!',
    actionType: types.BOOKMARK_MODIFY,
  });
};

//这个接口很奇怪，statusCode,404为不存在，2xx为存在
export const checkIsBookmark = (data: checkIsBookmarkRequest) => {
  const URL = `${gServerPath}/bookmarks?url=${data.request.url}`;
  const options = createOptions(data, 'HEAD');
  return requestWithTimeout({
    URL,
    data,
    options,
    errorMessage: '检查书签失败!',
    actionType: types.BOOKMARK_CHECK_IS,
  });
};

export const checkIsBookmarkMyId = (data: RequestModel<{id:string}>) => {
  const URL = `https://wz.cnblogs.com/copy/${data.request.id}/`;
  return RequestUtils.get<boolean>(URL,{
    resolveResult:(result)=>{
      return !/选择标签/.test(result);
    }
  });
}


export const resolveBookmarkHtml = (result)=>{
  let items:Array<any> = [];
  let matches = result.match(/class=\"wz_block\"[\s\S]+?(?=clear\")/g)|| [];
  for (let match of matches) {
    match = decode(match);
    let item:Partial<bookmarkModel> = {};
    item.link = (match.match(/rel="nofollow" href=\"[\s\S]+?(?=\")/)||[])[0]?.replace(/[\s\S]+\"/,'');
    //不能根据link来截取，部分link后面并不是id
    //id="link_5343159"
    item.id = (match.match(/id=\"link_\d+?(?=\")/)||[])[0]?.replace(/id=\"link_/,'');
    item.title = (match.match(/rel="nofollow" href=\"[\s\S]+?(?=<\/a>)/)||[])[0]?.replace(/[\s\S]+>/,'');
    item.summary = (match.match(/class='summary'[\s\S]+?(?=<\/di)/)||[])[0]?.replace(/[\s\S]+>/,'');
    item.published = (match.match(/收藏于[\s\S]+?title=\"[\s\S]+?(?=\")/)||[])[0]?.replace(/[\s\S]+\"/,'');
    item.publishedDesc = (match.match(/收藏于[\s\S]+?title=\"[\s\S]+?(?=<\/span)/)||[])[0]?.replace(/[\s\S]+>/,'');
    item.collects = parseInt((match.match(/wz_item_count\">[\s\S]+?(?=<\/)/)||[])[0]?.replace(/[\s\S]+>/,''));
    items.push(item);
  }
  return items;
}

//返回的是unicode字符串，需要解码才能操作
const decode = (str) => {
  // 一般可以先转换为标准 unicode 格式（有需要就添加：当返回的数据呈现太多\\\u 之类的时）
  str = unescape(str.replace(/\\u/g, "%u"));
  // 再对实体符进行转义
  // 有 x 则表示是16进制，$1 就是匹配是否有 x，$2 就是匹配出的第二个括号捕获到的内容，将 $2 以对应进制表示转换
  str = str.replace(/&#(x)?(\w+);/g, function($, $1, $2) {
    return String.fromCharCode(parseInt($2, $1? 16: 10));
  });

  return str;
}
