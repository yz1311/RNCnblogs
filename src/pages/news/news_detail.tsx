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
  Linking, EmitterSubscription,
} from 'react-native';
import {WebView} from 'react-native-webview';
import {connect} from 'react-redux';
import YZCommentInput from '../../components/YZCommentInput';
import YZCommonActionMenu from '../../components/YZCommonActionMenu';
import {Styles} from '../../common/styles';
import {ListRow, NavigationBar, Overlay, Theme} from '@yz1311/teaset';
import PropTypes from 'prop-types';
import moment from 'moment';
import StringUtils from '../../utils/stringUtils';
import CommonUtils from '../../utils/commonUtils';
import YZBackHandler from '../../components/YZBackHandler';
import {ReduxState} from '../../reducers';
import {Api} from "../../api";
import {createReducerResult, dataToReducerResult, ReducerResult, StateView} from "@yz1311/react-native-state-view";
import {newsCommentModel, newsInfoModel, newsModel} from "../../api/news";
import {blogCommentModel} from "../../api/blog";
import {ServiceTypes} from "../YZTabBarView";
import ToastUtils from "../../utils/toastUtils";
import Feather from "react-native-vector-icons/Feather";
import YZSafeAreaView from "../../components/YZSafeAreaView";
import {
  commentEmptyHtmlTemplate,
  commentHtmlTemplate,
  commentMoreHtmlTemplate,
  contentHtmlTemplate
} from "../../common/template";

export interface IProps {
  item?: newsModel;
  navigation: any,
  route: any,
  isLogin?: boolean
}

interface IState {
  data: any;
  imgList: Array<string>,
  loadDataResult: ReducerResult,
  commentList: Array<newsCommentModel>;
  commentList_noMore: boolean;
  getCommentListResult: ReducerResult;
  newsInfo: Partial<newsInfoModel>;
  title: string;
}

@(connect(
  (state: ReduxState) => ({
    isLogin: state.loginIndex.isLogin
  })) as any)
//@ts-ignore
@YZBackHandler
export default class news_detail extends PureComponent<IProps, IState> {
  scrollPosition = 0;
  static propTypes = {
    item: PropTypes.object,
  };

  private fromView: any;
  private overlayKey: any;
  private webView: any;
  private reloadNewsInfoListener: EmitterSubscription;

  constructor(props) {
    super(props);
    this.state = {
      data: {},
      imgList: [],
      loadDataResult: createReducerResult(),
      commentList: [],
      commentList_noMore: false,
      getCommentListResult: createReducerResult(),
      newsInfo: {},
      title: '新闻',
    };
  }

  componentDidMount() {
    this.loadData();
    this.reloadNewsInfoListener = DeviceEventEmitter.addListener('reload_news_info',this.loadCommentsAndInfo);
  }

  componentWillUnmount() {
    //设置滚动位置
    // const {item} = this.props;
    // if (this.scrollPosition > 0) {
    //   this.props.setNewsScrollPositionFn({
    //     id: item.Id,
    //     value: this.scrollPosition,
    //   });
    // }
    this.reloadNewsInfoListener&&this.reloadNewsInfoListener.remove();
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

  loadData = async ()=>{
    Promise.all([
      //新闻详情
      (async ()=>{
        try {
          let response = await Api.news.getNewsDetail({
            request: {
              url: this.props.item.link
            }
          });
          this.setState({
            data: {
              body: response.data.body
            },
            imgList: StringUtils.getImgUrls(response.data.body),
            loadDataResult: dataToReducerResult(response.data.body)
          });
        } catch (e) {
          this.setState({
            loadDataResult: dataToReducerResult(e)
          });
        } finally {

        }
      })(),
      this.loadCommentsAndInfo()
    ])
  }

  loadCommentsAndInfo = ()=>{
    return Promise.all([
      //部分评论(第一页)
      (async ()=>{
        try {
          let response = await Api.news.getNewsCommentList({
            request: {
              pageIndex: 1,
              pageSize: 50,
              commentId: parseInt(this.props.item.id)
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
      //部分评论(第一页)
      (async ()=>{
        try {
          let response = await Api.news.getNewsInfo({
            request: {
              contentId: parseInt(this.props.item.id)
            }
          });
          this.setState({
            newsInfo: response.data,
          });
        } catch (e) {

        } finally {

        }
      })(),
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
        this.props.navigation.navigate('NewsCommentList', {
          pageIndex: 1,
          item: item
        });
        break;
      case 'img_click':
        DeviceEventEmitter.emit('showImageViewer', {
          images: imgList.map(x=>({
            url: x
          })),
          index: imgList.indexOf(postedMessage.url) == -1
              ? 0
              : imgList.indexOf(postedMessage.url),
        });
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
        if (curTitle !== (postedMessage.value >= 50 ? item.title : '新闻')) {
          this.setState({
            title: postedMessage.value >= 50 ? item.title : '新闻',
          });
        }
        break;
    }
  };

  onSubmit = async (text, callback) => {
    ToastUtils.showLoading();
    const {item} = this.props;
    try {
      let response = await Api.news.commentNews({
        request: {
          parentCommentId: 0,
          ContentID: parseInt(item.id),
          strComment: '',
          Content: text,
          title: this.props.item.title
        }
      });
      callback && callback();
      //刷新当前列表
      this.loadData();
    } catch (e) {

    } finally {
      ToastUtils.hideLoading();
    }
  };

  render() {
    const {item} = this.props;
    const {data, commentList} = this.state;
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
    return (
      <YZSafeAreaView>
        <NavigationBar title={this.state.title} rightView={
          <TouchableOpacity
              activeOpacity={activeOpacity}
              style={{paddingHorizontal: 8}}
              ref={ref => (this.fromView = ref)}
              onPress={() => {
                this.showMenu();
              }}>
            <Feather name="more-horizontal" size={32} color={gColors.bgColorF} />
          </TouchableOpacity>
        } />
        <StateView
          loadDataResult={this.state.loadDataResult}
          placeholderTitle="暂无数据"
          errorButtonAction={this.loadData}>
          <View style={{flex: 1, overflow: 'hidden'}}>
            <WebView
              ref={ref => (this.webView = ref)}
              source={{html: html}}
              automaticallyAdjustContentInsets
              scalesPageToFit
              // injectedJavaScript={injectedJsCode}
              onMessage={this._onMessage}
              style={{flex: 1}}
            />
          </View>
        </StateView>
        <YZCommentInput
          onSubmit={this.onSubmit}
          isLogin={this.props.isLogin}
          minLength={3}
          menuComponent={() => (
            <YZCommonActionMenu
              data={this.props.item}
              commentCount={this.state.newsInfo.CommentCount}
              serviceType={ServiceTypes.新闻}
              onClickCommentList={() => {
                this.props.navigation.navigate('NewsCommentList', {
                  pageIndex: 1,
                  item: item
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
