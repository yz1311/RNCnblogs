/**
 * 上下滑动出现的布局，会打断用户操作
 */
import React, {Component} from 'react'
import {
    View,
    Text,
    Image,
    StyleSheet,
    Animated,
    TouchableOpacity,
    ScrollView,
    TouchableWithoutFeedback,
    Keyboard, BackHandler
} from 'react-native'
import PropTypes from 'prop-types';

export interface IProps {
    position: string,
    //动画类型
    animationType: string,
    contentHeight: number,
    // content: PropTypes.any.isRequired,
    //点击Modal的阴影部分回调的方法
    onRequestClose?: any,
    //是否点击阴影部分关闭modal,默认是true
    closeWhenBackgroundClicked: boolean,
    onKeyboardHide?: any,
    transparent?: boolean
}

export interface IState {
    isShow: boolean,
    animatedValue: any,
    keyboardHeight: number
}

export default class YZAnimatedPopup extends Component<IProps,IState> {
    static propTypes= {
        //popup出现的位置
        position: PropTypes.string.isRequired,
        //动画类型
        animationType: PropTypes.string.isRequired,
        contentHeight:PropTypes.number.isRequired,
        // content: PropTypes.any.isRequired,
        //点击Modal的阴影部分回调的方法
        onRequestClose: PropTypes.func,
        //是否点击阴影部分关闭modal,默认是true
        closeWhenBackgroundClicked: PropTypes.bool,
        onKeyboardHide:PropTypes.func,
        transparent:PropTypes.bool
    }


    static defaultProps= {
        //默认是在顶部,[top,bottom]
        position:'top',
        //暂时只支持滑动操作
        animationType:'slide',
        closeWhenBackgroundClicked:true,
        transparent:false
    }

    private keyboardDidShowListener: any;
    private keyboardDidHideListener: any;
    private onShow: any;
    private renderBefore: any;

    state = {
        isShow: false,
        animatedValue: new Animated.Value(0),
        keyboardHeight:0,
    }

    componentDidMount () {
        //Android下会将内容顶的很高
        if(!gScreen.isAndroid) {
            this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
            this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
        }
        else
        {
            BackHandler.addEventListener('hardwareBackPress', this._handleHwBackEvent);
        }
    }

    componentWillUnmount () {
        if(!gScreen.isAndroid) {
            this.keyboardDidShowListener.remove();
            this.keyboardDidHideListener.remove();
        }
        else
        {
            BackHandler.removeEventListener('hardwareBackPress', this._handleHwBackEvent);
        }
    }

    _handleHwBackEvent=()=>{
        //默认就是关闭当前modal
        if(this.state.isShow)
        {
            this.close();
            return true;
        }
        return false;
    }


    isShow=()=>{
        return this.state.isShow;
    }

    show  () {
        this.setState({isShow: true}, () => {
            Animated.timing(this.state.animatedValue, {
                toValue: 1,
                duration: 200
            }).start()
        })
        this.onShow&&this.onShow();
    }

    close = () => {
        Animated.timing(this.state.animatedValue, {
            toValue: 0,
            duration: 200
        }).start(() => this.setState({isShow: false}))
    }

    _keyboardDidShow =(e)=> {
        // alert('Keyboard Shown');
        //安卓下startCoordinates为null,startCoordinates表示键盘顶部属性，endCoordinates表示键盘底部的属性,两者的height属性都是一致的，表示键盘的高度
        this.setState({
            keyboardHeight:e.endCoordinates.height
        });
    }

    _keyboardDidHide =()=> {
        // alert('Keyboard Hidden');
        this.setState({
            keyboardHeight:0
        });
        const {onKeyboardHide} = this.props;
        onKeyboardHide&&onKeyboardHide();
    }


    render() {
        if (!this.state.isShow) return null
        const {position,contentHeight} = this.props;
        const opacity = this.state.animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['rgba(1,1,1,0)', 'rgba(1,1,1,0.6)']
        })
        let realContentHeight=contentHeight;
        //如果是顶部，且是ios，则需要考虑状态栏的高度
        if(position==='top')
        {
            realContentHeight+=gScreen.statusBarHeight;
        }
        const positionY = this.state.animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [-realContentHeight, 0]
        })
        let positionStyle: any={
            height:realContentHeight
        };
        switch(position)
        {
            case 'top':
                if(gScreen.isAndroid) {
                    positionStyle = {
                        ...positionStyle,
                        top: positionY
                    };
                }
                else
                {
                    positionStyle = {
                        ...positionStyle,
                        top: positionY,
                    };
                }
                break;
            case 'bottom':
                positionStyle={
                    ...positionStyle,
                    bottom:positionY
                };
                break;
        }
        let marginBottom = this.state.keyboardHeight;
        //TouchableWithoutFeedback的使用是为了点击内容区域不要响应onRequestClose
        return (
            <View style={[styles.modalContainer]}>
                {this.renderBefore&&this.renderBefore()}
                <Animated.View style={[styles.modalContainer, !this.props.transparent&&{backgroundColor: opacity}]}>
                    <TouchableOpacity
                        activeOpacity={1}
                        style={{flex: 1}}
                        onPress={()=>{
                            const {onRequestClose,closeWhenBackgroundClicked} = this.props;
                            if(onRequestClose)
                            {
                                onRequestClose();
                            }
                            if(closeWhenBackgroundClicked === true) {
                                this.close();
                            }
                        }}
                    >
                        <Animated.View style={[styles.logoutPrompt, positionStyle,!this.state.isShow&&{bottom:marginBottom}]}>
                            <TouchableWithoutFeedback>
                            {this.renderContent()}
                            </TouchableWithoutFeedback>
                        </Animated.View>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        )
    }

    renderContent=()=>{
        return null;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#eee',
    },
    modalContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
    },
    logoutPrompt: {
        position: 'absolute',
        right: 0,
        left: 0,
        backgroundColor: '#fff'
    },
});
