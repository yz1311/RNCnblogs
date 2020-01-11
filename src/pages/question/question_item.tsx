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
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {ListRow, Overlay} from '@yz1311/teaset';
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

interface IProps extends IReduxProps {
  setSelectedQuestionFn?: any;
  deleteQuestionFn?: any;
  item: questionModel;
  showAll?: boolean;
  clickable: boolean;
  selectable: boolean;
  navigation: NavigationScreenProp<NavigationState>;
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
          onPress: () => {
            const {deleteQuestionFn, item} = this.props;
            deleteQuestionFn &&
              deleteQuestionFn({
                request: {
                  questionId: item.id,
                },
                successAction: () => {
                  //如果是在详情，则返回到列表界面
                  if (
                    NavigationHelper.navRouters[
                      NavigationHelper.navRouters.length - 1
                    ].routeName === 'QuestionDetail'
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
              this.props.setSelectedQuestionFn(item);
              this.props.navigation.navigate('QuestionDetail', {});
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
                  ServiceUtils.viewProfileDetail(
                    this.props.dispatch,
                    item.author?.id,
                    faceUrl,
                  );
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
                <MaterialCommunityIcons
                  name="coin"
                  size={20}
                  color={gColors.colorff}
                />
              ) : null}
              {item.gold > 0 ? (
                <Text style={{color: gColors.colorff}}>
                  {item.gold + '   '}
                </Text>
              ) : null}
              <Text selectable>{item.title}</Text>
            </Text>
            <View style={{flexDirection: 'row'}}>
              {showAll ? (
                <Markdown>{item.summary}</Markdown>
              ) : (
                <Text
                  style={[
                    {
                      color: gColors.color333,
                      fontSize: gFont.sizeDetail,
                      marginVertical: 4,
                    },
                    Styles.text4Pie,
                  ]}
                  {...detailProps}
                  selectable>
                  {item.summary}
                </Text>
              )}
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
                  {moment(item.published).format('YYYY-MM-DD HH:mm')}
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
              <Ionicons name="ios-more" size={25} color={gColors.color0} />
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
      <Text style={{color: gColors.themeColor, fontSize: gFont.size12}}>
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
