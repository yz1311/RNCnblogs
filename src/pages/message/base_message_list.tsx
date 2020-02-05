import React, {PureComponent} from 'react';
import {DeviceEventEmitter, EmitterSubscription, StyleSheet, View} from 'react-native';
import YZStateView from '../../components/YZStateCommonView';
import YZFlatList from '../../components/YZFlatList';
import Styles from '../../common/styles';
import MessageItem from './message_item';
import {MessageTypes} from './message_index';
import {createReducerResult, dataToPagingResult, dataToReducerResult, ReducerResult} from '../../utils/requestUtils';
import {Api} from '../../api';
import {messageModel} from '../../api/message';
import {blogCommentModel} from '../../api/blog';

export interface IProps {
  tabIndex?: number;
  navigation?: any;
  messageType: MessageTypes;
}

interface IState {
  dataList: Array<messageModel>;
  loadDataResult: ReducerResult;
  noMore: boolean;
}

export default class base_message_list extends PureComponent<IProps, IState> {
  protected pageIndex: number = 1;
  private scrollListener: EmitterSubscription;
  private refreshListener: EmitterSubscription;
  private _flatList: any;

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

  loadData = async ()=>{
    try {
      let response = await Api.message.getMessageList({
        request: {
          pageIndex: this.pageIndex,
        },
        messageType: this.props.messageType
      });
      console.log(response)
      let pagingResult = dataToPagingResult(this.state.dataList,response.data || [],this.pageIndex,10);
      this.setState({
        ...pagingResult
      },()=>{
        this.getUserAvatar();
      });
    } catch (e) {
      this.setState({
        loadDataResult: dataToReducerResult(e)
      });
    }
  }

  getUserAvatar = async ()=>{
    for (let index in this.state.dataList) {
      let item = this.state.dataList[index];
      if(!item.author?.avatar || item.author?.avatar=='') {
        try {
          let imgRes = await Api.profile.getUserAvatarByNo({
            request: {
              userNo: (item as messageModel).author?.no
            }
          });
          let nextDateList = [
            ...this.state.dataList.slice(0,parseInt(index)),
            {
              ...item,
              author: {
                ...item.author,
                avatar: imgRes.data.avatar
              }
            },
            ...this.state.dataList.slice(parseInt(index)+1),
          ];
          this.setState({
            dataList: nextDateList
          })
        } catch (e) {

        }
      }
    }
  }

  // pageIndex = 1;

  _renderItem = ({item, index}) => {
    return <MessageItem item={item} navigation={this.props.navigation} />;
  };

  render() {
    console.log(this.state.dataList)
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
            noMore={this.state.noMore}
            initialNumToRender={20}
            loadData={this.loadData}
            onPageIndexChange={pageIndex => {
              this.pageIndex = pageIndex;
            }}
            ItemSeparatorComponent={() => (
              <View style={{height: 10, backgroundColor: 'transparent'}} />
            )}
          />
        </YZStateView>
      </View>
    );
  }
}

const styles = StyleSheet.create({});
