import React, {Component, PureComponent} from 'react';
import {
  Animated,
  DeviceEventEmitter,
  EmitterSubscription,
  StyleSheet,
  View,
} from 'react-native';
import {connect} from 'react-redux';
import YZBaseDataPage, {
  IBaseDataPageProps,
} from '../../components/YZBaseDataPage';
import YZStateView from '../../components/YZStateCommonView';
import YZFlatList from '../../components/YZFlatList';
import {Styles} from '../../common/styles';
import Feather from 'react-native-vector-icons/Feather';
import {ListRow, NavigationBar} from '@yz1311/teaset';
import StatusItem from './status_item';
import CommonUtils from '../../utils/commonUtils';
import {createReducerResult, dataToPagingResult, dataToReducerResult, ReducerResult} from "../../utils/requestUtils";
import {StatusTypes} from "./status_index";
import {Api} from "../../api";
import {blogCommentModel} from "../../api/blog";
import {statusModel} from "../../api/status";
import {SearchParams} from "../home/home_search";
import {ReduxState} from '../../models';
import {userInfoModel} from '../../api/login';
import produce from 'immer';
import {QuestionTypes} from "../question/question_index";

export interface IProps {
  tabLabel?: string;
  navigation: any;
  statusType: StatusTypes,
  keyword?: string,
  userInfo?: userInfoModel,
  searchParams?: SearchParams,
  tagName?: string;
}

interface IState {
  dataList: Array<statusModel>;
  noMore: boolean;
  loadDataResult: ReducerResult;
}

@(connect((state:ReduxState)=>({
  userInfo: state.loginIndex.userInfo
})) as any)
export default class base_status_list extends PureComponent<IProps, IState> {
  pageIndex = 1;
  pageSize = 30;
  scrollY = 0;
  lastScrollY = 0;
  protected type: string;
  protected mustLogin: boolean;
  private scrollListener: EmitterSubscription;
  private refreshListener: EmitterSubscription;
  private updateCommentCountListener: EmitterSubscription;
  private _flatList: any;

  readonly state:IState = {
    dataList: [],
    noMore: false,
    loadDataResult: createReducerResult()
  };

  constructor(props) {
    super(props);
    this.scrollListener = DeviceEventEmitter.addListener(
      'status_list_scroll_to_top',
      ({tabIndex}) => {
        if (tabIndex === this.props.statusType) {
          this._flatList && this._flatList._scrollToTop();
        }
      },
    );
    this.refreshListener = DeviceEventEmitter.addListener(
      'status_list_refresh',
      (tabIndex) => {
        if(tabIndex==-1||tabIndex === this.props.statusType) {
          this._flatList && this._flatList._onRefresh();
        }
      },
    );
    this.updateCommentCountListener = DeviceEventEmitter.addListener('update_status_comment_count',this.updateCommentCount);
  }

  componentDidMount(): void {
    this.loadData();
  }

  componentWillUnmount() {
    this.scrollListener.remove();
    this.refreshListener.remove();
    this.updateCommentCountListener.remove();
  }

  loadData = async ()=>{
    let response:any = null;
    try {
      if(this.props.statusType==StatusTypes.搜索) {
        response = await Api.status.getSearchStatusList({
          request: {
            pageIndex: this.pageIndex,
            Keywords: this.props.keyword,
            ...(this.props.searchParams||{})
          }
        });
      } else {
        response = await Api.status.getStatusList({
          request: {
            pageIndex: this.pageIndex,
            pageSize: this.pageSize,
            statusType: this.props.statusType,
            tag: this.props.tagName
          }
        });
      }
      let pagingResult = dataToPagingResult(this.state.dataList,response.data || [],this.pageIndex,this.pageSize);
      this.setState({
        ...pagingResult
      });
    } catch (e) {
      this.setState({
        loadDataResult: dataToReducerResult(e)
      });
    } finally {

    }
  }

  updateCommentCount=({statusId,commentCount})=>{
    let nextDataList = produce(this.state.dataList,draftState=>{
      draftState.forEach(x=>{
        if(x.id==statusId) {
          x.commentCount = commentCount;
        }
      })
    });
    this.setState({
      dataList: nextDataList
    });
  }

  _renderItem = ({item, index}) => {
    const {userInfo} = this.props;
    return <StatusItem item={item}
                       canDelete={item.author?.id === userInfo.id}
                       canModify={item.author?.id === userInfo.id}
                       navigation={this.props.navigation} />;
  };

  _handleScroll = event => {
    let curScrollY = event.nativeEvent.contentOffset.y;
    // 向下滑动了20
    if (curScrollY - this.lastScrollY > 20) {
      DeviceEventEmitter.emit('toggleActionButton', false);
    }
    // 向上滑动了20
    else if (curScrollY - this.lastScrollY < -20) {
      DeviceEventEmitter.emit('toggleActionButton', true);
    }
    this.lastScrollY = curScrollY;
  };

  render() {
    return (
      <View style={[Styles.container]}>
        {this.props.statusType === StatusTypes.标签 ?
            <NavigationBar title={this.props.tagName}/>
            :
            null
        }
        <YZStateView
          loadDataResult={this.state.loadDataResult}
          placeholderTitle="暂无数据"
          mustLogin={this.mustLogin || false}
          errorButtonAction={this.loadData}>
          <YZFlatList
            ref={ref => (this._flatList = ref)}
            onScroll={CommonUtils.throttle(this._handleScroll, 500)}
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
