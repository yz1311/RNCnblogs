import React, {PureComponent} from 'react';
import {DeviceEventEmitter, EmitterSubscription, InteractionManager, StyleSheet, View} from 'react-native';
import YZFlatList from '../../components/YZFlatList';
import {Styles} from '../../common/styles';
import QuestionItem from './question_item';
import QuestionReplyItem from './question_reply_item';
import CommonUtils from '../../utils/commonUtils';
import {
  createReducerResult,
  dataToPagingResult,
  dataToReducerResult,
  LoadDataResultStates,
  ReducerResult, StateView,
} from '@yz1311/react-native-state-view';
import {QuestionTypes} from './question_index';
import {Api} from '../../api';
import {questionModel} from '../../api/question';
import {SearchParams} from "../home/home_search";
import {messageModel} from "../../api/message";
import {userInfoModel} from '../../api/login';
import {connect} from 'react-redux';
import {ReduxState} from '../../models';
import {NavigationBar} from "@yz1311/teaset";

export interface IProps {
  questionType: QuestionTypes;
  navigation?: any;
  keyword?: string,
  userInfo?: userInfoModel,
  searchParams?: SearchParams;
  tabLabel?: string;
  tagName?: string;
}

interface IState {
  dataList: Array<any>;
  noMore: boolean;
  loadDataResult: ReducerResult;
}

@(connect((state:ReduxState)=>({
  userInfo: state.loginIndex.userInfo
})) as any)
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
      'question_list_refresh',
      ({tabIndex}) => {
        if (tabIndex==-1 || tabIndex === this.props.questionType) {
          //重新加载
          this.setState({
            loadDataResult: createReducerResult({
              state: LoadDataResultStates.loading
            })
          });
          this.pageIndex = 1;
          this.loadData();
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

  loadData = async ()=>{
    let response:any = null;
    let pageSize = 25;
    try {
      if(this.props.questionType==QuestionTypes.搜索) {
        pageSize = 10
        response = await Api.question.getSearchQuestionList({
          request: {
            pageIndex: this.pageIndex,
            Keywords: this.props.keyword,
            ...(this.props.searchParams||{})
          }
        });
      } else if(this.props.questionType==QuestionTypes.标签) {
        response = await Api.question.getQuestionListByTag({
          request: {
            pageIndex: this.pageIndex,
            tagName: this.props.tagName,
            ...(this.props.searchParams||{})
          }
        });
      } else {
        response = await Api.question.getQuestionList({
          request: {
            pageIndex: this.pageIndex,
            questionType: this.props.questionType,
          }
        });
      }
      let pagingResult = dataToPagingResult(this.state.dataList,response.data || [],this.pageIndex,pageSize);
      this.setState({
        ...pagingResult
      },()=>{
        //搜索列表没有头像
        if(this.props.questionType==QuestionTypes.搜索) {
          this.getUserAvatar();
        }
      });
    } catch (e) {
      this.setState({
        loadDataResult: dataToReducerResult(e)
      });
    } finally {

    }
  }

  getUserAvatar = async ()=>{
    for (let index in this.state.dataList) {
      let item = this.state.dataList[index];
      if(!item.author?.avatar || item.author?.avatar=='') {
        try {
          let imgRes = await Api.profile.getUserAvatar({
            request: {
              userId: (item as messageModel).author?.name
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

  _renderItem = ({item, index}:{item:questionModel,index:number}) => {
    const {userInfo} = this.props;
    let canDelete = (item.author?.id+'') === userInfo.id;
    if([QuestionTypes.新评论,QuestionTypes.新回答].indexOf(this.props.questionType)>=0) {
      return <QuestionReplyItem item={item} navigation={this.props.navigation}
                                canDelete={canDelete}
                                canModify={canDelete}
                                clickable={true}
                                selectable={true}/>;
    }
    return <QuestionItem item={item}
                         canDelete={canDelete}
                         canModify={canDelete}
                         navigation={this.props.navigation} />;
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
        {this.props.questionType === QuestionTypes.标签 ?
            <NavigationBar title={this.props.tagName}/>
            :
            null
        }
        <StateView
          loadDataResult={this.state.loadDataResult}
          placeholderTitle="暂无数据"
          // mustLogin={this.mustLogin || false}
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
        </StateView>
      </View>
    );
  }
}

const styles = StyleSheet.create({});
