import {watchApp} from './app_sagas';
import {watchNav} from './nav_sagas';
import {all, fork} from 'redux-saga/effects';
import {watchHomeIndex} from './home/home_index_sagas';
import {watchLoginIndex} from './login/login_index_sagas';
import {watchBlogIndex} from './blog/blog_index_sagas';
import {watchNewsIndex} from './news/news_index_sagas';
import {watchStatusIndex} from './status/status_index_sagas';
import {watchBookmarkIndex} from './bookmark/bookmark_index_sagas';
import {watchQuestionIndex} from './question/question_index_sagas';
import {watchQuestionDetail} from './question/question_detail_sagas';
import {watchKnowledgeBaseIndex} from './knowledgeBase/knowledgeBase_index_sagas';
import {watchProfileIndex} from './profile/profile_index_sagas';

export default function* rootSaga() {
  yield all([
    fork(watchApp),
    fork(watchNav),
    fork(watchHomeIndex),
    fork(watchLoginIndex),
    fork(watchBlogIndex),
    fork(watchNewsIndex),
    fork(watchStatusIndex),
    fork(watchBookmarkIndex),
    fork(watchQuestionIndex),
    fork(watchQuestionDetail),
    fork(watchKnowledgeBaseIndex),
    fork(watchProfileIndex),
  ]);
}
