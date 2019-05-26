import React,{Component} from 'react';
import {connect} from "react-redux";
import {getRecommendedNewsList, clearRecommendedNewsList} from "../../actions/news/news_index_actions";
import BaseNewsList, {IBaseNewsProps} from "./base_news_list";
import {ReduxState} from '../../reducers';

interface IProps extends IBaseNewsProps{

}

interface IState {

}


@connect((state: ReduxState)=>({
    dataList: state.newsIndex.recommendedNewsList,
    loadDataResult: state.newsIndex.getRecommendedNewsListResult,
    noMore: state.newsIndex.recommendedNewsList_noMore,
}),dispatch=>({
    dispatch,
    loadDataFn:(data)=>dispatch(getRecommendedNewsList(data)),
    clearDataFn:(data)=>dispatch(clearRecommendedNewsList(data)),
}))
export default class recommended_news_list extends BaseNewsList<IBaseNewsProps,IState>{
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