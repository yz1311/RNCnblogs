import React, {Component, FC, PureComponent} from 'react'
import {
    StyleSheet,
    View,
    TouchableOpacity,
    Image,
    Text,
    ScrollView,
    Alert,
    Share,
    DeviceEventEmitter,
    RefreshControl, EmitterSubscription, PixelRatio, Linking
} from 'react-native'
import {connect} from 'react-redux';
import YZStateView from '../../../components/YZStateCommonView';
import YZFlatList from '../../../components/YZFlatList';
import YZBaseDataPage, {IBaseDataPageProps} from '../../../components/YZBaseDataPage';
import YZCommentInput from '../../../components/YZCommentInput';
import YZCommonActionMenu from '../../../components/YZCommonActionMenu';
import Styles from '../../../common/styles';
import PropTypes from 'prop-types';
import {getQuestionDetail,clearQuestionDetail, clearQuestionAnswerList, answerQuestion, setSelectedQuestion} from "../../../actions/question/question_detail_actions";
import QuestionItem from '../question_item';
import AnswerItem from './answer_item';
import {clearBlogIsFav, deleteBookmarkByUrl, setBlogIsFav} from "../../../actions/bookmark/bookmark_index_actions";
import {showToast} from "../../../actions/app_actions";
import {ReduxState} from "../../../reducers";
import AutoHeightWebView from 'react-native-autoheight-webview'

interface IProps extends IBaseDataPageProps{
    item: any,
    clearBlogIsFavFn?: any,
    clearQuestionAnswerListFn?:any,
    deleteBookmarkByUrlFn?:any,
    answerQuestionFn?:any,
    answerList?: Array<any>,
    getAnswerListResult?: any,
    userInfo?: any,
    data?: any
}

@connect((state:ReduxState)=>({
    data: state.questionDetail.questionDetail,
    loadDataResult: state.questionDetail.getQuestionDetailResult,
    answerList: state.questionDetail.answerList,
    getAnswerListResult: state.questionDetail.getAnswerListResult,
    userInfo: state.loginIndex.userInfo,
    item: state.questionDetail.selectedQuestion,
}),dispatch=>({
    dispatch,
    showToastFn:(data)=>dispatch(showToast(data)),
    loadDataFn:(data)=>dispatch(getQuestionDetail(data)),
    clearDataFn:(data)=>dispatch(clearQuestionDetail(data)),
    clearBlogIsFavFn:(data)=>dispatch(clearBlogIsFav(data)),
    clearQuestionAnswerListFn:(data)=>dispatch(clearQuestionAnswerList(data)),
    deleteBookmarkByUrlFn:(data)=>dispatch(deleteBookmarkByUrl(data)),
    answerQuestionFn:(data)=>dispatch(answerQuestion(data)),
}))
export default class question_detail extends YZBaseDataPage<IProps,any> {

    static propTypes = {
        item: PropTypes.object
    };

    static navigationOptions = ({navigation})=>{
        return {
            title: '博问'
        };
    }

    private reloadListener:EmitterSubscription;
    private _flatList:any;

    constructor(props)
    {
        super(props);
        this.state = {
            ...this.state,
            isRefreshing: false
        };
    }

    componentDidMount() {
        super.componentDidMount();
        this.reloadListener = DeviceEventEmitter.addListener('reload_question_detail', this.loadData);
    }

    componentWillReceiveProps(nextProps, nextContext) {
        if(this.props.loadDataResult !== nextProps.loadDataResult)
        {
            this.setState({
                isRefreshing: false
            })
        }
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this.props.clearQuestionAnswerListFn();
        //清空isFav属性
        this.props.clearBlogIsFavFn();
        this.reloadListener&&this.reloadListener.remove();
    }

    getParams = ()=>{
        const {item} = this.props;
        const params = {
            request:{
                id: item.Qid
            },
            url: item.Url
        };
        return params;
    }

