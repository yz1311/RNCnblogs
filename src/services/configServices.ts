import {Api} from '../api';
import StorageUtils from "../utils/storageUtils";

//此变量将在标题在创建一篇日记，里面的内容作为配置数据
//正常情况下千万不要修改，否则会导致配置丢失
const CONFIG_TITLE = `博客园App配置`;

export interface IConfigData {
  theme: 'normal'
}

export default class ConfigServices {
  /**
   * 获取配置对象
   * 如果获取失败，则返回空对象{}
   * @param forceUpdate 是否强制刷新数据
   */
  static getConfig = async (forceUpdate?: boolean)=>{
    //默认会从本地
    if(!forceUpdate) {
      let diary = await StorageUtils.load('CONFIG_DIARY');
      if(diary) {
        try {
          return (JSON.parse(diary.body) || {}) as Partial<IConfigData>;
        } catch (e) {

        }
      }
    }
    try {
      let response = await Api.diary.getDiaryList({
        request: {
          pageIndex: 1
        }
      });
      let diaryList = response.data.postList || [];
      let configDiary = diaryList.filter(x=>x.title==CONFIG_TITLE)[0];
      if(configDiary&&configDiary.url) {
        StorageUtils.save('CONFIG_DIARY', configDiary);
        let contentResponse = await Api.diary.getDiaryContent({
          request: {
            url: 'https:'+configDiary.url
          }
        });
        StorageUtils.save('CONFIG_DIARY', {
          ...configDiary,
          body: contentResponse.data.body,
          blogId: contentResponse.data.blogId
        });
        let data = JSON.parse(contentResponse.data.body);
        StorageUtils.save('CONFIG_DATA', data);
        return data as Partial<IConfigData>;
      }
    } catch (e) {

    }
    return {} as Partial<IConfigData>;
  }

  /**
   * 保存配置对象
   */
  static saveConfig = async (data)=>{
    let diary = await StorageUtils.load('CONFIG_DIARY');
    try {
      let response;
      if(diary) {
        response = await Api.diary.updateDiary({
          request: {
            datePublished: diary.datePublished,
            lastContent: diary.body,
            blogId: parseInt(diary.blogId),
            id: diary.id,
            url: diary.url,
            title: diary.title,
            body: JSON.stringify(data)
          }
        });
      } else {
        response = await Api.diary.addDiary({
          request: {
            title: CONFIG_TITLE,
            body: JSON.stringify(data)
          }
        })
      }
    } catch (e) {

    }

  }
}
