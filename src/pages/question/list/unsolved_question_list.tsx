import React,{Component} from 'react';
import {connect} from "react-redux";
import {getQuestionList, clearQuestionList} from "../../../actions/question/question_index_actions";
import BaseQuestionList, {IBaseQuestionProps} from "./base_question_list";
import {DeviceEventEmitter, EmitterSubscription} from "react-native";
import {ReduxState} from "../../../reducers";

interface IProps extends IBaseQuestionProps{
    isLogin?: boolean
}

@connect((state:ReduxState)=>({
    dataList: state.questionIndex.unsolved.list,
    loadDataResult: state.questionIndex.unsolved.getListResult,
    noMore: state.questionIndex.unsolved.noMore,
}),dispatch=>({
    dispatch,
    loadDataFn:(data)=>dispatch(getQuestionList(data)),
    clearDataFn:(data)=>dispatch(clearQuestionList(data)),
}))
export default class unsolved_question_list extends BaseQuestionList<IProps,any>{
    private reloadListener:EmitterSubscription;
    constructor(props)
    {
        super(props);
        this.reloadListener = DeviceEventEmitter.addListener('reload_unsolved_list',()=>{
            this.pageIndex = 1;
            this.loadData();
        });
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this.reloadListener&&this.reloadListener.remove();
    }

    getParams = ()=>{
        const params = {
            request:{
                type: 'unsolved',
                pageIndex:this.pageIndex,
                pageSize: 10,
                spaceUserId: 0
            }
        };
        return params;
    }
}