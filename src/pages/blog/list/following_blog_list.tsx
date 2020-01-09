import React, {Component} from 'react';
import {connect} from 'react-redux';
import {
  getFollowingBlogList,
  clearFollowingBlogList,
} from '../../../actions/blog/blog_index_actions';
import BaseBlogList, {
  IBaseBlogProps as IBaseBlogListProps,
} from './base_blog_list';
import {ReduxState} from '../../../reducers';
import {IProduce} from 'immer';
import {getBlogListRequest} from '../../../api/blog';

export interface IProps extends IBaseBlogListProps {
  isLogin?: boolean;
}

@(connect(
  (state: ReduxState) => ({
    dataList: state.blogIndex.followingBlogList,
    loadDataResult: state.blogIndex.getFollowingBlogListResult,
    noMore: state.blogIndex.followingBlogList_noMore,
    userInfo: state.loginIndex.userInfo,
    isLogin: state.loginIndex.isLogin,
  }),
  dispatch => ({
    dispatch,
    loadDataFn: data => dispatch(getFollowingBlogList(data)),
    clearDataFn: data => dispatch(clearFollowingBlogList(data)),
  }),
) as any)
export default class following_blog_list extends BaseBlogList<IProps, any> {
  mustLogin = true;
  componentDidMount() {
    if (this.props.isLogin) {
      super.componentDidMount();
    }
  }
  getParams = () => {
    const params: getBlogListRequest = {
      request: {
        pageIndex: this.pageIndex,
        pageSize: 10,
      },
    };
    return params;
  };
}
