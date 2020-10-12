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
  Linking,
} from 'react-native';
import {connect} from 'react-redux';
import {WebView} from 'react-native-webview';
import YZBackHandler from '../../components/YZBackHandler';
import YZBaseDataPage, {
  IBaseDataPageProps,
} from '../../components/YZBaseDataPage';
import YZCommentInput from '../../components/YZCommentInput';
import YZCommonActionMenu from '../../components/YZCommonActionMenu';
import {Styles} from '../../common/styles';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {ListRow, NavigationBar, Overlay} from '@yz1311/teaset';
import PropTypes from 'prop-types';
import moment from 'moment';
import {
  getKnowledgeBaseDetail,
  clearKnowledgeBaseDetail,
} from '../../actions/knowledgeBase/knowledgeBase_index_actions';
import CommonUtils from '../../utils/commonUtils';
import {ReduxState} from '../../reducers';
import {ServiceTypes} from "../YZTabBarView";
import Feather from "react-native-vector-icons/Feather";
import YZSafeAreaView from "../../components/YZSafeAreaView";
import {StateView} from '@yz1311/react-native-state-view';

export interface IProps extends IBaseDataPageProps {
  data?: any;
  loadDataResult?: any;
  commentList?: any;
  commentList_noMore?: any;
  getCommentListResult?: any;
  item?: any;
  clearBlogCommentListFn?: any;
  commentBlogFn?: any;
  isLogin?: boolean;
  title: string;
}

@(connect(
  (state: ReduxState) => ({
    data: state.knowledgeBaseIndex.kbDetail,
    loadDataResult: state.knowledgeBaseIndex.getKbDetailResult,
    isFav: state.bookmarkIndex.isFav,
    getIsFavResult: state.bookmarkIndex.getIsFavResult,
    isLogin: state.loginIndex.isLogin
  }),
  dispatch => ({
    dispatch,
    loadDataFn: data => dispatch(getKnowledgeBaseDetail(data)),
    clearDataFn: data => dispatch(clearKnowledgeBaseDetail(data)),
  }),
) as any)
//@ts-ignore
@YZBackHandler
export default class knowledgeBase_detail extends YZBaseDataPage<IProps, any> {
  static propTypes = {
    item: PropTypes.object,
  };

  private fromView: any;
  private scrollPosition: any;
  private overlayKey: any;
  private webView: any;

  constructor(props) {
    super(props);
    this.state = {
      comment: '',
      title: '',
    };
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    //设置滚动位置
    const {item} = this.props;
    if (this.scrollPosition > 0) {
      // this.props.setBlogScrollPositionFn({
      //   id: item.Id,
      //   value: this.scrollPosition,
      // });
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
      this.overlayKey = CommonUtils.showRightTopMenus({x,y,width,height}, this.props.item.link, ()=>{
        this.overlayKey = null;
      });
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
        this.props.navigation.navigate('BlogCommentList', {
          pageIndex: 1,
          item: item,
        });
        break;
      case 'img_click':
        DeviceEventEmitter.emit('showImageViewer', {
          images: data.imgList.map(x=>({
            url: x
          })),
          index: data.imgList.indexOf(postedMessage.url) == -1
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
        let curTitle = this.props.route.params.title;
        if (curTitle !== (postedMessage.value >= 50 ? item.Title : '知识库')) {
          this.setState({
            title: postedMessage.value >= 50 ? item.Title : '知识库',
          });
        }
        break;
    }
  };

  render() {
    const {item, data} = this.props;
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
                <span style="color:#666666;font-size: small">${
                  item.Author
                }&nbsp;&nbsp;&nbsp;发布于&nbsp;${item.postDateDesc}</span>
                </div>${data.body}</div>
                </body></html>`;
    //去除最后的统计图片代码，因为会导致下面留下很大空白
    html = html.replace(/<img[\s\S]{1,10}:\/\/counter[\s\S]+?\/>/, '');
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
          loadDataResult={this.props.loadDataResult}
          placeholderTitle="暂无数据"
          errorButtonAction={this.loadData}>
          <View style={{flex: 1, overflow: 'hidden'}}>
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
          editable={false}
          isLogin={this.props.isLogin}
          onSubmit={() => {}}
          menuComponent={() => (
            <YZCommonActionMenu
              data={this.props.item}
              serviceType={ServiceTypes.博客}
              showCommentButton={false}
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
