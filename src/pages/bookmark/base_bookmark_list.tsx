import React, {PureComponent} from 'react';
import {DeviceEventEmitter, EmitterSubscription, StyleSheet, View} from 'react-native';
import YZFlatList from '../../components/YZFlatList';
import {Styles} from '../../common/styles';
import BookmarkItem from './bookmark_item';
import {Api} from '../../api';
import {
  createReducerResult,
  dataToPagingResult,
  dataToReducerResult,
  ReducerResult,
  StateView,
} from '@yz1311/react-native-state-view';

export interface IProps {
    tabLabel?: string;
    navigation?: any;
    bookmarkType: string;
}

interface IState {
    dataList: Array<any>;
    loadDataResult: ReducerResult;
    noMore: boolean;
}

export default class base_bookmark_list extends PureComponent<IProps, IState> {
    protected pageIndex: number = 1;
    private scrollListener: EmitterSubscription;
    private refreshListener: EmitterSubscription;
    private _flatList: YZFlatList;
    private reloadListener:EmitterSubscription;

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
                if (tabIndex === this.props.bookmarkType) {
                    //Todo:
                    //@ts-ignore
                    this._flatList && this._flatList._scrollToTop();
                }
            },
        );
        this.refreshListener = DeviceEventEmitter.addListener(
            'list_refresh',
            ({tabIndex}) => {
                if (tabIndex === this.props.bookmarkType) {
                    this._flatList && this._flatList._onRefresh();
                }
            },
        );
        this.reloadListener = DeviceEventEmitter.addListener('reload_bookmark_list',this.onRefresh);
    }

    componentDidMount(): void {
        this.loadData();
    }

    componentWillUnmount() {
        this.scrollListener.remove();
        this.refreshListener.remove();
        this.reloadListener&&this.reloadListener.remove();
    }

    onRefresh = ()=>{
        this._flatList&&this._flatList._onRefresh();
    }

    loadData = async ()=>{
        try {
            let response = await Api.bookmark.getBookmarkList({
                request: {
                    bookmarkType: this.props.bookmarkType,
                    pageIndex: this.pageIndex
                }
            });
            let pagingResult = dataToPagingResult(this.state.dataList,response.data || [],this.pageIndex,20);
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
        return <BookmarkItem item={item} navigation={this.props.navigation} bookmarkType={this.props.bookmarkType} />;
    };

    render() {
        return (
            <View style={[Styles.container]}>
                <StateView
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
                </StateView>
            </View>
        );
    }
}

const styles = StyleSheet.create({});
