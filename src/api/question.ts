import {requestWithTimeout, createOptions} from '../utils/request';
import * as types from "../actions/actionTypes";


export const getQuestionList = (data)=>{
    const URL = `${gServerPath}/questions/@${data.request.type}?pageIndex=${data.request.pageIndex}&pageSize=${data.request.pageSize}`;
    const options = createOptions(data, 'GET');
    return requestWithTimeout({
        URL,
        data,
        options,
        errorMessage:'获取问题列表失败!',
        actionType:types.QUESTION_GET_LIST
    });
}


export const checkIsAnswered = (data)=>{
    const URL = `${gServerPath}/questions/${data.request.questionId}?userId=${data.request.userId}`;
    const options = createOptions(data, 'HEAD');
    return requestWithTimeout({
        URL,
        data,
        options,
        errorMessage:'检查问题是否回答失败!',
        actionType:types.QUESTION_CHECK_IS_ANSWERED
    });
}


export const getQuestionDetail = (data)=>{
    const URL = `${gServerPath}/questions/${data.request.id}`;
    const options = createOptions(data, 'GET');
    return requestWithTimeout({
        URL,
        data,
        options,
        errorMessage:'获取问题详情失败!',
        actionType:types.QUESTION_GET_DETAIL
    });
}

export const getQuestionCommentList = (data)=>{
    const URL = `${gServerPath}/questions/answers/${data.request.id}/comments`;
    const options = createOptions(data, 'GET');
    return requestWithTimeout({
        URL,
        data,
        options,
        errorMessage:'获取问题评论失败!',
        actionType:types.QUESTION_GET_COMMENT_LIST
    });
}

export const getQuestionAnswerList = (data)=>{
    const URL = `${gServerPath}/questions/${data.request.id}/answers`;
    const options = createOptions(data, 'GET');
    return requestWithTimeout({
        URL,
        data,
        options,
        errorMessage:'获取问题回答失败!',
        actionType:types.QUESTION_GET_ANSWER_LIST
    });
}

export const addQuestion = (data)=>{
    const URL = `${gServerPath}/questions`;
    const options = createOptions(data);
    return requestWithTimeout({
        URL,
        data,
        options,
        errorMessage:'提问失败!',
        actionType:types.QUESTION_ADD_QUESTION
    });
}

export const deleteQuestion = (data)=>{
    const URL = `${gServerPath}/questions/${data.request.questionId}`;
    const options = {
        method:'DELETE',
        headers:{
            'Content-Type': 'application/json',
            'Authorization':'Bearer '+gUserData.token
        },
    };
    return requestWithTimeout({
        URL,
        data,
        options,
        errorMessage:'删除提问失败!',
        actionType:types.QUESTION_DELETE_QUESTION
    });
}

//修改tag无效
export const modifyQuestion = (data)=>{
    const URL = `${gServerPath}/questions/${data.request.questionId}`;
    const options = createOptions(data,'PATCH');
    return requestWithTimeout({
        URL,
        data,
        options,
        errorMessage:'修改问题失败!',
        actionType:types.QUESTION_MODIFY_QUESTION
    });
}

export const answerQuestion = (data)=>{
    const URL = `${gServerPath}/questions/${data.request.id}/answers?loginName=${data.request.loginName}`;
    const options = createOptions(data);
    return requestWithTimeout({
        URL,
        data,
        options,
        errorMessage:'回答问题失败!',
        actionType:types.QUESTION_ANSWER
    });
}

//删除问答(只能删除自己的)
export const deleteQuestionAnswer = (data)=>{
    const URL = `${gServerPath}/questions/${data.request.questionId}/answers/${data.request.answerId}`;
    const options = {
        method:'DELETE',
        headers:{
            'Content-Type': 'application/json',
            'Authorization':'Bearer '+gUserData.token
        },
    };
    return requestWithTimeout({
        URL,
        data,
        options,
        errorMessage:'删除回答失败!',
        actionType:types.QUESTION_DELETE_ANSWER
    });
}

//修改回答(只能修改自己的)
export const modifyQuestionAnswer = (data)=>{
    const URL = `${gServerPath}/questions/${data.request.id}/answers/${data.request.answerId}`;
    const options = createOptions(data,'PATCH');
    return requestWithTimeout({
        URL,
        data,
        options,
        errorMessage:'修改回答失败!',
        actionType:types.QUESTION_MODIFY_ANSWER
    });
}

export const getAnswerCommentList = (data)=>{
    const URL = `${gServerPath}/questions/answers/${data.request.answerId}/comments`;
    const options = createOptions(data,'GET');
    return requestWithTimeout({
        URL,
        data,
        options,
        errorMessage:'获取回答评论失败!',
        actionType:types.QUESTION_GET_ANSWER_COMMENT_LIST
    });
}


export const commentAswer = (data)=>{
    const URL = `${gServerPath}/questions/${data.request.questionId}/answers/${data.request.answerId}/comments?loginName=${data.request.loginName}`;
    const options = createOptions(data);
    return requestWithTimeout({
        URL,
        data,
        options,
        errorMessage:'评论问题回答失败!',
        actionType:types.QUESTION_COMMENT_ANSWER
    });
}


export const deleteAnswerComment = (data)=>{
    const URL = `${gServerPath}/questions/${data.request.questionId}/answers/${data.request.answerId}/comments/${data.request.commentId}`;
    const options = createOptions(data,'DELETE');
    return requestWithTimeout({
        URL,
        data,
        options,
        errorMessage:'删除评论失败!',
        actionType:types.QUESTION_DELETE_COMMENT_ANSWER
    });
}


export const modifyAnswerComment = (data)=>{
    const URL = `${gServerPath}/questions/${data.request.questionId}/answers/${data.request.answerId}/comments/${data.request.commentId}`;
    const options = createOptions(data,'PATCH');
    return requestWithTimeout({
        URL,
        data,
        options,
        errorMessage:'修改评论失败!',
        actionType:types.QUESTION_MODIFY_COMMENT_ANSWER
    });
}