import {Clipboard, Linking, Share} from "react-native";
import ToastUtils from './toastUtils';


export default class commonUtils {
    static copyText = (text)=>{
        Clipboard.setString(text);
        ToastUtils.show('拷贝成功!', {
            position: ToastUtils.positions.CENTER
        });
    }

    static openUrl = (uri)=>{
        Linking.canOpenURL(uri).then(supported => {
            if(supported){
                Linking.openURL(uri);
            }else{
                console.log('无法打开该URL:'+uri);
            }
        });
    }

    static share = async (title, url)=>{
        try {
            const result = await Share.share({
                message: title+','+url+' ---来自'+appName,
                title: '分享'
            })

            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    // shared with activity type of result.activityType
                } else {
                    // shared
                }
            } else if (result.action === Share.dismissedAction) {
                // dismissed
            }
        } catch (error) {
            // alert(error.message);
        }
    }

    //节流
    static throttle = (func, delay)=> {
        var delay = delay || 1000;
        var previousDate = new Date();
        var previous = previousDate.getTime();  // 初始化一个时间，也作为高频率事件判断事件间隔的变量，通过闭包进行保存。

        return function(args) {
            var context = this;
            var nowDate = new Date();
            var now = nowDate.getTime();
            if (now - previous >= delay) {  // 如果本次触发和上次触发的时间间隔超过设定的时间
                func.call(context, args);  // 就执行事件处理函数 （eventHandler）
                previous = now;  // 然后将本次的触发时间，作为下次触发事件的参考时间。
            }
        }
    }
}