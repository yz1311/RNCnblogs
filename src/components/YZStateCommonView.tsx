/**
 * 在AMStateCoomonView的基础上面，根据目前的框架传递一些属性，与框架强绑定
 */

import React, {Component, FC} from 'react';
import {View, Text, Image, StyleSheet, TouchableOpacity} from 'react-native';
import YZStateView, {IProps as IYZStateViewProps} from './YZStateView';

export interface IProps extends IYZStateViewProps {
  mustLogin?: boolean;
  isLogin?: boolean;
  loadDataResult: any;
}

const YZStateCommonView: FC<IProps> = props => {
  const {
    loadDataResult,
    placeholderTitle,
    placeholderImageRes,
    errorButtonAction,
  } = props;
  return (
      <YZStateView
          {...props}
          placeholderTitle={placeholderTitle}
          placeholderImageRes={placeholderImageRes}
          errorButtonAction={errorButtonAction}
          // loadingView={getResult.showLoading?null:<View />}
      />
  );
};

YZStateCommonView.defaultProps = {
  loadingView: null,
  mustLogin: false,
  placeholderTitle: '暂无数据',
};
4;

export default YZStateCommonView;
