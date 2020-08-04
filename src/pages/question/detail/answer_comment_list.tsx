import React, {Component, PureComponent} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Text,
  ScrollView,
  Alert,
  Share,
  DeviceEventEmitter,
  RefreshControl,
  EmitterSubscription,
} from 'react-native';
import {connect} from 'react-redux';
import YZStateView from '../../../components/YZStateCommonView';
import YZFlatList from '../../../components/YZFlatList';
import YZBaseDataPage, {
  IBaseDataPageProps,
} from '../../../components/YZBaseDataPage';
import YZCommentInput from '../../../components/YZCommentInput';
import YZCommonActionMenu from '../../../components/YZCommonActionMenu';
import {Styles} from '../../../common/styles';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {ListRow} from '@yz1311/teaset';
import PropTypes from 'prop-types';
import moment from 'moment';
import {
  getAnswerCommentList,
  clearAnswerCommentList,
  clearQuestionAnswerList,
  commentAswer,
  deleteAnswerComment,
  modifyAnswerComment,
} from '../../../actions/question/question_detail_actions';
import AnswerItem from './answer_item';
import {showToast} from '../../../actions/app_actions';
import StringUtils from '../../../utils/stringUtils';
import CommentItem from '../../blog/comment_item';
import {ReduxState} from '../../../reducers';
import {ServiceTypes} from "../../YZTabBarView";

interface IProps extends IBaseDataPageProps {
  item: any;
  clearQuestionAnswerListFn: any;
  commentAswerFn: any;
  deleteAnswerCommentFn: any;
  modifyAnswerCommentFn: any;
  selectedQuestion?: any;
  userInfo?: any;
  dataList?: Array<any>;
  isLogin?: boolean
}

interface IState {
  isRefreshing: boolean;
  headerTitle: string;
  headerSubmit: string;
}

@(connect(
  (state: ReduxState) => ({
    dataList: state.questionDetail.answerCommentList,
    loadDataResult: state.questionDetail.getAnswerCommentListResult,
    item: state.questionDetail.selectedAnswer,
    selectedQuestion: state.questionDetail.selectedQuestion,
    userInfo: state.loginIndex.userInfo,
    isLogin: state.loginIndex.isLogin
  }),
  dispatch => ({
    dispatch,
    loadDataFn: data => dispatch(getAnswerCommentList(data)),
    clearDataFn: data => dispatch(clearAnswerCommentList(data)),
    clearQuestionAnswerListFn: data => dispatch(clearQuestionAnswerList(data)),
    commentAswerFn: data => dispatch(commentAswer(data)),
    deleteAnswerCommentFn: data => dispatch(deleteAnswerComment(data)),
    modifyAnswerCommentFn: data => dispatch(modifyAnswerComment(data)),
  }),
) as any)
export default class answer_comment_list extends YZBaseDataPage<
  IProps,
  IState
