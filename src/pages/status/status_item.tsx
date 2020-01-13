import React, {Component, PureComponent} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Text,
  Alert,
  DeviceEventEmitter,
} from 'react-native';
import {connect} from 'react-redux';
import YZStateView from '../../components/YZStateCommonView';
import YZFlatList from '../../components/YZFlatList';
import Styles from '../../common/styles';
import Feather from 'react-native-vector-icons/Feather';
import {ListRow, Overlay} from '@yz1311/teaset';
import PropTypes from 'prop-types';
import StringUtils from '../../utils/stringUtils';
import ServiceUtils from '../../utils/serviceUtils';
import HTMLView from 'react-native-render-html';
import {BorderShadow} from '@yz1311/react-native-shadow';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {showToast} from '../../actions/app_actions';
import {deleteStatus} from '../../actions/status/status_index_actions';
import {ReduxState} from '../../reducers';
import {NavigationScreenProp, NavigationState} from 'react-navigation';
import {statusModel} from "../../api/status";

interface IProps extends IReduxProps {
  item: statusModel;
  clickable: boolean;
  deleteStatusFn?: any;
  userInfo?: any;
  userId?: string;
  canDelete?: boolean;
  canModify?: boolean;
  navigation: NavigationScreenProp<NavigationState>;
}

interface IState {}

@(connect(
  (state: ReduxState) => ({
    userInfo: state.loginIndex.userInfo,
  }),
  dispatch => ({
    dispatch,
    showToastFn: data => dispatch(showToast(data)),
    deleteStatusFn: data => dispatch(deleteStatus(data)),
  }),
) as any)
export default class status_item extends PureComponent<IProps, IState> {
  static defaultProps = {
    clickable: true,
  };
  private overlayKey: any;
  private fromView: any;

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
          onPress: () => {
            const {deleteStatusFn, item} = this.props;
            deleteStatusFn &&
              deleteStatusFn({
                request: {
                  statusId: item.Id,
                },
                successAction: () => {
                  //如果是在详情，则返回到列表界面
                  if (
                    NavigationHelper.navRouters[
                      NavigationHelper.navRouters.length - 1
                    ].routeName === 'StatusDetail'
                  ) {
                    NavigationHelper.goBack();
                  }
                },
              });
          },
        },
      ],
      {cancelable: false},
    );
  };

  showMenu = () => {
    const {userInfo, userId, canDelete} = this.props;
    let canModify =
      userInfo.SpaceUserID + '' === userId + '' && this.props.canModify;
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
              {item.IsPrivate ? (
                <Text style={{color: gColors.colorRed, fontSize: gFont.size12}}>
                  [私有]
                </Text>
              ) : null}
              <TouchableOpacity
                activeOpacity={activeOpacity}
                onPress={() => {
                  ServiceUtils.viewProfileDetail(
                    this.props.dispatch,
                    item.UserAlias,
                    item.author?.avatar,
                  );
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
            </View>
            <HTMLView
              containerStyle={{marginVertical: 7}}
              html={item.summary}
              stylesheet={styles}
            />
            {item.comments.length > 0 ? (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  marginTop: 5,
                }}>
                <Text style={{color: gColors.color666, fontSize: gFont.size12}}>
                  {item.comments.length + ' 评论'}
                </Text>
              </View>
            ) : null}
          </View>
          {item.author?.id === userInfo.SpaceUserID ? (
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
              <Ionicons name="ios-more" size={25} color={gColors.color0} />
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
