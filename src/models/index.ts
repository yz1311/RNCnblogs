import test from './test';
import loginIndex, {IState as loginIndexState} from './loginIndex'

export type ReduxState = {
    loginIndex: loginIndexState
};

export default [test, loginIndex];
