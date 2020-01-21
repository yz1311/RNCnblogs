import React, {Component, PureComponent} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  DeviceEventEmitter,
  InteractionManager,
  RefreshControl, findNodeHandle,
} from 'react-native';
import Styles from '../../common/styles';
import {ListRow, NavigationBar, Theme} from '@yz1311/teaset';
import {connect} from 'react-redux';
import {
  getPersonInfo,
  clearPersonInfo,
  getPersonSignature,
  getPersonBlogList,
  clearPersonBlogList,
} from '../../actions/profile/profile_index_actions';
import Entypo from 'react-native-vector-icons/Entypo';
import PropTypes from 'prop-types';
import YZBaseDataPage, {
  IBaseDataPageProps,
} from '../../components/YZBaseDataPage';
import YZStateView from '../../components/YZStateCommonView';
import YZFlatList from '../../components/YZFlatList';
import BlogItem from '../blog/blog_item';
import CommonUtils from '../../utils/commonUtils';
import {ReduxState} from '../../reducers';
import {userInfoModel} from "../../api/login";
import {createReducerResult, dataToPagingResult, dataToReducerResult, ReducerResult} from "../../utils/requestUtils";
import {Api} from "../../api";
import {fullUserInfoModel} from "../../api/profile";
import { BlurView } from "react-native-blur";
import ToastUtils from "../../utils/toastUtils";
import YZStickyTabView from '../../components/YZStickyTabView';
import {BlogTypes} from "../home/home_index";
import {blogModel} from "../../api/blog";
import ProfilePersonTab from './profile_person_tab';

const avatorRadius = 40;

interface IProps extends IReduxProps {
  userAlias: string;
  avatorUrl: string;
  navigation?: any;
}

interface IState {
  viewRef: any,
  isRefreshing: boolean;
  personInfo: Partial<fullUserInfoModel>,
  loadDataResult: ReducerResult,
  blogList: Array<blogModel>,
  loadBlogListResult: ReducerResult,
  blogListNoMore: boolean
}

@(connect(
  (state: ReduxState) => ({
    userInfo: state.loginIndex.userInfo,
    isLogin: state.loginIndex.isLogin,
  }),
  dispatch => ({
    dispatch,
  }),
) as any)
export default class profile_person extends PureComponent<IProps, IState> {
  static propTypes = {
    userAlias: PropTypes.string.isRequired,
    avatorUrl: PropTypes.string.isRequired,
  };

  static navigationOptions = ({navigation}) => {
    let {title} = (navigation.state || {}).params || {title: undefined};
    return {
      // title: title || '园友',
      headerShown: false
    };
  };

  pageIndex = 1;
  private namePositionY;
  private backgroundImage:any;
  private stickyTabViewRef: YZStickyTabView;
  private selectedTab: number = 0;
  private blogPageIndex = 1;

  constructor(props) {
    super(props);
    this.state = {
      isRefreshing: false,
      personInfo: {},
      loadDataResult: createReducerResult(),
      viewRef: null,
      blogList: [],
      loadBlogListResult: createReducerResult(),
      blogListNoMore: false
    };
  }

  componentDidMount() {
    this.loadData();
  }

  loadData = async () => {
    try {
      let response = await Api.profile.getFullUserInfo({
        request: {
          userId: this.props.userAlias
        }
      });
      this.setState({
        personInfo: response.data,
        loadDataResult: dataToReducerResult(response.data)
      });
    } catch (e) {
      this.setState({
        loadDataResult: dataToReducerResult(e)
      });
    } finally {

    }
  }

  componentWillUnmount() {

  }

  star = async ()=>{
    ToastUtils.showLoading();
    try {
      let response = await Api.profile.followUser({
        request: {
          userUuid: this.state.personInfo.uuid
        }
      });
      if(response.data.IsSucceed) {
        ToastUtils.showToast('关注成功!');
        this.loadData();
      } else {
        ToastUtils.showToast('操作失败!');
      }
    } catch (e) {

    } finally {
      ToastUtils.hideLoading();
    }
  }

  unstar = async ()=>{
    ToastUtils.showLoading();
    try {
      let response = await Api.profile.unfollowUser({
        request: {
          userUuid: this.state.personInfo.uuid
        }
      });
      if(response.data.IsSucceed) {
        ToastUtils.showToast('取消成功!');
        this.loadData();
      } else {
        ToastUtils.showToast('操作失败!');
      }
    } catch (e) {

    }  finally {
      ToastUtils.hideLoading();
    }
  }

