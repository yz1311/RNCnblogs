import {takeEvery, put, select, all} from 'redux-saga/effects';
import * as actionTypes from '../actions/actionTypes';
import {NavigationActions, StackActions} from 'react-navigation';
import {Action} from 'redux-actions';
export class resetActionPayload {
  routeName: string;
  params: object;
}

//返回到上一页
export function* goBack() {
  const backAction = NavigationActions.back();
  yield put(backAction);
}

export function* navigate(action) {
  const {routeName, params} = action.payload;
  const navigateAction = NavigationActions.navigate({
    routeName: routeName,
    params: params,
  });
  yield put(navigateAction);
}

export function* popN(action) {
  const num = action.payload;
  const nav = yield select((state: any) => state.nav);
  const {index, routes} = nav; //eslint-disable-line
  if (routes.length - num < 1) {
    console.log('无法后退了');
    return;
  }
  //key为需要后退到的页面的前一页面的key
  let key = routes[routes.length - num].key;
  const backAction = NavigationActions.back({
    key: key,
  });
  yield put(backAction);
}

export function* replace(action) {
  const {routeName, params} = action.payload;
  const navigateAction = StackActions.replace({
    routeName: routeName,
    params: params,
  });
  yield put(navigateAction);
}

export function* resetTo(action: Action<resetActionPayload>) {
  const route = action.payload;

  let resetAction = StackActions.reset({
    index: 0,
    actions: [
      NavigationActions.navigate({
        routeName: route.routeName,
        params: route.params,
      }),
    ],
  });
  yield put(resetAction);
}

export function* popToTop() {
  const nav = yield select((state: any) => state.nav);
  const {index, routes} = nav; //eslint-disable-line

  var numToPop = routes.length - 1;
  yield put({
    type: actionTypes.Navigation_POPN,
    payload: numToPop,
  });
}

export function* popToIndex(action) {
  const indexOfRoute = action.payload;
  const nav = yield select((state: any) => state.nav);
  const {index, routes} = nav; //eslint-disable-line

  var numToPop = routes.length - 1 - indexOfRoute;
  yield put({
    type: actionTypes.Navigation_POPN,
    payload: numToPop,
  });
}

export function* popToRoute(action) {
  let route = action.payload;
  const nav = yield select((state: any) => state.nav);
  const {index, routes} = nav; //eslint-disable-line

  let indexOfRoute = -1;
  for (let tempIndex in routes) {
    if (routes[tempIndex].routeName == route.routeName) {
      indexOfRoute = parseInt(tempIndex);
      break;
    }
  }
  if (indexOfRoute === -1) {
    console.log('pop to ' + action.payload + ' failed');
    return;
  }
  var numToPop = routes.length - 1 - indexOfRoute;
  yield put({
    type: actionTypes.Navigation_POPN,
    payload: numToPop,
  });
}

export function* watchNav() {
  yield all([
    takeEvery(actionTypes.Navigation_POPN, popN),
    takeEvery(actionTypes.Navigation_RESETTO, resetTo),
    takeEvery(actionTypes.Navigation_POPTOTOP, popToTop),
    takeEvery(actionTypes.Navigation_POPTOINDEX, popToIndex),
    takeEvery(actionTypes.Navigation_POPTOROUTE, popToRoute),
    // takeEvery('Navigation/NAVIGATE',navigate),
  ]);
}
