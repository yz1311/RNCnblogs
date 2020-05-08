import Model from "dva-core";
import {userInfoModel} from "../api/login";

export interface IState {
    userInfo: Partial<userInfoModel>
}

const initialState:IState = {
    userInfo: {}
};

export default {
    namespace: 'profileIndex',
    state: initialState,
    reducers: {

    },
    effects: {

    }
} as Model
