import './common/constants';
import './utils/globalStorage';
import codePush from 'react-native-code-push';
import React, {Component, PureComponent} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Alert,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  DeviceEventEmitter,
  Modal
} from 'react-native';
import {Provider} from 'react-redux';
import {create} from 'dva-core';
import useImmer from 'dva-immer';
import Markdown from 'react-native-markdown-renderer';
import HtmlView from 'react-native-render-html';
import {NavigationBar, Theme} from '@yz1311/teaset';
import {NavigationHelper} from '@yz1311/teaset-navigation';
import FitImage from 'react-native-fit-image';
import models from './models';
import {Styles} from './common/styles';
import RequestUtils from "./utils/requestUtils";
import Entypo from "react-native-vector-icons/Entypo";
import ModalExt from 'react-native-modal';
import {IImageInfo} from "react-native-image-zoom-viewer/built/image-viewer.type";

//必须要延后加载，否则Theme设置无效
const App = require('./pages/app').default;

const dvaApp = create();
//@ts-ignore
dvaApp.use(useImmer()); //eslint-disable-line
models.forEach(x => {
  dvaApp.model(x);
});
dvaApp.start();

const store = dvaApp._store;
global.gStore = store;

NavigationHelper.init(NavigationHelper);
RequestUtils.init();

const markdownStyles = StyleSheet.create({
  text: {
    fontSize: gFont.sizeDetail,
    color: gColors.color4c,
  },
});

//设置markdown规则
const markdownRules = {
  image: (node, children, parent, styles) => {
    return (
      <TouchableOpacity
        key={node.key}
        activeOpacity={activeOpacity}
        style={styles.image}
        onPress={() => {
          //由于暂时无法获取到item，所无法获取imgList属性（已解析）,暂时只能显示一张图片
          DeviceEventEmitter.emit('showImageViewer', {
            images: [{
                url: node.attributes.src
            }] as Array<IImageInfo>,
            index: 0,
          });
        }}>
        <FitImage
          indicator={true}
          resizeMode="contain"
          style={[styles.image]}
          source={{uri: node.attributes.src}}
        />
      </TouchableOpacity>
    );
  },
  link: async (node, children, parent, styles) => {
    //http://home.cnblogs.com/u/985807/
    console.log(node.attributes.href);
    //说明是@个人用户
    if (
      node.attributes.href &&
      node.attributes.href.indexOf('//home.cnblogs.com/u') > 0
    ) {
      let matches = node.attributes.href.match(/\/u\/\d+?\//);
      if (matches && matches.length > 0) {
        //在本地数据库查找用户，能找到，则找出alias
        let realm;
        try {
          let userId = matches[0].replace(/\//g, '').replace('u', '');
          console.log(userId);
          // realm = await Realm.open({schema: [userSchema]});
          // let users = realm.objects(tables.user);
          // let curUsers = users.filtered(`id = '${userId}'`);
          // if (curUsers && curUsers.length > 0) {
          //   return (
          //     <Text
          //       key={node.key}
          //       style={styles.link}
          //       onPress={() => {
          //         NavigationHelper.navigate('ProfilePerson', {
          //           userAlias: curUsers[0].alias,
          //           avatorUrl: curUsers[0].iconUrl,
          //         });
          //       }}>
          //       {children}
          //     </Text>
          //   );
          // }
        } catch (e) {
          console.log(e);
        } finally {
          if (realm) {
            realm.close();
          }
        }
      }
    }
    return (
      <Text
        key={node.key}
        style={styles.link}
        onPress={() => {
          NavigationHelper.navigate('YZWebPage', {
            uri: node.attributes.href,
            title: '详情',
          });
        }}>
        {children}
      </Text>
    );
  },
  // a with a non text element nested inside
  blocklink: (node, children, parent, styles) => {
    return (
      <TouchableWithoutFeedback
        key={node.key}
        onPress={() => {
          NavigationHelper.navigate('YZWebPage', {
            uri: node.attributes.href,
            title: '详情',
          });
        }}
        style={styles.blocklink}>
        <View style={styles.image}>{children}</View>
      </TouchableWithoutFeedback>
    );
  },
};

class Root extends PureComponent {
  constructor(props) {
    super(props);
    //全局设置 禁止APP受系统字体放大缩小影响
    // @ts-ignore
    Text.defaultProps = {...(Text.defaultProps || {}), allowFontScaling: false};
    // @ts-ignore
    TextInput.defaultProps = {...(TextInput.defaultProps || {}), allowFontScaling: false};
    // @ts-ignore
    //0.63版本出现点击没有按压效果的bug
    TouchableOpacity.defaultProps = {...(TouchableOpacity.defaultProps || {}), delayPressIn: 0, activeOpacity};
    Markdown.defaultProps.rules = markdownRules;
    Markdown.defaultProps.style = markdownStyles;
    // @ts-ignore
    HtmlView.defaultProps.allowFontScaling = false;
    // @ts-ignore
    HtmlView.defaultProps.baseFontStyle = {
      fontSize: gFont.sizeDetail,
      color: gColors.color4c,
      ...Styles.text4Pie,
    };
    Theme.set({
      primaryColor: '#0d7dfa',
      navColor: '#0d7dfa',
      navTitleColor: '#fff',
    })
      //@ts-ignore
      NavigationBar.defaultProps = {
          //@ts-ignore
          ...(NavigationBar.defaultProps || {}),
          style: {
              position: 'relative',
              borderBottomColor: '#ececec',
              borderBottomWidth: Theme.onePix
          },
          leftView: (
              <TouchableOpacity
                  activeOpacity={activeOpacity}
                  style={{
                      flex: 1,
                      paddingLeft: 9,
                      paddingRight: 8,
                      alignSelf: 'stretch',
                      justifyContent: 'center',
                  }}
                  onPress={() => {
                      // navigation.goBack();
                      NavigationHelper.goBack();
                  }}>
                  <Entypo name={'chevron-thin-left'} size={23} color="white" />
              </TouchableOpacity>
          )
      };
      //去掉Modal状态栏的变化
      //@ts-ignore
      (Modal.defaultProps || {}).statusBarTranslucent = true;
      //修复关闭Modal时，会闪一下的问题
      //https://github.com/react-native-community/react-native-modal/issues/268
      //@ts-ignore
      (ModalExt.defaultProps || {}).backdropTransitionOutTiming = 0;
    // UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  componentDidMount() {}

  componentWillUnmount() {}

  render() {
    return (
      <View style={{flex: 1}}>
        <Provider store={store}>
          <App
            AppNavigator={require('./pages/appNav').default}
          />
        </Provider>
      </View>
    );
  }
}

let codePushOptions = {checkFrequency: codePush.CheckFrequency.MANUAL};

export default codePush(codePushOptions)(Root);