    _renderCommentItem=({item,index})=>{
        return (
            <AnswerItem
                item={item}
            />
        );
    }

    _onMessage=(event)=>{
        let postedMessage = event.nativeEvent.data;
        try {
            postedMessage = JSON.parse(event.nativeEvent.data)
        }
        catch (e) {

        }
        const {item, data} = this.props;
        switch (postedMessage.type) {
            case 'img_click':
                DeviceEventEmitter.emit('showImgList',{
                    imgList: data.imgList,
                    imgListIndex: data.imgList.indexOf(postedMessage.url) == -1 ? 0 : data.imgList.indexOf(postedMessage.url)
                });
                break;
            case 'link_click':
                Linking.canOpenURL(postedMessage.url).then(supported => {
                    if(supported){
                        // Linking.openURL(postedMessage.url);
                        this.props.navigation.navigate('YZWebPage',{
                            uri: postedMessage.url,
                            title: '详情'
                        });
                    }else{
                        console.log('无法打开该URL:'+postedMessage.url);
                    }
                });
                break;
        }
    }

    onSubmit=(text,callback)=>{
        const {answerQuestionFn, item, userInfo} = this.props;
        let QuestionUserInfo = item.QuestionUserInfo || {};
        answerQuestionFn({
            request: {
                id: item.Qid,
                loginName: userInfo.BlogApp,
                Answer: text,
                UserID: QuestionUserInfo.UserID,
                //这个不是评论人
                UserName: QuestionUserInfo.UserName
            },
            successAction: ()=>{
                callback&&callback();
            }
        });
    }

    render() {
        const {item, data} = this.props;
        let headerComponent = (
            <View>
                {/*<QuestionItem*/}
                {/*    item={this.props.data}*/}
                {/*    clickable={false}*/}
                {/*    showAll={true}*/}
                {/*    selectable={true}*/}
                {/*    navigation={this.props.navigation}*/}
                {/*/>*/}
                <QuestionDetail
                    DiggCount={this.props.data.DiggCount}
                    AnswerCount={this.props.data.AnswerCount}
                    ViewCount={this.props.data.ViewCount}
                    title={this.props.data.Title}
                    avatar={this.props.data.QuestionUserInfo?this.props.data.QuestionUserInfo.Face:'https://pic.cnblogs.com/face/sample_face.gif'}
                    author={this.props.data.QuestionUserInfo?this.props.data.QuestionUserInfo.UserName:''}
                    timeDesc={this.props.data.postDateDesc}
                    content={this.props.data.ConvertedContent}
                    onMessage={this._onMessage}
                    />
                <Text style={{marginVertical:8,color:gColors.color666,marginLeft:8}}>所有回答</Text>
            </View>
        );
        return (
            <View
                style={[Styles.container]}>
                <YZStateView getResult={this.props.loadDataResult}
                             placeholderTitle="暂无数据"
                             errorButtonAction={this.loadData}>
                    {this.props.getAnswerListResult.success&&this.props.answerList.length==0?
                        <ScrollView
                            refreshControl={<RefreshControl
                                refreshing={this.state.isRefreshing}
                                onRefresh={()=>{
                                    this.setState({
                                        isRefreshing: true
                                    },this.loadData);
                                }}
                                colors={[gColors.themeColor]}
                            />}
                            style={{flex:1,overflow:'hidden'}}>
                            {
                                headerComponent
                            }
                            <View style={{marginVertical:30,alignItems:'center'}}>
                                <Text style={{color:gColors.color999}}>-- 暂无回答 --</Text>
                            </View>
                        </ScrollView>:
                        <YZStateView getResult={this.props.getAnswerListResult}
                                                   placeholderTitle="-- 暂无回答 --"
                                                   errorButtonAction={this.loadData}>
                            <YZFlatList
                                ref={ref=>this._flatList=ref}
                                style={{flex:1}}
                                renderItem={this._renderCommentItem}
                                ListHeaderComponent={headerComponent}
                                data={this.props.answerList}
                                loadDataResult={this.props.getAnswerListResult}
                                noMore
                                initialNumToRender={20}
                                loadData={this.loadData}
                                ListFooterComponent={()=>null}
                                ItemSeparatorComponent={()=><View style={{height:1,backgroundColor:gColors.borderColor}}/>}
                            />
                        </YZStateView>}
                </YZStateView>
                <YZCommentInput
                    onSubmit={this.onSubmit}
                    placeholder="想说点什么"
                    menuComponent={()=>(
                        <YZCommonActionMenu
                            data={this.props.item}
                            commentCount={data.AnswerCount}
                            onClickCommentList={()=>{
                                this._flatList&&this._flatList.flatList.scrollToIndex({ viewPosition: 0, index: 0 });
                            }}
                        />
                    )}
                />
            </View>
        )
    }
}


