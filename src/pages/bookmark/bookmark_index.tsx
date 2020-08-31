import React, {Component, PureComponent} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {Styles} from '../../common/styles';
import {ListRow, NavigationBar, Theme} from '@yz1311/teaset';
import BaseBookmarkList from './base_bookmark_list';
import {Api} from "../../api";
import ScrollableTabView, {ScrollableTabBar} from "@yz1311/react-native-scrollable-tab-view";
import {NavigationHelper} from "@yz1311/teaset-navigation";
import Entypo from "react-native-vector-icons/Entypo";
import YZSafeAreaView from "../../components/YZSafeAreaView";

interface IProps {
  dataList: Array<any>;
  loadDataResult: any;
  noMore: boolean;
}

interface IState {
  dataList: Array<any>,
}

const initialDataList = ['热门','我的'];

export default class bookmark_index extends PureComponent<IProps, IState> {

  readonly state:IState = {
    dataList: initialDataList
  };

  private tabBar:ScrollableTabBar;

  componentDidMount(): void {
    this.loadData();
  }

  loadData = async ()=>{
    try {
      let response = await Api.bookmark.getMyTags({
        request: {

        }
      });
      this.setState({
          dataList: initialDataList.concat(response.data.map(x=>x.name))
      });
    } catch (e) {

    }
  }

  render() {
    return (
      <YZSafeAreaView>
          <View style={{height: Theme.statusBarHeight, backgroundColor:Theme.primaryColor}} />
            <ScrollableTabView
                renderTabBar={() => (
                    <ScrollableTabBar
                        ref={bar => (this.tabBar = bar)}
                        style={{
                            backgroundColor: Theme.primaryColor,
                            marginLeft: Theme.px2dp(100)
                        }}
                        activeTextColor={gColors.bgColorF}
                        inactiveTextColor={'#DBDBDB'}
                        activeTextFontSize={Theme.px2dp(36)}
                        inactiveTextFontSize={Theme.px2dp(30)}
                        underlineStyle={{
                            backgroundColor: gColors.bgColorF,
                            height: 3,
                            borderRadius: 1.5
                        }}
                    />
                )}
                tabBarPosition="top"
                initialPage={0}
                scrollWithoutAnimation={true}
                locked={false}>
              {
                this.state.dataList.map((x,index)=>(
                  <BaseBookmarkList
                      tabLabel={x}
                      bookmarkType={x}
                  />
                ))
              }
            </ScrollableTabView>
          <View style={{position: 'absolute', top: Theme.statusBarHeight, height: 50,
              width: Theme.px2dp(100),
              backgroundColor: Theme.primaryColor}}>
              <TouchableOpacity
                  activeOpacity={activeOpacity}
                  style={{
                      flex: 1,
                      paddingLeft: 9,
                      paddingRight: 8,
                      alignSelf: 'stretch',
                      justifyContent: 'center',
                  }}
                  onPress={() => {
                      // navigation.goBack();
                      NavigationHelper.goBack();
                  }}>
                  <Entypo name={'chevron-thin-left'} size={23} color="white" />
              </TouchableOpacity>
          </View>
      </YZSafeAreaView>
    );
  }
}

const styles = StyleSheet.create({});
