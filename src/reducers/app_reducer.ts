import * as types from '../actions/actionTypes';
import {handleActions} from '../utils/reduxUtils';

export interface State {
    barStyle: string,
    isConnected: boolean,
    //屏幕的方向
    isLandscape:boolean,
    //isConnected为true的,该值才有效
    isWifi: boolean,
    isFetching: boolean,
    loadingTitle: string,
}

const initialState = {
    barStyle: 'light-content',
    isConnected: false,
    //屏幕的方向
    isLandscape:false,
    //isConnected为true的,该值才有效
    isWifi:false,
    isFetching:false,
    loadingTitle:'',
}

export default handleActions( {
    [types.APP_CHANGE_NET_INFO]:(state: State,action)=> {
        const {type, payload} = action;
        const {connectionInfo} = payload;
        state.isConnected = _isConnected(connectionInfo);
    },
    [types.APP_ORIENTATION_INFO_CHANGED]:(state: State,action)=> {
        const {payload} = action;
        const {window} = payload;
        const {width:deviceWidth,height:deviceHeight} = window;
        gScreen.width = deviceWidth;
        gScreen.height = deviceHeight;
        let isLandscape = isOrientationLandscape(window);
        if(__IOS__)
        {
            gScreen.statusBarHeight = isLandscape?0:(isIphoneX?44:20);
            gScreen.headerHeight = gScreen.navigationBarHeight + gScreen.statusBarHeight;
        }
        state.isLandscape = isLandscape;
    },
    [types.APP_CHANGE_STATUS_BARSTYLE]:(state: State,action)=> {
        const {type, payload} = action;
        state.barStyle = payload.barStyle == 'default' ? 'default' : 'light-content';
    },
    ['SHOW_LOADING']:(state: State,action)=> {
        const {type, payload} = action;
        state.isFetching = payload.isFetching;
        state.loadingTitle = payload.title;
    }
}, initialState);


const _isConnected = (connection)=>{
    return connection.type !== 'none' && connection.type !== 'unknown';
}

const isOrientationLandscape = ({width,height,})=>{
    return width>height;
}