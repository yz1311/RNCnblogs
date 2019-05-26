import {takeEvery, takeLatest, put, all, call, fork} from 'redux-saga/effects';
import * as actionTypes from '../../actions/actionTypes';
import {
    createSagaAction,
    removePendingSuffix,
    invokeCommonAPI,
    takeOrCancel,
    takeEveryOrCancel
} from "../../utils/reduxUtils";
import API from "../../api";
import StringUtils from "../../utils/stringUtils";
import Realm from 'realm';
import {userSchema, tables} from "../../common/database";

export function* searchData(action) {
    const {payload:{request:{category}}} = action;
    let resultAction = yield* invokeCommonAPI({
        method: API.home.searchData,
        action: action,
        showLoading: false,
        resolveResult: (result)=> {
            (result.result || []).forEach(x=>{
                x.Title = (x.Title || '').replace(/<strong>/g,'').replace(/<\/strong>/g,'')
                x.Content = (x.Content || '').replace(/<strong>/g,'').replace(/<\/strong>/g,'')
            });
            //由于跟以前的列表接口字段不一致，需要转换
            switch (category) {
                //暂时去掉Title的<strong>标签
                case 'blog':
                case 'news':
                    //由于没有BlogApp，需要根据Uri: "http://www.cnblogs.com/melonrice/articles/4147072.html"解析出来
                    result = (result.result || []).map(x=>{
                        let blogApp = 0;
                        let matches = (x.Uri || '').match(/com\/[\s\S]+?\//);
                        if(matches&&matches.length>0)
                        {
                            blogApp = matches[0].replace('com/','').replace('/','');
                        }
                        return {
                            ...x,
                            Url: x.Uri,
                            DiggCount: x.VoteTimes,
                            PostDate: x.PublishTime,
                            ViewCount: x.ViewTimes,
                            CommentCount: x.CommentTimes,
                            Description: x.Content,
                            Author: x.UserName,
                            BlogApp: blogApp,
                            postDateDesc: StringUtils.formatDate(x.PublishTime)
                        }
                    });
                    break;
                case 'question':
                    //由于没有Qid，需要从Uri: "https://q.cnblogs.com/q/93266/"解析出来
                    result = (result.result || []).map(x=>{
                        let Qid = 0;
                        let matches = (x.Uri || '').match(/q\/\d+?(\/){0,1}$/);
                        if(matches&&matches.length>0)
                        {
                            Qid = matches[0].replace('q/','').replace('/','');
                        }
                        return {
                            ...x,
                            Url: x.Uri,
                            QuestionUserInfo: {
                                UserName: x.UserName
                            },
                            DateAdded: x.PublishTime,
                            Content: x.Content,
                            DiggCount: x.VoteTimes,
                            AnswerCount: x.CommentTimes,
                            ViewCount: x.ViewTimes,
                            Qid: Qid,
                            postDateDesc: StringUtils.formatDate(x.PublishTime)
                        };
                    });
                    break;
                case 'kb':
                    result = (result.result || []).map(x=>({
                        ...x,
                        Url: x.Uri,
                        Author: x.UserName,
                        DiggCount: x.VoteTimes,
                        ViewCount: x.ViewTimes,
                        PostDate: x.PublishTime,
                        postDateDesc: StringUtils.formatDate(x.PublishTime)
                    }));
                    break;
            }
            return result;
        },
        successAction: function* (action, payload) {

        }
    });
    //保存关键字在本地
    if(resultAction&&!resultAction.error&&action.payload.request.keyWords!=undefined&&action.payload.request.keyWords!=='')
    {
        let key = action.payload.type+'_searchHistory';
        gStorage.load(key).then(async (history)=>{
            if(!history)
            {
                history = [];
            }
            let set = new Set(history);
            set.add(action.payload.request.keyWords);
            await gStorage.save(key,Array.from(set));
        });
    }
}


export const saveUserInfoToLocal = function* (action,userInfoList) {
    console.log(userInfoList)
    let realm;
    try {
        realm = yield Realm.open({
            schema: [userSchema],
            });
        for (let obj of userInfoList)
        {
            try {
                realm.write(()=>{
                    realm.create(tables.user, obj);
                });
                console.log('写入成功')
            }
            catch (ee) {
                console.log('写入失败')
            }
        }

    }catch (e) {
        console.log(e)
    }finally {
        if(realm)
        {
            realm.close();
        }
    }
}

export function* watchHomeIndex() {
    yield all([
        //由于有可能同时请求，放宽限制
        takeEveryOrCancel(actionTypes.HOME_SEARCH_GET_LIST, actionTypes.HOME_SEARCH_CLEAR_LIST, searchData),
    ]);
}
