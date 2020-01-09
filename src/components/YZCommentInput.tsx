import React, {Component} from 'react';
import {
  Image,
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Keyboard,
  BackHandler,
} from 'react-native';
import PropTypes from 'prop-types';
import {AutoGrowingTextInput} from 'react-native-autogrow-textinput';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import {connect} from 'react-redux';
// import YZLottieView from '../components/YZLottieView';
import {showToast} from '../actions/app_actions';
import {
  addBookmark,
  clearBlogIsFav,
  deleteBookmarkByUrl,
  setBlogIsFav,
} from '../actions/bookmark/bookmark_index_actions';
import {ReduxState} from '../reducers';

export interface IProps {
  menuComponent: any;
  onSubmit: any;
  placeholder: string;
  editable: boolean;
  //最少输入的长度
  minLength: number;
  submitButtonText: string;
  headerTitle?: string;
  renderHeader?: any;
  headerTiteStyle?: any;
  onToggle?: any;
  isLogin?: boolean;
}

export interface IState {
  comment: string;
  isToggle: boolean;
}

@(connect(
  (state: ReduxState) => ({
    isLogin: state.loginIndex.isLogin,
  }),
  dispatch => ({
    dispatch,
  }),
  null,
) as any)
export default class YZCommentInput extends Component<IProps, IState> {
  static propTypes = {
    menuComponent: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
    onSubmit: PropTypes.func,
    placeholder: PropTypes.string,
    editable: PropTypes.bool,
    //最少输入的长度
    minLength: PropTypes.number,
    submitButtonText: PropTypes.string,
    headerTitle: PropTypes.string,
    renderHeader: PropTypes.func,
    headerTiteStyle: PropTypes.object,
    onToggle: PropTypes.func,
  };

  static defaultProps = {
    placeholder: '请输入评论',
    editable: true,
    minLength: 1,
    submitButtonText: '发表',
    // loadingView: <YZLottieView
    //     style={{width:120,height:120}}
    //     speed={2}
    //     source={require('../resources/animation/trail_loading')}/>
  };

  private keyboardDidShowListener: any;
  private keyboardDidHideListener: any;
  private input: any;
  private container: any;
  private contentHeight: any;
  private modalY: any;

  constructor(props) {
    super(props);
    this.state = {
      comment: '',
      isToggle: false,
    };
    //KeyboardSpacer会在Android下会将内容顶的很高，所以只能通过该事件监听了
    if (gScreen.isAndroid) {
      this.keyboardDidShowListener = Keyboard.addListener(
        'keyboardDidShow',
        this._keyboardDidShow,
      );
      this.keyboardDidHideListener = Keyboard.addListener(
        'keyboardDidHide',
        this._keyboardDidHide,
      );
      BackHandler.addEventListener(
        'hardwareBackPress',
        this._handleHwBackEvent,
      );
    }
  }

  componentWillUnmount() {
    if (gScreen.isAndroid) {
      this.keyboardDidShowListener.remove();
      this.keyboardDidHideListener.remove();
      BackHandler.removeEventListener(
        'hardwareBackPress',
        this._handleHwBackEvent,
      );
    }
  }

  _keyboardDidShow = e => {
    this._onToggle(true);
  };

  _keyboardDidHide = () => {
    this._onToggle(false);
    this.input.blur();
  };

  _handleHwBackEvent = () => {
    //默认就是关闭当前modal
    if (this.state.isToggle) {
      this._onToggle(false);
      this.input.blur();
      return true;
    }
    return false;
  };

  _onToggle = toggleState => {
    if (toggleState) {
      this.container.setNativeProps({
        style: {
          top: toggleState ? 0 : null,
        },
      });
    }
    this.setState(
      {
        isToggle: toggleState,
      },
      () => {
        const {onToggle} = this.props;
        onToggle && onToggle(toggleState);
      },
    );
  };

  show = () => {
    this._onToggle(true);
    this.input.focus();
  };

