import React,{Component} from 'react';
import {connect} from "react-redux";
import {getNewsList, clearNewsList} from "../../actions/news/news_index_actions";
import BaseNewsList, {IBaseNewsProps} from "./base_news_list";
import {ReduxState} from "../../reducers";

interface IProps extends IBaseNewsProps{

}

interface IState {

}

@connect((state: ReduxState)=>({
    dataList: state.newsIndex.newsList,
    loadDataResult: state.newsIndex.getNewsListResult,
    noMore: state.newsIndex.newsList_noMore,
}),dispatch=>({
    dispatch,
    loadDataFn:(data)=>dispatch(getNewsList(data)),
    clearDataFn:(data)=>dispatch(clearNewsList(data)),
}))
export default class latest_news_list extends BaseNewsList<IProps,IState>{
    getParams = ()=>{
        const params = {
            request:{
                pageIndex:this.pageIndex,
                pageSize: 10
            }
        };
        return params;
    }
}