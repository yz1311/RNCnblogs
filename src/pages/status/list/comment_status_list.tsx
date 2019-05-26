import React,{Component} from 'react';
import {connect} from "react-redux";
import {getStatusList, clearStatusList} from "../../../actions/status/status_index_actions";
import BaseStatusList, {IBaseStatusProps} from "./base_status_list";
import {ReduxState} from "../../../reducers";

interface IProps extends IBaseStatusProps{
    isLogin?: boolean
}

@connect((state:ReduxState)=>({
    dataList: state.statusIndex.comment.list,
    loadDataResult: state.statusIndex.comment.getListResult,
    noMore: state.statusIndex.comment.noMore,
    isLogin: state.loginIndex.isLogin,
}),dispatch=>({
    dispatch,
    loadDataFn:(data)=>dispatch(getStatusList(data)),
    clearDataFn:(data)=>dispatch(clearStatusList(data)),
}))
export default class comment_status_list extends BaseStatusList<IProps,any>{
    type = 'comment';

    mustLogin = true;
    componentDidMount() {
        if(this.props.isLogin)
        {
            super.componentDidMount();
        }
    }

    getParams = ()=>{
        const params = {
            request:{
                type: this.type,
                pageIndex:this.pageIndex,
                pageSize: 10
            }
        };
        return params;
    }
}