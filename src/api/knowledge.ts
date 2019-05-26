import {requestWithTimeout, createOptions} from '../utils/request';
import * as types from "../actions/actionTypes";


export const getKnowledgeBaseList = (data)=>{
    const URL = `${gServerPath}/KbArticles?pageIndex=${data.request.pageIndex}&pageSize=${data.request.pageSize}`;
    const options = createOptions(data, 'GET');
    return requestWithTimeout({
        URL,
        data,
        options,
        errorMessage:'获取知识库列表失败!',
        actionType:types.KNOWLEDGEBASE_GET_IST
    });
}

export const getKnowledgeBaseDetail = (data)=>{
    const URL = `${gServerPath}/KbArticles/${data.request.id}/body`;
    const options = createOptions(data, 'GET');
    return requestWithTimeout({
        URL,
        data,
        options,
        errorMessage:'获取知识库详情失败!',
        actionType:types.KNOWLEDGEBASE_GET_DETAIL
    });
}