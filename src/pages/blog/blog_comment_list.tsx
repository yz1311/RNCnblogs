import React, {Component, PureComponent} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {connect} from 'react-redux';
import YZBaseDataPage, {
  IBaseDataPageProps,
} from '../../components/YZBaseDataPage';
import YZStateView from '../../components/YZStateCommonView';
import YZFlatList from '../../components/YZFlatList';
import YZCommentInput from '../../components/YZCommentInput';
import YZCommonActionMenu from '../../components/YZCommonActionMenu';
import Styles from '../../common/styles';
import {showToast} from '../../actions/app_actions';
import {
  clearBlogDetail,
  commentBlog,
  getBlogDetail,
  getBlogCommentList,
  clearBlogCommentList,
} from '../../actions/blog/blog_index_actions';
import PropTypes from 'prop-types';
import StringUtils from '../../utils/stringUtils';
import CommonUtils from '../../utils/commonUtils';
import CommentItem from './comment_item';
import {blogCommentModel, blogModel, getBlogCommentListRequest} from '../../api/blog';
import {createReducerResult, dataToPagingResult, dataToReducerResult, ReducerResult} from "../../utils/requestUtils";
import {APP_CHANGE_NET_INFO} from "../../actions/actionTypes";
import {Api} from "../../api";
import {userInfoModel} from "../../api/login";
import {ReduxState} from "../../models";
import {ServiceTypes} from "../YZTabBarView";

interface IProps extends IBaseDataPageProps {
  blogCommentLists?: {[key: string]: any};
  userInfo?: userInfoModel;
  item: blogModel;
  commentBlogFn?: any;
}

interface IState {
  headerTitle: string,
  headerSubmit: string,
  dataList: Array<blogCommentModel>,
  noMore: boolean,
  loadDataResult: ReducerResult
}

@(connect(
  (state: ReduxState) => ({
    userInfo: state.loginIndex.userInfo
  }),
  dispatch => ({
    dispatch,
    loadDataFn: data => dispatch(getBlogCommentList(data)),
    clearDataFn: data => dispatch(clearBlogCommentList(data)),
    commentBlogFn: data => dispatch(commentBlog(data)),
  }),
) as any)
export default class blog_comment_list extends PureComponent<IProps, IState> {
  pageIndex = 1;

  static navigationOptions = ({navigation}) => {
    let {title} = (navigation.state || {}).params || {title: undefined};
    return {
      headerTitle: `${title ? title + '条' : ''}评论`,
    };
  };

  private _commentInput: any;
  private _flatList: any;

  constructor(props) {
    super(props);
    this.pageIndex = props.pageIndex;
    this.state = {
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
  }

  setTitle = (nextProps:IProps = null) => {
    nextProps = nextProps || this.props;
    nextProps.navigation.setParams({
      title: nextProps.item.comments,
    });
  };

  loadData = async ()=>{
    const {item} = this.props;
    try {
      const params: getBlogCommentListRequest = {
        request: {
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
    console.log(this.props.item)
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
        canModify={false}
        canDelete={(item.author?.id+'') === userInfo.id}
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
          Alert.alert(
            '',
            '官方没有删除博客评论的api，需要跳转到网页登录后删除，是否跳转?',
            [
              {
                text: '取消',
              },
              {
                text: '继续',
                onPress: () => {
                  CommonUtils.openUrl(this.props.item.link);
                },
              },
            ],
          );
        }}
      />
    );
  };

  _onSubmit = (text, callback) => {
    const {commentBlogFn, item} = this.props;
    commentBlogFn({
      request: {
        blogApp: item.blogapp,
        postId: item.id,
        comment: this.state.headerSubmit + '\n\n' + text,
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
    const {dataList, loadDataResult, noMore} = this.state;
    return (
      <View style={[Styles.container]}>
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
