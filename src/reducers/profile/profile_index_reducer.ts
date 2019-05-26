import * as actionTypes from '../../actions/actionTypes';
import {handleActions, createReducerResult, actionToResult} from '../../utils/reduxUtils';
import StringUtils from "../../utils/stringUtils";

export interface State {
    //园友信息
    personInfo: any,
    getPersonInfoResult: any,
}


const initialState: State = {
    //园友信息
    personInfo: {},
    getPersonInfoResult: createReducerResult(),
}

export default handleActions( {
    [actionTypes.PROFILE_GET_PERSON_INFO]:(state: State,action)=> {
        const {payload} = action;
        if(!action.error)
        {
            state.personInfo = payload.result;
        }
        state.getPersonInfoResult = actionToResult(action)
    },
    [actionTypes.PROFILE_CLEAR_PERSON_INFO]:(state: State,action)=> {
        state.personInfo = initialState.personInfo;
        state.getPersonInfoResult = initialState.getPersonInfoResult;
    },
    [actionTypes.PROFILE_GET_PERSON_SIGNATURE]:(state: State,action)=> {
        const {payload} = action;
        if(!action.error)
        {
            state.personInfo = {
                ...state.personInfo,
                subTitle: payload.result
            };
        }
    }
}, initialState);