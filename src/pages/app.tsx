import React, {Component} from 'react';

import {
  View,
  StatusBar,
  BackHandler,
  AppState,
  NativeAppEventEmitter,
  StyleSheet,
  Image,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
  Dimensions,
  DeviceEventEmitter,
  EmitterSubscription,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import {connect} from 'react-redux';
import {
  showToast,
  showLoading,
  changeAppNetInfo,
  orientationInfoChanged,
} from '../actions/app_actions';
import YZLoading from '../components/YZLoading';
import YZCodePushHandler from '../components/YZCodePushHandler';
import {NavigationActions} from 'react-navigation';
import * as navActions from '../actions/nav_actions';
import codePush from 'react-native-code-push';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import UpdateLogModal from '../components/update_logModal';
import moment from 'moment';
import Permissions from 'react-native-permissions';
import {ReduxState} from '../reducers';
import ToastUtils from "../utils/toastUtils";
import {NavigationHelper} from "@yz1311/teaset";

// See https://mydevice.io/devices/ for device dimensions
const X_WIDTH = 375;
const X_HEIGHT = 812;
const XSMAX_WIDTH = 414;
const XSMAX_HEIGHT = 896;
const PAD_WIDTH = 768;
const PAD_HEIGHT = 1024;

const {height: D_HEIGHT, width: D_WIDTH} = Dimensions.get('window');

const isIphoneXFunc = () => {
  if (Platform.OS === 'web') return false;

  return (
    (Platform.OS === 'ios' &&
      ((D_HEIGHT === X_HEIGHT && D_WIDTH === X_WIDTH) ||
        (D_HEIGHT === X_WIDTH && D_WIDTH === X_HEIGHT))) ||
    ((D_HEIGHT === XSMAX_HEIGHT && D_WIDTH === XSMAX_WIDTH) ||
      (D_HEIGHT === XSMAX_WIDTH && D_WIDTH === XSMAX_HEIGHT))
  );
};
global.isIphoneX = isIphoneXFunc();
let androidStatusBarHeight = 0;
//API19版本以上才支持沉浸式状态栏
if (Platform.OS === 'android' && Platform.Version >= 19) {
  androidStatusBarHeight = StatusBar.currentHeight;
} else {
  gScreen.isTranslucent = false;
}
gScreen.statusBarHeight =
  Platform.OS === 'android' ? androidStatusBarHeight : isIphoneX ? 44 : 20;
gScreen.headerHeight = gScreen.navigationBarHeight + gScreen.statusBarHeight;

let lastClickTime = 0;

interface IProps extends IReduxProps {
  AppNavigator: any;
  addListener?: any;
  nav?: any;
  barStyle?: any;
  isFetching?: boolean;
  loadingTitle?: string;
  isConnected?: boolean;
}

interface IState {
  showUpdateInfo: boolean;
}
//@ts-ignore
@YZCodePushHandler
export default class App extends Component<IProps, IState> {
  private reloadThemeListener: EmitterSubscription;
  private updateLogModal: any;

  constructor(props) {
    super(props);
    this.state = {
      showUpdateInfo: false,
    };
  }

  componentDidMount() {
    DeviceEventEmitter.addListener(
      'showUpdateInfoDialog',
      this.showUpdateInfoDialog,
    );
    this.reloadThemeListener = DeviceEventEmitter.addListener(
      'reloadTheme',
      () => {
        this.forceUpdate();
      },
    );
    NetInfo.addEventListener(
      'connectionChange',
      this._handleConnectivityChange,
    );
    Dimensions.removeEventListener('change', this.handleOrientationChange);
    __ANDROID__ &&
      BackHandler.addEventListener('hardwareBackPress', this._onBackAndroid);

    //加载更新信息
    this.loadUpdateInfo();
    console.log('componentDidMount');
    this.requestPermission();
  }

  requestPermission = () => {
    if (__ANDROID__) {
      Permissions.request('storage').then(response => {
        // Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
        if (response !== 'authorized') {
          ToastUtils.showToast('需要存储权限才能进行分享操作');
        }
      });
    }
  };

  componentWillUnmount() {
    NetInfo.removeEventListener(
      'connectionChange',
      this._handleConnectivityChange,
    );
    Dimensions.removeEventListener('change', this.handleOrientationChange);
    __ANDROID__ &&
      BackHandler.removeEventListener('hardwareBackPress', this._onBackAndroid);
    DeviceEventEmitter.removeListener(
      'showUpdateInfoDialog',
      this.showUpdateInfoDialog,
    );
    this.reloadThemeListener && this.reloadThemeListener.remove();
  }

  handleOrientationChange = ({window}) => {
    gStore.dispatch(orientationInfoChanged(window));
  };

  _onBackAndroid = () => {
    //初始页时,navRouters为空,需要判断
    if (NavigationHelper.navRouters&&NavigationHelper.navRouters.length > 1) {
      // 默认行为： 退出当前界面。
      NavigationHelper.goBack();
      return true;
    }

    let now = new Date().getTime();
    if (now - lastClickTime < 2500) return false;

    lastClickTime = now;
    ToastUtils.showToast('再按一次退出' + appName);
    return true;
  };

  loadUpdateInfo = async () => {
    let runningPackage = await gStorage.load('CODEPUSH_PACKAGE_RUNNING');
    let latestPackage = await gStorage.load('CODEPUSH_PACKAGE_LATEST');
    if (latestPackage) {
      //可能为空的，说明app是新安装的
      if (!runningPackage) {
        this.setState({
          showUpdateInfo: true,
        });
      } else {
        let running_uuid;
        let lastest_uuid;
        try {
          running_uuid = JSON.parse(runningPackage.description).uuid;
          lastest_uuid = JSON.parse(latestPackage.description).uuid;
        } catch (e) {
          //eslint-disable-line
        }
        if (!(running_uuid && lastest_uuid && running_uuid === lastest_uuid)) {
          this.setState({
            showUpdateInfo: true,
          });
        }
      }
    }
  };

  render() {
    const {showUpdateInfo} = this.state;
    const AppNavigator = this.props.AppNavigator;
    const addListener = this.props.addListener;
    return (
      <View style={{flex: 1}}>
        <StatusBar
          barStyle={'dark-content'}
          animated={true}
          translucent={true}
          backgroundColor="transparent"
        />
        {__ANDROID__ ? (
          <View
            style={{
              height: gScreen.statusBarHeight,
              backgroundColor: gColors.themeColor,
            }}
          />
        ) : null}
        <AppNavigator
            onNavigationStateChange={(prevState, currentState, action) => {
              //这个是跳转了才去回调，所以不能利用routes来判断路由栈
              NavigationHelper.navRouters = currentState.routes;
            }}
        />
        {isIphoneX ? <View style={{height: 34}} /> : null}
        {showUpdateInfo && (
          <UpdateInfoPromptView
            onPress={this.showUpdateInfoDialog}
            onClose={this.closeUpdateInfoView}
          />
        )}
        <UpdateLogModal
          ref={ref => (this.updateLogModal = ref)}
          message="更新日志"
        />
      </View>
    );
  }

  _handleConnectivityChange = connectionInfo => {
    //初次进入的时候就会触发，不用手动获取状态
    const {dispatch} = this.props;
    dispatch(changeAppNetInfo(connectionInfo));
  };

  showUpdateInfoDialog = async () => {
    this.props.dispatch(
      showLoading({
        isFetching: true,
      }),
    );
    //防止更新日志被修改，所以实时获取最新的
    //不知道是不是缓存的原因，还是获取到的是老的数据
    codePush.getUpdateMetadata(codePush.UpdateState.LATEST).then(update => {
      if (update) {
        let desc = update.description;
        let uuid = '0';
        //兼容老版本
        try {
          desc = JSON.parse(update.description).description;
        } catch (e) {
          console.log(e.message);
        }
        try {
          uuid = JSON.parse(update.description).uuid;
        } catch (e) {}
        let version;
        // if(gScreen.isAndroid)
        // {
        //     version = gBaseConfig.BuildVersion+'_'+update.label;
        // }
        // else
        // {
        //     version = gBaseConfig.BuildVersion+'_'+update.label;
        // }
        version =
          gBaseConfig.BuildVersion +
          '_V' +
          uuid +
          (update.isPending ? '(未生效)' : '');
        this.updateLogModal.show({
          version: version,
          isPending: update.isPending,
          description: desc,
        });
      } else {
        this.props.dispatch(showToast('当前已是最新版本!'));
      }
      this.props.dispatch(
        showLoading({
          isFetching: false,
        }),
      );
    });
  };

  //清除更新信息
  closeUpdateInfoView = () => {
    gStorage.remove('CODEPUSH_PACKAGE_RUNNING');
    gStorage.remove('CODEPUSH_PACKAGE_LATEST');
    this.setState({
      showUpdateInfo: false,
    });
    Alert.alert(
      '提示',
      '您可以在[我]-[关于我们]查看[更新日志]',
      [
        {
          text: '确定',
        },
      ],
      {
        cancelable: false,
      },
    );
  };
}

//只有更新后且id不一致才更新
const UpdateInfoPromptView = ({onPress, onClose}) => {
  return (
    <View
      style={[
        styles.noNetworkWrapper,
        {backgroundColor: gColors.oldThemeColor},
      ]}>
      <TouchableOpacity
        activeOpacity={activeOpacity}
        style={{flex: 1}}
        onPress={onPress}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <SimpleLineIcons name="volume-2" color={gColors.bgColorF} size={22} />
          <Text style={[styles.promptTitle]}>
            <Text>版本已更新，</Text>
            <Text style={[{textDecorationLine: 'underline'}]}>
              点击查看更新日志
            </Text>
          </Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        activeOpacity={activeOpacity}
        style={{
          alignSelf: 'stretch',
          justifyContent: 'center',
          paddingHorizontal: 10,
        }}
        onPress={onClose}>
        <EvilIcons name="close-o" color={gColors.bgColorF} size={25} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  noNetworkWrapper: {
    position: 'absolute',
    top: gScreen.statusBarHeight,
    left: 0,
    right: 0,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#666',
    paddingLeft: 12,
  },
  promptTitle: {
    color: '#fff',
    fontSize: 15,
    marginLeft: 15,
  },
});
