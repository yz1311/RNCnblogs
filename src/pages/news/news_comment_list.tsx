import React, {Component, PureComponent} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  DeviceEventEmitter,
  EmitterSubscription,
} from 'react-native';
import {connect} from 'react-redux';
import YZBaseDataPage, {
  IBaseDataPageProps,
} from '../../components/YZBaseDataPage';
import YZStateView from '../../components/YZStateCommonView';
import YZCommentInput from '../../components/YZCommentInput';
import YZCommonActionMenu from '../../components/YZCommonActionMenu';
import YZFlatList from '../../components/YZFlatList';
import {Styles} from '../../common/styles';
import PropTypes from 'prop-types';
import CommentItem from '../blog/comment_item';
import {ReduxState} from '../../reducers';
import {blogCommentModel, getBlogCommentListRequest} from "../../api/blog";
import {createReducerResult, dataToPagingResult, dataToReducerResult, ReducerResult} from "../../utils/requestUtils";
import {Api} from "../../api";
import {newsCommentModel, newsModel} from "../../api/news";
import {userInfoModel} from "../../api/login";
import {ServiceTypes} from "../YZTabBarView";
import ToastUtils from "../../utils/toastUtils";
import {NavigationBar} from "@yz1311/teaset";
import produce from 'immer';
import YZSafeAreaView from "../../components/YZSafeAreaView";

interface IProps extends IBaseDataPageProps {
  userInfo?: userInfoModel;
  item: newsModel,
  isLogin?: boolean
}

interface IState {
  headerTitle: string;
  headerSubmit: string;
  dataList: Array<blogCommentModel>,
  noMore: boolean,
  loadDataResult: ReducerResult;
  title: string;
}

@(connect(
  (state: ReduxState) => ({
    userInfo: state.loginIndex.userInfo,
    isLogin: state.loginIndex.isLogin
  })) as any)
export default class news_comment_list extends Component<IProps, IState> {
  pageIndex = 1;

  static propTypes = {
    item: PropTypes.object,
    pageIndex: PropTypes.number,
  };

  static defaultProps = {
    pageIndex: 1,
  };

  private reloadListener: EmitterSubscription;
  private _flatList: any;
  private _commentInput: any;
  private updateDiggCountListener: EmitterSubscription;

