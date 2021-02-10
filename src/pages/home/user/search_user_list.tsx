import React, {PureComponent} from 'react';
import {DeviceEventEmitter, EmitterSubscription, StyleSheet, View,} from 'react-native';
import {Styles} from '../../../common/styles';
import SearchUserListItem from './search_user_list_item';
import {
  createReducerResult,
  dataToPagingResult,
  dataToReducerResult,
  LoadDataResultStates,
  ReducerResult, StateView,
} from '@yz1311/react-native-state-view';
import YZFlatList from "../../../components/YZFlatList";
import {Api} from "../../../api";
import {SearchParams} from "../../home/home_search";
import {NavigationBar} from "@yz1311/teaset";
import {searchUserModal} from "../../../api/home";
import YZSafeAreaView from "../../../components/YZSafeAreaView";

export interface IProps {
    title?: string;
    navigation: any,
    loadData?: Function,
    userInfo?: any,
    keyword?: string,
    searchParams?: SearchParams,
    userAvatar?: string;
}

export interface IState {
    dataList?: Array<searchUserModal>;
    stickyList: Array<searchUserModal>;
    loadDataResult?: ReducerResult;
    noMore?: boolean;
    tabIndex?: number;
}

export default class SearchUserList extends PureComponent<IProps,Partial<IState>> {

    protected mustLogin: boolean = false;
    pageIndex = 1;
    private searchReloadListener: EmitterSubscription;
    private _flatList: YZFlatList;

    readonly state:IState = {
        dataList: [],
        stickyList: [],
        noMore: false,
        loadDataResult: createReducerResult()
    };

    constructor(props) {
        super(props);
        this.searchReloadListener = DeviceEventEmitter.addListener('search_user_list_reload', ()=>{
            //重新加载
            this.setState({
                loadDataResult: createReducerResult({
                    state: LoadDataResultStates.loading
                })
            });
            this.pageIndex = 1;
            this.loadData();
        })
    }

    componentDidMount(): void {
        this.loadData();
    }


    componentWillUnmount() {
        this.searchReloadListener.remove();
    }

    loadData = async ()=>{
        let action:any = ()=>{
            return ;
        };
        let pageSize = 30;
        action = ()=>{
            return Api.home.searchUsers({
                request: {
                    pageIndex: this.pageIndex,
                    name: this.props.keyword,
                    // ...(this.props.searchParams||{})
                }
            });
        };
        try {
            let response = await action();
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
        return <SearchUserListItem item={item} />;
    };

    render() {
        return (
            <YZSafeAreaView>
                {this.props.title ?
                    <NavigationBar title={this.props.title}/>
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
            </YZSafeAreaView>
        );
    }
}

const styles = StyleSheet.create({});

