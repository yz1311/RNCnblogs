import RequestUtils from "../utils/requestUtils";
import {decode as atob, encode as btoa} from 'base-64'
import {Alert} from "@yz1311/teaset";
import {ServiceTypes} from "../pages/YZTabBarView";


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
  collects: number;
  Tags: Array<any>;
}

export type bookmarkTagModel = {
  name: string;
  num: number;
};

export type addBookmarkRequestModel = RequestModel<{
  wzLinkId?: string,
  url: string,  //"https://www.cnblogs.com/manupstairs/p/12196909.html#commentform"
  title: string,  //".NET Core学习笔记（3）——async/await中的Exception处理 - 楼上那个蜀黍 - 博客园"
  tags: string,  //tags
  summary: string,  //summary
}>;

export type checkIsBookmarkRequest = RequestModel<{
  title: string;
  url: string,
  id: string,
}> & {serviceType: ServiceTypes};

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
  return RequestUtils.get<Array<bookmarkModel>>(URL, {
    resolveResult: resolveBookmarkHtml
  });
};

export const searchBookmarkList = (data:RequestModel<{pageIndex: number,keyword?:string}>) => {
  let URL = `https://wz.cnblogs.com/my/search/${data.request.keyword}/${data.request.pageIndex}`;
  return RequestUtils.get<Array<bookmarkModel>>(URL, {
    resolveResult: resolveBookmarkHtml
  });
};


export const deleteBookmark = (data:RequestModel<{id: string}>) => {
  const URL = `https://wz.cnblogs.com/api/wz/${data.request.id}`;
  return RequestUtils.delete(URL);
};

//用户文章中直接取消收藏
export const deleteBookmarkByTitle = (data:RequestModel<{title: string}>) => {
  //先根据标题搜索我的收藏，然后获取到wzId，然后再使用checkIsBookmarkMyId进行筛选
  return new Promise(async (resolve,reject)=>{
    try {
      let response = await searchBookmarkList({
        request: {
          pageIndex: 1,
          keyword: data.request.title
        },
        showErrorToast: false
      });
      if(response.data.length==0) {
        Alert.alert('','修改过文章标题的收藏暂不支持取消，是否前往收藏中心进行取消?',[{
          text: '取消'
        }, {
          text: '前往',
          onPress:()=>{

          }
        }]);
        reject(new Error('取消失败'));
        return;
      }
      resolve(await deleteBookmark({
        request: {
          id: response.data[0].id
        }
      }));
    } catch (e) {
      reject(e);
    }
  });
};

export const addBookmark = (data:addBookmarkRequestModel) => {
  data.request.wzLinkId = '0';
  const URL = `https://wz.cnblogs.com/api/wz`;
  return RequestUtils.post<{success:boolean, message:string}>(URL, data.request);
};

export const modifyBookmark = (data:RequestModel<{wzLinkId:string,url:string,title:string,tags?:string,summary?:string}>) => {
  const URL = `https://wz.cnblogs.com/api/wz`;
  return RequestUtils.put(URL, data.request);
};

export const checkIsBookmark = (data: checkIsBookmarkRequest) => {
  if(data.serviceType==ServiceTypes.博客) {
    let t = data.request.title;
    try {
      t = btoa(unescape(encodeURIComponent(t)));
    } catch (e) {
      t = encodeURIComponent(t.replace(/</g, "&lt;").replace(/>/g, "&gt;"));
    }
    let URL = '';
    switch (data.serviceType) {
      case ServiceTypes.博客:
        URL = `http://wz.cnblogs.com/create?t=${t}&u=${encodeURIComponent(data.request.url)}&c=${encodeURIComponent("")}&bid=${data.request.id}&i=0&base64=1`;
        break;
        //新闻不支持查询，因为跟博客不一样，需要点击后才知道是否已经收藏了
      default:
        URL = `https://wz.cnblogs.com/create?t=${data.request.title}&u=${encodeURIComponent(data.request.url)}&c=&i=0`;
        break;
    }
    return RequestUtils.get<boolean>(URL, {
      resolveResult: (result) => {
        return !/选择标签/.test(result);
      }
    });
  } else {
    //先根据标题搜索我的收藏，然后获取到wzId，然后再使用checkIsBookmarkMyId进行筛选
    return new Promise(async (resolve:(data:{data:boolean})=>void,reject)=>{
      try {
        let response = await searchBookmarkList({
          request: {
            pageIndex: 1,
            keyword: data.request.title
          }
        });
        resolve({
          data: response.data.length>0
        });
      } catch (e) {
        reject(e);
      }
    });
  }
};

export const checkIsBookmarkMyId = (data: RequestModel<{id:string}>) => {
  const URL = `https://wz.cnblogs.com/copy/${data.request.id}/`;
  return RequestUtils.get<boolean>(URL,{
    resolveResult:(result)=>{
      return !/选择标签/.test(result);
    }
  });
}

export const getBookmarkTags = (data: RequestModel<{}>) => {
  const URL = `https://wz.cnblogs.com/mytag/`;
  return RequestUtils.get<Array<any>>(URL,{
    resolveResult: resolveBookmarkTagHtml
  });
}

//修改标签名称(不能跟原名称一样)
export const modifyBookmarkTagName = (data: RequestModel<{tagName: string, newTagName: string}>) => {
  const URL = `https://wz.cnblogs.com/api/tag`;
  return RequestUtils.put<{success: boolean, message: string}>(URL,data.request);
}

//删除标签
export const deleteBookmarkTag = (data: RequestModel<{tagName: string}>) => {
  const URL = `https://wz.cnblogs.com/api/tag/?tagName=${data.request.tagName}`;
  return RequestUtils.delete<{success: boolean, message: string}>(URL);
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

export const resolveBookmarkTagHtml = (result)=>{
  let items:Array<any> = [];
  let matches = result.match(/<li data-tagname[\s\S]+?(?=<\/a>)/g)|| [];
  for (let match of matches) {
    match = decode(match);
    let item:Partial<bookmarkTagModel> = {};
    item.name = (match.match(/data-tagname=\"[\s\S]+?(?=\")/)||[])[0]?.replace(/[\s\S]+\"/,'');
    item.num = (match.match(/\"\(\d+(?=\)\")/)||[])[0]?.replace(/\"\(/,'');
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
