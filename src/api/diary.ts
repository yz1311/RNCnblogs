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

/**
 * 添加日记
 * @param data
 */
export const addDiary = (data:RequestModel<{title:string, body: string}>) => {
    const postBody = {
        author: null,
        autoDesc: null,
        blogId: 0,
        blogTeamIds: null,
        canChangeCreatedTime: false,
        categoryIds: null,
        changeCreatedTime: false,
        changePostType: false,
        datePublished: moment().format('YYYY-MM-DD HH:mm:ss'),
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
        postBody: data.request.body,
        postType: 128,
        removeScript: false,
        siteCategoryId: null,
        tags: null,
        title: data.request.title,
        url: null,
    };
    const URL = `https://i.cnblogs.com/api/posts`;
    return RequestUtils.post<addDiaryResponseModel>(URL, postBody);
};

/**
 * 获取日记列表
 * @param data
 */
export const getDiaryList = (data:RequestModel<{pageIndex: number}>) => {
    const URL = `https://i.cnblogs.com/api/posts/list?p=${data.request.pageIndex}&cid=&tid=&t=128&cfg=0`;
    return RequestUtils.get<getDiaryListResponseModel>(URL);
}


