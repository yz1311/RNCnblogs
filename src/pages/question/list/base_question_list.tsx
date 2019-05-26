import React, {Component} from 'react'
import {
    DeviceEventEmitter, EmitterSubscription,
    StyleSheet,
    View,
} from 'react-native'
import {connect} from 'react-redux';
import YZHeader from '../../../components/YZHeader';
import YZBaseDataPage, {IBaseDataPageProps} from '../../../components/YZBaseDataPage';
import YZStateView from '../../../components/YZStateCommonView';
import YZFlatList from '../../../components/YZFlatList';
import Styles from '../../../common/styles';
import Feather from 'react-native-vector-icons/Feather';
import {ListRow} from 'teaset';
import QuestionItem from '../question_item'
import CommonUtils from "../../../utils/commonUtils";

export interface IBaseQuestionProps extends IBaseDataPageProps{
    dataList?: Array<any>,
    noMore?: boolean,
    tabIndex?: number
}

interface IState {

}

export default class base_question_list<P extends IBaseQuestionProps,S> extends YZBaseDataPage<P,S> {
    pageIndex = 1;
    lastScrollY:number = 0;
    protected mustLogin: boolean;
    private scrollListener:EmitterSubscription;
    private refreshListener:EmitterSubscription;
    private _flatList:any;

    constructor(props)
    {
        super(props);
        this.scrollListener = DeviceEventEmitter.addListener('list_scroll_to_top',({tabIndex})=>{
            if(tabIndex === this.props.tabIndex) {
                this._flatList&&this._flatList._scrollToTop();
            }
        });
        this.refreshListener = DeviceEventEmitter.addListener('list_refresh',({tabIndex})=>{
            if(tabIndex === this.props.tabIndex) {
                this._flatList&&this._flatList._onRefresh();
            }
        });
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this.scrollListener.remove();
        this.refreshListener.remove();
    }

    _renderItem=({item, index})=>{
        return (
            <QuestionItem
                item={item}
                navigation={this.props.navigation}
            />
        );
    }

    _handleScroll = (event)=>{
        let curScrollY = event.nativeEvent.contentOffset.y;
        // 向下滑动了20
        if(curScrollY - this.lastScrollY > 20)
        {
            console.log('向下滑动了20')
            DeviceEventEmitter.emit('toggleActionButton_question', false);
        }
        // 向上滑动了20
        else if(curScrollY - this.lastScrollY < -20)
        {
            console.log('向上滑动了20')
            DeviceEventEmitter.emit('toggleActionButton_question', true);
        }
        this.lastScrollY = curScrollY;
    }

    render() {
        return (
            <View
                style={[Styles.container]}>
                <YZStateView getResult={this.props.loadDataResult}
                             placeholderTitle="暂无数据"
                             mustLogin={this.mustLogin || false}
                             errorButtonAction={this.loadData}>
                    <YZFlatList
                        ref={ref=>this._flatList = ref}
                        onScroll={CommonUtils.throttle(this._handleScroll, 500)}
                        renderItem={this._renderItem}
                        data={this.props.dataList}
                        loadDataResult={this.props.loadDataResult}
                        noMore={this.props.noMore}
                        initialNumToRender={20}
                        loadData={this.loadData}
                        onPageIndexChange={pageIndex=>{
                            this.pageIndex = pageIndex;
                        }}
                        ItemSeparatorComponent={()=><View style={{height:10,backgroundColor:'transparent'}}/>}
                    />
                </YZStateView>
            </View>
        )
    }
}


const styles = StyleSheet.create({

});
