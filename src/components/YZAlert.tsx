import React, {Component} from 'react';
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import YZAnimatedModal from './YZAnimatedModal';
import Styles from '../common/styles';
import PropTypes from 'prop-types';

export interface IProps {
  title: string;
  message: string;
  showCancelButton: boolean;
  showConfirmButton: boolean;
  cancelText: string;
  confirmText: string;
  cancelButtonColor: string;
  confirmButtonColor: string;
  onCancelPressed: any;
  onConfirmPressed: any;
  cancelable: boolean;
}

export default class YZAlert extends Component<IProps, {}> {
  //传递到alert的静态参数，这里只做中转,显示的时候保存，可以调用resetParams手动清空
  params = {};
  static propTypes = {
    title: PropTypes.string,
    message: PropTypes.string.isRequired,
    showCancelButton: PropTypes.bool,
    showConfirmButton: PropTypes.bool,
    cancelText: PropTypes.string,
    confirmText: PropTypes.string,
    cancelButtonColor: PropTypes.string,
    confirmButtonColor: PropTypes.string,
    onCancelPressed: PropTypes.func,
    onConfirmPressed: PropTypes.func,
    cancelable: PropTypes.bool,
  };

  static defaultProps = {
    showCancelButton: true,
    showConfirmButton: true,
    cancelButtonColor: gColors.color666,
    confirmButtonColor: gColors.themeColor,
    cancelable: false,
  };

  private modal: any;

  render() {
    return (
      <YZAnimatedModal
        ref={modal => (this.modal = modal)}
        header={this.renderHeader()}
        content={this.renderContent()}
        bottom={this.renderBottom()}
        contentWrapperStyle={{width: gScreen.width * 0.8}}
        closeWhenBackgroundClicked={this.props.cancelable}
      />
    );
  }

  renderHeader() {
    return (
      <View
        style={{
          borderTopLeftRadius: 6,
          borderTopRightRadius: 6,
          paddingTop: 10,
        }}
      />
    );
  }

  renderContent() {
    const {title, message} = this.props;
    return (
      <View>
        <View
          style={{
            paddingHorizontal: 20,
            paddingBottom: 10,
            alignItems: 'center',
          }}>
          {title ? (
            <Text
              style={{
                fontSize: gFont.size16,
                color: gColors.color333,
                marginBottom: 8,
              }}>
              {title}
            </Text>
          ) : null}
          <Text style={{fontSize: gFont.size15, color: gColors.color333}}>
            {message}
          </Text>
        </View>
      </View>
    );
  }

  renderBottom() {
    const {
      showCancelButton,
      showConfirmButton,
      cancelButtonColor,
      confirmButtonColor,
      onCancelPressed,
      onConfirmPressed,
      cancelText,
      confirmText,
    } = this.props;
    if (showCancelButton && showConfirmButton) {
      return (
        <View style={{flexDirection: 'row'}}>
          <TouchableOpacity
            activeOpacity={0.75}
            style={[
              {
                flex: 1,
                flexBasis: 0,
                height: 50,
                justifyContent: 'center',
                alignItems: 'center',
                borderRightWidth: gScreen.onePix,
                borderRightColor: gColors.borderColor,
                borderTopWidth: gScreen.onePix,
                borderColor: gColors.borderColor,
              },
            ]}
            onPress={() => {
              this.close();
              onCancelPressed && onCancelPressed(this.params);
            }}>
            <Text style={{fontSize: gFont.size15, color: cancelButtonColor}}>
              {cancelText}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.75}
            style={[
              {
                flex: 1,
                flexBasis: 0,
                height: 50,
                justifyContent: 'center',
                alignItems: 'center',
                borderTopWidth: gScreen.onePix,
                borderColor: gColors.borderColor,
              },
            ]}
            onPress={() => {
              onConfirmPressed && onConfirmPressed(this.params);
            }}>
            <Text style={{fontSize: gFont.size15, color: confirmButtonColor}}>
              {confirmText}
            </Text>
          </TouchableOpacity>
        </View>
      );
    } else {
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
              onCancelPressed && onCancelPressed(this.params);
            }}>
            <Text style={{fontSize: gFont.size15, color: gColors.color0}}>
              {cancelText}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
  }

  show(params) {
    this.params = params || {};
    this.modal && this.modal.show();
  }

  close() {
    this.modal && this.modal._close();
  }

  resetParams() {
    this.params = {};
  }

  isShow = () => {
    return this.modal.isShow();
  };
}

const styles = StyleSheet.create({
  lineContainer: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  detail: {
    color: gColors.color333,
    marginLeft: 8,
    // marginRight:8,
    flexGrow: 1,
    flexBasis: 0,
    textAlign: 'justify', //iOS有效，android上会变成left，
    //RN目前并没有行间距这个属性
  },
  separator: {
    height: gScreen.onePix,
    backgroundColor: gColors.borderColor,
    marginVertical: 8,
  },
});
