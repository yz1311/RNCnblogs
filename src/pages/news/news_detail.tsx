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
  Linking,
} from 'react-native';
import {WebView} from 'react-native-webview';
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
import {ListRow, Overlay} from '@yz1311/teaset';
import PropTypes from 'prop-types';
import moment from 'moment';
import {
  getNewsDetail,
  clearNewsDetail,
  commentNews,
  clearNewsCommentList,
  setNewsScrollPosition,
} from '../../actions/news/news_index_actions';
import {
  clearBlogIsFav,
  deleteBookmarkByUrl,
  setBlogIsFav,
} from '../../actions/bookmark/bookmark_index_actions';
import {showToast} from '../../actions/app_actions';
import StringUtils from '../../utils/stringUtils';
import CommonUtils from '../../utils/commonUtils';
import YZBackHandler from '../../components/YZBackHandler';
import {ReduxState} from '../../reducers';

export interface IProps extends IBaseDataPageProps {
  data?: any;
  loadDataResult?: any;
  commentList?: any;
  commentList_noMore?: any;
  getCommentListResult?: any;
  item?: any;
  clearBlogIsFavFn?: any;
  commentNewsFn?: any;
  clearNewsCommentListFn?: any;
  setNewsScrollPositionFn?: any;
}

@(connect(
  (state: ReduxState) => ({
    data: state.newsIndex.newsDetail,
    item: state.newsIndex.selectedNews,
    loadDataResult: state.newsIndex.getNewsDetailResult,
    commentList: state.newsIndex.newsCommentList,
    commentList_noMore: state.newsIndex.newsCommentList_noMore,
    getCommentListResult: state.newsIndex.getNewsCommentListResult,
  }),
  dispatch => ({
    dispatch,
    showToastFn: data => dispatch(showToast(data)),
    loadDataFn: data => dispatch(getNewsDetail(data)),
    clearDataFn: data => dispatch(clearNewsDetail(data)),
    clearBlogIsFavFn: data => dispatch(clearBlogIsFav(data)),
    commentNewsFn: data => dispatch(commentNews(data)),
    clearNewsCommentListFn: data => dispatch(clearNewsCommentList(data)),
    setNewsScrollPositionFn: data => dispatch(setNewsScrollPosition(data)),
  }),
) as any)
//@ts-ignore
@YZBackHandler
export default class news_detail extends YZBaseDataPage<IProps, any> {
  scrollPosition = 0;
  static propTypes = {
    item: PropTypes.object,
  };

  static navigationOptions = ({navigation}) => {
    const {state} = navigation;
    const {title, headerRight} = (state || {}).params || {
      title: undefined,
      headerRight: undefined,
    };
    return {
      title: title || '新闻',
      headerRight: headerRight,
    };
  };

  private fromView: any;
  private overlayKey: any;
  private webView: any;

  constructor(props) {
    super(props);
    this.state = {
      comment: '',
    };
  }

