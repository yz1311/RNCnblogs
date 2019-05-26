import React, {Component} from 'react'
import {
    DeviceEventEmitter, EmitterSubscription,
    StyleSheet, TouchableOpacity,
    View,
} from 'react-native'
import {connect} from 'react-redux';
import YZHeader from '../../components/YZHeader';
import Styles from '../../common/styles';
import Feather from 'react-native-vector-icons/Feather';
import ScrollableTabView,{ScrollableTabBar} from 'react-native-scrollable-tab-view';
import FollowStatusList from './list/follow_status_list';
import MyStatusList from './list/my_status_list';
import MyCommentStatusList from './list/myComment_status_list';
import RecentCommentStatusList from './list/recentComment_status_list';
import MentionStatusList from './list/mention_status_list';
import CommentStatusList from './list/comment_status_list';
import AllStatusList from './list/all_status_list';
import Ionicons from "react-native-vector-icons/Ionicons";
import ActionButton from 'react-native-action-button';
import {ReduxState} from "../../reducers";
import {NavigationScreenProp, NavigationState} from "react-navigation";

interface IProps extends IReduxProps{
    navigation: NavigationScreenProp<NavigationState>,
    initialPage?: number,
    tabNames?: Array<string>,
    isLogin?: boolean,
    tabIndex: number
}

interface IState {
    tabNames: Array<string>,
    isActionButtonVisible: boolean
}

@connect((state:ReduxState)=>({
    isLogin: state.loginIndex.isLogin
}),dispatch=>({
    dispatch,
}))
export default class status_index extends Component<IProps,IState> {
    static navigationOptions = ({navigation})=>{
        const {state} = navigation;
        const {rightAction} = state.params || {rightAction: undefined};
        return {
          title: '闪存',
            headerRight: (
                <TouchableOpacity
                    activeOpacity={activeOpacity}
                    style={{alignSelf:'stretch',justifyContent:'center',paddingHorizontal:8}}
                    onPress={rightAction}
                >
                    <Ionicons name="md-add" size={30} color={gColors.bgColorF} />
                </TouchableOpacity>
            )
        };
    }

    private toggleActionButtonListener:EmitterSubscription;
    private tabBar:any;

    constructor(props)
    {
        super(props);
        this.state = {
            tabNames: ['全站', '我回应','关注', '我的', '新回应', '提到我', '回复我'],
            isActionButtonVisible: true
        };
        this.toggleActionButtonListener = DeviceEventEmitter.addListener('toggleActionButton',(state)=>{
            this.setState({
                isActionButtonVisible: state || false
            });
        });
    }

    componentDidMount() {
        this.props.navigation.setParams({
            rightAction: ()=>{
                this.props.navigation.navigate('StatusAdd');
            }
        });
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this.toggleActionButtonListener&&this.toggleActionButtonListener.remove();
    }

    _onChangeTab = obj => {
        DeviceEventEmitter.emit('toggleActionButton', true);
        switch (obj.i)
        {
            case 0:

                break;
            case 1:    //eslint-disable-line

                break;
            case 2:

                break;
        }
    }

    render() {
        const {tabNames} = this.state;
        return (
            <View
                style={[Styles.container]}>
                {__IOS__?<View style={{height:gScreen.statusBarHeight,backgroundColor:gColors.themeColor}}/>:null}
                <ScrollableTabView
                    renderTabBar={() =>
                        <ScrollableTabBar
                            ref={bar=>this.tabBar = bar}
                            tabDatas={tabNames}
                            style={{
                                backgroundColor: gColors.themeColor
                            }}
                        />
                    }
                    tabBarPosition='top'
                    initialPage={this.props.initialPage || 0}
                    scrollWithoutAnimation={true}
                    locked={false}
                    onChangeTab={this._onChangeTab}
                >
                    <AllStatusList tabLabel="全站" navigation={this.props.navigation} tabIndex={this.props.tabIndex}/>
                    <RecentCommentStatusList tabLabel="新回应" navigation={this.props.navigation} tabIndex={this.props.tabIndex}/>
                    <FollowStatusList tabLabel="关注" navigation={this.props.navigation} tabIndex={this.props.tabIndex}/>
                    <MyStatusList tabLabel="我的" navigation={this.props.navigation} tabIndex={this.props.tabIndex}/>
                    <MyCommentStatusList tabLabel="我回应" navigation={this.props.navigation} tabIndex={this.props.tabIndex}/>
                    <MentionStatusList tabLabel="提到我" navigation={this.props.navigation} tabIndex={this.props.tabIndex}/>
                    <CommentStatusList tabLabel="回复我" navigation={this.props.navigation} tabIndex={this.props.tabIndex}/>
                </ScrollableTabView>
                {this.state.isActionButtonVisible?
                    <ActionButton buttonColor="rgba(231,76,60,1)"
                                  hideShadow={true}
                                  onPress={() => {
                                      if(!this.props.isLogin)
                                      {
                                          NavigationHelper.navigate('Login');
                                      }
                                      else
                                      {
                                          this.props.navigation.navigate('StatusAdd');
                                      }
                                  }}
                    >
                    </ActionButton>
                    :null}
            </View>
        )
    }
}


const styles = StyleSheet.create({

});
