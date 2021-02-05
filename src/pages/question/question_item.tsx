import React, {Component, PureComponent} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Text,
  Alert,
} from 'react-native';
import {connect} from 'react-redux';
import {Styles} from '../../common/styles';
import {ListRow, Overlay, Theme} from '@yz1311/teaset';
import PropTypes from 'prop-types';
import moment from 'moment';
import {BorderShadow} from '@yz1311/react-native-shadow';
import {ReduxState} from '../../reducers';
import ServiceUtils from '../../utils/serviceUtils';
import {questionModel} from '../../api/question';
import HTMLView from 'react-native-render-html';
import {Api} from '../../api';
import ToastUtils from '../../utils/toastUtils';
import Feather from "react-native-vector-icons/Feather";
import {QuestionTypes} from "./question_index";
import StringUtils from "../../utils/stringUtils";

interface IProps extends IReduxProps {
  item: questionModel;
  showAll?: boolean;
  clickable: boolean;
  selectable: boolean;
  canViewProfile?: boolean,
  navigation: any;
  canDelete?: any;
  canModify?: any;
  userInfo?: any;
  userId?: string;
}

@(connect(
  (state: ReduxState) => ({
    userInfo: state.loginIndex.userInfo,
  }),
  dispatch => ({
    dispatch,
  }),
) as any)
export default class question_item extends PureComponent<IProps, any> {
  static propTypes = {
    item: PropTypes.object,
    showAll: PropTypes.bool,
    clickable: PropTypes.bool,
    selectable: PropTypes.bool,
  };

  static defaultProps = {
    clickable: true,
    selectable: false,
    canViewProfile: true
  };

  private overlayKey: any;
  private fromView: any;

  _onModify = () => {
    Overlay.hide(this.overlayKey);
    const {item} = this.props;
    this.props.navigation.navigate('QuestionAdd', {
      title: '修改问题',
    });
  };

