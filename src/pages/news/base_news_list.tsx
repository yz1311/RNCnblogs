import React, {Component} from 'react';
import {
  DeviceEventEmitter,
  EmitterSubscription,
  StyleSheet,
  View,
} from 'react-native';
import {connect} from 'react-redux';
import YZHeader from '../../components/YZHeader';
import YZBaseDataPage, {
  IBaseDataPageProps,
} from '../../components/YZBaseDataPage';
import YZStateView from '../../components/YZStateCommonView';
import YZFlatList from '../../components/YZFlatList';
import Styles from '../../common/styles';
import Feather from 'react-native-vector-icons/Feather';
import {ListRow} from '@yz1311/teaset';
import NewsItem from './news_item';

export interface IBaseNewsProps extends IBaseDataPageProps {
  dataList?: Array<any>;
  loadDataResult?: any;
  noMore?: boolean;
  tabIndex?: number;
}

interface IState {}

export default class base_news_list<
  T extends IBaseNewsProps,
  IState
> extends YZBaseDataPage<T, IState> {
  protected pageIndex: number = 1;
  private scrollListener: EmitterSubscription;
  private refreshListener: EmitterSubscription;
  private _flatList: any;

  constructor(props) {
    super(props);
    this.scrollListener = DeviceEventEmitter.addListener(
      'list_scroll_to_top',
      ({tabIndex}) => {
        if (tabIndex === this.props.tabIndex) {
          this._flatList && this._flatList._scrollToTop();
        }
      },
    );
    this.refreshListener = DeviceEventEmitter.addListener(
      'list_refresh',
      ({tabIndex}) => {
        if (tabIndex === this.props.tabIndex) {
          this._flatList && this._flatList._onRefresh();
        }
      },
    );
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    this.scrollListener.remove();
    this.refreshListener.remove();
  }

  // pageIndex = 1;

  _renderItem = ({item, index}) => {
    return <NewsItem item={item} navigation={this.props.navigation} />;
  };

  render() {
    return (
      <View style={[Styles.container]}>
        <YZStateView
          getResult={this.props.loadDataResult}
          placeholderTitle="暂无数据"
          errorButtonAction={this.loadData}>
          <YZFlatList
            ref={ref => (this._flatList = ref)}
            renderItem={this._renderItem}
            data={this.props.dataList}
            loadDataResult={this.props.loadDataResult}
            noMore={this.props.noMore}
            initialNumToRender={20}
            loadData={this.loadData}
            onPageIndexChange={pageIndex => {
              this.pageIndex = pageIndex;
            }}
            ItemSeparatorComponent={() => (
              <View style={{height: 10, backgroundColor: 'transparent'}} />
            )}
          />
        </YZStateView>
      </View>
    );
  }
}

const styles = StyleSheet.create({});
