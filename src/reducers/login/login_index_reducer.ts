import * as actionTypes from '../../actions/actionTypes';
import {handleActions} from '../../utils/reduxUtils';

export interface State {
  isLogin: boolean;
  loginCode: string;
  token: string;
  expiresIn: number;
  tokenType: string;
  refreshToken: string;
  userInfo: any;
}

const initialState: State = {
  isLogin: false,
  loginCode: '',
  token: '',
  expiresIn: 0,
  tokenType: '',
  refreshToken: '',
  userInfo: {},
};

export default handleActions(
  {
    [actionTypes.LOGIN_USERLOGIN]: (state: State, action) => {
      const {type, payload} = action;
      if (!action.error) {
        state.isLogin = true;
        state.token = payload.result.access_token;
        state.expiresIn = payload.result.expires_in;
        state.tokenType = payload.result.token_type;
        state.refreshToken = payload.result.refresh_token;
        gUserData.token = state.token;
      }
    },
    [actionTypes.LOGIN_LOGOUT]: (state: State, action) => {
      const {type, payload} = action;
      state = initialState;
    },
    [actionTypes.LOGIN_GET_USER_INFO]: (state: State, action) => {
      const {payload} = action;
      if (!action.error) {
        state.userInfo = payload.result;
      }
    },
    [actionTypes.LOGIN_LOGOUT]: (state: State, action) => {
      const {payload} = action;
      state.isLogin = false;
      state.token = initialState.token;
      state.expiresIn = initialState.expiresIn;
      state.tokenType = initialState.tokenType;
      state.refreshToken = initialState.refreshToken;
      state.userInfo = initialState.userInfo;
    },
  },
  initialState,
);
