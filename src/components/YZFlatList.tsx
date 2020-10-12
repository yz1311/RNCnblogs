/**
 * 初始加载或者下拉加载的时候显示refreshing
 * 上拉加载更多不显示
 */
import React,{Component} from 'react';
import {
  View,
  FlatList,
  Text,
  InteractionManager,
  ActivityIndicator,
  RefreshControl,
  ViewPropTypes,
  FlatListProps, TouchableOpacity
} from 'react-native';
import PropTypes from 'prop-types';
import {Theme} from '@yz1311/teaset';
import {ReducerResult} from '@yz1311/react-native-state-view';

export interface IProps extends FlatListProps<any>{
  data: Array<any>,
  loadDataResult: ReducerResult,
  totalCount: number,
  //是否已经到底了
  noMore: boolean,
  loadData: any,
  clearData?: any,
  onPageIndexChange?: any,
  footerContainerStyle?: any,
  footerTextStyle?: any,
  pageIndex?: number
}

export interface IState {
  isRefreshing: boolean
}

export default class YZFlatList extends Component<IProps,IState>
{
  //表示当前正在加载更多数据
  isLoadingMore = false;
  pageIndex = 1;
  constructor(props)
  {
    super(props);
    this.state={
      isRefreshing:false
    };
  }

  static propTypes = {
    // ...FlatList.propTypes,
    data:PropTypes.array.isRequired,
    loadDataResult:PropTypes.object.isRequired,
    totalCount:PropTypes.number.isRequired,
    //是否已经到底了
    noMore:PropTypes.bool.isRequired,
    loadData:PropTypes.func.isRequired,
    clearData:PropTypes.func,
    onPageIndexChange:PropTypes.func,
    footerContainerStyle:ViewPropTypes.style,
    footerTextStyle:PropTypes.object,
    pageIndex: PropTypes.number
  };

  static defaultProps = {
    data:[],
    totalCount:-1,
    noMore:false,
    pageIndex: 1
  };

  private uuid: any;
  public flatList: any;

  componentDidMount()
  {
    //由于有AMStateView的存在，所以放在外面触发
    // InteractionManager.runAfterInteractions(()=>{
    //   this.loadData();
    // });
  }

  UNSAFE_componentWillReceiveProps(nextProps)
  {
    if(this.props.loadDataResult !== nextProps.loadDataResult) {
      if (nextProps.loadDataResult.success) {
        //成功之后才页数
        // const targetPageIndex = nextProps.loadDataResult.parData.pageIndex||1;
        this.pageIndex++;
        // this.pageIndex = targetPageIndex;
        this.onPageIndexChange();
      }
      this.isLoadingMore = false;
      if(this.state.isRefreshing)
      {
        this.setState({
          isRefreshing:false
        });
      }
    }
    if(this.props.pageIndex !== nextProps.pageIndex) {
      this.pageIndex = nextProps.pageIndex;
    }
  }

  componentWillUnmount()
  {
    const {clearData} = this.props;
    clearData&&clearData();
  }

  _onScroll=()=>{
    // console.log('_onScroll');
    //滑动一下就可以重新触发_onEndReach了
    if(this.isLoadingMore)
    {
      this.isLoadingMore = false;
    }
  }

  _scrollToTop = ()=>{
    this.flatList.scrollToOffset({
      animated: true,
      offset: 0
    });
  }

  _onRefresh = () => {
    this.pageIndex = 1;
    this.onPageIndexChange();
    this.setState({isRefreshing: true}, () => {
      this.loadData();
    });
  }

  _onEndReach = () => {
    const {noMore} = this.props;
    console.log('YZFlatList  _onEndReach noMore:'+noMore+'  isLoadingMore:'+this.isLoadingMore);
    if (!this.isLoadingMore) {
      //继续加载下面的
      if(!noMore){
        const {loadData} = this.props;
        loadData&&loadData(this.pageIndex+1);
        this.uuid = new Date();
        this.isLoadingMore = true;
      }
    }
  }

  render()
  {
    const {data,noMore} = this.props;
    return(
        <FlatList
            ref={ref=>this.flatList=ref}
            style={[this.props.style]}
            keyExtractor={this._keyExtractor}
            onScroll={this._onScroll}
            onEndReachedThreshold={0.1}
            onEndReached={this._onEndReach}
            ListFooterComponent={()=>this._renderFooter()}
            data={data}
            refreshControl={
              <RefreshControl
                  refreshing={this.state.isRefreshing}
                  onRefresh={this._onRefresh}
                  colors={[Theme.primaryColor]}
              />
            }
            {...this.props}
        />
    );
  }

  _keyExtractor=(item,index)=>{
    return index+'';
  }

  _renderFooter = () => {
    const {noMore,footerContainerStyle,footerTextStyle,loadDataResult} = this.props;
    let promptTitle = noMore ? '没有更多内容了' : '加载中...';
    let textColor = '#666';
    //不是第一页加载错误，则在底部footer显示重新加载按钮，点击并重新加载
    let isNotFirstLoadError = (!this.isLoadingMore)&&this.pageIndex>1&&loadDataResult.error!=undefined;
    if(isNotFirstLoadError) {
      promptTitle = '重新加载';
      textColor = '#3092BE';
    }
    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={()=>{
              if(!isNotFirstLoadError) {
                return;
              }
              this._onEndReach();
              //重新显示加载中样式
              this.forceUpdate();
              const {loadData} = this.props;
              loadData&&loadData(this.pageIndex+1);
            }}
            style={[{flexDirection:'row',justifyContent: 'center', paddingTop:30,paddingBottom:30},footerContainerStyle]}>
          {noMore||isNotFirstLoadError?null:<ActivityIndicator color={Theme.primaryColor} style={{marginRight:7}}/>}
          <Text style={[{textAlign:'center', color: textColor, fontSize: isNotFirstLoadError?15:13},footerTextStyle]}>{promptTitle}</Text>
        </TouchableOpacity>
    );
  }


  loadData = ()=>{
    const {loadData} = this.props;
    loadData&&loadData(1);
    this.onPageIndexChange();
  }


  onPageIndexChange=()=>{
    const {onPageIndexChange} = this.props;
    onPageIndexChange&&onPageIndexChange(this.pageIndex);
  }
}
