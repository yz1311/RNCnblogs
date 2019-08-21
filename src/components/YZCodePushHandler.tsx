import React, { Component } from 'react';
import hoistNonReactStatic from 'hoist-non-react-statics';
import { Alert, AppState, Dimensions, Modal, TouchableOpacity, View } from 'react-native';
import codePush, { LocalPackage, RemotePackage } from 'react-native-code-push';
import UpdateView from './YZUpdateView';
import NetInfo from '@react-native-community/netinfo';

/**
 * Indicates when you would like to check for (and install) updates from the CodePush server.
 */
enum CheckFrequency {
  /**
   * When the app is fully initialized (or more specifically, when the root component is mounted).
   */
  ON_APP_START,

  /**
   * When the app re-enters the foreground.
   */
  ON_APP_RESUME,
}

type myRemotePackage = RemotePackage & { desc: string, isSilent: boolean };

interface IProps {
  //仅在wifi环境下自动更新，默认false，静默更新不判断网络
  onlyDownloadWhenWifi: boolean,
  checkFrequency: CheckFrequency
}

interface IState {
  //是否显示更新modal
  modalVisible: boolean,
  //是否强制更新
  isMandatory: boolean,
  updateInfo: myRemotePackage | { [key: string]: never },
  progress: number,
  //自定义进度问题，默认百分比
  progressDesc: string
}

