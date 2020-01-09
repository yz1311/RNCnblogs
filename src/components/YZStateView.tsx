import React, {Component} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  AppState,
  ActivityIndicator,
} from 'react-native';
import PropTypes from 'prop-types';

export interface IProps {
  state: string;
  containerStyle?: any;
  bodyStyle?: any;
  /*loading相关的*/
  loadingView?: any;
  loadingTitle?: string;
  loadingTitleStyle?: any;
  /*Placeholder相关的*/
  placeholderView?: any; //整个替换placeholder
  placeholderImageRes?: number; //替换图片原，格式为require('...')
  placeholderTitle?: string; //替换标题
  placeholderImageStyle?: any; //图片样式
  placeholderTitleStyle?: any; //标题样式
  /*error相关的*/
  error?: any; //服务器返回的状态码
  errorView?: any; //整个替换placeholder
  errorImageRes?: number; //替换图片原，格式为require('...')
  errorTitle?: string; //替换标题
  errorImageStyle?: any; //图片样式
  errorTitleStyle?: any; //标题样式
  errorButtonStyle?: any; //标题样式
  errorButtonTextStyle?: any; //标题样式
  errorButtonAction?: any; //标题样式,
  isConnected?: boolean;
}

export interface IState {
  //为了实现，点击刷新按钮自动刷新，将state从props移动到state
  state: string;
}

const STATE_NONE = 'none';
const STATE_LOADING = 'loading';
const STATE_EMPTY = 'empty';
const STATE_CONTENT = 'content';
const STATE_ERROR = 'error';
const STATE_UNLOGGED = 'unlogged';

