import React, {PureComponent} from 'react';
import {DeviceEventEmitter, EmitterSubscription, StyleSheet, View} from 'react-native';
import YZStateView from '../../components/YZStateCommonView';
import YZFlatList from '../../components/YZFlatList';
import Styles from '../../common/styles';
import QuestionItem from './question_item';
import QuestionReplyItem from './question_reply_item';
import CommonUtils from '../../utils/commonUtils';
import {createReducerResult, dataToPagingResult, dataToReducerResult, ReducerResult} from '../../utils/requestUtils';
import {QuestionTypes} from './question_index';
import {Api} from '../../api';
import {questionModel} from '../../api/question';

export interface IProps {
  questionType: QuestionTypes;
  navigation?: any;
}

interface IState {
  dataList: Array<any>;
  noMore: boolean;
  loadDataResult: ReducerResult;
}

export default class base_question_list extends PureComponent<IProps,IState> {
  pageIndex = 1;
  lastScrollY: number = 0;
  protected mustLogin: boolean;
  private scrollListener: EmitterSubscription;
  private refreshListener: EmitterSubscription;
  private _flatList: any;

  readonly state:IState = {
    dataList: [],
    noMore: false,
    loadDataResult: createReducerResult()
  };

  constructor(props) {
    super(props);
    this.scrollListener = DeviceEventEmitter.addListener(
      'list_scroll_to_top',
      ({tabIndex}) => {
        if (tabIndex === this.props.questionType) {
          this._flatList && this._flatList._scrollToTop();
        }
      },
    );
    this.refreshListener = DeviceEventEmitter.addListener(
      'list_refresh',
      ({tabIndex}) => {
        if (tabIndex === this.props.questionType) {
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
      let response = await Api.question.getQuestionList({
        request: {
          pageIndex: this.pageIndex,
          questionType: this.props.questionType
        }
      });
      let pagingResult = dataToPagingResult(this.state.dataList,response.data || [],this.pageIndex,25);
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

  _renderItem = ({item, index}:{item:questionModel,index:number}) => {
    if([QuestionTypes.新评论,QuestionTypes.新回答].indexOf(this.props.questionType)>=0) {
      return <QuestionReplyItem item={item} navigation={this.props.navigation} clickable={true} selectable={true}/>;
    }
    return <QuestionItem item={item} navigation={this.props.navigation} />;
  };

  _handleScroll = event => {
    let curScrollY = event.nativeEvent.contentOffset.y;
    // 向下滑动了20
    if (curScrollY - this.lastScrollY > 20) {
      DeviceEventEmitter.emit('toggleActionButton_question', false);
    }
    // 向上滑动了20
    else if (curScrollY - this.lastScrollY < -20) {
      console.log('向上滑动了20');
      DeviceEventEmitter.emit('toggleActionButton_question', true);
    }
    this.lastScrollY = curScrollY;
  };

  render() {
    return (
      <View style={[Styles.container]}>
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
