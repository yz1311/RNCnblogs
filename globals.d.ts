
declare module NodeJS  {
    interface Global {
        alert: any,
        gColors: any,
        appTypes: any,
        gFont: any,
        appName: any,
        gAppType: any,
        gStorage: any,
        gStorageKeys: any,
        gUserData: any,
        gUtils: any,
        _mTimes: any,
        gMargin: any,
        gServerPath: any,
        NavigationHelper: any,
        activeOpacity: any,
        gScreen: any,
        __IOS__: any,
        __ANDROID__: any,
        gBaseConfig: any,
        fontSizeScaler: any,
        isIphoneX: any,
        STORAGE_CONSTANT: any,
        Constant: any,
        WLAPI_BASE_URL: any,
        VARIABLES: any,
        CONSTANTS: any,
        gString: any,
        __REDUX_DEVTOOLS_EXTENSION__: any,
        gSetAppType: any
    }
}

declare var alert;

declare var appName;

declare var gColors: {
    backgroundColor: string,
    //不能设置值，否则退出页面的时候，会显示该颜色
    themeColor: string,
    colorGreen1: string,
    oldThemeColor: string,
    borderColor: string,
    bgColorF: string,
    bgcolor2: string,
    bgcolor3: string,
    bgcolor4: string,
    colore0: string,
    color333: string,
    color39: string,
    color3c: string,
    color3d: string,
    color3f: string,
    color40: string,
    color4c: string,
    color666: string,
    color999: string,
    colorc5: string,
    colorf5: string,
    colorRed: string,
    bgcolord9: string,
    color53: string,
    color00a: string, //浅蓝
    bgColorF4: string,  //浅灰色
    color0: string,  //深黑
    borderColorE5: string,
    color7: string,
    colord7: string,
    color5: string,
    colorff: string,
    color7e: string,
    borderColore5: string,
    color6e: string,
    color66: string,
    color00A0E9: string,
    buttonDisabled: string,
    oldButtonDisabled: string,
    color9b: string,
    colorba: string,
    fontColor007: string,
    fontColorB26: string,
    colorItemSub: string,
    colorPurple: string,
    colorDarkPurple1: string,
    colorDarkPurple2: string,
    colorOrange1:string,
    colorOrange2:string,
};

declare var gFont: {
    size85,
    size64,
    size50,
    size40,
    size35,
    size33,
    size30,
    size26,
    size24,
    size21,
    size20,
    size19,
    size18,
    size17,
    size16,
    size15,
    size14,
    size13,
    size12,
    size11,
    size10,
    size8,
    size6,
    size5,
    size4,
    sizeDetail,
}

declare var gStorage: {
    load: (key: string) => Promise<any>,
    save: (key: string, value: {[key: string]: any}|string) => Promise<void>,
    remove: (key: string) => Promise<void>
};

declare var gStorageKeys: {
    CurrentUser: string,
    HistoryUsers: string,
    BaseInfo_PortList: string
};

declare var gUserData: {
    session_id: string,
    uid: string,
    roleId: string,
    token: string,
};

declare var gUtils: {
    string: any
};

declare let _mTimes:number;

declare let gMargin:number;

declare let gServerPath:any;

declare var NavigationHelper: {
    navigation: any,
    navRouters: any,
    isTopScreen: (key:string) => boolean,
    goBack: () => void,
    push: () => void,
    navigate: (routeName:string, params?) => void,
    resetTo: (routeName:string,params?:any) => void,
    replace: (routeName:string, params?) => void,
    popN: (num:number) => void,
    popToTop: () => void,
    popToIndex: (indexOfRoute:number) => void,
    popToRoute: (routeName:string) => void,
};

declare let activeOpacity:any;

declare var gScreen: {
    onePix: number,
    width: number,
    height: number,
    isAndroid: boolean,
    headerHeight: number,
    navigationBarHeight: number,
    statusBarHeight: number,
    isTranslucent: boolean,
};

declare let __IOS__:boolean;

declare let __ANDROID__:boolean;

declare var gBaseConfig: {
    PushToken: string,
    UniqueId: string,
    BuildVersion: string,
    iOSCameraPermissionPrompt: string,
    clientId: string,
    clientSecret: string,
    amapKey: string
};

declare let fontSizeScaler:number;

declare let isIphoneX:boolean;


interface RequestModel<T> {
    request: T,
    successAction?: any,
    failAction?: any,
    [key: string]: any
}

interface ResponseModel<T> {
    result: T
}

//redux相关的参数
interface IReduxProps {
    showToastFn?: any,
    dispatch?: any,
}
