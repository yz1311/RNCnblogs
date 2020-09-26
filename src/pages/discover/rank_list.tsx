import React, {PureComponent} from 'react';
import {TouchableOpacity, View, Text} from 'react-native';
import YZFlatList from '../../components/YZFlatList';
import {createReducerResult, dataToReducerResult, ReducerResult, StateView} from '@yz1311/react-native-state-view';
import {Api} from '../../api';
import {rankModel} from '../../api/home';
import Entypo from 'react-native-vector-icons/Entypo';
import {NavigationBar, Theme} from '@yz1311/teaset';
import ServiceUtils from '../../utils/serviceUtils';
import YZSafeAreaView from "../../components/YZSafeAreaView";


interface IProps {

}

interface IState {
  dataList: Array<any>,
  loadDataResult: ReducerResult,
}

export default class RankList extends PureComponent<IProps,IState>{

  readonly state:IState = {
    dataList: [],
    loadDataResult: createReducerResult()
  };

  private _flatList:YZFlatList;

  componentDidMount(): void {
    this.loadData();
  }

  loadData = async ()=>{
    try {
      let response = await Api.home.rankList({request: {}});
      //暂时只显示300条
      response.data = response.data.slice(0,300);
      this.setState({
        dataList: response.data,
        loadDataResult: dataToReducerResult(response.data)
      });
    } catch (e) {
      this.setState({
        loadDataResult: dataToReducerResult(e)
      });
    } finally {

    }
  }

  _renderItem = ({item,index}:{item:rankModel,index:number})=>{
    return (
      <TouchableOpacity
        onPress={()=>{
          ServiceUtils.viewProfileDetail(
            gStore.dispatch,
            item.id,
            '',
          );
        }}
        style={{flexDirection:'row',backgroundColor:gColors.bgColorF,
          height: Theme.px2dp(110),alignItems:'center',
          paddingHorizontal:Theme.px2dp(15)}}
        >
        <Text style={{color: gColors.color666,fontSize:Theme.px2dp(30),marginRight:Theme.px2dp(20)}}>{item.index}</Text>
        <View>
          <Text style={{color: gColors.color333,fontSize:Theme.px2dp(28),fontWeight:'600'}}>{item.name}</Text>
          <View style={{flexDirection:'row',alignItems:'center',marginTop: Theme.px2dp(18),}}>
            <Text style={{width:Theme.px2dp(180),color:gColors.color666,fontSize:Theme.px2dp(22)}}>文章数: <Text style={{color:Theme.primaryColor}}>{item.blogCount}</Text></Text>
            <Text style={{color:gColors.color666,fontSize:Theme.px2dp(22)}}>最后更新: <Text style={{color:Theme.primaryColor}}>{item.lastUpdate}</Text></Text>
          </View>
        </View>
        <View style={{flex:1}}/>
        <Entypo name={'chevron-thin-right'} size={18} color={gColors.color999}/>
      </TouchableOpacity>
    );
  }

  render () {
    return (
      <YZSafeAreaView>
        <NavigationBar title="排行榜" />
        <StateView
          loadDataResult={this.state.loadDataResult}
          placeholderTitle="暂无数据"
          errorButtonAction={this.loadData}>
          <YZFlatList
            ref={ref => (this._flatList = ref)}
            renderItem={this._renderItem}
            data={this.state.dataList}
            loadDataResult={this.state.loadDataResult}
            noMore={true}
            initialNumToRender={20}
            loadData={this.loadData}
            ItemSeparatorComponent={() => (
              <View style={{height: Theme.onePix*2, backgroundColor: gColors.borderColorE5}} />
            )}
          />
        </StateView>
      </YZSafeAreaView>
    );
  }
}
