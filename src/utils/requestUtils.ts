import axios, {AxiosProxyConfig, AxiosRequestConfig, AxiosResponse} from 'axios';
import {NavigationHelper} from '@yz1311/teaset-navigation';
import ToastUtils from "./toastUtils";
import StorageUtils from "./storageUtils";


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


export default class RequestUtils {

    static init = (baseURL?:string)=>{
        //#region axios配置
        axios.defaults.baseURL = baseURL;
        //设置全局超时时间
        axios.defaults.timeout = 15000;

        axios.interceptors.request.use( async function (request:AxiosRequestConfigPatch) {
            if(!gUserData || !gUserData.token) {
                let res = await StorageUtils.load('token');
                if(res && res.hasOwnProperty('.Cnblogs.AspNetCore.Cookies')) {
                    //@ts-ignore
                    gUserData = {
                        ...(gUserData || {}),
                        token: Object.keys(res).map(key=>key+'='+res[key]).join(';')
                    };
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
                response.data = await (response.config as AxiosRequestConfigPatch).resolveResult(response.data);
                console.log('解析后:',response.data);
            } else {
                console.log(response.data)
            }
            //如果存在 set-cookie,则需要更新cookie
            if(response.headers['set-cookie'] &&
                response.headers['set-cookie'].length > 0 ) {
                let tokenStr = response.headers['set-cookie'][0]?.replace(/path=\/,/g, '')?.replace(/Path=\//g, '');
                let res = await StorageUtils.load('token');
                console.log('------')
                console.log(tokenStr)
                let nextTokenObj = {} as any;
                for (let item of tokenStr.split(';')) {
                    let pair = item.split('=');
                    if(pair.length === 2 && pair[0] && pair[1]) {
                        nextTokenObj = {
                            ...nextTokenObj,
                            [pair[0].trim()]: pair[1].trim()
                        };
                    }
                }
                if (res && res.hasOwnProperty('.Cnblogs.AspNetCore.Cookies')) {
                    res = {
                        ...res,
                        ...nextTokenObj
                    };
                    StorageUtils.save('token', res);
                    gUserData.token = Object.keys(res).map(key => key + '=' + res[key].value).join(';');
                }
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
                        StorageUtils.save('token','');
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
