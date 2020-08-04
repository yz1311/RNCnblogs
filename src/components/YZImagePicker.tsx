import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Animated,
  TouchableOpacity,
  Platform,
  Alert,
  AppState,
  BackHandler,
} from 'react-native';
import PropTypes from 'prop-types';
// @ts-ignore
import ImagePicker from 'react-native-image-picker';

export interface IProps {
  onLaunchImage: any;
}

export interface IState {
  isShow: boolean;
  animatedValue: any;
}

export default class YZImagePicker extends Component<IProps, IState> {
  static propTypes = {
    onLaunchImage: PropTypes.func,
  };

  state = {
    isShow: false,
    animatedValue: new Animated.Value(0),
  };

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this._handleHwBackEvent);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener(
      'hardwareBackPress',
      this._handleHwBackEvent,
    );
  }

  _handleHwBackEvent = () => {
    //默认就是关闭当前modal
    if (this.state.isShow) {
      this.hide();
      return true;
    }
    return false;
  };

  show = () => {
    this.setState({isShow: true}, () => {
      Animated.timing(this.state.animatedValue, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false
      }).start();
    });
  };

  hide = () => {
    Animated.timing(this.state.animatedValue, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false
    }).start(() => this.setState({isShow: false}));
  };

  _onLaunchCamera = () => {
    const {onLaunchImage} = this.props;

    Animated.timing(this.state.animatedValue, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false
    }).start(() => {
      this.setState({isShow: false});
      const options = {
        quality: 1,
        maxWidth: 1000,
        maxHeight: 1000,
        allowsEditing: false,
        storageOptions: {
          skipBackup: true,
        },
      };

      ImagePicker.launchCamera(options, response => {
        onLaunchImage && onLaunchImage(response);
      });
    });
  };

  _onLaunchImageLibrary = () => {
    const {onLaunchImage} = this.props;

    Animated.timing(this.state.animatedValue, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false
    }).start(() => {
      this.setState({isShow: false});
      // 拍照
      const options = {
        quality: 1,
        maxWidth: 1000,
        maxHeight: 1000,
        allowsEditing: false,
        storageOptions: {
          skipBackup: true,
        },
      };
      ImagePicker.launchImageLibrary(options, response => {
        // Same code as in above section!
        onLaunchImage && onLaunchImage(response);
      });
    });
  };

  render() {
    if (!this.state.isShow) return null;
    const {animatedValue} = this.state;
    const opacity = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['rgba(1,1,1,0)', 'rgba(1,1,1,0.4)'],
    });
    const positionY = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [-(44 + 60 * 3 + 8 + 10), 0],
    });

    return (
      <Animated.View style={[styles.animatedView, {backgroundColor: opacity}]}>
        <TouchableOpacity
          activeOpacity={1}
          style={styles.animatedView}
          onPress={this.hide}>
          <Animated.View style={[styles.contentWrapper, {bottom: positionY}]}>
            <View style={styles.btnWrapper}>
              <TouchableOpacity
                activeOpacity={1}
                style={styles.prompt}
                onPress={() => {}}>
                <Text style={styles.promptTitle}>请选择一种方式</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={1}
                style={[
                  styles.btn,
                  {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderColor: gColors.borderColor,
                  },
                ]}
                onPress={this._onLaunchCamera}>
                <Text style={styles.btnTitle}>拍照</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={1}
                style={styles.btn}
                onPress={this._onLaunchImageLibrary}>
                <Text style={styles.btnTitle}>相册</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              activeOpacity={1}
              style={styles.cancelBtn}
              onPress={this.hide}>
              <Text style={styles.cancelTitle}>取消</Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  isShow = () => {
    return this.state.isShow;
  };
}

const styles = StyleSheet.create({
  animatedView: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  contentWrapper: {
    ...Platform.select({
      ios: {
        padding: 10,
        height: 44 + 60 * 3 + 8 + 10,
      },
      android: {
        height: 44 + 50 * 3 + 8,
      },
    }),
    paddingTop: 0,
    left: 0,
    right: 0,
    position: 'absolute',
  },
  prompt: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: gColors.borderColor,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  promptTitle: {
    fontSize: 13,
    color: gColors.color999,
  },
  btnWrapper: {
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        borderRadius: 10,
      },
    }),
  },
  btn: {
    ...Platform.select({
      ios: {height: 60},
      android: {height: 50},
    }),
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnTitle: {
    ...Platform.select({
      ios: {color: 'rgb(0,91,221)', fontSize: 20},
      android: {color: gColors.color333, fontSize: 18},
    }),
  },
  cancelBtn: {
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        borderRadius: 10,
        height: 60,
      },
      android: {height: 50},
    }),
    backgroundColor: '#fff',
  },
  cancelTitle: {
    ...Platform.select({
      ios: {color: 'rgb(0,91,221)', fontWeight: 'bold', fontSize: 20},
      android: {color: gColors.color333, fontSize: 18},
    }),
  },
});
