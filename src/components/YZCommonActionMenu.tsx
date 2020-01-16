import React, {Component, PureComponent} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ViewPropTypes,
  Alert,
  Share,
  Animated,
  Easing,
  InteractionManager,
} from 'react-native';
import PropTypes from 'prop-types';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {connect} from 'react-redux';
import {
  addBookmark,
  checkIsBookmark,
  clearBlogIsFav,
  deleteBookmarkByUrl,
  setBlogIsFav,
} from '../actions/bookmark/bookmark_index_actions';
import {showToast} from '../actions/app_actions';
// import LottieView from 'lottie-react-native';
import moment from 'moment';
import {ReduxState} from '../reducers';
import {checkIsBookmarkRequest} from '../api/bookmark';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ToastUtils from "../utils/toastUtils";
import {Api} from "../api";

export interface IProps extends IReduxProps {
  data: any;
  checked?: boolean;
  wrapperStyle?: any;
  commentCount?: number;
  disabled: boolean;
  onClickCommentList?: any;
  onPress?: any;
  size: number;
  showCommentButton: boolean;
  showFavButton: boolean;
  showShareButton: boolean;
  isLogin?: boolean;
  title?: string,
  deleteBookmarkByUrlFn?: any;
  setBlogIsFavFn?: any;
  addBookmarkFn?: any;
}

interface IState {
  starProgress: any;
  isFav: boolean;
}

@(connect(
  (state: ReduxState) => ({
    isLogin: state.loginIndex.isLogin,
  }),
  dispatch => ({
    dispatch,
    clearBlogIsFavFn: data => dispatch(clearBlogIsFav(data)),
    setBlogIsFavFn: data => dispatch(setBlogIsFav(data)),
    addBookmarkFn: data => dispatch(addBookmark(data)),
    deleteBookmarkByUrlFn: data => dispatch(deleteBookmarkByUrl(data)),
  }),
) as any)
export default class YZCommonActionMenu extends PureComponent<IProps, IState> {
  static propTypes = {
    //注意，必须是最外层列表的item
    data: PropTypes.object,
    wrapperStyle: ViewPropTypes.style,
    commentCount: PropTypes.number,
    disabled: PropTypes.bool,
    onClickCommentList: PropTypes.func,
    onPress: PropTypes.any,
    size: PropTypes.number,
    showCommentButton: PropTypes.bool,
    showFavButton: PropTypes.bool,
    showShareButton: PropTypes.bool,
  };

  static defaultProps = {
    disabled: false,
    size: 26,
    showCommentButton: true,
    showFavButton: true,
    showShareButton: true,
  };

  constructor(props) {
    super(props);
    this.state = {
      starProgress: new Animated.Value(0),
      isFav: false
    };
  }

  componentDidMount(): void {
    this.checkIsBookmark();
  }

  checkIsBookmark = async ()=>{
    try {
      let response = await Api.bookmark.checkIsBookmark({
        request: {
          title: this.props.title,
          id: this.props.data.id,
          url: this.props.data.link
        }
      });
      console.log(response.data);
      this.setState({
        isFav: response.data
      });
    } catch (e) {

    }
  }

