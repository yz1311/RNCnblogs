import {
    NavigationActions,
    StackActions,
    NavigationScreenProp,
    NavigationParams,
    NavigationRoute
} from 'react-navigation';
import {put} from "redux-saga/effects";

export default class navigationHelper
{
    static navigation: NavigationScreenProp<NavigationRoute<NavigationParams>,NavigationParams>;

    static navRouters: NavigationRoute[];

    /**
     * 由于虽然可以使用redux获取到routes属性进行判断
     * 但是会引起界面的刷新，目前使用全局变量来解决
     * @param key ,可以通过navigation.state.key获取
     * @returns {boolean}
     */
    //当前是不是最顶层的页面
    static isTopScreen(key:string)
    {
        return key === this.navRouters[this.navRouters.length-1].key;
    }

    static goBack() {
        const backAction = NavigationActions.back();
        this.navigation.dispatch(backAction);
    }

    static navigate(routeName:string, params) {
        const navigateAction = NavigationActions.navigate({
            routeName: routeName,
            params: params
        });
        this.navigation.dispatch(navigateAction);
    }

    /**
     * 跟navigate一样，区别是一直会将新的页面入栈，navigate如果栈中存在相同页面，会返回到已存在的页面
     * @param routeName
     * @param params
     */
    static push(routeName: string, params) {
        const pushAction = StackActions.push({
            routeName: routeName,
            params: params
        });
        this.navigation.dispatch(pushAction);
    }

    static replace(routeName:string, params) {
        const navigateAction = StackActions.replace({
            routeName: routeName,
            params: params
        });
        this.navigation.dispatch(navigateAction);
    }

    static popN(num:number)
    {
        if(this.navRouters.length-num<1)
        {
            console.log('无法后退了');
            return;
        }
        //key为需要后退到的页面的前一页面的key
        let key = this.navRouters[this.navRouters.length-num].key;
        const backAction = NavigationActions.back({
            key:key
        });
        this.navigation.dispatch(backAction);
    }

    static resetTo(routeName:string,params={})  //已测试参数可以传递
    {
        let resetAction = StackActions.reset({
            index:0,
            actions:[
                NavigationActions.navigate({routeName:routeName,params:params})
            ]
        });
        this.navigation.dispatch(resetAction);
    }


    //Todo:待测试
    static popToTop()
    {
        var numToPop = this.navRouters.length-1;
        this.popN(numToPop);
    }

    static popToIndex(indexOfRoute:number)
    {
        var numToPop = this.navRouters.length-1 - indexOfRoute;
        this.popN(numToPop);
    }


    static popToRoute(routeName:string)
    {

        let indexOfRoute = -1;
        for(let tempIndex in this.navRouters)
        {
            if(this.navRouters[tempIndex].routeName == routeName)
            {
                indexOfRoute = parseInt(tempIndex);
                break;
            }
        }
        if(indexOfRoute===-1)
        {
            return;
        }
        var numToPop = this.navRouters.length-1 - indexOfRoute;
        this.popN(numToPop);
    }
}
