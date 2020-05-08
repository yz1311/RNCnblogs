import React, {Component, PureComponent} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Text,
  TextInput,
  DeviceEventEmitter,
} from 'react-native';
import {connect} from 'react-redux';
import YZStateView from '../../components/YZStateCommonView';
import YZFlatList from '../../components/YZFlatList';
import YZCheckbox from '../../components/YZCheckbox';
import {Styles} from '../../common/styles';
import Feather from 'react-native-vector-icons/Feather';
import {ListRow} from '@yz1311/teaset';
import PropTypes from 'prop-types';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {showToast} from '../../actions/app_actions';
import {NavigationScreenProp, NavigationState} from 'react-navigation';
import {Api} from '../../api';
import ToastUtils from '../../utils/toastUtils';
import {StatusTypes} from './status_index';
import {statusModel} from '../../api/status';

interface IProps extends IReduxProps {
  item: statusModel;
  clickable: boolean;
  navigation: any;
}

interface IState {
  value: string,
  isPrivate: boolean
}

@(connect(
  state => ({}),
  dispatch => ({
    showToastFn: data => dispatch(showToast(data)),
  }),
) as any)
export default class status_add extends PureComponent<IProps, IState> {
  static propTypes = {
    item: PropTypes.object,
    clickable: PropTypes.bool,
  };

  static defaultProps = {
    clickable: true,
  };

  constructor(props:IProps) {
    super(props);
    this.state = {
      value: '',
      isPrivate: false,
    };
    if(props?.item) {
      this.state = {
        ...this.state,
        value: props?.item.summary
      };
    }
  }

  componentDidMount() {
    this.props.navigation.setOptions({
      rightAction: this._rightAction,
    });
  }

  _rightAction = async () => {
    if (!this.state.value) {
      this.props.showToastFn('请填写内容');
      return;
    }
    ToastUtils.showLoading();
    try {
      let response = await Api.status.addStatus({
        request: {
          publicFlag: this.state.isPrivate==false?1:0,
          content: this.state.value
        }
      });
      if(response.data.isSuccess) {
        //返回到上一级，并刷新所有的列表
        this.props.navigation.goBack();
        //刷新‘全站’和‘我的'两个列表
        DeviceEventEmitter.emit('status_list_refresh',StatusTypes.全站);
        DeviceEventEmitter.emit('status_list_refresh',StatusTypes.我的);
      } else {
        ToastUtils.showToast(response.data.responseText);
      }
    } catch (e) {

    } finally {
      ToastUtils.hideLoading();
    }
  };

  render() {
    const {item, clickable} = this.props;
    return (
      <View style={[Styles.container, {backgroundColor: gColors.bgColorF}]}>
        <TextInput
          placeholder={'你在做什么？你在想什么？'}
          textAlignVertical="top"
          underlineColorAndroid="transparent"
          style={[
            {
              padding: 8,
              fontSize: gFont.size15,
              color: gColors.color333,
              height: gScreen.height * 0.4,
            },
          ]}
          value={this.state.value}
          multiline={true}
          onChangeText={value => this.setState({value})}
        />
        <View style={{height: 1, backgroundColor: gColors.borderColor}} />
        <View
          style={{
            marginTop: 10,
            flexDirection: 'row',
            justifyContent: 'flex-end',
            paddingRight: 10,
          }}>
          <TouchableOpacity
            activeOpacity={activeOpacity}
            onPress={() => {
              this.setState({
                isPrivate: false,
              });
            }}
            style={{flexDirection: 'row', alignItems: 'center'}}>
            <YZCheckbox
              checked={!this.state.isPrivate}
              size={20}
              onPress={() => {
                this.setState({
                  isPrivate: false,
                });
              }}
            />
            <Text style={{marginLeft: 4}}>公开</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={activeOpacity}
            onPress={() => {
              this.setState({
                isPrivate: true,
              });
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginLeft: 18,
            }}>
            <YZCheckbox
              checked={this.state.isPrivate}
              size={20}
              onPress={() => {
                this.setState({
                  isPrivate: true,
                });
              }}
            />
            <Text style={{marginLeft: 4}}>私有</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  avator: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
});
