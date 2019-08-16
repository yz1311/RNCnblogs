import React, {Component, FC, PureComponent} from 'react'
import {
    StyleSheet,
    View,
    TouchableOpacity,
    Image,
    Text,
    TextInput, DeviceEventEmitter
} from 'react-native'
import {connect} from 'react-redux';
import YZStateView from '../../components/YZStateCommonView';
import YZFlatList from '../../components/YZFlatList';
import YZCheckbox from '../../components/YZCheckbox';
import YZManagementProfile from '../../components/YZManagementProfile';
import Styles from '../../common/styles';
import Feather from 'react-native-vector-icons/Feather';
import {ListRow} from "@yz1311/teaset";
import PropTypes from 'prop-types';
import FontAwesome from "react-native-vector-icons/FontAwesome";
import {addQuestion, modifyQuestion} from '../../actions/question/question_index_actions';
import {showToast} from "../../actions/app_actions";
import Entypo from "../profile/profile_setting";
import {ReduxState} from "../../reducers";
import {NavigationScreenProp, NavigationState} from "react-navigation";

interface IProps extends IReduxProps{
    item: any,
    clickable: boolean,
    navigation: NavigationScreenProp<NavigationState>,
    addQuestionFn?: any,
    modifyQuestionFn?: any,
    userInfo?: any
}

interface IState {
    title: string,
    value: string,
    isPublishToTop: boolean,
    tag: string
    tagList: Array<any>;
    canSubmit: boolean
}

@connect((state:ReduxState)=>({
    userInfo: state.loginIndex.userInfo,
    item: state.questionDetail.selectedQuestion,
}),dispatch=>({
    showToastFn:(data)=>dispatch(showToast(data)),
    addQuestionFn:(data)=>dispatch(addQuestion(data)),
    modifyQuestionFn:(data)=>dispatch(modifyQuestion(data))
}))
export default class status_add extends PureComponent<IProps,IState> {

    static propTypes = {
        item: PropTypes.object,
        clickable: PropTypes.bool
    };

    static defaultProps = {
        clickable: true
    };

    static navigationOptions = ({navigation})=>{
        const {state} = navigation;
        const {title, rightAction} = state.params || {rightAction:undefined,title:undefined};
        return {
            title: title || '提问',
            headerRight: (
                <TouchableOpacity
                    activeOpacity={activeOpacity}
                    style={{alignSelf:'stretch',justifyContent:'center',paddingHorizontal:8}}
                    onPress={rightAction}
                >
                    <FontAwesome name="send" size={18} color={gColors.bgColorF} />
                </TouchableOpacity>
            )
        };
    }

    constructor(props)
    {
        super(props);
        this.state = {
            title: '',
            value: '',
            isPublishToTop: true,
            tag: '',
            tagList: [],
            canSubmit: false
        };
        if(props.item.Title)
        {
            this.state = {
                ...this.state,
                title: props.item.Title,
                value: props.item.Content,
                tagList: (props.item.Tags || '').split(','),
            };
        }
    }

    componentDidMount() {
        this.validate();
        this.props.navigation.setParams({
            rightAction: this._rightAction
        });
    }

    _rightAction=()=>{
        if(this.state.canSubmit)
        {
            const {addQuestionFn, item, modifyQuestionFn} = this.props;
            //修改
            if(item.Title) {
                modifyQuestionFn({
                    request: {
                        questionId: item.Qid,
                        Title: this.state.title,
                        Content: this.state.value,
                        Tags: this.state.tagList.join(','),
                        Flags: this.state.isPublishToTop ? '1' : '2',
                        UserID: this.props.userInfo.SpaceUserID
                    },
                    successAction: () => {
                        //返回到上一级，并刷新所有的列表
                        this.props.navigation.goBack();
                        //刷新‘待解决’和‘没有答案'、'我的问题'三个列表
                        DeviceEventEmitter.emit('reload_myquestion_list');
                        DeviceEventEmitter.emit('reload_unsolved_list');
                        DeviceEventEmitter.emit('reload_noanswer_list');
                    }
                });
            }
            //新增
            else
            {
                addQuestionFn({
                    request: {
                        Title: this.state.title,
                        Content: this.state.value,
                        Tags: this.state.tagList.join(','),
                        Flags: this.state.isPublishToTop ? '1' : '2',
                        UserID: this.props.userInfo.SpaceUserID
                    },
                    successAction: () => {
                        //返回到上一级，并刷新所有的列表
                        this.props.navigation.goBack();
                        //刷新‘待解决’和‘没有答案'、'我的问题'三个列表
                        DeviceEventEmitter.emit('reload_myquestion_list');
                        DeviceEventEmitter.emit('reload_unsolved_list');
                        DeviceEventEmitter.emit('reload_noanswer_list');
                    }
                });
            }
        }
        else
        {
            const validateResult = this.validate();
            this.props.showToastFn(validateResult[0]);
        }
    }

    validate  = ()=>{
        let errors=[];
        if(this.state.title.length<6 || this.state.title.length>200)
        {
            errors.push('标题,6~200字符');
        }
        if(this.state.value.length<20 || this.state.value.length>100000)
        {
            errors.push('内容,20~100000字符');
        }
        if(errors.length===0)
        {
            this.setState({
                canSubmit:true
            });
        }
        else
        {
            this.setState({
                canSubmit:false
            });
        }
        return errors;
    }

