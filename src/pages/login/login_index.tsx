import React, {Component} from 'react'
import {
    StyleSheet,
    View,
    ActivityIndicator,
    Text
} from 'react-native'
import {WebView} from 'react-native-webview';
import {connect} from 'react-redux';
import YZHeader from '../../components/YZHeader';
import Styles from '../../common/styles';
import Feather from 'react-native-vector-icons/Feather';
import {setLoginCode} from '../../actions/login/login_index_actions';
import moment from 'moment';
import SplashScreen from "react-native-splash-screen";
import {ReduxState} from '../../reducers';

interface IProps {
    dispatch: any,
    loginCode: string | null,
    setLoginCodeFn: any,
    callback: any
}

interface IState {
    isLoading: boolean
}

@connect((state: ReduxState)=>({
    loginCode: state.loginIndex.loginCode
}),dispatch=>({
    dispatch,
    setLoginCodeFn: (data)=>dispatch(setLoginCode(data)),
}))
export default class login_index extends Component<IProps,IState> {
    static navigationOptions = ({navigation})=>{
        return {
            title: '登录'
        };
    }

    hasInvoked = false;

    constructor(props)
    {
        super(props);
        this.state = {
            isLoading: false
        };
    }

    componentDidMount() {
        SplashScreen.hide();
    }

    _onNavigationStateChange=(event)=>{
        //url: "https://oauth.cnblogs.com/auth/callback#code=9e235380127d2698e2c2c7112cd8352bc683a01a0c619a42aa9bbd14c8558c71&id_token=eyJhbGciOiJSUzI1NiIsImtpZCI6IjlFMjcyMkFGM0IzRTFDNzU5RTI3NEFBRDI5NDFBNzg1MDlCMDc2RDAiLCJ0eXAiOiJKV1QiLCJ4NXQiOiJuaWNpcnpzLUhIV2VKMHF0S1VHbmhRbXdkdEEifQ.eyJuYmYiOjE1NTA4OTE4NzUsImV4cCI6MTU1MDg5MjE3NSwiaXNzIjoiaHR0cDovL29wZW5hcGlfb2F1dGgtc2VydmVyIiwiYXVkIjoiMjZiNzJiOGItZWNhZi00MDUzLTkxYzQtOGU4Nzg0OGZkYzU2Iiwibm9uY2UiOiJjbmJsb2dzLmNvbSIsImlhdCI6MTU1MDg5MTg3NSwiY19oYXNoIjoiWFNoM1ltWVNKc3N0QlQwbmFZTnNxUSIsInNpZCI6IjFkYmNmN2FiN2Q0YmQ4NDE1MjY4NzU2ZjFlZTM4NDI5Iiwic3ViIjoiMDAwMDAwMDAtMDAwMC0wMDAwLTAwMDAtMDAwMDAwMDAwMDAwIiwiYXV0aF90aW1lIjoxNTUwODkxODc1LCJpZHAiOiJjbmJsb2dzX29hdXRoIiwiYW1yIjpbImF1dGhvcml6YXRpb25fY29kZSJdfQ.bl-w4ACf-O78twU-xDn_PETnS0kjnee2dy3luF8Zvqs2azVBChmvIAsViQcTO3diXtCu2IRdJQ3Z76k0_PH99MNhgzhwMTI45_MF_8LYdSOvOsl0heB04rbSf_ay4Z-wnJPULsSu5ZmyR9qgM6KSHhjSvo64AEtEFV1U4Gt9zpto036-Dox95tdKfemiri-A5lPUg09kcgc8Q2WOlYwCgAzkiNqX6m7wzhDSOYyX5E6tWT4SR1Niv0dfBJo-S02gsFjyG_QRau_KUyuYsCp3VunOsP_rZpEExZt2PS1OChoRdaqT1pMk0nhA4p8FgxOLYsJ0UYQ-DdQ6h_TB7bFJRg&scope=openid%20profile%20CnBlogsApi%20offline_access&state=cnblogs.com&session_state=JDvJbXPtVcaFqrD-Q9iOMti5e6tY0qYZ-tqTFip68Uk.3c93e53ce0f133334b1e883e47fe9dcf"
        //进行了回调
        if(event && event.url && event.url.indexOf('oauth.cnblogs.com/auth/callback') >= 0) {
            if(this.hasInvoked)
            {
                return;
            }
            let matches = event.url.match(/code=[a-zA-Z0-9]+&/);
            if(matches && matches.length>0) {
                this.hasInvoked = true;
                this.setState({
                    isLoading: true
                })
                this.props.setLoginCodeFn({
                    code: matches[0].replace('code=','').replace('&',''),
                    callback: this.props.callback
                });
            }
        }
    }

    render() {
        let uri = `https://oauth.cnblogs.com/connect/authorize?client_id=${gBaseConfig.clientId}&scope=openid+profile+CnBlogsApi+offline_access&response_type=code+id_token&redirect_uri=https://oauth.cnblogs.com/auth/callback&state=cnblogs.com&nonce=${moment().format('YYYYMMDDHHmmssSSS')}`;
        return (
            <View
                style={[Styles.container]}>
                {
                    this.state.isLoading?
                        <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                            <ActivityIndicator
                                size="large"
                                color={gColors.themeColor}
                                />
                            <Text style={{marginTop:10}}>正在登录中....</Text>
                        </View>
                        :
                        <WebView
                            source={{uri: uri}}
                            originWhitelist={['*']}
                            domStorageEnabled={true}
                            javaScriptEnabled={true}
                            onNavigationStateChange={this._onNavigationStateChange}
                        />
                }
            </View>
        )
    }
}


const styles = StyleSheet.create({

});
