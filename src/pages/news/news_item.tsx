import React, {Component, PureComponent} from 'react';
import {StyleSheet, View, TouchableOpacity, Image, Text} from 'react-native';
import {connect} from 'react-redux';
import YZStateView from '../../components/YZStateCommonView';
import YZFlatList from '../../components/YZFlatList';
import Styles from '../../common/styles';
import Feather from 'react-native-vector-icons/Feather';
import {ListRow} from '@yz1311/teaset';
import PropTypes from 'prop-types';
import {setSelectedDetail} from '../../actions/news/news_index_actions';
import {BorderShadow} from '@yz1311/react-native-shadow';
import {NavigationScreenProp, NavigationState} from 'react-navigation';

interface IProps {
  navigation: NavigationScreenProp<NavigationState>;
  setSelectedDetailFn?: any;
  item: news;
}

interface IState {
  tabNames: Array<string>;
}

export interface news {
  Title: string;
  TopicIcon: string | undefined;
  Summary: string | undefined;
  DiggCount: number | undefined;
  CommentCount: number | undefined;
  ViewCount: number | undefined;
  postDateDesc: string | undefined;
}

@(connect(
  state => ({}),
  dispatch => ({
    dispatch,
    setSelectedDetailFn: data => dispatch(setSelectedDetail(data)),
  }),
) as any)
export default class news_item extends PureComponent<IProps, IState> {
  render() {
    const {item} = this.props;
    return (
      <BorderShadow
        setting={{width: gScreen.width, border: 3, color: gColors.color999}}>
        <TouchableOpacity
          activeOpacity={activeOpacity}
          onPress={() => {
            this.props.setSelectedDetailFn(item);
            this.props.navigation.navigate('NewsDetail', {});
          }}>
          <View
            style={{
              backgroundColor: gColors.bgColorF,
              paddingVertical: 10,
              paddingHorizontal: 8,
            }}>
            <Text
              style={[
                {
                  color: gColors.color0,
                  fontSize: gFont.size16,
                  fontWeight: 'bold',
                  marginVertical: 7,
                },
                Styles.text4Pie,
              ]}>
              {item.Title}
            </Text>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              {item.TopicIcon ? (
                <Image
                  style={[styles.icon]}
                  resizeMode="contain"
                  source={{uri: item.TopicIcon}}
                />
              ) : (
                <View style={[styles.icon]} />
              )}
              <Text
                style={[
                  {
                    color: gColors.color4c,
                    fontSize: gFont.sizeDetail,
                    marginVertical: 4,
                    marginLeft: 8,
                    flex: 1,
                  },
                  Styles.text4Pie,
                ]}
                numberOfLines={4}>
                {item.Summary}
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 5,
              }}>
              <Text style={{color: gColors.color999, fontSize: gFont.size12}}>
                {item.DiggCount + ' 推荐 · '}
              </Text>
              <Text style={{color: gColors.color999, fontSize: gFont.size12}}>
                {item.CommentCount + ' 评论 · '}
              </Text>
              <Text style={{color: gColors.color999, fontSize: gFont.size12}}>
                {item.ViewCount + ' 阅读'}
              </Text>
              <View style={{flex: 1, alignItems: 'flex-end'}}>
                <Text style={{color: gColors.color999, fontSize: gFont.size12}}>
                  {item.postDateDesc}
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
    width: 40,
    height: 40,
  },
});
