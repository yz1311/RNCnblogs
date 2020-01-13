import test from './test';
import loginIndex, {IState as loginIndexState} from './loginIndex'
import profileIndex, {IState as profileIndexState} from './profileIndex'
import bookmarkIndex, {IState as bookmarkIndexState} from './bookmarkIndex'

export type ReduxState = {
    loginIndex: loginIndexState,
    profileIndex: profileIndexState,
    bookmarkIndex: bookmarkIndexState
};

export default [test, loginIndex, profileIndex, bookmarkIndex];
