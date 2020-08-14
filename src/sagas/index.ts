import {watchApp} from './app_sagas';
import {all, fork} from 'redux-saga/effects';
import {watchLoginIndex} from './login/login_index_sagas';
import {watchNewsIndex} from './news/news_index_sagas';
import {watchStatusIndex} from './status/status_index_sagas';
import {watchQuestionIndex} from './question/question_index_sagas';
import {watchQuestionDetail} from './question/question_detail_sagas';
import {watchKnowledgeBaseIndex} from './knowledgeBase/knowledgeBase_index_sagas';
import {watchProfileIndex} from './profile/profile_index_sagas';

export default function* rootSaga() {
  yield all([
    fork(watchApp),
    fork(watchLoginIndex),
    fork(watchNewsIndex),
    fork(watchStatusIndex),
    fork(watchQuestionIndex),
    fork(watchQuestionDetail),
    fork(watchKnowledgeBaseIndex),
    fork(watchProfileIndex),
  ]);
}
