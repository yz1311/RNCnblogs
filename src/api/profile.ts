import {requestWithTimeout, createOptions} from '../utils/request';
import * as types from '../actions/actionTypes';
import RequestUtils from "../utils/requestUtils";


export type getUserAliasByUserNameRequest = RequestModel<{
  userName: string;
  //用于保存到本地
  userId?: string;
  fuzzy: boolean;
}>;

export const getPersonInfo = (data:RequestModel<{userAlias: string}>) => {
  const URL = `https://www.cnblogs.com/${
      data.request.userAlias
  }/ajax/news.aspx`;
  return RequestUtils.get<{seniority: string,
    follows: string,
    stars: string,
    nickName: string,}>(URL,{
    resolveResult: (result)=>{
      if (!result) {
        throw Error('该用户暂时没有博客！');
      }
      let seniority = '', follows = 0, stars = 0, nickName = '';
      let matches = result.match(/园龄：[\s\S]+?>[\s\S]+?<\//);
      if (matches && matches.length > 0) {
        let temp = matches[0].replace('</', '');
        seniority = temp
            .substr(temp.lastIndexOf('>'))
            .replace('>', '')
            .replace('"', '')
            .trim();
      }
      matches = result.match(/粉丝：[\s\S]+?>[\s\S]+?<\//);
      if (matches && matches.length > 0) {
        let temp = matches[0].replace('</', '');
        follows = temp
            .substr(temp.lastIndexOf('>'))
            .replace('>', '')
            .replace('"', '')
            .trim();
      }
      matches = result.match(/关注：[\s\S]+?>[\s\S]+?<\//);
      if (matches && matches.length > 0) {
        let temp = matches[0].replace('</', '');
        stars = temp
            .substr(temp.lastIndexOf('>'))
            .replace('>', '')
            .replace('"', '')
            .trim();
      }
      matches = result.match(/昵称：[\s\S]+?>[\s\S]+?<\//);
      if (matches && matches.length > 0) {
        let temp = matches[0].replace('</', '');
        nickName = temp
            .substr(temp.lastIndexOf('>'))
            .replace('>', '')
            .replace('"', '')
            .trim();
      }
      return {
        seniority: seniority,
        follows,
        stars,
        nickName,
      };
    }
  });
};

export const getPersonSignature = data => {
  const URL = `https://www.cnblogs.com/${data.request.userAlias}`;
  return RequestUtils.get<{age: string,
    follows: string,
    stars: string,
    nickName: string,}>(URL, {
        resolveResult: (result) => {
          let matches = result.match(
              /class="headermaintitle"[\s\S]+?>[\s\S]+?<\/h2/,
          );
          if (matches && matches.length > 0) {
            matches = matches[0].match(/<h2>[\s\S]+?<\/h2/);
          }
          if (matches && matches.length > 0) {
            let temp = matches[0].replace('<h2>', '').replace('</h2', '');
            return temp;
          }
          return '';
        }
      }
  );
};

export const getUserAliasByUserName = (data: getUserAliasByUserNameRequest) => {
  const URL = `http://wcf.open.cnblogs.com/blog/bloggers/search?t=${
    data.request.userName
  }`;
  return RequestUtils.get<Array<{id: string,
    title: string,
    updated: string,
    blogapp: string,
    postcount: string,
    link: string,}>>(URL);
};


export const getUserInfo = (data:RequestModel<{userId:string}>) => {
  const URL = `https://home.cnblogs.com/u/${data.request.userId}/`;
  return RequestUtils.get<{id: string,
    avatar: string,
    nickName: string,
    link: string,}>(URL, {
      resolveResult: (result)=>{
        //Todo:完善信息
        let user:any = {};
        user.avatar = (result.match(/class=\"user_avatar[\s\S]+?src=\"[\s\S]+?(?=\")/)||[])[0]?.replace(/[\s\S]+\"/,'');
        if(user.avatar.indexOf('http')!==0) {
          user.avatar = 'https:'+user.avatar;
        }
        return user;
      }
  });
};


export const getUserAvatar = (data:RequestModel<{userId:string}>) => {
  const URL = `https://home.cnblogs.com/u/${data.request.userId}/detail/`;
  return RequestUtils.get<{id: string,
    avatar: string,
    nickName: string,
    link: string,}>(URL, {
    resolveResult: (result)=>{
      let user:any = {};
      user.avatar = (result.match(/class=\"user_detail_left[\s\S]+?src=\"[\s\S]+?(?=\")/)||[])[0]?.replace(/[\s\S]+\"/,'');
      if(user.avatar.indexOf('http')!==0) {
        user.avatar = 'https:'+user.avatar;
      }
      return user;
    }
  });
};
