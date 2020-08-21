import {Api} from "../api";
import {messageModel} from "../api/message";


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
}
