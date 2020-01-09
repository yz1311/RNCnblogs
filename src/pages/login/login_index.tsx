import React, {Component} from 'react';
import {StyleSheet, View, ActivityIndicator, Text, Platform} from 'react-native';
import {WebView} from 'react-native-webview';
import {connect} from 'react-redux';
import YZHeader from '../../components/YZHeader';
import Styles from '../../common/styles';
import Feather from 'react-native-vector-icons/Feather';
import {setLoginCode} from '../../actions/login/login_index_actions';
import moment from 'moment';
import SplashScreen from 'react-native-splash-screen';
import {ReduxState} from '../../reducers';
import CookieManager from 'react-native-cookie-store';

interface IProps {
  dispatch: any;
  loginCode: string | null;
  setLoginCodeFn: any;
  callback: any;
}

interface IState {
  isLoading: boolean;
}

export default class login_index extends Component<IProps, IState> {
  static navigationOptions = ({navigation}) => {
    return {
      title: '登录',
    };
  };

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
    if(this.hasInvoked) {
      return ;
    }
    try {
      //后一个参数表示使用UIWebkit，否则ios获取的为空
      let res = await CookieManager.get('https://account.cnblogs.com/signin', true);
      if(res) {
        gUserData.token = Object.keys(res).map(key=>key+'='+res[key]).join(';');
        NavigationHelper.resetTo('YZTabBarView');
        this.hasInvoked = true;
      }
    } catch (e) {

    }
  };

  render() {
    let uri = `https://account.cnblogs.com/signin`;
    return (
      <View style={[Styles.container]}>
        {this.state.isLoading ? (
          <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <ActivityIndicator size="large" color={gColors.themeColor} />
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
