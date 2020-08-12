import React, {Component} from 'react';
import {StyleSheet, View} from 'react-native';
import {connect} from 'react-redux';
import {Styles} from '../../common/styles';
import HomeTabBar from '../home/home_indexTab';
import ScrollableTabView from '@yz1311/react-native-scrollable-tab-view';
import BaseMessageList from './base_message_list';
import {NavigationScreenProp, NavigationState} from 'react-navigation';
import {NavigationBar, Theme} from '@yz1311/teaset';

interface IProps {
  navigation: any;
  initialPage?: number;
  tabIndex: number;
}

interface IState {
  tabNames: Array<string>;
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

  constructor(props) {
    super(props);
    this.state = {
      tabNames: ['收件箱', '发件箱'],
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
        <NavigationBar title="消息中心" borderBottomWidth={0} />
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
      </View>
    );
  }
}

const styles = StyleSheet.create({});
