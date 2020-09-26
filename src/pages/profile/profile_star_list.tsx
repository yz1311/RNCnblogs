import React, {PureComponent} from 'react';
import {DeviceEventEmitter, EmitterSubscription, StyleSheet, View, Text, Image, TouchableOpacity} from 'react-native';
import YZFlatList from '../../components/YZFlatList';
import {Styles} from '../../common/styles';
import {
  createReducerResult,
  dataToPagingResult,
  dataToReducerResult,
  ReducerResult,
  StateView,
} from '@yz1311/react-native-state-view';
import {Api} from '../../api';
import {followingModel} from '../../api/profile';
import ServiceUtils from '../../utils/serviceUtils';
import {Alert, Button, NavigationBar, Theme} from '@yz1311/teaset';
import ToastUtils from '../../utils/toastUtils';
import {connect} from "react-redux";
import {ReduxState} from "../../models";
import {userInfoModel} from "../../api/login";
import Entypo from 'react-native-vector-icons/Entypo';
import YZSafeAreaView from "../../components/YZSafeAreaView";

export interface IProps {
  tabIndex?: number;
  navigation?: any;
  userId: string;
  userInfo?: userInfoModel
}

interface IState {
  dataList: Array<any>;
  loadDataResult: ReducerResult;
  noMore: boolean;
}

@(connect((state:ReduxState)=>({
    userInfo: state.loginIndex.userInfo
})) as any)
export default class base_star_list extends PureComponent<IProps, IState> {
  protected pageIndex: number = 1;
  private scrollListener: EmitterSubscription;
  private refreshListener: EmitterSubscription;
  private _flatList: YZFlatList;

  readonly state:IState = {
    dataList: [],
    loadDataResult: createReducerResult(),
    noMore: false
  };

  constructor(props) {
    super(props);
    this.scrollListener = DeviceEventEmitter.addListener(
      'list_scroll_to_top',
      ({tabIndex}) => {
        if (tabIndex === this.props.tabIndex) {
          //@ts-ignore
          this._flatList && this._flatList._scrollToTop();
        }
      },
    );
    this.refreshListener = DeviceEventEmitter.addListener(
      'list_refresh',
      ({tabIndex}) => {
        if (tabIndex === this.props.tabIndex) {
          this._flatList && this._flatList._onRefresh();
        }
      },
    );
  }

  componentDidMount(): void {
    this.loadData();
  }

  componentWillUnmount() {
    this.scrollListener.remove();
    this.refreshListener.remove();
  }

  onRefresh = ()=>{
    this._flatList&&this._flatList._onRefresh();
  }

  loadData = async ()=>{
    try {
      let response = await Api.profile.getStarListByUserId({
        request: {
          userId: this.props.userId,
          pageIndex: this.pageIndex
        }
      });
      let pagingResult = dataToPagingResult(this.state.dataList,response.data || [],this.pageIndex,45);
      this.setState({
        ...pagingResult
      });
    } catch (e) {
      this.setState({
        loadDataResult: dataToReducerResult(e)
      });
    }
  }

  unStar = async (item: followingModel)=>{
    ToastUtils.showLoading();
    try {
      let response = await Api.profile.unfollowUser({
        request: {
          userUuid: item.uuid
        }
      });
      if(response.data.IsSucceed) {
        //刷新列表
        this.onRefresh();
        ToastUtils.showToast('取消成功!');
      } else {
        ToastUtils.showToast('取消失败!');
      }
    } catch (e) {

    } finally {
      ToastUtils.hideLoading();
    }
  }

  _renderItem = ({item, index}:{item: followingModel,index:number}) => {
    console.log(item.id,this.props.userInfo?.id)
    return (
      <TouchableOpacity
          onPress={()=>{
            NavigationHelper.push('ProfilePerson', {
              userAlias: item.id,
              avatorUrl: '',
            });
          }}
          style={{backgroundColor:gColors.bgColorF,flexDirection:'row',alignItems:'center',justifyContent:'space-between',
        paddingHorizontal:10,paddingVertical:15}}>
        <TouchableOpacity
          activeOpacity={activeOpacity}
          onPress={() => {
            ServiceUtils.viewProfileDetail(
              gStore.dispatch,
              this.props.userId,
              item.avatar,
            );
          }}
          style={{
            flexDirection: 'row',
            alignSelf: 'stretch',
            alignItems: 'center',
          }}>
          <Image
            style={[Styles.avator]}
            resizeMode="contain"
            source={{uri: item?.avatar}}
          />
          <Text style={[Styles.userName]}>{item?.name}</Text>
        </TouchableOpacity>
        <View style={{flex:1}}/>
        {item.id === this.props.userInfo?.id ?
            <Button title={'取消关注'} onPress={() => {
              Alert.alert('', '是否取消关注?', [{
                text: '返回',
              }, {
                text: '取消关注',
                style: 'destructive',
                onPress: () => {
                  this.unStar(item);
                }
              }])
            }}/>
            :
            null
        }
        <Entypo name={'chevron-thin-right'} size={18} color={gColors.color999}/>
      </TouchableOpacity>
    );
  };

  render() {
    console.log(this.state.dataList)
    return (
      <YZSafeAreaView>
        <NavigationBar title="关注" />
        <StateView
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
              <View style={{height: Theme.onePix, backgroundColor: gColors.borderColor}} />
            )}
          />
        </StateView>
      </YZSafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  avator: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
});
