import React, {Component} from 'react'
import {
    StyleSheet,
    Platform,
    View,
    Text,
    TouchableOpacity,
    Image,
    Dimensions,
    StatusBar, StatusBarStyle
} from 'react-native'
import PropTypes from 'prop-types';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';

const isAndroid = Platform.OS === 'android'
const screenW = Dimensions.get('window').width

const LeftItem = ({onPress, type , leftTitle}) => {
    const fontStyle = type == 'default' ? '#666666' : '#fff'
    const arrowColor = type == 'default'?gColors.colorDarkPurple2:'#fff';
    return (
        <TouchableOpacity
            activeOpacity={0.75}
            style={styles.leftItem}
            onPress={onPress}
        >
            {leftTitle &&
            <Text style={{fontSize: gFont.size15, color: fontStyle,marginLeft:gMargin}}>{`${leftTitle}`}</Text>
            ||
            <Entypo style={{}} name="chevron-thin-left" size={23} color={arrowColor}/>
            }
        </TouchableOpacity>
    )
}

const RightItem = ({onPress, text, type,rightTandI,color}) => {
    let fontStyle = type == 'default' ? '#666666' : '#fff';
    //目前暂时没有哪里使用type属性
    fontStyle=color==='default'?'#666666':color;
    return (
        <TouchableOpacity
            activeOpacity={0.75}
            style={[styles.rightItem,{justifyContent:'space-between',flexDirection:'row',alignItems:'center'}]}
            onPress={onPress}
        >
            <Image source={rightTandI} style={{height:15,width:15,marginRight:gMargin/2}}/>
            <Text style={{fontSize: gFont.size15, color: fontStyle}}>{text}</Text>
        </TouchableOpacity>
    )
}

const RightIconItem = ({onPress, icon}) => {
    return (
        <TouchableOpacity
            activeOpacity={0.75}
            style={styles.rightIconItem}
            onPress={onPress}
        >
            <Image style={{width: 20, height: 20}} source={icon} resizeMode={"contain"}/>
        </TouchableOpacity>
    )
}

export interface IProps {
    type: string,
    title: string,
    titleStyle?: any,
    leftTitle?: any,
    showGoBack?: boolean,
    backAction?: any,
    style?: any,
    rightTitle?: any,
    rightTitleColor?: string,
    rightAction?: any,
    rightIcon?: any,
    leftAction?: any,
    renderLeftItem?: any,
    renderRightItem?: any,
    rightTandI?: any,
    statusBarBackgroundColor?: string,
    showUnderline?: boolean,
    statusBarStyle?: StatusBarStyle
}

export default class YZHeader extends Component<IProps,{}> {

    static defaultProps = {
        showGoBack: true,
        type: 'default',
        rightTitleColor:'#666666',
        statusBarBackgroundColor:gColors.bgColorF,
        showUnderline:true
    }

    static propTypes = {
        type: PropTypes.string,
        style: PropTypes.any,
        title: PropTypes.string,
        showGoBack: PropTypes.bool,
        backAction: PropTypes.func,
        titleStyle: PropTypes.object,
        rightTitle: PropTypes.string,
        leftAction: PropTypes.func,
        rightAction: PropTypes.func,
        rightIcon: PropTypes.any,
        renderLeftItem: PropTypes.func,
        renderRightItem: PropTypes.func,
        rightTitleColor:PropTypes.string,
        statusBarBackgroundColor:PropTypes.string,
        statusBarStyle:PropTypes.oneOf(['default','light-content','dark-content']),
        showUnderline:PropTypes.bool,
    }

    componentDidMount()
    {
        const {statusBarBackgroundColor} = this.props;
        // if(__ANDROID__&&statusBarBackgroundColor)
        // {
        //     StatusBar.setBackgroundColor(statusBarBackgroundColor);
        // }
    }

    componentWilReceiveProps(nextProps)
    {

    }

