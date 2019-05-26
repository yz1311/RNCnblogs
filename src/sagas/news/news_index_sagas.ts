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
import {checkIsBookmark} from "../bookmark/bookmark_index_sagas";
import {showToast} from "../app_sagas";
import ToastUtils from "../../utils/toastUtils";
import {DeviceEventEmitter} from "react-native";
import Realm from "realm";
import {blogSchema, newsSchema, tables} from "../../common/database";
import moment from 'moment';
import StringUtils from "../../utils/stringUtils";
import {ReduxState} from "../../reducers";

export function* getNewsList(action) {
    const isConnected = yield select((state: ReduxState)=>state.app.isConnected);
    //则取本地数据
    if(!isConnected)
    {
        yield fork(getLocalNewsListByPage,action,1);
        return;
    }
    yield* invokeCommonAPI({
        method: API.news.getNewsList,
        action: action,
        showLoading: false,
        resolveResult: (result)=> {
            //拼接新闻网址
            result = (result.result || []).map(x=>({
                ...x,
                Url: `https://news.cnblogs.com/n/${x.Id}`,
                postDateDesc: StringUtils.formatDate(x.DateAdded)
            }));
            return result;
        },
        successAction: function* (action, payload) {
            yield call(saveNewsListToLocal,action,payload,1);
        }
    });
}

export function* getHowWeekNewsList(action) {
    const isConnected = yield select((state: ReduxState)=>state.app.isConnected);
    //则取本地数据
    if(!isConnected)
    {
        yield fork(getLocalNewsListByPage,action,3);
        return;
    }
    yield* invokeCommonAPI({
        method: API.news.getHowWeekNewsList,
        action: action,
        showLoading: false,
        resolveResult: (result)=> {
            //拼接新闻网址
            result = (result.result || []).map(x=>({
                ...x,
                Url: `https://news.cnblogs.com/n/${x.Id}`,
                postDateDesc: StringUtils.formatDate(x.DateAdded)
            }));
            return result;
        },
        successAction: function* (action, payload) {
            yield call(saveNewsListToLocal,action,payload,3);
        }
    });
}

export function* getRecommendedNewsList(action) {
    const isConnected = yield select((state: ReduxState)=>state.app.isConnected);
    //则取本地数据
    if(!isConnected)
    {
        yield fork(getLocalNewsListByPage,action,2);
        return;
    }
    yield* invokeCommonAPI({
        method: API.news.getRecommendedNewsList,
        action: action,
        showLoading: false,
        resolveResult: (result)=> {
            //拼接新闻网址
            result = (result.result || []).map(x=>({
                ...x,
                Url: `https://news.cnblogs.com/n/${x.Id}`,
                postDateDesc: StringUtils.formatDate(x.DateAdded)
            }));
            return result;
        },
        successAction: function* (action, payload) {
            yield call(saveNewsListToLocal,action,payload,2);
        }
    });
}

