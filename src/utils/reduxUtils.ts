import {Action, ActionMeta} from "redux-actions";
import produce from "immer";
import {LoadDataResultStates} from "@yz1311/react-native-state-view";

export const handleActions = <T = any>(
    actionsMap: {[key: string]: (state: T, action: SagaAction<any>) => void},
    defaultState,
) => (state = defaultState, preAction) =>
    produce(state, draft => {
      const {type} = preAction;
      const action = actionsMap[type];
      action && action(draft, preAction);
    });


export const PROMISE_TYPE_SUFFIXES = {
  PENDING: '_PENDING',
  RESOLVED: '_RESOLVED',
  REJECTED: '_REJECTED'
};

const addPendingSuffix = (type) => {
  return type + PROMISE_TYPE_SUFFIXES.PENDING;
};

/**
 * 创建符合当前设计的sagaAction(该action作用只用于触发redux-saga中的事件)
 * 1.type后面必须添加_PENDING后缀
 * 2.payload的必须是传递过来的参数,如果有多个值，则需要自己手动组合成一个对象
 * @param type action的type类型
 * @param data 传递给action的参数
 */
export const createSagaAction = (type, data: RequestModel<any>|undefined) : SagaAction<RequestModel<any>|undefined> => {
  return {
    type: addPendingSuffix(type),
    payload: data,
    //将传递的参数放在meta中,防止出现saga中获取的action在调用前后的meta值不一样的情况
    meta: {
      parData: data
    }
  };
};

/**
 * 将action对象转换成,redux中将action转换成结果
 * @param action 传递到action的对象
 * @param props 需要覆盖的属性
 * @param dataToValidate 仅当action.error=false时有效，验证是否为空的数据，需要验证的数据默认为action.payload.result
 * 需要注意的是，如果是分页加载的数据，需要传过来全部数据，而不是单页的数据
 * @param dataValidator 也可以自己验证数据的状态，需要返回一个YZStateView.state枚举值，为空时使用默认的规则
 */
export const actionToResult = (action: ActionMeta<any,any>, props = undefined, dataToValidate:any = undefined, dataValidator:()=>string = undefined) => {
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
      msg: action.payload.message, error: action.payload, state: LoadDataResultStates.error,
      //将传递的参数也放进去
      parData: action.meta ? action.meta.parData : {} }, props);
  }
  else {
    let state = LoadDataResultStates.content;
    //默认以主结果进行验证
    if (!dataToValidate) {
      dataToValidate = action.payload.result;
    }
    if (dataValidator) {
      state = dataValidator() as LoadDataResultStates;
    }
    //默认验证规则
    else {
      if (dataToValidate) {
        //目前判空只针对数组
        //如果是数组，则空数据表示无数据
        if (Array.isArray(dataToValidate) && dataToValidate.length === 0) {
          state = LoadDataResultStates.empty;
        }
      }
      else {
        state = LoadDataResultStates.empty;
      }
    }
    return Object.assign({ success: action.error ? false : true, timestamp: new Date(), state: state,
      //将传递的参数也放进去
      parData: action.meta ? action.meta.parData : {} }, props);
  }
};

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

export interface reducerModel<T> {
  list: Array<T>,
  noMore: boolean,
  loadDataResult: any
}
