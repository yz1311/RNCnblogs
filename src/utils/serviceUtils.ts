/*
业务相关的工具类
 */

import {Alert} from 'react-native';

export default class serviceUtils {
  /**
   * 从链接(头像链接和主页链接)从获取userId
   */
  static getUserIdFromAvatorUrl(href): string {
    //目前发现有下面四种链接
    //http://home.cnblogs.com/u/985807/
    //https://pic.cnblogs.com/face/u76066.png?id=09112956
    //https://pic.cnblogs.com/face/1687889/20190514181658.png
    //https://
    if (!href) {
      return '';
    }
    if (href.indexOf('//home.cnblogs.com/u') > 0) {
      let matches = href.match(/\/u\/\d+?\//);
      if (matches && matches.length > 0) {
        let userId = matches[0].replace(/\//g, '').replace('u', '');
        return userId;
      }
    } else if (href.indexOf('com/face/u') > 0) {
      let matches = href.match(/\/u\d+?\./);
      if (matches && matches.length > 0) {
        let userId = matches[0]
          .replace(/\//g, '')
          .replace('u', '')
          .replace('.', '');
        return userId;
      }
    } else if (href.indexOf('com/face/') > 0) {
      let matches = href.match(/face\/\d+?\//);
      if (matches && matches.length > 0) {
        let userId = matches[0].replace('face', '').replace(/\//g, '');
        return userId;
      }
    }
    return '';
  }

  static async searchUserAliasByName(userName) {}

  static viewProfileDetail(dispatch, alias, iconUrl) {
    if (alias) {
      NavigationHelper.navigate('ProfilePerson', {
        userAlias: alias,
        avatorUrl: iconUrl,
      });
      return true;
    } else {
      Alert.alert('', '暂不支持查看该园友', [{text: '知道了'}]);
      return false;
    }
  }
}