  constructor(props) {
    super(props);
    this.pageIndex = props.pageIndex;
    this.reloadListener = DeviceEventEmitter.addListener(
      'reload_news_comment_list',
      () => {
        this.pageIndex = 1;
        this.loadData();
      },
    );
    this.state = {
      ...this.state,
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
    this.updateDiggCountListener = DeviceEventEmitter.addListener('update_news_item_digg_count', ({contentId, commentId, agreeCount, antiCount})=>{
      if(this.props.item.id+'' === contentId+'') {
        console.log(agreeCount+' '+antiCount)
        let nextDataLst = produce(this.state.dataList, draftState => {
          for (let item of draftState) {
            if(item.id+'' === commentId+'') {
              item.agreeCount = agreeCount;
              item.antiCount = antiCount;
            }
          }
        });
        this.setState({
          dataList: nextDataLst
        });
      }
    });
  }

  componentWillUnmount() {
    //退出不用清空列表
    this.reloadListener.remove();
    this.updateDiggCountListener.remove();
  }

  setTitle = (nextProps:IProps = undefined) => {
    nextProps = nextProps || this.props;
    this.setState({
      title: nextProps.item.comments+'',
    });
  };

  onRefresh = ()=>{
    this._flatList&&this._flatList._onRefresh();
  }

  loadData = async ()=>{
    const {item} = this.props;
    try {
      let response = await Api.news.getNewsCommentList({
        request: {
          commentId: parseInt(item.id),
          pageIndex: this.pageIndex,
          pageSize: 50,
        }
      });
      let pagingResult = dataToPagingResult(this.state.dataList,response.data||[],this.pageIndex,50);
      this.setState({
        ...pagingResult
      });
      if(pagingResult.dataList.length>parseInt(this.state.title)) {
        this.setState({
          title: pagingResult.dataList.length+''
        });
      }
      //获取头像
      this.getUserAvatar();
    } catch (e) {
      this.setState({
        loadDataResult: dataToReducerResult(e)
      });
    } finally {

    }
  }

  getUserAvatar = async ()=>{
    for (let index in this.state.dataList) {
      let item = this.state.dataList[index];
      if(!item.author?.avatar || item.author?.avatar=='') {
        try {
          let imgRes = await Api.profile.getUserAvatar({
            request: {
              userId: (item as blogCommentModel).author?.id
            }
          });
          let nextDateList = [
            ...this.state.dataList.slice(0,parseInt(index)),
            {
              ...item,
              author: {
                ...item.author,
                avatar: imgRes.data.avatar
              }
            },
            ...this.state.dataList.slice(parseInt(index)+1),
          ];
          this.setState({
            dataList: nextDateList
          })
        } catch (e) {

        }
      }
    }
  }

  _renderItem = ({item, index}:{item:newsCommentModel,index:number}) => {
    const {userInfo} = this.props;
    return (
      <CommentItem
        item={item}
        serviceType={ServiceTypes.新闻}
        showThumbAction={true}
        iconName={item.author?.avatar}
        userId={item.author?.id}
        userName={item.author?.name}
        floor={item.Floor}
        content={item.content}
        postDate={item.published}
        canDelete={item.author?.name === userInfo.nickName}
        canModify={item.author?.name === userInfo.nickName}
        contentId={this.props.item.id}
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
            let response = await Api.news.deleteNewsComment({
              request: {
                commentId: item.id+''
              }
            });
            this.onRefresh();
            ToastUtils.showToast('删除成功!');
            DeviceEventEmitter.emit('reload_news_info');
          } catch (e) {

          } finally {
            ToastUtils.hideLoading();
          }
        }}
        onModifyComment={async (content, successAction, failAction) => {
          ToastUtils.showLoading();
          try {
            let response = await Api.news.modifyNewsComment({
              request: {
                ContentID: parseInt(this.props.item.id),
                CommentID: item.id+'',
                CommentContent: content,
              }
            });
            //成功后关闭对话框
            successAction && successAction();
            this.onRefresh();
            ToastUtils.showToast('修改成功!');
            DeviceEventEmitter.emit('reload_news_info');
          } catch (e) {

          } finally {
            ToastUtils.hideLoading();
          }
        }}
      />
    );
  };

  _onSubmit = async (text, callback) => {
    ToastUtils.showLoading();
    const {item} = this.props;
    try {
      let response = await Api.news.commentNews({
        request: {
          parentCommentId: 0,
          ContentID: parseInt(item.id),
          strComment: '',
          Content: this.state.headerSubmit + '\n\n' + text,
          title: this.props.item.title
        }
      });
      callback && callback();
      //刷新当前列表
      this.pageIndex = 1;
      if (this._flatList) {
        this._flatList && this._flatList._onRefresh();
      } else {
        this.loadData();
      }
      ToastUtils.showToast('添加成功!');
      DeviceEventEmitter.emit('reload_news_info');
    } catch (e) {

    } finally {
      ToastUtils.hideLoading();
    }
  };

  render() {
    const {title} = this.state;
    console.log(this.state.dataList)
    return (
      <YZSafeAreaView>
        <NavigationBar title={`${title ? title + '条' : ''}评论`} />
        <YZStateView
          loadDataResult={this.state.loadDataResult}
          placeholderTitle="暂无数据"
          errorButtonAction={this.loadData}>
          <YZFlatList
            ref={ref => (this._flatList = ref)}
            renderItem={this._renderItem}
            data={this.state.dataList}
            loadDataResult={this.state.loadDataResult}
            noMore={this.state.noMore}
            initialNumToRender={20}
            loadData={this.loadData}
            onPageIndexChange={pageIndex => {
              this.pageIndex = pageIndex;
            }}
            ItemSeparatorComponent={() => (
              <View style={{height: 10, backgroundColor: 'transparent'}} />
            )}
          />
        </YZStateView>
        <NavigationBar style={{position:'absolute'}} title={`${title ? title + '条' : ''}评论`} />
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
              onClickCommentList={() => {
                this._flatList &&
                  this._flatList.flatList.scrollToIndex({
                    viewPosition: 0,
                    index: 0,
                  });
              }}
              serviceType={ServiceTypes.新闻}
              commentCount={this.props.item.comments}
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
