import {takeEvery, takeLatest, put, all, call, fork, select} from 'redux-saga/effects';
import * as actionTypes from '../../actions/actionTypes';
import {
    createSagaAction,
    removePendingSuffix,
    invokeCommonAPI,
    takeOrCancel,
    takeEveryOrCancel, sagaActionToAction
} from "../../utils/reduxUtils";
import API from "../../api";
import {resetTo} from '../nav_sagas';
import {checkIsBookmark} from '../bookmark/bookmark_index_sagas';
import {showToast} from "../app_sagas";
import ToastUtils from "../../utils/toastUtils";
import Realm from 'realm';
import {tables,blogSchema} from '../../common/database';
import moment from 'moment';
import StringUtils from "../../utils/stringUtils";
import {ReduxState} from "../../reducers";

export function* getKnowledgeBaseList(action) {
    const isConnected = yield select((state: ReduxState)=>state.app.isConnected);
    //则取本地数据
    if(!isConnected)
    {
        yield fork(getLocalBlogListByPage,action,4);
        return;
    }
    yield* invokeCommonAPI({
        method: API.knowledge.getKnowledgeBaseList,
        action: action,
        showLoading: false,
        resolveResult: (result)=> {
            //拼接知识库网址
            result = (result.result || []).map(x=>({
                ...x,
                Url: `https://kb.cnblogs.com/page/${x.Id}`,
                postDateDesc: StringUtils.formatDate(x.DateAdded)
            }));
            return result;
        },
        successAction: function* (action, payload) {
            yield call(saveBlogListToLocal,action,payload,4);
        }
    });
}

const getLocalBlogListByPage = function* (action, blogType) {
    const {request: {pageIndex,pageSize}} = action.payload;
    let realm;
    try {
        realm = yield Realm.open({schema: [blogSchema]});
        let blogs = realm.objects(tables.blog);
        let curBlogs = blogs.filtered(`blogType = ${blogType}`).sorted('postDate',true);
        let result = curBlogs.slice((pageIndex-1)*pageSize,pageIndex*pageSize);
        yield put(sagaActionToAction(action,result.map(x=>({
            Id: x.id,
            Url: x.url,
            Author: x.author,
            Avatar: x.avator,
            Title: x.title,
            Summary: x.description,
            DiggCount: x.diggComment,
            CommentCount: x.commentCount,
            ViewCount: x.viewCount,
            DateAdded: moment(x.postDate).format('YYYY-MM-DD HH:mm:ss'),
            postDateDesc: StringUtils.formatDate(x.postDate)
        }))));
    }catch (e) {
        console.log(e)
        action.error = true;
        yield put(sagaActionToAction(action,null));
    }finally {
        if(realm)
        {
            realm.close();
        }
    }
}

const saveBlogListToLocal = function* (action, payload, blogType) {
    let realm;
    try {
        realm = yield Realm.open({schema: [blogSchema]});
        for (let obj of payload)
        {
            try {
                realm.write(()=>{
                    realm.create(tables.blog, {
                        id: obj.Id+'',
                        url: obj.Url,
                        author: obj.Author || '',
                        avator: '',
                        blogApp: '',
                        title: obj.Title,
                        description: obj.Summary,
                        diggComment: obj.DiggCount,
                        commentCount: -1,
                        viewCount: obj.ViewCount,
                        postDate: moment(obj.DateAdded).toDate(),
                        blogType: blogType,
                        fetchDate: new Date(),
                    });
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

export function* getKnowledgeBaseDetail(action) {
    const {url, request, item} = action.payload;
    //查询是否有详情数据，有则先返回
    let resultAction;
    let realm;
    try {
        realm = yield Realm.open({schema: [blogSchema]});
        let blogs = realm.objects(tables.blog);
        let curBlogs = blogs.filtered(`id = "${item.Id}"`);
        if (curBlogs != undefined && curBlogs.length > 0 && curBlogs[0].content != undefined) {
            resultAction = sagaActionToAction(action, {
                body: curBlogs[0].content,
                imgList: gUtils.string.getImgUrls(curBlogs[0].content),
                scrollPosition: curBlogs[0].scrollPosition
            });
            yield put(resultAction);
        }
    } catch (e) {
        console.log(e)
    } finally {
        if (realm) {
            realm.close();
        }
    }
    const isConnected = yield select((state: ReduxState)=>state.app.isConnected);
    if(!isConnected&&resultAction!=null) {
        return;
    }
    const isLogin = yield select((state: ReduxState)=>state.loginIndex.isLogin);
    //收藏接口客户端模式无法调用
    if(isLogin) {
        yield fork(function* () {
            let checkAction = yield call(checkIsBookmark, createSagaAction(actionTypes.BOOKMARK_CHECK_IS, {
                request: {
                    //这个接口url返回的是http协议，影响检查是否收藏接口(收藏的链接都是https),所以这个同意改为https
                    url: url
                },
                showLoading: false
            }));
            yield put({
                ...checkAction,
                type: actionTypes.BOOKMARK_SET_IS_FAV
            });
        });
    }
    yield* invokeCommonAPI({
        method: API.knowledge.getKnowledgeBaseDetail,
        action: action,
        showLoading: false,
        resolveResult: (payload)=> {
            //去除最后的统计图片代码，因为会导致下面留下很大空白
            payload.result = payload.result.replace(/<img[\s\S]{1,10}:\/\/counter[\s\S]+?\/>/,'')
            let result = {
                body: payload.result,
                imgList: gUtils.string.getImgUrls(payload.result),
                scrollPosition: 0
            }
            //赋值scrollPosition
            if(resultAction!=null)
            {
                result = {
                    ...result,
                    scrollPosition: resultAction.payload.result.scrollPosition
                };
            }
            return result;
        },
        successAction: function* (action, payload) {
            //保存到本地
            let realm;
            try {
                realm = yield Realm.open({schema: [blogSchema]});
                let blogs = realm.objects(tables.blog);
                let curBlogs = blogs.filtered(`id = "${item.Id}"`);
                if(curBlogs!=undefined&&curBlogs.length>0)
                {
                    realm.write(()=>{
                        curBlogs[0].content = payload.body;
                    });
                }
            }
            catch (e) {
                console.log(e)
            }finally {
                if(realm)
                {
                    realm.close();
                }
            }
        }
    });
}


export function* watchKnowledgeBaseIndex() {
    yield all([
        takeOrCancel(actionTypes.KNOWLEDGEBASE_GET_IST, actionTypes.KNOWLEDGEBASE_CLEAR_IST, getKnowledgeBaseList),
        takeOrCancel(actionTypes.KNOWLEDGEBASE_GET_DETAIL, actionTypes.KNOWLEDGEBASE_CLEAR_DETAIL, getKnowledgeBaseDetail),
    ]);
}
