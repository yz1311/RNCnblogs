import {requestWithTimeout, createOptions} from '../utils/request';
import * as types from "../actions/actionTypes";

export type getUserAliasByUserNameRequest = RequestModel<{
    userName: string,
    //用于保存到本地
    userId: string,
    fuzzy: boolean
}>;

export const getPersonInfo = (data)=>{
    const URL = `https://www.cnblogs.com/${data.request.userAlias}/ajax/news.aspx`;
    const options = createOptions(data, 'GET');
    return requestWithTimeout({
        URL,
        data,
        options,
        errorMessage:'获取园友信息失败!',
        actionType:types.PROFILE_GET_PERSON_INFO
    });
}


export const getPersonSignature = (data)=>{
    const URL = `https://www.cnblogs.com/${data.request.userAlias}`;
    const options = createOptions(data, 'GET');
    return requestWithTimeout({
        URL,
        data,
        options,
        errorMessage:'获取园友签名失败!',
        actionType:types.PROFILE_GET_PERSON_SIGNATURE
    });
}


export const getUserAliasByUserName = (data: getUserAliasByUserNameRequest) => {
    const URL = `http://wcf.open.cnblogs.com/blog/bloggers/search?t=${data.request.userName}`;
    const options = createOptions(data, 'GET');
    return requestWithTimeout({
        URL,
        data,
        options,
        errorMessage:'获取alias失败!',
        actionType:types.PROFILE_GET_PERSON_ALIAS_BY_NAME
    });
}

