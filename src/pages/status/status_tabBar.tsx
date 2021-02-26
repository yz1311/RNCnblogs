

import React, {Component} from 'react';
import {DefaultTabBar, ScrollableTabBar} from "@yz1311/react-native-scrollable-tab-view";
import {StyleSheet, TouchableOpacity, View, Text} from "react-native";
const Button = require('@yz1311/react-native-scrollable-tab-view/Button');
import {Badge, Theme} from '@yz1311/teaset';

export default class StatusTabBar extends ScrollableTabBar {
    renderTab = (name, page, isTabActive, onPressHandler, onLayoutHandler) => {
        //@ts-ignore
        const { activeTextColor, inactiveTextColor, textStyle, activeTextFontSize, inactiveTextFontSize, statusMetionCount, statusReplyCount } = this.props;
        const textColor = isTabActive ? activeTextColor : inactiveTextColor;
        const textFontSize = isTabActive? activeTextFontSize : inactiveTextFontSize;
        const fontWeight = isTabActive ? 'bold' : 'normal';

        return <Button
            key={`${name}_${page}`}
            accessible={true}
            accessibilityLabel={name}
            accessibilityTraits='button'
            onPress={() => onPressHandler(page)}
            onLayout={onLayoutHandler}
        >
            <View style={[styles.tab, this.props.tabStyle, ]}>
                <Text style={[{color: textColor, fontSize: textFontSize, fontWeight, }, textStyle, ]}>
                    {name}
                </Text>
            </View>
            {(statusMetionCount>0) && page === 5?
                <Badge
                    style={{position:'absolute', top: Theme.px2dp(10), right: -Theme.px2dp(10)}}
                    type="dot"
                    count={statusMetionCount}
                />:null}
            {(statusReplyCount>0) && page === 6?
                <Badge
                    style={{position:'absolute', top: Theme.px2dp(10), right: -Theme.px2dp(10)}}
                    type="dot"
                    count={statusReplyCount}
                />:null}
        </Button>;
    }
}

const styles = StyleSheet.create({
    tab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    flexOne: {
        flex: 1,
    },
});
