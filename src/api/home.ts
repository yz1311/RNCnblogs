import {requestWithTimeout, createOptions} from '../utils/request';
import * as types from '../actions/actionTypes';
import RequestUtils from '../utils/requestUtils';

export interface rankModel {
  id: string,
  index: number,
  name: string,
  no: string,
  avator: string,
  link: string,
  lastUpdate: string,
  blogCount: number

}

export interface searchUserModal {
  id: string;
  name: string;
  avatar: string;
}

export const searchData = data => {
  const URL = `${gServerPath}/ZzkDocuments/${data.request.category}?keyWords=${
    data.request.keyWords
  }&pageIndex=${data.request.pageIndex}&pageSize=${
    data.request.pageSize
  }&viewTimesAtLeast=1`;
  const options = createOptions(data, 'GET');
  return requestWithTimeout({
    URL,
    data,
    options,
    errorMessage: '获取搜索列表失败!',
    actionType: types.HOME_SEARCH_GET_LIST,
  });
};


export const rankList = (data:RequestModel<{}>) => {
  const URL = `https://www.cnblogs.com/AllBloggers.aspx`;
  return RequestUtils.get<Array<rankModel>>(URL, {
    resolveResult: (result)=>{
      let items:Array<any> = [];
      let matches = (result.match(/<tbody>[\s\S]+?(?=<\/tbody>)/g)|| [])[0]
        ?.match(/<td>[\s\S]+?<\/td>/g);
      for (let match of matches) {
        let item:Partial<rankModel> = {};
        item.index = parseInt((match.match(/<small>[\s\S]+?(?=<\/small>)/)||[])[0]?.replace(/<small>/,'')?.trim());
        item.name = (match.match(/<a[\s\S]+?(?=<\/a>)/)||[])[0]?.replace(/[\s\S]+?>/,'');
        item.link = (match.match(/<a href=\"[\s\S]+?(?=\")/)||[])[0]?.replace(/<a href=\"/,'');
        item.id = item.link?.replace('https://www.cnblogs.com/','')?.replace('/','');
        item.no = (match.match(/<small>\([\s\S]+?(?=\)<\/small>)/)||[])[0]?.replace(/[\s\S]+,/,'')?.trim();
        item.lastUpdate = (match.match(/<small>\([\s\S]+?(?=\)<\/small>)/)||[])[0]
          ?.replace(/[\s\S]+?\(/,'')
          ?.split(',')[1]?.trim();
        item.blogCount = parseInt((match.match(/<small>\([\s\S]+?(?=\)<\/small>)/)||[])[0]
          ?.replace(/[\s\S]+?\(/,'')
          ?.split(',')[0]?.trim());
        items.push(item);
      }
      return items;
    }
  });
};


export const uploadFile = (data: RequestModel<{file, fileName: string}>) => {
  const URL = `https://upload.cnblogs.com/imageuploader/processupload?host=q.cnblogs.com&qqfile=${data.request.fileName}`;
  let formData = new FormData();
  formData.append('file', {
    uri: data.request.file.path,
    type: 'application/octet-stream',
    name: data.request.fileName
  });
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data;charset=utf-8',
      Authorization: 'Bearer ' + gUserData.token,
    },
    body: formData,
  };
  return requestWithTimeout({
    URL,
    data,
    options,
    errorMessage: '上传文件失败!',
    actionType: '',
  });
};

export const searchUsers = (data:RequestModel<{name: string, pageIndex: number}>) => {
  //分页是30个
  const URL = `https://home.cnblogs.com/user/search.aspx?key=${data.request.name}&page=${data.request.pageIndex}`;
  return RequestUtils.get<Array<searchUserModal>>(URL, {
    resolveResult: (result) => {
      let items:Array<searchUserModal> = [];
      let matches = result.match(/class=\"d-flex flex-column max-width[\s\S]+?(?=<\/li>)/g)|| [];
      for (let match of matches) {
        let item:Partial<searchUserModal> = {};
        item.name = (match.match(/target=\"_blank\" title=\"[\s\S]+?(?=\")/)||[])[0]?.replace(/[\s\S]+\"/,'');
        item.avatar = (match.match(/<img src=\"[\s\S]+?(?=\")/)||[])[0]?.replace(/[\s\S]+\"/,'');
        if(item.avatar.indexOf('https:')===0) {
          item.avatar = 'https:' + item.avatar;
        }
        item.id = (match.match(/href=\"\/u\/[\s\S]+?(?=\/)/)||[])[0]?.replace(/[\s\S]+\//,'');
        items.push(item as searchUserModal);
      }
      return items;
    }
  });
};