const decorator = (WrappedComponent) => {
  class HOC extends Component<IProps, IState> {
    static defaultProps = {
      onlyDownloadWhenWifi: false,
      checkFrequency: CheckFrequency.ON_APP_RESUME
    };

    private isChecking: boolean = false;

    readonly state: IState = {
      modalVisible: false,
      isMandatory: false,
      updateInfo: {},
      progress: 0,
      progressDesc: ''
    };

    componentDidMount(): void {
      if (this.props.checkFrequency === CheckFrequency.ON_APP_RESUME) {
        AppState.addEventListener('change', this._handleAppStateChange);
      }
      this.checkForUpdate();
      this.isChecking = false;
    }

    componentWillUnmount(): void {
      if (this.props.checkFrequency === CheckFrequency.ON_APP_RESUME) {
        AppState.removeEventListener('change', this._handleAppStateChange);
      }
    }

    _handleAppStateChange = async (appState) => {
      console.log('appstate change ' + appState);
      if (appState === 'active') {
        this.checkForUpdate();
        this.isChecking = false;
      }
    };

    checkForUpdate = async () => {
      if (this.isChecking) {
        return;
      }
      this.isChecking = true;
      let remotePackage: myRemotePackage;
      try {
        remotePackage = await codePush.checkForUpdate() as myRemotePackage;
      } catch (e) {
        console.log('检查热更新失败\n', e.message);
        if (process.env.NODE_ENV === 'development') {
          Alert.alert('', '检查热更新失败\n' + e.message);
        }
        this.isChecking = false;
        return;
      }
      if (remotePackage) {
        //需要检查下是否能连接到服务器，防止出现对话框但又下载失败
        //https://github.com/facebook/react-native/issues/19435
        //有bug，直接失败,暂时屏蔽
        // try {
        //   let response: Response = await fetch(remotePackage.downloadUrl, {
        //     method: 'HEAD'
        //   });
        //   console.log(response);
        // } catch (e) {
        //   console.log(e.message);
        //   return;
        // }
        let desc = remotePackage.description;
        let uuid = '0';
        //兼容老版本
        try {
          desc = JSON.parse(remotePackage.description).description;
        } catch (e) {
          console.log(e.message);
        }
        try {
          uuid = JSON.parse(remotePackage.description).uuid;
        } catch (e) {

        }
        let version;
        version = gBaseConfig.BuildVersion + '_V' + uuid + (remotePackage.isPending ? '(未生效)' : '');
        remotePackage.desc = desc;
        //默认是不弹出对话框
        remotePackage.isSilent = true;
        try {
          let isSilent = JSON.parse(remotePackage.description).isSilent;
          if (isSilent != undefined && typeof isSilent == 'boolean') {
            remotePackage.isSilent = isSilent;
          }
        } catch (e) {
          console.log(e);
        }
        //静默直接下载安装
        if (remotePackage.isSilent) {
          //判断是否是wifi环境
          if (this.props.onlyDownloadWhenWifi) {
            let info = await NetInfo.getConnectionInfo();
            if (info.type !== 'wifi') {
              console.log('do not download when not in wifi network!');
              this.isChecking = false;
              return;
            }
          }
          this.setState({
            updateInfo: remotePackage
          }, () => {
            this.downloadAndInstall();
          });
        } else {
          this.setState({
            modalVisible: true,
            updateInfo: remotePackage
          });
        }
        console.log(remotePackage);
      } else {
        console.log('已是最新版本');
        if (process.env.NODE_ENV === 'development') {
          Alert.alert('', '已是最新版本');
        }
      }
    };

    downloadAndInstall = async () => {
      this.setState({
        isMandatory: true
      });
      const { updateInfo } = this.state;
      let localPackage: LocalPackage;
      try {
        localPackage = await updateInfo.download((progress) => {
          console.log('codePushHandler:', progress);
          this.setState({
            progress: progress.receivedBytes / progress.totalBytes
          });
        });
      } catch (e) {
        this.setState({
          modalVisible: false,
          progress: 0
        });
        if (!updateInfo.isSilent) {
          Alert.alert('', '下载失败!' + e.message, [{ text: '知道了' }]);
        }
      }
      if (localPackage) {
        console.log('下载成功！');
        //只能这里关闭，后面因为app会自动重启，会失效,导致modal关闭不了
        try {
          //暂停半分钟之后应用
          await localPackage.install(updateInfo.isSilent ? codePush.InstallMode.ON_NEXT_SUSPEND : codePush.InstallMode.ON_NEXT_RESTART, 30);
          console.log('安装成功！');
          await codePush.notifyAppReady();
          this.setState({
            modalVisible: false
          });
          if (!updateInfo.isSilent) {
            Alert.alert('提示', '安装成功，点击[确定]后App将自动重启，重启后即更新成功！', [{
              text: '确定',
              onPress: () => {
                codePush.restartApp();
              }
            }], { cancelable: false });
          }
          // this.setState({modalVisible: false},()=>{
          //   codePush.restartApp();
          // });
        } catch (e) {
          if (!updateInfo.isSilent) {
            Alert.alert('', '安装失败!' + e.message, [{ text: '知道了' }]);
          }
        }
      }
    };


    render() {
      const { height: D_HEIGHT, width: D_WIDTH } = Dimensions.get('window');
      const { updateInfo } = this.state;
      return (
        <View style={{ flex: 1 }}>
          <WrappedComponent {...this.props}/>
          <Modal
            animationType="slide"
            transparent={true}
            visible={this.state.modalVisible}
            onRequestClose={() => {
              if (this.state.isMandatory) {
                return;
              }
              this.setState({
                modalVisible: false
              });
            }}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={{ backgroundColor: 'rgba(1,1,1,0.5)', flex: 1, justifyContent: 'center', alignItems: 'center' }}
            >

              <UpdateView
                width={D_WIDTH * 0.9}
                message={updateInfo.desc}
                versionName={updateInfo.label}
                progress={this.state.progress}
                packageSizeDesc={(updateInfo.packageSize / 1024 / 1024).toFixed(1) + 'MB'}
                isMandatory={updateInfo.isMandatory || this.state.isMandatory}
                progressDesc={this.state.progressDesc}
                onDownload={async () => {
                  this.downloadAndInstall();
                }}
                onIgnore={() => {
                  this.setState({
                    modalVisible: false,
                    progress: 0
                  });
                }}
              />
            </TouchableOpacity>
          </Modal>
        </View>
      );
    }
  }

  hoistNonReactStatic(HOC, WrappedComponent);
  return HOC;
};

export default decorator;