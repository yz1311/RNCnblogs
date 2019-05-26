/**
 * 统一处理android返回键的问题
 * 默认是返回操作
 * 如果需要重写操作，在组件内重写onBack或者_onBack即可
 * 但是，一定要返回true,否则，安卓返回事件会继续向上传递
 * 原理:
 * 1.使用HOC的反向继承
 * 2.使用react-navigation的didFocus和willBlur(2.0版本才有这些方法),实现只有页面在栈顶的时候才能响应返回键事件
 * 这部分参考react-navigation-backhandler实现
 * 使用方法:搜索引用该组件的代码查看
 */
import React, { Component } from 'react'
import {
    TouchableWithoutFeedback,
    View,
    BackHandler
} from 'react-native';
//该组件需要react-navigation结合，该句代码作用为确保存在该库
import {withNavigation} from 'react-navigation';    //eslint-disable-line

//反向继承
const decorator = WrappedComponent => class extends WrappedComponent {
    constructor(props)
    {
        super(props);
        this._didFocusSubscription = props.navigation.addListener('didFocus', payload =>
            BackHandler.addEventListener('hardwareBackPress', this.onBackPressed)
        );
    }
    componentDidMount() {
        super.componentDidMount&&super.componentDidMount();
        this._willBlurSubscription = this.props.navigation.addListener('willBlur', payload =>
            BackHandler.removeEventListener('hardwareBackPress', this.onBackPressed)
        );
    }

    componentWillUnmount() {
        super.componentWillUnmount&&super.componentWillUnmount();
        this._didFocusSubscription && this._didFocusSubscription.remove();
        this._willBlurSubscription && this._willBlurSubscription.remove();
        BackHandler.removeEventListener('hardwareBackPress', this.onBackPressed);
    }

    onBackPressed=()=> {
        if(this.onBack)
        {
            //必须要有返回值，否则默认事件继续向上传递
            return this.onBack();
        }
        else if(this._onBack)
        {
            //必须要有返回值，否则默认事件继续向上传递
            return this._onBack();
        }
        //默认返回上一级
        else
        {
            if(this.props.navigation)
            {
                this.props.navigation.goBack();
                return true;
            }
            else
            {
                console.warn('YZBackHanddler 组件,navigation为空');
            }
        }
    }


    render() {
        // return withNavigation(<WrappedComponent {...this.props} />);
        return super.render();
    }
}

export default decorator;
