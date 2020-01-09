import React, {Component, PureComponent} from 'react';
import {
  DeviceEventEmitter,
  EmitterSubscription,
  StyleSheet,
  View,
} from 'react-native';
import {connect} from 'react-redux';
import YZHeader from '../../../components/YZHeader';
import YZBaseDataPage, {
  IBaseDataPageProps,
} from '../../../components/YZBaseDataPage';
import YZStateView from '../../../components/YZStateCommonView';
import YZFlatList from '../../../components/YZFlatList';
import Styles from '../../../common/styles';
import Feather from 'react-native-vector-icons/Feather';
import {ListRow} from '@yz1311/teaset';
import BlogItem from '../blog_item';
import {createReducerResult, ReducerResult} from "../../../utils/requestUtils";
import {BlogTypes} from "../../home/home_index";
import {getBlogListRequest} from "../../../api/blog";

export interface IProps extends IBaseDataPageProps{
  navigation: any,
  tabIndex: number,
  blogType: BlogTypes
}

export interface IState {
  dataList?: Array<any>;
  loadDataResult?: ReducerResult;
  noMore?: boolean;
  tabIndex?: number;
}

export default class base_blog_list extends PureComponent<IProps,IState> {
  protected mustLogin: boolean = false;
  pageIndex = 1;
  private scrollListener: EmitterSubscription;
  private refreshListener: EmitterSubscription;
  private _flatList: any;

  readonly state:IState = {
    dataList: [],
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
  }

  componentDidMount(): void {

  }


  componentWillUnmount() {
    super.componentWillUnmount();
    this.scrollListener.remove();
    this.refreshListener.remove();
  }

  loadData = async ()=>{
    let params:any = {
      request: {
        blogApp: this.props.userInfo.BlogApp || 'yz1311',
        pageIndex: this.pageIndex,
        pageSize: 10,
      },
    };
    switch (this.props.blogType) {
      case BlogTypes.首页:
        params = {
          request: {
            pageIndex: this.pageIndex,
            pageSize: 10,
          },
        };
        break;
      case BlogTypes.关注:
        params = {
          request: {
            pageIndex: this.pageIndex,
            pageSize: 10,
          },
        };
        break;
      case BlogTypes.知识库:

        break;
      case BlogTypes.精华:
        params = {
          request: {
            pageIndex: this.pageIndex,
            pageSize: 10,
          },
        };
        break;
    }
  }

  getParams: any = () => {
    // const params = {
    //   request: {
    //     blogApp: this.props.userInfo.BlogApp || 'yz1311',
    //     pageIndex: this.pageIndex,
    //   },
    // };
    // return params;
  };

  _renderItem = ({item, index}) => {
    return <BlogItem item={item} navigation={this.props.navigation} />;
  };

  render() {
    return (
      <View style={[Styles.container]}>
        <YZStateView
          getResult={this.state.loadDataResult}
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
