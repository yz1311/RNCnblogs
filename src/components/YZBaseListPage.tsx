import React, {Component} from 'react';
import {
    DeviceEventEmitter,
    Platform,
    View,
    Text,
    InteractionManager
} from 'react-native';
import {connect} from 'react-redux';
import YZBaseDataPage, {IBaseDataPageProps} from './YZBaseDataPage';
import {showToast} from "../actions/app_actions";

export interface IProps extends IBaseDataPageProps{
    dataList?: Array<any>,
    loadDataResult?: any,
    noMore?: boolean,
    getDataResult?: any,
    dispatch?: any
}

interface IState {
    isRefreshing: boolean
}

export default class YZBaseListPage<T extends IProps> extends YZBaseDataPage<T,IState> {

    page = 1
    state = {
        isRefreshing: false,
    }

    getParams = ()=>{
        const params = {
            request:{
                page_index:this.page,
                page_num:10,
            }
        };
        return params;
    }

    componentWillReceiveProps(nextProps)
    {
        if(this.props.getDataResult !== nextProps.getDataResult)
        {
            if(nextProps.getDataResult.success&&this.state.isRefreshing)
            {
                this.props.dispatch(showToast('刷新成功!'));
            }
            this.setState({
                isRefreshing:false
            });
        }
    }

    _renderFooter = () => {
        const {noMore} = this.props;
        const promptTitle = noMore ? '没有更多内容了' : '加载中...';
        return (
            <View style={{height: 40, justifyContent: 'center', alignItems: 'center'}}>
                <Text style={{textAlign:'center', color: gColors.color666, fontSize: gFont.size13}}>{promptTitle}</Text>
            </View>
        );
    }

    _onRefresh = () => {
        this.page = 1;
        this.setState({isRefreshing: true}, () => {
            this.loadData();
        });
    }

    _onLoadMore = () => {
        const {noMore} = this.props;
        if (!noMore) {
            this.page++;
            const {loadDataFn} = this.props;
            loadDataFn(this.getParams());
        }
    }

    _keyExtractor=(item,index)=>{
        return index+'';
    }

}