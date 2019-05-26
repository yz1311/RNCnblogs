import { call, put, cancelled, take, fork, takeEvery, takeLatest, cancel } from "redux-saga/effects";
import { delay as delayFn } from "redux-saga";
import * as actionTypes from "../actions/actionTypes";
import {Action, ActionMeta, createAction} from "redux-actions";
import YZStateView from '../components/YZStateView';
import produce from 'immer';
import ToastUtils from "./toastUtils";
export const PROMISE_TYPE_SUFFIXES = {
    PENDING: '_PENDING',
    RESOLVED: '_RESOLVED',
    REJECTED: '_REJECTED'
};
/**
 *
 * @param type
 */
const addPendingSuffix = (type) => {
    return type + PROMISE_TYPE_SUFFIXES.PENDING;
};
/**
 *
 * @param type
 */
const removePendingSuffix = (type) => {
    return type.slice(0, type.lastIndexOf(PROMISE_TYPE_SUFFIXES.PENDING));
};
/**
 * 创建符合当前设计的sagaAction(该action作用只用于触发redux-saga中的事件)
 * 1.type后面必须添加_PENDING后缀
 * 2.payload的必须是传递过来的参数,如果有多个值，则需要自己手动组合成一个对象
 * @param type action的type类型
 * @param data 传递给action的参数
 */
const createSagaAction = (type, data: RequestModel<any>|undefined) : SagaAction<RequestModel<any>|undefined> => {
    return {
        type: addPendingSuffix(type),
        payload: data,
        //将传递的参数放在meta中,防止出现saga中获取的action在调用前后的meta值不一样的情况
        meta: {
            parData: data
        }
    };
};

//配合immer库使用的handleActions方法
const handleActions = <T = any>(actionsMap:{[key:string]:(state:T,action:SagaAction<any>)=>void}, defaultState) => (state = defaultState, preAction) => produce(state, draft => {
    const { type } = preAction;
    const action = actionsMap[type];
    action && action(draft, preAction);
});

//将state还原到默认状态
const resetState = (draft, initialState) => {
    for (let key of Object.keys(initialState)) {
        draft[key] = initialState[key];
    }
};

const createReducerResult = (params = undefined) => {
    let showLoading = true; //默认加载的时候loading界面，如需取消，请传递false过来
    if (params) {
        showLoading = params.showLoading;
    }
    return {
        //success字段为兼容以前的代码，与error字段含义相反
        success: false,
        timestamp: new Date(),
        error: {},
        ...params,
        showLoading
    };
};

const createNomarlAction = (type, payloadCreator, metaCreator) => {
    let action =  createAction(type, payloadCreator, metaCreator)();
    //将payload放在meta中，抹平两种action的数据结构
    if(action.payload) {
        action.meta = {
            ...(action.meta || {}),
            parData: action.payload
        };
    }
    return action;
};

//将sagaAction转换为标准的action，一般为返回到reducer
const sagaActionToAction = (sagaAction, result) => {
    //提取去掉末尾后缀的type
    let targetType = removePendingSuffix(sagaAction.type);
    let actionCreater = createAction(targetType, null, null);
    //需要在yield*之前将成功的action传递出去
    let resultAction = actionCreater({
        parData: sagaAction.payload,
        result: result
    });
    //将传递的参数放在meta中
    resultAction.meta = {
        parData: sagaAction.payload
    };
    return resultAction;
};

/**
 * 将action对象转换成,redux中将action转换成结果
 * @param action 传递到action的对象
 * @param props 需要覆盖的属性
 * @param dataToValidate 仅当action.error=false时有效，验证是否为空的数据，需要验证的数据默认为action.payload.result
 * 需要注意的是，如果是分页加载的数据，需要传过来全部数据，而不是单页的数据
 * @param dataValidator 也可以自己验证数据的状态，需要返回一个YZStateView.state枚举值，为空时使用默认的规则
 */
