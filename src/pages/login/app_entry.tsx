import React, {Component} from 'react';
import {StyleSheet, View, ActivityIndicator, Text, Alert} from 'react-native';
import {connect} from 'react-redux';
import {Styles} from '../../common/styles';
import {Theme} from "@yz1311/teaset";
import YZSafeAreaView from "../../components/YZSafeAreaView";
import StorageUtils from "../../utils/storageUtils";

interface IProps {
  dispatch: any;
  loginCode: string | null;
  setLoginCodeFn: any;
}

export default class app_entry extends Component<IProps, {}> {

  async componentDidMount() {
    let res = await StorageUtils.load('token');
    if (res && res.hasOwnProperty('.Cnblogs.AspNetCore.Cookies')) {
      gUserData.token = Object.keys(res).map(key => key + '=' + res[key].value).join(';');
      gStore.dispatch({
        type: 'loginIndex/setUserLogin',
        payload: {
          cookieValue: res['.Cnblogs.AspNetCore.Cookies']
        }
      });
      NavigationHelper.resetTo('YZTabBarView');
      gStore.dispatch({
        type: 'loginIndex/getUserInfo',
        payload: {}
      });
      return;
    }
    NavigationHelper.resetTo('Login');
  }

  render() {
    return (
      <YZSafeAreaView>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" color={Theme.primaryColor} />
          <Text style={{marginTop: 10}}>加载中...</Text>
        </View>
      </YZSafeAreaView>
    );
  }
}

const styles = StyleSheet.create({});
