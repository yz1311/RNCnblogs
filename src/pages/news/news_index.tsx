import React, {Component} from 'react';
import {StyleSheet, View} from 'react-native';
import {connect} from 'react-redux';
import {Styles} from '../../common/styles';
import HomeTabBar from '../home/home_indexTab';
import ScrollableTabView from '@yz1311/react-native-scrollable-tab-view';
import BaseNewsList from './base_news_list';
import {NavigationBar, Theme} from '@yz1311/teaset';
import SegmentedControlTab from 'react-native-segmented-control-tab';
import YZSafeAreaView from "../../components/YZSafeAreaView";

interface IProps {
  navigation: any;
  initialPage?: number;
  tabIndex: number;
  showHeader: boolean;
}

interface IState {
  tabNames: Array<string>;
  tabIndex: number;
}

export enum NewsTypes {
  最新,
  推荐,
  热门,
  搜索
}

@(connect(
  state => ({}),
  dispatch => ({
    dispatch,
  }),
) as any)
export default class news_index extends Component<IProps, IState> {
  private tabBar: any;
  private tabView: ScrollableTabView;

  constructor(props) {
    super(props);
    this.state = {
      tabNames: ['最新', '推荐', '热门'],
      tabIndex: 0,
    };
  }

  _onChangeTab = obj => {
    this.setState({
      tabIndex: obj.i
    });
    switch (obj.i) {
      case 0:
        break;
      case 1: //eslint-disable-line
        break;
      case 2:
        break;
    }
  };

  handleIndexChange = (index)=>{
    this.setState({
      tabIndex: index
    });
    //@ts-ignore
    this.tabView.goToPage(index);
  }

  render() {
    const {tabNames} = this.state;
    return (
      <YZSafeAreaView>
        {
          this.props.showHeader?
            <NavigationBar title={
              <SegmentedControlTab
                tabsContainerStyle={{width: Theme.deviceWidth/2}}
                tabStyle={{borderColor: 'purple'}}
                activeTabStyle={{backgroundColor:'purple'}}
                values={this.state.tabNames}
                selectedIndex={this.state.tabIndex}
                onTabPress={this.handleIndexChange}
              />
            } borderBottomWidth={0} />
            :
            null
        }
        <ScrollableTabView
          ref={ref=>this.tabView = ref}
          renderTabBar={() => (
            this.props.showHeader?
              <View />
              :
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
      </YZSafeAreaView>
    );
  }
}

const styles = StyleSheet.create({});
