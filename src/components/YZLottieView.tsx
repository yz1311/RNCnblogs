import React, {Component} from 'react'
import {
    Image,
    View,
    Text,
    StyleSheet,
} from 'react-native'
import PropTypes from 'prop-types';
import LottieView from 'lottie-react-native';

//Lottie的interface未导出，暂时无法继承
export interface IProps{
    title?: string,
    style?: any,
    speed?: number,
    source?: any
}

export default class YZLottieView extends Component<IProps,{}> {
    static propTypes = {
        // ...LottieView.propTypes
    };

    private animation: any;

    componentDidMount() {
        // this.animation.play();
    }

    render() {

        const {title} = this.props

        return (
            <LottieView
                ref={animation => {
                    this.animation = animation;
                }}
                autoPlay={true}
                loop={true}
                source={require('../resources/animation/3317-loading.json')}
                {...this.props}
            />
        )
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
        backgroundColor:'transparent'
    },
    loading: {
        // minHeight: 100,
        // minWidth: 100,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical:18,
        paddingHorizontal:18
    },
    title: {
        color: '#fff',
        fontSize: 14,
        marginTop: 10
    }
})