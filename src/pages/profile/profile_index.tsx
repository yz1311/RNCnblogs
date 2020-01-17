import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Text,
  ScrollView,
} from 'react-native';
import {connect} from 'react-redux';
import YZHeader from '../../components/YZHeader';
import Styles from '../../common/styles';
import Entypo from 'react-native-vector-icons/Entypo';
import {ListRow, NavigationBar} from '@yz1311/teaset';
import {logout} from '../../actions/login/login_index_actions';
import {NavigationScreenProp, NavigationState} from 'react-navigation';
import {ReduxState} from "../../models";
import {userInfoModel} from "../../api/login";
import {BlogTypes} from "../home/home_index";

interface IProps extends IReduxProps {
  isLogin?: boolean;
  userInfo?: userInfoModel;
  logoutFn?: any;
  navigation: NavigationScreenProp<NavigationState>;
  tabIndex: number;
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
export default class profile_index extends Component<IProps, IState> {
  render() {
    const {userInfo} = this.props;
    return (
      <View style={[Styles.container]}>
        <NavigationBar
            style={{position:"relative"}}
            title={'我'}
            />
        <ScrollView style={{flex: 1}}>
          {this.props.isLogin ? (
            <TouchableOpacity
              activeOpacity={activeOpacity}
              style={{marginTop: 10}}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: gColors.bgColorF,
                  paddingHorizontal: 13,
                  paddingVertical: 10,
                }}>
                  <Image
                      style={[styles.avator]}
                      resizeMode={'contain'}
                      source={{uri: userInfo.avatar || 'https://pic.cnblogs.com/avatar/simple_avatar.gif'}}
                  />
                <View style={{marginLeft: 10, flex: 1}}>
                  <Text
                    style={{
                      fontSize: gFont.size17,
                      color: gColors.color0,
                    }}>
                    {userInfo.nickName}
                  </Text>
                  <Text
                    style={{
                      fontSize: gFont.size13,
                      color: gColors.color666,
                      marginTop: 6,
                    }}>
                    {userInfo.seniority}
                  </Text>
                </View>
                {/*<Entypo name="chevron-thin-right" size={18} color={gColors.color999}/>*/}
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              activeOpacity={activeOpacity}
              style={{marginTop: 10}}
              onPress={() => {
                NavigationHelper.navigate('Login');
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: gColors.bgColorF,
                  paddingHorizontal: 13,
                  paddingVertical: 15,
                }}>
                <Text style={{flex: 1}}>点击登录</Text>
                <Entypo
                  name="chevron-thin-right"
                  size={18}
                  color={gColors.color999}
                />
              </View>
            </TouchableOpacity>
          )}

          <View style={{marginTop: 10}}>
            <ListRow
              activeOpacity={activeOpacity}
              title="消息中心"
              icon={
                <Entypo
                  style={{marginRight: 6}}
                  size={18}
                  color={gColors.colorGreen1}
                  name="message"
                />
              }
              onPress={() => {
                if (this.props.isLogin) {
                  this.props.navigation.navigate('MessageIndex', {

                  });
                } else {
                  NavigationHelper.navigate('Login');
                }
              }}
            />
          </View>
          <View style={{marginTop: 10}}>
            <ListRow
              activeOpacity={activeOpacity}
              title="我的博文"
              icon={
                <Entypo
                  style={{marginRight: 6}}
                  size={18}
                  color={gColors.themeColor}
                  name="rss"
                />
              }
              onPress={() => {
                if (this.props.isLogin) {
                  this.props.navigation.navigate('BaseBlogList', {
                    title: '我的博客',
                    blogType: BlogTypes.我的
                  });
                } else {
                  NavigationHelper.navigate('Login');
                }
              }}
            />
            <ListRow
              activeOpacity={activeOpacity}
              title="我的收藏"
              icon={
                <Entypo
                  style={{marginRight: 6, marginLeft: -5}}
                  size={23}
                  color={gColors.colorRed}
                  name="star"
                />
              }
              onPress={() => {
                if (this.props.isLogin) {
                  NavigationHelper.navigate('Bookmark');
                } else {
                  NavigationHelper.navigate('Login');
                }
              }}
            />
          </View>
          <View style={{marginTop: 10}}>
            <ListRow
              activeOpacity={activeOpacity}
              title="系统设置"
              icon={
                <Entypo
                  style={{marginRight: 6}}
                  size={18}
                  color={gColors.themeColor}
                  name="cog"
                />
              }
              onPress={() => {
                this.props.navigation.navigate('ProfileSetting');
              }}
            />
          </View>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  avator: {
    width: 50,
    height: 50,
  },
});
