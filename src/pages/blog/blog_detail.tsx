import React, {Component, PureComponent} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Text,
  Alert,
  TextInput,
  Share,
  DeviceEventEmitter,
  Linking, EmitterSubscription, InteractionManager,
} from 'react-native';
import {connect} from 'react-redux';
import {WebView} from 'react-native-webview';
import YZCommonActionMenu from '../../components/YZCommonActionMenu';
import YZCommentInput from '../../components/YZCommentInput';
import {Styles} from '../../common/styles';
import {ListRow, NavigationBar, Overlay, Theme} from '@yz1311/teaset';
import PropTypes from 'prop-types';
import moment from 'moment';
import StringUtils from '../../utils/stringUtils';
import CommonUtils from '../../utils/commonUtils';
import YZBackHandler from '../../components/YZBackHandler';
import {ReduxState} from '../../reducers';
import {blogCommentModel, blogModel, getBlogDetailRequest} from '../../api/blog';
import {Api} from "../../api";
import {createReducerResult, dataToReducerResult, ReducerResult, StateView} from '@yz1311/react-native-state-view';
import ToastUtils from "../../utils/toastUtils";
import {ServiceTypes} from "../YZTabBarView";
import Feather from "react-native-vector-icons/Feather";
import ServiceUtils from "../../utils/serviceUtils";
import YZSafeAreaView from "../../components/YZSafeAreaView";
import {
  commentEmptyHtmlTemplate,
  commentHtmlTemplate,
  commentMoreHtmlTemplate,
  contentHtmlTemplate
} from "../../common/template";

const injectedJsCode = `var headArr = document.getElementsByTagName('head');
            var meta = document.createElement('meta');
            meta.name = 'viewport';
            meta.content = 'width=device-width, initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no';
            headArr[0].appendChild(meta);
            var bodyArr = document.getElementsByTagName('body');

             bodyArr[0].style.padding='0px 0px 0px 0px';
            `;

// const injectedJsCode = `const meta = document.createElement(‘meta’);
// meta.setAttribute(‘content’, ‘width=device-width, initial-scale=0.5, maximum-scale=0.5, user-scalable=0’);
// meta.setAttribute(‘name’, ‘viewport’);
// document.getElementsByTagName(‘head’)[0].appendChild(meta); `

export interface IProps {
  // data?: any,
  // loadDataResult?: any,
  item?: blogModel;
  setBlogScrollPositionFn?: any;
  navigation?: any;
  route?: any;
  isLogin?: boolean,
}


interface IState {
  blogDetail: string;
  imgList: Array<string>,
  getDetailResult: ReducerResult,
  commentList?: Array<blogCommentModel>;
  commentList_noMore?: boolean;
  getCommentListResult?: ReducerResult;
  postId: string;
  commentCount: number;
  html: string;
  title: string;
}

@(connect(
  (state: ReduxState) => ({
    isLogin: state.loginIndex.isLogin
  })) as any)
// @ts-ignore
@YZBackHandler
export default class blog_detail extends PureComponent<IProps, IState> {
  scrollPosition = 0;
  static propTypes = {
    item: PropTypes.object,
  };

  private fromView: any;
  private overlayKey: any;
  private webView: any;
  private reloadBlogInfoListener:EmitterSubscription;

  constructor(props:IProps) {
    super(props);
    this.state = {
      blogDetail: '',
      imgList: [],
      getDetailResult: createReducerResult(),
      commentList: [],
      commentList_noMore: false,
      getCommentListResult: createReducerResult(),
      postId: '',
      commentCount: props.item?.comments,
      html: '',
      title: '博文',
    };
  }

  componentDidMount() {
    InteractionManager.runAfterInteractions(()=>{
      this.loadData();
    });
    this.reloadBlogInfoListener = DeviceEventEmitter.addListener('reload_blog_info',this.getOtherData);
  }

  componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<IState>, snapshot?: any) {
    if(this.state.blogDetail !== prevState.blogDetail ||
        this.state.commentList !== prevState.commentList) {
      if (!this.state.blogDetail || !this.state.getCommentListResult.success) {
        return;
      }
      const {item} = this.props;
      const {getDetailResult, blogDetail, commentList} = this.state;
      let data: any = {
        body: blogDetail
      };
      //截取前10条记录进行显示
      let visibleCommentList = commentList.slice(0, 10);
      let showMoreButton = visibleCommentList.length === 10;
      let commentHtml = ``;
      if (commentList.length === 0) {
        commentHtml = commentEmptyHtmlTemplate();
      } else {
        commentHtml = `<div style="display: flex;flex-direction: column;">`;
        for (let comment of visibleCommentList) {
          commentHtml += commentHtmlTemplate({
            avatar: comment.author?.avatar,
            Floor: comment.Floor,
            userName: comment.author?.name,
            content: comment.content,
            dateDesc: StringUtils.formatDate(
                moment(comment.published).format('YYYY-MM-DD HH:mm'))
          });
        }
        commentHtml += `</div>`;
        if (showMoreButton) {
          commentHtml += commentMoreHtmlTemplate({color: Theme.primaryColor});
        }
      }
      let html = contentHtmlTemplate({
        title: item.title,
        avatar: item.author?.avatar,
        userName: item.author?.name,
        dateDesc: moment(item.published).format('YYYY-MM-DD HH:mm'),
        body: data.body,
        scrollPosition: data.scrollPosition,
        commentHtml: commentHtml,
      });
      this.setState({
        html
      });
    }
  }

  componentWillUnmount() {
    //设置滚动位置
    // const {item} = this.props;
    // if (this.scrollPosition > 0) {
    //   this.props.setBlogScrollPositionFn({
    //     id: item.id,
    //     value: this.scrollPosition,
    //   });
    // }
    this.reloadBlogInfoListener&&this.reloadBlogInfoListener.remove();
  }

  _onBack = () => {
    if (this.overlayKey) {
      Overlay.hide(this.overlayKey);
      this.overlayKey = null;
      return true;
    }
    this.props.navigation.goBack();
    return true;
  };

  showMenu = () => {
    this.fromView.measureInWindow((x, y, width, height) => {
      this.overlayKey = CommonUtils.showRightTopMenus({x,y,width,height}, this.props.item.link, ()=>{
        this.overlayKey = null;
      });
    });
  };

  loadData = ()=>{
    Promise.all([
      //博客详情
      (async ()=>{
        try {
          let response = await Api.blog.getBlogDetail({
            request: {
              url: this.props.item.link+''
            }
          });
          this.setState({
            blogDetail: response.data.body,
            postId: response.data.id,
            imgList: StringUtils.getImgUrls(response.data.body),
            getDetailResult: dataToReducerResult(response.data.body)
          });
          this.getOtherData(response.data.id);
        } catch (e) {
          this.setState({
            getDetailResult: dataToReducerResult(e)
          });
        } finally {

        }
      })(),
    ]);

  }

  getOtherData = async (postId:string = this.state.postId)=>{
    Promise.all([
      //部分评论(第一页)
      (async ()=>{
        try {
          let response = await Api.blog.getBlogCommentList({
            request: {
              pageIndex: 1,
              pageSize: 10,
              userId: this.props.item.author?.id,
              postId: parseInt(postId)
            }
          });
          this.setState({
            commentList: response.data,
            getCommentListResult: dataToReducerResult(response.data)
          });
        } catch (e) {
          this.setState({
            getCommentListResult: dataToReducerResult(e)
          });
        } finally {

        }
      })(),
      (async ()=>{
        try {
          let response = await Api.blog.getBlogCategoryAndTags({
            request: {
              userId: this.props.item.author?.id,
              //Todo:搜索列表，还没有blogapp
              blogId: this.props.item.blogapp,
              postId: postId
            }
          });

        } catch (e) {

        } finally {

        }
      })(),
      (async ()=>{
        try {
          let response = await Api.blog.getBlogCommentCount({
            request: {
              userId: this.props.item.author?.id,
              postId: postId
            }
          });
          this.setState({
            commentCount: response.data
          });
          DeviceEventEmitter.emit('update_blog_comment_count',response.data);
        } catch (e) {

        } finally {

        }
      })()
    ])
  }

  _onMessage = event => {
    let postedMessage = event.nativeEvent.data;
    try {
      postedMessage = JSON.parse(event.nativeEvent.data);
    } catch (e) {}
    const {item} = this.props;
    const {imgList} = this.state;
    switch (postedMessage.type) {
      case 'loadMore':
        NavigationHelper.push('BlogCommentList', {
          pageIndex: 1,
          item: {
            ...item,
            comments: this.state.commentCount
          },
        });
        break;
      case 'img_click':
        if(postedMessage.url&&postedMessage.url.indexOf('https://pic.cnblogs.com/avatar/')>=0) {
          //获取用户详情
          let filter = this.state.commentList.filter(x=>x.author?.avatar === postedMessage.url)[0];
          if(filter) {
            ServiceUtils.viewProfileDetail(
                gStore.dispatch,
                filter.author?.id,
                filter.author?.name,
                filter.author?.avatar,
            );
          }
        } else {
          DeviceEventEmitter.emit('showImageViewer', {
            images: imgList.map(x=>({
              url: x
            })),
            index: imgList.indexOf(postedMessage.url) == -1
                ? 0
                : imgList.indexOf(postedMessage.url),
          });
        }
        break;
      case 'link_click':
        Linking.canOpenURL(postedMessage.url).then(supported => {
          if (supported) {
            // Linking.openURL(postedMessage.url);
            this.props.navigation.navigate('YZWebPage', {
              uri: postedMessage.url,
              title: '详情',
            });
          } else {
            console.log('无法打开该URL:' + postedMessage.url);
          }
        });
        break;
      case 'scroll_position':
        this.scrollPosition = postedMessage.value;
        let curTitle = this.props.route.params.title;
        if (curTitle !== (postedMessage.value >= 50 ? item.title : '博文')) {
          this.setState({
            title: postedMessage.value >= 50 ? item.title : '博文',
          });
        }
        break;
    }
  };

  onSubmit = async (text, callback) => {
    const {item} = this.props;
    ToastUtils.showLoading();
    try {
      let response = await Api.blog.commentBlog({
        request: {
          userId: item.author?.id,
          postId: parseInt(this.state.postId),
          body: text
        }
      });
      if(response.data.isSuccess) {
        callback && callback();
        //刷新当前列表
        this.loadData();
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
    const {getDetailResult, html} = this.state;
    return (
      <YZSafeAreaView>
        <NavigationBar
            title={this.state.title}
            rightView={
              <TouchableOpacity
                  activeOpacity={activeOpacity}
                  style={{paddingHorizontal: 8}}
                  ref={ref => (this.fromView = ref)}
                  onPress={() => {
                    this.showMenu();
                  }}>
                <Feather name="more-horizontal" size={32} color={gColors.bgColorF} />
              </TouchableOpacity>
            }
        />
        <StateView
          loadDataResult={getDetailResult}
          placeholderTitle="暂无数据"
          errorButtonAction={this.loadData}>
          <View style={{flex: 1}}>
            <WebView
              ref={ref => (this.webView = ref)}
              source={{html: html}}
              // automaticallyAdjustContentInsets
              // scalesPageToFit={false}
              javaScriptEnabled={true}
              onMessage={this._onMessage}
              // injectedJavaScript={injectedJsCode}
              style={{flex: 1}}
            />
          </View>
        </StateView>
        <YZCommentInput
          onSubmit={this.onSubmit}
          isLogin={this.props.isLogin}
          menuComponent={() => (
            <YZCommonActionMenu
              data={this.props.item}
              title={this.props.item.title}
              commentCount={this.state.commentCount}
              serviceType={ServiceTypes.博客}
              onClickCommentList={() => {
                NavigationHelper.push('BlogCommentList', {
                  pageIndex: 1,
                  item: {
                    ...item,
                    id: this.state.postId
                  },
                });
              }}
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
