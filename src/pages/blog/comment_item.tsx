import React, {Component, PureComponent} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Text,
  Clipboard,
  Linking,
} from 'react-native';
import {connect} from 'react-redux';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Alert, ListRow, Overlay, Theme} from '@yz1311/teaset';
import PropTypes from 'prop-types';
import {Styles} from '../../common/styles';
import moment from 'moment';
import StringUtils from '../../utils/stringUtils';
import ServiceUtils from '../../utils/serviceUtils';
import AnswerModify from '../question/detail/answer_modify';
import HTMLView from 'react-native-render-html';
import {showToast} from '../../actions/app_actions';
import {ReduxState} from '../../reducers';
import {getUserAliasByUserName} from '../../actions/profile/profile_index_actions';
import Feather from "react-native-vector-icons/Feather";
import ToastUtils from "../../utils/toastUtils";

interface IProps extends IReduxProps {
  item?: any;
  clickable: boolean;
  //文章作者的userId
  authorUserId?: any;
  //头像相对路径
  iconName: string;
  userId: any;
  //发布人
  userName: string;
  //楼层
  floor: number;
  //正文
  content: string;
  //日期
  postDate: any;
  onModifyComment?: any;
  onDeleteCommentFn: any;
  onComment: any;
  //是否能够编辑评论
  canModify: boolean;
  canDelete: boolean;
  userInfo?: any;
  questionLevel?: string;
  questionPeans?: string;
}

interface IState {}

@(connect(
  (state: ReduxState) => ({
    userInfo: state.loginIndex.userInfo,
  })) as any)
export default class comment_item extends PureComponent<IProps, IState> {
  static propTypes = {
    item: PropTypes.object,
    clickable: PropTypes.bool,
    //文章作者的userId
    authorUserId: PropTypes.any,
    //头像相对路径
    iconName: PropTypes.string,
    userId: PropTypes.any,
    //发布人
    userName: PropTypes.string,
    //楼层
    floor: PropTypes.number,
    //正文
    content: PropTypes.string,
    //日期
    postDate: PropTypes.any,
    onModifyComment: PropTypes.func,
    onDeleteCommentFn: PropTypes.func,
    onComment: PropTypes.func,
    //是否能够编辑评论
    canModify: PropTypes.bool,
    canDelete: PropTypes.bool,
  };

  static defaultProps = {
    clickable: true,
    selectable: false,
    canModify: true,
    canDelete: true,
  };

  private overlayKey: any;
  private modifyOverlayKey: any;
  private fromView: any;

  _onCopy = () => {
    Overlay.hide(this.overlayKey);
    Clipboard.setString(this.props.content);
    ToastUtils.showToast('拷贝成功!', {
      position: ToastUtils.positions.CENTER,
    });
  };

