import React, {Component, PureComponent} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert, DeviceEventEmitter, EmitterSubscription,
} from 'react-native';
import {connect} from 'react-redux';
import YZBaseDataPage, {
  IBaseDataPageProps,
} from '../../components/YZBaseDataPage';
import YZFlatList from '../../components/YZFlatList';
import YZCommentInput from '../../components/YZCommentInput';
import YZCommonActionMenu from '../../components/YZCommonActionMenu';
import {Styles} from '../../common/styles';
import CommentItem from './comment_item';
import {blogCommentModel, blogModel, getBlogCommentListRequest} from '../../api/blog';
import {
  createReducerResult,
  dataToPagingResult,
  dataToReducerResult,
  ReducerResult,
  StateView,
} from '@yz1311/react-native-state-view';
import {Api} from "../../api";
import {userInfoModel} from "../../api/login";
import {ReduxState} from "../../models";
import {ServiceTypes} from "../YZTabBarView";
import ToastUtils from "../../utils/toastUtils";
import {NavigationBar} from "@yz1311/teaset";
import YZSafeAreaView from "../../components/YZSafeAreaView";

interface IProps extends IBaseDataPageProps {
  blogCommentLists?: {[key: string]: any};
  userInfo?: userInfoModel;
  item: blogModel;
  isLogin?: boolean
}

interface IState {
  headerTitle: string,
  headerSubmit: string,
  dataList: Array<blogCommentModel>,
  noMore: boolean,
  loadDataResult: ReducerResult;
  title: string;
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
export default class blog_comment_list extends PureComponent<IProps, Partial<IState>> {
  pageIndex = 1;

  private _commentInput: any;
  private _flatList: any;
  private updateCountListener:EmitterSubscription;
  private reloadListener:EmitterSubscription;

  constructor(props) {
    super(props);
    this.pageIndex = props.pageIndex;
    this.state = {
      headerTitle: '',
      headerSubmit: '',
      dataList: [],
      noMore: false,
      loadDataResult: createReducerResult(),
      title: ''
    };
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (this.props.item !== nextProps.item) {
      this.setTitle(nextProps);
    }
  }

  componentDidMount() {
    this.loadData();
    this.setTitle();
    this.updateCountListener = DeviceEventEmitter.addListener('update_blog_comment_count',count=>{
      this.setState({
        title: count
      });
    });
    this.reloadListener = DeviceEventEmitter.addListener('reload_blog_comment_list',count=>{
      this.pageIndex = 1;
      this.loadData();
    });
  }

  componentWillUnmount() {
    //退出不用清空列表
    this.updateCountListener&&this.updateCountListener.remove();
    this.reloadListener&&this.reloadListener.remove();
  }

  setTitle = (nextProps:IProps = null) => {
    nextProps = nextProps || this.props;
    this.setState({
      title: nextProps.item.comments+''
    })
  };

  onRefresh = ()=>{
    this._flatList&&this._flatList._onRefresh();
  }

  loadData = async ()=>{
    const {item} = this.props;
    try {
      const params: getBlogCommentListRequest = {
        request: {
          userId: item.author?.id,
          postId: parseInt(item.id),
          pageIndex: this.pageIndex,
          pageSize: 50,
        },
      };
      let response = await Api.blog.getBlogCommentList(params);
      let pagingResult = dataToPagingResult(this.state.dataList,response.data||[],this.pageIndex,50);
      this.setState({
          ...pagingResult
      });
      if(pagingResult.dataList.length>parseInt(this.state.title)) {
        this.setState({
          title: pagingResult.dataList.length+''
        });
      }
    } catch (e) {
      this.setState({
        loadDataResult: dataToReducerResult(e)
      });
    } finally {

    }
  }

  _renderItem = ({item, index}: {item: blogCommentModel; index: number}) => {
    const {userInfo} = this.props;
    return (
      <CommentItem
        item={item}
        serviceType={ServiceTypes.博客}
        showThumbAction={true}
        iconName={item.author?.avatar||''}
        authorUserId={this.props.item.author?.id}
        userId={item.author?.id}
        userName={item.author?.name}
        floor={item.Floor}
        content={item.content}
        contentId={this.props.item.id}
        postDate={item.published}
        canDelete={(item.author?.id+'') === userInfo.id}
        canModify={(item.author?.id+'') === userInfo.id}
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
        onDeleteCommentFn={async () => {
          ToastUtils.showLoading();
          try {
            let response = await Api.blog.deleteComment({
              request: {
                commentId: parseInt(item.id+''),
                parentId: parseInt(this.props.item.id)
              }
            });
            ToastUtils.showToast('删除成功!');
            DeviceEventEmitter.emit('reload_blog_info');
            setTimeout(()=>{
              this.onRefresh();
            },500);
          } catch (e) {

          } finally {
            ToastUtils.hideLoading();
          }
        }}
        onModifyComment={async (content, successAction, failAction) => {
          ToastUtils.showLoading();
          try {
            let response = await Api.blog.modifyComment({
              request: {
                commentId: parseInt(item.id+''),
                body: content,
              }
            });
            if(response.data.isSuccess) {
              //成功后关闭对话框
              successAction && successAction();
              this.onRefresh();
              ToastUtils.showToast('修改成功!');
              DeviceEventEmitter.emit('reload_blog_info');
            } else {
              ToastUtils.showToast(response.data.message);
            }
          } catch (e) {

          } finally {
            ToastUtils.hideLoading();
          }
        }}
      />
    );
  };

  _onSubmit = async (text, callback) => {
    const {item} = this.props;
    ToastUtils.showLoading();
    try {
      let response = await Api.blog.commentBlog({
        request: {
          userId: item.author?.id,
          postId: parseInt(item.id),
          body: text
        }
      });
      if(response.data.isSuccess) {
        callback && callback();
        //刷新当前列表
        this.pageIndex = 1;
        if (this._flatList) {
          this._flatList && this._flatList._onRefresh();
        } else {
          this.loadData();
        }
        DeviceEventEmitter.emit('reload_blog_info');
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
  };

  render() {
    const {item} = this.props;
    const {dataList, loadDataResult, noMore, title} = this.state;
    return (
      <YZSafeAreaView>
        <NavigationBar title={`${title ? title + '条' : ''}评论`} />
        <StateView
          loadDataResult={loadDataResult}
          placeholderTitle="暂无数据"
          errorButtonAction={this.loadData}>
          <YZFlatList
            ref={ref => (this._flatList = ref)}
            renderItem={this._renderItem}
            data={dataList}
            loadDataResult={loadDataResult}
            noMore={noMore}
            initialNumToRender={20}
            loadData={this.loadData}
            onPageIndexChange={pageIndex => {
              this.pageIndex = pageIndex;
            }}
            ItemSeparatorComponent={() => (
                <View
                    style={{height: 1, backgroundColor: gColors.borderColor}}
                />
            )}
          />
        </StateView>
        <YZCommentInput
          ref={ref => (this._commentInput = ref)}
          headerTitle={this.state.headerTitle}
          isLogin={this.props.isLogin}
          onSubmit={this._onSubmit}
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
              commentCount={this.props.item.comments}
              serviceType={ServiceTypes.博客}
              showCommentButton={false}
              showShareButton={false}
              showFavButton={false}
            />
          )}
        />
      </YZSafeAreaView>
    );
  }
}

const styles = StyleSheet.create({});
