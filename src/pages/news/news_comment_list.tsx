import React, {Component} from 'react'
import {
    StyleSheet,
    View,
    Text, Image,
    TouchableOpacity, DeviceEventEmitter, EmitterSubscription
} from 'react-native'
import {connect} from 'react-redux';
import YZBaseDataPage, {IBaseDataPageProps} from '../../components/YZBaseDataPage';
import YZStateView from '../../components/YZStateCommonView';
import YZCommentInput from '../../components/YZCommentInput';
import YZCommonActionMenu from '../../components/YZCommonActionMenu';
import YZFlatList from '../../components/YZFlatList';
import Styles from '../../common/styles';
import {ListRow, Overlay} from "@yz1311/teaset";
import {showToast} from "../../actions/app_actions";
import {
    getNewsCommentList,
    clearNewsCommentList,
    modifyNewsComment,
    deleteNewsComment,
    commentNews
} from "../../actions/news/news_index_actions";
import PropTypes from 'prop-types';
import StringUtils from "../../utils/stringUtils";
import CommentItem from '../blog/comment_item'
import {ReduxState} from "../../reducers";

interface IProps extends IBaseDataPageProps{
    item: any,
    pageIndex: number,
    commentNewsFn?: any,
    modifyNewsCommentFn?: any,
    deleteNewsCommentFn?: any,
    userInfo?: any,
    dataList?: Array<any>,
    noMore?: boolean
}

interface IState {
    headerTitle: string,
    headerSubmit: string
}

@connect((state:ReduxState)=>({
    dataList: state.newsIndex.newsCommentList,
    noMore: state.newsIndex.newsCommentList_noMore,
    loadDataResult: state.newsIndex.getNewsCommentListResult,
    item: state.newsIndex.selectedNews,
    userInfo: state.loginIndex.userInfo,
}),dispatch=>({
    dispatch,
    showToastFn:(data)=>dispatch(showToast(data)),
    loadDataFn:(data)=>dispatch(getNewsCommentList(data)),
    clearDataFn:(data)=>dispatch(clearNewsCommentList(data)),
    commentNewsFn:(data)=>dispatch(commentNews(data)),
    modifyNewsCommentFn:(data)=>dispatch(modifyNewsComment(data)),
    deleteNewsCommentFn:(data)=>dispatch(deleteNewsComment(data)),
}))
export default class news_comment_list extends YZBaseDataPage<IProps,IState> {
    pageIndex = 1;

    static propTypes = {
        item: PropTypes.object,
        pageIndex: PropTypes.number
    };

    static defaultProps = {
        pageIndex: 1
    };

    static navigationOptions = ({navigation})=>{
        let {title} = ((navigation.state || {}).params || {title:undefined})
        return {
            title: `${title?(title+'条'):''}评论`
        };
    }

    private reloadListener:EmitterSubscription;
    private _flatList:any;
    private _commentInput:any;

    constructor(props)
    {
        super(props);
        this.pageIndex = props.pageIndex;
        this.reloadListener = DeviceEventEmitter.addListener('reload_news_comment_list',()=>{
            this.pageIndex = 1;
            this.loadData();
        })
        this.state = {
            ...this.state,
            headerTitle: '',
            headerSubmit: ''
        };
    }

    componentWillReceiveProps(nextProps, nextContext) {
        if(this.props.item !==  nextProps.item)
        {
            this.setTitle(nextProps);
        }
    }

    componentDidMount() {
        //说明前面已经加载过一次了
        if(this.pageIndex === 1) {
            super.componentDidMount();
        }
        this.setTitle();
    }

    componentWillUnmount() {
        //退出不用清空列表
        this.reloadListener.remove();
    }

    setTitle = (nextProps = undefined)=>{
        nextProps = nextProps || this.props;
        nextProps.navigation.setParams({
            title: nextProps.item.CommentCount
        });
    }

    getParams = ()=>{
        const {item} = this.props;
        const params = {
            request:{
                newsId: item.Id,
                pageIndex: this.pageIndex,
                pageSize: 10
            }
        };
        return params;
    }

