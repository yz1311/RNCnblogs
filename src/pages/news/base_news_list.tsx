import React, {PureComponent} from 'react';
import {DeviceEventEmitter, EmitterSubscription, StyleSheet, View} from 'react-native';
import YZStateView from '../../components/YZStateCommonView';
import YZFlatList from '../../components/YZFlatList';
import {Styles} from '../../common/styles';
import NewsItem from './news_item';
import {NewsTypes} from './news_index';
import {
  createReducerResult,
  dataToPagingResult,
  dataToReducerResult,
  LoadDataResultStates,
  ReducerResult
} from '../../utils/requestUtils';
import {Api} from '../../api';
import {SearchParams} from "../home/home_search";

export interface IProps {
  tabIndex?: number;
  navigation?: any;
  newsType: NewsTypes;
  keyword?: string;
  searchParams?: SearchParams
}

interface IState {
  dataList: Array<any>;
  loadDataResult: ReducerResult;
  noMore: boolean;
}

export default class base_news_list extends PureComponent<IProps, IState> {
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
    this.loadData();
  }

  componentWillUnmount() {
    this.scrollListener.remove();
    this.refreshListener.remove();
  }

  loadData = async ()=>{
    let action:any = ()=>{
      return ;
    };
    let pageSize = 18;
    switch (this.props.newsType) {
      case NewsTypes.最新:
        action = ()=>{
          return Api.news.getOtherNewsList({
            request: {
              ParentCategoryId: 0,
              CategoryId: -1,
              CategoryType: 'News',
              PageIndex: this.pageIndex,
            },
            newsType: this.props.newsType
          })
        };
        pageSize = 30;
        break;
      case NewsTypes.热门:
        action = ()=>{
          return Api.news.getOtherNewsList({
            request: {
              ParentCategoryId: 0,
              CategoryId: -1,
              CategoryType: 'News',
              PageIndex: this.pageIndex,
            },
            newsType: this.props.newsType
          })
        };
        break;
      case NewsTypes.推荐:
        action = ()=>{
          return Api.news.getOtherNewsList({
            request: {
              ParentCategoryId: 0,
              CategoryId: -1,
              CategoryType: 'News',
              PageIndex: this.pageIndex,
            },
            newsType: this.props.newsType
          })
        };
        break;
      case NewsTypes.搜索:
        action = ()=>{
          return Api.news.getSearchNewsList({
            request: {
              Keywords: this.props.keyword,
              pageIndex: this.pageIndex,
              ...(this.props.searchParams||{})
              // pageSize: 10
            },
          })
        };
        pageSize = 10;
        break;
    }
    try {
      let response = await action();
      console.log(response)
      let pagingResult = dataToPagingResult(this.state.dataList,response.data || [],this.pageIndex,pageSize);
      this.setState({
        ...pagingResult
      });
    } catch (e) {
      this.setState({
        loadDataResult: dataToReducerResult(e)
      });
    }
  }

  // pageIndex = 1;

  _renderItem = ({item, index}) => {
    return <NewsItem item={item} navigation={this.props.navigation} />;
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
