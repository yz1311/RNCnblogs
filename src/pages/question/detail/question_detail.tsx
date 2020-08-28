import React, {Component, FC, PureComponent} from 'react';
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
  PixelRatio,
  Linking,
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
import PropTypes from 'prop-types';
import QuestionItem from '../question_item';
import {ReduxState} from '../../../reducers';
import {NavigationBar, Theme} from "@yz1311/teaset";
import {Api} from "../../../api";
import {questionCommentModel, questionModel} from "../../../api/question";
import {createReducerResult, dataToReducerResult, ReducerResult} from "../../../utils/requestUtils";
import CommentItem from "../../blog/comment_item";
import ToastUtils from "../../../utils/toastUtils";
import ProfileServices from "../../../services/profileServices";
import produce from "immer";
import {ServiceTypes} from "../../YZTabBarView";
import {statusCommentModel} from "../../../api/status";

interface IProps extends IBaseDataPageProps {
  item: questionModel;
  answerQuestionFn?: any;
  answerList?: Array<any>;
  getAnswerListResult?: any;
  userInfo?: any;
  data?: any;
  isLogin?: boolean
}


interface IState {
  isRefreshing: boolean;
  questionDetail: Partial<questionModel>,
  loadDataResult: ReducerResult;
  headerTitle: string;
  headerSubmit: string;
  selectedCommentItem: questionCommentModel;
}

@(connect((state:ReduxState)=>({
  userInfo: state.loginIndex.userInfo
})) as any)
export default class question_detail extends Component<IProps, IState> {
  static propTypes = {
    item: PropTypes.object,
  };

  private reloadListener: EmitterSubscription;
  private _flatList: any;
  private _commentInput: any;

  constructor(props) {
    super(props);
    this.state = {
      isRefreshing: false,
      headerTitle: '',
      headerSubmit: '',
      questionDetail: null,
      loadDataResult: createReducerResult(),
      selectedCommentItem: null
    };
  }

  componentDidMount() {
    this.loadData();
  }

  loadData = async ()=>{
    const {item} = this.props;
    try {
      let response = await Api.question.getQuestionDetail({
        request: {
          id: item.id
        }
      });
      this.setState({
        questionDetail: response.data,
        loadDataResult: dataToReducerResult(response.data)
      });
      //加载评论的头像
      if(response.data.commentList&&response.data.commentList.length>0) {
        let avatars = await ProfileServices.getAllUserAvatars(response.data.commentList.map(x=>x.userId));
        let nextDetail = produce(response.data, draftState=>{
          let index = 0;
          for (let comment of draftState.commentList) {
            comment.avatar = avatars[index];
            index++;
          }
        });
        this.setState({
          questionDetail: nextDetail
        });
      }
    } catch (e) {
      this.setState({
        loadDataResult: dataToReducerResult(e)
      });
    } finally {

    }
  }


  _renderCommentItem = ({item, index}:{item:questionCommentModel,index:number}) => {
    const {userInfo} = this.props;
    return (
        <CommentItem
            item={item}
            iconName={item?.avatar||''}
            authorUserId={item.userId}
            userId={''}
            userName={item.name}
            questionLevel={item.level}
            questionPeans={item.peans}
            floor={index+1}
            content={item.content}
            postDate={item.published}
            //官方闪存评论无法修改
            canModify={false}
            canDelete={item.userId === userInfo.id}
            onComment={(item, userName) => {
              this.setState(
                  {
                    headerTitle: '正在回复  ' + userName,
                    headerSubmit: '@' + userName + ':',
                    selectedCommentItem: item,
                  },
                  () => {
                    console.log(this._commentInput)
                    this._commentInput &&
                    this._commentInput.show();
                  },
              );
            }}
            onDeleteCommentFn={async () => {
              ToastUtils.showLoading();
              try {
                let response = await Api.status.deleteStatusComment({
                  request: {
                    commentId: parseInt(item.id)
                  }
                });
                if(response.data.isSuccess) {
                  ToastUtils.showToast('删除成功!');
                  //刷新当前列表
                  // this.pageIndex = 1;
                  if (this._flatList) {
                    this._flatList && this._flatList._onRefresh();
                  } else {
                    this.loadData();
                  }
                } else {
                  ToastUtils.showToast(response.data.message, {
                    position: ToastUtils.positions.CENTER,
                    type: ToastUtils.types.error
                  });
                }
              } catch (e) {
                ToastUtils.showToast(e.message, {
                  position: ToastUtils.positions.CENTER,
                  type: ToastUtils.types.error
                });
              } finally {
                ToastUtils.hideLoading();
              }
            }}
        />
    );
  };

  onSubmit = (text, callback) => {
    const {answerQuestionFn, item, userInfo} = this.props;
    // let QuestionUserInfo = item.QuestionUserInfo || {};
    // answerQuestionFn({
    //   request: {
    //     id: item.Qid,
    //     loginName: userInfo.BlogApp,
    //     Answer: text,
    //     UserID: QuestionUserInfo.UserID,
    //     //这个不是评论人
    //     UserName: QuestionUserInfo.UserName,
    //   },
    //   successAction: () => {
    //     callback && callback();
    //   },
    // });
  };

  render() {
    const {item, data} = this.props;
    const {questionDetail} = this.state;
    let headerComponent = (
      <View>
        <QuestionItem
            item={{
              ...this.props.item,
              summary: questionDetail?.summary || this.props.item.summary
            }}
            clickable={false}
            selectable={true}
            navigation={this.props.navigation}
        />
        <Text
          style={{marginVertical: 8, color: gColors.color666, marginLeft: 8}}>
          所有回答
        </Text>
      </View>
    );
    return (
      <View style={[Styles.container]}>
        <NavigationBar title='博问' />
        <YZStateView
            loadDataResult={createReducerResult({state: 'content'})}
            placeholderTitle="暂无数据"
            errorButtonAction={this.loadData}>
          {this.state.loadDataResult.success &&
          this.state.questionDetail?.commentList.length == 0 ? (
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
                        colors={[Theme.primaryColor]}
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
                  loadDataResult={this.state.loadDataResult}
                  placeholderTitle="-- 暂无评论 --"
                  errorButtonAction={this.loadData}>
                <YZFlatList
                    ref={ref => (this._flatList = ref)}
                    ListHeaderComponent={headerComponent}
                    renderItem={this._renderCommentItem}
                    data={this.state.questionDetail?.commentList}
                    loadDataResult={this.state.loadDataResult}
                    noMore
                    initialNumToRender={20}
                    loadData={this.loadData}
                    ListFooterComponent={() => <View style={{height: 0, backgroundColor:'transparent'}} />}
                    ItemSeparatorComponent={() => (
                        <View
                            style={{height: 1, backgroundColor: gColors.borderColor}}
                        />
                    )}
                />
              </YZStateView>
          )}
        </YZStateView>
        <YZCommentInput
          ref={ref => (this._commentInput = ref)}
          headerTitle={this.state.headerTitle}
          onSubmit={this.onSubmit}
          onToggle={val=>{
            //关闭时清空标题
            if(!val) {
              this.setState({
                headerTitle: '',
                headerSubmit: ''
              });
            }
          }}
          isLogin={this.props.isLogin}
          placeholder="想说点什么"
          menuComponent={() => (
            <YZCommonActionMenu
              data={this.props.item}
              commentCount={this.props.item.comments}
              serviceType={ServiceTypes.博问}
              showFavButton={false}
              onClickCommentList={() => {
                this._flatList &&
                  this._flatList.flatList.scrollToIndex({
                    viewPosition: 0,
                    index: 0,
                  });
              }}
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
