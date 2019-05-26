import {compose, createStore, applyMiddleware } from 'redux';
// import { persistStore, autoRehydrate } from "redux-persist";
import createSagaMiddleware from 'redux-saga'
import {getRootReducer, rootReducers} from '../reducers/index'
import rootSaga from '../sagas';
import {init} from '@rematch/core';
import * as models from '../models';

const sagaMiddleware = createSagaMiddleware();
let middlewares = [sagaMiddleware]

//由于react-native-debugger,废弃该库
// if (process.env.NODE_ENV === 'development') {
//     const logger = createLogger()
//     middlewares.push(logger)
// }

// const createStoreWithMiddleware = applyMiddleware(...middlewares)(createStore)
const getStore=(navReducer,navMiddleware)=>
{
    middlewares.push(navMiddleware);
    //常规redux
    // const store = createStore(
    //     getRootReducer(navReducer),
    //     global.__REDUX_DEVTOOLS_EXTENSION__ && global.__REDUX_DEVTOOLS_EXTENSION__(),
    //     compose(
    //         applyMiddleware(...middlewares),
    //         // autoRehydrate()
    //     )
    // )

    //rematch兼容redux
    const remmatchStore = init({
        models: models,
        redux: {
            reducers: rootReducers(navReducer),
            middlewares: middlewares,
            devtoolOptions: [global.__REDUX_DEVTOOLS_EXTENSION__ && global.__REDUX_DEVTOOLS_EXTENSION__()]
        }
    });

    // then run the saga
    sagaMiddleware.run(rootSaga);

    return remmatchStore;
}




// persistStore(store,{storage: AsyncStorage,whitelist: ['incomeIndex']},()=>{
//     console.log('rehydration complete')
// })

export default getStore;