const QuestionDetail:FC<{content:string,title:string,author:string,avatar:string,timeDesc:string
,DiggCount: string,AnswerCount:string,ViewCount:string,onMessage:any}> = ({content,title,author,avatar,timeDesc,DiggCount,AnswerCount,ViewCount,onMessage})=>{
    let toPx = (num) =>num;
    let html = `
        <body>
            <div style="display: flex;flex-direction: column;padding: ${toPx(8)}px;">
            <div style="display: flex;flex-direction: row;align-items: center;">
                <img class="avatar" src="${avatar}" />
                <span class="userName">${author}</span>
                <span class="dateDesc">${timeDesc}</span>
            </div>
            <div style="font-weight: bold;font-size: ${toPx(15)}px;color:${gColors.color0};margin-top: 10px;margin-bottom: 10px;">${title}</div>
            ${content}
            <div style="display: flex;flex-direction: row;align-items: center;color:${gColors.color666};font-size: 12px;">
                ${DiggCount} 推荐 · ${AnswerCount} 回答 · ${ViewCount} 阅读
            </div>
        </body>
    `;
    return (
        <AutoHeightWebView
            customScript={`document.body.style.background = 'white';window.onload = function(){  
                        var imgs = document.getElementsByTagName("img");
                        for (let i=0;i<imgs.length;i++) {
                            imgs[i].onclick = function(){
                                window['ReactNativeWebView'].postMessage(JSON.stringify({
                                    type: 'img_click',
                                    url: imgs[i].src
                                }))
                            }
                        }
                        var links = document.getElementsByTagName("a");
                        for (let i=0;i<links.length;i++) {
                            links[i].onclick = function(){
                                window['ReactNativeWebView'].postMessage(JSON.stringify({
                                    type: 'link_click',
                                    url: links[i].href
                                }));
                                return false;
                            }
                        }
                    };`}
            customStyle={`
                body {
                    font-size: ${toPx(14)}px;
                }
                img {
                    height: auto; 
                    width: auto;
                    max-width: 100%;
                }
                pre {
                    background-color: #f5f5f5;
                    font-family: Courier New!important;
                    font-size: 12px!important;
                    border: 1px solid #ccc;
                    padding: ${toPx(5)}px;
                    overflow: auto;
                    margin: ${toPx(5)}px 0;
                    color: #000;
                }
                .avatar {
                    width: ${toPx(28)}px;
                    height:${toPx(28)}px;
                    border-radius: ${toPx(14)}px;
                }
                .userName {
                    color: ${gColors.color333};
                    font-size: ${toPx(13)}px;
                    margin-left: ${toPx(7)}px;
                    font-weight: bold;
                }
                .dateDesc {
                    color: ${gColors.color666};
                    font-size: ${toPx(12)}px;
                    margin-left: ${toPx(10)}px;
                }
            `}
            source={{html:html}}
            onMessage={onMessage}
        />
    );
}

const styles = StyleSheet.create({
    avator: {
        width:20,
        height:20,
        borderRadius:10,
    }
});
