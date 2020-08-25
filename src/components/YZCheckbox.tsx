import React, {Component} from 'react';
import {View, Text, TouchableOpacity, ViewPropTypes} from 'react-native';
import PropTypes from 'prop-types';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {Theme} from "@yz1311/teaset";

export interface IProps {
  wrapperStyle?: any;
  checked: boolean;
  disabled: boolean;
  onChange?: any;
  onPress: any;
  size: number;
}

export default class YZCheckbox extends Component<IProps, {}> {
  static propTypes = {
    wrapperStyle: ViewPropTypes.style,
    checked: PropTypes.bool,
    disabled: PropTypes.bool,
    onChange: PropTypes.any,
    onPress: PropTypes.any,
    size: PropTypes.number,
  };

  static defaultProps = {
    disabled: false,
    size: 27,
  };

  render() {
    const {
      checked,
      size,
      disabled,
      onChange,
      wrapperStyle,
      onPress,
    } = this.props;
    let color;
    if (disabled) {
      color = gColors.borderColor;
    } else {
      color = checked ? Theme.primaryColor : gColors.color999;
    }
    return (
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={() => {
          if (!disabled) {
            onPress && onPress();
          }
        }}
        style={[{justifyContent: 'center'}, wrapperStyle]}>
        <MaterialCommunityIcons
          name={
            checked ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'
          }
          color={color}
          size={size}
        />
      </TouchableOpacity>
    );
  }
}
