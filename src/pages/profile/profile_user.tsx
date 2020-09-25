import React, {PureComponent, useState} from 'react';
import {Image, ScrollView, StyleSheet, Text, View} from "react-native";
import {Styles} from "../../common/styles";
import {ListRow, NavigationBar, Theme} from "@yz1311/teaset";
import YZSafeAreaView from "../../components/YZSafeAreaView";
import UploadUtils from "../../utils/uploadUtils";
import {Api} from "../../api";
import {useSelector} from "react-redux";
import {ReduxState} from "../../models";
import {NotificationTypes} from "../../api/login";
import {CommonPicker} from '@yz1311/react-native-wheel-picker';
import Modal from 'react-native-modal';
import ToastUtils from "../../utils/toastUtils";
import ProfileServices from "../../services/profileServices";


interface IProps {

}

const notifyTypeDict = {
    0: '无',
    1: '短消息',
    2: '邮件',
    3: '邮件和短消息',
};

const injectedJavaScript = `
    document.getElementsByTagName('app-navbar')[0].setAttribute("style", "display: none");
    document.getElementsByTagName('app-footer')[0].setAttribute("style", "display: none");
    document.getElementsByTagName('mat-sidenav-container')[0].setAttribute("class", "");
`;

function ProfileUser(props: IProps) {
    const [notiTypeArray, setNotiTypeArray] = useState<Array<string>>(Object.values(notifyTypeDict));
    const [notiTypeModalVisible, setNotiTypeModalVisible] = useState(false);
    const {userInfo} = useSelector((state:ReduxState) => ({
        userInfo: state.loginIndex.userInfo
    }));

    const changeNotiType = async (notificationType: NotificationTypes)=>{
        ToastUtils.showLoading();
        try {
            let response = await Api.login.changeNotificationType({
                request: {
                    notificationType: notificationType
                }
            });
            if(response.data.success) {
                ToastUtils.showToast('操作成功!');
                ProfileServices.getFullUserInfo();
            } else {
                ToastUtils.showToast(response.data.message);
            }
        } catch (e) {

        } finally {
            ToastUtils.hideLoading();
        }
    }


    return (
        <YZSafeAreaView>
            <NavigationBar title={'账户设置'} />
            <ScrollView style={{flex:1}}>
                <Text style={[styles.sectionTitle]}>账户与安全</Text>
                <ListRow
                    title="头像"
                    detail={
                        <Image
                            style={{width: 45, height: 45}}
                            resizeMode="contain"
                            source={{uri: userInfo.avatar}}
                        />
                    }
                    onPress={()=>{
                        UploadUtils.openImagePicker({
                            imageCount: 1,
                            isCrop: true,
                            CropW: 180,
                            CropH: 180

                        }, async (photos)=>{
                            console.log(photos)
                            ToastUtils.showLoading('上传中...');
                            try {
                                let response = await Api.home.uploadAvatarFile({
                                    request: {
                                        file: photos[0],
                                    }
                                });
                                if(response.data.Success) {
                                    ToastUtils.showToast('更新成功!');
                                    ProfileServices.getFullUserInfo();
                                } else {
                                    ToastUtils.showToast(response.data.Message);
                                }
                            } catch (e) {

                            } finally {
                                ToastUtils.hideLoading();
                            }
                        })
                    }}
                    />
                <ListRow
                    title="用户名"
                    detail={userInfo.loginName}
                    onPress={()=>{
                        NavigationHelper.push('YZWebPage', {
                            uri: 'https://account.cnblogs.com/settings/account',
                            title: '账户设置',
                            injectedJavaScript: injectedJavaScript,
                        });
                    }}
                />
                <ListRow
                    title="昵称"
                    detail={userInfo.displayName}
                    onPress={()=>{
                        NavigationHelper.push('YZWebPage', {
                            uri: 'https://account.cnblogs.com/settings/account',
                            title: '账户设置',
                            injectedJavaScript: injectedJavaScript
                        });
                    }}
                    />
                <ListRow
                    title="手机"
                    detail={userInfo.phoneNum}
                    onPress={()=>{
                        NavigationHelper.push('YZWebPage', {
                            uri: 'https://account.cnblogs.com/settings/account',
                            title: '账户设置',
                            injectedJavaScript: injectedJavaScript
                        });
                    }}
                />
                <ListRow
                    title="邮箱"
                    detail={userInfo.email}
                    onPress={()=>{
                        NavigationHelper.push('YZWebPage', {
                            uri: 'https://account.cnblogs.com/settings/account',
                            title: '账户设置',
                            injectedJavaScript: injectedJavaScript
                        });
                    }}
                />
                <Text style={[styles.sectionTitle]}>通知</Text>
                <ListRow
                    title="通知邮箱"
                    detail={userInfo.notificationEmail}
                    onPress={()=>{
                        NavigationHelper.push('YZWebPage', {
                            uri: 'https://account.cnblogs.com/settings/account',
                            title: '账户设置',
                            injectedJavaScript: injectedJavaScript
                        });
                    }}
                />
                <ListRow
                    title="回复通知类型"
                    detail={notifyTypeDict[userInfo.notificationType]}
                    onPress={()=>{
                        setNotiTypeModalVisible(true);
                    }}
                />
            </ScrollView>
            <Modal
                style={{margin: 0, justifyContent: 'flex-end'}}
                isVisible={notiTypeModalVisible}
                onBackdropPress={()=>{
                    setNotiTypeModalVisible(false);
                }}
                onBackButtonPress={()=>{
                    setNotiTypeModalVisible(false);
                }}
            >

                <CommonPicker
                    pickerData={notiTypeArray}
                    selectedValue={notifyTypeDict[userInfo.notificationType]}
                    onPickerCancel={()=>{
                        setNotiTypeModalVisible(false);
                    }}
                    onPickerConfirm={(textArr)=>{
                        setNotiTypeModalVisible(false);
                        let value = -1;
                        for (let key of Object.keys(notifyTypeDict)) {
                            if(notifyTypeDict[key] === textArr.join('')) {
                                value = parseInt(key);
                                break;
                            }
                        }
                        changeNotiType(value);
                    }}
                />
            </Modal>
        </YZSafeAreaView>
    );
}

const styles = StyleSheet.create({
    sectionTitle: {
        fontSize: Theme.px2dp(28),
        color: gColors.color333,
        marginLeft: Theme.px2dp(15),
        marginVertical: Theme.px2dp(25),
    }
})

export default ProfileUser;
