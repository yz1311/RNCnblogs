import React, {Component} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {connect} from 'react-redux';
import {Styles} from '../../common/styles';
import HomeTabBar from './home_indexTab';
import ScrollableTabView, {ScrollableTabBar} from '@yz1311/react-native-scrollable-tab-view';
import KnowledgeBase from '../knowledgeBase/knowledgeBase_index';
import BaseBlogList from '../blog/base_blog_list';
import {NavigationScreenProp, NavigationState} from 'react-navigation';
import {Theme} from '@yz1311/teaset';
import Ionicons from "react-native-vector-icons/Ionicons";

interface IProps {
  navigation: any;
  initialPage?: number;
  tabIndex: number;
}

interface IState {
  tabNames: Array<string>;
}

export enum BlogTypes {
  首页,
  精华,
  候选,
  关注,
  我评,
  我赞,
  知识库,
  //非tab页面
  我的,
  搜索
}

export default class home_index extends Component<IProps, IState> {
  private tabBar: any;

  constructor(props) {
    super(props);
    this.state = {
      // tabNames: ['首页', '精华','候选', '关注', '知识库'],
      tabNames: ['首页', '精华','候选', '关注', '我评', '我赞'],
    };
  }

  _onChangeTab = obj => {
    switch (obj.i) {
      case 0:
        break;
      case 1: //eslint-disable-line
        break;
      case 2:
        break;
    }
  };

  render() {
    const {tabNames} = this.state;
    return (
      <View style={[Styles.container]}>
        <View
          style={{
            height: Theme.statusBarHeight,
            backgroundColor: Theme.navColor,
          }}
        />
        <View style={{flex:1}}>
          <ScrollableTabView
            renderTabBar={() => (
                <ScrollableTabBar
                    ref={bar => (this.tabBar = bar)}
                    //@ts-ignore
                    style={{
                      backgroundColor: Theme.navColor,
                      paddingRight: 50
                    }}
                    activeTextColor={gColors.bgColorF}
                    inactiveTextColor={'#DBDBDB'}
                    activeTextFontSize={Theme.px2dp(36)}
                    inactiveTextFontSize={Theme.px2dp(30)}
                    underlineStyle={{
                      backgroundColor: gColors.bgColorF,
                      height: 3,
                      alignSelf: 'center',
                      width: 50,
                      borderRadius: 1.5
                    }}
                />
            )}
            tabBarPosition="top"
            initialPage={this.props.initialPage || 0}
            scrollWithoutAnimation={true}
            locked={false}
            onChangeTab={this._onChangeTab}>
            <BaseBlogList
                tabLabel="首页"
                navigation={this.props.navigation}
                tabIndex={this.props.tabIndex}
                blogType={BlogTypes.首页}
            />
            <BaseBlogList
                tabLabel="精华"
                navigation={this.props.navigation}
                tabIndex={this.props.tabIndex}
                blogType={BlogTypes.精华}
            />
            <BaseBlogList
                tabLabel="候选"
                navigation={this.props.navigation}
                tabIndex={this.props.tabIndex}
                blogType={BlogTypes.候选}
            />
            <BaseBlogList
                tabLabel="关注"
                navigation={this.props.navigation}
                tabIndex={this.props.tabIndex}
                blogType={BlogTypes.关注}
            />
            <BaseBlogList
                tabLabel="我评"
                navigation={this.props.navigation}
                tabIndex={this.props.tabIndex}
                blogType={BlogTypes.我评}
            />
            <BaseBlogList
                tabLabel="我赞"
                navigation={this.props.navigation}
                tabIndex={this.props.tabIndex}
                blogType={BlogTypes.我赞}
            />
            {/*<BaseBlogList*/}
            {/*  navigation={this.props.navigation}*/}
            {/*  tabIndex={this.props.tabIndex}*/}
            {/*  blogType={BlogTypes.知识库}*/}
            {/*/>*/}
          </ScrollableTabView>
          <TouchableOpacity
              activeOpacity={activeOpacity}
              style={{
                width: 50,
                justifyContent: 'center',
                alignItems: 'center',
                position: 'absolute',
                right: 0,
                alignSelf: 'stretch',
                height: 50,
              }}
              onPress={() => {
                NavigationHelper.navigate('HomeSearch');
              }}>
            <Ionicons name="ios-search" size={26} color={gColors.bgColorF} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({});
