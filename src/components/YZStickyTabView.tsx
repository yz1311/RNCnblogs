import React, {PureComponent} from "react";
import {
    View,
    Text, SectionList,
    SectionListProps, StyleProp, ViewStyle, RefreshControl, TouchableOpacity, ActivityIndicator, Image
} from "react-native";
import ScrollableTabView, {ChangeTabProperties} from '@yz1311/react-native-scrollable-tab-view';
import {Theme} from "@yz1311/teaset";
import YZStateCommonView from "./YZStateCommonView";
import {ReducerResult} from "../utils/requestUtils";

export type IStickyData = {
    noMore?: boolean,
    loadData: Function,
    content?: any,
    loadDataResult: ReducerResult,
    onPageIndexChange: (pageIndex: number) => void,
} & Partial<SectionListProps<any>>;

interface IProps {
    style?: StyleProp<ViewStyle>,
    onChangeTab?: (value: ChangeTabProperties) => void,
    headerComponent: any,
    renderTabBar: any,
    data: Array<IStickyData>
}

interface IState {
    selectedTab: number,
    listHeight: number,
    listHeaderHeight: number,
    isRefreshingArray: Array<boolean>
}

export default class YZStickyTabView extends PureComponent<IProps, IState> {

    private myScrollTab: any;
    private sectionListRefs: Array<any> = [];
    private listHeader: View;
    private fixedHeader: View;
    private isLoadingMoreArray: Array<boolean> = [];
    private pageIndexArray: Array<number> = [];

    readonly state: IState = {
        selectedTab: 0,
        listHeight: 0,
        listHeaderHeight: 0,
        isRefreshingArray: []
    }

    componentDidMount(): void {
        this.pageIndexArray = Array.from({length: this.props.data.length}, () => 1);
    }

    renderHeader = () => {
        return (
            <View ref={ref => this.listHeader = ref}
                  onLayout={event => {
                      if (event.nativeEvent.layout.height > 0) {
                          this.setState({
                              listHeaderHeight: event.nativeEvent.layout.height
                          })
                      }
                  }}
                  style={{backgroundColor: 'white'}}>
                {this.props.headerComponent}
            </View>
        );
    }

    goToPage = (activeTab: number) => {
        this.setFixedHeaderVisible(true);
        setTimeout(() => {
            this.myScrollTab && this.myScrollTab.goToPage(activeTab);
        }, 30)
        setTimeout(() => {
            this.setFixedHeaderVisible(false);
        }, 500)
    }

    _keyExtractor = (item, index) => {
        return index + '';
    }

    _onRefresh = (item: any, index: number) => {
        this.pageIndexArray[index] = 1;
        item.onPageIndexChange && item.onPageIndexChange(this.pageIndexArray[index]);
        this.changeIsRefreshing(index, true);
        console.log('onRefresh:' + index);
        item.loadData && item.loadData(this.pageIndexArray[index]);
    }

    _onScroll = (index) => {
        // console.log('_onScroll');
        //滑动一下就可以重新触发_onEndReach了
        if (this.isLoadingMoreArray[index]) {
            this.isLoadingMoreArray[index] = false;
        }
        this.setFixedHeaderVisible(false);
    }

    setFixedHeaderVisible = (visible) => {
        this.fixedHeader && this.fixedHeader.setNativeProps({
            style: {
                opacity: visible ? 1 : 0,
                zIndex: visible ? 1 : -1
            }
        });
    }

    UNSAFE_componentWillReceiveProps(nextProps: IProps) {
        if (this.props.data !== nextProps.data) {
            for (let i = 0; i < nextProps.data.length; i++) {
                if (this.props.data[i] !== nextProps.data[i] && nextProps.data[i].loadDataResult.success) {
                    if (nextProps.data[i].loadDataResult.pageIndex) {
                        this.pageIndexArray[i] = nextProps.data[i].loadDataResult.pageIndex + 1;
                    } else {
                        this.pageIndexArray[i] = this.pageIndexArray[i] + 1;
                    }
                    nextProps.data[i].onPageIndexChange && nextProps.data[i].onPageIndexChange(this.pageIndexArray[i]);
                }
                this.isLoadingMoreArray[i] = false;
                if (this.state.isRefreshingArray[i]) {
                    this.changeIsRefreshing(i, false);
                }
            }
        }
        // if(this.props.pageIndex !== nextProps.pageIndex) {
        //   this.pageIndex = nextProps.pageIndex;
        // }
    }

    changeIsRefreshing = (activeTab, isRefreshing) => {
        this.setState({
            isRefreshingArray: [
                ...this.state.isRefreshingArray.slice(0, activeTab),
                isRefreshing,
                ...this.state.isRefreshingArray.slice(activeTab + 1, activeTab),
            ]
        });
    }

    _onEndReach = (data, activeTab = this.state.selectedTab) => {
        console.log('_onEndReach:' + activeTab)
        const {noMore} = data;
        if (!this.isLoadingMoreArray[activeTab]) {
            //继续加载下面的
            if (!noMore) {
                const {loadData} = data;
                loadData && loadData(this.pageIndexArray[activeTab]);
                this.isLoadingMoreArray[activeTab] = true;
            }
        }
    }

