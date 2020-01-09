import React, {Component} from 'react';
import {connect} from 'react-redux';
import {
  searchData,
  clearSearchData,
} from '../../../actions/home/home_index_actions';
import BaseNewsList, {IBaseNewsProps} from '../../news/base_news_list';
import {DeviceEventEmitter, EmitterSubscription} from 'react-native';
import {ReduxState} from '../../../reducers';

interface IProps extends IBaseNewsProps {
  type: string;
  keyWords: string;
}

interface IState {}

@(connect(
  (state: ReduxState) => ({
    dataList: state.homeIndex.news.list,
    loadDataResult: state.homeIndex.news.loadDataResult,
    noMore: state.homeIndex.news.noMore,
  }),
  dispatch => ({
    dispatch,
    loadDataFn: data => dispatch(searchData(data)),
    clearDataFn: data => dispatch(clearSearchData(data)),
  }),
) as any)
export default class search_news_list extends BaseNewsList<IProps, IState> {
  private reloadListener: EmitterSubscription;

  componentDidMount() {
    //刚进入为空则禁止加载就刷新
    if (this.props.keyWords != undefined && this.props.keyWords !== '') {
      super.componentDidMount();
    }
    this.reloadListener = DeviceEventEmitter.addListener(
      'search_news_list_reload',
      () => {
        console.log('search_news_list_reload');
        this.pageIndex = 1;
        this.loadData();
      },
    );
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    this.reloadListener.remove();
  }

  getParams = () => {
    const params = {
      request: {
        category: 'news',
        keyWords: this.props.keyWords,
        pageIndex: this.pageIndex,
        pageSize: 15,
      },
      type: this.props.type,
    };
    return params;
  };
}
