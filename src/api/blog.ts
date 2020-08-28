import RequestUtils, {dataToReducerResult} from "../utils/requestUtils";
import {SearchParams} from "../pages/home/home_search";
const cheerio = require('react-native-cheerio');

export type blogModel = {
  id: string;
  title: string;
  //是否置顶
  isSticky: boolean;
  link: string;
  summary: string;
  author: {
    name: string,
    uri: string,
    avatar: string,
    id: string
  };
  blogapp: string;
  published: string;
  views: number;
  comments: number;
  diggs: number;
};

export type blogCommentModel = {
  author: {
    name: string,
    uri: string,
    avatar: string,
    id: string
  };
  title: string;
  published: string;
  updated: string;
  content: string;
  Floor: number;
  id: number;
  //本地新增
  UserId: number | string;
};

export type getBlogListRequest = RequestModel<{
  blogApp?: string;
  CategoryType?: string
  ItemListActionName?: string;
  ParentCategoryId?: number,
  CategoryId?: number,
  PageIndex: number;
  TotalPostCount?: number;
}>;

export type getBlogDetailRequest = RequestModel<{
  // id: string;
  url: string
}>;

export type getBlogCommentListRequest = RequestModel<{
  blogApp?: string;
  userId?: string;
  postId: number;
  pageIndex: number;
  pageSize: number;
}>;

export const getPersonalBlogList = async (data: RequestModel<{pageIndex:number,pageSize:number,userId?: string}>) => {
  if(!data.request.userId) {
    data.request.userId = gUserData.userId;
  }
  const URL = `https://www.cnblogs.com/${data.request.userId}/default.html?page=${data.request.pageIndex}`;
  //首先用head获取状态，如果为404则表示该用户没有开通博客
  try {
    let response = await RequestUtils.head(URL, null, {
      showErrorToast: false
    });
  } catch (e) {
    if(e.status === 404) {
      return Promise.reject(new Error('该用户未开通博客！'))
    }
  }
  return RequestUtils.get(URL, {
    resolveResult: resolvePersonalBlogHtml
  });
};

export const getPickedBlogList = (data: getBlogListRequest) => {
  data.request.ItemListActionName = 'AggSitePostList';
  data.request.ParentCategoryId = 0;
  const URL = `https://www.cnblogs.com/AggSite/AggSitePostList`;
  return RequestUtils.post(URL, data.request, {
    resolveResult: resolveBlogHtml
  });
};


export const getSearchBlogList = (data: RequestModel<{Keywords: string,
  pageIndex: number,}&Partial<SearchParams>>) => {
  const URL = `https://zzk.cnblogs.com/s/blogpost?Keywords=${data.request.Keywords}&pageindex=${data.request.pageIndex}
  ${data.request.ViewCount!=undefined?('&ViewCount='+data.request.ViewCount):''}
  ${data.request.DiggCount!=undefined?('&DiggCount='+data.request.DiggCount):''}
  ${data.request.DateTimeRange!=undefined?('&datetimerange='+data.request.DateTimeRange):''}
  ${data.request.DateTimeRange=='Customer'?`&from=${data.request.from}&to=${data.request.to}`:''}`;
  return RequestUtils.get(URL, {
    resolveResult: resolveSearchBlogHtml
  });
};


export const getHomeBlogList = (data: getBlogListRequest) => {
  data.request.CategoryId = 808;
  data.request.CategoryType = 'SiteHome';
  data.request.ItemListActionName = 'AggSitePostList';
  data.request.ParentCategoryId = 0;
  const URL = `https://www.cnblogs.com/AggSite/AggSitePostList`;
  return RequestUtils.post(URL, data.request, {
    resolveResult: resolveBlogHtml
  });
};

export const getFollowingBlogList = (data: getBlogListRequest) => {
  data.request.ItemListActionName = 'AggSitePostList';
  data.request.ParentCategoryId = 0;
  data.request.TotalPostCount = 80;
  const URL = `https://www.cnblogs.com/aggsite/postlistbygroup`;
  return RequestUtils.post(URL, data.request, {
    resolveResult: (result) => {
      return resolveBlogHtml(result.postList);
    }
  });
};

