import React, {PureComponent} from 'react';
import {
  DeviceEventEmitter,
  EmitterSubscription,
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  InteractionManager
} from 'react-native';
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
import Entypo from 'react-native-vector-icons/Entypo';
import YZSafeAreaView from "../../components/YZSafeAreaView";

export interface IProps {
  tabIndex?: number;
  navigation?: any;
  userId: string;
}

interface IState {
  dataList: Array<any>;
  loadDataResult: ReducerResult;
  noMore: boolean;
}

export default class base_follow_list extends PureComponent<IProps, IState> {
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
    InteractionManager.runAfterInteractions(()=>{
      this.loadData();
    });
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
      let response = await Api.profile.getFollowerListByUserId({
        request: {
          userId: this.props.userId,
          pageIndex: this.pageIndex
        }
      });
      let pagingResult = dataToPagingResult(this.state.dataList,response.data || [],this.pageIndex,30);
      this.setState({
        ...pagingResult
      });
    } catch (e) {
      this.setState({
        loadDataResult: dataToReducerResult(e)
      });
    }
  }

  _renderItem = ({item, index}:{item: followingModel,index:number}) => {
    return (
      <View style={{backgroundColor:gColors.bgColorF,flexDirection:'row',alignItems:'center',justifyContent:'space-between',
        paddingHorizontal:10,paddingVertical:15}}>
        <TouchableOpacity
          activeOpacity={activeOpacity}
          onPress={() => {
            ServiceUtils.viewProfileDetail(
              gStore.dispatch,
              item.id,
              item.avatar,
            );
          }}
          style={{
            flexDirection: 'row',
            alignSelf: 'stretch',
            alignItems: 'center',
            flex:1
          }}>
          <Image
            style={[Styles.avator]}
            resizeMode="contain"
            source={{uri: item?.avatar}}
          />
          <Text style={[Styles.userName]}>{item?.name}</Text>
          <View style={{flex:1}}/>
          <Entypo name={'chevron-thin-right'} size={18} color={gColors.color999}/>
        </TouchableOpacity>
      </View>
    );
  };

  render() {
    console.log(this.state.dataList)
    return (
      <YZSafeAreaView>
        <NavigationBar title="粉丝" />
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
