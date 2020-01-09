import React, {Component} from 'react';
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
import {ReduxState} from '../../reducers';
import {blogCommentModel, getBlogCommentListRequest} from '../../api/blog';
import {createReducerResult, reducerModel} from '../../utils/reduxUtils';

interface IProps extends IBaseDataPageProps {
  blogCommentLists?: {[key: string]: reducerModel<blogCommentModel>};
  userInfo?: any;
  item: any;
  commentBlogFn?: any;
}

@(connect(
  (state: ReduxState) => ({
    blogCommentLists: state.blogIndex.blogCommentLists,
    userInfo: state.loginIndex.userInfo,
  }),
  dispatch => ({
    dispatch,
    loadDataFn: data => dispatch(getBlogCommentList(data)),
    clearDataFn: data => dispatch(clearBlogCommentList(data)),
    commentBlogFn: data => dispatch(commentBlog(data)),
  }),
) as any)
export default class blog_comment_list extends YZBaseDataPage<IProps, any> {
  pageIndex = 1;

  static navigationOptions = ({navigation}) => {
    let {title} = (navigation.state || {}).params || {title: undefined};
    return {
      title: `${title ? title + '条' : ''}评论`,
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
    };
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (this.props.item !== nextProps.item) {
      this.setTitle(nextProps);
    }
  }

  componentDidMount() {
    //说明前面已经加载过一次了
    if (this.pageIndex === 1) {
      super.componentDidMount();
    }
    this.setTitle();
  }

  componentWillUnmount() {
    //退出不用清空列表
  }

  setTitle = (nextProps = null) => {
    nextProps = nextProps || this.props;
    nextProps.navigation.setParams({
      title: nextProps.item.CommentCount,
    });
  };

  getParams = () => {
    const {item} = this.props;
    const params: getBlogCommentListRequest = {
      request: {
        blogApp: item.BlogApp,
        postId: item.Id,
        pageIndex: this.pageIndex,
        pageSize: 10,
      },
    };
    return params;
  };

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
        iconName={item.FaceUrl}
        authorUserId={this.props.item.UserId}
        userId={item.UserId}
        userName={item.Author}
        floor={item.Floor}
        content={item.Body}
        postDate={item.DateAdded}
        canModify={false}
        canDelete={item.UserId === userInfo.SpaceUserID}
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
                  CommonUtils.openUrl(this.props.item.Url);
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
        blogApp: item.BlogApp,
        postId: item.Id,
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
    const {item, blogCommentLists} = this.props;
    let noMore = false;
    let loadDataResult = createReducerResult();
    let dataList = [];
    if (blogCommentLists[item.Id + '']) {
      noMore = blogCommentLists[item.Id + ''].noMore;
      loadDataResult = blogCommentLists[item.Id + ''].loadDataResult;
      dataList = blogCommentLists[item.Id + ''].list;
    }
    return (
      <View style={[Styles.container]}>
        <YZStateView
          getResult={loadDataResult}
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
              commentCount={this.props.item.CommentCount}
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
