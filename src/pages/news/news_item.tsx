import React, {Component, PureComponent} from 'react';
import {StyleSheet, View, TouchableOpacity, Image, Text} from 'react-native';
import {connect} from 'react-redux';
import YZStateView from '../../components/YZStateCommonView';
import YZFlatList from '../../components/YZFlatList';
import {Styles} from '../../common/styles';
import Feather from 'react-native-vector-icons/Feather';
import {ListRow} from '@yz1311/teaset';
import {BorderShadow} from '@yz1311/react-native-shadow';
import {NavigationScreenProp, NavigationState} from 'react-navigation';
import {newsModel} from "../../api/news";
import moment from "moment";
import HTMLView from 'react-native-render-html';

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
                  stylesheet={styles}
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
                    containerStyle={{marginVertical: 4,flex:1}}
                    html={item.summary}
                />
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 5,
              }}>
              <Text style={{color: gColors.color999, fontSize: gFont.size12}}>
                {item.diggs + ' 推荐 · '}
              </Text>
              <Text style={{color: gColors.color999, fontSize: gFont.size12}}>
                {item.comments + ' 评论 · '}
              </Text>
              <Text style={{color: gColors.color999, fontSize: gFont.size12}}>
                {item.views + ' 阅读'}
              </Text>
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
  icon: {
    width: 40,
    height: 40,
  },
});
