import React, {Component, PureComponent} from 'react';

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
import 'react-native-gesture-handler';
import {NavigationContainer} from '@react-navigation/native';
import {
  NavigationState,
} from '@react-navigation/routers';
import {
  changeAppNetInfo,
  orientationInfoChanged,
} from '../actions/app_actions';
import {CodePushHandler} from '@yz1311/teaset-code-push';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import Permissions from 'react-native-permissions';
import ToastUtils from "../utils/toastUtils";
import {NavigationHelper} from '@yz1311/teaset-navigation';
import {Theme} from "@yz1311/teaset";

let lastClickTime = 0;

interface IProps extends IReduxProps {
  AppNavigator: any;
}

interface IState {}

@CodePushHandler({isDebugMode: false})
export default class App extends Component<IProps, IState> {
  private reloadThemeListener: EmitterSubscription;

  constructor(props) {
    super(props);
    this.state = {
      showUpdateInfo: false,
    };
  }

  componentDidMount() {
    this.reloadThemeListener = DeviceEventEmitter.addListener(
      'reloadTheme',
      () => {
        this.forceUpdate();
      },
    );
    // NetInfo.addEventListener(
    //   'connectionChange',
    //   this._handleConnectivityChange,
    // );
    Dimensions.removeEventListener('change', this.handleOrientationChange);
    __ANDROID__ &&
      BackHandler.addEventListener('hardwareBackPress', this._onBackAndroid);

    this.requestPermission();
    Platform.OS === 'android' && AppState.addEventListener('change', this._onStateChange);
  }

  shouldComponentUpdate(nextProps: Readonly<IProps>, nextState: Readonly<IState>, nextContext: any): boolean {
    if(this.props !== nextProps) {
      //优化CodePussHandler导致的重复刷新的问题
      if(this.props.AppNavigator !== nextProps.AppNavigator) {
        return true;
      }
      return false;
    }
    return true;
  }

  requestPermission = () => {
    if (__ANDROID__) {
      Permissions.request(Permissions.PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE).then(response => {
        // Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
        if (response !== 'granted') {
          ToastUtils.showToast('需要存储权限才能进行分享操作');
        }
      });
    }
  };

  componentWillUnmount() {
    Dimensions.removeEventListener('change', this.handleOrientationChange);
    __ANDROID__ &&
      BackHandler.removeEventListener('hardwareBackPress', this._onBackAndroid);
    this.reloadThemeListener && this.reloadThemeListener.remove();
    Platform.OS === 'android' && AppState.removeEventListener('change', this._onStateChange);
  }

  handleOrientationChange = ({window}) => {
    gStore.dispatch(orientationInfoChanged(window));
  };

  _onStateChange = () => {
    //在android下有个bug，app呆在后台一段时候后，返回到前台，状态栏会变成半透明
    //并且将内容向下顶下去，该处就是修复该问题
    StatusBar.setTranslucent(true);
  };

  _onBackAndroid = () => {
    //初始页时,navRouters为空,需要判断
    if (
        NavigationHelper.navRouters &&
        NavigationHelper.navRouters.length > 1
    ) {
      // 默认行为： 退出当前界面。
      NavigationHelper.goBack();
      return true;
    }

    let now = new Date().getTime();
    if (now - lastClickTime < 2500) {
      return false;
    }

    lastClickTime = now;
    ToastUtils.showToast('再按一次退出' + appName);
    return true;
  };

  render() {
    const AppNavigator = this.props.AppNavigator;
    return (
      <View style={{flex: 1}}>
        <NavigationContainer onStateChange={(state: NavigationState) => {
          //这个是跳转了才去回调，所以不能利用routes来判断路由栈
          NavigationHelper.navRouters = state.routes;
        }}>
          <AppNavigator />
        </NavigationContainer>
        {Theme.isIPhoneX ? (
            <View
                style={{height: 34, backgroundColor: Theme.navColor}}
            />
        ) : null}
        {/*由于NavigationContainer有针对StatusBar的处理，覆盖需要放在后面*/}
        <StatusBar
            barStyle="light-content"
            animated={true}
            translucent={true}
            backgroundColor="transparent"
        />
      </View>
    );
  }

  _handleConnectivityChange = connectionInfo => {
    //初次进入的时候就会触发，不用手动获取状态
    const {dispatch} = this.props;
    dispatch(changeAppNetInfo(connectionInfo));
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
