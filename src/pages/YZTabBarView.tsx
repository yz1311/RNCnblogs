import React, {Component} from 'react';
import {
    DeviceEventEmitter,
    Platform,
    View,
    BackHandler,
    StatusBar, AppState,
    TouchableOpacity,
    Text,
    Modal, EmitterSubscription
} from 'react-native';
import {connect} from 'react-redux';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import YZTabBar from '../components/YZTabBar';
import YZBackHandler from '../components/YZBackHandler';
import Home from './home/home_index';
import News from './news/news_index';
import Question from './question/question_index';
import Status from './status/status_index';
import Profile from './profile/profile_index';
import SplashScreen from "react-native-splash-screen";
import {showToast} from "../actions/app_actions";
import {getToken} from "../actions/login/login_index_actions";
import {refreshDataTime} from "../actions/home/home_index_actions";
import codePush from "./app";
import * as actionTypes from "../actions/actionTypes";
import NavigationHelper from "../utils/navigationHelper";
import moment from "moment";
import ImageViewer from 'react-native-image-zoom-viewer';
import {ReduxState} from "../reducers";
import {NavigationScreenProp, NavigationState} from "react-navigation";

interface IProps extends IReduxProps{
    isLogin?: boolean,
    navigation: NavigationScreenProp<NavigationState>,
    refreshDataTimeFn?: any,
    initialPage: number
}

interface IState {
    tabNames: Array<any>,
    tabIconNames: Array<string>,
    selectedTabIconNames: Array<string>,
    imgList: Array<any>,
    imgListVisible: boolean,
    imgListIndex: number
}

let lastClickTime = 0;

@connect((state:ReduxState) => ({
    isLogin: state.loginIndex.isLogin,
}),dispatch=>({
    dispatch,
    showToastFn:(data)=>dispatch(showToast(data)),
    refreshDataTimeFn:(data)=>dispatch(refreshDataTime(data)),
}))
//@ts-ignore
@YZBackHandler
export default class YZTabBarView extends Component<IProps,IState> {
    static navigationOptions = ({navigation})=>{
        return {
            header: null
        };
    }

    static defaultProps = {
        initialPage: 0
    };

    private showImgListListener:EmitterSubscription;
    private reloadThemeListener:EmitterSubscription;
    private tabBar;
    private selectedTabIndex: number = 0;

    constructor(props) {
        super(props);

        this.state = {
            tabNames: ['博客', '新闻', '博问', '闪存', '我'],
            tabIconNames: [
                // require('../resources/tab/Home.png'),
                // require('../resources/tab/Warning.png'),
                // require('../resources/tab/Bulletin.png'),
                // require('../resources/tab/Mine.png'),
                'home',
                'news',
                'leaf',
                'slideshare',
                'user'
            ],
            selectedTabIconNames: [
                // require('../resources/tab/Home2.png'),
                // require('../resources/tab/Warning2.png'),
                // require('../resources/tab/Bulletin2.png'),
                // require('../resources/tab/Mine2.png'),
                'home',
                'news',
                'leaf',
                'slideshare',
                'user'
            ],
            imgList: [],
            imgListVisible: false,
            imgListIndex: 0
        };
        //android下按返回键退出后，路由栈并没有重置，再次进入的时候是直接进入主界面
        //但是root app这些均会运行，此时，必须手动关闭启动动画
        SplashScreen.hide();
    }

    componentDidMount() {
        // this._handleAppStateChange('active');
        AppState.addEventListener('change', this._handleAppStateChange);
        this.showImgListListener = DeviceEventEmitter.addListener('showImgList',({imgList,imgListIndex})=>{
            this.setState({
                imgList: imgList.map(x=>({url: x})),
                imgListVisible: true,
                imgListIndex: imgListIndex
            });
        });
        this.reloadThemeListener = DeviceEventEmitter.addListener('reloadTheme',()=>{
            this.forceUpdate();
        });
    }

