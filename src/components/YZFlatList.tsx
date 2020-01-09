/**
 * 初始加载或者下拉加载的时候显示refreshing
 * 上拉加载更多不显示
 */
import React, {Component} from 'react';
import {
  View,
  FlatList,
  Text,
  InteractionManager,
  ActivityIndicator,
  RefreshControl,
  ViewPropTypes,
  FlatListProps,
} from 'react-native';
import PropTypes from 'prop-types';

export interface IProps extends FlatListProps<any> {
  data: Array<any>;
  loadDataResult: any;
  totalCount: number;
  //是否已经到底了
  noMore: boolean;
  loadData: any;
  clearData?: any;
  onPageIndexChange?: any;
  footerContainerStyle?: any;
  footerTextStyle?: any;
  pageIndex?: number;
}

export interface IState {
  isRefreshing: boolean;
}

export default class YZFlatList extends Component<IProps, IState> {
  //表示当前正在加载更多数据
  isLoadingMore = false;
  pageIndex = 1;
  constructor(props) {
    super(props);
    this.state = {
      isRefreshing: false,
    };
  }

  static propTypes = {
    // ...FlatList.propTypes,
    data: PropTypes.array.isRequired,
    loadDataResult: PropTypes.object.isRequired,
    totalCount: PropTypes.number.isRequired,
    //是否已经到底了
    noMore: PropTypes.bool.isRequired,
    loadData: PropTypes.func.isRequired,
    clearData: PropTypes.func,
    onPageIndexChange: PropTypes.func,
    footerContainerStyle: ViewPropTypes.style,
    footerTextStyle: PropTypes.object,
    pageIndex: PropTypes.number,
  };

  static defaultProps = {
    data: [],
    totalCount: -1,
    noMore: false,
    pageIndex: 1,
  };

  private uuid: any;
  private flatList: any;

  componentDidMount() {
    console.log('YZFlatList  componentDidMount');
    //由于有YZStateView的存在，所以放在外面触发
    InteractionManager.runAfterInteractions(() => {
      console.log('YZFlatList  componentDidMount');
      this.loadData();
    });
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.loadDataResult !== nextProps.loadDataResult) {
      if (nextProps.loadDataResult.success) {
        //成功之后才页数
        // const targetPageIndex = nextProps.loadDataResult.parData.pageIndex||1;
        this.pageIndex++;
        // this.pageIndex = targetPageIndex;
        this.onPageIndexChange();
      }
      this.isLoadingMore = false;
      if (this.state.isRefreshing) {
        this.setState({
          isRefreshing: false,
        });
      }
    }
    if (this.props.pageIndex !== nextProps.pageIndex) {
      this.pageIndex = nextProps.pageIndex;
    }
  }

  componentWillUnmount() {
    const {clearData} = this.props;
    clearData && clearData();
  }

  _onScroll = () => {
    // console.log('_onScroll');
    //滑动一下就可以重新触发_onEndReach了
    if (this.isLoadingMore) {
      this.isLoadingMore = false;
    }
  };

  _onRefresh = () => {
    this.pageIndex = 1;
    this.onPageIndexChange();
    this.setState({
      isRefreshing: true,
    });
    this.setState({isRefreshing: true}, () => {
      this.loadData();
    });
  };

  _scrollToTop = () => {
    console.log('scroll to top');
    this.flatList.scrollToIndex({
      index: 0,
    });
  };

  _onEndReach = () => {
    const {noMore} = this.props;
    console.log(
      'YZFlatList  _onEndReach noMore:' +
        noMore +
        '  isLoadingMore:' +
        this.isLoadingMore,
    );
    if (!this.isLoadingMore) {
      //继续加载下面的
      if (!noMore) {
        const {loadData} = this.props;
        loadData && loadData(this.pageIndex + 1);
        this.uuid = new Date();
        this.isLoadingMore = true;
      }
    }
  };

  render() {
    const {data, noMore} = this.props;
    return (
      <FlatList
        ref={ref => (this.flatList = ref)}
        style={[this.props.style]}
        keyExtractor={this._keyExtractor}
        onScroll={this._onScroll}
        onEndReachedThreshold={0.1}
        onEndReached={this._onEndReach}
        ListFooterComponent={() => this._renderFooter()}
        data={data}
        refreshControl={
          <RefreshControl
            refreshing={this.state.isRefreshing}
            onRefresh={this._onRefresh}
            colors={[gColors.themeColor]}
          />
        }
        {...this.props}
      />
    );
  }

  _keyExtractor = (item, index) => {
    return index + '';
  };

  _renderFooter = () => {
    const {noMore, footerContainerStyle, footerTextStyle} = this.props;
    const promptTitle = noMore ? '没有更多内容了' : '加载中...';
    return (
      <View
        style={[
          {
            height: 40,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          },
          footerContainerStyle,
        ]}>
        {noMore ? null : (
          <ActivityIndicator
            color={gColors.themeColor}
            style={{marginRight: 7}}
          />
        )}
        <Text
          style={[
            {
              textAlign: 'center',
              color: gColors.color666,
              fontSize: gFont.size13,
            },
            footerTextStyle,
          ]}>
          {promptTitle}
        </Text>
      </View>
    );
  };

  loadData = () => {
    const {loadData} = this.props;
    loadData && loadData(1);
    this.onPageIndexChange();
  };

  onPageIndexChange = () => {
    const {onPageIndexChange} = this.props;
    onPageIndexChange && onPageIndexChange(this.pageIndex);
  };
}
