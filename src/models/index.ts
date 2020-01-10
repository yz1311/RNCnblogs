import test from './test';
import loginIndex, {IState as loginIndexState} from './loginIndex'
import profileIndex, {IState as profileIndexState} from './profileIndex'

export type ReduxState = {
    loginIndex: loginIndexState,
    profileIndex: profileIndexState
};

export default [test, loginIndex, profileIndex];
