/**
 * Created by zhaoyang on 17/5/24.
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
} from 'react-native';
import PropTypes from 'prop-types';
import YZTabItem, {ITabItemProps} from '../../components/YZScrollableTabItem';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Theme} from "@yz1311/teaset";

interface IProps extends ITabItemProps {
  showSearchButton: boolean;
  tabWidth: number;
}

export default class home_indexTab extends YZTabItem<IProps, any> {
  static propTypes = {
    ...YZTabItem.propTypes,
    tabWidth: PropTypes.number,
    //是否在右侧显示搜索按钮，针对首页
    showSearchButton: PropTypes.bool,
  };

  static defaultProps = {
    containerWidth: gScreen.width,
    activeTextColor: gColors.bgColorF,
    inactiveTextColor: '#DBDBDB',
    underlineStyle: {backgroundColor: gColors.bgColorF, height: 3},
    tabWidth: 0,
    showSearchButton: false,
  };

  render() {
    const {showSearchButton} = this.props;
    const searchButtonWidth = 50;
    let containerWidth = this.props.containerWidth;
    if (!containerWidth) {
      containerWidth = gScreen.width;
    }
    if (showSearchButton) {
      containerWidth = containerWidth - searchButtonWidth;
    }
    const numberOfTabs = this.props.tabs.length;
    let tabWidth = containerWidth / numberOfTabs;
    if (this.props.tabWidth > 0) {
      tabWidth = this.props.tabWidth;
    }
    let tabUnderlineStyle = {
      position: 'absolute',
      // width: containerWidth / numberOfTabs,
      width: tabWidth,
      height: 4,
      backgroundColor: 'transparent',
      bottom: 0,
    };

    const left = {
      transform: [
        {
          translateX: this.props.scrollValue.interpolate({
            // inputRange: [0, 1,], outputRange: [0, containerWidth / numberOfTabs,],
            inputRange: [0, 1],
            outputRange: [0, tabWidth],
          }),
        },
      ],
    };

    return (
      <View
        style={[
          {
            flexDirection: 'row',
            backgroundColor: gColors.bgColorF,
            borderBottomWidth: gScreen.onePix,
            borderBottomColor: gColors.color999,
          },
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
        {showSearchButton ? <View style={{flex: 1}} /> : null}
        {showSearchButton ? (
          <TouchableOpacity
            activeOpacity={activeOpacity}
            style={{
              width: searchButtonWidth,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={() => {
              NavigationHelper.navigate('HomeSearch');
            }}>
            <Ionicons name="ios-search" size={26} color={gColors.bgColorF} />
          </TouchableOpacity>
        ) : null}
        {this.props.tabDatas.length > 1 ? (
          <Animated.View
            style={[tabUnderlineStyle, left, this.props.underlineStyle, {backgroundColor: 'transparent',}]}
          >
            <View style={{flex:1, alignSelf:'center', borderRadius: 4, width: tabWidth/2, backgroundColor: 'white'}} />
          </Animated.View>
        ) : null}
      </View>
    );
  }

  renderTab = (data, index, isTabActive, onPressHandler) => {
    const {
      activeTextColor,
      inactiveTextColor,
      textStyle,
      tabDatas,
    } = this.props;
    const textColor = isTabActive ? activeTextColor : inactiveTextColor;
    const fontSize = isTabActive ? Theme.px2dp(35) : Theme.px2dp(30);
    const fontWeight = isTabActive ? 'bold' : 'normal';
    let tabContentStyle = {};
    if (this.props.tabDatas.length > 1) {
      if (this.props.tabWidth > 0) {
        tabContentStyle = {
          // flex:1
          width: this.props.tabWidth,
        };
      } else {
        tabContentStyle = {
          flex: 1,
        };
      }
    } else {
      tabContentStyle = {
        paddingLeft: 10,
      };
    }
    return (
      <TouchableOpacity
        key={index}
        activeOpacity={activeOpacity}
        onPress={() => this.props.goToPage(index)}
        style={[tabContentStyle]}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'flex-end',
            paddingTop: 10,
          }}>
          <Text
            style={[
              {color: textColor, fontSize: fontSize, fontWeight: fontWeight, textAlignVertical:'bottom',marginBottom: 8},
              this.props.textStyle,
            ]}>
            {tabDatas[index]}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };
}