  _onModify = () => {
    Overlay.hide(this.overlayKey);
    const {item} = this.props;
    let modifyOverlayView = (
      <Overlay.View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(1,1,1,0.6)',
        }}
        modal={true}
        animated={true}
        autoKeyboardInsets={__ANDROID__ ? false : true}
        overlayOpacity={0}>
        <AnswerModify
          title="修改评论"
          item={item}
          closeModal={() => {
            Overlay.hide(this.modifyOverlayKey);
          }}
          onSubmit={content => {
            const {onModifyComment} = this.props;
            onModifyComment &&
              onModifyComment(
                content,
                () => {
                  //成功后关闭对话框
                  Overlay.hide(this.modifyOverlayKey);
                },
                () => {},
              );
          }}
        />
      </Overlay.View>
    );
    this.modifyOverlayKey = Overlay.show(modifyOverlayView);
  };

  _onDelete = () => {
    Overlay.hide(this.overlayKey);
    Alert.alert(
      '',
      '是否删除该评论?',
      [
        {
          text: '取消',
        },
        {
          text: '删除',
          style: 'destructive',
          onPress: () => {
            const {onDeleteCommentFn} = this.props;
            onDeleteCommentFn && onDeleteCommentFn(() => {}, () => {});
          },
        },
      ],
      {cancelable: false},
    );
  };

  showMenu = () => {
    const {userInfo, userId, canDelete} = this.props;
    let canModify = this.props.canModify;
    let listProps = {};
    if (!canModify && !canDelete) {
      listProps = {
        ...listProps,
        bottomSeparator: null,
      };
    }
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
            titleStyle={{color: gColors.bgColorF, textAlign: 'center'}}
            title="拷贝"
            {...listProps}
            onPress={this._onCopy}
          />
          {canModify && (
            <ListRow
              style={{backgroundColor: 'transparent', width: 100}}
              titleStyle={{color: gColors.bgColorF, textAlign: 'center'}}
              title="修改"
              onPress={this._onModify}
            />
          )}
          {canDelete && (
            <ListRow
              style={{backgroundColor: 'transparent', width: 100}}
              titleStyle={{color: gColors.colorRed, textAlign: 'center'}}
              bottomSeparator={null}
              title="删除"
              onPress={this._onDelete}
            />
          )}
        </Overlay.PopoverView>
      );
      this.overlayKey = Overlay.show(overlayView);
    });
  };

  //查看个人页面
  searchUserAlias = async href => {
    let userId = ServiceUtils.getUserIdFromAvatorUrl(href);
    if (userId) {
      //Todo:
      // let userInfo = await ServiceUtils.searchUserAlias(userId);
      // return userInfo;
    }
    return null;
  };

  render() {
    const {
      item,
      clickable,
      userInfo,
      authorUserId,
      iconName,
      userId,
      userName,
      floor,
      content,
      postDate,
      onComment,
    } = this.props;
    let avator = iconName;
    if (iconName.indexOf('http') === -1) {
      avator = `https://pic.cnblogs.com/face/${iconName}`;
    }
    return (
      <TouchableOpacity
        activeOpacity={activeOpacity}
        onPress={() => {
          onComment &&
            onComment(
              item,
              userName + (userId == authorUserId ? '(作者)' : ''),
            );
        }}
        style={{
          backgroundColor: gColors.bgColorF,
          paddingVertical: 8,
          paddingHorizontal: 8,
          flexDirection: 'row',
        }}>
        <TouchableOpacity
          activeOpacity={activeOpacity}
          onPress={async () => {
            // NavigationHelper.navigate('ProfilePerson',{
            //     userAlias: AnswerUserInfo.Alias,
            //     avatorUrl: avator
            // });
            //问答的评论有回答者信息
            let alias, iconUrl;
            if (item.PostUserInfo) {
              alias = item.PostUserInfo.Alias;
              iconUrl =
                'https://pic.cnblogs.com/face/' + item.PostUserInfo.IconName;
              ServiceUtils.viewProfileDetail(
                this.props.dispatch,
                alias,
                iconUrl,
              );
              return;
            }
            //博客的没有alias信息
            else {
              let userInfo = await this.searchUserAlias(
                item.AuthorUrl || item.FaceUrl || item.UserIconUrl,
              );
              if (userInfo) {
                alias = userInfo.alias;
                iconUrl = userInfo.iconUrl;
                ServiceUtils.viewProfileDetail(
                  this.props.dispatch,
                  alias,
                  iconUrl,
                );
                return;
              } else {
                this.props.dispatch(
                  getUserAliasByUserName({
                    request: {
                      userName: item.UserName,
                      fuzzy: false,
                      userId: item.UserId,
                    },
                    successAction: result => {
                      if (result && result.alias) {
                        alias = result.alias;
                        iconUrl = result.iconUrl;
                        ServiceUtils.viewProfileDetail(
                          this.props.dispatch,
                          alias,
                          iconUrl,
                        );
                        return;
                      }
                    },
                  }),
                );
              }
            }
          }}
          style={{flexDirection: 'row', alignSelf: 'stretch'}}>
          <Image
            style={Styles.avator}
            source={{uri: avator}}
            defaultSource={require('../../resources/ico/simple_avatar.gif')}
          />
        </TouchableOpacity>
        <View style={{flex: 1, marginLeft: 7}}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <View>
              <Text style={[Styles.userName, {fontWeight: 'bold'}]}>
                <Text style={{color: 'salmon'}}>{'#' + floor + '楼'}</Text>
                &nbsp;&nbsp;
                <Text>{userName}</Text>
              </Text>
              {this.props.questionPeans != undefined ?
                  <Text style={{...Theme.fontSizeAndColor(23, gColors.color999), marginTop:Theme.px2dp(8)}}>{`园豆：${this.props.questionPeans}(${this.props.questionLevel})`}</Text>
                  :
                  null
              }
            </View>
            {userId == authorUserId ? (
              <View
                style={{
                  marginLeft: 5,
                  paddingVertical: 3,
                  paddingHorizontal: 4,
                  borderColor: gColors.themeColor,
                  borderWidth: gScreen.onePix,
                }}>
                <Text
                  style={{fontSize: gFont.size10, color: gColors.themeColor}}>
                  作者
                </Text>
              </View>
            ) : null}
          </View>
          <HTMLView
            containerStyle={{marginVertical: 12}}
            html={content}
          />
          <Text style={{fontSize: gFont.size13, color: gColors.color999}}>
            {StringUtils.formatDate(postDate)}
          </Text>
          {/*<div style="height: 1px;background-color: #999999;margin-top: 10px;"></div>*/}
        </View>
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
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  avator: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  icon: {
    width: 40,
    height: 40,
  },
});