  favAction = async () => {
    const {data, isLogin} = this.props;
    if (!isLogin) {
      //TODO：返回后重新获取收藏状态
      NavigationHelper.navigate('Login', {
        //登录成功后，重新获取
        callback: () => {
          //Todo:
          // let params: checkIsBookmarkRequest = {
          //   request: {
          //     url: (data.Url || '').replace('http:', 'https:'),
          //   },
          // };
          // this.props.dispatch(checkIsBookmark(params));
        },
      });
      return;
    }
    ToastUtils.showLoading();
    if (this.state.isFav) {
      //由于参数一致，直接统一在本页面操作
      try {
        let response = await Api.bookmark.deleteBookmarkByTitle({
          request: {
            title: this.props.data.title,
          },
        });
        //刷新状态
        this.checkIsBookmark();
        ToastUtils.showToast('取消成功!');
      } catch (e) {

      } finally {
        ToastUtils.hideLoading();
      }
    } else {
      try {
        let response = await Api.bookmark.addBookmark({
          request: {
            url: this.props.data.link,
            title: this.props.data.title,
            summary: '',
            tags: ''
          },
          showLoading: true
        });
        if(response.data.success) {
          //刷新状态
          this.checkIsBookmark();
          ToastUtils.showToast('添加成功!');
        } else {
          ToastUtils.showToast(response.data.message);
        }
      } catch (e) {

      } finally {
        ToastUtils.hideLoading();
      }
    }

    return;
    if (this.state.isFav) {
      Alert.alert('', '是否删除该条收藏?', [
        {
          text: '取消',
        },
        {
          text: '删除',
          onPress: () => {
            //由于参数一致，直接统一在本页面操作
            const {deleteBookmarkByUrlFn, data} = this.props;
            deleteBookmarkByUrlFn({
              request: {
                url: (data.Url || '').replace('http:', 'https:'),
              },
              successAction: () => {
                this.props.setBlogIsFavFn(false);
              },
            });
          },
        },
      ]);
    } else {
      const {data} = this.props;
      NavigationHelper.navigation.navigate('BookmarkModify', {
        item: {
          Title: data.Title,
          //这个接口url返回的是http协议，影响检查是否收藏接口(收藏的链接都是https),所以这个同意改为https
          LinkUrl: (data.Url || '').replace('http:', 'https:'),
        },
        isModify: false,
        title: '添加收藏',
        successAction: () => {
          //返回上一级，并刷新状态
          this.props.setBlogIsFavFn(true);
          // this.props.navigation.goBack();
          NavigationHelper.goBack();
        },
      });
    }
  };

  shareAction = async () => {
    const {data} = this.props;
    if (!data.Title) {
      console.error('分享功能，对象必须具备Title属性');
      return;
    }
    if (!data.Url) {
      console.error('分享功能，对象必须具备Url属性');
      return;
    }
    try {
      const result = await Share.share({
        message: data.Title + ',' + data.Url + ' ---来自博客园',
        title: '分享',
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {

    }
  };

  render() {
    const {
      checked,
      size,
      disabled,
      showCommentButton,
      showFavButton,
      showShareButton,
      onClickCommentList,
      commentCount,
    } = this.props;
    const {isFav,} = this.state;
    let color;
    if (disabled) {
      color = gColors.borderColor;
    } else {
      color = checked ? gColors.themeColor : gColors.color999;
    }
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          alignSelf: 'stretch',
        }}>
        {showCommentButton ? (
          <TouchableOpacity
            activeOpacity={activeOpacity}
            style={{
              alignSelf: 'stretch',
              justifyContent: 'center',
              paddingHorizontal: 8,
              paddingTop: 4,
            }}
            onPress={() => {
              onClickCommentList && onClickCommentList();
            }}>
            <MaterialIcons name="message" size={26} color={gColors.color999} />
            {commentCount > 0 ? (
              <View
                style={{
                  position: 'absolute',
                  right: 4,
                  top: 4,
                  height: 14,
                  borderRadius: 7,
                  justifyContent: 'center',
                  backgroundColor: gColors.colorRed,
                  paddingHorizontal: 4,
                }}>
                <Text
                  style={{fontSize: gFont.size10, color: gColors.bgColorF}}
                  numberOfLines={1}>
                  {commentCount > 99 ? '99' : commentCount}
                </Text>
              </View>
            ) : null}
          </TouchableOpacity>
        ) : null}
        {/*{showFavButton?*/}
        {/*<TouchableOpacity*/}
        {/*activeOpacity={activeOpacity}*/}
        {/*style={{alignSelf:'stretch',justifyContent:'center',paddingHorizontal:6}}*/}
        {/*onPress={this.favAction}*/}
        {/*>*/}
        {/*<MaterialIcons name="star" size={30} color={isFav?gColors.colorRed:gColors.color999} />*/}
        {/*</TouchableOpacity>*/}
        {/*:null}*/}
        {showFavButton ? (
          <TouchableOpacity
            activeOpacity={activeOpacity}
            style={{alignSelf: 'stretch', justifyContent: 'center',paddingTop:5}}
            onPress={this.favAction}>
            <Ionicons name={isFav?'ios-heart':'ios-heart-empty'} size={27} color={isFav?gColors.colorRed:gColors.color999}/>
          </TouchableOpacity>
        ) : null}
        {showShareButton ? (
          <TouchableOpacity
            activeOpacity={activeOpacity}
            style={{
              alignSelf: 'stretch',
              justifyContent: 'center',
              paddingHorizontal: 8,
            }}
            onPress={this.shareAction}>
            <MaterialIcons name="share" size={27} color={gColors.color999} />
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }
}
