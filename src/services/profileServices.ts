import {Api} from "../api";
import {messageModel} from "../api/message";
import {userInfoModel} from "../api/login";


export default class ProfileServices {
    static getAllUserAvatars = async (userIds: Array<string>)=>{
        let results = [];
        //加快速度
        let avatarMap = new Map<string, string>();
        for (let index in userIds) {
            let userId = userIds[index];
            if(!avatarMap.has(userId)) {
                try {
                    let imgRes = await Api.profile.getUserAvatar({
                        request: {
                            userId: userId
                        }
                    });
                    if(imgRes.data.avatar) {
                        avatarMap.set(userId, imgRes.data.avatar);
                        results.push(imgRes.data.avatar);
                    } else {
                        results.push('')
                    }
                } catch (e) {
                    //失败也要设置，不然顺序错乱
                    results.push('')
                }
            } else {
                results.push(avatarMap.get(userId));
            }
        }
        return results;
    }

    static getFullUserInfo = async ()=>{
        let userInfo:Partial<userInfoModel> = {};
        //首先获取userId
        try {
            let response = await Api.login.getUserAlias({
                request: {}
            });
            let userId = response.data;
            userInfo.id = userId as any;
            gUserData.userId = userId;
            //继续获取用户详情
            let userInfoResponse = await Api.profile.getFullUserInfo({
                request: {
                    userId: userId
                }
            });
            //@ts-ignore
            userInfo = {
                ...userInfo,
                ...userInfoResponse.data
            };
            await Promise.all([
                (
                    async ()=>{
                        let signature = '';
                        try {
                            //继续获取签名
                            let signature = await Api.profile.getPersonSignature({
                                request: {
                                    userAlias: userId
                                }
                            });
                            //@ts-ignore
                            userInfo.signature = signature.data;
                        } catch (e) {

                        }
                    }
                )(),
                (
                    async ()=>{
                        try {
                            let accountInfoResponse = await Api.login.getAccountInfo({
                                request: {

                                }
                            });
                            userInfo = {
                                ...userInfo,
                                ...accountInfoResponse.data
                            };
                        } catch (e) {

                        }
                    }
                )(),
            ])
            gStorage.save(gStorageKeys.CurrentUser,userInfo);
            gStore.dispatch({
                type: 'loginIndex/setUserInfo',
                payload: {
                    userInfo: userInfo
                }
            });

        } catch (e) {

        } finally {

        }
    }
}
