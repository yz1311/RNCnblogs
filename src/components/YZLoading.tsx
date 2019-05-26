import React, {Component} from 'react'
import {
    Image,
    View,
    Text,
    StyleSheet,
} from 'react-native'
import PropTypes from 'prop-types';

export interface IProps {
    isShow: boolean,
    title: string
}

export interface IState {

}

export default class YZLoading extends Component<IProps,IState> {
    static propTypes = {
        isShow: PropTypes.bool.isRequired,
        title: PropTypes.string
    }

    render() {
        if (!this.props.isShow) return null;

        const {title} = this.props

        return (
            <View style={styles.container}>
                <View style={styles.loading}>
                    <Image
                        style={{ width: 30, height: 30 }}
                        source={require('../resources/img/loading_page.gif') }
                    />
                    <Text style={styles.title}>{title || '正在加载中…'}</Text>
                </View>
            </View>
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