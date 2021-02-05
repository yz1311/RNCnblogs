import React, {Component, PureComponent} from 'react';
import {StyleSheet, View, TouchableOpacity, Image, Text, DeviceEventEmitter} from 'react-native';
import {Styles} from '../../common/styles';
import {BorderShadow} from '@yz1311/react-native-shadow';
import {blogModel} from '../../api/blog';
import moment from "moment";
import HTMLView from 'react-native-render-html';
import StringUtils from "../../utils/stringUtils";
import Feather from 'react-native-vector-icons/Feather';
import {Api} from '../../api';
import ToastUtils from '../../utils/toastUtils';
import {Theme} from '@yz1311/teaset';

interface IProps {
  item: blogModel;
  //是否点击头像查看详情
  canViewProfile: boolean;
  isLandscape?: boolean;
  navigation: any;
}

interface IState {}

export default class blog_item extends PureComponent<IProps, IState> {
  static defaultProps = {
    canViewProfile: true,
  };

  render() {
    const {item} = this.props;
    return (
      <BorderShadow
        setting={{width: gScreen.width, border: 3, color: gColors.color999}}>
        <TouchableOpacity
          activeOpacity={activeOpacity}
          onPress={() => {
            NavigationHelper.push('BlogDetail', {
              item: item,
            });
          }}
          style={{flex: 1}}>
          <View
            style={{
              backgroundColor: gColors.bgColorF,
              paddingVertical: 10,
              paddingHorizontal: 8,
            }}>
            <TouchableOpacity
              activeOpacity={activeOpacity}
              onPress={() => {
                if (this.props.canViewProfile) {
                  NavigationHelper.navigate('ProfilePerson', {
                    userAlias: item.author?.id,
                    userName: item.author?.name,
                    avatorUrl: item.author?.uri,
                  });
                }
              }}
              style={{
                flexDirection: 'row',
                alignSelf: 'stretch',
                alignItems: 'center',
              }}>
              <Image
                style={[Styles.avator]}
                resizeMode="contain"
                defaultSource={require('../../resources/ico/simple_avatar.gif')}
                //avator可能为空
                source={item.author?.avatar?{uri: item.author.avatar}:require('../../resources/ico/simple_avatar.gif')}
              />
              <Text style={[Styles.userName]}>{item.author?.name}</Text>
            </TouchableOpacity>
            {/*<Text*/}
            {/*  style={[*/}
            {/*    {*/}
            {/*      color: gColors.color0,*/}
            {/*      fontSize: gFont.size16,*/}
            {/*      fontWeight: 'bold',*/}
            {/*      marginVertical: 7,*/}
            {/*    },*/}
            {/*    Styles.text4Pie,*/}
            {/*  ]}>*/}
            {/*  {item.title}*/}
            {/*</Text>*/}
              <HTMLView
                  baseFontStyle={{fontWeight:'bold',color: gColors.color0,fontSize: gFont.size16,}}
                  containerStyle={{marginVertical: 7}}
                  html={item.title}
              />
            {/*<Text*/}
            {/*  style={[*/}
            {/*    {*/}
            {/*      color: gColors.color4c,*/}
            {/*      fontSize: gFont.sizeDetail,*/}
            {/*      marginVertical: 4,*/}
            {/*    },*/}
            {/*    Styles.text4Pie,*/}
            {/*  ]}*/}
            {/*  numberOfLines={4}>*/}
            {/*  {item.summary}*/}
            {/*</Text>*/}
              <HTMLView
                  baseFontStyle={{color: gColors.color4c,fontSize: gFont.sizeDetail,}}
                  containerStyle={{marginVertical: 4}}
                  html={item.summary}
              />
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 5,
              }}>
              <TouchableOpacity
                onPress={()=>{
                  //由于没有状态，目前只支持点赞，不支持取消
                  Api.blog.voteBlog({
                    request: {
                      userId: item.author.id,
                      postId: parseInt(item.id),
                      isAbandoned: false
                    }
                  }).then(result => {
                    if(result.data.isSuccess) {
                      DeviceEventEmitter.emit('update_blog_item_digg_count', {postId: item.id, count: item.diggs+1});
                    } else {
                      ToastUtils.showToast(result.data.message || '操作失败!');
                    }
                  }).catch(err=>{

                  })
                }}
                style={{flexDirection:'row',alignItems:'center', paddingRight: 10}}
                >
                <Feather name="thumbs-up" size={16} color={item.isLike?Theme.primaryColor:gColors.color999} />
                <Text style={{marginLeft: 4, color: gColors.color999, fontSize: gFont.size12}}>
                  {item.diggs}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={true}
                style={{flexDirection:'row',alignItems:'center', paddingLeft: 8, paddingRight: 10}}
              >
                <Feather name="message-circle" size={16} color={gColors.color999} />
                <Text style={{marginLeft: 4, color: gColors.color999, fontSize: gFont.size12}}>
                  {item.comments}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={true}
                style={{flexDirection:'row',alignItems:'center', paddingLeft: 8, paddingRight: 10}}
              >
                <Feather name="eye" size={16} color={gColors.color999} />
                <Text style={{marginLeft: 4, color: gColors.color999, fontSize: gFont.size12}}>
                  {item.views}
                </Text>
              </TouchableOpacity>
              <View style={{flex: 1, alignItems: 'flex-end'}}>
                <Text style={{color: gColors.color999, fontSize: gFont.size12}}>
                  {StringUtils.formatDate(item.published)}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </BorderShadow>
    );
  }
}

const styles = StyleSheet.create({
  avator: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
});
