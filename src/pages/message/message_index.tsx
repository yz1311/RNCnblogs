import React, {Component} from 'react';
import {StyleSheet, View} from 'react-native';
import {connect} from 'react-redux';
import {Styles} from '../../common/styles';
import ScrollableTabView from '@yz1311/react-native-scrollable-tab-view';
import BaseMessageList from './base_message_list';
import {NavigationScreenProp, NavigationState} from 'react-navigation';
import {NavigationBar, SegmentedBar, Theme} from '@yz1311/teaset';
import SegmentedControlTab from "react-native-segmented-control-tab";
import YZSafeAreaView from "../../components/YZSafeAreaView";


interface IProps {
  navigation: any;
  initialPage?: number;
  tabIndex: number;
}

interface IState {
  tabNames: Array<string>;
  tabIndex: number;
}

export enum MessageTypes {
  收件箱,
  发件箱,
  未读消息
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
      tabNames: ['收件箱', '发件箱'],
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
        <NavigationBar title={
          <SegmentedControlTab
              tabsContainerStyle={{width: Theme.deviceWidth/2}}
              tabStyle={{borderColor: 'purple'}}
              activeTabStyle={{backgroundColor:'purple'}}
              values={["收件箱", "发件箱"]}
              selectedIndex={this.state.tabIndex}
              onTabPress={this.handleIndexChange}
          />
        } borderBottomWidth={0} />
        <ScrollableTabView
          ref={ref=>this.tabView = ref}
          renderTabBar={() => (
            <View />
          )}
          tabBarPosition="top"
          initialPage={this.props.initialPage || 0}
          locked={false}
          onChangeTab={this._onChangeTab}>
          <BaseMessageList
            navigation={this.props.navigation}
            tabIndex={this.props.tabIndex}
            messageType={MessageTypes.收件箱}
          />
          <BaseMessageList
            navigation={this.props.navigation}
            tabIndex={this.props.tabIndex}
            messageType={MessageTypes.发件箱}
          />
          {/*<BaseMessageList*/}
          {/*  navigation={this.props.navigation}*/}
          {/*  tabIndex={this.props.tabIndex}*/}
          {/*  messageType={MessageTypes.未读消息}*/}
          {/*/>*/}
        </ScrollableTabView>
      </YZSafeAreaView>
    );
  }
}

const styles = StyleSheet.create({});