  _renderHeader = () => {
    const {avatorUrl} = this.props;
    const {personInfo} = this.state;
    return (
      <YZStateView
        loadDataResult={this.state.loadDataResult}
        placeholderTitle="暂无数据"
        errorButtonAction={this.loadData}>
        <View style={{}}>
          <Image
              ref={img => {
                this.backgroundImage = img;
              }}
              source={{ uri: personInfo.avatar }}
              style={{width:Theme.deviceWidth,height:150}}
              onLoadEnd={()=>{
                this.setState({ viewRef: findNodeHandle(this.backgroundImage) });
              }}
          />
          <BlurView
              style={{position:'absolute',top:0,left:0,right:0,bottom:0}}
              viewRef={this.state.viewRef}
              blurType="light"
              blurAmount={10}
          />
        </View>
        <View
          style={{paddingTop: avatorRadius, borderRadius: 10, marginTop: -avatorRadius}}>
          <View
            style={{
              paddingHorizontal: 8,
              paddingTop: avatorRadius,
              paddingBottom: 15,
              backgroundColor: gColors.bgColorF,
            }}>
            <View>
              <View style={{flexDirection:'row',justifyContent:"space-between", marginTop: 10,}}>
                <Text
                  style={{
                    fontSize: gFont.size20,
                  }}>
                  {personInfo.name}
                </Text>
                <TouchableOpacity
                    onPress={()=>{
                      if(personInfo.isStar) {
                        this.unstar();
                      } else {
                        this.star();
                      }
                    }}
                  style={{width:80,height:30,borderWidth:1,borderColor:gColors.colorGreen1,
                    backgroundColor:personInfo.isStar?gColors.colorGreen1:gColors.bgColorF,justifyContent:'center',alignItems:'center'}}
                  >
                  <Text style={{color:personInfo.isStar?gColors.bgColorF:gColors.colorGreen1,fontSize:gFont.size13}}>{personInfo.isStar?'已关注':'关注'}</Text>
                </TouchableOpacity>
              </View>
              <View
                onLayout={({nativeEvent}) => {
                  this.namePositionY =
                    nativeEvent.layout.y + nativeEvent.layout.height;
                }}
                style={{flexDirection: 'row', marginTop: 10,width: 220}}>
                <TouchableOpacity
                    onPress={()=>{
                      NavigationHelper.push('StarList', {
                        userId: this.props.userAlias
                      });
                    }}
                  style={{flex: 1, alignItems: 'center'}}>
                  <Text style={styles.titleDesc}>{personInfo.stars}</Text>
                  <Text style={styles.title}>关注</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={()=>{
                      NavigationHelper.push('FollowerList', {
                        userId: this.props.userAlias
                      });
                    }}
                  style={{flex: 1,  alignItems: 'center'}}>
                  <Text style={styles.titleDesc}>{personInfo.follows}</Text>
                  <Text style={styles.title}>粉丝</Text>
                </TouchableOpacity>
                <View
                    style={{flex: 1, alignItems: 'center'}}>
                  <Text style={styles.titleDesc}>{personInfo.seniority}</Text>
                  <Text style={styles.title}>园龄</Text>
                </View>
              </View>
            </View>
          </View>
          <Image
            defaultSource={require('../../resources/ico/simple_avatar.gif')}
            style={{
              width: avatorRadius * 2,
              height: avatorRadius * 2,
              borderRadius: avatorRadius,
              position: 'absolute',
              left: 15,
              borderWidth: gScreen.onePix,
              borderColor: gColors.borderColor,
            }}
            source={{uri: personInfo.avatar}}
          />
          <View style={{height: 15,backgroundColor:gColors.backgroundColor}} />
        </View>
      </YZStateView>
    );
  };

  _handleScroll = event => {
    let curScrollY = event.nativeEvent.contentOffset.y;
    const {personInfo} = this.state;
    let {title} = (this.props.navigation.state || {params: undefined})
      .params || {title: undefined};
    title = title || '园友';
    if (curScrollY > this.namePositionY && title == '园友') {
      this.props.navigation.setParams({
        title: personInfo.nickName,
      });
    } else if (
      curScrollY < this.namePositionY &&
      title == personInfo.nickName
    ) {
      this.props.navigation.setParams({
        title: '园友',
      });
    }
  };

  loadBlogData = async ()=>{
    try {
      let response = await Api.blog.getPersonalBlogList({
        request: {
          pageIndex: this.blogPageIndex,
          pageSize: 10
        }
      });
      let pagingResult = dataToPagingResult(this.state.blogList,response.data || [],this.blogPageIndex,10);
      this.setState({
        blogList: pagingResult.dataList,
        blogListNoMore: pagingResult.noMore,
        loadBlogListResult: pagingResult.loadDataResult
      },()=>{

      });
    } catch (e) {
      this.setState({
        loadDataResult: dataToReducerResult(e)
      });
    }
  }


  getDataFromState = () => {
    return [
      {
        loadData: this.loadBlogData,
        data: this.state.blogList,
        noMore: this.state.blogListNoMore,
        loadDataResult: this.state.loadBlogListResult,
        onPageIndexChange: (pageIndex) => {
          this.blogPageIndex = pageIndex
        },
        renderItem: ({item, index}) => {
          return (
              <BlogItem
                  item={item}
                  navigation={NavigationHelper.navigation}
                  />
          );
        }
      }
    ]
  }

  render() {
    const {personInfo} = this.state;
    return (
      <View style={[Styles.container]}>
        <NavigationBar style={{position:'relative'}} title={'详情'} />
        <YZStickyTabView
            ref={ref => this.stickyTabViewRef = ref}
            style={{flex: 1}}
            onChangeTab={(value) => {
              this.selectedTab = value.i;
              switch (value.i) {
                case 0:

                  break;
                case 1:

                  break;
              }
            }}
            headerComponent={this._renderHeader()}
            renderTabBar={(activeTab, goToPage) => {
              return (
                  <View style={{backgroundColor: 'white',paddingTop:8,borderBottomWidth:Theme.onePix,borderBottomColor:gColors.borderColorE5}}>
                    <ProfilePersonTab
                        style={{paddingTop: 10}}
                        activeTab={activeTab}
                        goToPage={goToPage}
                        tabs={[`博客`]}
                        underlineStyle={{width: Theme.px2dp(35), height: Theme.px2dp(9), borderRadius: Theme.px2dp(4.5)}}
                    />
                  </View>
              );
            }}
            data={this.getDataFromState()}
        />
        {/*<NavigationBar style={{backgroundColor:'transparent'}} title={'测试'}/>*/}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  title: {
    fontSize: gFont.size13,
    color: gColors.color666,
    marginTop: 6
  },
  titleDesc: {
    fontSize: gFont.size14,
    color: gColors.themeColor,
    fontWeight:'bold'
  },
});