  componentDidMount() {
    super.componentDidMount();
    this.props.navigation.setParams({
      headerRight: (
        <TouchableOpacity
          activeOpacity={activeOpacity}
          style={{paddingHorizontal: 8}}
          ref={ref => (this.fromView = ref)}
          onPress={() => {
            this.showMenu();
          }}>
          <Ionicons name="ios-more" size={32} color={gColors.bgColorF} />
        </TouchableOpacity>
      ),
    });
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    //清空isFav属性
    this.props.clearBlogIsFavFn();
    this.props.clearNewsCommentListFn();
    //设置滚动位置
    const {item} = this.props;
    if (this.scrollPosition > 0) {
      this.props.setNewsScrollPositionFn({
        id: item.Id,
        value: this.scrollPosition,
      });
    }
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
      let popoverStyle = {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        paddingTop: 8,
        paddingBottom: 8,
        // paddingLeft: 12,
        paddingRight: 12,
      };
      y += __IOS__ ? 0 : 15;
      let fromBounds = {x, y, width, height};
      let overlayView = (
        <Overlay.PopoverView
          popoverStyle={popoverStyle}
          fromBounds={fromBounds}
          direction="left"
          align="start"
          directionInsets={4}
          onCloseRequest={() => {
            Overlay.hide(this.overlayKey);
            this.overlayKey = null;
          }}
          showArrow={true}>
          <ListRow
            style={{backgroundColor: 'transparent', width: 140}}
            titleStyle={{color: gColors.bgColorF, textAlign: 'center'}}
            title="复制链接"
            onPress={() => {
              Overlay.hide(this.overlayKey);
              this.overlayKey = null;
              CommonUtils.copyText(this.props.item.Url);
            }}
          />
          <ListRow
            style={{backgroundColor: 'transparent', width: 140}}
            titleStyle={{color: gColors.bgColorF, textAlign: 'center'}}
            title="查看原文"
            onPress={() => {
              Overlay.hide(this.overlayKey);
              this.overlayKey = null;
              CommonUtils.openUrl(this.props.item.Url);
            }}
          />
          <ListRow
            style={{backgroundColor: 'transparent', width: 140}}
            titleStyle={{color: gColors.bgColorF, textAlign: 'center'}}
            title="分享"
            bottomSeparator={null}
            onPress={() => {
              Overlay.hide(this.overlayKey);
              this.overlayKey = null;
              CommonUtils.share('', this.props.item.Url);
            }}
          />
        </Overlay.PopoverView>
      );
      this.overlayKey = Overlay.show(overlayView);
    });
  };

  getParams = () => {
    const {item} = this.props;
    const params = {
      request: {
        id: item.Id,
      },
      url: item.Url,
      item: item,
    };
    return params;
  };

  _onMessage = event => {
    console.log(event.nativeEvent.data);
    let postedMessage = event.nativeEvent.data;
    try {
      postedMessage = JSON.parse(event.nativeEvent.data);
    } catch (e) {}
    const {item, data} = this.props;
    switch (postedMessage.type) {
      case 'loadMore':
        this.props.navigation.navigate('NewsCommentList', {
          pageIndex: 1,
          // item: item
        });
        break;
      case 'img_click':
        DeviceEventEmitter.emit('showImgList', {
          imgList: data.imgList,
          imgListIndex:
            data.imgList.indexOf(postedMessage.url) == -1
              ? 0
              : data.imgList.indexOf(postedMessage.url),
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
        let curTitle = this.props.navigation.state.params.title;
        if (curTitle !== (postedMessage.value >= 50 ? item.Title : '新闻')) {
          this.props.navigation.setParams({
            title: postedMessage.value >= 50 ? item.Title : '新闻',
          });
        }
        break;
    }
  };

  onSubmit = (text, callback) => {
    const {commentNewsFn, item} = this.props;
    commentNewsFn({
      request: {
        ParentId: 1,
        newsId: item.Id,
        Content: text,
      },
      successAction: () => {
        callback && callback();
        //刷新当前列表
        this.loadData();
      },
    });
  };

  render() {
    const {item, data, commentList} = this.props;
    //截取前10条记录进行显示
    let visibleCommentList = commentList.slice(0, 10);
    let showMoreButton = visibleCommentList.length === 10;
    let commentHtml = ``;
    if (commentList.length === 0) {
      commentHtml = `<div style="margin-top: 30px;display: flex;flex-direction: column;align-items: center;color:${
        gColors.color666
      }">-- 暂无评论 --</div>`;
    } else {
      commentHtml = `<div style="display: flex;flex-direction: column;">`;
      for (let comment of visibleCommentList) {
        commentHtml += `
                    <div style="display: flex; flex-direction: row;padding-top: 10px;">
                        <img 
                        style="width: 40px;height: 40px; border-radius: 20px;border-width: 1px;border-color: #999999;"
                        src="${comment.FaceUrl ||
                          'https://pic.cnblogs.com/avatar/simple_avatar.gif'}" />
                        <div style="display: flex; margin-left: 10px;flex-direction: column;flex: 1;">
                            <span style="font-weight: bold;">
                                <span style="color: salmon;">#${
                                  comment.Floor
                                }楼</span>&nbsp;&nbsp;
                                <span>${comment.UserName}</span>
                            </span>
                            <span style="font-size: 15px;color: #666666;margin-top: 8px;">${
                              comment.CommentContent
                            }</span>
                            <span style="font-size: 15px;color: #999999;margin-top: 8px;">${StringUtils.formatDate(
                              comment.DateAdded,
                            )}</span>
                            <div style="height: 1px;background-color: #999999;margin-top: 10px;"></div>
                        </div>
                    </div>
                `;
      }
      commentHtml += `</div>`;
      if (showMoreButton) {
        commentHtml += `<div 
                                onclick="window['ReactNativeWebView'].postMessage(JSON.stringify({
                                    type: 'loadMore'
                                }))"
                                style="display: flex;height: 50px;justify-content: center;align-items: center;">
                                <span style="color:${
                                  gColors.themeColor
                                };font-size: medium;">点击查看全部评论</span>
                            </div>`;
      }
    }
    let html = `<html>
                <head>
                <meta name="viewport" content="width=device-width,initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
                <style type="text/css">
                    img {
                        height: auto; 
                        width: 100%;
                        max-width: 100%;
                    }
                    pre {
                        background-color: #f5f5f5;
                        font-family: Courier New!important;
                        font-size: 12px!important;
                        border: 1px solid #ccc;
                        padding: 5px;
                        overflow: auto;
                        margin: 5px 0;
                        color: #000;
                    }
                </style>
                <script>
                    window.onload = function(){  
                        var imgs = document.getElementsByTagName("img");
                        for (let i=0;i<imgs.length;i++) {
                            imgs[i].onclick = function(){
                                window['ReactNativeWebView'].postMessage(JSON.stringify({
                                    type: 'img_click',
                                    url: imgs[i].src
                                }))
                            }
                        }
                        var links = document.getElementsByTagName("a");
                        for (let i=0;i<links.length;i++) {
                            links[i].onclick = function(){
                                window['ReactNativeWebView'].postMessage(JSON.stringify({
                                    type: 'link_click',
                                    url: links[i].href
                                }));
                                return false;
                            }
                        }
                        /*记录滚动位置*/
                        window.onscroll = function() {
                            var scrollPos = window.scrollY || window.scrollTop || document.getElementsByTagName("html")[0].scrollTop;
                            try {
                                window['ReactNativeWebView'].postMessage(JSON.stringify({
                                type: 'scroll_position',
                                value: scrollPos
                                }));
                            } catch (error) {
                                
                            }
                        }
                        if(${data.scrollPosition} > 0)
                        {
                           window.scrollTo(0,${data.scrollPosition});
                        }
                    };
                </script>
                </head>
                <body style="padding: 0px;margin: 8px;"><div><div><h3>${
                  item.Title
                }</h3>
                <span style="color:#666666;font-size: small">发布于&nbsp;${
                  item.postDateDesc
                }</span>
                </div>${data.body}</div>
                <div style="background-color: #f2f2f2;padding: 10px;color: #666;font-size: medium;margin: 10px -8px 10px -8px;">评论列表</div>
                ${commentHtml}
                </body>
                </html>`;
    return (
      <View style={[Styles.container]}>
        <YZStateView
          loadDataResult={this.props.loadDataResult}
          placeholderTitle="暂无数据"
          errorButtonAction={this.loadData}>
          <View style={{flex: 1, overflow: 'hidden'}}>
            <WebView
              ref={ref => (this.webView = ref)}
              source={{html: html}}
              automaticallyAdjustContentInsets
              scalesPageToFit
              useWebKit={true}
              // injectedJavaScript={injectedJsCode}
              onMessage={this._onMessage}
              style={{flex: 1}}
            />
          </View>
        </YZStateView>
        <YZCommentInput
          onSubmit={this.onSubmit}
          minLength={3}
          menuComponent={() => (
            <YZCommonActionMenu
              data={this.props.item}
              commentCount={this.props.item.CommentCount}
              onClickCommentList={() => {
                this.props.navigation.navigate('NewsCommentList', {
                  pageIndex: 1,
                  // item: item
                });
              }}
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
