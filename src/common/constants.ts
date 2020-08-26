import {Dimensions, PixelRatio, Platform, NativeModules} from 'react-native';
import StringUtils from '../utils/stringUtils';

global.gUserData = {
  session_id: '',
  uid: '',
};

global.gBaseConfig = {
  PushToken: '',
  UniqueId: '',
  BuildVersion: '2.0.2',
  iOSCameraPermissionPrompt: '',
  clientId: '',
  clientSecret: '',
};

global.appName = '博客园';

//http://wcf.open.cnblogs.com/blog/help
global.gServerPath = 'http://wcf.open.cnblogs.com/';

global.gColors = {
  backgroundColor: '#f2f2f2',
  //不能设置值，否则退出页面的时候，会显示该颜色
  // themeColor: '#1a76d2',
  colorGreen1: '#68b92e',
  oldThemeColor: '#00a0e9',
  borderColor: '#e9e9e9',
  bgColorF: '#fff',
  bgcolor2: '#24d668',
  bgcolor3: '#E6EEF1',
  bgcolor4: '#1CABB0',
  colore0: '#e0e0e0',
  color333: '#333',
  color39: '#393939',
  color3c: '#3c3c3c',
  color3d: '#3d3d3d',
  color3f: '#3f3f3f',
  color40: '#404040',
  color4c: '#4c4c4c',
  color666: '#666',
  color999: '#999',
  colorc5: '#c5c5c5',
  colorf5: '#f5f5f5',
  colorRed: '#ff4141',
  bgcolord9: '#d9d9d9',
  color53: '#535353',
  color00a: '#00a0e9', //浅蓝
  bgColorF4: '#f4f4f4', //浅灰色
  color0: '#000', //深黑
  borderColorE5: '#e5e5e5',
  color7: '#777',
  colord7: '#d7a029',
  color5: '#555',
  colorff: '#ff0000',
  color7e: '#7e878b',
  borderColore5: '#e5e5e5',
  color6e: '#6e6e6e',
  color66: '#666666',
  color00A0E9: '#00A0E9',
  buttonDisabled: '#8DB6CD',
  oldButtonDisabled: 'rgb(132, 197, 225)',
  color9b: '#9b9b9b',
  colorba: '#bababa',
  fontColor007: '#007EE9',
  fontColorB26: '#B26315',
  colorItemSub: '#758385',
  colorPurple: '#774DA0',
  colorDarkPurple1: '#4c3e86',
  colorDarkPurple2: '#6e609e',
};

global.gScreen = {
  onePix: 1 / PixelRatio.get(),
  width: Dimensions.get('window').width,
  height: Dimensions.get('window').height,
  isAndroid: Platform.OS === 'android',
  //状态栏+导航栏的高度
  headerHeight: Platform.OS === 'android' ? 50 : 64,
  //导航栏的高度
  navigationBarHeight: Platform.OS === 'android' ? 50 : 44,
  //状态栏的高度
  statusBarHeight: Platform.OS === 'android' ? 0 : 20,
  isTranslucent: true,
};

global.fontSizeScaler = PixelRatio.get() / PixelRatio.getFontScale();
let fontSizeScaler = 1.0;
global.gFont = {
  size85: 85 * fontSizeScaler,
  size64: 64 * fontSizeScaler,
  size50: 50 * fontSizeScaler,
  size40: 40 * fontSizeScaler,
  size35: 35 * fontSizeScaler,
  size33: 33 * fontSizeScaler,
  size30: 30 * fontSizeScaler,
  size26: 26 * fontSizeScaler,
  size24: 24 * fontSizeScaler,
  size21: 21 * fontSizeScaler,
  size20: 20 * fontSizeScaler,
  size19: 19 * fontSizeScaler,
  size18: 18 * fontSizeScaler,
  size17: 17 * fontSizeScaler,
  size16: 16 * fontSizeScaler,
  size15: 15 * fontSizeScaler,
  size14: 14 * fontSizeScaler,
  size13: 13 * fontSizeScaler,
  size12: 12 * fontSizeScaler,
  size11: 11 * fontSizeScaler,
  size10: 10 * fontSizeScaler,
  size8: 8 * fontSizeScaler,
  size6: 6 * fontSizeScaler,
  size5: 5 * fontSizeScaler,
  size4: 4 * fontSizeScaler,
  sizeDetail: (Platform.OS === 'android' ? 15 : 14) * fontSizeScaler,
};

(global.gMargin = 10), (global.activeOpacity = 0.75);

global.gStorageKeys = {
  CurrentUser: 'CurrentUser',
  HistoryUsers: 'HistoryUsers',
};

global.gString = {
  profileHasChanged: '退出后已修改的数据将被清空，是否退出？',
  profileHasChanged_OK: '退出',
  profileHasChanged_Cancel: '取消',
};

global.gUtils = {
  string: StringUtils,
};
