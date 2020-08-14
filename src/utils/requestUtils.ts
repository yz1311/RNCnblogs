import { SagaAction} from "./reduxUtils";
import YZStateView from "../components/YZStateView";
import axios, {AxiosProxyConfig, AxiosRequestConfig, AxiosResponse} from 'axios';
import {NavigationHelper} from '@yz1311/teaset-navigation';
import ToastUtils from "./toastUtils";
import {parseString} from 'react-native-xml2js';
import {err} from "react-native-svg/lib/typescript/xml";


//拓展config，添加自定义参数
export interface AxiosRequestConfigPatch extends AxiosRequestConfig{
    //是否显示loading，默认为false
    showLoading?:boolean,
    //调用接口报错时，是否显示toast，默认为true
    showErrorToast?: boolean,
    //调用接口报错时，显示的toast信息(优先显示reject的error对象的message),默认为空
    errorMessage?: string,
    resolveResult?: (str:any)=>any,
    //是否自动解析xml，默认为true
    autoResolveXML?: boolean
}

export enum LoadDataResultStates {
    none = 'none',
    //正在加载数据，由于全局loading的存在，现在应为透明
    loading = 'loading',
    //表明调用成功，但是数据为空
    empty = 'empty',
    //表示调用成功，并且有数据
    content = 'content',
    //表明调用失败，此时显示错误信息
    error = 'error',
    //表明当前用户未登录或者token过期
    unlogged = 'unlogged',
}

export interface ReducerResult {
    success: boolean,
    timestamp: Date,
    error: any,
    showLoading: boolean,

    [key: string]: any
}

export const createReducerResult = (params: { showLoading?: boolean, state?: string } = undefined): ReducerResult => {
    let showLoading = true; //默认加载的时候loading界面，如需取消，请传递false过来
    if (params) {
        showLoading = params.showLoading;
    }
    return {
        //success字段为兼容以前的代码，与error字段含义相反
        success: false,
        timestamp: new Date(),
        error: null,
        ...params,
        showLoading
    };
};

/**
 *
 * @param exitList  已存在的列表数据
 * @param pagingList  返回的分页列表数据
 * @param pageIndex  当前页(从1开始)
 * @param pageSize  页数大小(默认为10)
 * @param totalPage 总页数(可能为空)
 */
export const dataToPagingResult = (exitList:Array<any>, pagingList:Array<any>, pageIndex:number, pageSize:number=10, totalPage=undefined)=>{
    let dataList = exitList.slice(0,(pageIndex-1)*pageSize).concat(pagingList);
    let noMore = (pagingList||[]).length === 0 || (pagingList||[]).length < pageSize;
    if(totalPage != undefined && pageIndex==totalPage) {
        noMore = true;
    }
    return {
        dataList: dataList,
        noMore: noMore,
        loadDataResult: dataToReducerResult(dataList,pageIndex)
    };
}

/**
 * 将结果转换为reducerResult对象
 * @param data 接口返回的对象数据
 * @param pageIndex 当前的页数，可选参数，非分页的list数据不要传，因为分页数据加载失败后，
 * 不一定要显示全部的错误页面，只在列表下面显示错误信息就行了
 */
export const dataToReducerResult = (
    data,
    pageIndex?: number,
): ReducerResult => {
    //Error对象,说明调用接口报错(服务器错误或者业务错误)
    if (data instanceof Error) {
        return {
            ...createReducerResult(),
            success: false,
            error: data,
            msg: data.message,
            state:
                pageIndex > 1
                    ? LoadDataResultStates.content
                    : LoadDataResultStates.error,
        };
    }
    if (Array.isArray(data)) {
        return {
            ...createReducerResult(),
            success: true,
            timestamp: new Date(),
            state:
                data.length == 0
                    ? LoadDataResultStates.empty
                    : LoadDataResultStates.content,
            pageIndex: pageIndex,
        };
    }
    if (
        data == undefined ||
        data == '' ||
        (typeof data === 'object' && Object.keys(data).length == 0)
    ) {
        return {
            ...createReducerResult(),
            success: true,
            timestamp: new Date(),
            state: LoadDataResultStates.empty,
        };
    }
    return {
        ...createReducerResult(),
        success: true,
        timestamp: new Date(),
        state: LoadDataResultStates.content,
    };
};

