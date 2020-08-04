import React, {Component, PureComponent} from 'react';
import {StyleSheet, View} from 'react-native';
import {Styles} from '../../common/styles';
import Feather from 'react-native-vector-icons/Feather';
import {ListRow, Theme} from '@yz1311/teaset';
import BookmarkItem from './bookmark_item';
import BaseBookmarkList from './base_bookmark_list';
import {Api} from "../../api";
import ScrollableTabView, {ScrollableTabBar} from "@yz1311/react-native-scrollable-tab-view";
import HomeTabBar from "../home/home_indexTab";
import BaseNewsList from "../news/base_news_list";
import {NewsTypes} from "../news/news_index";

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
      <View style={[Styles.container]}>
        <ScrollableTabView
            renderTabBar={() => (
                <ScrollableTabBar
                    ref={bar => (this.tabBar = bar)}
                    style={{
                        backgroundColor: Theme.primaryColor,
                    }}
                    activeTextColor={gColors.bgColorF}
                    inactiveTextColor={'#DBDBDB'}
                    underlineStyle={{
                        backgroundColor: gColors.bgColorF,
                        height: 3
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
      </View>
    );
  }
}

const styles = StyleSheet.create({});
