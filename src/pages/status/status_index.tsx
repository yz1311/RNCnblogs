import React, {Component} from 'react';
import {
  DeviceEventEmitter,
  EmitterSubscription, Image,
  StyleSheet,
  TouchableOpacity,
  View,
  Text
} from 'react-native';
import {connect} from 'react-redux';
import {Styles} from '../../common/styles';
import Feather from 'react-native-vector-icons/Feather';
import ScrollableTabView, {
  ScrollableTabBar,
} from '@yz1311/react-native-scrollable-tab-view';
import BaseStatusList from './base_status_list';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ActionButton from 'react-native-action-button';
import {ReduxState} from '../../reducers';
import {NavigationScreenProp, NavigationState} from 'react-navigation';
import {Theme} from "@yz1311/teaset";
import {Api} from "../../api";
import {Colors} from "react-native/Libraries/NewAppScreen";
import StatusRankModal from "./other/status_rank_modal";
import StatusStarModal from "./other/status_star_modal";
import StatusHotModal from "./other/status_hot_modal";
import StatusLuckModal from "./other/status_luck_modal";
import {statusOtherInfoModel} from "../../api/status";

interface IProps extends IReduxProps {
  navigation: any;
  initialPage?: number;
  tabNames?: Array<string>;
  isLogin?: boolean;
  tabIndex: number;
}

interface IState {
  tabNames: Array<string>;
  isActionButtonVisible: boolean;
  isRankModalVisible: boolean;
  isStarModalVisible: boolean;
  isHotModalVisible: boolean;
  isLuckModalVisible: boolean;
  statusOtherInfo: Partial<statusOtherInfoModel>
}

export enum StatusTypes {
  '全站' = 'all',
  '我回应' = 'mycomment',
  '关注' = 'following',
  '我的' = 'my',
  '新回应' = 'recentcomment',
  '提到我' = 'mention',
  '回复我' = 'comment',
  '搜索' = 'search',
  标签 = 'tag'
}

@(connect(
  (state: ReduxState) => ({
    isLogin: state.loginIndex.isLogin,
  }),
) as any)
export default class status_index extends Component<IProps, IState> {

  private toggleActionButtonListener: EmitterSubscription;
  private tabBar: any;

  constructor(props) {
    super(props);
    this.state = {
      tabNames: [
        '全站',
        '我回应',
        '关注',
        '我的',
        '新回应',
        '提到我',
        '回复我',
      ],
      isActionButtonVisible: true,
      isRankModalVisible: false,
      isStarModalVisible: false,
      isHotModalVisible: false,
      isLuckModalVisible: false,
      statusOtherInfo: {}
    };
    this.toggleActionButtonListener = DeviceEventEmitter.addListener(
      'toggleActionButton',
      state => {
        this.setState({
          isActionButtonVisible: state || false,
        });
      },
    );
  }

  componentDidMount() {
    this.loadOtherData();
  }

  loadOtherData = async ()=>{
    try {
      let response = await Api.status.getStatusOtherInfo({});
      this.setState({
        statusOtherInfo: response.data
      });
    } catch (e) {
      console.log(e)
    }
  }

  componentWillUnmount() {
    this.toggleActionButtonListener && this.toggleActionButtonListener.remove();
  }

  _onChangeTab = obj => {
    DeviceEventEmitter.emit('toggleActionButton', true);
    switch (obj.i) {
      case 0:
        break;
      case 1: //eslint-disable-line
        break;
      case 2:
        break;
    }
  };

