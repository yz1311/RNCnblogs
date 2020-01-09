import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  DeviceEventEmitter,
} from 'react-native';
import Styles from '../../common/styles';
import YZHeader from './profile_index';
import {ListRow} from '@yz1311/teaset';
import {connect} from 'react-redux';
import {logout} from '../../actions/login/login_index_actions';
import Entypo from 'react-native-vector-icons/Entypo';
import {ReduxState} from '../../reducers';
import Bugly, {logLevel} from 'rn-bugly';

interface IProps {
  dispatch: any;
  loginCode: string | null;
  userInfo: any;
}

interface IState {
  isLoading: boolean;
}

@(connect(
  (state: ReduxState) => ({
    userInfo: state.loginIndex.userInfo,
  }),
  dispatch => ({
    dispatch,
  }),
) as any)
export default class profile_about extends Component<IProps, IState> {
  static navigationOptions = ({navigation}) => {
    return {
      title: '关于',
    };
  };

  showUpdateInfoDialog = async () => {
    //不要讲modal也放在这个组件，两个modal同时存在会报错，不知道咋回事
    DeviceEventEmitter.emit('showUpdateInfoDialog');
  };

  render() {
    const {userInfo} = this.props;
    return (
      <View style={[Styles.container]}>
        <ScrollView style={{flex: 1}}>
          <View style={{marginTop: 10, alignItems: 'center'}}>
            <Image
              style={{
                width: 90,
                height: 90,
                alignSelf: 'center',
                marginTop: 40,
              }}
              resizeMode="contain"
              source={require('../../resources/img/app_icon.png')}
            />
            <Text
              style={{
                fontWeight: 'bold',
                fontSize: gFont.size18,
                marginTop: 10,
              }}>
              博客园
            </Text>
            <Text style={{fontSize: gFont.size16, marginTop: 10}}>
              {'版本: V' + gBaseConfig.BuildVersion}
            </Text>
            <View style={{alignSelf: 'stretch', marginTop: 30}}>
              <ListRow
                activeOpacity={activeOpacity}
                title="检查更新"
                onPress={async () => {
                  this.showUpdateInfoDialog();
                  // alert(JSON.stringify(await Bugly.getUpgradeInfo()))
                  // Bugly.checkUpgrade({
                  //     isManual: true,
                  //     isSilence: false
                  // });
                  // Bugly.log(logLevel.i,'yesy','dsdsdsdsdsd')
                }}
              />
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  paddingLeftRight: {
    paddingLeft: 15,
    paddingRight: 15,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  updateLogItem: {
    backgroundColor: gColors.bgColorF,
    alignSelf: 'stretch',
    marginTop: 18,
    borderTopColor: gColors.borderColorE5,
    borderTopWidth: gScreen.onePix,
    borderBottomColor: gColors.borderColorE5,
    borderBottomWidth: gScreen.onePix,
  },
});
