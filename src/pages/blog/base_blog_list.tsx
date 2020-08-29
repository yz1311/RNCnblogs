import React, {PureComponent} from 'react';
import {DeviceEventEmitter, EmitterSubscription, StyleSheet, View,} from 'react-native';
import {Styles} from '../../common/styles';
import BlogItem from './blog_item';
import {
  createReducerResult,
  dataToPagingResult,
  dataToReducerResult,
  LoadDataResultStates,
  ReducerResult
} from "../../utils/requestUtils";
import {BlogTypes} from "../home/home_index";
import {connect} from "react-redux";
import {ReduxState} from "../../models";
import YZStateView from "../../components/YZStateCommonView";
import YZFlatList from "../../components/YZFlatList";
import {Api} from "../../api";
import {SearchParams} from "../home/home_search";
import {NavigationBar} from "@yz1311/teaset";
import {blogModel} from "../../api/blog";
import produce from 'immer';

export interface IProps {
  title?: string;
  navigation: any,
  tabIndex: number,
  loadData?: Function,
  blogType: BlogTypes,
  userInfo?: any,
  keyword?: string,
  searchParams?: SearchParams,
  userAvatar?: string;
}

export interface IState {
  dataList?: Array<blogModel>;
  stickyList: Array<blogModel>;
  loadDataResult?: ReducerResult;
  noMore?: boolean;
  tabIndex?: number;
}

class base_blog_list extends PureComponent<IProps,IState> {

  protected mustLogin: boolean = false;
  pageIndex = 1;
  private scrollListener: EmitterSubscription;
  private refreshListener: EmitterSubscription;
  private searchReloadListener: EmitterSubscription;
  private updateDiggCountListener: EmitterSubscription;
  private _flatList: YZFlatList;

  readonly state:IState = {
    dataList: [],
    stickyList: [],
    noMore: false,
    loadDataResult: createReducerResult()
  };

  constructor(props) {
    super(props);
    this.scrollListener = DeviceEventEmitter.addListener(
      'list_scroll_to_top',
      ({tabIndex}) => {
        if (tabIndex === this.props.tabIndex) {
          this._flatList._scrollToTop();
        }
      },
    );
    this.refreshListener = DeviceEventEmitter.addListener(
      'list_refresh',
      ({tabIndex}) => {
        if (tabIndex === this.props.tabIndex) {
          this._flatList._onRefresh();
        }
      },
    );
    this.searchReloadListener = DeviceEventEmitter.addListener('search_blog_list_reload', ()=>{
      if(this.props.blogType==BlogTypes.搜索) {
        //重新加载
        this.setState({
          loadDataResult: createReducerResult({
            state: LoadDataResultStates.loading
          })
        });
        this.pageIndex = 1;
        this.loadData();
      }
    });
    this.updateDiggCountListener = DeviceEventEmitter.addListener('update_blog_item_digg_count', ({postId, count}) => {
      let nextDataList = produce(this.state.dataList, draftState => {
        for (let item of draftState) {
         if(item.id+'' === postId+'') {
           item.diggs = count;
           break;
         }
        }
      });
    });
  }

  componentDidMount(): void {
    this.loadData();
  }


  componentWillUnmount() {
    this.scrollListener.remove();
    this.refreshListener.remove();
    this.searchReloadListener.remove();
    this.updateDiggCountListener.remove();
  }

  loadData = async ()=>{
    let pageSize = 20;
    let params:any = {
      request: {
        blogApp: this.props.userInfo.BlogApp || 'yz1311',
        pageIndex: this.pageIndex,
        pageSize: 20,
      },
    };
    let action:any = ()=>{
      return ;
    };
    switch (this.props.blogType) {
      case BlogTypes.首页:
        action = ()=>{
          return Api.blog.getHomeBlogList({
            request: {
              ParentCategoryId: 0,
              CategoryId: 808,
              CategoryType: 'SiteHome',
              PageIndex: this.pageIndex,
            }
          })
        };
        break;
      case BlogTypes.关注:
        action = ()=>{
          return Api.blog.getFollowingBlogList({
            request: {
              CategoryId: -4,
              CategoryType: 'MyFollowing',
              //@ts-ignore
              CheckedGroupId: null,
              PageIndex: this.pageIndex,
            }
          })
        };
        break;
      case BlogTypes.知识库:

        break;
      case BlogTypes.精华:
        action = ()=>{
          return Api.blog.getPickedBlogList({
            request: {
              CategoryId: -2,
              CategoryType: 'Picked',
              ParentCategoryId: 0,
              PageIndex: this.pageIndex,
            }
          })
        };
        break;
      case BlogTypes.候选:
        action = ()=>{
          return Api.blog.getPickedBlogList({
            request: {
              CategoryId: 108697,
              CategoryType: 'HomeCandidate',
              ParentCategoryId: 0,
              PageIndex: this.pageIndex,
            }
          })
        };
        break;
      case BlogTypes.我的:
        pageSize = 10;
        action = ()=>{
          return Api.blog.getPersonalBlogList({
            request: {
              pageIndex: this.pageIndex,
              //必须是10
              pageSize: 10
            }
          })
        };
        break;
      case BlogTypes.搜索:
        pageSize = 10;
        action = ()=>{
          return Api.blog.getSearchBlogList({
            request: {
              pageIndex: this.pageIndex,
              Keywords: this.props.keyword,
              ...(this.props.searchParams||{})
              // pageSize: 10
            }
          })
        };
        break;
    }
    try {
      let response = await action();
      //加载头像和用户id
      if(this.props.blogType === BlogTypes.我的) {
        response.data = response.data.map(x=>({
            ...x,
            author: {
                ...x.author,
                avatar: this.props.userAvatar,
                id: gUserData.userId
            }
        }));
        //并且置顶的数据不能算在分页数据中，不然会导致分页混乱
        response.data = response.data.filter(x=>!x.isSticky);
        let restList = response.data.filter(x=>x.isSticky);
        let tempList = [].concat(this.state.stickyList);
        for (let item of restList) {
          if(!tempList.some(x=>x.id===item.id)) {
            tempList.push(item)
          }
        }
        this.setState({
          stickyList: tempList
        });
      }
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


  _renderItem = ({item, index}) => {
    return <BlogItem item={item} navigation={this.props.navigation} />;
  };

  render() {
    return (
      <View style={[Styles.container]}>
        {this.props.title ?
            <NavigationBar title={this.props.title}/>
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

export default connect((state:ReduxState)=>({
  userInfo: state.loginIndex.userInfo
}))(base_blog_list)
