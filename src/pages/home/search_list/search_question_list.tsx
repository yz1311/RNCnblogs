import React,{Component} from 'react';
import {connect} from "react-redux";
import {searchData, clearSearchData} from "../../../actions/home/home_index_actions";
import BaseQuestionList, {IBaseQuestionProps} from "../../question/list/base_question_list";
import {DeviceEventEmitter, EmitterSubscription} from "react-native";
import {IBaseDataPageProps} from "../../../components/YZBaseDataPage";
import {ReduxState} from "../../../reducers";

interface IProps extends IBaseQuestionProps{
    type: string,
    keyWords: string
}

interface IState {

}

@connect((state:ReduxState)=>({
    dataList: state.homeIndex.question.list,
    loadDataResult: state.homeIndex.question.getListResult,
    noMore: state.homeIndex.question.noMore,
}),dispatch=>({
    dispatch,
    loadDataFn:(data)=>dispatch(searchData(data)),
    clearDataFn:(data)=>dispatch(clearSearchData(data)),
}))
export default class search_question_list extends BaseQuestionList<IProps,IState>{
    private reloadListener:EmitterSubscription;

    componentDidMount() {
        //刚进入为空则禁止加载就刷新
        if (this.props.keyWords != undefined && this.props.keyWords !== '')
        {
            super.componentDidMount();
        }
        this.reloadListener = DeviceEventEmitter.addListener('search_question_list_reload',()=>{
            console.log('search_question_list_reload')
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
                category: 'question',
                keyWords: this.props.keyWords,
                pageIndex:this.pageIndex,
                pageSize: 15
            },
            type: this.props.type
        };
        return params;
    }
}