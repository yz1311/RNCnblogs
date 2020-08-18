import React, {Component, PureComponent} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Text,
  Alert,
  DeviceEventEmitter, InteractionManager,
} from 'react-native';
import {connect} from 'react-redux';
import {Styles} from '../../common/styles';
import {ListRow, Overlay} from '@yz1311/teaset';
import ServiceUtils from '../../utils/serviceUtils';
import HTMLView from 'react-native-render-html';
import {BorderShadow} from '@yz1311/react-native-shadow';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {showToast} from '../../actions/app_actions';
import {ReduxState} from '../../reducers';
import {NavigationScreenProp, NavigationState} from 'react-navigation';
import {statusModel} from "../../api/status";
import ToastUtils from '../../utils/toastUtils';
import {Api} from '../../api';
import Feather from "react-native-vector-icons/Feather";

interface IProps extends IReduxProps {
  item: statusModel;
  clickable: boolean;
  userInfo?: any;
  userId?: string;
  canDelete?: boolean;
  canModify?: boolean;
  //是否点击头像查看详情
  canViewProfile: boolean;
  navigation: any;
}

interface IState {}

@(connect(
  (state: ReduxState) => ({
    userInfo: state.loginIndex.userInfo,
  })) as any)
export default class status_item extends PureComponent<IProps, IState> {
  static defaultProps = {
    clickable: true,
    canViewProfile: true
  };

  private overlayKey: any;
  private fromView: any;

  _onModify = () => {
    Overlay.hide(this.overlayKey);
    const {item} = this.props;
    //必须要加这个，上面的隐藏操作会影响跳转
    InteractionManager.runAfterInteractions(()=>{
      NavigationHelper.push('StatusAdd', {
        title: '修改闪存',
        item: item
      });
    });
  };

  _onDelete = () => {
    Overlay.hide(this.overlayKey);
    Alert.alert(
      '',
      '是否删除该闪存?',
      [
        {
          text: '取消',
        },
        {
          text: '删除',
          onPress: async () => {
            const {item} = this.props;
            ToastUtils.showLoading();
            try {
              let response = await Api.status.deleteStatus({
                request: {
                  ingId: parseInt(item.id)
                }
              });
              //如果是在详情，则返回到列表界面
              if (
                NavigationHelper.navRouters[
                NavigationHelper.navRouters.length - 1
                  ].routeName === 'StatusDetail'
              ) {
                NavigationHelper.goBack();
              }
              //刷新所有列表
              DeviceEventEmitter.emit('status_list_refresh',-1);
            } catch (e) {

            } finally {
              ToastUtils.hideLoading();
            }
          },
        },
      ],
      {cancelable: false},
    );
  };

  showMenu = () => {
    const {userInfo, userId, canDelete} = this.props;
    let canModify = this.props.canModify;
    this.fromView.measureInWindow((x, y, width, height) => {
      let popoverStyle = {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        paddingTop: 8,
        paddingBottom: 8,
        // paddingLeft: 12,
        paddingRight: 12,
      };
      y += __IOS__ ? 0 : 15;
      let fromBounds = {x, y, width, height};
      let overlayView = (
        <Overlay.PopoverView
          popoverStyle={popoverStyle}
          fromBounds={fromBounds}
          direction="left"
          align="start"
          directionInsets={4}
          onCloseRequest={() => {
            Overlay.hide(this.overlayKey);
            this.overlayKey = null;
          }}
          showArrow={true}>
          {/*官方闪存不支持修改*/}
          {/*<ListRow*/}
          {/*  style={{backgroundColor: 'transparent', width: 100}}*/}
          {/*  titleStyle={{color: gColors.bgColorF, textAlign: 'center'}}*/}
          {/*  title="修改"*/}
          {/*  onPress={this._onModify}*/}
          {/*/>*/}
          <ListRow
            style={{backgroundColor: 'transparent', width: 100}}
            titleStyle={{color: gColors.colorRed, textAlign: 'center'}}
            bottomSeparator={null}
            title="删除"
            onPress={this._onDelete}
          />
        </Overlay.PopoverView>
      );
      this.overlayKey = Overlay.show(overlayView);
    });
  };

  render() {
    const {item, clickable, userInfo} = this.props;
    return (
      <BorderShadow
        setting={{width: gScreen.width, border: 3, color: gColors.color999}}>
        <TouchableOpacity
          activeOpacity={clickable ? activeOpacity : 1}
          onPress={() => {
            if (this.props.clickable) {
              this.props.navigation.navigate('StatusDetail', {
                item: item,
              });
            }
          }}>
          <View
            style={{
              backgroundColor: gColors.bgColorF,
              paddingVertical: 10,
              paddingHorizontal: 8,
            }}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              {/*{item.IsPrivate ? (*/}
              {/*  <Text style={{color: gColors.colorRed, fontSize: gFont.size12}}>*/}
              {/*    [私有]*/}
              {/*  </Text>*/}
              {/*) : null}*/}
              <TouchableOpacity
                activeOpacity={activeOpacity}
                onPress={() => {
                  if(this.props.canViewProfile) {
                    ServiceUtils.viewProfileDetail(
                      this.props.dispatch,
                      item.author?.id,
                      item.author?.avatar,
                    );
                  }
                }}
                style={{
                  flexDirection: 'row',
                  alignSelf: 'stretch',
                  alignItems: 'center',
                }}>
                <Image
                  style={[Styles.avator]}
                  resizeMode="contain"
                  source={{uri: item.author?.avatar}}
                />
                <Text style={[Styles.userName]}>{item.author?.name}</Text>
              </TouchableOpacity>
              <Text
                style={{
                  color: gColors.color666,
                  fontSize: gFont.size12,
                  marginLeft: 10,
                }}>
                {item.published}
              </Text>
              {item.isPrivate ?
                <Image style={{width: 18, height: 18,marginLeft:7}} resizeMode={'contain'}
                       source={{uri: 'https://common.cnblogs.com/images/ico_ing_self.gif'}}/>
                :
                null
              }
            </View>
            <HTMLView
              containerStyle={{marginVertical: 7}}
              html={item.summary}
              //@ts-ignore
              stylesheet={styles}
            />
            {item.commentCount > 0 ? (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  marginTop: 5,
                }}>
                <Text style={{color: gColors.color666, fontSize: gFont.size12}}>
                  {item.commentCount + ' 评论'}
                </Text>
              </View>
            ) : null}
          </View>
          {item.author?.id === userInfo.id ? (
            <TouchableOpacity
              ref={ref => (this.fromView = ref)}
              activeOpacity={activeOpacity}
              style={{
                position: 'absolute',
                right: 0,
                top: 0,
                paddingVertical: 10,
                paddingHorizontal: 12,
              }}
              onPress={this.showMenu}>
              <Feather name="more-horizontal" size={25} color={gColors.color0} />
            </TouchableOpacity>
          ) : null}
        </TouchableOpacity>
      </BorderShadow>
    );
  }
}

const styles = StyleSheet.create({
  avator: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
});
