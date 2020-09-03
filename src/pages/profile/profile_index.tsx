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
import {Styles} from '../../common/styles';
import Entypo from 'react-native-vector-icons/Entypo';
import {ListRow, NavigationBar, Theme} from '@yz1311/teaset';
import {ReduxState} from "../../models";
import {userInfoModel} from "../../api/login";
import {BlogTypes} from "../home/home_index";
import YZSafeAreaView from "../../components/YZSafeAreaView";

interface IProps extends IReduxProps {
  isLogin?: boolean;
  userInfo?: userInfoModel;
  navigation: any;
  tabIndex: number;
}

interface IState {}

@(connect(
  (state: ReduxState) => ({
    userInfo: state.loginIndex.userInfo,
    isLogin: state.loginIndex.isLogin,
  }),
) as any)
export default class profile_index extends Component<IProps, IState> {
  render() {
    const {userInfo} = this.props;
    console.log(userInfo)
    return (
      <YZSafeAreaView>
        <NavigationBar
            style={{position:"relative"}}
            leftView={null}
            title={'我'}
            />
        <ScrollView style={{flex: 1}}>
          {this.props.isLogin ? (
            <TouchableOpacity
              onPress={()=>{
                NavigationHelper.push('ProfileUser');
              }}
              activeOpacity={activeOpacity}
              style={{marginTop: 10}}>
              <View style={{backgroundColor: gColors.bgColorF,}}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
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
                <View style={{flexDirection:'row',marginBottom:15,marginTop:15}}>
                  <TouchableOpacity
                    style={[styles.topButtonContainer]}
                    onPress={()=>{
                      NavigationHelper.push('StarList', {
                        userId: userInfo.id
                      });
                    }}
                    >
                    <Text style={[styles.topButtonDetail]}>{userInfo.stars}</Text>
                    <Text style={[styles.topButtonTitle]}>我的关注</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={()=>{
                      NavigationHelper.push('FollowerList', {
                        userId: userInfo.id
                      });
                    }}
                    style={[styles.topButtonContainer]}
                  >
                    <Text style={[styles.topButtonDetail]}>{userInfo.stars}</Text>
                    <Text style={[styles.topButtonTitle]}>我的粉丝</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.topButtonContainer]}
                  >
                    <Text style={[styles.topButtonDetail]}>{userInfo.seniority}</Text>
                    <Text style={[styles.topButtonTitle]}>园龄</Text>
                  </TouchableOpacity>
                </View>
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
              title="新闻中心"
              icon={
                <Entypo
                  style={{marginRight: 6}}
                  size={18}
                  color={'brown'}
                  name="news"
                />
              }
              onPress={() => {
                if (this.props.isLogin) {
                  this.props.navigation.navigate('NewsIndex', {
                    showHeader: true
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
                  color={Theme.primaryColor}
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
                  color={Theme.primaryColor}
                  name="cog"
                />
              }
              onPress={() => {
                this.props.navigation.navigate('ProfileSetting');
              }}
            />
          </View>
        </ScrollView>
      </YZSafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  avator: {
    width: 50,
    height: 50,
  },
  topButtonContainer: {
    flex:1,
    justifyContent:'center',
    alignItems: 'center'
  },
  topButtonDetail: {
    fontWeight: '500',
    fontSize:gFont.size16,
    color: gColors.color0,
    height: 20
  },
  topButtonTitle: {
    fontSize:gFont.size13,
    color: gColors.color333,
    marginTop: 7
  }
});
