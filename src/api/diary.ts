import RequestUtils from "../utils/requestUtils";
import moment from 'moment';


export type addDiaryResponseModel = {
    blogUrl: string,  // "//www.cnblogs.com/yz1311/"
    dateAdded: string,  // "2020-05-08T18:03:52.0202449+08:00"
    entryName: string,  // null
    id: number,  //12852209
    postType: number,  //128
    title: string,  // "博客园App配置"
    url: string,  // "//www.cnblogs.com/yz1311/diary/2020/05/08/12852209.html"
};

export type getDiaryListResponseModel = {
    categoryName: string,  //""
    pageSize: number,  //10
    postList: Array<diaryModel>,
    postsCount: number
}

export type diaryModel = {
    aggCount: number,  //0
    datePublished: string,  //"2020-05-08T18:14:00"
    dateUpdated: string,  //"2020-05-08T18:14:00"
    entryName: string,  //null
    feedBackCount: number,  //0
    id: number,  //12852265
    isPublished: boolean,  //false
    postConfig: number,  //16448
    postType: number,  //128
    title: string,  //"sfsdf"
    url: string,  //"//www.cnblogs.com/yz1311/diary/2020/05/08/12852265.html"
    viewCount: number,  //0
    webCount: number,  //0
}

const postBody = {
  author: null,
  //保存之前的内容
  autoDesc: null,
  blogId: 0,
  blogTeamIds: null,
  canChangeCreatedTime: false,
  categoryIds: null,
  changeCreatedTime: false,
  changePostType: false,
  description: null,
  displayOnHomePage: false,
  entryName: null,
  id: null,
  inSiteCandidate: false,
  inSiteHome: false,
  includeInMainSyndication: false,
  ip: null,
  isAllowComments: false,
  isDraft: true,
  isMarkdown: true,
  isOnlyForRegisterUser: false,
  isPinned: false,
  isPublished: true,
  isUpdateDateAdded: false,
  password: null,
  postType: 128,
  removeScript: false,
  siteCategoryId: null,
  tags: null,
  url: null,
};

/**
 * 添加日记
 * @param data
 */
export const addDiary = (data:RequestModel<{title:string, body: string}>) => {
    let body = {
      ...postBody,
      //初次发布
      datePublished: moment().format('YYYY-MM-DD HH:mm:ss'),
      postBody: data.request.body,
      title: data.request.title,
    };
    const URL = `https://i.cnblogs.com/api/posts`;
    return RequestUtils.post<addDiaryResponseModel>(URL, body);
};

export const updateDiary = (data:RequestModel<{lastContent: string,blogId: number,
  id: number, url: string, datePublished: string,
  title:string, body: string}>) => {
  let body = {
    ...postBody,
    author: '做一个清醒者',
    autoDesc: data.request.lastContent,
    datePublished: data.request.datePublished,
    blogId: data.request.blogId,
    id: data.request.id,
    isDraft: false,
    isPublished: false,
    url: data.request.url,
    postBody: data.request.body,
    title: data.request.title,
  };
  const URL = `https://i.cnblogs.com/api/posts`;
  return RequestUtils.post<addDiaryResponseModel>(URL, body, {
    headers: {
      'x-blog-id': data.request.blogId
    }
  });
};

/**
 * 获取日记列表
 * @param data
 */
export const getDiaryList = (data:RequestModel<{pageIndex: number}>) => {
    const URL = `https://i.cnblogs.com/api/posts/list?p=${data.request.pageIndex}&cid=&tid=&t=128&cfg=0`;
    return RequestUtils.get<getDiaryListResponseModel>(URL);
}


export const getDiaryContent = (data:RequestModel<{url: string}>) => {
  const URL = data.request.url;
  return RequestUtils.get<{
    blogId: number,
    body: string
  }>(URL, {
    resolveResult: (result)=>{
      return {
        blogId: (result.match(/var currentBlogId[\s\S]+?(?=;)/) || [])[0]
          ?.replace(/^[\s\S]+?=/,'')
          ?.trim(),
        body: (result.match(/id=\"cnblogs_post_body\"[\s\S]+?\">[\s\S]+?(?=id=\"MySignature\")/) || [])[0]
          ?.replace(/id=\"cnblogs_post_body\"[\s\S]+?\">/,'')
          ?.trim()
          ?.replace(/^<p>/,'')
          ?.replace(/<\/p>[\s\S]+/,'')
          ?.replace(/&quot;/g,'"')
          ?.trim()
      };
    }
  });
}