export default class YZStateView<T extends IProps> extends Component<
    T,
    IState
    > {
  static states = {
    none: STATE_NONE,
    loading: STATE_LOADING, //正在加载数据，由于全局loading的存在，现在应为透明
    empty: STATE_EMPTY, //表明调用成功，但是数据为空
    content: STATE_CONTENT, //表示调用成功，并且有数据
    error: STATE_ERROR, //表明调用失败，此时显示错误信息
    //Todo
    unlogged: STATE_UNLOGGED, //表明当前用户未登录或者token过期
  };

  static propTypes = {
    state: PropTypes.string.isRequired,
    containerStyle: PropTypes.object,
    bodyStyle: PropTypes.object,
    /*loading相关的*/
    loadingView: PropTypes.element,
    loadingTitle: PropTypes.string,
    loadingTitleStyle: PropTypes.object,
    /*Placeholder相关的*/
    placeholderView: PropTypes.element, //整个替换placeholder
    placeholderImageRes: PropTypes.number, //替换图片原，格式为require('...')
    placeholderTitle: PropTypes.string.isRequired, //替换标题
    placeholderImageStyle: PropTypes.object, //图片样式
    placeholderTitleStyle: PropTypes.object, //标题样式
    /*error相关的*/
    error: PropTypes.object, //服务器返回的状态码
    errorView: PropTypes.element, //整个替换placeholder
    errorImageRes: PropTypes.number, //替换图片原，格式为require('...')
    errorTitle: PropTypes.string, //替换标题
    errorImageStyle: PropTypes.object, //图片样式
    errorTitleStyle: PropTypes.object, //标题样式
    errorButtonStyle: PropTypes.object, //标题样式
    errorButtonTextStyle: PropTypes.object, //标题样式
    errorButtonAction: PropTypes.func, //标题样式
  };

  static defaultProps = {
    state: STATE_LOADING,
    loadingTitle: '正在加载中…',
    isConnected: true,
  };

  constructor(props) {
    super(props);
    this.state = {
      state: props.state,
    };
  }

  componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange);
  }

  UNSAFE_componentWillReceiveProps(nextProps, nextState) {
    if (this.props.isConnected !== nextProps.isConnected) {
      //如果从无网变为有网，并且当前是网络错误的状态，则刷新界面
      if (nextProps.isConnected && nextProps.error && !nextProps.error.status) {
        this.props.errorButtonAction && this.props.errorButtonAction();
      }
    }
    if (
        this.props.state !== nextProps.state ||
        this.state.state !== nextProps.state ||
        nextProps.loadDataResult.forceUpdate
    ) {
      this.setState({
        state: nextProps.state,
      });
    }
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  _handleAppStateChange = appState => {
    // 从后台进入到前台的时候,如果是调用超时的错误，重新调取一次接口
    if (appState === 'active') {
      if (
          this.props.state === 'error' &&
          this.props.error &&
          !this.props.error.status
      ) {
        this.props.errorButtonAction && this.props.errorButtonAction();
      }
    }
  };

  render() {
    const {
      containerStyle,
      bodyStyle,
      loadingView,
      loadingTitle,
      loadingTitleStyle,
      placeholderImageRes,
      placeholderTitle,
      placeholderImageStyle,
      placeholderView,
      placeholderTitleStyle,
      errorTitle,
      error,
      errorImageStyle,
      errorTitleStyle,
      errorButtonStyle,
      errorButtonTextStyle,
      errorButtonAction,
    } = this.props;
    //从外部调用静态属性可以，但是组件内部调用的话为undefined,不知道为啥
    //所以用常量代替
    switch (this.state.state) {
      case STATE_NONE:
        return null;
        //由于有全局loading的存在，现在不显示
      case STATE_LOADING:
        return (
            <View style={[styles.container, containerStyle]}>
              <View
                  style={[styles.loading, loadingTitleStyle && loadingTitleStyle]}>
                {loadingView ? (
                    loadingView
                ) : (
                    <View style={{alignItems: 'center'}}>
                      <ActivityIndicator size={'large'} color={'#333'} />
                      <Text style={styles.title}>
                        {loadingTitle || '正在加载中…'}
                      </Text>
                    </View>
                )}
              </View>
            </View>
        );
        //有数据，则什么都不显示
      case STATE_CONTENT:
        return this.props.children;
        //显示placeholder
      case STATE_EMPTY:
        //为了将界面撑起来，并且为后面的下拉刷新作准备
        //不能使用数组，必须使用view将两个对象套起来
        //TouchableOpacity外层还包裹一层view是为了不让点击的时候，看到底部的内容
        return (
            <View style={[styles.container, containerStyle]}>
              {this.props.children}
              <TouchableOpacity
                  activeOpacity={1}
                  onPress={args => {
                    if (errorButtonAction) {
                      this.setState({
                        state: 'loading',
                      });
                      errorButtonAction(args);
                    }
                  }}
                  style={[
                    styles.container,
                    {
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      top: 0,
                      bottom: 0,
                      backgroundColor: gColors.backgroundColor,
                    },
                    containerStyle,
                  ]}>
                {placeholderView ? (
                    placeholderView
                ) : (
                    <View style={[styles.body, bodyStyle]}>
                      <Image
                          source={
                            placeholderImageRes
                                ? placeholderImageRes
                                : require('../resources/img/app_nocontent.png')
                          }
                          style={[
                            {width: gScreen.width * 0.6, maxHeight: 150},
                            placeholderImageStyle,
                          ]}
                          resizeMode="contain"
                      />
                      <Text
                          style={[
                            {
                              color: gColors.color666,
                              marginTop: 15,
                              fontSize: gFont.size16,
                            },
                            placeholderTitleStyle,
                          ]}>
                        {placeholderTitle ? placeholderTitle : '暂时没有数据'}
                      </Text>
                    </View>
                )}
              </TouchableOpacity>
            </View>
        );
        //显示placeholder
      case STATE_ERROR:
        let tempErrorTitle = '服务器开小差了，请等等再试吧...';
        let detailTitle = tempErrorTitle;
        if (error) {
          tempErrorTitle = error.message;
        } else if (errorTitle) {
          tempErrorTitle = errorTitle;
        }
        let imageRes;
        if (!error.status) {
          imageRes = require('../resources/img/app_error_network.png');
          //分为无网络和服务器挂了
          if (!this.props.isConnected) {
            detailTitle = '网络连接失败，请检查网络';
          }
        }
        //此时是逻辑错误
        else if (error.state >= 200 && error.state < 300) {
          detailTitle = '';
        }
        //此时是服务器错误 status = 300+
        else {
          imageRes = require('../resources/img/app_error_server.png');
          //不同时显示默认值
          if (detailTitle == tempErrorTitle) {
            detailTitle = '';
          }
        }
        return (
            //为了将界面撑起来，并且为后面的下拉刷新作准备
            <TouchableOpacity
                activeOpacity={1}
                onPress={args => {
                  if (errorButtonAction) {
                    this.setState({
                      state: 'loading',
                    });
                    errorButtonAction(args);
                  }
                }}
                style={[styles.container, containerStyle]}>
              <View style={[styles.body, bodyStyle]}>
                <Image
                    style={{width: gScreen.width * 0.6, maxHeight: 150}}
                    resizeMode="contain"
                    source={imageRes}
                />
                <View
                    style={{
                      paddingHorizontal: gScreen.width * 0.1,
                      alignItems: 'center',
                    }}>
                  <Text
                      style={[
                        {
                          color: gColors.color333,
                          marginTop: 20,
                          fontSize: gFont.size16,
                        },
                        placeholderTitleStyle,
                      ]}>
                    {tempErrorTitle}
                  </Text>
                  <Text
                      style={[
                        {
                          color: gColors.color999,
                          marginTop: 18,
                          fontSize: gFont.size16,
                        },
                        placeholderTitleStyle,
                      ]}>
                    {detailTitle}
                  </Text>
                </View>
                <View style={[styles.errorButton, errorButtonStyle]}>
                  <View>
                    <Text
                        style={[
                          {color: gColors.color999, fontSize: gFont.size16},
                          errorButtonTextStyle,
                        ]}>
                      点击刷新
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
        );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    // position:'absolute',
    // top:0,
    // bottom:0,
    // left:0,
    // right:0,
    flex: 1,
    // alignItems:'center',
    justifyContent: 'center',
    minHeight: 180,
    // paddingTop:60
  },
  body: {
    marginTop: -40,
    alignItems: 'center',
    justifyContent: 'center',
    // marginTop:-50
  },
  errorButton: {
    paddingVertical: 14,
    alignSelf: 'stretch',
    alignItems: 'center',
    marginHorizontal: 20,
    borderRadius: 6,
    marginTop: 10,
  },
  loading: {
    // minHeight: 100,
    // minWidth: 100,
    // backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 18,
  },
  title: {
    color: gColors.color333,
    fontSize: 14,
    marginTop: 10,
  },
});
