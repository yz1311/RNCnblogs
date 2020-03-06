import React, {PureComponent} from 'react';
import {TouchableOpacity, View} from 'react-native';
import {Styles} from '../../common/styles';
import YZStateView from '../../components/YZStateCommonView';
import YZFlatList from '../../components/YZFlatList';
import {createReducerResult, ReducerResult} from '../../utils/requestUtils';


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

  loadData = async ()=>{

  }

  _renderItem = ({item,index})=>{
    return (
      <TouchableOpacity

        >

      </TouchableOpacity>
    );
  }

  render () {
    return (
      <View style={[Styles.container]}>
        <YZStateView
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
              <View style={{height: 10, backgroundColor: 'transparent'}} />
            )}
          />
        </YZStateView>
      </View>
    );
  }
}
