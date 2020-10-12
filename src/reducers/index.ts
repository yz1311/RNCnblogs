import {combineReducers} from 'redux';
import app, {State as appState} from './app_reducer';
import homeIndex, {State as homeIndexState} from './home/home_index_reducer';
import loginIndex, {
  State as loginIndexState,
} from './login/login_index_reducer';
import statusIndex from './status/status_index_reducer';
import bookmarkIndex, {
  State as bookmarkIndexState,
} from './bookmark/bookmark_index_reducer';
import questionIndex from './question/question_index_reducer';
import questionDetail from './question/question_detail_reducer';
import knowledgeBaseIndex, {
  State as knowledgeIndexState,
} from './knowledgeBase/knowledgeBase_index_reducer';
import profileIndex, {
  State as profileIndexState,
} from './profile/profile_index_reducer';

export type ReduxState = {
  nav: any;
  app: appState;
  homeIndex: homeIndexState;
  loginIndex: loginIndexState;
  statusIndex: any;
  bookmarkIndex: bookmarkIndexState;
  questionIndex: any;
  questionDetail: any;
  knowledgeBaseIndex: knowledgeIndexState;
  profileIndex: profileIndexState;
};

//用于给常规的redux使用
export const getRootReducer = navReducer => {
  const rootReducer = combineReducers({
    app,
    homeIndex,
    loginIndex,
    statusIndex,
    bookmarkIndex,
    questionIndex,
    questionDetail,
    knowledgeBaseIndex,
    profileIndex,
  });
  return rootReducer;
};

//用于传给rematch使用
export const rootReducers = navReducer => {
  return {
    app,
    homeIndex,
    loginIndex,
    statusIndex,
    bookmarkIndex,
    questionIndex,
    questionDetail,
    knowledgeBaseIndex,
    profileIndex,
  };
};
