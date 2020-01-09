/**
 * 基本用法：
 * 1.创建一个新的文件xxx.js，继承该类
 * 2.使用static defaultProps={}来设置一些默认的属性，或者在使用xxx.js的时候，传递属性值也行
 * 3.重写renderTab来实现主要的布局样式
 * ps：可以参考继承该类的几个文件
 */
import React, {Component} from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Animated,
  ViewPropTypes,
} from 'react-native';
import PropTypes from 'prop-types';

export interface ITabItemProps {
  goToPage?: any; // 跳转到哪一个tab，直接传递索引号即可
  activeTab?: number; // 当前激活的tab的索引号，从0开始
  tabs?: Array<any>; // tabs就是传递过来的tabLabel组成的数组，如果需要自己传值，需要自定义数组
  tabDatas: Array<any>; //传递过来自定义数据，用户在renderItem中显示
  tabIconNames?: Array<string>; // ±£´æTabÍ¼±ê
  textStyle?: any;
  renderTab?: any; //暂未使用，直接重写renderTab方法即可
  activeTextColor: string; //激活的文字的颜色
  inactiveTextColor: string; //未激活的文字颜色
  containerStyle?: any; //整个tab切换栏容器（包含多个tabItem）的样式
  containerWidth?: number; //整个容器的（包括多有的item）的宽度，默认是屏幕的宽度，每个Item的宽度默认根据这个宽度来等分
  underlineStyle: any; //底部指示器的样式
  scrollValue?: any;
}

export interface IState {}

export default class YZScrollableTabItem<
  P extends ITabItemProps,
  S
> extends Component<P, S> {
  static propTypes = {
    goToPage: PropTypes.func, // 跳转到哪一个tab，直接传递索引号即可
    activeTab: PropTypes.number, // 当前激活的tab的索引号，从0开始
    tabs: PropTypes.array, // tabs就是传递过来的tabLabel组成的数组，如果需要自己传值，需要自定义数组
    tabDatas: PropTypes.array, //传递过来自定义数据，用户在renderItem中显示
    tabIconNames: PropTypes.array, // ±£´æTabÍ¼±ê
    //@ts-ignore
    textStyle: Text.propTypes.style,
    renderTab: PropTypes.func, //暂未使用，直接重写renderTab方法即可
    activeTextColor: PropTypes.string, //激活的文字的颜色
    inactiveTextColor: PropTypes.string, //未激活的文字颜色
    containerStyle: ViewPropTypes.style, //整个tab切换栏容器（包含多个tabItem）的样式
    containerWidth: PropTypes.number, //整个容器的（包括多有的item）的宽度，默认是屏幕的宽度，每个Item的宽度默认根据这个宽度来等分
    underlineStyle: ViewPropTypes.style, //底部指示器的样式
  };

  static defaultProps = {
    activeTextColor: 'navy',
    inactiveTextColor: 'black',
  };

  render() {
    let containerWidth = this.props.containerWidth;
    if (!containerWidth) {
      containerWidth = gScreen.width;
    }
    const numberOfTabs = this.props.tabs.length;
    const tabUnderlineStyle = {
      position: 'absolute',
      width: containerWidth / numberOfTabs,
      height: 4,
      backgroundColor: 'white',
      bottom: 0,
    };
    const left = {
      transform: [
        {
          translateX: this.props.scrollValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, containerWidth / numberOfTabs],
          }),
        },
      ],
    };

    return (
      <View
        style={[
          {flexDirection: 'row', backgroundColor: gColors.themeColor},
          this.props.containerStyle,
        ]}>
        {this.props.tabs.map((tab, index) => {
          const isTabActive = this.props.activeTab === index;
          const renderTab = this.props.renderTab || this.renderTab;
          return this.renderTab(
            this.props.tabDatas[index],
            index,
            isTabActive,
            this.props.goToPage,
          );
        })}
        <Animated.View
          style={[tabUnderlineStyle, left, this.props.underlineStyle]}
        />
      </View>
    );
  }

  renderTab(data, index, isTabActive, onPressHandler) {
    const {
      activeTextColor,
      inactiveTextColor,
      textStyle,
      tabDatas,
    } = this.props;
    const textColor = isTabActive ? activeTextColor : inactiveTextColor;
    const fontWeight = isTabActive ? 'bold' : 'normal';
    return (
      <TouchableOpacity
        key={index}
        activeOpacity={activeOpacity}
        onPress={() => this.props.goToPage(index)}
        style={{flex: 1}}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 20,
          }}>
          <Text
            style={[
              {color: textColor, fontSize: gFont.size16},
              this.props.textStyle,
            ]}>
            {tabDatas[index].Name}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
