import React, {Component} from 'react';
import {StyleSheet, View} from 'react-native';
import {connect} from 'react-redux';
import YZBaseDataPage from '../../components/YZBaseDataPage';
import {
  getKnowledgeBaseList,
  clearKnowledgeBaseList,
} from '../../actions/knowledgeBase/knowledgeBase_index_actions';
import BaseKnowledgeBaseList, {
  IBaseKnowledgeProps,
} from './base_knowledgeBase_list';
import {ReduxState} from '../../reducers';

interface IProps extends IBaseKnowledgeProps {}

interface IState {}

@(connect(
  (state: ReduxState) => ({
    dataList: state.knowledgeBaseIndex.kbList,
    loadDataResult: state.knowledgeBaseIndex.getKbListResult,
    noMore: state.knowledgeBaseIndex.kbList_noMore,
  }),
  dispatch => ({
    dispatch,
    loadDataFn: data => dispatch(getKnowledgeBaseList(data)),
    clearDataFn: data => dispatch(clearKnowledgeBaseList(data)),
  }),
) as any)
export default class knowledgeBase_index extends BaseKnowledgeBaseList<
  IProps,
  IState
> {
  getParams = () => {
    const params = {
      request: {
        blogApp: 'yz1311',
        pageIndex: this.pageIndex,
        pageSize: 10,
      },
    };
    return params;
  };
}
