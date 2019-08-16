import * as actionTypes from '../../actions/actionTypes';
import {handleActions, createReducerResult, actionToResult} from '../../utils/reduxUtils';
import StringUtils from "../../utils/stringUtils";

export interface State {
    unsolved: any,
    highscore: any,
    noanswer: any,
    solved: any,
    myquestion: any,
    myunsolved: any,
    myanswer: any,
    mybestanswer: any
}

const initialState: State = {
    unsolved: {
        list: [],
        noMore: false,
        loadDataResult: createReducerResult()
    },
    highscore: {
        list: [],
        noMore: false,
        loadDataResult: createReducerResult()
    },
    noanswer: {
        list: [],
        noMore: false,
        loadDataResult: createReducerResult()
    },
    solved: {
        list: [],
        noMore: false,
        getListResult: createReducerResult()
    },
    myquestion: {
        list: [],
        noMore: false,
        loadDataResult: createReducerResult()
    },
    myunsolved: {
        list: [],
        noMore: false,
        loadDataResult: createReducerResult()
    },
    myanswer: {
        list: [],
        noMore: false,
        loadDataResult: createReducerResult()
    },
    mybestanswer: {
        list: [],
        noMore: false,
        loadDataResult: createReducerResult()
    },
}

const questionTyes = ['unsolved','highscore','noanswer','solved','myquestion','myunsolved','myanswer','mybestanswer'];

export default handleActions( {
    [actionTypes.QUESTION_GET_LIST]:(state: State,action)=> {
        const {payload, meta} = action;
        const {request: {pageIndex, pageSize, type}} = meta.parData;
        if(state.hasOwnProperty(type))
        {
            if(!action.error) {
                state[type].list = state[type].list.slice(0,(pageIndex-1)*pageSize).concat(payload.result);
                state[type].noMore = (payload.result||[]).length === 0 || payload.result.length < pageSize;
            }
            state[type].loadDataResult = actionToResult(action,null,state[type].list);
        }
    },
    [actionTypes.QUESTION_CLEAR_LIST]:(state: State,action)=> {
        for (let type of questionTyes)
        {
            state[type] = initialState[type];
        }
    },
    [actionTypes.QUESTION_DELETE_ANSWER]:(state: State,action)=> {
        const {meta: {parData: {request: {questionId, answerId}}}} = action;
        for (let key in state)
        {
            //将问题的回答数量更改
            for (let question of state[key])
            {
                if(question.Qid === questionId)
                {
                    question.AnswerCount = question.AnswerCount + 1;
                    break;
                }
            }
        }
    },
    [actionTypes.QUESTION_DELETE_QUESTION]:(state: State,action)=> {
        if(!action.error) {
            const {questionId} = action.meta.parData.request;
            //移除所有列表涉及到的该项
            for (let type of questionTyes)
            {
                state[type].list = state[type].list.filter(x=>x.Qid !== questionId);
                state[type].loadDataResult = actionToResult(action,null,state[type].list);
            }
        }
    },
    [actionTypes.HOME_REFRESH_DATA_TIME]:(state: State,action)=> {
        for (let type of questionTyes)
        {
            for (let item of state[type].list)
            {
                item.postDateDesc = StringUtils.formatDate(item.DateAdded);
            }
        }
    },
}, initialState);
