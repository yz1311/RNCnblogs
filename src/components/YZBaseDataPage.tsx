import React, {Component, PureComponent} from 'react';
import {
  DeviceEventEmitter,
  Platform,
  View,
  InteractionManager,
} from 'react-native';
import {NavigationScreenProp, NavigationState} from 'react-navigation';

export interface IBaseDataPageProps extends IReduxProps {
  loadDataFn?: any;
  clearDataFn?: any;
  navigation: NavigationScreenProp<NavigationState>;
  route: any,
  loadDataResult?: any;
  dispatch?: any;
}

export interface IProps extends IBaseDataPageProps {
  [key: string]: any;
}

export interface IState {
  [key: string]: any;
}

export default class YZBaseDataPage<
  T extends IBaseDataPageProps,
  M extends IState
> extends PureComponent<T, M> {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      this.loadData();
    });
  }

  componentWillUnmount() {
    const {clearDataFn} = this.props;
    if (clearDataFn) {
      clearDataFn();
    } else {
      console.info('clearDataFn is undefined');
    }
  }

  _onBack = () => {
    if (!NavigationHelper.isTopScreen(this.props.navigation.state.key)) {
      return false;
    }
    this.props.navigation.goBack();
    return true;
  };

  loadData = () => {
    const {loadDataFn} = this.props;
    loadDataFn(this.getParams());
  };

  protected getParams = () => {
    let params = {
      request: {},
    };
    return params;
  };
}
