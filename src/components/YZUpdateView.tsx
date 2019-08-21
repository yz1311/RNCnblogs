import React, { PureComponent } from 'react';
import {
  View,
  ImageBackground,
  Text,
  Button,
  ActivityIndicator,
  TouchableOpacity, ScrollView, Dimensions, TouchableWithoutFeedback
} from 'react-native';

interface IProps {
  style?: any,
  width: number,
  //是否强制更新
  isMandatory: boolean,
  //提示，默认是热更新的提示
  hint: string,
  versionName?: string,
  message: string,
  packageSizeDesc: string,
  progress: number,
  progressDesc: string,
  onDownload: () => void,
  onIgnore: () => void
}

interface IState {

}

export default class YZUpdateView extends PureComponent<IProps, IState> {

  static defaultProps = {
    hint: '下载后会自动重启即更新成功',
    isMandatory: false
  };

  render() {
    const { width, message, progress, isMandatory, progressDesc, onDownload, onIgnore, packageSizeDesc } = this.props;
    const { height: D_HEIGHT, width: D_WIDTH } = Dimensions.get('window');
    return (
      <View style={[{ width: width }, this.props.style]}>
        <ImageBackground
          style={{ width: width, height: width / 512 * 164, borderTopLeftRadius: 8, borderTopRightRadius: 8 }}
          resizeMode='contain'
          source={require('../resources/img/app_update_bg.png')}

        />
        <View style={{ backgroundColor: '#fff', minHeight: 180, maxHeight: D_HEIGHT * 0.5, paddingHorizontal: 10 }}>
          <Text style={{ fontSize: 16, color: '#666', marginVertical: 6 }}>{'包大小：' + packageSizeDesc}</Text>
          <ScrollView>
            <TouchableWithoutFeedback style={{}}>
              <Text style={{ fontSize: 16, color: '#333' }}>{message}</Text>
            </TouchableWithoutFeedback>
          </ScrollView>
          <Text style={{ fontSize: 13, color: '#999' }}>下载后会自动重启即更新成功</Text>
        </View>
        <View style={{ backgroundColor: '#fff', paddingVertical: 15 }}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              if (!this.props.progress) {
                onDownload && onDownload();
              }
            }}
            style={{
              paddingVertical: 12,
              backgroundColor: '#f24a52',
              borderRadius: 6,
              justifyContent: 'center',
              alignItems: 'center',
              marginHorizontal: 15
            }}
          >
            {
              this.props.progress ?
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <ActivityIndicator color='#fff'/>
                  <Text style={{
                    fontSize: 16,
                    color: '#fff',
                    marginLeft: 6
                  }}>{progressDesc ? progressDesc : (progress * 100).toFixed(1) + '%'}</Text>
                </View>
                :
                <Text style={{ fontSize: 16, color: '#fff' }}>立即更新</Text>
            }

          </TouchableOpacity>
        </View>
        {!isMandatory ?
          <TouchableOpacity
            activeOpacity={0.75}
            style={{ alignSelf: 'center' }}
            onPress={() => {
              onIgnore && onIgnore();
            }}
          >
            <View style={{
              width: 30,
              height: 30,
              marginTop: 20,
              borderRadius: 15,
              borderColor: '#fff',
              borderWidth: 1,
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Text style={{ color: '#fff', fontSize: 16 }}>X</Text>
            </View>
          </TouchableOpacity>
          : null}
      </View>
    );
  }
}