export const getBlogDetail = (data: getBlogDetailRequest) => {
  //由于搜索的博客没有id，所以移除该方法
  // const URL = `http://wcf.open.cnblogs.com/blog/post/body/${data.request.id}`;
  // return RequestUtils.get<string>(URL, {
  //   autoResolveXML: false
  // });
  return RequestUtils.get<{body:string,id:string}>(data.request.url, {
    resolveResult: (result)=>{
      return {
        body: (result.match(/id=\"cnblogs_post_body\"[\s\S]+?\">[\s\S]+?(?=id=\"MySignature\")/) || [])[0]
            ?.replace(/id=\"cnblogs_post_body\"[\s\S]+?\">/,'')?.trim(),
        id: (result.match(/onclick=\"AddToWz\(\d+?(?=\))/)||[])[0]?.replace(/[\s\S]+\(/,''),
      }
    }
  });
};

export const getBlogCommentList = (data: getBlogCommentListRequest) => {
  const URL = `https://www.cnblogs.com/${data.request.userId}/ajax/GetComments.aspx?postId=${data.request.postId}&pageIndex=${data.request.pageIndex}&anchorCommentId=0`
  return RequestUtils.get(URL,{
    resolveResult:(result)=>{
      let dataList = resolveBlogCommentHtml(result);
      //要重新计算楼层，返回的数据的Floor都只是本页的序号
      dataList = (dataList || []).map((x, xIndex) => ({
        ...x,
        Floor: (data.request.pageIndex - 1) * data.request.pageSize + xIndex + 1 }));
      return dataList;
    }
  });
  //# region  wcf的这个评论接口刷新不及时,废弃掉
  // const URL = `http://wcf.open.cnblogs.com/blog/post/${data.request.postId}/comments/${data.request.pageIndex}/${data.request.pageSize}`;
  // return RequestUtils.get<Array<blogCommentModel>>(URL, {
  //   resolveResult: (result)=>{
  //     //说明是空数据
  //     if(result.hasOwnProperty('feed')) {
  //       result = [];
  //     }
  //     //要重新计算楼层，返回的数据的Floor都只是本页的序号
  //     result = (result || []).map((x, xIndex) => ({
  //       ...x,
  //       Floor: (data.request.pageIndex - 1) * data.request.pageSize + xIndex + 1 }));
  //     return result;
  //   }
  // });
  //# endregion
};

export const getBlogCommentCount = (data: RequestModel<{postId: string,userId:string}>) => {
  const URL = `https://www.cnblogs.com/${data.request.userId}/ajax/GetCommentCount.aspx?postId=${data.request.postId}`;
  console.log('------')
  console.log(URL)
  return RequestUtils.get<number>(URL);
}


export const deleteBlog = (data:RequestModel<{postId: string}>) => {
  const URL = `https://i.cnblogs.com/api/posts/${data.request.postId}`;
  return RequestUtils.delete<any>(URL);
};

export const getBlogViewCount = (data: RequestModel<{postId: string}>) => {
  const URL = `https://www.cnblogs.com/xiaoyangjia/ajax/GetViewCount.aspx??postId=${data.request.postId}`;
  return RequestUtils.get<number>(URL);
}


//获取文章的分类和标签
export const getBlogCategoryAndTags = (data:RequestModel<{userId:string,postId: string,blogId:string}>)=>{
  const URL = `https://www.cnblogs.com/${data.request.userId}/ajax/CategoriesTags.aspx?blogId=${data.request.blogId}&postId=${data.request.postId}`;
  return RequestUtils.get<{category:string,
    categoryUrl: string,
    tags: [
      {
        name: string,
        url: string
      }
    ]
  }>(URL, {
    resolveResult: (result)=>{
      let target = {} as any;
      let category = (result.match(/分类[\s\S]+href=\"[\s\S]+(?=\")/)||[])[0]?.replace(/[\s\S]+\"/,'');
      let categoryUrl = (result.match(/分类[\s\S]+href=\"[\s\S]+(?=\<\/a)/)||[])[0]?.replace(/[\s\S]+\>/,'');
      let tags = [] as Array<{name: string, url:string}>;
      let tagMatches = (result.match(/标签[\s\S]+/)||[])[0]?.match(/\<a href=[\s\S]+?(?=\<\/a\>)/g);
      for (let match of (tagMatches||[])) {
        tags.push({
          name: match.replace(/[\s\S]+href=\"[\s\S]+?\>/,''),
          url: (match.match(/href=\"[\s\S]+?(?=\")/)||[])[0]?.replace(/href=\"/,''),
        })
      }
      return {
        category,
        categoryUrl,
        tags
      };
    }
  });
}

export const commentBlog = (data:RequestModel<{userId:string,postId:number,body:string,parentCommentId?:number}>) => {
  if(data.request.parentCommentId==undefined) {
    data.request.parentCommentId = 0;
  }
  const URL = `https://www.cnblogs.com/${data.request.userId}/ajax/PostComment/Add.aspx`;
  //message是一段html
  return RequestUtils.post<{isSuccess:boolean,message:string,duration:number}>(URL,data.request);
};


export const deleteComment = (data:RequestModel<{parentId:number,commentId?:number,pageIndex?:number}>) => {
  data.request.pageIndex = 0;
  const URL = `https://www.cnblogs.com/yz1311/ajax/comment/DeleteComment.aspx`;
  return RequestUtils.post<boolean>(URL,data.request);
};

export const modifyComment = (data:RequestModel<{commentId:number,body:string}>) => {
  const URL = `https://www.cnblogs.com/yz1311/ajax/PostComment/Update.aspx`;
  return RequestUtils.post<{isSuccess:boolean,message:string}>(URL,data.request);
};


export const resolveBlogHtml = (result)=>{
  let items:Array<any> = [];
  if(Array.isArray(result)) {
    return result;
  }
  const $ = cheerio.load(result, { decodeEntities: false });
  $('article.post-item').each(function (index, element) {
    let item:Partial<blogModel> = {};
    let match = $(this).html();
    //解析digg
    item.diggs = parseInt($(this).find('span[id^=digg_count_]').text()?.trim());
    item.link = $(this).find('a.post-item-title').attr('href')?.trim();
    item.id = $(this).find('span[id^=digg_count_]').attr('id')?.replace(/id=\"digg_count_/,'');
    //onclick="DiggPost('xiaoyangjia',11535486,34640,1)">
    item.blogapp = (match.match(/DiggPost\(([\s\S]+?,){2}[\s\S]+?(?=,\d+\))/)||[])[0]?.replace(/^([\s\S]+,){2}/,'');
    item.title = $(this).find('a.post-item-title').html()?.trim();
    item.summary = $(this).find('p.post-item-summary').html().replace(/[\s\S]+?>/,'').trim();
    item.author = {
      id: '',
      avatar: $(this).find('p.post-item-summary').find('img.avatar').attr('src'),
      name: $(this).find('a.post-item-author').text(),
      uri: (match.match(/class=\"post-item-body\"[\s\S]+?href=\"[\s\S]+?(?=\")/)||[])[0]?.replace(/[\s\S]+\"/,''),
    };
    item.author.id = (item.author?.uri?.replace(/^https:\/\/[\s\S]+?\//,'')?.match(/[\s\S]+?(?=\/)/)||[])[0];
    item.published = $(this).find('span.post-meta-item').text()?.trim()+':00',
    item.comments = parseInt((match.match(/href=\"#icon_comment[\s\S]+?(?=<\/span>)/)||[])[0]?.replace(/[\s\S]+>/,''));
    item.views = parseInt((match.match(/href=\"#icon_views[\s\S]+?(?=<\/span>)/)||[])[0]?.replace(/[\s\S]+>/,''));
    items.push(item);
  });
  return items;
}


export const resolvePersonalBlogHtml = (result)=>{
  let items:Array<any> = [];
  if(Array.isArray(result)) {
    return result;
  }
  result = (result.match(/id=\"mainContent\"[\s\S]+(?=id=\"footer\")/) || [])[0];
  if(!result) {
    return [];
  }
  let matches = result.match(/class=\"day\"[\s\S]+?class=\"postDesc[\s\S]+?(?=class=\"clear\")/g)|| [];

  for (let match of matches) {
    let item:Partial<blogModel> = {};
    //解析digg
    item.diggs = parseInt((match.match(/class=\"post-digg-count\"[\s\S]+?(?=\))/)||[])[0]?.replace(/[\s\S]+\(/,''));
    item.link = (match.match(/class=\"postTitle2 vertical-middle\" href=\"[\s\S]+?(?=\")/)||[])[0]?.replace(/[\s\S]+="/,'');
    //不能根据link来截取，部分link后面并不是id
    //2020-08-24 先就这样吧
    item.id = item.link.replace(/[\s\S]+\//,'').replace(/\.[\s\S]+$/,'');
    // item.id = (match.match(/id=\"digg_count_\d+?(?=\")/)||[])[0]?.replace(/id=\"digg_count_/,'');
    //onclick="DiggPost('xiaoyangjia',11535486,34640,1)">
    item.blogapp = (match.match(/DiggPost\(([\s\S]+?,){2}[\s\S]+?(?=,\d+\))/)||[])[0]?.replace(/^([\s\S]+,){2}/,'');
    item.title = (match.match(/class=\"postTitle2 vertical-middle\"[\s\S]+?(?=<\/a>)/)||[])[0]?.replace(/[\s\S]+?>/,'')?.trim();
    if(item.title.indexOf('<span>[置顶]</span>')>=0) {
      item.isSticky = true;
      item.title = item.title.replace('<span>[置顶]</span>', '');
    }
    //清空span，不然标题会有空格
    if(item.title) {
      item.title = item.title
          .replace(/^<span>/, '')
          .replace(/<\/span>$/, '')
          ?.trim();
    }
    item.summary = (match.match(/class=\"c_b_p_desc\"[\s\S]+?(?=<a href[\s\S]+?c_b_p_desc_readmore)/)||[])[0]?.replace(/[\s\S]+>/,'').trim();
    //太突兀，加上...
    if(item.summary) {
      item.summary += ' ...';
    }
    item.author = {
      id: '',
      //没有头像
      avatar: '',
      name: (match.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}[\s\S]+?(?=<span class=\"post-view-count)/)||[])[0]?.substr(16)?.trim(),
      uri: (match.match(/class=\"post-item-body\"[\s\S]+?href=\"[\s\S]+?(?=\")/)||[])[0]?.replace(/[\s\S]+\"/,''),
    };
    item.author.id = (item.author?.uri?.replace(/^https:\/\/[\s\S]+?\//,'')?.match(/[\s\S]+?(?=\/)/)||[])[0];
    item.published = (match.match(/class=\"postDesc\"[\s\S]+?\d{4}-\d{2}-\d{2} \d{2}:\d{2}/)||[])[0]?.replace(/[\s\S]+@ /,'')?.trim();
    item.comments = parseInt((match.match(/class=\"post-comment-count\"[\s\S]+?(?=\))/)||[])[0]?.replace(/[\s\S]+\(/,''));
    item.views = parseInt((match.match(/class=\"post-view-count\"[\s\S]+?(?=\))/)||[])[0]?.replace(/[\s\S]+\(/,''));
    items.push(item);
  }
  return items;
}

export const resolveSearchBlogHtml = (result)=>{
  let items:Array<any> = [];
  let matches = result.match(/class=\"searchItem\"[\s\S]+?(?=searchURL\"[\s\S]+?<\/div>)/g)|| [];
  for (let match of matches) {
    let item:Partial<blogModel> = {};
    item.link = (match.match(/class=\"searchItemTitle\"[\s\S]+?href=\"[\s\S]+?(?=\")/)||[])[0]?.replace(/[\s\S]+="/,'');
    //不能根据link来截取，部分link后面并不是id
    // item.id = item.link.replace(/[\s\S]+\//,'').replace(/\.[\s\S]+$/,'');
    //搜索的博客没有id
    item.id = '';
    //onclick="DiggPost('xiaoyangjia',11535486,34640,1)">
    item.blogapp = (match.match(/DiggPost\(([\s\S]+,){2}[\s\S]+?(?=,)/)||[])[0]?.replace(/^([\s\S]+,){2}/,'');
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


export const resolveBlogCommentHtml = (result)=>{
  let items:Array<any> = [];
  let matches = result.match(/class=\"feedbackItem\"[\s\S]+?class=\"comment_vote\"[\s\S]+?<\/div[\s\S]+?(?=<\/div)/g)|| [];
  for (let match of matches) {
    let item:Partial<blogCommentModel> = {};
    item.title = '';
    item.id = (match.match(/id=\"comment_body_\d+?(?=\")/)||[])[0]?.replace(/id=\"comment_body_/,'');
    item.content = (match.match(/class=\"blog_comment_body[\s\S]+?(?=\<\/div>[\s\S]+?<div class=\"comment_vote)/)||[])[0]?.replace(/[\s\S]+?\>/,'').trim();
    item.author = {
      id: '',
      uri: (match.match(/id=\"a_comment_author_[\s\S]+?href=\"[\s\S]+?(?=\")/)||[])[0]?.replace(/[\s\S]+\"/,''),
      name: (match.match(/id=\"a_comment_author_[\s\S]+?(?=\<\/a)/)||[])[0]?.replace(/[\s\S]+>/,'').trim(),
      avatar: (match.match(/id=\"comment_\d+?_avatar\"[\s\S]+?(?=<\/span)/)||[])[0]?.replace(/[\s\S]+>/,'')?.trim() || 'https://pic.cnblogs.com/avatar/simple_avatar.gif',
    };
    item.author.id = item.author?.uri.replace(/^[\s\S]+\/(?=[\s\S]+\/$)/,'').replace('/','');
    item.published = (match.match(/class=\"comment_date[\s\S]+?(?=<\/span)/)||[])[0]?.replace(/[\s\S]+>/,'');
    items.push(item);
  }
  return items;
}
