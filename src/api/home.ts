import {requestWithTimeout, createOptions} from '../utils/request';
import * as types from '../actions/actionTypes';
import RequestUtils from '../utils/requestUtils';
import {questionModel} from './question';

export interface rankModel {
  id: string,
  name: string,
  avator: string,
  link: string,
  lastUpdate: string,

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


export const rankList = (data:RequestModel<{publicFlag: 1|0,content:string}>) => {
  const URL = `https://www.cnblogs.com/AllBloggers.aspx`;
  return RequestUtils.get<Array<rankModel>>(URL, {
    resolveResult: (result)=>{
      let items:Array<any> = [];
      let matches = result.match(/<tbody>[\s\S]+?class=\"date\"[\s\S]+?(?=class=\"clear\")/g)|| [];
      for (let match of matches) {
        let item:Partial<rankModel> = {};12
        //解析digg
        // item.link = match.match(((/class=\"titlelnk\" href=\"[\s\S]+?(?=\")/))||[])[0]?.replace(/[\s\S]+="/,'');
        //不能根据link来截取，部分link后面并不是id
        // item.id = item.link.replace(/[\s\S]+\//,'').replace(/\.[\s\S]+$/,'');
        item.id = (match.match(/id=\"news_item_\d+?(?=\")/)||[])[0]?.replace(/id=\"news_item_/,'');
        item.link = `https://news.cnblogs.com/q/${item.id}/`;
        item.gold = parseInt((match.match(/class=\"gold\"[\s\S]+?(?=<\/span)/)||[])[0]?.replace(/[\s\S]+>/,'')?.trim()||'0');
        //onclick="DiggPost('xiaoyangjia',11535486,34640,1)">
        item.title = (match.match(/class=\"news_entry\"[\s\S]+?(?=<\/a)/)||[])[0]?.replace(/[\s\S]+\>/,'');
        //可能有图片，也可能没图片
        item.summary = (match.match(/news_summary\"[\s\S]+?(?=\<\/div)/)||[])[0]?.replace(/[\s\S]+>/,'').trim();
        item.author = {
          id: '',
          avatar: (match.match(/的主页\"[\s\S]+?(?=\"\s{0,2}\/>)/)||[])[0]?.replace(/[\s\S]+\"/,''),
          uri: (match.match(/class=\"news_footer_user\"[\s\S]+?\"[\s\S]+?(?=\")/)||[])[0]?.replace(/[\s\S]+\"/,''),
          name: (match.match(/class=\"news_contributor\"[\s\S]+?(?=<\/a)/)||[])[0]?.replace(/[\s\S]+>/,'')?.trim(),
        };
        if(item.author.avatar!=undefined&&item.author.avatar!=''&&item.author.avatar.indexOf('http')!=0) {
          item.author.avatar = 'https:'+item.author.avatar;
        }
        items.push(item);
      }
      return items;
    }
  });
};
