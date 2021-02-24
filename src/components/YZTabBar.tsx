import React from 'react';
import {
  StyleSheet,
  Image,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import Entypo from 'react-native-vector-icons/Entypo';
import {Theme, Badge} from '@yz1311/teaset';
import {BorderlessButton} from "react-native-gesture-handler";
import {ReduxState} from "../models";

export interface IProps {
  goToPage?: any; // 跳转到对应tab的方法
  activeTab?: number; // 当前被选中的tab下标
  tabs?: Array<any>; // 所有tabs集合

  tabNames: Array<string>; // 所有tabs名称
  tabIconNames: Array<string>; // 所有tabs图片
  scrollValue?: any;
  selectedTabIconNames: Array<string>;
  onClick?: any;
  statusMetionCount?: number;
  statusReplyCount?: number;
}

@(connect((state:ReduxState) => ({
  statusMetionCount: state.profileIndex.statusMetionCount,
  statusReplyCount: state.profileIndex.statusReplyCount,
})) as any)
export default class YZTabBar extends React.Component<IProps, {}> {
  static propTypes = {
    goToPage: PropTypes.func, // 跳转到对应tab的方法
    activeTab: PropTypes.number, // 当前被选中的tab下标
    tabs: PropTypes.array, // 所有tabs集合

    tabNames: PropTypes.array, // 所有tabs名称
    tabIconNames: PropTypes.array, // 所有tabs图片,
  };

  setAnimationValue({value}) {
    // console.log(value)
  }

  goToPage = index => {
    this.props.goToPage(index);
  };

  componentDidMount() {
    // Animated.Value监听范围 [0, tab数量-1]
    this.props.scrollValue.addListener(this.setAnimationValue);
  }

  render() {
    console.log(this.props.statusMetionCount)
    console.log(this.props.statusReplyCount)
    console.log('0000')
    return (
      <View style={styles.tabs}>
        {this.props.tabs.map((tap, i) => {
          let color = this.props.activeTab == i ? Theme.primaryColor : 'gray';
          let icon =
            this.props.activeTab == i
              ? this.props.selectedTabIconNames[i]
              : this.props.tabIconNames[i];
          return (
            <BorderlessButton
              key={i}
              activeOpacity={0.85}
              style={styles.tab}
              onPress={() => {
                this.props.goToPage(i);
                this.props.onClick && this.props.onClick(i);
              }}>
              <View style={styles.tabItem}>
                {/*<Image*/}
                {/*style={styles.icon}*/}
                {/*resizeMode="contain"*/}
                {/*source={icon}*/}
                {/*/>*/}
                <Entypo
                  style={styles.icon}
                  name={icon}
                  color={color}
                  size={20}
                />
                <Text style={{color: color, fontSize: 12}}>
                  {this.props.tabNames[i]}
                </Text>
                {i==2 && this.props.statusMetionCount+this.props.statusReplyCount>0?
                <Badge
                    style={{position:'absolute', top: -6, right: -6}}
                    count={this.props.statusMetionCount+this.props.statusReplyCount}
                />:null}
                {/*{i===1?*/}
                {/*<View style={{position:'absolute',right:0,width:10,height:10,borderRadius:5,backgroundColor:gColors.colorRed}}/>:null}*/}
              </View>
            </BorderlessButton>
          );
        })}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    height: Platform.OS === 'ios' ? 49 : 50,
    borderTopColor: 'rgb(242, 242, 242)',
    borderTopWidth: 1,
    backgroundColor: '#fff',
  },

  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  tabItem: {
    flexDirection: 'column',
    alignItems: 'center',
  },

  icon: {
    width: Platform.OS === 'ios' ? 20 : 22,
    height: Platform.OS === 'ios' ? 20 : 22,
    marginBottom: Platform.OS === 'ios' ? 5 : 3,
  },
});