/**
 * 将action对象(标准的FSA对象)转换成,redux中将action转换成结果(reducer中使用需要使用该方法)
 * @param action 传递到action的对象
 * @param dataToValidate 仅当action.error=false时有效，验证是否为空的数据，需要验证的数据默认为action.payload.result
 * 需要注意的是，如果是分页加载的数据，需要传过来全部数据，而不是单页的数据
 * @param pageIndex 当前的页数，可选参数，非分页的list数据不要传，因为分页数据加载失败后，
 * 不一定要显示全部的错误页面，只在列表下面显示错误信息就行了
 */
export const actionToReducerResult = (action: SagaAction<any>, dataToValidate:any = undefined, pageIndex?:number):ReducerResult => {
    if(!action || !action.type) {
        console.warn('actionToReducerResult的第一个参数必须为标准的FSA对象');
    }
    //默认查找page pageIndex  pageindex page_index这些可能的参数名
    if(action.meta&&action.meta.parData&&action.meta.parData.request) {
        let keys = Object.keys(action.meta.parData.request);
        let filter = keys.filter(x=>['page','pageIndex','pageindex','page_index'].indexOf(x)>=0);
        if(filter&&filter.length>0) {
            if(filter.length==1) {
                pageIndex = action.meta.parData.request[filter[0]];
            } else {
                console.warn('请求参数同时带了多种跟当前页参数类似的字段:'+filter.join(','));
            }
        }
    }
    //在这里统一进行处理
    //如果后面需要添加错误类型，直接在这里和StateView进行修改即可
    //表示有错误
    let loadDataResult:Partial<ReducerResult> = {};
    if (action.error) {
        //此时的payload是一个Error对象
        if(!(action.payload instanceof Error)) {
            console.warn('action必须是标准的FSA对象，否则actionToReducerResult方法不正确')
        }
        dataToValidate = action.payload;
    }
    else {
        //默认以主结果进行验证
        if (dataToValidate==undefined) {
            dataToValidate = action.payload.result;
        }
    }
    return {
        ...loadDataResult,
        ...dataToReducerResult(dataToValidate,pageIndex),
        timestamp: new Date(),
        //将传递的参数也放进去
        parData: action.meta ? action.meta.parData : {}
    } as ReducerResult;
}

export default class RequestUtils {

