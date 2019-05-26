import React, {Component} from 'react'
import {
    StyleSheet,
    View,
    ActivityIndicator,
    Text, Alert
} from 'react-native'
import {connect} from 'react-redux';
import Styles from '../../common/styles';
import {setLoginCode, getUserInfo} from '../../actions/login/login_index_actions';
import moment from 'moment';
import NavigationHelper from '../../utils/navigationHelper';
import * as actionTypes from '../../actions/actionTypes';
import {getToken} from "../../actions/login/login_index_actions";
import ThemeUtils from '../../utils/themeUtils';
import {ReduxState} from '../../reducers';

interface IProps {
    dispatch: any,
    loginCode: string | null,
    setLoginCodeFn: any,
    getUserInfoFn: any
}

@connect((state: ReduxState)=>({
    loginCode: state.loginIndex.loginCode,
}),dispatch=>({
    dispatch,
    setLoginCodeFn: (data)=>dispatch(setLoginCode(data)),
    getUserInfoFn: (data)=>dispatch(getUserInfo(data))
}))
export default class app_entry extends Component<IProps,{}> {

    static navigationOptions = ({navigation})=>{
        return {
            header: null
        };
    }

    async componentDidMount() {
        ThemeUtils.reloadTheme();
        const loginInfo = await gStorage.load('loginInfo');
        //已登录
        if(loginInfo&&loginInfo.access_token != undefined&&loginInfo.create_time && moment(loginInfo.create_time).add(loginInfo.expires_in,'second').isAfter(moment()))
        {
            //手动设置登录信息
            this.props.dispatch({
                type: actionTypes.LOGIN_USERLOGIN,
                payload: {
                    result: loginInfo
                }
            });
            //获取用户信息
            this.props.getUserInfoFn();
            //跳转到主界面
            NavigationHelper.resetTo('YZTabBarView');
        }
        else
        {
            this.clientLogin();
            //否则跳转到登录界面
            // NavigationHelper.resetTo('Login');
        }
    }

    clientLogin = ()=>{
        //获取client token后跳转到首页
        this.props.dispatch(getToken({
            successAction: async (result)=>{
                console.log('client result')
                console.log(result)
                await gStorage.save('loginInfo', result);
                // state.isLogin = true;
                // state.token = payload.result.access_token;
                // state.expiresIn = payload.result.expires_in;
                // state.tokenType = payload.result.token_type;
                // state.refreshToken = payload.result.refresh_token;
                gUserData.token = result.access_token;
                NavigationHelper.resetTo('YZTabBarView');
            },
            failAction: ()=>{
                Alert.alert('','登录失败，是否重试?',[{
                    text: '取消',
                    onPress: ()=>{
                        //跳转到主界面
                        NavigationHelper.resetTo('YZTabBarView');
                    }
                },{
                    text: '重试',
                    onPress: ()=>{
                        this.clientLogin();
                    }
                }])
            }
        }));
    }

    render() {
        return (
            <View
                style={[Styles.container]}>
                <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                    <ActivityIndicator
                        size="large"
                        color={gColors.themeColor}
                        />
                    <Text style={{marginTop:10}}>加载中...</Text>
                </View>
            </View>
        )
    }
}


const styles = StyleSheet.create({

});
