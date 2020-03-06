import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Animated,
  Keyboard,
  BackHandler,
} from 'react-native';
import PropTypes from 'prop-types';
import {Styles} from '../common/styles';

export interface IProps {
  //标题的元素
  header?: any;
  //中间的元素
  content: any;
  //底部的元素
  bottom?: any;
  //点击Modal的阴影部分回调的方法
  onRequestClose?: any;
  //是否点击阴影部分关闭modal,默认是true
  closeWhenBackgroundClicked: boolean;
  onKeyboardHide?: any;
  contentStyle?: any;
  contentWrapperStyle?: any;
  enableCloseAnimation: boolean;
  overflow?: any;
}

//Todo:android下第二次键盘的高度会变化一次,导致界面会跳动下
export default class YZAnimatedModal extends Component<IProps, {}> {
  static propTypes = {
    //标题的元素
    header: PropTypes.element,
    //中间的元素
    content: PropTypes.element,
    //底部的元素
    bottom: PropTypes.element,
    //点击Modal的阴影部分回调的方法
    onRequestClose: PropTypes.func,
    //是否点击阴影部分关闭modal,默认是true
    closeWhenBackgroundClicked: PropTypes.bool,
    onKeyboardHide: PropTypes.func,
    contentStyle: PropTypes.any,
    contentWrapperStyle: PropTypes.any,
    enableCloseAnimation: PropTypes.bool,
  };

  static defaultProps = {
    closeWhenBackgroundClicked: true,
    enableCloseAnimation: false,
  };

  private keyboardDidShowListener: any;
  private keyboardDidHideListener: any;
  private modalHeight: number;
  private modalY: number;

  state = {
    isShow: false,
    scaleAnimatedValue: new Animated.Value(0),
    opacityAnimatedValue: new Animated.Value(0),
    keyboardHeight: 0,
  };

  componentDidMount() {
    //Android无法控制
    if (__IOS__) {
      this.keyboardDidShowListener = Keyboard.addListener(
        'keyboardDidShow',
        this._keyboardDidShow,
      );
      this.keyboardDidHideListener = Keyboard.addListener(
        'keyboardDidHide',
        this._keyboardDidHide,
      );
    }
    BackHandler.addEventListener('hardwareBackPress', this._handleHwBackEvent);
  }

  componentWillUnmount() {
    if (__IOS__) {
      this.keyboardDidShowListener.remove();
      this.keyboardDidHideListener.remove();
    }
    BackHandler.removeEventListener(
      'hardwareBackPress',
      this._handleHwBackEvent,
    );
  }

  _handleHwBackEvent = () => {
    //默认就是关闭当前modal
    if (this.state.isShow) {
      this._close();
      return true;
    }
    return false;
  };

  _keyboardDidShow = e => {
    // alert('Keyboard Shown');
    //安卓下startCoordinates为null,startCoordinates表示键盘顶部属性，endCoordinates表示键盘底部的属性,两者的height属性都是一致的，表示键盘的高度
    this.setState({
      keyboardHeight: e.endCoordinates.height,
    });
  };

  _keyboardDidHide = () => {
    // alert('Keyboard Hidden');
    this.setState({
      keyboardHeight: 0,
    });
    const {onKeyboardHide} = this.props;
    onKeyboardHide && onKeyboardHide();
  };

