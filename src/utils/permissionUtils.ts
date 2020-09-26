import {Alert, Platform} from 'react-native';
import Permissions, {RESULTS, request, requestMultiple} from 'react-native-permissions';
import DeviceInfo from 'react-native-device-info';
import IntentLauncher, {
    IntentConstant,
} from '@yz1311/react-native-intent-launcher';
const {displayName: appName} = require('../../app.json');

export default class PermissionUtils {
    static checkPermissionResult = (
        permissionResult: string,
        permissionTitle: string,
    ) => {
        let promptText = `${appName}尚未开启${permissionTitle}权限，是否前往设置？`;
        //ios被拒绝一次后就不会再弹出请求窗口了
        //ios和android权限被更改后，app都会被系统强制重启，不是bug
        if (Platform.OS === 'ios') {
            if (['denied', 'blocked'].indexOf(permissionResult) >= 0) {
                //貌似现在没有该接口了
                // if (Permissions.canOpenSettings()) {
                if (true) {
                    Alert.alert(
                        '',
                        promptText,
                        [
                            {text: '取消'},
                            {
                                text: '确定',
                                onPress: () => Permissions.openSettings(),
                            },
                        ],
                        {cancelable: false},
                    );
                } else {
                    Alert.alert(
                        '',
                        `${appName}尚未开启${permissionTitle}权限，该该设备不支持跳转设置，请联系客服!`,
                        [{text: '确定'}],
                    );
                }
                return false;
            }
        } else {
            if (permissionResult === 'blocked') {
                Alert.alert(
                    '',
                    promptText,
                    [
                        {text: '取消'},
                        {
                            text: '确定',
                            onPress: () => {
                                Permissions.openSettings();
                                //安卓已经支持跳转了
                                // const bundleId = DeviceInfo.getBundleId();
                                // IntentLauncher.startActivity({
                                //   action: 'android.settings.APPLICATION_DETAILS_SETTINGS',
                                //   category: IntentConstant.CATEGORY_DEFAULT,
                                //   flags:
                                //     IntentConstant.FLAG_ACTIVITY_NEW_TASK |
                                //     IntentConstant.FLAG_ACTIVITY_NO_HISTORY |
                                //     IntentConstant.FLAG_ACTIVITY_EXCLUDE_FROM_RECENTS,
                                //   data: 'package:' + bundleId,
                                // });
                            },
                        },
                    ],
                    {cancelable: false},
                );
                return false;
            }
        }
        return true;
    };

    static launcheBarcodePage = async (successAction, failAction) => {
        //request方法整合到static方法里面，会报Can reqeust only one set of permissions at a time,不知道咋回事
        let permissionResult;
        //不要使用request，因为其对于手动设置权限的无效
        try {
            permissionResult = await Permissions.request(
                __ANDROID__
                    ? Permissions.PERMISSIONS.ANDROID.CAMERA
                    : Permissions.PERMISSIONS.IOS.CAMERA,
            );
        } catch (e) {}
        const requestResult = PermissionUtils.checkPermissionResult(
            permissionResult,
            '相机',
        );
        if (!requestResult) {
            failAction && failAction();
            return;
        }
        if (permissionResult === 'authorized') {
            successAction && successAction();
        } else {
            Alert.alert('', '需要相机权限才能进行二维码扫描,是否请求权限?', [
                {text: '取消'},
                {
                    text: '确定',
                    onPress: () => {
                        PermissionUtils.launcheBarcodePage(
                            successAction,
                            failAction,
                        );
                    },
                },
            ]);
        }
    };

    static requestPhotoPermission(callback) {
        requestMultiple(Platform.OS==='android'?[
            Permissions.PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
            Permissions.PERMISSIONS.ANDROID.CAMERA
        ]: [
            Permissions.PERMISSIONS.IOS.CAMERA,
            Permissions.PERMISSIONS.IOS.PHOTO_LIBRARY,
        ])
            .then(statuses =>{
                if(PermissionUtils.checkPermissionResult(Platform.OS==='android'
                    ?statuses[Permissions.PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE]
                    :statuses[Permissions.PERMISSIONS.IOS.PHOTO_LIBRARY], '相册')) {
                    callback();
                }
            })
            .catch(err=>{

            });
    }
}
