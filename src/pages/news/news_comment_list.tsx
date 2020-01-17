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
import Styles from '../../common/styles';
import {ListRow, Overlay} from '@yz1311/teaset';
import {showToast} from '../../actions/app_actions';
import {
  getNewsCommentList,
  clearNewsCommentList,
  modifyNewsComment,
  deleteNewsComment,
  commentNews,
} from '../../actions/news/news_index_actions';
import PropTypes from 'prop-types';
import StringUtils from '../../utils/stringUtils';
import CommentItem from '../blog/comment_item';
import {ReduxState} from '../../reducers';
import {blogCommentModel, getBlogCommentListRequest} from "../../api/blog";
import {createReducerResult, dataToPagingResult, dataToReducerResult, ReducerResult} from "../../utils/requestUtils";
import {Api} from "../../api";
import {newsCommentModel, newsModel} from "../../api/news";
import {userInfoModel} from "../../api/login";
import {ServiceTypes} from "../YZTabBarView";

interface IProps extends IBaseDataPageProps {
  commentNewsFn?: any;
  modifyNewsCommentFn?: any;
  deleteNewsCommentFn?: any;
  userInfo?: userInfoModel;
  item: newsModel
}

interface IState {
  headerTitle: string;
  headerSubmit: string;
  dataList: Array<blogCommentModel>,
  noMore: boolean,
  loadDataResult: ReducerResult
}

@(connect(
  (state: ReduxState) => ({
    userInfo: state.loginIndex.userInfo,
  }),
  dispatch => ({
    dispatch,
    showToastFn: data => dispatch(showToast(data)),
    loadDataFn: data => dispatch(getNewsCommentList(data)),
    clearDataFn: data => dispatch(clearNewsCommentList(data)),
    commentNewsFn: data => dispatch(commentNews(data)),
    modifyNewsCommentFn: data => dispatch(modifyNewsComment(data)),
    deleteNewsCommentFn: data => dispatch(deleteNewsComment(data)),
  }),
) as any)
export default class news_comment_list extends PureComponent<IProps, IState> {
  pageIndex = 1;

  static propTypes = {
    item: PropTypes.object,
    pageIndex: PropTypes.number,
  };

  static defaultProps = {
    pageIndex: 1,
  };

  static navigationOptions = ({navigation}) => {
    let {title} = (navigation.state || {}).params || {title: undefined};
    return {
      title: `${title ? title + '条' : ''}评论`,
    };
  };

  private reloadListener: EmitterSubscription;
  private _flatList: any;
  private _commentInput: any;

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
      loadDataResult: createReducerResult()
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
  }

  componentWillUnmount() {
    //退出不用清空列表
    this.reloadListener.remove();
  }

  setTitle = (nextProps = undefined) => {
    nextProps = nextProps || this.props;
    nextProps.navigation.setParams({
      title: nextProps.item.CommentCount,
    });
  };

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

  _renderItem = ({item, index}:{item:newsCommentModel,index:number}) => {
    const {userInfo} = this.props;
    return (
      <CommentItem
        item={item}
        iconName={item.author?.uri}
        userId={item.author?.id}
        userName={item.author?.name}
        floor={item.Floor}
        content={item.content}
        postDate={item.published}
        canDelete={item.author?.id === userInfo.id}
        onComment={(item, userName) => {
          this.setState(
            {
              headerTitle: '正在回复  ' + userName,
              headerSubmit: '@' + userName + ':',
            },
            () => {
              this._commentInput &&
                this._commentInput.getWrappedInstance().show();
            },
          );
        }}
        onDeleteCommentFn={() => {
          const {deleteNewsCommentFn} = this.props;
          deleteNewsCommentFn({
            request: {
              id: item.id,
              newsId: this.props.item.id,
            },
          });
        }}
        onModifyComment={(content, successAction, failAction) => {
          const {modifyNewsCommentFn} = this.props;
          modifyNewsCommentFn({
            request: {
              id: item.id,
              Content: content,
              newsId: this.props.item.id,
            },
            successAction: () => {
              //成功后关闭对话框
              successAction && successAction();
            },
          });
        }}
      />
    );
  };

  _onSubmit = (text, callback) => {
    const {commentNewsFn, item} = this.props;
    commentNewsFn({
      request: {
        ParentId: 1,
        newsId: item.id,
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
    return (
      <View style={[Styles.container]}>
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
        <YZCommentInput
          ref={ref => (this._commentInput = ref)}
          headerTitle={this.state.headerTitle}
          onSubmit={this._onSubmit}
          minLength={3}
          placeholder="想说点什么"
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
      </View>
    );
  }
}

const styles = StyleSheet.create({});