  render() {
    const {tabNames} = this.state;
    return (
      <View style={[Styles.container]}>
        <View
          style={{
            height: Theme.statusBarHeight,
            backgroundColor: Theme.navColor,
          }}
        />
        <ScrollableTabView
          renderTabBar={() => (
            <ScrollableTabBar
              ref={bar => (this.tabBar = bar)}
              style={{
                backgroundColor: Theme.navColor,
              }}
              activeTextColor={gColors.bgColorF}
              inactiveTextColor={'#DBDBDB'}
              activeTextFontSize={Theme.px2dp(36)}
              inactiveTextFontSize={Theme.px2dp(30)}
              underlineStyle={{
                backgroundColor: gColors.bgColorF,
                height: 3,
                alignSelf: 'center',
                width: 50,
                borderRadius: 1.5
              }}
            />
          )}
          tabBarPosition="top"
          initialPage={this.props.initialPage || 0}
          scrollWithoutAnimation={true}
          locked={false}
          onChangeTab={this._onChangeTab}>
          {/*//@ts-ignore*/}
          <View tabLabel="全站" style={[Styles.container]}>
            <View style={{flexDirection:'row', height: Theme.px2dp(180), backgroundColor:'white', marginBottom: Theme.px2dp(20)}}>
              {
                [
                  {
                    title: '星星排行',
                    icon: require('../../resources/ico/status_rank.png'),
                    width: 70,
                    onPress: ()=>{
                      this.setState({
                        isRankModalVisible: true
                      });
                    }
                  },
                  {
                    title: '最热闪存',
                    icon: require('../../resources/ico/status_hot.png'),
                    width: 70,
                    onPress: ()=>{
                      this.setState({
                        isHotModalVisible: true
                      });
                    }
                  },
                  {
                    title: '闪存明星',
                    icon: require('../../resources/ico/status_star.png'),
                    width: 70,
                    onPress: ()=>{
                      this.setState({
                        isStarModalVisible: true
                      });
                    }
                  },
                  {
                    title: '幸运闪',
                    icon: require('../../resources/ico/status_newest.png'),
                    width: 70,
                    onPress: ()=>{
                      this.setState({
                        isLuckModalVisible: true
                      });
                    }
                  }
                ].map((item,index)=>{
                  return (
                      <TouchableOpacity
                          key={index}
                          onPress={item.onPress}
                          style={[{flex:1, justifyContent:"center", alignItems:'center'}]}
                        >
                        <Image
                            style={{height: Theme.px2dp(item.width), width: Theme.px2dp(item.width)}}
                            source={item.icon}
                            resizeMode="contain"
                        />
                        <Text style={{...Theme.fontSizeAndColor(27, Colors.color333), marginTop: Theme.px2dp(15)}}>{item.title}</Text>
                      </TouchableOpacity>
                  );
                })
              }
            </View>
            <BaseStatusList
              tabLabel="全站"
              navigation={this.props.navigation}
              statusType={StatusTypes.全站}
            />
          </View>
          <BaseStatusList
              tabLabel="新回应"
              navigation={this.props.navigation}
              statusType={StatusTypes.新回应}
          />
          <BaseStatusList
              tabLabel="关注"
              navigation={this.props.navigation}
              statusType={StatusTypes.关注}
          />
          <BaseStatusList
              tabLabel="我的"
              navigation={this.props.navigation}
              statusType={StatusTypes.我的}
          />
          <BaseStatusList
              tabLabel="我回应"
              navigation={this.props.navigation}
              statusType={StatusTypes.我回应}
          />
          <BaseStatusList
              tabLabel="提到我"
              navigation={this.props.navigation}
              statusType={StatusTypes.提到我}
          />
          <BaseStatusList
              tabLabel="回复我"
              navigation={this.props.navigation}
              statusType={StatusTypes.回复我}
          />
        </ScrollableTabView>
        {this.state.isActionButtonVisible ? (
          <ActionButton
            fixNativeFeedbackRadius
            buttonColor="rgba(231,76,60,1)"
            onPress={() => {
              if (!this.props.isLogin) {
                NavigationHelper.navigate('Login');
              } else {
                this.props.navigation.navigate('StatusAdd');
              }
            }}
          />
        ) : null}
        <StatusRankModal
          isVisible={this.state.isRankModalVisible}
          statusOtherInfo={this.state.statusOtherInfo}
          onVisibleChange={val => {
            this.setState({
              isRankModalVisible: val
            });
          }}
          />
        <StatusStarModal
          isVisible={this.state.isStarModalVisible}
          statusOtherInfo={this.state.statusOtherInfo}
          onVisibleChange={val => {
            this.setState({
              isStarModalVisible: val
            });
          }}
          />
        <StatusHotModal
          isVisible={this.state.isHotModalVisible}
          statusOtherInfo={this.state.statusOtherInfo}
          onVisibleChange={val => {
            this.setState({
              isHotModalVisible: val
            });
          }}
          />
        <StatusLuckModal
          isVisible={this.state.isLuckModalVisible}
          statusOtherInfo={this.state.statusOtherInfo}
          onVisibleChange={val => {
            this.setState({
              isLuckModalVisible: val
            });
          }}
          />
      </View>
    );
  }
}

const styles = StyleSheet.create({});
