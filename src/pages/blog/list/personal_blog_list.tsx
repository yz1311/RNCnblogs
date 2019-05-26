import React, {Component} from 'react'
import {
    StyleSheet,
    View,
} from 'react-native'
import {connect} from 'react-redux';
import {getPersonalBlogList, clearPersonalBlogList} from '../../../actions/blog/blog_index_actions';
import BaseBlogList, {IBaseBlogProps as IBaseBlogListProps} from './base_blog_list';
import {ReduxState} from "../../../reducers";
import {getBlogListRequest} from "../../../api/blog";

export interface IProps extends IBaseBlogListProps{
    isLogin: boolean
}

@connect((state: ReduxState)=>({
    dataList: state.blogIndex.personalBlogList,
    loadDataResult: state.blogIndex.getPersonalBlogListResult,
    noMore: state.blogIndex.personalBlogList_noMore,
    userInfo: state.loginIndex.userInfo,
}),dispatch=>({
    dispatch,
    loadDataFn:(data)=>dispatch(getPersonalBlogList(data)),
    clearDataFn:(data)=>dispatch(clearPersonalBlogList(data)),
}))
export default class personal_blog_list extends BaseBlogList<IProps,any>{
    static navigationOptions = ({navigation})=>{
        return {
            title: '我的博文'
        };
    }

    getParams = ()=>{
        const params: getBlogListRequest = {
            request:{
                blogApp: this.props.userInfo.BlogApp || 'yz1311',
                pageIndex:this.pageIndex
            }
        };
        return params;
    }
}


const styles = StyleSheet.create({

});
