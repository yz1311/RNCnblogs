import YZStateView from "../components/YZStateCommonView";
import YZLottieView from "../components/YZLottieView";
import React from "react";
import {Platform} from "react-native";


export default class themeUtils {
    static reloadTheme = async ()=>{
        const themeInfo = await gStorage.load('themeInfo');
        gColors.themeColor = '#2f97a7';
        if(themeInfo && themeInfo.primaryColor)
        {
            gColors.themeColor = themeInfo.primaryColor;
            let animationFile = require('../resources/animation/trail_loading');
            switch (gColors.themeColor) {
                case '#d33c30':
                    animationFile = require('../resources/animation/trail_loading_d33c30');
                    break;
                case '#c33f5b':
                    animationFile = require('../resources/animation/trail_loading_c33f5b');
                    break;
                case '#7e48a2':
                    animationFile = require('../resources/animation/trail_loading_7e48a2');
                    break;
                case '#5447a9':
                    animationFile = require('../resources/animation/trail_loading_5447a9');
                    break;
                case '#2d3c95':
                    animationFile = require('../resources/animation/trail_loading_2d3c95');
                    break;
                case '#1a76d2':
                    animationFile = require('../resources/animation/trail_loading_1a76d2');
                    break;
                case '#0288d1':
                    animationFile = require('../resources/animation/trail_loading_0288d1');
                    break;
                case '#2f97a7':
                    animationFile = require('../resources/animation/trail_loading_2f97a7');
                    break;
                case '#2e7a6b':
                    animationFile = require('../resources/animation/trail_loading_2e7a6b');
                    break;
                case '#428e3c':
                    animationFile = require('../resources/animation/trail_loading_428e3c');
                    break;
                case '#689f38':
                    animationFile = require('../resources/animation/trail_loading_689f38');
                    break;
                case '#afb42b':
                    animationFile = require('../resources/animation/trail_loading_afb42b');
                    break;
                case '#fbc034':
                    animationFile = require('../resources/animation/trail_loading_fbc034');
                    break;
                case '#faa12f':
                    animationFile = require('../resources/animation/trail_loading_faa12f');
                    break;
                case '#f57d29':
                    animationFile = require('../resources/animation/trail_loading_f57d29');
                    break;
            }
            // @ts-ignore
            YZStateView.defaultProps.loadingView = <YZLottieView
                style={{width:120,height:120}}
                speed={2}
                source={animationFile}/>;
        }
        if(themeInfo && themeInfo.fontSizeScaler)
        {
            fontSizeScaler = themeInfo.fontSizeScaler;
            for(let i = 4;i<100;i++)
            {
                gFont['size'+i] = i * fontSizeScaler;
            }
            gFont.sizeDetail = (Platform.OS === 'android'?15:14) * fontSizeScaler
        }
    }
}