const getLocalNewsListByPage = function* (action, newsType) {
    const {request: {pageIndex,pageSize}} = action.payload;
    try {
        const realm = yield Realm.open({schema: [newsSchema]});
        let blogs = realm.objects(tables.news);
        let curBlogs = blogs.filtered(`newsType = ${newsType}`).sorted('postDate',true);
        let result = curBlogs.slice((pageIndex-1)*pageSize,pageIndex*pageSize);
        yield put(sagaActionToAction(action,result.map(x=>({
            Id: x.id,
            Url: x.url,
            Author: x.author,
            Avatar: x.avator,
            TopicIcon: x.topicIcon,
            TopicId: x.topicId,
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
    }
}

const saveNewsListToLocal = function* (action, payload, newsType) {
    let realm;
    try {
        realm = yield Realm.open({schema: [newsSchema]});
        for (let obj of payload)
        {
            try {
                realm.write(()=>{
                    realm.create(tables.news, {
                        id: obj.Id+'',
                        url: obj.Url,
                        author: obj.Author || '',
                        avator: obj.Avatar || '',
                        topicIcon: obj.TopicIcon,
                        topicId: obj.TopicId+'',
                        title: obj.Title || '',
                        description: obj.Summary,
                        diggComment: obj.DiggCount || 0,
                        commentCount: obj.CommentCount,
                        viewCount: obj.ViewCount,
                        postDate: moment(obj.DateAdded).toDate(),
                        newsType: newsType,
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
    }
    finally {
        if(realm)
        {
            realm.close();
        }
    }
}

export function* getNewsDetail(action) {
    const {url, item} = action.payload;
    //查询是否有详情数据，有则先返回
    let resultAction;
    //则取本地数据
    let realm;
    try {
        const realm = yield Realm.open({schema: [newsSchema]});
        let blogs = realm.objects(tables.news);
        let curNews = blogs.filtered(`id = "${item.Id}"`);
        if (curNews != undefined && curNews.length > 0 && curNews[0].content != undefined) {
            resultAction = sagaActionToAction(action, {
                body: curNews[0].content,
                imgList: gUtils.string.getImgUrls(curNews[0].content),
                scrollPosition: curNews[0].scrollPosition
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
    //获取第一页评论列表
    yield fork(getNewsCommentList,createSagaAction(actionTypes.NEWS_GET_COMMENT_LIST,{
        request: {
            newsId: item.Id,
            pageIndex: 1,
            pageSize: 10
        }
    }));
    yield* invokeCommonAPI({
        method: API.news.getNewsDetail,
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
                realm = yield Realm.open({schema: [newsSchema]});
                let blogs = realm.objects(tables.news);
                let curNews = blogs.filtered(`id = "${item.Id}"`);
                if(curNews!=undefined&&curNews.length>0)
                {
                    realm.write(()=>{
                        curNews[0].content = payload.body;
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

export function* commentNews(action) {
    yield* invokeCommonAPI({
        method: API.news.commentNews,
        action: action,
        successAction: function* (action, payload) {
            yield call(showToast,{
                type: '',
                payload: {
                    message: '评论成功！',
                    type: ToastUtils.types.success
                }
            });
        }
    });
}

export function* getNewsCommentList(action) {
    const {payload:{request:{pageIndex, pageSize}}} = action;
    yield* invokeCommonAPI({
        method: API.news.getNewsCommentList,
        action: action,
        showLoading: false,
        resolveResult: (result)=> {
            //要重新计算楼层，返回的数据的Floor都只是本页的序号
            result = (result.result || []).map((x,xIndex)=>({
                ...x,
                Floor: (pageIndex-1)*pageSize + xIndex + 1
            }));
            return result;
        },
        successAction: function* (action, payload) {

        }
    });
}

export function* deleteNewsComment(action) {
    yield* invokeCommonAPI({
        method: API.news.deleteNewsComment,
        action: action,
        successAction: function* (action, payload) {
            yield call(showToast,{
                type: '',
                payload: {
                    message: '删除评论成功！',
                    type: ToastUtils.types.success
                }
            });
            DeviceEventEmitter.emit('reload_news_comment_list');
        }
    });
}

export function* modifyNewsComment(action) {
    yield* invokeCommonAPI({
        method: API.news.modifyNewsComment,
        action: action,
        successAction: function* (action, payload) {
            yield call(showToast,{
                type: '',
                payload: {
                    message: '删除评论成功！',
                    type: ToastUtils.types.success
                }
            });
            DeviceEventEmitter.emit('reload_news_comment_list');
        }
    });
}

export function* setNewsScrollPosition(action) {
    const {id, value} = action.payload;
    let realm;
    try {
        realm = yield Realm.open({schema: [newsSchema]});
        let news = realm.objects(tables.news);
        let curNews = news.filtered(`id = "${id}"`);
        if(curNews!=undefined&&curNews.length>0)
        {
            realm.write(()=>{
                console.log('set to '+value)
                curNews[0].scrollPosition = value;
            });
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

export function* watchNewsIndex() {
    yield all([
        takeOrCancel(actionTypes.NEWS_GET_LIST, actionTypes.NEWS_CLEAR_LIST, getNewsList),
        takeOrCancel(actionTypes.NEWS_GET_HOT_WREEK_LIST, actionTypes.NEWS_CLEAR_HOT_WREEK_LIST, getHowWeekNewsList),
        takeOrCancel(actionTypes.NEWS_GET_RECOMMENDED_NEWS_LIST, actionTypes.NEWS_CLEAR_RECOMMENDED_NEWS_LIST, getRecommendedNewsList),
        takeOrCancel(actionTypes.NEWS_GET_DETAIL, actionTypes.NEWS_CLEAR_DETAIL, getNewsDetail),
        takeOrCancel(actionTypes.NEWS_COMMENT, '', commentNews),
        takeOrCancel(actionTypes.NEWS_GET_COMMENT_LIST, actionTypes.NEWS_CLEAR_COMMENT_LIST, getNewsCommentList),
        takeOrCancel(actionTypes.NEWS_COMMENT_DELETE, '', deleteNewsComment),
        takeOrCancel(actionTypes.NEWS_COMMENT_MODIFY, '', modifyNewsComment),
        takeLatest(actionTypes.NEWS_SET_NEWS_SCROLL_POSITION, setNewsScrollPosition),
    ]);
}
