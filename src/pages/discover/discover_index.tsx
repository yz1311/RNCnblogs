import React, {PureComponent} from 'react';
import {TouchableOpacity, View, Text, StatusBar} from 'react-native';
import {Styles} from '../../common/styles';
import {Theme} from '@yz1311/teaset';
import AntDesign from 'react-native-vector-icons/AntDesign';

interface IProps {
  tabIndex: number
}

interface IState {

}

export default class DiscoverIndex extends PureComponent<IProps,IState>{

  toTopMenu = (index)=>{
    switch (index) {
      case 0:
        NavigationHelper.push('RankList');
        break;
      case 1:

        break;
      case 2:
        NavigationHelper.push('NewsIndex');
         break;
      case 3:

        break;
    }
  }
  render () {
    return (
      <View style={[Styles.container]}>
        <View style={{height: Theme.statusBarHeight,backgroundColor:gColors.bgColorF}}/>
        <View style={{flexDirection:'row',alignItems:'center',
          justifyContent:'space-between',
          backgroundColor:gColors.bgColorF,height:100}}>
          {
            ['排行榜','知识库','看新闻',''].map((x,index)=> {
              return (
                <TouchableOpacity
                  onPress={()=>this.toTopMenu(index)}
                  style={{width: Theme.px2dp(140),alignItems:'center'}}
                >
                  <AntDesign name={'dashboard'} color={gColors.color333} size={30}/>
                  <Text style={{color:gColors.color333,fontSize: Theme.px2dp(23),marginTop:Theme.px2dp(15)}}>{x}</Text>
                </TouchableOpacity>
              );
            })
          }
        </View>
      </View>
    );
  }
}
