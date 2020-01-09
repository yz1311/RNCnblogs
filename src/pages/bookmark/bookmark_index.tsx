import React, {Component} from 'react';
import {StyleSheet, View} from 'react-native';
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
import BookmarkItem from './bookmark_item';
import {
  getBookmarkList,
  clearBookmarkList,
} from '../../actions/bookmark/bookmark_index_actions';
import {NavigationScreenProp, NavigationState} from 'react-navigation';
import {ImmerState} from 'immer';
import {ReduxState} from '../../reducers';

interface IProps extends IBaseDataPageProps {
  dataList: Array<any>;
  loadDataResult: any;
  noMore: boolean;
}

interface IState {}

@(connect(
  (state: ReduxState) => ({
    dataList: state.bookmarkIndex.bookmarkList,
    loadDataResult: state.bookmarkIndex.getBookmarkListResult,
    noMore: state.bookmarkIndex.bookmarkList_noMore,
  }),
  dispatch => ({
    dispatch,
    loadDataFn: data => dispatch(getBookmarkList(data)),
    clearDataFn: data => dispatch(clearBookmarkList(data)),
  }),
) as any)
export default class bookmark_index extends YZBaseDataPage<IProps, IState> {
  static navigationOptions = ({navigation}) => {
    return {
      title: '收藏',
    };
  };

  pageIndex = 1;

  getParams = () => {
    const params = {
      request: {
        pageIndex: this.pageIndex,
        pageSize: 10,
      },
    };
    return params;
  };

  _renderItem = ({item, index}) => {
    return <BookmarkItem item={item} navigation={this.props.navigation} />;
  };

  render() {
    return (
      <View style={[Styles.container]}>
        <YZStateView
          loadDataResult={this.props.loadDataResult}
          placeholderTitle="暂无数据"
          errorButtonAction={this.loadData}>
          <YZFlatList
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
