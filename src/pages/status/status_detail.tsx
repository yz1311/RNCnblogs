import React, {Component, PureComponent} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Text,
  Alert,
  Share,
  DeviceEventEmitter,
  ScrollView,
  RefreshControl,
  EmitterSubscription,
} from 'react-native';
import {connect} from 'react-redux';
import YZStateView from '../../components/YZStateCommonView';
import YZFlatList from '../../components/YZFlatList';
import YZBaseDataPage, {
  IBaseDataPageProps,
} from '../../components/YZBaseDataPage';
import YZCommentInput from '../../components/YZCommentInput';
import YZCommonActionMenu from '../../components/YZCommonActionMenu';
import Styles from '../../common/styles';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {ListRow} from '@yz1311/teaset';
import PropTypes from 'prop-types';
import moment from 'moment';
import {
  getStatusDetail,
  clearStatusDetail,
  clearStatusCommentList,
  commentStatus,
  deleteStatusComment,
} from '../../actions/status/status_index_actions';
import StatusItem from './status_item';
import {
  clearBlogIsFav,
  deleteBookmarkByUrl,
} from '../../actions/bookmark/bookmark_index_actions';
import CommentItem from '../blog/comment_item';
import {ReduxState} from '../../reducers';
import {ServiceTypes} from "../YZTabBarView";
import {Api} from "../../api";
import {statusCommentModel, statusModel} from "../../api/status";
import {createReducerResult, dataToReducerResult, ReducerResult} from "../../utils/requestUtils";
import {blogCommentModel} from "../../api/blog";
import ToastUtils from "../../utils/toastUtils";

interface IProps extends IBaseDataPageProps {
  clearStatusCommentListFn?: any;
  userInfo?: any;
  clearBlogIsFavFn?: any;
  item: statusModel;
  deleteStatusCommentFn?: any;
  isFav?: boolean;
  data?: any;
  commentStatusFn?: any;
  isLogin?: boolean;
}

interface IState {
  headerSubmit: string;
  isRefreshing: boolean;
  selectedCommentItem: statusCommentModel;
  headerTitle: string;
  commentList: Array<statusCommentModel>,
  getCommentListResult: ReducerResult,
}

@(connect(
  (state: ReduxState) => ({
    userInfo: state.loginIndex.userInfo,
    isLogin: state.loginIndex.isLogin
  }),
  dispatch => ({
    dispatch,
    loadDataFn: data => dispatch(getStatusDetail(data)),
    clearDataFn: data => dispatch(clearStatusDetail(data)),
    clearStatusCommentListFn: data => dispatch(clearStatusCommentList(data)),
    clearBlogIsFavFn: data => dispatch(clearBlogIsFav(data)),
    commentStatusFn: data => dispatch(commentStatus(data)),
    deleteStatusCommentFn: data => dispatch(deleteStatusComment(data)),
  }),
) as any)
export default class status_detail extends PureComponent<IProps, IState> {
  static navigationOptions = ({navigation}) => {
    return {
      title: '闪存',
    };
  };

  private reloadListener: EmitterSubscription;
  private _commentInput: any;
  private _flatList: any;
  private pageIndex: number;
  private userIdAvatarMap = new Map();

  constructor(props) {
    super(props);
    this.state = {
      isRefreshing: false,
      headerTitle: '',
      headerSubmit: '',
      selectedCommentItem: null,
      commentList: [],
      getCommentListResult: createReducerResult()
    };
  }

  componentDidMount() {
    this.loadData();
    this.reloadListener = DeviceEventEmitter.addListener(
      'reload_status_detail',
      this.loadData,
    );
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (this.props.loadDataResult !== nextProps.loadDataResult) {
      this.setState({
        isRefreshing: false,
      });
    }
  }

  componentWillUnmount() {
    this.reloadListener && this.reloadListener.remove();
  }

  loadData = async ()=>{
    try {
      let imgRes = await Api.status.getStatusCommentList({
        request: {
          id: this.props.item.id,
          userAlias: this.props.item.author?.id
        }
      });
      DeviceEventEmitter.emit('update_status_comment_count',{
        statusId: this.props.item.id,
        commentCount:imgRes.data.length
      });
      //下面的长度就是评论数量
      this.setState({
        commentList: imgRes.data,
        getCommentListResult: dataToReducerResult(imgRes.data)
      });
      //获取头像
      this.getUserAvatar();
    } catch (e) {
      this.setState({
        getCommentListResult: dataToReducerResult(e)
      })
    }
  }

