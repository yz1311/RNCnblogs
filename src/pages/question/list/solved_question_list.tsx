import React,{Component} from 'react';
import {connect} from "react-redux";
import {getQuestionList, clearQuestionList} from "../../../actions/question/question_index_actions";
import BaseQuestionList, {IBaseQuestionProps} from "./base_question_list";
import {ReduxState} from "../../../reducers";

interface IProps extends IBaseQuestionProps{
    isLogin?: boolean
}

@connect((state:ReduxState)=>({
    dataList: state.questionIndex.solved.list,
    loadDataResult: state.questionIndex.solved.loadDataResult,
    noMore: state.questionIndex.solved.noMore,
}),dispatch=>({
    dispatch,
    loadDataFn:(data)=>dispatch(getQuestionList(data)),
    clearDataFn:(data)=>dispatch(clearQuestionList(data)),
}))
export default class solved_question_list extends BaseQuestionList<IProps,any>{
    getParams = ()=>{
        const params = {
            request:{
                type: 'solved',
                pageIndex:this.pageIndex,
                pageSize: 10,
                spaceUserId: 0
            }
        };
        return params;
    }
}