  _onDelete = () => {
    Overlay.hide(this.overlayKey);
    Alert.alert(
      '',
      '是否删除该提问?',
      [
        {
          text: '取消',
        },
        {
          text: '删除',
          onPress: async () => {
            ToastUtils.showLoading();
            const {item} = this.props;
            try {
              let response = await Api.question.deleteQuestion({
                request: {
                  qid: parseInt(item.id)
                }
              });
              //如果是在详情，则返回到列表界面
              if (
                NavigationHelper.navRouters[
                NavigationHelper.navRouters.length - 1
                  ].routeName === 'QuestionDetail'
              ) {
                NavigationHelper.goBack();
              }
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
            titleStyle={{color: gColors.bgColorF, textAlign: 'center'}}
            title="修改"
            onPress={this._onModify}
          />
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
    const {item, showAll, clickable, userInfo} = this.props;
    let tags = item.tags || [];
    let detailProps = {};
    if (!showAll) {
      detailProps = {
        numberOfLines: 4,
      };
    }
    let faceUrl = item.author?.avatar || 'https://pic.cnblogs.com/face/sample_face.gif';
    //那个地址是错误的，无法访问
    // if (
    //   item.author &&
    //   item.QuestionUserInfo.Face !==
    //     'https://pic.cnblogs.com/avatar/sample_face.gif'
    // ) {
    //   faceUrl = item.QuestionUserInfo.Face;
    // }
    return (
      <BorderShadow
        setting={{width: gScreen.width, border: 3, color: gColors.color999}}>
        <TouchableOpacity
          activeOpacity={clickable ? activeOpacity : 1}
          onPress={() => {
            if (clickable) {
              // this.props.navigation.navigate('QuestionDetail', {});
              // NavigationHelper.push('YZWebPage',{
              //   title: '博问详情',
              //   uri: item.link
              // });
              NavigationHelper.push('QuestionDetail', {
                item: item
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
              <TouchableOpacity
                activeOpacity={activeOpacity}
                onPress={() => {
                  if(this.props.canViewProfile) {
                    ServiceUtils.viewProfileDetail(
                      this.props.dispatch,
                      item.author?.id,
                      item.author?.name,
                      faceUrl,
                    );
                  }
                }}
                style={{
                  flexDirection: 'row',
                  alignSelf: 'stretch',
                  alignItems: 'center',
                }}>
                {item.author != undefined ? (
                  <Image
                    style={[Styles.avator]}
                    resizeMode="contain"
                    source={{uri: faceUrl}}
                  />
                ) : (
                  <View style={[styles.avator]} />
                )}
                {item.author != undefined ? (
                  <Text style={[Styles.userName]}>
                    {item.author?.name}
                  </Text>
                ) : (
                  '--'
                )}
              </TouchableOpacity>
              <View style={{marginLeft: 10}}>
                <Text style={{color: gColors.color666, fontSize: gFont.size12}}>
                  {item.publishedDesc}
                </Text>
              </View>
            </View>
            {/*<Text*/}
            {/*    style={[*/}
            {/*      {*/}
            {/*        color: gColors.color0,*/}
            {/*        fontSize: gFont.size16,*/}
            {/*        fontWeight: 'bold',*/}
            {/*        marginVertical: 7,*/}
            {/*      },*/}
            {/*      Styles.text4Pie,*/}
            {/*    ]}>*/}
            {/*  {item.gold > 0 ? (*/}
            {/*      <Image*/}
            {/*          style={{width:15,height:15}}*/}
            {/*          source={{uri: 'https://common.cnblogs.com/images/icons/yuandou20170322.png'}}*/}
            {/*      />*/}
            {/*  ) : null}*/}
            {/*  {item.gold > 0 ? (*/}
            {/*      <Text style={{color: '#f47a20',fontSize:gFont.size15,marginLeft:3}}>*/}
            {/*        {item.gold + '   '}*/}
            {/*      </Text>*/}
            {/*  ) : null}*/}
            {/*  <Text selectable>{item.title}</Text>*/}
            {/*</Text>*/}
            <HTMLView
                baseFontStyle={{fontWeight:'bold',color: gColors.color0,fontSize: gFont.size16,}}
                containerStyle={{marginVertical: 7, width: Theme.deviceWidth-20}}
                html={`<span style="display: flex;flex-direction: row;">${item.gold > 0?
                    ('<img style="width: 15px;height: 15px;display: inline;" src="https://common.cnblogs.com/images/icons/yuandou20170322.png"></img><span style="color: #f47a20;font-size: 18px;font-weight: bold;">&nbsp;&nbsp;'+item.gold+'</span>'):''}${'  '+item.title}</span>`}
            />
            <HTMLView
                baseFontStyle={{color: gColors.color4c,fontSize: gFont.sizeDetail,}}
                containerStyle={{marginVertical: 6, marginHorizontal: -8, paddingHorizontal: 8}}
                imagesMaxWidth={Theme.deviceWidth - 16}
                html={item.summary?.trim()}
            />
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingBottom: 8,
                flexWrap: 'wrap',
              }}>
              {tags.map((x, xIndex) => {
                return (
                  <Tag
                    style={{marginTop: 8}}
                    key={xIndex}
                    index={xIndex}
                    item={x.name}
                    uri={x.uri}
                  />
                );
              })}
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 5,
              }}>
              {/*<Text style={{color: gColors.color666, fontSize: gFont.size12}}>*/}
              {/*  {item.DiggCount + ' 推荐 · '}*/}
              {/*</Text>*/}
              <TouchableOpacity
                disabled={true}
                style={{flexDirection:'row',alignItems:'center', paddingLeft: 8, paddingRight: 10}}
              >
                <Feather name="message-circle" size={16} color={gColors.color999} />
                <Text style={{marginLeft: 4, color: gColors.color999, fontSize: gFont.size12}}>
                  {item.comments}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={true}
                style={{flexDirection:'row',alignItems:'center', paddingLeft: 8, paddingRight: 10}}
              >
                <Feather name="eye" size={16} color={gColors.color999} />
                <Text style={{marginLeft: 4, color: gColors.color999, fontSize: gFont.size12}}>
                  {item.views}
                </Text>
              </TouchableOpacity>
              <View style={{flex: 1, alignItems: 'flex-end'}}>
                <Text style={{color: gColors.color999, fontSize: gFont.size12}}>
                  {StringUtils.formatDate(moment(item.published,'YYYY-MM-DD HH:mm').toDate())}
                </Text>
              </View>
            </View>
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
              <Feather name="more-horizontal" size={25} color={gColors.color0} />
            </TouchableOpacity>
          ) : null}
        </TouchableOpacity>
      </BorderShadow>
    );
  }
}

const Tag = ({item, index, style,uri}) => {
  let height = 20;
  return (
    <TouchableOpacity
      activeOpacity={activeOpacity}
      onPress={() => {
        NavigationHelper.push('BaseQuestionList', {
          tagName: item,
          questionType: QuestionTypes.标签,
          keyword: '',
          isPage: true
        });
      }}
      style={[
        {
          height: height,
          justifyContent: 'center',
          borderRadius: 6,
          paddingHorizontal: 8,
          backgroundColor: gColors.borderColor,
          marginLeft: index !== 0 ? 8 : 0,
        },
        style,
      ]}>
      <Text style={{color: Theme.primaryColor, fontSize: gFont.size12}}>
        {item}
      </Text>
    </TouchableOpacity>
  );
};

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