    componentWillUnmount() {
        AppState.removeEventListener('change', this._handleAppStateChange);
        this.showImgListListener.remove();
        this.reloadThemeListener.remove();
    }

    _onBack=()=>{
        if(this.state.imgListVisible)
        {
            this.setState({
                imgListVisible: false
            });
            return true;
        }
        return false;
    }

    _handleAppStateChange = async (appState) => {
        if (appState === 'active') {
            //检查并刷新token
            if(this.props.isLogin)
            {
                const loginInfo = await gStorage.load('loginInfo');
                //已登录
                if(loginInfo&&loginInfo.access_token != undefined)
                {
                    //未过期
                    if(loginInfo.create_time && moment(loginInfo.create_time).add(loginInfo.expires_in,'second').isAfter(moment()))
                    {
                        //暂时定为，小于5小时就刷新token
                        if(moment(loginInfo.create_time).add(loginInfo.expires_in,'second').diff(moment(),'hours')<=5) {
                            //刷新token
                            this.props.dispatch({
                                type: actionTypes.LOGIN_REFRESH_TOKEN + '_PENDING',
                                payload: {
                                    request: `client_id=${gBaseConfig.clientId}&client_secret=${gBaseConfig.clientSecret}&grant_type=refresh_token&refresh_token=${loginInfo.refresh_token}&redirect_uri=https://oauth.cnblogs.com/auth/callback`
                                }
                            });
                        }
                    }
                    else
                    {
                        //否则跳转到登录界面
                        NavigationHelper.resetTo('Login');
                    }
                }
                else
                {
                    //否则跳转到登录界面
                    NavigationHelper.resetTo('Login');
                }
            }
            //刷新时间
            this.props.refreshDataTimeFn();
        }
    }



    _onChangeTab = obj => {
        this.selectedTabIndex = obj.i;
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

    _onClickTab = (index) => {
        if(this.selectedTabIndex === index)
        {
            let now = new Date().getTime();
            if (now - lastClickTime >= 2000) {
                lastClickTime = now;
                //点击一次，滑动到顶部
                DeviceEventEmitter.emit('list_scroll_to_top',{tabIndex: index});
                return;
            }
            lastClickTime = now;
            DeviceEventEmitter.emit('list_refresh',{tabIndex: index});
        }
    }

    render() {
        console.log('YZTabBarView reload')
        const {tabNames, tabIconNames, selectedTabIconNames} = this.state;

        return (
            <View style={{flex:1}}>
                <ScrollableTabView
                    renderTabBar={() =>
                        <YZTabBar
                            ref={bar=>this.tabBar = bar}
                            tabNames={tabNames}
                            tabIconNames={tabIconNames}
                            selectedTabIconNames={selectedTabIconNames}
                            onClick={this._onClickTab}
                        />
                    }
                    tabBarPosition='bottom'
                    initialPage={this.props.initialPage || 0}
                    scrollWithoutAnimation={true}
                    locked={true}
                    onChangeTab={this._onChangeTab}
                >
                    <Home navigation={this.props.navigation} tabIndex={0}/>
                    <News navigation={this.props.navigation} tabIndex={1}/>
                    <Question navigation={this.props.navigation} tabIndex={2}/>
                    <Status navigation={this.props.navigation} tabIndex={3}/>
                    <Profile navigation={this.props.navigation} tabIndex={4}/>
                </ScrollableTabView>
                <Modal visible={this.state.imgListVisible}
                       onRequestClose={()=>{
                           this.setState({
                               imgListVisible: false
                           })
                       }}
                       transparent={true}>
                    <ImageViewer
                        onClick={()=>this.setState({imgListVisible: false})}
                        enableSwipeDown
                        onSwipeDown={()=>this.setState({imgListVisible: false})}
                        index={this.state.imgListIndex}
                        menuContext={{saveToLocal: '保存到相册', cancel: '取消'}}
                        imageUrls={this.state.imgList}/>
                </Modal>
            </View>
        );
    }
}
