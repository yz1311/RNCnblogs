import React, {Component} from 'react';
import {connect} from 'react-redux';
import {
  getPickedBlogList,
  clearPickedBlogList,
} from '../../../actions/blog/blog_index_actions';
import {
  searchData,
  clearSearchData,
} from '../../../actions/home/home_index_actions';
import BaseBlogList, {IBaseBlogProps} from '../../blog/base_blog_list';
import {DeviceEventEmitter, EmitterSubscription} from 'react-native';
import {ReduxState} from '../../../reducers';

interface IProps extends IBaseBlogProps {
  type: string;
  keyWords: string;
}

interface IState {}

@(connect(
  (state: ReduxState) => ({
    dataList: state.homeIndex.blog.list,
    loadDataResult: state.homeIndex.blog.loadDataResult,
    noMore: state.homeIndex.blog.noMore,
    userInfo: state.loginIndex.userInfo,
  }),
  dispatch => ({
    dispatch,
    loadDataFn: data => dispatch(searchData(data)),
    clearDataFn: data => dispatch(clearSearchData(data)),
  }),
) as any)
export default class search_blog_list extends BaseBlogList<IProps, IState> {
  private reloadListener: EmitterSubscription;

  componentDidMount() {
    //刚进入为空则禁止加载就刷新
    if (this.props.keyWords != undefined && this.props.keyWords !== '') {
      super.componentDidMount();
    }
    this.reloadListener = DeviceEventEmitter.addListener(
      'search_blog_list_reload',
      () => {
        console.log('search_blog_list_reload');
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
        category: 'blog',
        keyWords: this.props.keyWords,
        pageIndex: this.pageIndex,
        pageSize: 15,
      },
      type: this.props.type,
    };
    return params;
  };
}
