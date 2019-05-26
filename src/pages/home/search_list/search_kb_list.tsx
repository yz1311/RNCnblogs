import React, {Component} from 'react'
import {
    StyleSheet,
    View,
    DeviceEventEmitter, EmitterSubscription
} from 'react-native'
import {connect} from 'react-redux';
import {searchData, clearSearchData} from "../../../actions/home/home_index_actions";
import BaseKnowledgeBaseList, {IBaseKnowledgeProps} from '../../knowledgeBase/base_knowledgeBase_list';
import {ReduxState} from "../../../reducers";

interface IProps extends IBaseKnowledgeProps{
    type: string,
    keyWords: string
}

interface IState {

}

@connect((state:ReduxState)=>({
    dataList: state.homeIndex.kb.list,
    loadDataResult: state.homeIndex.kb.getListResult,
    noMore: state.homeIndex.kb.noMore,
}),dispatch=>({
    dispatch,
    loadDataFn:(data)=>dispatch(searchData(data)),
    clearDataFn:(data)=>dispatch(clearSearchData(data)),
}))
export default class search_kb_list extends BaseKnowledgeBaseList<IProps,IState>{
    private reloadListener:EmitterSubscription;

    componentDidMount() {
        //刚进入为空则禁止加载就刷新
        if (this.props.keyWords != undefined && this.props.keyWords !== '')
        {
            super.componentDidMount();
        }
        this.reloadListener = DeviceEventEmitter.addListener('search_kb_list_reload',()=>{
            console.log('search_kb_list_reload')
           this.pageIndex = 1;
           this.loadData();
        });
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this.reloadListener.remove();
    }

    getParams = ()=>{
        const params = {
            request:{
                blogApp: undefined,
                category: 'kb',
                keyWords: this.props.keyWords,
                pageIndex:this.pageIndex,
                pageSize: 15
            },
            type: this.props.type
        };
        return params;
    }
}
