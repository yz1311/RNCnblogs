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
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PropTypes from 'prop-types';
import {Styles} from '../../../common/styles';
import {
  deleteQuestionAnswer,
  modifyQuestionAnswer,
  setSelectedAnswer,
} from '../../../actions/question/question_detail_actions';
import {Overlay, Label, Input, ListRow} from '@yz1311/teaset';
import AnswerModify from './answer_modify';
import Markdown from 'react-native-markdown-renderer';
import {ReduxState} from '../../../reducers';
import ServiceUtils from '../../../utils/serviceUtils';
import Feather from "react-native-vector-icons/Feather";

interface IProps extends IReduxProps {
  item: any;
  clickable?: boolean;
  deleteQuestionAnswerFn?: any;
  modifyQuestionAnswerFn?: any;
  setSelectedAnswerFn?: any;
  userInfo?: any;
  selectedQuestion?: any;
}

@(connect(
  (state: ReduxState) => ({
    userInfo: state.loginIndex.userInfo,
    selectedQuestion: state.questionDetail.selectedQuestion,
  }),
  dispatch => ({
    dispatch,
    deleteQuestionAnswerFn: data => dispatch(deleteQuestionAnswer(data)),
    modifyQuestionAnswerFn: data => dispatch(modifyQuestionAnswer(data)),
    setSelectedAnswerFn: data => dispatch(setSelectedAnswer(data)),
  }),
) as any)
export default class answer_item extends PureComponent<IProps, any> {
  static propTypes = {
    item: PropTypes.object,
    clickable: PropTypes.bool,
  };

  static defaultProps = {
    clickable: true,
    selectable: false,
  };

  private overlayKey: any;
  private modifyOverlayKey: any;
  private fromView: any;

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
          title="修改回答"
          item={item}
          closeModal={() => {
            Overlay.hide(this.modifyOverlayKey);
          }}
          onSubmit={answer => {
            const {modifyQuestionAnswerFn} = this.props;
            let QuestionUserInfo = item.QuestionUserInfo || {};
            modifyQuestionAnswerFn({
              request: {
                id: item.Qid,
                answerId: item.AnswerID,
                Answer: answer,
                UserID: QuestionUserInfo.UserID,
              },
              successAction: () => {
                //成功后关闭对话框
                Overlay.hide(this.modifyOverlayKey);
              },
            });
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
      '是否删除该回答?',
      [
        {
          text: '取消',
        },
        {
          text: '删除',
          onPress: () => {
            const {deleteQuestionAnswerFn, item} = this.props;
            deleteQuestionAnswerFn({
              request: {
                questionId: item.Qid,
                answerId: item.AnswerID,
              },
            });
          },
        },
      ],
      {cancelable: false},
    );
  };

  showMenu = () => {
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
    const {item, userInfo, clickable, selectedQuestion} = this.props;
    let AnswerUserInfo = item.AnswerUserInfo || {};
    let QuestionUserInfo = selectedQuestion.QuestionUserInfo || {};
    let avator = `https://pic.cnblogs.com/face/${AnswerUserInfo.IconName}`;
    return (
      <TouchableOpacity
        activeOpacity={clickable ? activeOpacity : 1}
        onPress={() => {
          if (clickable) {
            //由于数字需要改变，放在redux中
            this.props.setSelectedAnswerFn(item);
            NavigationHelper.navigate('AnswerCommentList', {});
          }
        }}>
        <View
          style={{
            backgroundColor: gColors.bgColorF,
            paddingVertical: 10,
            paddingHorizontal: 8,
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 10,
            }}>
            <TouchableOpacity
              activeOpacity={activeOpacity}
              onPress={() => {
                ServiceUtils.viewProfileDetail(
                  this.props.dispatch,
                  item.AnswerUserInfo.Alias,
                  avator,
                );
              }}
              style={{
                flexDirection: 'row',
                alignSelf: 'stretch',
                alignItems: 'center',
              }}>
              {AnswerUserInfo.UserName != undefined ? (
                <Image
                  style={[Styles.avator]}
                  resizeMode="contain"
                  source={{uri: avator}}
                />
              ) : (
                <View style={[Styles.avator]} />
              )}
              <View>
                {AnswerUserInfo.UserName != undefined ? (
                  <Text style={[Styles.userName]}>
                    {item.AnswerUserInfo.UserName +
                      (AnswerUserInfo.UserID == QuestionUserInfo.UserID
                        ? '(作者)'
                        : '')}
                  </Text>
                ) : (
                  '--'
                )}
              </View>
            </TouchableOpacity>
          </View>
          {/*<HTMLView*/}
          {/*style={{marginVertical:10}}*/}
          {/*value={item.Answer}*/}
          {/*stylesheet={styles}*/}
          {/*/>*/}
          <Markdown>{item.Answer}</Markdown>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 10,
            }}>
            <Text style={{color: gColors.color666, fontSize: gFont.size12}}>
              {item.postDateDesc}
            </Text>
            <View style={{flexDirection: 'row'}}>
              <MaterialCommunityIcons
                name="message-outline"
                size={18}
                color={gColors.color333}
              />
              <Text style={{marginLeft: 4}}>{item.CommentCounts}</Text>
            </View>
          </View>
          {userInfo.SpaceUserID === AnswerUserInfo.UserID ? (
            <TouchableOpacity
              ref={ref => (this.fromView = ref)}
              activeOpacity={activeOpacity}
              onPress={() => {
                this.showMenu();
              }}
              style={{
                position: 'absolute',
                right: 0,
                top: 0,
                paddingVertical: 10,
                paddingHorizontal: 12,
              }}>
                <Feather name="more-horizontal" size={25} color={gColors.color0} />
            </TouchableOpacity>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  avator: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  icon: {
    width: 40,
    height: 40,
  },
});
