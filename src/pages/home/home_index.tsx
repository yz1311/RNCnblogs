import React, {Component} from 'react'
import {
    StyleSheet,
    View,
} from 'react-native'
import {connect} from 'react-redux';
import YZHeader from '../../components/YZHeader';
import Styles from '../../common/styles';
import HomeTabBar from './home_indexTab';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import KnowledgeBase from '../knowledgeBase/knowledgeBase_index';
import PickedBlogList from '../blog/list/picked_blog_list';
import HomeBlogList from '../blog/list/home_blog_list';
import FollowingBlogList from '../blog/list/following_blog_list';
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
export default class home_index extends Component<IProps,IState> {
    private tabBar:any;

    constructor(props)
    {
        super(props);
        this.state = {
            tabNames: ['首页', '精华', '关注', '知识库'],
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
                            tabWidth={70}
                            containerStyle={{backgroundColor:gColors.themeColor}}
                            tabDatas={tabNames}
                            showSearchButton
                        />
                    }
                    tabBarPosition='top'
                    initialPage={this.props.initialPage || 0}
                    scrollWithoutAnimation={true}
                    locked={false}
                    onChangeTab={this._onChangeTab}
                >
                    <HomeBlogList navigation={this.props.navigation} tabIndex={this.props.tabIndex}/>
                    <PickedBlogList navigation={this.props.navigation} tabIndex={this.props.tabIndex}/>
                    <FollowingBlogList navigation={this.props.navigation} tabIndex={this.props.tabIndex}/>
                    <KnowledgeBase navigation={this.props.navigation} tabIndex={this.props.tabIndex}/>
                </ScrollableTabView>
            </View>
        )
    }
}


const styles = StyleSheet.create({

});
