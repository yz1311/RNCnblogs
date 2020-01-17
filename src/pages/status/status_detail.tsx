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

interface IProps extends IBaseDataPageProps {
  clearStatusCommentListFn?: any;
  userInfo?: any;
  clearBlogIsFavFn?: any;
  item: statusModel;
  deleteStatusCommentFn?: any;
  isFav?: boolean;
  data?: any;
  commentStatusFn?: any;
}

interface IState {
  headerSubmit: string;
  isRefreshing: boolean;
  selectedCommentItem: any;
  headerTitle: string;
  commentList: Array<statusCommentModel>,
  getCommentListResult: ReducerResult,
}

@(connect(
  (state: ReduxState) => ({
    userInfo: state.loginIndex.userInfo,
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
          userAlias: ''
        }
      });
      this.setState({
        commentList: imgRes.data,
        getCommentListResult: dataToReducerResult(imgRes.data)
      });
    } catch (e) {
      this.setState({
        getCommentListResult: dataToReducerResult(e)
      })
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
        canModify={false}
        canDelete={item.author?.id === userInfo.SpaceUserID}
        onComment={(item, userName) => {
          this.setState(
            {
              headerTitle: '正在回复  ' + userName,
              headerSubmit: '@' + userName + ':',
              selectedCommentItem: item,
            },
            () => {
              this._commentInput &&
                this._commentInput.getWrappedInstance().show();
            },
          );
        }}
        onDeleteCommentFn={() => {
          const {deleteStatusCommentFn} = this.props;
          deleteStatusCommentFn({
            request: {
              statusId: this.props.item.id,
              commentId: item.id,
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
      />
    );
  };

  _onSubmit = (text, callback) => {
    const {commentStatusFn, item} = this.props;
    const {selectedCommentItem} = this.state;
    commentStatusFn({
      request: {
        ReplyTo: '0',
        ParentCommentId: selectedCommentItem ? selectedCommentItem.Id : '0',
        statusId: item.id,
        Content: this.state.headerSubmit + '\n\n' + text,
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
    const {item, isFav} = this.props;
    let headerComponent = (
      <View>
        <StatusItem
          item={this.props.item}
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
          placeholder="想说点什么"
          menuComponent={() => (
            <YZCommonActionMenu
              data={this.props.item}
              commentCount={this.props.item.commentCount}
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
