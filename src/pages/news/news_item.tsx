import React, {Component, PureComponent} from 'react';
import {StyleSheet, View, TouchableOpacity, Image, Text, DeviceEventEmitter} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {ListRow, Theme} from '@yz1311/teaset';
import {BorderShadow} from '@yz1311/react-native-shadow';
import {NavigationScreenProp, NavigationState} from 'react-navigation';
import {newsModel} from "../../api/news";
import moment from "moment";
import HTMLView from 'react-native-render-html';
import {Api} from '../../api';
import ToastUtils from '../../utils/toastUtils';
import StringUtils from '../../utils/stringUtils';

interface IProps {
  navigation: any;
  item: newsModel;
}

interface IState {
  tabNames: Array<string>;
}

export default class news_item extends PureComponent<IProps, IState> {
  render() {
    const {item} = this.props;
    return (
      <BorderShadow
        setting={{width: gScreen.width, border: 3, color: gColors.color999}}>
        <TouchableOpacity
          activeOpacity={activeOpacity}
          onPress={() => {
            this.props.navigation.navigate('NewsDetail', {
                item: item
            });
          }}>
          <View
            style={{
              backgroundColor: gColors.bgColorF,
              paddingVertical: 10,
              paddingHorizontal: 8,
            }}>
              <HTMLView
                  baseFontStyle={{fontWeight:'bold',color: gColors.color0,fontSize: gFont.size16,}}
                  containerStyle={{marginVertical: 7}}
                  html={item.title}
                  // stylesheet={styles}
              />
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              {item.author?.avatar ? (
                <Image
                  style={[styles.icon]}
                  resizeMode="contain"
                  source={{uri: item.author?.avatar}}
                />
              ) : (
                <View style={[styles.icon]} />
              )}
              {/*<Text*/}
              {/*  style={[*/}
              {/*    {*/}
              {/*      color: gColors.color4c,*/}
              {/*      fontSize: gFont.sizeDetail,*/}
              {/*      marginVertical: 4,*/}
              {/*      marginLeft: 8,*/}
              {/*      flex: 1,*/}
              {/*    },*/}
              {/*    Styles.text4Pie,*/}
              {/*  ]}*/}
              {/*  numberOfLines={4}>*/}
              {/*  {item.summary}*/}
              {/*</Text>*/}
                <HTMLView
                    baseFontStyle={{color: gColors.color4c,fontSize: gFont.sizeDetail,}}
                    containerStyle={{marginVertical: 4,flex:1, marginLeft: 10}}
                    html={item.summary}
                />
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 5,
              }}>
              <TouchableOpacity
                onPress={()=>{
                  //由于没有状态，目前只支持点赞，不支持取消
                  // Api.blog.voteBlog({
                  //   request: {
                  //     userId: item.author.id,
                  //     postId: parseInt(item.id),
                  //     isAbandoned: false
                  //   }
                  // }).then(result => {
                  //   if(result.data.isSuccess) {
                  //     DeviceEventEmitter.emit('update_blog_item_digg_count', {postId: item.id, count: item.diggs+1});
                  //   } else {
                  //     ToastUtils.showToast(result.data.message || '操作失败!');
                  //   }
                  // }).catch(err=>{
                  //
                  // })
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
  icon: {
    width: 60,
    height: 60,
  },
});
