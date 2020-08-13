import React, {Component} from 'react';
import {
  DeviceEventEmitter,
  Platform,
  View,
  BackHandler,
  StatusBar,
  AppState,
  TouchableOpacity,
  Text,
  Modal,
  EmitterSubscription,
} from 'react-native';
import {connect} from 'react-redux';
import ScrollableTabView from '@yz1311/react-native-scrollable-tab-view';
import YZTabBar from '../components/YZTabBar';
import YZBackHandler from '../components/YZBackHandler';
import Home from './home/home_index';
import Question from './question/question_index';
import Status from './status/status_index';
import DiscoverIndex from './discover/discover_index';
import Profile from './profile/profile_index';
import SplashScreen from 'react-native-splash-screen';
import * as actionTypes from '../actions/actionTypes';
import moment from 'moment';
import ImageViewer from 'react-native-image-zoom-viewer';
import {ReduxState} from '../reducers';
import {NavigationScreenProp, NavigationState} from 'react-navigation';
import ConfigServices from '../services/configServices';
import YZImageViewer from "../components/YZImageViewer";

interface IProps extends IReduxProps {
  isLogin?: boolean;
  navigation: any;
  refreshDataTimeFn?: any;
  initialPage: number;
}

interface IState {
  tabNames: Array<any>;
  tabIconNames: Array<string>;
  selectedTabIconNames: Array<string>;
}

export enum ServiceTypes {
  '博客',
  '新闻',
  '博问',
  '闪存'
}

let lastClickTime = 0;

@(connect(
  (state: ReduxState) => ({
    isLogin: state.loginIndex.isLogin,
  })
) as any)
//@ts-ignore
@YZBackHandler
export default class YZTabBarView extends Component<IProps, IState> {
  static navigationOptions = ({navigation}) => {
    return {
      headerShown: false,
    };
  };

  static defaultProps = {
    initialPage: 0,
  };

  private reloadThemeListener: EmitterSubscription;
  private tabBar;
  private selectedTabIndex: number = 0;

  constructor(props) {
    super(props);

    this.state = {
      tabNames: ['博客', '博问', '闪存', '我'],
      tabIconNames: [
        // require('../resources/tab/Home.png'),
        // require('../resources/tab/Warning.png'),
        // require('../resources/tab/Bulletin.png'),
        // require('../resources/tab/Mine.png'),
        'home',
        'news',
        'leaf',
        'user',
      ],
      selectedTabIconNames: [
        // require('../resources/tab/Home2.png'),
        // require('../resources/tab/Warning2.png'),
        // require('../resources/tab/Bulletin2.png'),
        // require('../resources/tab/Mine2.png'),
        'home',
        'news',
        'leaf',
        'user',
      ],
    };
    //android下按返回键退出后，路由栈并没有重置，再次进入的时候是直接进入主界面
    //但是root app这些均会运行，此时，必须手动关闭启动动画
    SplashScreen.hide();
  }

  async componentDidMount() {
    ConfigServices.getConfig(true);
    // this._handleAppStateChange('active');
    AppState.addEventListener('change', this._handleAppStateChange);
    this.reloadThemeListener = DeviceEventEmitter.addListener(
      'reloadTheme',
      () => {
        this.forceUpdate();
      },
    );
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
    this.reloadThemeListener.remove();
  }

  _handleAppStateChange = async appState => {
    if (appState === 'active') {
      //检查并刷新token
      if (this.props.isLogin) {
        //Todo: 校验时间
        // const loginInfo = await gStorage.load('loginInfo');
        // //已登录
        // if (loginInfo && loginInfo.access_token != undefined) {
        //   //未过期
        //   if (
        //     loginInfo.create_time &&
        //     moment(loginInfo.create_time)
        //       .add(loginInfo.expires_in, 'second')
        //       .isAfter(moment())
        //   ) {
        //
        //   } else {
        //     //否则跳转到登录界面
        //     NavigationHelper.resetTo('Login');
        //   }
        } else {
          //否则跳转到登录界面
          NavigationHelper.resetTo('Login');
        }
      }
      //Todo:刷新时间(所有列表中的时间)
  };

  _onChangeTab = obj => {
    this.selectedTabIndex = obj.i;
    switch (obj.i) {
      case 0:
        break;
      case 1: //eslint-disable-line
        break;
      case 2:
        break;
    }
  };

  _onClickTab = index => {
    if (this.selectedTabIndex === index) {
      let now = new Date().getTime();
      if (now - lastClickTime >= 2000) {
        lastClickTime = now;
        //点击一次，滑动到顶部
        DeviceEventEmitter.emit('list_scroll_to_top', {tabIndex: index});
        return;
      }
      lastClickTime = now;
      DeviceEventEmitter.emit('list_refresh', {tabIndex: index});
    }
  };

  render() {
    const {tabNames, tabIconNames, selectedTabIconNames} = this.state;

    return (
      <View style={{flex: 1}}>
        <ScrollableTabView
          renderTabBar={() => (
            <YZTabBar
              ref={bar => (this.tabBar = bar)}
              tabNames={tabNames}
              tabIconNames={tabIconNames}
              selectedTabIconNames={selectedTabIconNames}
              onClick={this._onClickTab}
            />
          )}
          tabBarPosition="bottom"
          initialPage={this.props.initialPage || 0}
          scrollWithoutAnimation={true}
          locked={true}
          onChangeTab={this._onChangeTab}>
          <Home navigation={this.props.navigation} tabIndex={0} />
          <Question navigation={this.props.navigation} tabIndex={1} />
          <Status navigation={this.props.navigation} tabIndex={2} />
          <Profile navigation={this.props.navigation} tabIndex={3} />
        </ScrollableTabView>
        <YZImageViewer

          />
      </View>
    );
  }
}
