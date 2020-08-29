import React, {Component} from 'react';
import {StyleSheet, View, ActivityIndicator, Text, Platform} from 'react-native';
import {WebView} from 'react-native-webview';
import {connect} from 'react-redux';
import {Styles} from '../../common/styles';
import SplashScreen from 'react-native-splash-screen';
import {ReduxState} from '../../reducers';
import CookieManager from '@react-native-community/cookies';
import ToastUtils from "../../utils/toastUtils";
import {NavigationBar, Theme} from "@yz1311/teaset";

interface IProps {
  dispatch: any;
  loginCode: string | null;
  setLoginCodeFn: any;
  callback: any;
  isLogin?: boolean,
  deprecatedCookie: string

}

interface IState {
  isLoading: boolean;
}

@(connect((state:ReduxState)=>({
  isLogin: state.loginIndex.isLogin
})) as any)
export default class login_index extends Component<IProps, IState> {

  hasInvoked = false;

  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
    };
  }

  componentDidMount() {
    SplashScreen.hide();
  }

  _onNavigationStateChange = async (event) => {
    console.log(event)
    if(this.hasInvoked&&this.props.isLogin) {
      return ;
    }
    try {
      //后一个参数表示使用UIWebkit，否则ios获取的为空
      let res = await CookieManager.get('https://account.cnblogs.com/signin', true);
      if(res) {
        //@ts-ignore
        if(this.props.deprecatedCookie==res['.Cnblogs.AspNetCore.Cookies'] || !res.hasOwnProperty('.Cnblogs.AspNetCore.Cookies')) {
          return ;
        }
        gUserData.token = Object.keys(res).map(key=>key+'='+res[key].value).join(';');
        gStorage.save('token', res);
        console.log(gUserData.token);
        gStore.dispatch({
          type: 'loginIndex/setUserLogin',
          payload: {
            cookieValue: res['.Cnblogs.AspNetCore.Cookies']
          }
        });
        NavigationHelper.resetTo('YZTabBarView');
        gStore.dispatch({
          type: 'loginIndex/getUserInfo',
          payload: {

          }
        });
        this.hasInvoked = true;
      }
    } catch (e) {
      console.log(e)
      ToastUtils.showToast('登录失败!')
    }
  };

  render() {
    let uri = `https://account.cnblogs.com/signin`;
    return (
      <View style={[Styles.container]}>
        <NavigationBar title="登录" leftView={null} />
        {this.state.isLoading ? (
          <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <ActivityIndicator size="large" color={Theme.primaryColor} />
            <Text style={{marginTop: 10}}>正在登录中....</Text>
          </View>
        ) : (
          <WebView
            source={{uri: uri}}
            originWhitelist={['*']}
            domStorageEnabled={true}
            javaScriptEnabled={true}
            onNavigationStateChange={this._onNavigationStateChange}
          />
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({});
