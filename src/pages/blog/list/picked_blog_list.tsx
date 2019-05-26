import React,{Component} from 'react';
import {connect} from "react-redux";
import {getPickedBlogList, clearPickedBlogList} from "../../../actions/blog/blog_index_actions";
import BaseBlogList, {IBaseBlogProps as IBaseBlogListProps} from "./base_blog_list";
import {ReduxState} from "../../../reducers";
import {getBlogListRequest} from "../../../api/blog";

export interface IProps extends IBaseBlogListProps{
    isLogin?: boolean
}

@connect((state: ReduxState)=>({
    dataList: state.blogIndex.pickedBlogLis,
    loadDataResult: state.blogIndex.getPickedBlogListResult,
    noMore: state.blogIndex.pickedBlogLis_noMore,
    userInfo: state.loginIndex.userInfo,
}),dispatch=>({
    dispatch,
    loadDataFn:(data)=>dispatch(getPickedBlogList(data)),
    clearDataFn:(data)=>dispatch(clearPickedBlogList(data)),
}))
export default class picked_blog_list extends BaseBlogList<IProps,any>{
    getParams = ()=>{
        const params: getBlogListRequest = {
            request:{
                pageIndex:this.pageIndex,
                pageSize: 10
            }
        };
        return params;
    }
}