> {
  static propTypes = {
    item: PropTypes.object,
  };

  private reloadListener: EmitterSubscription;
  private pageIndex: number;
  private _flatList: any;
  private _commentInput: any;

  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      isRefreshing: false,
      headerTitle: '',
      headerSubmit: '',
    };
  }

  componentDidMount() {
    super.componentDidMount();
    this.reloadListener = DeviceEventEmitter.addListener(
      'reload_question_detail',
      this.loadData,
    );
    this.setTitle();
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (this.props.loadDataResult !== nextProps.loadDataResult) {
      this.setState({
        isRefreshing: false,
      });
    }
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    this.reloadListener.remove();
  }

  setTitle = (nextProps = undefined) => {
    nextProps = nextProps || this.props;
    nextProps.navigation.setParams({
      title: nextProps.item.CommentCounts,
    });
  };

  getParams = () => {
    const {item} = this.props;
    const params = {
      request: {
        answerId: item.AnswerID,
      },
      url: item.Url,
    };
    return params;
  };

  _renderCommentItem = ({item, index}) => {
    const {selectedQuestion, userInfo} = this.props;
    let PostUserInfo = item.PostUserInfo || {};
    let QuestionUserInfo = selectedQuestion.QuestionUserInfo || {};
    return (
      <CommentItem
        item={item}
        iconName={PostUserInfo.IconName}
        floor={item.Floor}
        authorUserId={QuestionUserInfo.UserID}
        userId={item.PostUserID}
        userName={item.PostUserName}
        content={item.Content}
        postDate={item.DateAdded}
        canDelete={item.PostUserID === userInfo.SpaceUserID}
        onDeleteCommentFn={() => {
          const {deleteAnswerCommentFn} = this.props;
          deleteAnswerCommentFn({
            request: {
              questionId: this.props.item.Qid,
              answerId: this.props.item.AnswerID,
              commentId: item.CommentID,
            },
            successAction: () => {
              //刷新当前列表
              this.pageIndex = 1;
              if (this._flatList) {
                this._flatList && this._flatList._onRefresh();
              } else {
                this.loadData();
              }
            },
          });
        }}
        onModifyComment={(content, successAction, failAction) => {
          const {modifyAnswerCommentFn} = this.props;
          modifyAnswerCommentFn({
            request: {
              questionId: this.props.item.Qid,
              answerId: this.props.item.AnswerID,
              commentId: item.CommentID,
              Content: content,
              PostUserID: '',
            },
            successAction: () => {
              //成功后关闭对话框
              successAction && successAction();
              //刷新当前列表
              this.pageIndex = 1;
              if (this._flatList) {
                this._flatList && this._flatList._onRefresh();
              } else {
                this.loadData();
              }
            },
          });
        }}
        onComment={(item, userName) => {
          this.setState(
            {
              headerTitle: '正在回复  ' + userName,
              headerSubmit: '@' + userName + ':',
            },
            () => {
              this._commentInput &&
                this._commentInput.show();
            },
          );
        }}
      />
    );
  };

  onSubmit = (text, callback) => {
    const {commentAswerFn, item, userInfo} = this.props;
    let AnswerUserInfo = item.AnswerUserInfo || {};
    commentAswerFn({
      request: {
        questionId: item.Qid,
        answerId: item.AnswerID,
        loginName: userInfo.BlogApp,
        Content: this.state.headerSubmit + '\n\n' + text,
        UserID: AnswerUserInfo.UserID,
        //这个不是评论人
        UserName: AnswerUserInfo.UserName,
      },
      successAction: () => {
        callback && callback();
        //刷新当前列表
        this.pageIndex = 1;
        if (this._flatList) {
          this._flatList && this._flatList._onRefresh();
        } else {
          this.loadData();
        }
      },
    });
  };

  render() {
    const {item} = this.props;
    let headerComponent = (
      <View>
        <AnswerItem item={this.props.item} clickable={false} />
        <Text
          style={{marginVertical: 8, color: gColors.color666, marginLeft: 8}}>
          所有评论
        </Text>
      </View>
    );
    return (
      <View style={[Styles.container]}>
        {this.props.loadDataResult.success &&
        this.props.dataList.length == 0 ? (
          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={this.state.isRefreshing}
                onRefresh={() => {
                  this.setState(
                    {
                      isRefreshing: true,
                    },
                    this.loadData,
                  );
                }}
                colors={[gColors.themeColor]}
              />
            }
            style={{flex: 1, overflow: 'hidden'}}>
            {headerComponent}
            <View style={{marginVertical: 30, alignItems: 'center'}}>
              <Text style={{color: gColors.color999}}>-- 暂无评论 --</Text>
            </View>
          </ScrollView>
        ) : (
          <YZStateView
            loadDataResult={this.props.loadDataResult}
            placeholderTitle="-- 暂无评论 --"
            errorButtonAction={this.loadData}>
            <YZFlatList
              ref={ref => (this._flatList = ref)}
              style={{flex: 1}}
              renderItem={this._renderCommentItem}
              ListHeaderComponent={headerComponent}
              data={this.props.dataList}
              loadDataResult={this.props.loadDataResult}
              noMore
              initialNumToRender={20}
              loadData={this.loadData}
              ListFooterComponent={() => null}
              ItemSeparatorComponent={() => (
                <View
                  style={{height: 1, backgroundColor: gColors.borderColor}}
                />
              )}
            />
          </YZStateView>
        )}
        <YZCommentInput
          ref={ref => (this._commentInput = ref)}
          onSubmit={this.onSubmit}
          isLogin={this.props.isLogin}
          headerTitle={this.state.headerTitle}
          placeholder="想说点什么"
          onToggle={toggleState => {
            if (!toggleState) {
              this.setState({
                headerTitle: '',
                headerSubmit: '',
              });
            }
          }}
          menuComponent={() => (
            <YZCommonActionMenu
              data={this.props.item}
              onClickCommentList={() => {
                this._flatList &&
                  this._flatList.flatList.scrollToIndex({
                    viewPosition: 0,
                    index: 0,
                  });
              }}
              serviceType={ServiceTypes.博问}
              commentCount={item.CommentCounts}
              showCommentButton={false}
              showShareButton={false}
              showFavButton={false}
            />
          )}
        />
      </View>
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
