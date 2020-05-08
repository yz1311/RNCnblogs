import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  BackHandler,
  Keyboard,
} from 'react-native';
import YZAnimatedModal from './YZAnimatedModal';
import {Styles} from '../common/styles';
import PropTypes from 'prop-types';
import codePush from 'react-native-code-push';

export interface IProps {
  title?: string;
  message: string;
}

export interface IState {}

export default class update_logModal extends Component<IProps, IState> {
  static propTypes = {
    title: PropTypes.string,
    message: PropTypes.string.isRequired,
  };

  static defaultProps = {};

  private params: any;
  private modal: any;

  render() {
    return (
      <YZAnimatedModal
        ref={modal => (this.modal = modal)}
        header={this.renderHeader()}
        content={this.renderContent()}
        bottom={this.renderBottom()}
        contentWrapperStyle={{width: gScreen.width * 0.9}}
        contentStyle={{paddingVertical: 0, paddingTop: 10}}
        closeWhenBackgroundClicked={false}
      />
    );
  }

  renderHeader() {
    return (
      <View
        style={{borderTopLeftRadius: 6, borderTopRightRadius: 6, paddingTop: 6}}
      />
    );
  }

  renderContent() {
    const {title, message} = this.props;
    const params = this.params;
    return (
      <View>
        <View
          style={{paddingHorizontal: 20, paddingBottom: 10, minHeight: 150}}>
          <Text
            style={{
              fontSize: gFont.size18,
              color: gColors.color333,
              marginBottom: 8,
              fontWeight: 'bold',
              alignSelf: 'center',
            }}>
            更新日志
          </Text>
          <Text
            style={[
              Styles.separator,
              {
                backgroundColor: gColors.borderColorE5,
                marginHorizontal: -20,
                marginTop: 5,
                marginBottom: 8,
              },
            ]}
          />
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              flexWrap: 'wrap',
              marginBottom: 10,
            }}>
            <Text style={{fontSize: gFont.size16, color: gColors.color333}}>
              <Text>{'版本号:'}</Text>
              <Text>{params ? params.version : ''}</Text>
            </Text>
            {params && params.isPending ? (
              <TouchableOpacity
                activeOpacity={activeOpacity}
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 6,
                  backgroundColor: gColors.themeColor,
                  borderRadius: 6,
                  marginLeft: 5,
                }}
                onPress={() => {
                  codePush.restartApp();
                }}>
                <Text style={{fontSize: gFont.size14, color: gColors.bgColorF}}>
                  点击生效
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
          <Text style={{fontSize: gFont.size16, color: gColors.color666}}>
            {params ? params.description : ''}
          </Text>
        </View>
      </View>
    );
  }

  renderBottom() {
    return (
      <View style={{flexDirection: 'row'}}>
        <TouchableOpacity
          activeOpacity={0.75}
          style={[
            {
              flexGrow: 1,
              flexBasis: 0,
              height: 50,
              justifyContent: 'center',
              alignItems: 'center',
              borderTopWidth: gScreen.onePix,
              borderColor: gColors.borderColor,
            },
          ]}
          onPress={() => {
            this.close();
          }}>
          <Text style={{fontSize: gFont.size15, color: gColors.color0}}>
            确定
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  show(params) {
    this.params = params || {};
    this.modal && this.modal.show();
  }

  close() {
    this.modal && this.modal._close();
  }

  isShow = () => {
    return this.modal.isShow();
  };
}