    static init = (baseURL?:string)=>{
        //#region axios配置
        axios.defaults.baseURL = baseURL;
        //设置全局超时时间
        axios.defaults.timeout = 15000;

        axios.interceptors.request.use( async function (request:AxiosRequestConfigPatch) {
            if(!gUserData.token) {
                let res = await gStorage.load('token');
                if(res) {
                    gUserData.token = Object.keys(res).map(key=>key+'='+res[key]).join(';');
                }
            }
            request.headers = {
                ...request.headers,
                'content-type': 'application/json; charset=UTF-8',
                'cookie': gUserData.token
            };
            if(request.showLoading) {
                ToastUtils.showLoading();
            }
            return request;
        }, (error => {

        }));

        //格式化接口返回数据
        axios.interceptors.response.use(async (response) => {
            console.log(response.config.method+'  '+response.config.url)
            console.log(response.config.data)
            //如果是字符串，尝试转换成js对象
            if(typeof response.data == 'string'
                && ((response.config as AxiosRequestConfigPatch).autoResolveXML == true || (response.config as AxiosRequestConfigPatch).autoResolveXML == undefined)
                && response.config.url.indexOf(gServerPath)>=0) {
                await new Promise(resolve => {
                    parseString(response.data, function (err, result) {
                        if (!err) {
                            if (result.feed && result.feed.entry && Array.isArray(result.feed.entry)) {
                                result = result.feed.entry.map(x => {
                                    //遍历所有属性，将数组拆分成属性
                                    x = resolveXmlObject(x);
                                    return x;
                                })
                            }
                            response.data = result;
                            console.log(result)
                        }
                        resolve(true);
                    });
                })
            }
            //如果是未登录
            if(typeof response.data == 'string' && response.data.indexOf(`<a href="javascript:void(0);" onclick="return login();">登录`)>=0) {
                let error = new Error("");
                //@ts-ignore
                error.response = response;
                //@ts-ignore
                error.response.status = 401;
                //这里抛异常并不会进入到下面的
                // throw error;
                gStore.dispatch({
                    type: 'loginIndex/logout'
                })
                return Promise.reject(error);
            }
            //格式化数据
            if((response.config as AxiosRequestConfigPatch).resolveResult!=null) {
                response.data =  (response.config as AxiosRequestConfigPatch).resolveResult(response.data);
                console.log('解析后:',response.data);
            } else {
                console.log(response.data)
            }
            //部分接口没有result字段，直接返回data
            if(response.data.status=='OK'||(response.data.status===undefined&&response.data!=undefined)) {
                if(response.data.result===undefined) {
                    if(Array.isArray(response.data) || typeof response.data != 'object'){
                        return response;
                    }
                    return {
                        ...response,
                        data: {
                            ...response.data,
                        }
                    };
                } else {
                    return {
                        ...response,
                        data: {
                            ...response.data,
                        }
                    };
                }
            }
            else {
                let errorMessage = '';
                if(response.data&&response.data.errorMessage) {
                    errorMessage = response.data.errorMessage;
                }
                if(!((response.config as AxiosRequestConfigPatch).showErrorToast==false)) {
                    ToastUtils.showToast( errorMessage ||
                        '调用接口失败');
                }
                let error = new Error(errorMessage);
                //@ts-ignore
                error.response = response;
                //如果是未登录
                if(response.data.indexOf(`<a href="javascript:void(0);" onclick="return login();">登录`)>=0) {
                    //@ts-ignore
                    error.response.status = 401;
                }
                return Promise.reject(error)
            }
        },function (error) {
            console.log(error)
            if(error.response) {
                error.status = error.response?.status;
                switch (error.response?.status) {
                    //授权失败
                    case 401:
                        gStorage.save('token','');
                        NavigationHelper.push('Login');
                        break;
                    case 404:
                        error.message = '接口不存在!';
                        break;
                    //部分接口以406表示逻辑错误
                    case 406:
                        error.message = error.response.data;
                        break;
                }
            } else {
                //说明没有经过服务器
                error.message = error.message || '网络连接失!';
            }
            console.log(error.config?.method+'  '+error.config?.url)
            console.log(error.config?.data)
            console.log(error.message)
            if(!((error.config as AxiosRequestConfigPatch)?.showErrorToast==false)) {
                ToastUtils.showToast(error.message ||
                    (error.config as AxiosRequestConfigPatch)?.errorMessage ||
                    '调用接口失败');
            }
            return Promise.reject(error)

        });
        //#endregion
    }

    static get = <T=any>(url:string,config?:AxiosRequestConfigPatch)=>{
        return axios.get<T>(url,config);
    }

    static post = <T=any>(url:string,data?:any,config?:AxiosRequestConfigPatch)=>{
        return axios.post<T>(url,data,config);
    }

    static delete = <T=any>(url:string,config?:AxiosRequestConfigPatch)=>{
        return axios.delete(url,config);
    }

    static patch = <T=any>(url:string,data?:any,config?:AxiosRequestConfigPatch)=>{
        return axios.patch<T>(url,data,config);
    }

    static head = <T=any>(url:string,data?:any,config?:AxiosRequestConfigPatch)=>{
        return axios.head(url,config);
    }

    static put = <T=any>(url:string,data?:any,config?:AxiosRequestConfigPatch)=>{
        return axios.put<T>(url,data,config);
    }
}



const resolveXmlObject = (x)=>{
    //遍历所有属性，将数组拆分成属性
    for (let key in x) {
        if(Array.isArray(x[key])&&x[key].length==1) {
            let type = typeof x[key][0];
            switch (type) {
                //就是普通的属性
                case "string":
                    x[key] = x[key].join(',');
                    break;
                case "object":
                    //是$:{rel:'alternate',href:'http://www.cnblogs.com/chenzhuantou/p/12171532.html'}
                    //这种链接对象
                    if(Array.isArray(x[key])&&x[key].length==1) {
                        //分为两种，一种,两个属性_和$,$是一个对象{type: "text"},_对应的值就是具体的值
                        if(x[key][0].hasOwnProperty('_')&&x[key][0].hasOwnProperty('$')) {
                            x[key] = x[key][0]['_'];
                        } else if(Object.keys(x[key][0]).length==1&&x[key][0].hasOwnProperty('$')) {
                            x[key] = x[key][0]['$']['href'];
                        } else {
                            x[key] = resolveXmlObject(x[key][0]);
                        }
                    } else {
                        Object.keys(x[key]).map(y => {
                            x[key][y] = resolveXmlObject(x[key][y]);
                        });
                    }
            }
        }
    }
    return x;
}
