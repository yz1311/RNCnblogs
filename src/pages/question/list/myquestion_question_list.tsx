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
    dataList: state.questionIndex.myquestion.list,
    loadDataResult: state.questionIndex.myquestion.getListResult,
    noMore: state.questionIndex.myquestion.noMore,
    isLogin: state.loginIndex.isLogin,
}),dispatch=>({
    dispatch,
    loadDataFn:(data)=>dispatch(getQuestionList(data)),
    clearDataFn:(data)=>dispatch(clearQuestionList(data)),
}))
export default class myquestion_question_list extends BaseQuestionList<IProps,any>{
    mustLogin = true;
    private reloadListener:EmitterSubscription;

    componentDidMount() {
        if(this.props.isLogin)
        {
            super.componentDidMount();
        }
    }

    constructor(props)
    {
        super(props);
        this.reloadListener = DeviceEventEmitter.addListener('reload_myquestion_list',()=>{
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
                type: 'myquestion',
                pageIndex:this.pageIndex,
                pageSize: 10,
                spaceUserId: 0
            }
        };
        return params;
    }
}