import React from 'react';
import {
    View,
    Text
} from 'react-native';
import {takeEvery,takeLatest,put,all} from 'redux-saga/effects';
import Toast from '../utils/toastUtils';
import * as actionTypes from '../actions/actionTypes';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {addPendingSuffix,createSagaAction,invokeCommonAPI} from "../utils/reduxUtils";
import {Action} from "redux-actions";

//由于loading的显示和隐藏输入的参数不一样，特别是隐藏的参数是固定的，使用频率高，将之作为两个单独的方法
export function* showLoading(action:Action<any>) {
    console.log('showloading');
    yield put({
        type:'SHOW_LOADING',
        payload:action.payload
    })
}


export function* hideLoading(action:Action<any>) {
    console.log('hideloading');
    yield put({
        type:'SHOW_LOADING',
        //隐藏的参数是固定的
        payload:{
            isFetching:false,
            //默认清空title
            title:action.payload&&action.payload.title?action.payload.title:''
        }
    })
}


export function* showToast(action:Action<{message: string,type?: string,options?: any}>) {   //eslint-disable-line
    const {payload} = action;
    const {message} = payload;
    let type = Toast.types.text;
    if(payload.type)
    {
        type = action.payload.type;
    }
    let toastComponent;
    switch (type)
    {
        case Toast.types.text:
            Toast.show(payload.message,payload.options||{});
            break;
        case Toast.types.success:
            toastComponent = (
                <View style={{alignItems:'center',paddingVertical:8,paddingHorizontal:8}}>
                    <FontAwesome name="check-circle" color={gColors.bgColorF} size={70}/>
                    <Text style={{color:gColors.bgColorF,fontSize:gFont.size14,marginTop:6}}>{message}</Text>
                </View>
            );
    Toast.show(toastComponent,
        {
            duration:Toast.durations.SHORTER,
            position:Toast.positions.CENTER,
        }
    );
    break;
case Toast.types.error:
    toastComponent = (
        <View style={{alignItems:'center',paddingVertical:8,paddingHorizontal:8}}>
            <FontAwesome name="times-circle" color={gColors.bgColorF} size={70}/>
            <Text style={{color:gColors.bgColorF,fontSize:gFont.size14,marginTop:6}}>{message}</Text>
        </View>
    );
    Toast.show(toastComponent,
        {
            duration:Toast.durations.SHORTER,
            position:Toast.positions.CENTER,
        }
    );
    break;
}


}


export function* hideToast(action:Action<any>) {   //eslint-disable-line
    Toast.hide();
}

export function* watchApp() {
    yield all([
        takeEvery(actionTypes.APP_SHOW_LOADING_REQUESTED,showLoading),
        takeEvery(actionTypes.APP_HIDE_LOADING_REQUESTED,hideLoading),
        takeEvery(actionTypes.APP_SHOW_TOAST_REQUESTED,showToast),
        takeEvery(actionTypes.APP_HIDE_TOAST_REQUESTED,hideToast),
    ]);
}
