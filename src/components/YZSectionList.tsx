import React,{Component} from 'react';
import {
    View,
    FlatList,
    Text,
    InteractionManager,
    ActivityIndicator,
    RefreshControl,
    SectionList
} from 'react-native';
import PropTypes from 'prop-types';
import YZFlatList from './YZFlatList';

export default class YZSectionList extends YZFlatList
{

    render()
    {
        const {data,noMore} = this.props;
        return(
            <SectionList
                style={[this.props.style]}
                keyExtractor={this._keyExtractor}
                onScroll={this._onScroll}
                onEndReachedThreshold={0.1}
                onEndReached={this._onEndReach}
                ListFooterComponent={()=>this._renderFooter()}
                sections={data}
                refreshControl={
                    <RefreshControl
                        refreshing={this.state.isRefreshing}
                        onRefresh={this._onRefresh}
                        colors={[gColors.themeColor]}
                    />
                }
                {...this.props}
            />
        );
    }
}