import {Clipboard, Linking, Share} from 'react-native';
import ToastUtils from './toastUtils';
import {ListRow, Overlay} from "@yz1311/teaset";
import React from "react";

export default class CommonUtils {
  static copyText = text => {
    Clipboard.setString(text);
    ToastUtils.showToast('拷贝成功!', {
      position: ToastUtils.positions.CENTER,
    });
  };

  static openUrl = uri => {
    Linking.canOpenURL(uri).then(supported => {
      if (supported) {
        Linking.openURL(uri);
      } else {
        console.log('无法打开该URL:' + uri);
      }
    });
  };

  static share = async (title, url) => {
    try {
      const result = await Share.share({
        message: title + ',' + url + ' ---来自' + appName,
        title: '分享',
      });

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
  };

  static showRightTopMenus = async (bounds:{x,y,width,height}, link: string, onClose) => {
    let popoverStyle = {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      paddingTop: 8,
      paddingBottom: 8,
      // paddingLeft: 12,
      paddingRight: 12,
    };
    let y = bounds.y +  (__IOS__ ? 0 : 30);
    let fromBounds = {x: bounds.x, y, width: bounds.width, height: bounds.height};
    let overlayKey = null;
    let overlayView = (
        <Overlay.PopoverView
            popoverStyle={popoverStyle}
            fromBounds={fromBounds}
            direction="up"
            align="end"
            directionInsets={4}
            onCloseRequest={() => {
              Overlay.hide(overlayKey);
              onClose&&onClose();
            }}
            showArrow={true}>
          <ListRow
              style={{backgroundColor: 'transparent', width: 120}}
              titleStyle={{color: gColors.bgColorF, textAlign: 'center'}}
              title="复制链接"
              onPress={() => {
                Overlay.hide(overlayKey);
                onClose&&onClose();
                CommonUtils.copyText(link);
              }}
          />
          <ListRow
              style={{backgroundColor: 'transparent', width: 120}}
              titleStyle={{color: gColors.bgColorF, textAlign: 'center'}}
              title="查看原文"
              onPress={() => {
                Overlay.hide(overlayKey);
                onClose&&onClose();
                CommonUtils.openUrl(link);
              }}
          />
          <ListRow
              style={{backgroundColor: 'transparent', width: 120}}
              titleStyle={{color: gColors.bgColorF, textAlign: 'center'}}
              title="分享"
              bottomSeparator={null}
              onPress={() => {
                Overlay.hide(overlayKey);
                onClose&&onClose();
                CommonUtils.share('', link);
              }}
          />
        </Overlay.PopoverView>
    );
    overlayKey = Overlay.show(overlayView);
    return overlayView;
  }

  //节流
  static throttle = (func, delay) => {
    var delay = delay || 1000;
    var previousDate = new Date();
    var previous = previousDate.getTime(); // 初始化一个时间，也作为高频率事件判断事件间隔的变量，通过闭包进行保存。

    return function(args) {
      var context = this;
      var nowDate = new Date();
      var now = nowDate.getTime();
      if (now - previous >= delay) {
        // 如果本次触发和上次触发的时间间隔超过设定的时间
        func.call(context, args); // 就执行事件处理函数 （eventHandler）
        previous = now; // 然后将本次的触发时间，作为下次触发事件的参考时间。
      }
    };
  };
}

