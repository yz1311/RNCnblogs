import React, {Component} from 'react'
import {
    View,
    StyleSheet,
    Text,
    Animated,
    TouchableOpacity,
    Dimensions,
    ViewPropTypes
} from 'react-native'
import PropTypes from 'prop-types';
const screenW = Dimensions.get('window').width
const screenH = Dimensions.get('window').height

export interface IProps {
    style: any,
    contentOffset: number,
    onOpenedMenu: any,
    onClosedMenu: any,
    animateDuration: number,
    menu: any
}

export interface IState {
    isOpen: boolean,
    menuPosition: any
}

export default class YZSlideMenu extends Component<IProps,IState> {

    static propTypes = {
        style: ViewPropTypes.style,
        contentOffset: PropTypes.number,
        onOpenedMenu: PropTypes.func,
        onClosedMenu: PropTypes.func,
        animateDuration: PropTypes.number,
        menu: PropTypes.element
    };

    static defaultProps = {
        contentOffset: screenW * 0.25,
        animateDuration: 300,
    };

    constructor(props) {
        super(props)
        this.state = {
            isOpen: false,
            menuPosition: new Animated.Value(0)
        }
    }

    openMenu = (callback) => {
        this.setState({isOpen: true}, () => {
            Animated.timing(this.state.menuPosition, {
                toValue: 1,
                duration: this.props.animateDuration
            }).start(()=>{
                this.props.onOpenedMenu && this.props.onOpenedMenu();
                callback&&callback();
            })
        })
    }

    closeMenu = () => {
        Animated.timing(this.state.menuPosition, {
            toValue: 0,
            duration: this.props.animateDuration
        }).start(()=>{
            this.props.onClosedMenu && this.props.onClosedMenu()
            this.setState({isOpen: false})
        })
    }

    isShow =()=>{
        return this.state.isOpen;
    }

    render() {
        const {isOpen} = this.state
        const {contentOffset} = this.props
        const menuStyle = [
            styles.menu,
            {
                width: screenW-contentOffset,
                right: this.state.menuPosition.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-(screenW-contentOffset),0]
                    }
                )
            }
        ]
        const coverStyle = [
            styles.cover,
            {
                backgroundColor: this.state.menuPosition.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['transparent', 'rgba(1,1,1,0.6)']
                    }
                )
            }
        ]

        return (
            <View
                pointerEvents="box-none"
                style={[{flex: 1,position:'absolute',top:0,right:0,left:0,bottom:0,backgroundColor:'transparent'},this.props.style]}>
                {this.props.children}
                {isOpen &&
                <TouchableOpacity
                    activeOpacity={1}
                    style={styles.cover}
                    onPress={this.closeMenu}
                >
                    <Animated.View style={coverStyle}/>
                </TouchableOpacity>
                }
                {isOpen && <Animated.View style={menuStyle}>{this.props.menu}</Animated.View>}
            </View>
        )
    }
}

const styles = StyleSheet.create({
    menu: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        backgroundColor: '#fff'
    },
    cover: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        left: 0
    }
})
