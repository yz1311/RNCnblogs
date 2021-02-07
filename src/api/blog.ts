import RequestUtils, {} from "../utils/requestUtils";
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
  //是否喜欢
  isLike: boolean;
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
  agreeCount: number;
  antiCount: number;
};


export type blogTagModel = {
  id: string;
  name: string;
  num: number;
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


export type personalDynamicModel = {

};

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
    resolveResult: (result) => resolvePersonalBlogHtml(result, data.request.userId)
  });
};

export const getPersonalDynamicList = (data: RequestModel<{
  userId: string;
}>) => {
  const URL = `https://home.cnblogs.com/ajax/feed/recent?alias=${data.request.userId}`
  return RequestUtils.get<Array<personalDynamicModel>>(URL,{
    resolveResult:(result)=>{
      let items:Array<any> = [];
      const $ = cheerio.load(result, { decodeEntities: false });
      $('tr.ng-star-inserted').each(function (index, element) {
        let item: Partial<personalDynamicModel> = {};
        let match = $(this).html();
        // item.id = $(this).find('a[href^="/tags/posts"]').attr('ref').replace(/[\s\S]+=/, '');
        // item.name = $(this).find('a[href^="/tags/posts"]').text();
        // item.num = parseInt((match.match(/\(\d+?(?=\))/)||[])[0]?.replace(/[\s\S]+\(/,''));
        items.push(item);
      });
      return items;
    }
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
};

export const getBlogCommentCount = (data: RequestModel<{postId: string,userId:string}>) => {
  const URL = `https://www.cnblogs.com/${data.request.userId}/ajax/GetCommentCount.aspx?postId=${data.request.postId}`;
  return RequestUtils.get<number>(URL);
}

/**
 * 开启/取消点赞
 * @param data
 * isAbandoned 是否推荐
 */
export const voteBlog = (data: RequestModel<{userId: string, postId: number, isAbandoned:boolean, voteType?:string}>) => {
  data.request.voteType = 'Digg';
  const URL = `https://www.cnblogs.com/${data.request.userId}/ajax/vote/blogpost`;
  return RequestUtils.post<{id: number, isSuccess: boolean, message: string}>(URL, data.request);
}

export const deleteBlog = (data:RequestModel<{postId: number}>) => {
  const URL = `https://i.cnblogs.com/api/posts/${data.request.postId}`;
  return RequestUtils.delete<any>(URL);
};

export const getBlogViewCount = (data: RequestModel<{postId: number}>) => {
  const URL = `https://www.cnblogs.com/xiaoyangjia/ajax/GetViewCount.aspx??postId=${data.request.postId}`;
  return RequestUtils.get<number>(URL);
}

export const getBlogTags = (data: RequestModel<{pageIndex: number}>) => {
  const URL = `https://i.cnblogs.com/tags?page=${data.request.pageIndex}`;
  return RequestUtils.get<Array<blogTagModel>>(URL, {
    resolveResult: result => {
      let items:Array<any> = [];
      const $ = cheerio.load(result, { decodeEntities: false });
      $('tr.ng-star-inserted').each(function (index, element) {
        let item: Partial<blogTagModel> = {};
        let match = $(this).html();
        item.id = $(this).find('a[href^="/tags/posts"]').attr('ref').replace(/[\s\S]+=/, '');
        item.name = $(this).find('a[href^="/tags/posts"]').text();
        item.num = parseInt((match.match(/\(\d+?(?=\))/)||[])[0]?.replace(/[\s\S]+\(/,''));
        items.push(item);
      });
      return items;
    }
  });
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

//赞成和取消都是一个接口，会自动切换
export const voteBlogComment = (data: RequestModel<{userId: string,postId: number, commentId: number, isAbandoned: boolean, voteType?: string}>) => {
  data.request.voteType = 'Digg';
  const URL = `https://www.cnblogs.com/${data.request.userId}/ajax/vote/comment`;
  return RequestUtils.post<{ isSuccess: boolean, message: string}>(URL, data.request);
}


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
    //官网有bug
    item.isLike = !$(this).find('a[class^="post-meta-item btn"]').attr('onclick');
    item.link = $(this).find('a.post-item-title').attr('href')?.trim();
    item.id = $(this).find('span[id^=digg_count_]').attr('id')?.replace(/digg_count_/,'');
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


export const resolvePersonalBlogHtml = (result, userId)=>{
  let items:Array<any> = [];
  if(Array.isArray(result)) {
    return result;
  }
  result = (result.match(/id=\"mainContent\"[\s\S]+(?=id=\"footer\")/) || [])[0];
  if(!result) {
    return [];
  }
  const $ = cheerio.load(result, { decodeEntities: false });
  //存在一个day下面多个文章的情况，导致只加载一页
  let count = $('div.postTitle').length;
  Array.from({length: count}).map((ii, index) => {
    let item: Partial<blogModel> = {};
    item.isLike = $('a[id^="post-meta-item btn"]').attr('class')?.indexOf('active')>=0;
    item.link = $($('a[class^="postTitle2 vertical-middle"]')[index])?.attr('href')?.trim();
    item.id = $($('div.postDesc>span:nth-child(1)')[index])?.attr("data-post-id");
    item.blogapp = '';
    item.title = $($('a[class^="postTitle2 vertical-middle"]')[index])?.text()?.trim();
    if(item.title.indexOf('[置顶]')>=0) {
      item.isSticky = true;
      item.title = '[置顶] '+item.title.replace('[置顶]', '')?.trim();
    }
    item.summary = $($('div.c_b_p_desc')[index])?.text().replace(/阅读全文/,'').trim();
    //太突兀，加上...
    if(item.summary) {
      item.summary += ' ...';
    }
    item.author = {
      id: userId,
      avatar: '',
      name: '',
      uri: '',
    };
    let postDesc = $($('div.postDesc')[index])?.text()?.trim();
    item.published = (postDesc.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}/)||[])[0]+':00';
    item.views = parseInt(($($('div.postDesc>span:nth-child(1)')[index])?.text()?.match(/\d+/)||[])[0]);
    item.comments = parseInt(($($('div.postDesc>span:nth-child(2)')[index])?.text()?.match(/\d+/)||[])[0]);
    item.diggs = parseInt(($($('div.postDesc>span:nth-child(3)')[index])?.text()?.match(/\d+/)||[])[0]);
    items.push(item);
  });
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
  const $ = cheerio.load(result, { decodeEntities: false });
  $('div.feedbackItem').each(function (index, element) {
    let item: Partial<blogCommentModel> = {};
    let match = $(this).html();
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
    item.agreeCount = parseInt((match.match(/支持\(\d+?(?=\))/)||[])[0]?.replace(/[\s\S]+\(/,''));
    item.antiCount = parseInt((match.match(/反对\(\d+?(?=\))/)||[])[0]?.replace(/[\s\S]+\(/,''));
    items.push(item);
  });
  return items;
}