  show = () => {
    this.setState({isShow: true}, () => {
      Animated.parallel(
        [
          Animated.timing(this.state.opacityAnimatedValue, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.spring(this.state.scaleAnimatedValue, {
            toValue: 1,
            // duration: 200,
            // friction: 5
            bounciness: 10,
            useNativeDriver: true,
          }),
        ],
        {},
      ).start();
    });
  };

  _close = () => {
    if (!this.props.enableCloseAnimation) {
      this.setState({isShow: false}, () => {});
      this.state.scaleAnimatedValue.setValue(0);
      this.state.opacityAnimatedValue.setValue(0);
    } else {
      //显示关闭动画
      Animated.parallel([
        Animated.timing(this.state.opacityAnimatedValue, {
          toValue: 0,
          duration: 200,
        }),
        Animated.spring(this.state.scaleAnimatedValue, {
          toValue: 0,
          // duration: 200,
          // friction: 5
          tension: 10,
        }),
      ]).start(() => {
        this.setState({
          isShow: false,
        });
      });
    }
  };

  render() {
    if (!this.state.isShow) return null;

    const {scaleAnimatedValue, opacityAnimatedValue} = this.state;
    //实际的高度应该是键盘高度-（屏幕高度-对话框高度）/2,目前无法获取对话框的高度
    let marginBottom = 0;
    if (this.state.keyboardHeight != 0) {
      // console.log('keyboardHeight:'+this.state.keyboardHeight);
      // console.log('modalHeight:'+this.modalHeight);
      // console.log('gScreen.height:'+gScreen.height);
      // console.log('gScreen.width:'+gScreen.width);
      //如果键盘的高度不大于原本居中的高度，则保持不变
      if (
        (gScreen.height - this.modalHeight) / 2 - 20 >
        this.state.keyboardHeight
      ) {
      }
      //否则设置marginBottom
      else {
        if (__IOS__) {
          marginBottom =
            this.state.keyboardHeight -
            (gScreen.height - this.modalHeight) / 2 +
            20;
          //20是随便的一个值，因为实际上有点偏移
          const maxMargin =
            gScreen.height - gScreen.statusBarHeight - this.modalHeight - 20;
          if (marginBottom >= maxMargin) {
            marginBottom = maxMargin;
          }
        }
        //android下会自动增长
        else {
          //到达或者超过了顶部
          if (this.modalY <= gScreen.statusBarHeight) {
            //为0或者负值
            marginBottom = this.modalY - gScreen.statusBarHeight;
          }
        }
      }
    }
    // console.log('marginBottom:'+marginBottom);
    return (
      <Animated.View
        style={[styles.container, {opacity: opacityAnimatedValue}]}>
        <TouchableOpacity
          activeOpacity={1}
          style={styles.cover}
          onPress={() => {
            const {onRequestClose, closeWhenBackgroundClicked} = this.props;
            if (onRequestClose) {
              onRequestClose();
            }
            if (closeWhenBackgroundClicked === true) {
              this._close();
            }
            //隐藏键盘
            Keyboard.dismiss();
          }}>
          <Animated.View
            pointerEvents="box-none"
            onLayout={({nativeEvent}) => {
              console.log(nativeEvent.layout);
              this.modalHeight = nativeEvent.layout.height;
              this.modalY = nativeEvent.layout.y;
              //不正确
              // this.refs.modalContent.measure((x,y,width,height,pageX,pageY)=>{
              //     this.modalHeight = height;
              //     console.log('x:y  :'+x+'  '+y+'  width:height  :'+width+'  '+height);
              // })
            }}
            style={[
              styles.contentWrapper,
              {
                transform: [
                  {scaleX: scaleAnimatedValue},
                  {scaleY: scaleAnimatedValue},
                ],
              },
              {marginBottom: marginBottom},
              this.props.contentWrapperStyle,
            ]}>
            <TouchableOpacity ref="modalContent" activeOpacity={1}>
              {this.props.header}
              <View style={[styles.infoWrapper, this.props.contentStyle]}>
                {this.props.content}
              </View>
              {this.props.bottom ? (
                this.props.bottom
              ) : (
                <TouchableOpacity
                  activeOpacity={0.75}
                  style={[
                    {
                      height: 50,
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderTopWidth: gScreen.onePix,
                      borderColor: gColors.borderColor,
                    },
                  ]}
                  onPress={this._close}>
                  <Text
                    style={{fontSize: gFont.size16, color: gColors.themeColor}}>
                    确定
                  </Text>
                </TouchableOpacity>
              )}
              {this.props.overflow}
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
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(1,1,1,0.5)',
  },
  cover: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentWrapper: {
    width: gScreen.width - 15 * 2,
    borderRadius: 6,
    backgroundColor: '#fff',
    // alignItems: 'center',
    // overflow: 'hidden'
  },
  infoWrapper: {
    backgroundColor: '#fff',
    paddingVertical: 20,
  },
});
