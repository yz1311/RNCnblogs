import React, {Component} from 'react';

import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ViewPropTypes,
  TextInputProps,
} from 'react-native';
import PropTypes from 'prop-types';

export interface IProps extends TextInputProps {
  rightItem: any;
  wrapperStyle: any;
  numberOnly: boolean;
  numberAndLetterOnly: boolean;
  leftItem: any;
}

export default class YZTextInput extends Component<IProps, {}> {
  static propTypes = {
    // ...TextInput.propTypes,
    rightItem: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
    wrapperStyle: ViewPropTypes.style,
    numberOnly: PropTypes.bool,
    numberAndLetterOnly: PropTypes.bool,
  };

  static defaultProps = {
    placeholderTextColor: '#cdcdcd',
    underlineColorAndroid: 'transparent',
    numberOnly: false,
    numberAndLetterOnly: false,
  };

  private userName: any;

  render() {
    return (
      <View style={[styles.inputItem, this.props.wrapperStyle]}>
        {this.props.leftItem}
        <View style={{height: 50, justifyContent: 'center', flex: 1}}>
          <TextInput
            ref={userName => (this.userName = userName)}
            {...this.props}
            placeholder={this.props.placeholder}
            placeholderTextColor={this.props.placeholderTextColor}
            keyboardType={this.props.keyboardType}
            underlineColorAndroid={this.props.underlineColorAndroid}
            style={[
              {
                fontSize: gFont.size14,
                color: gColors.themeColor,
                height: 50,
                alignSelf: 'stretch',
                marginLeft: 10,
              },
              gScreen.isAndroid && {padding: 0},
              this.props.style,
            ]}
            value={this.props.value}
            onChangeText={text => {
              const {
                secureTextEntry,
                numberOnly,
                numberAndLetterOnly,
              } = this.props;
              if (text == '') {
                this.props.onChangeText(text);
                return;
              }
              if (secureTextEntry || numberAndLetterOnly) {
                //验证只能是数字和字母
                const exp = /^[a-zA-Z0-9]+$/;
                if (exp.test(text)) {
                  this.props.onChangeText(text);
                } else {
                  return;
                }
              }
              if (numberOnly) {
                //验证只能是数字
                const exp = /^[0-9]+$/;
                if (exp.test(text)) {
                  this.props.onChangeText(text);
                } else {
                  return;
                }
              }
              this.props.onChangeText(text);
            }}
            selectionColor={gColors.themeColor}
            onFocus={this.props.onFocus}
            onBlur={this.props.onBlur}
          />
        </View>
        {this.props.rightItem}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  inputContainer: {
    marginTop: 30,
  },
  inputItem: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 27,
    borderColor: gColors.borderColor,
    borderBottomWidth: 1,
  },
});
