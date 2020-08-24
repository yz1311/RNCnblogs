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
import YZStateView from '../../components/YZStateCommonView';
import YZFlatList from '../../components/YZFlatList';
import YZCommentInput from '../../components/YZCommentInput';
import YZCommonActionMenu from '../../components/YZCommonActionMenu';
import {Styles} from '../../common/styles';
import CommentItem from './comment_item';
import {blogCommentModel, blogModel, getBlogCommentListRequest} from '../../api/blog';
import {createReducerResult, dataToPagingResult, dataToReducerResult, ReducerResult} from "../../utils/requestUtils";
import {Api} from "../../api";
import {userInfoModel} from "../../api/login";
import {ReduxState} from "../../models";
import {ServiceTypes} from "../YZTabBarView";
import ToastUtils from "../../utils/toastUtils";
import {NavigationBar} from "@yz1311/teaset";

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
export default class blog_comment_list extends PureComponent<IProps, IState> {
  pageIndex = 1;

  private _commentInput: any;
  private _flatList: any;
  private updateCountListener:EmitterSubscription;

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
  }

  componentWillUnmount() {
    //退出不用清空列表
    this.updateCountListener&&this.updateCountListener.remove();
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
    } catch (e) {
      this.setState({
        loadDataResult: dataToReducerResult(e)
      });
    } finally {

    }
  }

  renderNode = (node, index, siblings, parent, defaultRenderer) => {
    if (node.name === 'fieldset') {
      const a = node.attribs;
      let text = ``;
      let legend = '';
      for (let child of node.children) {
        if (child.type === 'tag') {
          switch (child.name) {
            case 'legend':
              legend = child.children.length > 0 ? child.children[0].data : '';
              break;
            case 'br':
              text += '\n';
              break;
          }
        } else if (child.type === 'text') {
          text += child.data;
        }
      }
      return (
        <View
          style={{
            borderColor: gColors.color999,
            borderWidth: 1,
            borderRadius: 6,
            padding: 8,
          }}>
          <Text>{text}</Text>
          <Text
            style={{
              position: 'absolute',
              top: -7,
              left: 15,
              backgroundColor: gColors.bgColorF,
              fontSize: gFont.size12,
            }}>
            {legend}
          </Text>
        </View>
      );
    }
  };

  _renderItem = ({item, index}: {item: blogCommentModel; index: number}) => {
    const {userInfo} = this.props;
    return (
      <CommentItem
        item={item}
        iconName={item.author?.avatar||''}
        authorUserId={this.props.item.author?.id}
        userId={item.author?.id}
        userName={item.author?.name}
        floor={item.Floor}
        content={item.content}
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
      <View style={[Styles.container]}>
        <NavigationBar title={`${title ? title + '条' : ''}评论`} />
        <YZStateView
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
              <View style={{height: 10, backgroundColor: 'transparent'}} />
            )}
          />
        </YZStateView>
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
      </View>
    );
  }
}

const styles = StyleSheet.create({});
