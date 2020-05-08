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
import {Styles} from '../../common/styles';
import YZHeader from './profile_index';
import {ListRow} from '@yz1311/teaset';
import {connect} from 'react-redux';
import {logout} from '../../actions/login/login_index_actions';
import Entypo from 'react-native-vector-icons/Entypo';
import Slider from 'react-native-slider';
import {ReduxState} from '../../reducers';

interface IProps {
  dispatch: any;
  loginCode: string | null;
  userInfo: any;
}

interface IState {
  value: number;
}

@(connect(
  (state: ReduxState) => ({
    userInfo: state.loginIndex.userInfo,
    isLogin: state.loginIndex.isLogin,
  }),
  dispatch => ({
    dispatch,
  }),
) as any)
export default class profile_fontSize extends Component<IProps, IState> {

  state = {
    value: fontSizeScaler,
  };

  render() {
    const {userInfo} = this.props;
    return (
      <View style={[Styles.container]}>
        <ScrollView style={{flex: 1}}>
          <View style={{marginTop: 10, alignItems: 'center', minHeight: 200}}>
            <View>
              <Text
                style={[
                  styles.example_text,
                  {fontSize: styles.example_text.fontSize * this.state.value},
                ]}>
                床前明月光
              </Text>
              <Text
                style={[
                  styles.example_text,
                  {fontSize: styles.example_text.fontSize * this.state.value},
                ]}>
                疑是地上霜
              </Text>
              <Text
                style={[
                  styles.example_text,
                  {fontSize: styles.example_text.fontSize * this.state.value},
                ]}>
                举头望明月
              </Text>
              <Text
                style={[
                  styles.example_text,
                  {fontSize: styles.example_text.fontSize * this.state.value},
                ]}>
                低头思故乡
              </Text>
            </View>
          </View>

          <Slider
            style={{marginHorizontal: 15}}
            value={this.state.value}
            minimumValue={0.9}
            maximumValue={1.2}
            step={0.1}
            minimumTrackTintColor={gColors.color999}
            maximumTrackTintColor={gColors.color999}
            thumbTintColor={gColors.themeColor}
            onValueChange={async value => {
              this.setState({value});
              let themeInfo = await gStorage.load('themeInfo');
              gStorage.save('themeInfo', {
                ...(themeInfo || {}),
                fontSizeScaler: value,
              });
              fontSizeScaler = value;
              for (let i = 4; i < 100; i++) {
                gFont['size' + i] = i * value;
              }
              DeviceEventEmitter.emit('reloadTheme');
            }}
          />
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  example_text: {
    fontSize: gFont.size17,
    marginTop: 15,
  },
});