    render() {
        const {
            type, title, titleStyle,leftTitle,
            showGoBack, backAction,
            style, rightTitle, rightAction, rightIcon, leftAction,
            renderLeftItem, renderRightItem,rightTandI,
            statusBarBackgroundColor,
            showUnderline
        } = this.props;

        const backgroundStyle = type == 'default' ? {backgroundColor: '#fff'} : {backgroundColor: gColors.themeColor, borderBottomWidth: 0}
        const fontStyle = type == 'default' ? {} : {color: '#fff'}
        //将状态栏控件作为绝对布局，使状态栏背景色默认为整个Header的背景色，但是可以重写statusBarBackgroundColor
        return (
            <View style={[styles.header,showUnderline&&{borderColor: gColors.borderColor,borderBottomWidth: gScreen.onePix,}, backgroundStyle, style]}>
                <StatusBar barStyle={this.props.statusBarStyle} animated={true} translucent={true} backgroundColor={statusBarBackgroundColor?statusBarBackgroundColor:'transparent'}/>
                <View style={{position:'absolute',width:gScreen.width,height:gScreen.statusBarHeight,backgroundColor:statusBarBackgroundColor?statusBarBackgroundColor:'transparent'}}/>
                <View style={{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'center'}}>
                    {showGoBack && <LeftItem onPress={backAction} type={type} leftTitle={leftTitle}/>}
                    <Text style={[styles.title, fontStyle, titleStyle]}>{title || ''}</Text>
                    {rightTitle && <RightItem text={rightTitle} onPress={rightAction} type={type} rightTandI={rightTandI} color={this.props.rightTitleColor}/>}
                    {rightIcon && <RightIconItem icon={rightIcon} onPress={rightAction}/>}
                    {renderLeftItem &&
                    <TouchableOpacity
                        activeOpacity={0.75}
                        style={styles.renderLeft}
                        onPress={leftAction}
                    >
                        {renderLeftItem()}
                    </TouchableOpacity>
                    }
                    {renderRightItem &&
                    <TouchableOpacity
                        activeOpacity={0.75}
                        style={styles.renderRight}
                        onPress={rightAction}
                    >
                        {renderRightItem()}
                    </TouchableOpacity>
                    }
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    header: {
        //2018/04/09 由于有SafeAreaView的存在，所以现在不采用paddingTop的方式了
        height: isAndroid ? 50+gScreen.statusBarHeight : 44+gScreen.statusBarHeight,
        // width: screenW,
        paddingTop: gScreen.statusBarHeight,
        // justifyContent: 'center',
        // alignItems: 'center',
    },
    title: {
        // textAlign: 'center',
        color: '#333',
        fontSize: 18,
        fontWeight:'bold',
    },
    leftItem: {
        position: 'absolute',
        // top: isAndroid ? 0 : gScreen.statusBarHeight,
        left: 0,
        height: isAndroid ? 50 : 44,
        width: 60,
        paddingLeft: 6,
        paddingRight:7,
        justifyContent: 'center'
    },
    rightItem: {
        position: 'absolute',
        // top: isAndroid ? 0 : gScreen.statusBarHeight,
        right: 0,
        height: isAndroid ? 50 : 44,
        paddingRight: 10,
        justifyContent: 'center',
        alignItems: 'flex-end'
    },
    rightIconItem: {
        position: 'absolute',
        // top: isAndroid ? 0 : gScreen.statusBarHeight,
        right: 0,
        height: isAndroid ? 50 : 44,
        paddingRight: 10,
        justifyContent: 'center',
        alignItems: 'flex-end'
    },
    renderLeft: {
        position: 'absolute',
        // top: isAndroid ? 0 : gScreen.statusBarHeight,
        left: 0,
        height: isAndroid ? 50 : 44,
        paddingLeft: 10,
        justifyContent: 'center',
        alignItems: 'flex-end'
    },
    renderRight: {
        position: 'absolute',
        // top: isAndroid ? 0 : gScreen.statusBarHeight,
        right: 0,
        height: isAndroid ? 50 : 44,
        paddingRight: 10,
        justifyContent: 'center',
        alignItems: 'flex-end'
    }
})