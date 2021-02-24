import Model from "dva-core";
import {userInfoModel} from "../api/login";

export interface IState {
    userInfo: Partial<userInfoModel>,
    statusMetionCount: number;
    statusReplyCount: number;
}

const initialState:IState = {
    userInfo: {},
    statusMetionCount: 0,
    statusReplyCount: 0
};

export default {
    namespace: 'profileIndex',
    state: initialState,
    reducers: {
        setStatusCounts: (state:IState, action) => {
            const {metionCount, replyCount} = action.payload;
            state.statusMetionCount = metionCount;
            state.statusReplyCount = replyCount;
        }
    },
    effects: {

    }
} as Model
