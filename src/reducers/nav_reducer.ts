
const createNavReducer = (AppNavigator)=>{
    const initialState = AppNavigator.router.getStateForAction(AppNavigator.router.getActionForPathAndParams('AppEntry'));

    const navReducer = (state = initialState, action) => {
        const nextState = AppNavigator.router.getStateForAction(action, state);
        NavigationHelper.navRouters = nextState?nextState.routes:null;
        // Simply return the original `state` if `nextState` is null or undefined.
        return nextState || state;
    };
    return navReducer;
}

export default createNavReducer;
