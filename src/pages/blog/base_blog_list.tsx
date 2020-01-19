import React, {PureComponent} from 'react';
import {DeviceEventEmitter, EmitterSubscription, StyleSheet, View,} from 'react-native';
import Styles from '../../common/styles';
import BlogItem from './blog_item';
import {createReducerResult, dataToPagingResult, dataToReducerResult, ReducerResult} from "../../utils/requestUtils";
import {BlogTypes} from "../home/home_index";
import {connect} from "react-redux";
import {ReduxState} from "../../models";
import YZStateView from "../../components/YZStateCommonView";
import YZFlatList from "../../components/YZFlatList";
import {Api} from "../../api";
import {SearchParams} from "../home/home_search";
import {messageModel} from "../../api/message";

export interface IProps {
  navigation: any,
  tabIndex: number,
  blogType: BlogTypes,
  userInfo?: any,
  keyword?: string,
  searchParams?: SearchParams
}

export interface IState {
  dataList?: Array<any>;
  loadDataResult?: ReducerResult;
  noMore?: boolean;
  tabIndex?: number;
}

class base_blog_list extends PureComponent<IProps,IState> {
  static navigationOptions = ({navigation})=>{
    let {title} = navigation.state?.params || {};
    return {
      headerShown: title!=undefined,
      headerTitle: title || ''
    };
  }

  protected mustLogin: boolean = false;
  pageIndex = 1;
  private scrollListener: EmitterSubscription;
  private refreshListener: EmitterSubscription;
  private searchReloadListener: EmitterSubscription;
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
        this._flatList&&this._flatList._onRefresh();
      }
    })
  }

  componentDidMount(): void {
    this.loadData();
  }


  componentWillUnmount() {
    this.scrollListener.remove();
    this.refreshListener.remove();
    this.searchReloadListener.remove();
  }

  loadData = async ()=>{
    let params:any = {
      request: {
        blogApp: this.props.userInfo.BlogApp || 'yz1311',
        pageIndex: this.pageIndex,
        pageSize: 10,
      },
    };
    let action:any = ()=>{
      return ;
    };
    switch (this.props.blogType) {
      case BlogTypes.首页:
        action = ()=>{
          return Api.blog.getPickedBlogList({
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
              ParentCategoryId: 0,
              CategoryId: -4,
              CategoryType: 'MyFollowing',
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
              ParentCategoryId: 0,
              CategoryId: -2,
              CategoryType: 'Picked',
              PageIndex: this.pageIndex,
            }
          })
        };
        break;
      case BlogTypes.候选:
        action = ()=>{
          return Api.blog.getPickedBlogList({
            request: {
              ParentCategoryId: 0,
              CategoryId: 108697,
              CategoryType: 'HomeCandidate',
              PageIndex: this.pageIndex,
            }
          })
        };
        break;
      case BlogTypes.我的:
        action = ()=>{
          return Api.blog.getPersonalBlogList({
            request: {
              pageIndex: this.pageIndex,
              pageSize: 10
            }
          })
        };
        break;
      case BlogTypes.搜索:
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
      let pagingResult = dataToPagingResult(this.state.dataList,response.data || [],this.pageIndex,10);
      this.setState({
          ...pagingResult
      },()=>{
        //搜索列表没有头像
        if(this.props.blogType==BlogTypes.搜索) {
          this.getUserAvatar();
        }
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

  _renderItem = ({item, index}) => {
    return <BlogItem item={item} navigation={this.props.navigation} />;
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