const actionToResult = (action: SagaAction<any>, props = undefined, dataToValidate:any = undefined, dataValidator:()=>string = undefined) => {
    //在这里统一进行处理
    //如果后面需要添加错误类型，直接在这里和StateView进行修改即可
    //表示有错误
    if (action.error) {
        //2019/05/21 所有情况都可以显示刷新按钮
        let showRefreshBtn = true;
        //表示未经过服务器,超时或者网络不通
        // if (!action.payload.status) {
        //     showRefreshBtn = true;
        // }
        action.payload.showRefreshBtn = showRefreshBtn;
        return Object.assign({ success: action.error ? false : true, timestamp: new Date(),
            //payload是一个Error对象
            msg: action.payload.message, error: action.payload, state: YZStateView.State.error,
            //将传递的参数也放进去
            parData: action.meta ? action.meta.parData : {} }, props);
    }
    else {
        let state = YZStateView.State.content;
        //默认以主结果进行验证
        if (!dataToValidate) {
            dataToValidate = action.payload.result;
        }
        if (dataValidator) {
            state = dataValidator();
        }
        //默认验证规则
        else {
            if (dataToValidate) {
                //目前判空只针对数组
                //如果是数组，则空数据表示无数据
                if (Array.isArray(dataToValidate) && dataToValidate.length === 0) {
                    state = YZStateView.State.empty;
                }
            }
            else {
                state = YZStateView.State.empty;
            }
        }
        return Object.assign({ success: action.error ? false : true, timestamp: new Date(), state: state,
            //将传递的参数也放进去
            parData: action.meta ? action.meta.parData : {} }, props);
    }
};
/**
 *
 * @param method
 * @param action
 * @param actionCreater
 * @param successAction
 * @param failAction
 * @param showLoading  默认显示loading模态框,不要在参数列表设置默认值，因为在方法里面有逻辑设置了
 * @param loadingTitle  默认为空,不要在参数列表设置默认值，因为在方法里面有逻辑设置了
 */
const invokeCommonAPI = function* (request: invokeCommonRequest) {
    let {method, action, actionCreater, successAction, failAction, showLoading, loadingTitle, resolveResult, delay = 0 , showErrorToast} = request;
    console.log('invokeCommonAPI ' + action.type);
    //目前所有经过saga的actionType都是统一的，后面必须加前缀_PENDING
    if (action.type.lastIndexOf(PROMISE_TYPE_SUFFIXES.PENDING) < 0) {
        throw new Error('action type MUST be end with _PENDING');
    }
    //showLoading和loadingTitle按照数据的流通顺序反向覆盖
    //component->saga,前者会覆盖后者的，跟css类似
    //说明在saga中未设置,且saga中设置showLoading的优先级较高
    if(action.payload && action.payload.showLoading !== undefined)
    {
        //默认请求对象里面包含showLoading属性时，也可以控制loading
        showLoading = action.payload.showLoading;
    }
    else if(showLoading == undefined)
    {
        //默认是显示loading的
        showLoading = true;
    }
    if(action.payload && action.payload.showErrorToast !== undefined)
    {
        //默认请求对象里面包含showLoading属性时，也可以控制loading
        showErrorToast = action.payload.showErrorToast;
    }
    else if(showErrorToast == undefined)
    {
        //默认是显示loading的
        showErrorToast = true;
    }
    if (loadingTitle === undefined && action.payload) {
        //默认请求对象里面包含showLoading属性时，也可以控制loading
        if (action.payload.loadingTitle !== undefined && action.payload.loadingTitle !== null) {
            loadingTitle = action.payload.loadingTitle;
        }
    }
    if (showLoading) {
        //显示loading
        yield put({
            type: actionTypes.APP_SHOW_LOADING_REQUESTED,
            payload: {
                isFetching: true,
                title: loadingTitle
            }
        });
    }
    //创建符合FSA规则的action
    //如果调用者没有指定明确的type(就是actionCreater的对象为空，该对象的创建需要传递type)，则使用默认规则去掉后缀
    if (!actionCreater) {
        //提取去掉末尾后缀的type
        let targetType = removePendingSuffix(action.type);
        actionCreater = createAction(targetType, null, null);
    }
    let resultAction;
    try {
        if (delay) {
            yield delayFn(delay);
            console.warn(`invokeCommonAPI delay ${delay} ms,please confirm it!`);
        }
        //当经过saga时，payload就是传递过来的参数对象
        let result = yield call(method, action.payload || {});
        //数据转换
        if (resolveResult) {
            result = resolveResult(result);
        }
        else {
            result = result.result;
        }
        //需要在yield*之前将成功的action传递出去
        resultAction = actionCreater({
            parData: action.payload,
            result: result
        });
        //将传递的参数放在meta中
        resultAction.meta = {
            parData: action.payload
        };
        yield put(resultAction);
        //默认会调用action.payload.successAction对象
        if (action.payload && action.payload.successAction) {
            const successAction_action = action.payload.successAction;
            successAction_action && successAction_action(result);
        }
        if (successAction) {
            yield* successAction(resultAction, result);
        }
    }
    catch (error) {
        resultAction = actionCreater(error);
        //将传递的参数放在meta中
        resultAction.meta = {
            parData: action.payload
        };
        yield put(resultAction);
        if(showErrorToast)
        {
            yield put({
                type: actionTypes.APP_SHOW_TOAST_REQUESTED,
                payload: {
                    //显示message信息，必须确保信息是友好的
                    message: error.message,
                    position: ToastUtils.positions.CENTER,
                    type: ToastUtils.types.error
                },
            });
        }
        //默认会调用action.payload.failAction对象
        if (action.payload && action.payload.failAction) {
            const failAction_action = action.payload.failAction;
            failAction_action && failAction_action(error);
        }
        if (failAction) {
            yield* failAction(resultAction, error);
        }
        //常规下应该删除掉该代码
        //会话过期，则跳转到登录界面
        // if (error.code === '9001') {
        //     yield call(navigate, {
        //         payload: {
        //             routeName: 'Login',
        //             params: {
        //                 autoLogin: false
        //             }
        //         }
        //     });
        // }
    }
    finally {
        //任务被取消了
        if (yield cancelled()) {
        }
    }
    //Todo:不知道yield* 会不会导致下面的语句不会被执行
    if (showLoading) {
        //隐藏loading
        yield put({
            type: actionTypes.APP_SHOW_LOADING_REQUESTED,
            payload: {
                isFetching: false
            }
        });
    }
    //有些需要执行结果
    return resultAction;
};