  getUserAvatar = async ()=>{
    for (let index in this.state.commentList) {
      let item = this.state.commentList[index];
      if(!item.author?.avatar || item.author?.avatar=='') {
        if(this.userIdAvatarMap.has((item as statusCommentModel).author?.id)) {
          let nextDateList = [
            ...this.state.commentList.slice(0,parseInt(index)),
            {
              ...item,
              author: {
                ...item.author,
                avatar: this.userIdAvatarMap.get((item as statusCommentModel).author?.id)
              }
            },
            ...this.state.commentList.slice(parseInt(index)+1),
          ];
          this.setState({
            commentList: nextDateList
          })
          continue;
        }
        try {
          let imgRes = await Api.profile.getUserAvatar({
            request: {
              userId: (item as statusCommentModel).author?.id
            }
          });
          this.userIdAvatarMap.set((item as statusCommentModel).author?.id,imgRes.data.avatar);
          let nextDateList = [
            ...this.state.commentList.slice(0,parseInt(index)),
            {
              ...item,
              author: {
                ...item.author,
                avatar: imgRes.data.avatar
              }
            },
            ...this.state.commentList.slice(parseInt(index)+1),
          ];
          this.setState({
            commentList: nextDateList
          })
        } catch (e) {

        }
      }
    }
  }

  _renderCommentItem = ({item, index}:{item:statusCommentModel,index:number}) => {
    const {userInfo} = this.props;
    return (
      <CommentItem
        item={item}
        iconName={item.author?.avatar}
        authorUserId={this.props.item.author?.id}
        userId={item.author?.id}
        userName={item.author?.name}
        floor={item.Floor}
        content={item.summary}
        postDate={item.published}
        //官方闪存评论无法修改
        canModify={false}
        canDelete={item.author?.id === userInfo.id}
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
              this.pageIndex = 1;
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

  _onSubmit = async (text, callback) => {
    const {selectedCommentItem} = this.state;
    try {
       let response = await Api.status.commentStatus({
         request: {
           IngId: parseInt(this.props.item.id),
           ReplyToUserId: parseInt(selectedCommentItem?.author?.no || this.props.item?.author?.no),
           //评论的id，就是回复评论
           ParentCommentId: parseInt(selectedCommentItem?.id || '0'),
           Content: this.state.headerSubmit + '\n\n' + text,
         }
       });
       if(response.data.isSuccess) {
         ToastUtils.showToast('评论成功!');
         callback && callback();
         //刷新当前列表
         this.pageIndex = 1;
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
    }
  };

  render() {
    const {item, isFav} = this.props;
    let headerComponent = (
      <View>
        <StatusItem
          item={{
            ...this.props.item,
            commentCount: this.state.commentList.length
          }}
          clickable={false}
          navigation={this.props.navigation}
        />
        <Text
          style={{marginVertical: 8, color: gColors.color666, marginLeft: 8}}>
          所有评论
        </Text>
      </View>
    );
    return (
      <View style={[Styles.container]}>
        <YZStateView
          loadDataResult={createReducerResult({state: 'content'})}
          placeholderTitle="暂无数据"
          errorButtonAction={this.loadData}>
          {this.state.getCommentListResult.success &&
          this.state.commentList.length == 0 ? (
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
              loadDataResult={this.state.getCommentListResult}
              placeholderTitle="-- 暂无评论 --"
              errorButtonAction={this.loadData}>
              <YZFlatList
                ref={ref => (this._flatList = ref)}
                ListHeaderComponent={headerComponent}
                renderItem={this._renderCommentItem}
                data={this.state.commentList}
                loadDataResult={this.state.getCommentListResult}
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
        </YZStateView>
        <YZCommentInput
          ref={ref => (this._commentInput = ref)}
          headerTitle={this.state.headerTitle}
          onSubmit={this._onSubmit}
          isLogin={this.props.isLogin}
          onToggle={(toggleState:boolean)=>{
            if(toggleState) {
              //关闭的时候，清空选中数据
              this.setState({
                selectedCommentItem: null
              })
            }
          }}
          placeholder="想说点什么"
          menuComponent={() => (
            <YZCommonActionMenu
              data={this.props.item}
              commentCount={this.state.commentList.length}
              serviceType={ServiceTypes.闪存}
              onClickCommentList={() => {
                this._flatList &&
                  this._flatList.flatList.scrollToIndex({
                    viewPosition: 0,
                    index: 0,
                  });
              }}
              showFavButton={false}
              showShareButton={false}
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