    renderNode=(node, index, siblings, parent, defaultRenderer)=> {
        if(node.name === 'fieldset')
        {
            const a = node.attribs;
            let text = ``;
            let legend = '';
            for (let child of node.children)
            {
                if(child.type === 'tag')
                {
                    switch (child.name) {
                        case 'legend':
                            legend = child.children.length>0?child.children[0].data:''
                            break;
                        case 'br':
                            text += '\n';
                            break;
                    }
                }else if(child.type === 'text')
                {
                    text += child.data;
                }
            }
            return (
                <View style={{borderColor:gColors.color999,borderWidth:1,borderRadius:6,padding:8}}>
                    <Text>{text}</Text>
                    <Text style={{position:'absolute',top:-7,left:15,backgroundColor:gColors.bgColorF,fontSize:gFont.size12}}>{legend}</Text>
                </View>
            );
        }
    }

    _renderItem=({item, index})=> {
        const {userInfo} = this.props;
        return (
            <CommentItem
                item={item}
                iconName={item.FaceUrl}
                userId={item.UserId}
                userName={item.UserName}
                floor={item.Floor}
                content={item.CommentContent}
                postDate={item.DateAdded}
                canDelete={item.UserId===userInfo.SpaceUserID}
                onComment={(item,userName)=>{
                    this.setState({
                        headerTitle: '正在回复  ' + userName,
                        headerSubmit: '@'+userName+':'
                    },()=>{
                        this._commentInput&&this._commentInput.getWrappedInstance().show();
                    });
                }}
                onDeleteCommentFn={()=>{
                    const {deleteNewsCommentFn} = this.props;
                    deleteNewsCommentFn({
                        request: {
                            id: item.CommentID,
                            newsId: this.props.item.Id
                        }
                    });
                }}
                onModifyComment={(content,successAction,failAction)=>{
                    const {modifyNewsCommentFn} = this.props;
                    modifyNewsCommentFn({
                        request: {
                            id: item.CommentID,
                            Content: content,
                            newsId: this.props.item.Id
                        },
                        successAction: ()=>{
                            //成功后关闭对话框
                            successAction&&successAction();
                        }
                    });
                }}
                />
        );
    }

    _onSubmit=(text,callback)=>{
        const {commentNewsFn, item} = this.props;
        commentNewsFn({
            request: {
                ParentId: 1,
                newsId: item.Id,
                Content: this.state.headerSubmit+'\n\n'+text
            },
            successAction: ()=>{
                callback&&callback();
                //刷新当前列表
                this.pageIndex = 1;
                if(this._flatList)
                {
                    this._flatList&&this._flatList._onRefresh();
                }
                else
                {
                    this.loadData();
                }
            }
        });
    }

    render() {
        return (
            <View
                style={[Styles.container]}>
                <YZStateView getResult={this.props.loadDataResult}
                             placeholderTitle="暂无数据"
                             errorButtonAction={this.loadData}>
                    <YZFlatList
                        ref={ref=>this._flatList=ref}
                        renderItem={this._renderItem}
                        data={this.props.dataList}
                        loadDataResult={this.props.loadDataResult}
                        noMore={this.props.noMore}
                        initialNumToRender={20}
                        loadData={this.loadData}
                        onPageIndexChange={pageIndex=>{
                            this.pageIndex = pageIndex;
                        }}
                        ItemSeparatorComponent={()=><View style={{height:10,backgroundColor:'transparent'}}/>}
                    />
                </YZStateView>
                <YZCommentInput
                    ref={ref=>this._commentInput=ref}
                    headerTitle={this.state.headerTitle}
                    onSubmit={this._onSubmit}
                    minLength={3}
                    placeholder="想说点什么"
                    menuComponent={()=>(
                        <YZCommonActionMenu
                            data={this.props.item}
                            onClickCommentList={()=>{
                                this._flatList&&this._flatList.flatList.scrollToIndex({ viewPosition: 0, index: 0 });
                            }}
                            commentCount={this.props.item.CommentCount}
                            showCommentButton={false}
                            showShareButton={false}
                            showFavButton={false}
                        />
                    )}
                />
            </View>
        )
    }
}


const styles = StyleSheet.create({

});
