import React, {Component} from 'react';
import {StyleSheet, View} from 'react-native';
import {connect} from 'react-redux';
import Styles from '../../common/styles';
import HomeTabBar from '../home/home_indexTab';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import BaseNewsList from './base_news_list';
import {NavigationScreenProp, NavigationState} from 'react-navigation';
import {Theme} from '@yz1311/teaset';

interface IProps {
  navigation: NavigationScreenProp<NavigationState>;
  initialPage?: number;
  tabIndex: number;
}

interface IState {
  tabNames: Array<string>;
}

export enum NewsTypes {
  最新,
  推荐,
  热门
}

@(connect(
  state => ({}),
  dispatch => ({
    dispatch,
  }),
) as any)
export default class news_index extends Component<IProps, IState> {
  private tabBar: any;

  constructor(props) {
    super(props);
    this.state = {
      tabNames: ['最新', '推荐', '热门'],
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
        <ScrollableTabView
          renderTabBar={() => (
            <HomeTabBar
              ref={bar => (this.tabBar = bar)}
              containerStyle={{backgroundColor: Theme.navColor}}
              tabDatas={tabNames}
            />
          )}
          tabBarPosition="top"
          initialPage={this.props.initialPage || 0}
          scrollWithoutAnimation={true}
          locked={false}
          onChangeTab={this._onChangeTab}>
          <BaseNewsList
            navigation={this.props.navigation}
            tabIndex={this.props.tabIndex}
            newsType={NewsTypes.最新}
          />
          <BaseNewsList
            navigation={this.props.navigation}
            tabIndex={this.props.tabIndex}
            newsType={NewsTypes.推荐}
          />
          <BaseNewsList
            navigation={this.props.navigation}
            tabIndex={this.props.tabIndex}
            newsType={NewsTypes.热门}
          />
        </ScrollableTabView>
      </View>
    );
  }
}

const styles = StyleSheet.create({});
