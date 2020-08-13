/**
 * 更改几个位置:
 * 1.右上角关闭模式
 * 2.替换默认的底部弹出菜单(现在有动画)
 * 3.完善保存图片(原来的库里面一直保存失败)
 *
 * 注意，该组件仅且只能引用一次，不用传任何props，
 * 推荐使用eventBus触发, 也可使用ref调用
 * 例子:
 * DeviceEventEmitter.emit('showImageViewer', {
 *    images: [
 *        {
 *            url: 'xxxxx.png',
 *        },
 *    ] as IImageInfo[],
 *    //默认显示第几张
 *    index: 0
 * })
 */

import React, {FC, forwardRef, useEffect, useRef, useState, useImperativeHandle} from 'react';
import {DeviceEventEmitter, TouchableOpacity, View, Text, StyleSheet, Platform, Dimensions} from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import {IImageInfo} from 'react-native-image-zoom-viewer/built/image-viewer.type';
import {NavigationBar, NavigationBackButton, Theme} from '@yz1311/teaset';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Modal from 'react-native-modal';
import CameraRoll from '@react-native-community/cameraroll';
import {PERMISSIONS, request, RESULTS} from 'react-native-permissions';
import PermissionUtils from '../utils/permissionUtils';
import RNFetchBlob from 'rn-fetch-blob';

interface IProps {}

function YZImageViewer(props:IProps, ref) {
  const imageViewerRef = useRef<ImageViewer>();
  const [isVisible, setIsVisible] = useState(false);
  const [images, setImages] = useState<Array<IImageInfo>>([]);
  const [index, setIndex] = useState<number>(0);
  const [menuVisible, setMenuVisible] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastTitle, setToastTitle] = useState('');

  const toastTimeoutRef = useRef<NodeJS.Timeout>();

  const showToast = (title)=>{
    toastTimeoutRef.current && clearTimeout(toastTimeoutRef.current);
    setToastTitle(title);
    setToastVisible(true);
    toastTimeoutRef.current = setTimeout(()=>{
      hideToast();
    }, 1500);
  };

  const hideToast = ()=>{
    setToastVisible(false);
    setToastTitle('');
    toastTimeoutRef.current && clearTimeout(toastTimeoutRef.current);
  };

  //检查存储权限
  const checkPermission = async ()=>{
    try {
      let result = await request(Platform.OS === 'ios' ? PERMISSIONS.IOS.PHOTO_LIBRARY : PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
      return PermissionUtils.checkPermissionResult(result, '存储');
    } catch (e) {
      return false;
    }
  };


  //保存到相册
  const saveToLocal = async (url)=>{
    setMenuVisible(false);
    //ios可以直接保存链接文件
    if (Platform.OS === 'ios') {
      try {
        await CameraRoll.save(url, {type: 'photo'});
        showToast('保存成功!');
      } catch (e) {
        console.log(e);
      }
    } else {
      //android只能保存本地地址，并且是file://开头的
      RNFetchBlob.config({
        fileCache: true,
        //必须加后缀，不然无法加入到相册
        appendExt : 'png',
      }).fetch('GET',  url, {

      }).then(async (res)=>{

        try {
          await CameraRoll.save('file://' + res.path(), {type: 'photo'});
          showToast('保存成功!');
        } catch (e) {
          console.log(e);
        }
      }).catch(err=>{
        showToast('下载失败!');

      });
    }
  };

  useImperativeHandle(ref, ()=>({
    //开启modal
    open: ({images, index}: {images: Array<IImageInfo>, index: number})=>{
      setImages(images || []);
      setIndex(index || 0);
      setIsVisible(true);
    },
    //关闭modal
    close: ()=>{
      setIsVisible(false);
    },
  }));

  useEffect(()=>{
    let openListener = DeviceEventEmitter.addListener('showImageViewer', ({images, index}: {images: Array<IImageInfo>, index: number})=>{
      setImages(images || []);
      setIndex(index || 0);
      setIsVisible(true);
    });
    return ()=>{
      openListener.remove();
    };
  }, []);

  return (
      <Modal
          style={{margin: 0, backgroundColor:'transparent'}}
          coverScreen={true}
          isVisible={isVisible}
          onBackdropPress={()=>{}}
          onBackButtonPress={()=>{
            setIsVisible(false);
          }}
      >
        <View style={{flex:1, backgroundColor:'#000000'}}>
          <ImageViewer
              ref={imageViewerRef}
              style={{flex: 1, backgroundColor: 'transparent'}}
              index={parseInt(index + '')}
              imageUrls={images}
              enableSwipeDown={true}
              onClick={(close, currentShowIndex) => {
                // NavigationHelper.goBack();
                //需要的逻辑是图片没有放大的时候，单击才关闭Modal
                //目前无法获知图片是否已经放大，暂时关闭单击取消
                // setIsVisible(false);
              }}
              saveToLocalByLongPress={false}
              onLongPress={()=>{
                if (images.length > 0 && index >= 0) {
                  setMenuVisible(true);
                }
              }}
              onSaveToCamera={index => {

              }}
              onSwipeDown={()=>{
                setIsVisible(false);
              }}
              menuContext={{
                saveToLocal: '保存图片',
                cancel: '取消',
              }}
          />
          <TouchableOpacity
              style={{
                position: 'absolute',
                right: 0,
                top: Theme.statusBarHeight + 15,
                paddingLeft: 9,
                paddingRight: 15,
                alignSelf: 'stretch',
                justifyContent: 'center',
              }}
              onPress={() => {
                setIsVisible(false);
              }}
          >
            <AntDesign name={'close'} size={25} color={'#fff'} />
          </TouchableOpacity>
          <Modal
              isVisible={menuVisible}
              onBackButtonPress={()=>{
                setMenuVisible(false);
              }}
              onBackdropPress={()=>{
                setMenuVisible(false);
              }}
              style={{margin: 0, justifyContent:'flex-end'}}
          >
            <View style={{backgroundColor:'white'}}>
              <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={()=>{
                    if (checkPermission()) {
                      let url = images[index].url;
                      saveToLocal(url);
                    }
                  }}
                  style={[styles.bottomButtonContainer]}
              >
                <Text style={[styles.bottomButtonText]}>保存图片</Text>
              </TouchableOpacity>
              <View style={{height: 10,backgroundColor: '#F7F7F7'}} />
              <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={()=>{
                    setMenuVisible(false);
                  }}
                  style={[styles.bottomButtonContainer]}
              >
                <Text style={[styles.bottomButtonText]}>取消</Text>
              </TouchableOpacity>
            </View>
          </Modal>
          {toastVisible ?
              <View style={{
                backgroundColor: '#191919', width: 100, height: 35, borderRadius: 10,
                justifyContent: 'center', alignItems: 'center', marginHorizontal: 'auto',
                left: (Dimensions.get('window').width - 100) / 2, bottom: 70,
              }}>
                <Text style={{color: 'white', fontSize: 14}}>{toastTitle}</Text>
              </View>
              :
              null
          }
        </View>
      </Modal>
  );
}

const styles = StyleSheet.create({
  bottomButtonContainer: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomButtonText: {
    color: '#2c2c2c',
    fontSize: 16,
  },
});

export default React.memo(forwardRef(YZImageViewer));
