import {requestWithTimeout, createOptions} from '../utils/request';
import * as types from "../actions/actionTypes";


export const searchData = (data)=>{
    const URL = `${gServerPath}/ZzkDocuments/${data.request.category}?keyWords=${data.request.keyWords}&pageIndex=${data.request.pageIndex}&pageSize=${data.request.pageSize}&viewTimesAtLeast=1`;
    const options = createOptions(data, 'GET');
    return requestWithTimeout({
        URL,
        data,
        options,
        errorMessage:'获取搜索列表失败!',
        actionType:types.HOME_SEARCH_GET_LIST
    });
}