import React,{Component} from 'react';
import {connect} from "react-redux";
import {getStatusList, clearStatusList} from "../../../actions/status/status_index_actions";
import BaseStatusList, {IBaseStatusProps} from "./base_status_list";
import {DeviceEventEmitter, EmitterSubscription} from "react-native";
import {ReduxState} from "../../../reducers";

interface IProps extends IBaseStatusProps{
    isLogin?: boolean
}

@connect((state:ReduxState)=>({
    dataList: state.statusIndex.my.list,
    loadDataResult: state.statusIndex.my.loadDataResult,
    noMore: state.statusIndex.my.noMore,
    isLogin: state.loginIndex.isLogin,
}),dispatch=>({
    dispatch,
    loadDataFn:(data)=>dispatch(getStatusList(data)),
    clearDataFn:(data)=>dispatch(clearStatusList(data)),
}))
export default class my_status_list extends BaseStatusList<IProps,any>{
    type = 'my';
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
        this.reloadListener = DeviceEventEmitter.addListener('reload_my_status_list',()=>{
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
                type: this.type,
                pageIndex:this.pageIndex,
                pageSize: 10
            }
        };
        return params;
    }
}
