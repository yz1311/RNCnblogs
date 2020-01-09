/*
业务相关的工具类
 */

// import Realm from 'realm';
const Realm = {};
import {tables, userSchema} from '../common/database';
import {Alert} from 'react-native';
import {getPersonInfo} from '../actions/profile/profile_index_actions';
import {showToast} from '../actions/app_actions';

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

  static async searchUserAlias(userId) {
    //在本地数据库查找用户，能找到，则找出alias
    let realm;
    try {
      realm = await Realm.open({schema: [userSchema]});
      let users = realm.objects(tables.user);
      let curUsers = users.filtered(`id = '${userId}'`);
      console.log(curUsers.length);
      if (curUsers && curUsers.length > 0) {
        return JSON.parse(JSON.stringify(curUsers[0]));
      }
    } catch (e) {
      console.log(e);
    } finally {
      if (realm) {
        realm.close();
      }
    }
    return null;
  }

  static async searchUserAliasByName(userName) {}

  static viewProfileDetail(dispatch, alias, iconUrl) {
    if (alias) {
      dispatch(
        getPersonInfo({
          request: {
            userAlias: alias,
          },
          showLoading: true,
          successAction: () => {
            NavigationHelper.push('ProfilePerson', {
              userAlias: alias,
              avatorUrl: iconUrl,
            });
          },
          failAction: () => {
            dispatch(showToast('该用户暂时没有博客!'));
          },
        }),
      );
      return true;
    } else {
      Alert.alert('', '暂不支持查看该园友', [{text: '知道了'}]);
      return false;
    }
  }
}
