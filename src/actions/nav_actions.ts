import {NavigationActions} from 'react-navigation';
import * as actionTypes from './actionTypes';

export const popN = num => {
  return {
    type: actionTypes.Navigation_POPN,
    payload: num,
  };
};

export const resetTo = route => {
  return {
    type: actionTypes.Navigation_RESETTO,
    payload: route,
  };
};

export const popToTop = () => {
  return {
    type: actionTypes.Navigation_POPTOTOP,
  };
};

export const popToIndex = indexOfRoute => {
  return {
    type: actionTypes.Navigation_POPTOINDEX,
    payload: indexOfRoute,
  };
};

export const popToRoute = routeName => {
  return {
    type: actionTypes.Navigation_POPTOROUTE,
    payload: routeName,
  };
};

export const resetToOrderIndex = () => {
  return {
    type: actionTypes.Navigation_RESETTOORDERINDEX,
  };
};
