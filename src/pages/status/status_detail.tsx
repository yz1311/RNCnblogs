import React, {PureComponent} from 'react';
import {
  DeviceEventEmitter,
  EmitterSubscription,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {connect} from 'react-redux';
import YZFlatList from '../../components/YZFlatList';
import {IBaseDataPageProps} from '../../components/YZBaseDataPage';
import YZCommentInput from '../../components/YZCommentInput';
import YZCommonActionMenu from '../../components/YZCommonActionMenu';
import StatusItem from './status_item';
import CommentItem from '../blog/comment_item';
import {ReduxState} from '../../reducers';
import {ServiceTypes} from '../YZTabBarView';
import {Api} from '../../api';
import {statusCommentModel, statusModel} from '../../api/status';
import {
  createReducerResult,
  dataToReducerResult,
  LoadDataResultStates,
  ReducerResult, StateView,
} from '@yz1311/react-native-state-view';
import ToastUtils from '../../utils/toastUtils';
import {NavigationBar, Theme} from '@yz1311/teaset';
import YZSafeAreaView from '../../components/YZSafeAreaView';

interface IProps extends IBaseDataPageProps {
  userInfo?: any;
  item: statusModel;
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
  }),
) as any)
export default class status_detail extends PureComponent<IProps, IState> {

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

  componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<IState>, snapshot?: any) {
    if(this.props.loadDataResult !== prevProps.loadDataResult) {
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
    } catch (e) {
      this.setState({
        getCommentListResult: dataToReducerResult(e)
      })
    } finally {
      this.setState({
        isRefreshing: false
      });
    }
  }

  _renderCommentItem = ({item, index}:{item:statusCommentModel,index:number}) => {
    const {userInfo} = this.props;
    return (
      <CommentItem
        item={item}
        serviceType={ServiceTypes.闪存}
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
      <YZSafeAreaView>
        <NavigationBar title="闪存" />
        <StateView
          loadDataResult={createReducerResult({state: LoadDataResultStates.content})}
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
            <StateView
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
            </StateView>
          )}
        </StateView>
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
      </YZSafeAreaView>
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