    _renderFooter = (data, activeTab = this.state.selectedTab) => {
        const {noMore, footerContainerStyle, footerTextStyle, loadDataResult} = data;
        let promptTitle = noMore ? '没有更多内容了' : '加载中...';
        let textColor = '#666';
        //不是第一页加载错误，则在底部footer显示重新加载按钮，点击并重新加载
        let isNotFirstLoadError = (!this.isLoadingMoreArray[activeTab]) && this.pageIndexArray[activeTab] > 1 && loadDataResult.error != undefined;
        if (isNotFirstLoadError) {
            promptTitle = '重新加载';
            textColor = '#3092BE';
        }
        if ((loadDataResult as ReducerResult).success && data.data.length == 0) {
            return (
                <TouchableOpacity activeOpacity={0.75}
                                  onPress={(args) => {
                                      // if (errorButtonAction) {
                                      //   this.setState({
                                      //     state: 'loading'
                                      //   });
                                      //   errorButtonAction(args);
                                      // }
                                  }}
                                  style={[{backgroundColor: gColors.bgColorF, paddingTop: 80, paddingBottom: 50}]}>
                    <View style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <Image source={require('../resources/img/app_nocontent.png')}
                               style={[{width: Theme.px2dp(131), height: Theme.px2dp(130)}]} resizeMode="contain"/>
                        <Text style={[{color: gColors.color999, marginTop: 15, fontSize: Theme.px2dp(30)}]}>
                            {'暂无数据'}
                        </Text>
                    </View>
                </TouchableOpacity>
            );
        }
        //TODO：显示错误信息页面
        return (
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => {
                    if (!isNotFirstLoadError) {
                        return;
                    }
                    this._onEndReach(data, activeTab);
                    //重新显示加载中样式
                    this.forceUpdate();
                    const {loadData} = data;
                    loadData && loadData(this.pageIndexArray[activeTab] + 1);
                }}
                style={[{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    paddingTop: 30,
                    paddingBottom: 30
                }, footerContainerStyle]}>
                {noMore || isNotFirstLoadError ? null :
                    <ActivityIndicator color={Theme.primaryColor} style={{marginRight: 7}}/>}
                <Text style={[{
                    textAlign: 'center',
                    color: textColor,
                    fontSize: isNotFirstLoadError ? 15 : 13
                }, footerTextStyle]}>{promptTitle}</Text>
            </TouchableOpacity>
        );
    }


    render() {
        return (
            <View
                onLayout={event => {
                    if (event.nativeEvent.layout.height > 0) {
                        this.setState({
                            listHeight: event.nativeEvent.layout.height
                        })
                    }
                }}
                style={[{flex: 1}, this.props.style]}>
                <ScrollableTabView
                    ref={ref => this.myScrollTab = ref}
                    prerenderingSiblingsNumber={this.props.data.length}
                    onChangeTab={value => {
                        this.setState({selectedTab: value.i});
                        this.props.onChangeTab && this.props.onChangeTab(value);
                    }}
                    scrollWithoutAnimation={false}
                    onScroll={scrollX => {
                        //横向滚动的时候，利用fixedHeader隐藏header，不让其滚动
                        this.setFixedHeaderVisible(true);
                    }}
                    locked={false}
                    renderTabBar={() => <View/>}>
                    {
                        this.props.data.map((item, index) => {
                            return (
                                <SectionList
                                    key={index}
                                    ref={ref => this.sectionListRefs[index] = ref}
                                    scrollEventThrottle={2}
                                    contentContainerStyle={{minHeight: this.state.listHeight + this.state.listHeaderHeight}}
                                    stickySectionHeadersEnabled={true}
                                    sections={[
                                        {
                                            title: '',
                                            data: item.data || []
                                        }
                                    ]}
                                    ListHeaderComponent={this.renderHeader}
                                    ListFooterComponent={(
                                        <View>
                                            {item.content ?
                                                item.content
                                                :
                                                this._renderFooter(item)
                                            }
                                        </View>
                                    )}
                                    renderSectionHeader={({section}) => {
                                        return this.props.renderTabBar && this.props.renderTabBar(this.state.selectedTab, this.goToPage);
                                    }}
                                    keyExtractor={this._keyExtractor}
                                    onEndReachedThreshold={0.1}
                                    {...item}
                                    onScroll={e => {
                                        this._onScroll(index);
                                        let scrollY = e.nativeEvent.contentOffset.y < this.state.listHeaderHeight ? e.nativeEvent.contentOffset.y : this.state.listHeaderHeight;
                                        if (this.state.selectedTab == index) {
                                            for (let i = 0; i < this.props.data.length; i++) {
                                                if (index != i) {
                                                    this.sectionListRefs[i]._wrapperListRef._listRef._scrollRef.getScrollResponder().scrollTo({
                                                        y: scrollY,
                                                        animated: false
                                                    });
                                                }
                                            }
                                        }
                                        this.fixedHeader && this.fixedHeader.setNativeProps({
                                            style: {
                                                top: -scrollY
                                            }
                                        });
                                    }}
                                    refreshControl={
                                        <RefreshControl
                                            refreshing={this.state.isRefreshingArray[index] || false}
                                            onRefresh={() => {
                                                this._onRefresh(item, index)
                                            }}
                                            colors={[Theme.primaryColor]}
                                        />
                                    }
                                    // onRefresh={()=>{
                                    //   if(this.state.selectedTab==index) {
                                    //     item.onRefresh&&item.onRefresh();
                                    //   }
                                    // }}
                                    onEndReached={(event) => {
                                        // if (this.state.selectedTab == index) {
                                        //   item.onEndReached && item.onEndReached(event);
                                        //   this._onEndReach(item);
                                        // }
                                        item.onEndReached && item.onEndReached(event);
                                        this._onEndReach(item, index);
                                    }}
                                />
                            );
                        })
                    }
                </ScrollableTabView>
                <View ref={ref => this.fixedHeader = ref}
                      style={{position: 'absolute', left: 0, right: 0, zIndex: -1, opacity: 0}}>
                    {this.props.headerComponent}
                    {this.props.renderTabBar && this.props.renderTabBar(this.state.selectedTab, this.goToPage)}
                </View>
            </View>
        );
    }
}
