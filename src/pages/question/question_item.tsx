import React, {Component, PureComponent} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Text,
  Alert,
  DeviceEventEmitter, PixelRatio,
} from 'react-native';
import {connect} from 'react-redux';
import YZStateView from '../../components/YZStateCommonView';
import YZFlatList from '../../components/YZFlatList';
import {Styles} from '../../common/styles';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {ListRow, Overlay, Theme} from '@yz1311/teaset';
import PropTypes from 'prop-types';
import moment from 'moment';
import StringUtils from '../../utils/stringUtils';
import Markdown, {getUniqueID} from 'react-native-markdown-renderer';
import FitImage from 'react-native-fit-image';
import {deleteQuestion} from '../../actions/question/question_index_actions';
import {setSelectedQuestion} from '../../actions/question/question_detail_actions';
import {BorderShadow} from '@yz1311/react-native-shadow';
import {showToast} from '../../actions/app_actions';
import {ReduxState} from '../../reducers';
import {NavigationScreenProp, NavigationState} from 'react-navigation';
import ServiceUtils from '../../utils/serviceUtils';
import {questionModel} from '../../api/question';
import HTMLView from 'react-native-render-html';
import {Api} from '../../api';
import ToastUtils from '../../utils/toastUtils';
import Feather from "react-native-vector-icons/Feather";

interface IProps extends IReduxProps {
  setSelectedQuestionFn?: any;
  deleteQuestionFn?: any;
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
    setSelectedQuestionFn: data => dispatch(setSelectedQuestion(data)),
    deleteQuestionFn: data => dispatch(deleteQuestion(data)),
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
    this.props.setSelectedQuestionFn(item);
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
            const {deleteQuestionFn, item} = this.props;
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
              NavigationHelper.push('YZWebPage',{
                title: '博问详情',
                uri: item.link
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
            <Text
                style={[
                  {
                    color: gColors.color0,
                    fontSize: gFont.size16,
                    fontWeight: 'bold',
                    marginVertical: 7,
                  },
                  Styles.text4Pie,
                ]}>
              {item.gold > 0 ? (
                  <Image
                      style={{width:15,height:15}}
                      source={{uri: 'https://common.cnblogs.com/images/icons/yuandou20170322.png'}}
                  />
              ) : null}
              {item.gold > 0 ? (
                  <Text style={{color: '#f47a20',fontSize:gFont.size15,marginLeft:3}}>
                    {item.gold + '   '}
                  </Text>
              ) : null}
              <Text selectable>{item.title}</Text>
            </Text>
            {/*<HTMLView*/}
            {/*    baseFontStyle={{fontWeight:'bold',color: gColors.color0,fontSize: gFont.size16,}}*/}
            {/*    containerStyle={{marginVertical: 7,width:Theme.deviceWidth}}*/}
            {/*    html={`<div style="display: flex;flex-direction: row;flex-wrap:wrap;word-break:break-all;">${item.gold?`<img src='https://common.cnblogs.com/images/icons/yuandou20170322.png' /><span style="color:#f47a20;font-size:16px;"> ${item.gold}</span>`:''}  ${item.title}</div>`}*/}
            {/*    renderers={{*/}
            {/*      img: (htmlAttribs, children, convertedCSSStyles, passProps)=>{*/}
            {/*        return (*/}
            {/*            <Image style={{width:17,height:17,backgroundColor:'yellow'}} resizeMode={'contain'} source={{uri:'https://common.cnblogs.com/images/icons/yuandou20170322.png'}} />*/}
            {/*        );*/}
            {/*      },*/}
            {/*    }}*/}
            {/*/>*/}
            <View style={{flexDirection: 'row'}}>
              {showAll ? (
                <Markdown>{item.summary}</Markdown>
              ) :
                  <HTMLView
                      baseFontStyle={{color: gColors.color4c,fontSize: gFont.sizeDetail,}}
                      containerStyle={{marginVertical: 4}}
                      html={item.summary}
                  />
              }
            </View>
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
              <Text style={{color: gColors.color666, fontSize: gFont.size12}}>
                {item.comments + ' 回答 · '}
              </Text>
              <Text style={{color: gColors.color666, fontSize: gFont.size12}}>
                {item.views + ' 阅读'}
              </Text>
              <View style={{flex: 1, alignItems: 'flex-end'}}>
                <Text style={{color: gColors.color999, fontSize: gFont.size12}}>
                  {moment(item.published,'YYYY-MM-DD HH:mm').format('YYYY-MM-DD HH:mm')}
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
        NavigationHelper.push('YZWebPage', {
          title: item,
          uri: uri
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
