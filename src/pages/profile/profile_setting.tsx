import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  DeviceEventEmitter,
} from 'react-native';
import {Styles} from '../../common/styles';
import YZHeader from './profile_index';
import {ListRow} from '@yz1311/teaset';
import {connect} from 'react-redux';
import {logout} from '../../actions/login/login_index_actions';
import Entypo from 'react-native-vector-icons/Entypo';
import ThemeModal from './profile_themeModal';
import {ReduxState} from '../../reducers';

interface IProps {
  dispatch: any;
  isLogin: boolean;
  userInfo: any;
  logoutFn: any;
}

interface IState {}

@(connect(
  (state: ReduxState) => ({
    userInfo: state.loginIndex.userInfo,
    isLogin: state.loginIndex.isLogin,
  }),
  dispatch => ({
    dispatch,
    logoutFn: data => dispatch(logout(data)),
  }),
) as any)
export default class profile_setting extends Component<IProps, IState> {

  private reloadThemeListener: any;
  private themeModal: any;

  componentDidMount() {
    this.reloadThemeListener = DeviceEventEmitter.addListener(
      'reloadTheme',
      () => {
        this.forceUpdate();
      },
    );
  }

  componentWillUnmount() {
    this.reloadThemeListener && this.reloadThemeListener.remove();
  }

  render() {
    const {userInfo} = this.props;
    return (
      <View style={[Styles.container]}>
        <ScrollView style={{flex: 1}}>
          <View style={{marginTop: 10}}>
            <ListRow
              activeOpacity={activeOpacity}
              title="字体大小"
              icon={
                <Entypo
                  style={{marginRight: 6}}
                  size={18}
                  color={gColors.themeColor}
                  name="rss"
                />
              }
              onPress={() => {
                NavigationHelper.navigate('ProfileFontSize');
              }}
            />
            <ListRow
              activeOpacity={activeOpacity}
              title="主题设置"
              icon={
                <Entypo
                  style={{marginRight: 6}}
                  size={18}
                  color={gColors.themeColor}
                  name="rss"
                />
              }
              onPress={() => {
                this.themeModal.show();
              }}
            />
            <ListRow
              activeOpacity={activeOpacity}
              title="关于"
              icon={
                <Entypo
                  style={{marginRight: 6}}
                  size={18}
                  color={gColors.themeColor}
                  name="info-with-circle"
                />
              }
              onPress={() => {
                NavigationHelper.navigate('ProfileAbout');
              }}
            />
          </View>
          {this.props.isLogin ? (
            <TouchableOpacity
              activeOpacity={activeOpacity}
              onPress={() => {
                Alert.alert(
                  '退出确认',
                  '退出当前账号，将不能同步收藏，发布评论等',
                  [
                    {
                      text: '取消',
                    },
                    {
                      text: '确认退出',
                      onPress: () => {
                        this.props.logoutFn({
                          successAction: () => {
                            NavigationHelper.goBack();
                          },
                        });
                      },
                    },
                  ],
                  {cancelable: false},
                );
              }}
              style={{
                paddingVertical: 14,
                alignItems: 'center',
                backgroundColor: gColors.bgColorF,
                borderRadius: 6,
                marginBottom: 10,
                marginTop: 20,
              }}>
              <Text style={{color: gColors.colorRed}}>退出账号</Text>
            </TouchableOpacity>
          ) : null}
        </ScrollView>
        <ThemeModal ref={ref => (this.themeModal = ref)} />
      </View>
    );
  }
}
