import React, {Component} from 'react';
import {
  StyleSheet,
  Platform,
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  TextInput,
  KeyboardTypeOptions,
} from 'react-native';
import PropTypes from 'prop-types';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import {resetActionPayload} from '../sagas/nav_sagas';

const RightChevron = ({size = undefined, style = undefined}) => (
  <Entypo
    style={style}
    name="chevron-thin-right"
    size={size || 16}
    color={gColors.color666}
  />
);

export interface IProps {
  title: string;
  subTitle?: string;
  type: string;
  contentStyle?: any;
  wrapperStyle?: any;
  titleColor?: string;
  subTitleColor?: string;
  editable?: boolean;
  onChangeText?: any;
  placeholder?: string;
  onSubmitEditing?: any;
  keyboardType?: KeyboardTypeOptions;
  onBlur?: any;
  maxLength?: number;
  placeholderTextColor?: string;
  isInfo?: boolean;
  isRequired?: boolean;
  onShowInfo?: any;
  detailStyle: any;
  realName?: any;
  extra?: any;
}

export default class YZManagementProfile extends Component<IProps, {}> {
  static propTypes = {
    //只当显示文字时有效
    numberOfLines: PropTypes.number,
    type: PropTypes.string.isRequired,
    title: PropTypes.string,
    titleColor: PropTypes.string,
    subTitle: PropTypes.string,
    subTitleColor: PropTypes.string,
    placeholder: PropTypes.string,
    onPress: PropTypes.func,
    contentStyle: PropTypes.any,
    wrapperStyle: PropTypes.any,
    keyboardType: PropTypes.string,
    editable: PropTypes.bool,
    onChangeText: PropTypes.func,
    onSubmitEditing: PropTypes.func,
    onBlur: PropTypes.func,
  };

  static defaultProps = {
    type: 'text',
  };

  constructor(props) {
    super(props);
  }

