import React, {Component} from 'react';
import {connect} from 'react-redux';
import {
  getHomeBlogList,
  clearHomeBlogList,
} from '../../../actions/blog/blog_index_actions';
import BaseBlogList, {
  IBaseBlogProps as IBaseBlogListProps,
} from './base_blog_list';
import {ReduxState} from '../../../reducers';
import {getBlogListRequest} from '../../../api/blog';

export interface IProps extends IBaseBlogListProps {
  isLogin?: boolean;
}

@(connect(
  (state: ReduxState) => ({

  }),
  dispatch => ({
    dispatch,
    loadDataFn: data => dispatch(getHomeBlogList(data)),
    clearDataFn: data => dispatch(clearHomeBlogList(data)),
  }),
) as any)
export default class home_blog_list extends BaseBlogList<IProps, any> {
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