/**
 * 相同的action,在请求期间只能响应第一个，直到第一个请求完成,期间其他的都会被忽略
 * 如果期间传过来取消action，则请求会被取消
 */
const takeOrCancel = (getDataType, clearDataType, worker) => fork(function* () {
    while (true) {
        //因为有些只是普通的清除store操作，必须同时监听获取数据和清空数据的action
        const action = yield take([addPendingSuffix(getDataType), addPendingSuffix(clearDataType)]);
        //正常情况下清空store
        if (action.type === addPendingSuffix(clearDataType)) {
            yield put({
                type: clearDataType
            });
            continue;
        }
        const task = yield fork(worker, action);
        const resultAction = yield take([addPendingSuffix(clearDataType), getDataType]);
        //在接口调用期间，监听到成功清空数据的action，此时该action进行:1取消任务 2.清空store  两个操作
        if (resultAction.type === addPendingSuffix(clearDataType)) {
            //取消任务
            yield cancel(task);
        }
        // yield race({
        //     task:call(worker,task),
        //     cancel:take(addPendingSuffix(clearDataType))
        // });
    }
});


//相同的action都能监听到
const takeEveryOrCancel = (getDataType, clearDataType, worker) => fork(function* () {
    while (true) {
        const task = yield takeEvery(addPendingSuffix(getDataType), worker);
        yield take(addPendingSuffix(clearDataType));
        yield put({
            type: clearDataType
        });
        yield cancel(task);
    }
});


//相同的action都保持一个最新的action（该功能未验证）
const takeLatestOrCancel = (getDataType, clearDataType, worker) => fork(function* () {
    while (true) {
        const task = yield takeLatest(addPendingSuffix(getDataType), worker);
        yield take(addPendingSuffix(clearDataType));
        yield put({
            type: clearDataType
        });
        yield cancel(task);
    }
});

export interface SagaAction<Payload> extends Action<Payload>{
    meta: {
        parData: Payload
    }
}

export interface SagaActionMeta<Payload,Meta> extends Action<Payload>{
    meta: {
        parData: Payload,
    } & Meta
}

export interface invokeCommonRequest {
    method: (data:any) => Promise<{}>;
    //redux-saga拦截到的action
    action:SagaAction<any>;
    actionCreater?:any;
    //调用接口成功后的回调(异步回调,此时action已达到reducer),注意该方法是generator方法
    successAction?:(action:SagaAction<any>,result:any) => IterableIterator<any>;
    //调用接口失败后的回调(异步回调,此时action已达到reducer),注意该方法是generator方法
    failAction?:(action:SagaAction<any>,result:any) => IterableIterator<any>;
    //调用接口的时候是否显示loading,默认为true
    showLoading?:boolean;
    //调用接口的时候，loading上面的文字
    loadingTitle?:string;
    //结果处理函数(同步回调，先于successAction/failAction),必须有返回值,该返回值就是reducer拿到的结果
    //常用于对接口成功返回的数据进行裁剪
    resolveResult?:(response:any) => {[key:string]:any}|string;
    //延迟函数(单位:ms),常用于延迟测试
    delay?:number;
    //调用接口失败后，是否显示一个失败的toast，默认为true
    showErrorToast?:boolean
}

export interface reducerModel<T> {
    list: Array<T>,
    noMore: boolean,
    getListResult: any
}

export { addPendingSuffix, removePendingSuffix, createNomarlAction as createAction, createSagaAction, handleActions, resetState, createReducerResult, sagaActionToAction, actionToResult, invokeCommonAPI, takeOrCancel, takeEveryOrCancel, takeLatestOrCancel, };
//# sourceMappingURL=reduxUtils.js.map