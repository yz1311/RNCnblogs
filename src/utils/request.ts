import * as actionTypes from '../actions/actionTypes';

/**
 * 添加超时处理，调用方式：TimeoutPromiseWrapper(fetch(URL, [options]), 30).then(response => ...)
 *
 * @param promise   请求方法
 * @param timeout   超时秒数，默认20s
 * */
const TimeoutPromiseWrapper = (promise, timeout = 20) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            reject('请求超时')
        }, timeout * 1000)

        promise.then(resolve, reject)
    })
}

/**
 *
 * @param URL  地址
 * @param options  参数选项,get方式的时候一般不需要,传递空就行了
 * @param actionType
 * @param timeout 超时时间，单位s
 * @param successAction 调用接口成功，并返回正确值进行的回调函数
 */
const requestWithTimeout = ({URL,options,data,timeout = 20,errorMessage,successAction = undefined,failedAction = undefined,errorAction = undefined,actionType}: apiRequest)=>{
    //自动加上host
    if(URL.indexOf('http')!==0)
    {
        URL = gServerPath + URL;
    }
    //自动加上token参数
    //11/13 不能随便加，有一些是&Token=
    // if(URL.indexOf('?Token=')<0)
    // {
    //     URL = URL + `?Token=${gUserData.AccessToken}`;
    // }
    if(!URL)
    {
        throw Error('requestWithTimeout URL不能为空');
    }
    if(!errorMessage)
    {
        errorMessage='';
    }
    console.log('URL:'+URL);
    if(options)
    {
        if(options.body instanceof FormData)
        {
            console.log(JSON.stringify(options.body));
        }
        else
        {
            console.log(options.body);
        }
    }
    return new Promise(async (resolve,reject)=>{
        TimeoutPromiseWrapper(fetch(URL,options),timeout).then(
            async(response: any) => {
                switch (actionType) {
                    //404为不存在
                    case actionTypes.BOOKMARK_CHECK_IS:
                        if(response.ok)
                        {
                            return true
                        }
                        else if(response.status === 404)
                        {
                            return false;
                        }
                        break;
                    default:
                        let d = actionType.length - 'LIST'.length;
                        //以LIST结尾且404，则返回空数组
                        if(d>=0&&actionType.lastIndexOf('LIST')===d&&response.status===404)
                        {
                            return '[]';
                        }
                        // if(removePendingSuffix(actionType).inde)
                        break;
                }
                if(response.ok)
                {
                    //reponse.json()返回的是一个Promise而不是具体的json对象，所以不会被catch捕获到
                    // try {
                    //     var json = await response.json();
                    //     return json;
                    // }
                    // catch (e)
                    // {
                    //     console.log(response.status);
                    //     console.log(response.text());
                    //     e.status = response.status;
                    //     throw e;
                    // }
                    let responseContentType = response.headers.get('Content-Type');
                    if(!responseContentType||responseContentType.indexOf('application/json')<0)
                    {
                        resolve({
                            result:await response.text()
                        });
                    }
                    else
                    {
                        return response.text();
                    }
                }
                else
                {
                    try {
                        errorMessage = await response.text();
                    }
                    catch (e) {

                    }
                    console.log(errorMessage);
                    console.log(response.status+'   '+URL);
                    let error:any = new Error();
                    error.status = response.status;
                    throw error;
                }
            }
        ).then(responseData => {
            //服务器返回的json格式有问题，也当做服务器错误
            if(responseData != undefined && responseData !== '')
            {
                try {
                    responseData = JSON.parse(responseData);
                }
                catch (e)
                {
                    let error:any = new Error();
                    error.status = 500;
                    throw error;
                }
            }
            // if(responseData.code!=undefined) {
            //     if (responseData.code === '0') {
            //         console.log(responseData.data);
            //         responseData = {
            //             ...responseData,
            //             result: responseData.data
            //         };
            //         resolve(responseData);
            //     } else {
            //         console.log('responseData success');
            //         console.log(responseData);
            //         //逻辑错误
            //         let logicError = new Error(responseData.desc ? responseData.desc : errorMessage);
            //         logicError.code = responseData.code;
            //         logicError.result = responseData.data;
            //         reject(logicError);
            //     }
            // }
            // else
            // {
            //     console.log('responseData failed');
            //     console.log(responseData)
            //     resolve(responseData);
            // }
            console.log(responseData);
            responseData = {
                result: responseData
            };
            resolve(responseData);
        }).catch(error => {
            console.log(error);
            //不需要向用户展示原始的错误信息
            //本地或者服务器错误
            let serverError:any = new Error(errorMessage);
            serverError.code = -1;
            serverError.status = error.status;
            //说明是网络连接失败
            if(error.message === 'Network request failed')
            {
                serverError.message = '网络连接错误';
            }
            //Todo:区分哪些错误是值得用户重试的
            //譬如，如果是超时，则有重试的必要，404这种没有必要
            reject(serverError);
        })
    })
    return ;
}


const createOptions = (data,method='POST',contentType='application/json')=>{
    // const formData = new FormData();
    // if(data.request==undefined)
    // {
    //     data.request={};
    // }
    // for(const key in data.request)
    // {
    //     formData.append(key,data.request[key]);
    // }
    // if(!gUserData.session_id)
    // {
    //     console.warn('session_id is empty');
    // }
    let options = {
        method:method,
        headers:{
            'Content-Type': contentType,
            'Authorization':'Bearer '+gUserData.token
        },
        body:JSON.stringify(data.request)
    };
    if(typeof(data.request) !== 'object') {
        options = {
            ...options,
            body: data.request
        };
    }
    if(method&&method.toLowerCase()=='get')
    {
        options.method = 'GET';
        options.body = undefined;
    }
    if(method&&method.toLowerCase()=='head')
    {
        options.method = 'HEAD';
        options.body = undefined;
    }
    return options;
}


export interface apiRequest {
    URL: string,
    options: any,
    data: any,
    timeout?: number,
    errorMessage: string,
    successAction?: any,
    failedAction?: any,
    errorAction?: any,
    actionType: string
}

export {
    TimeoutPromiseWrapper,
    requestWithTimeout,
    createOptions

}