    render() {
        const {item, clickable} = this.props;
        const canAddTag = this.state.tagList.length<5;
        return (
            <View style={[Styles.container,{backgroundColor:gColors.bgColorF}]}>
                <YZManagementProfile
                    type="input"
                    title="标题"
                    placeholder="请输入标题"
                    detailStyle={{textAlign: 'left',marginLeft: 10}}
                    subTitle={this.state.title}
                    onChangeText={value=>this.setState({title: value},this.validate)}
                    />
                <YZManagementProfile
                    type="custom"
                    title="标签"
                    placeholder="请输入标题"
                    detailStyle={{textAlign: 'left',marginLeft: 10}}
                    realName
                    extra={
                        <View style={{flexDirection:'row',alignItems:'center', marginLeft: 10}}>
                            <TextInput
                                placeholder={'准确的Tag有助于专家高手发现问题'}
                                underlineColorAndroid="transparent"
                                style={[{padding:8, fontSize: gFont.size15, color: gColors.color333,flex:1}]}
                                value={this.state.tag}
                                maxLength={30}
                                onChangeText={value=>this.setState({tag: value})}
                            />
                            <TouchableOpacity
                                activeOpacity={activeOpacity}
                                onPress={()=>{
                                    if(canAddTag) {
                                        this.setState({
                                            tagList: this.state.tagList.concat([this.state.tag]),
                                            tag: ''
                                        },this.validate);
                                    }
                                    else
                                    {
                                        this.props.showToastFn('最多添加5个tag');
                                    }
                                }}
                                style={{paddingHorizontal:14,paddingVertical:7,backgroundColor:canAddTag?gColors.themeColor:gColors.borderColor,borderRadius:6}}
                            >
                                <Text style={{color:gColors.bgColorF}}>添加</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
                <View style={{flexDirection:'row',paddingHorizontal:6,flexWrap:'wrap',paddingVertical:7,paddingBottom:10,borderBottomColor:gColors.borderColor,borderBottomWidth:gScreen.onePix}}>
                    {
                        this.state.tagList.map((x, xIndex) => {
                            return (
                                <Tag
                                    key={xIndex}
                                    index={xIndex}
                                    item={x}
                                    onDeleteTag={()=>{
                                        this.setState({
                                            tagList: this.state.tagList.filter(n=>n!==x)
                                        });
                                    }}
                                    />
                            );
                        })
                    }
                </View>
                <TextInput
                    placeholder={'1.支持Markdown\n2.只允许发布IT技术相关问题\n3.认真清晰的提问，问题就解决了一半\n' +
                    '4.避免提问内容全部代码没有说明'}
                    textAlignVertical="top"
                    underlineColorAndroid="transparent"
                    style={[{padding:8, fontSize: gFont.size15, color: gColors.color333,height:gScreen.height*0.4}]}
                    value={this.state.value}
                    multiline={true}
                    onChangeText={value=>this.setState({value},this.validate)}
                />
                <View style={{height:1,backgroundColor:gColors.borderColor}}/>
                <View style={{marginTop:10,flexDirection:'row',justifyContent:'flex-end',paddingRight:10}}>
                    <TouchableOpacity
                        activeOpacity={activeOpacity}
                        onPress={()=>{
                            this.setState({
                                isPublishToTop: true
                            })
                        }}
                        style={{flexDirection:'row',alignItems:'center'}}>
                        <YZCheckbox
                            checked={this.state.isPublishToTop}
                            size={20}
                            onPress={()=>{
                                this.setState({
                                    isPublishToTop: true
                                })
                            }}
                        />
                        <Text style={{marginLeft:4}}>发布至首页</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={activeOpacity}
                        onPress={()=>{
                            this.setState({
                                isPublishToTop: false
                            })
                        }}
                        style={{flexDirection:'row',alignItems:'center',marginLeft:18}}>
                        <YZCheckbox
                            checked={!this.state.isPublishToTop}
                            size={20}
                            onPress={()=>{
                                this.setState({
                                    isPublishToTop: false
                                })
                            }}
                        />
                        <Text style={{marginLeft:4}}>不发布至首页</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
}

const Tag: FC<{item:any, index:number, style?:any, onDeleteTag:any}> = ({item, index, style, onDeleteTag})=>{
    let height = 30;
    return (
        <View style={{paddingTop:8,paddingRight:8,marginTop:8}}>
            <TouchableOpacity
                activeOpacity={1}
                onPress={()=>{

                }}
                style={[{height:height,justifyContent:'center',borderRadius:6,paddingHorizontal:10,backgroundColor:gColors.borderColor,
                    marginLeft:index!==0?8:0},style]}>
                <Text style={{color:gColors.themeColor,fontSize:gFont.size13}}>{item}</Text>
            </TouchableOpacity>
            <TouchableOpacity
                activeOpacity={activeOpacity}
                onPress={()=>{
                    onDeleteTag&&onDeleteTag(item);
                }}
                style={{width: 16, height: 16, borderRadius:8,
                    position:'absolute',right:0,top:0,
                    backgroundColor:gColors.colorRed,justifyContent:'center',alignItems:'center'}}
            >
                <Text style={{fontSize:gFont.size12,color:gColors.bgColorF,fontWeight:'bold'}}>x</Text>
            </TouchableOpacity>
        </View>
    );
}


const styles = StyleSheet.create({
    avator: {
        width:20,
        height:20,
        borderRadius:10,
    }
});