  render() {
    const {
      menuComponent,
      onSubmit,
      placeholder,
      editable,
      submitButtonText,
      minLength,
      headerTitle,
      renderHeader,
      headerTiteStyle,
    } = this.props;
    const {isToggle} = this.state;
    let menu;
    if (menuComponent != undefined) {
      if (typeof menuComponent === 'function') {
        menu = menuComponent();
      } else {
        menu = menuComponent;
      }
    }
    let canSubmit = false;
    if (this.state.comment.length >= minLength) {
      canSubmit = true;
    }
    let headerComponent = null;
    if (renderHeader) {
      headerComponent = renderHeader();
    } else if (headerTitle) {
      headerComponent = (
        <View style={{paddingTop: 13, paddingBottom: 3, paddingLeft: 8}}>
          <Text
            style={[
              {color: gColors.color666, fontSize: gFont.size15},
              headerTiteStyle,
            ]}>
            {headerTitle}
          </Text>
        </View>
      );
    }
    //height的高度不能变，不然会导致上面的内容变化
    return (
      <View
        ref={ref => (this.container = ref)}
        style={{
          position: isToggle ? 'absolute' : 'relative',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: isToggle ? 'rgba(0, 0, 0, 0.5)' : 'transparent',
        }}
        pointerEvents={isToggle ? 'auto' : 'box-none'}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            this.input.blur();
          }}
          style={{flex: 1}}
        />
        <View
          style={{
            position: !isToggle ? 'absolute' : 'relative',
            marginBottom: isToggle ? -this.contentHeight : 0,
            backgroundColor: gColors.bgColorF,
            opacity: isToggle ? 1 : 0,
            borderTopColor: gColors.borderColor,
            borderTopLeftRadius: 6,
            borderTopRightRadius: 6,
          }}>
          {headerComponent}
          <View
            style={{
              paddingLeft: 8,
              paddingVertical: isToggle ? 10 : 0,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <AutoGrowingTextInput
              ref={ref => (this.input = ref)}
              style={styles.textInput}
              placeholder={placeholder}
              onChangeText={value => this.setState({comment: value})}
              value={this.state.comment}
              textAlignVertical="top"
              multiline
            />
            <TouchableOpacity
              activeOpacity={activeOpacity}
              style={{
                paddingHorizontal: 10,
                alignSelf: 'stretch',
                justifyContent: 'center',
                backgroundColor: gColors.bgColorF,
              }}
              onPress={() => {
                if (canSubmit) {
                  onSubmit &&
                    onSubmit(this.state.comment, () => {
                      //清除评论并且收回键盘
                      this._onToggle(false);
                      this.setState({
                        comment: '',
                      });
                      this.input.blur();
                    });
                }
              }}>
              <Text
                style={{
                  color: !canSubmit ? gColors.color999 : gColors.themeColor,
                  fontSize: gFont.size15,
                }}>
                {submitButtonText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View
          style={{
            flexDirection: 'row',
            paddingVertical: 8,
            paddingLeft: 10,
            alignItems: 'center',
            backgroundColor: gColors.bgColorF,
            opacity: !isToggle ? 1 : 0,
          }}
          onLayout={({nativeEvent}) => {
            this.contentHeight = nativeEvent.layout.height;
            this.modalY = nativeEvent.layout.y;
          }}
          pointerEvents={isToggle ? 'none' : 'auto'}>
          {editable ? (
            <TouchableOpacity
              activeOpacity={activeOpacity}
              onPress={() => {
                if (!this.props.isLogin) {
                  NavigationHelper.navigate('Login');
                  return;
                }
                if (editable) {
                  this._onToggle(true);
                  this.input.focus();
                }
              }}
              style={{
                borderRadius: 18,
                paddingHorizontal: 18,
                flex: 1,
                height: 36,
                backgroundColor: gColors.backgroundColor,
                marginRight: 10,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <EvilIcons name="pencil" color={gColors.color0} size={22} />
              <Text>{placeholder}</Text>
            </TouchableOpacity>
          ) : (
            <View style={{flex: 1}} />
          )}
          {menu}
        </View>
        {__IOS__ ? (
          <KeyboardSpacer
            style={{backgroundColor: 'black'}}
            onToggle={this._onToggle}
          />
        ) : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    //最外层的View必须设置背景色，即使是透明的，否则周边可以点击到下面那层
    backgroundColor: 'transparent',
  },
  loading: {
    // minHeight: 100,
    // minWidth: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 18,
  },
  title: {
    color: '#fff',
    fontSize: 14,
    marginTop: 10,
  },
  textInput: {
    paddingLeft: 10,
    fontSize: 17,
    flex: 1,
    minHeight: Platform.OS === 'ios' ? 65 : 65,
    backgroundColor: gColors.borderColor,
    borderWidth: 0,
    borderRadius: Platform.OS === 'ios' ? 4 : 0,
  },
});
