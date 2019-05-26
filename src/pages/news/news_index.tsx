import React, {Component} from 'react'
import {
    StyleSheet,
    View,
} from 'react-native'
import {connect} from 'react-redux';
import Styles from '../../common/styles';
import HomeTabBar from '../home/home_indexTab';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import LatestNewsList from './latest_news_list';
import HotWeekNewsList from './hotWeek_news_list';
import RecommendedNewsList from './recommended_news_list';
import {NavigationScreenProp, NavigationState} from "react-navigation";

interface IProps {
    navigation: NavigationScreenProp<NavigationState>,
    initialPage?: number,
    tabIndex: number
}

interface IState {
    tabNames: Array<string>,
}

@connect(state=>({

}),dispatch=>({
    dispatch,
}))
export default class news_index extends Component<IProps,IState> {
    private tabBar:any;

    constructor(props)
    {
        super(props);
        this.state = {
            tabNames: ['最新', '推荐', '热门'],
        };
    }

    _onChangeTab = obj => {
        switch (obj.i)
        {
            case 0:

                break;
            case 1:    //eslint-disable-line

                break;
            case 2:

                break;
        }
    }

    render() {
        const {tabNames} = this.state;
        return (
            <View
                style={[Styles.container]}>
                {__IOS__?<View style={{height:gScreen.statusBarHeight,backgroundColor:gColors.themeColor}}/>:null}
                <ScrollableTabView
                    renderTabBar={() =>
                        <HomeTabBar
                            ref={bar=>this.tabBar = bar}
                            containerStyle={{backgroundColor:gColors.themeColor}}
                            tabDatas={tabNames}
                        />
                    }
                    tabBarPosition='top'
                    initialPage={this.props.initialPage || 0}
                    scrollWithoutAnimation={true}
                    locked={false}
                    onChangeTab={this._onChangeTab}
                >
                    <LatestNewsList navigation={this.props.navigation} tabIndex={this.props.tabIndex}/>
                    <RecommendedNewsList navigation={this.props.navigation} tabIndex={this.props.tabIndex}/>
                    <HotWeekNewsList navigation={this.props.navigation} tabIndex={this.props.tabIndex}/>
                </ScrollableTabView>
            </View>
        )
    }
}


const styles = StyleSheet.create({

});
