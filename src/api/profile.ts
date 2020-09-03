import RequestUtils from "../utils/requestUtils";


export type getUserAliasByUserNameRequest = RequestModel<{
  userName: string;
  //用于保存到本地
  userId?: string;
  fuzzy: boolean;
}>;

export type followingModel = {
  uuid: string,
  uri: string,
  name: string,
  id: string,
  avatar: string
}

export type fullUserInfoModel = {
  uuid: string,
  name: string,
  avatar: string,
  link: string,
  seniority: string,
  follows: number,
  stars: number,
  nickName: string,
  isStar: boolean
};

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


export const getFullUserInfo = (data:RequestModel<{userId:string}>) => {
  const URL = `https://home.cnblogs.com/u/${data.request.userId}/`;
  return RequestUtils.get<fullUserInfoModel>(URL, {
      resolveResult: (result)=>{
        //Todo:完善信息
        let user:Partial<fullUserInfoModel> = {};
        user.avatar = (result.match(/class=\"user_avatar[\s\S]+?src=\"[\s\S]+?(?=\")/)||[])[0]?.replace(/[\s\S]+\"/,'');
        if(user.avatar.indexOf('http')!==0) {
          user.avatar = 'https:'+user.avatar;
        }
        //出现了部分详情页没有图片，但是动态中有图片
        if(user.avatar=='https://pic.cnblogs.com/avatar/simple_avatar.gif') {
          let avatar = (result.match(/class=\"feed_avatar\"[\s\S]+?<img[\s\S]+?(?=\">)/)||[])[0]?.replace(/[\s\S]+\"/,'');
          if(avatar && avatar.indexOf('http')!==0) {
            avatar = 'https:'+avatar;
            user.avatar = avatar;
          }
        }
        user.uuid = ((result.match(/var currentUserId = \"[\s\S]+?(?=\")/) || [])[0])?.replace(/[\s\S]+\"/,'');
        user.seniority = ((result.match(/入园时间：[\s\S]+?(?=<\/span>)/) || [])[0])?.replace(/[\s\S]+>/,'');
        user.isStar = /id=\"followedPanel\"[\s\S]{2,10}\"display:block\">/.test(result);
        //可能
        user.link = ((result.match(/博客：[\s\S]+?(?=<\/a>)/) || [])[0])?.replace(/[\s\S]+>/,'');
        user.name = ((result.match(/display_name\"[\s\S]+?(?=<\/h1>)/) || [])[0])?.replace(/[\s\S]+>/,'')?.trim();
        user.stars = parseInt(((result.match(/id=\"following_count\"[\s\S]+?followees\/\"[\s\S]+?(?=<\/a>)/) || [])[0])?.replace(/[\s\S]+>/,'')?.trim());
        user.follows = parseInt(((result.match(/id=\"following_count\"[\s\S]+?followers\/\"[\s\S]+?(?=<\/a>)/) || [])[0])?.replace(/[\s\S]+>/,'')?.trim());
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

export const getUserAvatarByNo = (data:RequestModel<{userNo:string}>) => {
  const URL = `https://home.cnblogs.com/u/${data.request.userNo}/`;
  return RequestUtils.get<{id: string,
    avatar: string,
    nickName: string,
    link: string,}>(URL, {
    resolveResult: (result)=>{
      let user:any = {};
      user.avatar = (result.match(/class=\"user_avatar[\s\S]+?src=\"[\s\S]+?(?=\")/)||[])[0]?.replace(/[\s\S]+\"/,'');
      if(user.avatar.indexOf('http')!==0) {
        user.avatar = 'https:'+user.avatar;
      }
      return user;
    }
  });
};


export const getStarListByUserId = (data:RequestModel<{userId:string,pageIndex: number}>) => {
  const URL = `https://home.cnblogs.com/u/${data.request.userId}/relation/following?page=${data.request.pageIndex}`;
  return RequestUtils.get<Array<followingModel>>(URL, {
    resolveResult: resolveUserHtml
  });
};

export const getFollowerListByUserId = (data:RequestModel<{userId:string,pageIndex: number}>) => {
  const URL = `https://home.cnblogs.com/u/${data.request.userId}/relation/followers?page=${data.request.pageIndex}`;
  return RequestUtils.get<Array<followingModel>>(URL, {
    resolveResult: resolveUserHtml
  });
};


export const followUser = (data:RequestModel<{userUuid:string,remark?:string}>) => {
  data.request.remark = '';
  const URL = `https://home.cnblogs.com/ajax/follow/followUser?userId=${data.request.userUuid}&remark=${data.request.remark}`;
  return RequestUtils.post<{IsSucceed: boolean}>(URL, data.request);
};


export const unfollowUser = (data:RequestModel<{userUuid:string,isRemoveGroup?:boolean}>) => {
  data.request.isRemoveGroup = false;
  const URL = `https://home.cnblogs.com/ajax/follow/RemoveFollow?userId=${data.request.userUuid}&isRemoveGroup=${data.request.isRemoveGroup}`;
  return RequestUtils.post<{IsSucceed: boolean}>(URL, data.request);
};


export const resolveUserHtml = (result)=>{
  let users:any = [] as Array<followingModel>;
  let matches = (result.match(/class=\"avatar_list[\s\S]+src=\"[\s\S]+?(?=<\/ul>)/)||[])[0]?.match(/<li[\s\S]+?<\/li>/g) || [];
  console.log(matches)
  for (let match of matches) {
    let user = {
      uuid: (match.match(/id=\"[\s\S]+?(?=\")/) || [])[0]?.replace(/[\s\S]+\"/,''),
      uri: (match.match(/<a href=\"[\s\S]+?(?=\")/) || [])[0]?.replace(/[\s\S]+\"/,''),
      name: (match.match(/<a[\s\S]+?(?=\">)/) || [])[0]?.replace(/[\s\S]+\"/,''),
      avatar: (match.match(/<img src=\"[\s\S]+?(?=\")/) || [])[0]?.replace(/[\s\S]+\"/,''),
      id: ''
    };
    user.uri = 'https://home.cnblogs.com'+user.uri;
    if(user.avatar!=undefined&&user.avatar!=''&&user.avatar.indexOf('http')!=0) {
      user.avatar = 'https:'+user.avatar;
    }
    user.id = user?.uri.replace(/^[\s\S]+\//,'');
    users.push(user);
  }
  return users;
}