  //disabled=true时，onPress点击无效
  _renderPlainText = ({
    title,
    subTitle,
    onPress,
    contentStyle,
    wrapperStyle,
    isRequired,
    realName,
    titleColor,
    subTitleColor,
    placeholder,
    placeholderTextColor,
    numberOfLines,
    isInfo,
    onShowInfo,
    disabled = false,
  }) => {
    let isPlaceholder;
    //则显示placeholder
    if (!subTitle && placeholder) {
      subTitle = placeholder;
      subTitleColor = placeholderTextColor
        ? placeholderTextColor
        : gColors.color999;
    }
    let detailTextProps = {};
    if (numberOfLines) {
      detailTextProps = {
        numberOfLines,
      };
    }
    let titleView = (
      <Text
        style={[
          styles.color3,
          {fontSize: gFont.size15},
          titleColor && {color: titleColor},
        ]}>
        {title}
      </Text>
    );
    if (isInfo) {
      titleView = (
        <TouchableOpacity
          style={{alignSelf: 'stretch', justifyContent: 'center'}}
          activeOpacity={activeOpacity}
          onPress={() => onShowInfo()}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text
              style={[
                styles.color3,
                {fontSize: gFont.size15},
                titleColor && {color: titleColor},
              ]}>
              {title}
            </Text>
            <SimpleLineIcons
              style={{marginLeft: 10}}
              name="question"
              color={gColors.themeColor}
              size={17}
            />
          </View>
        </TouchableOpacity>
      );
    }
    if (isRequired) {
      titleView = (
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Text
            style={[
              styles.color3,
              {fontSize: gFont.size15},
              titleColor && {color: titleColor},
            ]}>
            {title}
          </Text>
          <Text
            style={{
              color: gColors.colorRed,
              fontSize: gFont.size17,
              marginLeft: 5,
            }}>
            *
          </Text>
        </View>
      );
    }
    return (
      <TouchableOpacity
        activeOpacity={0.75}
        style={[
          {
            paddingLeft: 10,
            backgroundColor: '#fff',
            borderColor: gColors.borderColor,
          },
          wrapperStyle,
        ]}
        onPress={() => {
          if (!disabled) {
            onPress && onPress(title);
          }
        }}>
        <View
          style={[
            {
              borderColor: gColors.borderColor,
              borderBottomWidth: gScreen.onePix,
              flexDirection: 'row',
              height: Platform.OS === 'ios' ? 55 : 50,
              alignItems: 'center',
              paddingRight: 10,
            },
            contentStyle,
          ]}>
          {titleView}
          <View
            style={[
              styles.horizontally,
              styles.TopBottomCenter,
              {flexGrow: 1, flexBasis: 0, marginLeft: 10},
            ]}>
            <Text
              {...detailTextProps}
              style={[
                styles.color9,
                {
                  fontSize: gFont.size15,
                  flexGrow: 1,
                  flexBasis: 0,
                  textAlign: 'right',
                },
                subTitleColor && {color: subTitleColor},
              ]}>
              {subTitle}
            </Text>
            {!realName && !disabled && <RightChevron />}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  _renderTextInput = () => {
    const {
      title,
      subTitle,
      contentStyle,
      wrapperStyle,
      titleColor,
      subTitleColor,
      editable,
      onChangeText,
      placeholder,
      onSubmitEditing,
      keyboardType,
      onBlur,
      maxLength,
      placeholderTextColor,
      isInfo,
      isRequired,
      onShowInfo,
      detailStyle,
    } = this.props;
    let titleView = (
      <Text
        style={[
          styles.color3,
          {fontSize: gFont.size15},
          titleColor && {color: titleColor},
        ]}>
        {title}
      </Text>
    );
    if (isInfo) {
      titleView = (
        <TouchableOpacity
          style={{alignSelf: 'stretch', justifyContent: 'center'}}
          activeOpacity={activeOpacity}
          onPress={() => onShowInfo()}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text
              style={[
                styles.color3,
                {fontSize: gFont.size15},
                titleColor && {color: titleColor},
              ]}>
              {title}
            </Text>
            <SimpleLineIcons
              style={{marginLeft: 10}}
              name="question"
              color={gColors.themeColor}
              size={17}
            />
          </View>
        </TouchableOpacity>
      );
    }
    if (isRequired) {
      titleView = (
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Text
            style={[
              styles.color3,
              {fontSize: gFont.size15},
              titleColor && {color: titleColor},
            ]}>
            {title}
          </Text>
          <Text
            style={{
              color: gColors.colorRed,
              fontSize: gFont.size17,
              marginLeft: 5,
            }}>
            *
          </Text>
        </View>
      );
    }
    return (
      <View
        style={[
          {
            paddingLeft: 10,
            backgroundColor: '#fff',
            borderColor: gColors.borderColor,
          },
          wrapperStyle,
        ]}>
        <View
          style={[
            {
              borderColor: gColors.borderColor,
              borderBottomWidth: gScreen.onePix,
              flexDirection: 'row',
              height: Platform.OS === 'ios' ? 55 : 50,
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingRight: 10,
            },
            contentStyle,
          ]}>
          {titleView}
          <TextInput
            placeholder={placeholder || '请输入'}
            placeholderTextColor={placeholderTextColor || gColors.color999}
            underlineColorAndroid="transparent"
            style={[
              {
                flex: 1,
                padding: 0,
                textAlign: 'right',
                fontSize: gFont.size15,
                color: gColors.color333,
              },
              subTitleColor && {color: subTitleColor},
              detailStyle,
            ]}
            value={subTitle}
            keyboardType={keyboardType}
            editable={editable}
            onChangeText={onChangeText}
            onSubmitEditing={onSubmitEditing}
            onBlur={onBlur}
            maxLength={maxLength}
          />
        </View>
      </View>
    );
  };

  _renderCustom = ({
    title,
    subTitle,
    onPress,
    contentStyle,
    wrapperStyle,
    realName,
    titleColor,
    extra,
  }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.75}
        style={[
          {
            paddingLeft: 10,
            backgroundColor: '#fff',
            borderColor: gColors.borderColor,
          },
          wrapperStyle,
        ]}
        onPress={() => onPress && onPress(title)}>
        <View
          style={[
            {
              borderColor: gColors.borderColor,
              borderBottomWidth: gScreen.onePix,
              flexDirection: 'row',
              minHeight: Platform.OS === 'ios' ? 55 : 50,
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingRight: 10,
            },
            contentStyle,
          ]}>
          <Text
            style={[
              styles.color3,
              {fontSize: gFont.size15},
              titleColor && {color: titleColor},
            ]}>
            {title}
          </Text>
          <View
            style={[
              styles.horizontally,
              styles.TopBottomCenter,
              {flexGrow: 1, flexBasis: 0, justifyContent: 'flex-end'},
            ]}>
            {extra}
            {!realName && (
              <RightChevron style={{width: 15, height: 20, marginLeft: 5}} />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  render() {
    const {type} = this.props;

    let content;
    if (type == 'text') {
      // @ts-ignore
      content = this._renderPlainText({...this.props});
    } else if (type === 'custom') {
      // @ts-ignore
      content = this._renderCustom({...this.props});
    } else {
      content = this._renderTextInput();
    }

    return <View>{content}</View>;
  }
}

const styles = StyleSheet.create({
  height50: {
    height: 50,
  },
  paddingLeftRight: {
    paddingLeft: 15,
  },
  leftRight: {
    justifyContent: 'space-between',
  },
  TopBottomCenter: {
    alignItems: 'center',
  },
  horizontally: {
    flexDirection: 'row',
  },
  borderColorD9: {
    borderColor: '#d9d9d9',
  },
  color3: {
    color: '#333',
  },
  color9: {
    color: '#999',
  },
  infoview: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderColor: gColors.themeColor,
    borderWidth: gScreen.onePix,
    marginLeft: 5,
    textAlign: 'center',
    color: gColors.themeColor,
    fontSize: gFont.size12,
    alignItems: 'center',
  },
});
