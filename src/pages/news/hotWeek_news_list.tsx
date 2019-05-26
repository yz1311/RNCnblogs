import React,{Component} from 'react';
import {connect} from "react-redux";
import {getHowWeekNewsList, clearHowWeekNewsList} from "../../actions/news/news_index_actions";
import BaseNewsList, {IBaseNewsProps} from "./base_news_list";
import {IBaseDataPageProps} from "../../components/YZBaseDataPage";
import {ReduxState} from "../../reducers";

interface IProps extends IBaseNewsProps{

}

interface IState {

}

@connect((state: ReduxState)=>({
    dataList: state.newsIndex.hotWeekNewsList,
    loadDataResult: state.newsIndex.getHotWeekNewsListResult,
    noMore: state.newsIndex.hotWeekNewsList_noMore,
}),dispatch=>({
    dispatch,
    loadDataFn:(data)=>dispatch(getHowWeekNewsList(data)),
    clearDataFn:(data)=>dispatch(clearHowWeekNewsList(data)),
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