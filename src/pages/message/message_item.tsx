import React, {Component, PureComponent} from 'react';
import {StyleSheet, View, TouchableOpacity, Image, Text} from 'react-native';
import {connect} from 'react-redux';
import YZStateView from '../../components/YZStateCommonView';
import YZFlatList from '../../components/YZFlatList';
import {Styles} from '../../common/styles';
import Feather from 'react-native-vector-icons/Feather';
import {ListRow} from '@yz1311/teaset';
import PropTypes from 'prop-types';
import {BorderShadow} from '@yz1311/react-native-shadow';
import {NavigationScreenProp, NavigationState} from 'react-navigation';
import {newsModel} from "../../api/news";
import moment from "moment";
import {messageModel} from '../../api/message';
import ServiceUtils from '../../utils/serviceUtils';
import Markdown from 'react-native-markdown-renderer';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface IProps extends IReduxProps{
  navigation: NavigationScreenProp<NavigationState>;
  item: messageModel;
}

interface IState {
  tabNames: Array<string>;
}

@(connect(
  state => ({}),
  dispatch => ({
    dispatch,
  }),
) as any)
export default class message_item extends PureComponent<IProps, IState> {
  render() {
    const {item} = this.props;
    return (
      <BorderShadow
        setting={{width: gScreen.width, border: 3, color: gColors.color999}}>
        <TouchableOpacity
          activeOpacity={activeOpacity}
          onPress={() => {
            if(item.author?.name) {
              NavigationHelper.push('YZWebPage', {
                title: '消息详情',
                uri: item.link
              });
            }
          }}>
          <View
            style={{
              backgroundColor: gColors.bgColorF,
              paddingVertical: 10,
              paddingHorizontal: 8,
            }}>
            <View style={{flexDirection: 'row', alignItems: 'center',justifyContent:'space-between'}}>
              <TouchableOpacity
                activeOpacity={activeOpacity}
                onPress={() => {
                  ServiceUtils.viewProfileDetail(
                    this.props.dispatch,
                    item.author?.id,
                    item.author?.avatar
                  );
                }}
                style={{
                  flexDirection: 'row',
                  alignSelf: 'stretch',
                  alignItems: 'center',
                }}>
                {item.author?.avatar ? (
                  <Image
                    style={[Styles.avator]}
                    resizeMode="contain"
                    source={{uri: item.author?.avatar}}
                  />
                ) : (
                  <View style={[styles.avator]} />
                )}
                {item.author != undefined ? (
                  <Text style={[Styles.userName]}>
                    {item.author?.name || '系统通知'}
                  </Text>
                ) : (
                  '--'
                )}
              </TouchableOpacity>
              <Text>{item.statusDesc}</Text>
            </View>
            <Text
              style={[
                {
                  color: gColors.color0,
                  fontSize: gFont.size16,
                  marginVertical: 7,
                },
                Styles.text4Pie,
              ]}>
              <Text selectable>{item.title}</Text>
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 5,
              }}>
              {/*<Text style={{color: gColors.color666, fontSize: gFont.size12}}>*/}
              {/*  {item.DiggCount + ' 推荐 · '}*/}
              {/*</Text>*/}
              <View />
              <View style={{flex: 1, alignItems: 'flex-end'}}>
                <Text style={{color: gColors.color999, fontSize: gFont.size12}}>
                  {moment(item.published).format('YYYY-MM-DD HH:mm')}
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
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  icon: {
    width: 40,
    height: 40,
  },
});
