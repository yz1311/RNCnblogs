import React, {Component} from 'react';
import {View, TouchableOpacity, Text} from 'react-native';
import {withMappedNavigationParams} from 'react-navigation-props-mapper';
import {
  createStackNavigator
} from '@react-navigation/stack';
import Entypo from 'react-native-vector-icons/Entypo';
import * as StackViewStyleInterpolator from '@react-navigation/stack/src/TransitionConfigs/CardStyleInterpolators';
import YZTabBarView from '../pages/YZTabBarView';
import YZWebPage from '../components/YZWebPage';
import Login from './login/login_index';
import AppEntry from './login/app_entry';
import HomeSearch from '../pages/home/home_search';
import BlogDetail from '../pages/blog/blog_detail';
import BlogCommentList from '../pages/blog/blog_comment_list';
import BaseBlogList from '../pages/blog/base_blog_list';
import NewsDetail from '../pages/news/news_detail';
import NewsCommentList from '../pages/news/news_comment_list';
import Status from '../pages/status/status_index';
import StatusDetail from '../pages/status/status_detail';
import StatusAdd from '../pages/status/status_add';
import Bookmark from '../pages/bookmark/bookmark_index';
import BookmarkModify from './bookmark/bookmark_modify';
import QuestionDetail from '../pages/question/detail/question_detail';
import QuestionAdd from '../pages/question/question_add';
import AnswerCommentList from '../pages/question/detail/answer_comment_list';
import KnowledgeBaseDetail from '../pages/knowledgeBase/knowledgeBase_detail';
import ProfileSetting from './profile/profile_setting';
import ProfileAbout from './profile/profile_about';
import ProfileFontSize from './profile/profile_fontSize';
import ProfilePerson from '../pages/profile/profile_person';
import MessageIndex from '../pages/message/message_index';
import StarList from '../pages/profile/profile_star_list';
import FollowerList from '../pages/profile/profile_follower_list';
import {NavigationBar, Theme} from '@yz1311/teaset';
import {NavigationHelper} from '@yz1311/teaset-navigation';

const Stack = createStackNavigator();

export default class AppNavigation extends Component {
    render() {
        return (
            <Stack.Navigator
                initialRouteName="AppEntry"
                screenOptions={({navigation}) => {
                    NavigationHelper.navigation = navigation;
                    let params = navigation.route?.params;
                    let leftTitle, leftAction;
                    if (params) {
                        leftTitle = params.leftTitle;
                        leftAction = params.leftAction;
                    }
                    return {
                        // header: () => null,
                        headerLeft: (props: any) => (
                            <TouchableOpacity
                                activeOpacity={activeOpacity}
                                style={{
                                    paddingLeft: 9,
                                    paddingRight: 8,
                                    alignSelf: 'stretch',
                                    justifyContent: 'center',
                                }}
                                onPress={() => {
                                    leftAction ? leftAction() : navigation.goBack();
                                }}>
                                <Entypo name={'chevron-thin-left'} size={23} color={gColors.bgColorF}/>
                            </TouchableOpacity>
                        ),
                        // headerTitle: params?.headerTitle || params?.title || '',
                        headerMode: 'screen',
                        headerBackTitle: ' ', // 左上角返回键文字
                        headerTitleAlign: 'center',  //标题的对齐方向，android默认为left，ios默认为center，取代了前面上一层的headerLayoutPreset
                        headerTintColor: gColors.color0,
                        headerTitleStyle: {
                            //防止标题过长
                            maxWidth: Theme.deviceWidth / 2,
                            color: gColors.bgColorF,
                        },
                        headerStyle: {
                            backgroundColor: Theme.navColor,
                        },
                        //ios默认开启，android默认关闭,现在开启
                        gestureEnabled: true,
                        //5.x版本，必须要设置这个才能android下滑动关闭
                        gestureDirection: 'horizontal',
                        cardStack: {
                            gestureEnabled: true,
                        },
                        cardStyleInterpolator: (props) => StackViewStyleInterpolator.forHorizontalIOS(props)
                    };
                }}
            >
                <Stack.Screen
                    name="YZTabBarView"
                    component={withMappedNavigationParams()(YZTabBarView)}
                    options={{
                        header: () => null
                    }}
                />
                <Stack.Screen
                    name="YZWebPage"
                    component={withMappedNavigationParams()(YZWebPage)}
                />
                <Stack.Screen
                    name="Login"
                    component={withMappedNavigationParams()(Login)}
                />
                <Stack.Screen
                    name="AppEntry"
                    component={withMappedNavigationParams()(AppEntry)}
                />
                <Stack.Screen
                    name="HomeSearch"
                    component={withMappedNavigationParams()(HomeSearch)}
                    options={props => ({
                        cardStyleInterpolator: (props) => StackViewStyleInterpolator.forVerticalIOS(props)
                    })}
                />
                <Stack.Screen
                    name="BlogDetail"
                    component={withMappedNavigationParams()(BlogDetail)}
                />
                <Stack.Screen
                    name="BlogCommentList"
                    component={withMappedNavigationParams()(BlogCommentList)}
                />
                <Stack.Screen
                    name="BaseBlogList"
                    component={withMappedNavigationParams()(BaseBlogList)}
                />
                <Stack.Screen
                    name="NewsDetail"
                    component={withMappedNavigationParams()(NewsDetail)}
                />
                <Stack.Screen
                    name="NewsCommentList"
                    component={withMappedNavigationParams()(NewsCommentList)}
                />
                <Stack.Screen
                    name="Status"
                    component={withMappedNavigationParams()(Status)}
                />
                <Stack.Screen
                    name="StatusDetail"
                    component={withMappedNavigationParams()(StatusDetail)}
                />
                <Stack.Screen
                    name="StatusAdd"
                    component={withMappedNavigationParams()(StatusAdd)}
                />
                <Stack.Screen
                    name="Bookmark"
                    component={withMappedNavigationParams()(Bookmark)}
                />
                <Stack.Screen
                    name="BookmarkModify"
                    component={withMappedNavigationParams()(BookmarkModify)}
                />
                <Stack.Screen
                    name="QuestionDetail"
                    component={withMappedNavigationParams()(QuestionDetail)}
                />
                <Stack.Screen
                    name="QuestionAdd"
                    component={withMappedNavigationParams()(QuestionAdd)}
                />
                <Stack.Screen
                    name="AnswerCommentList"
                    component={withMappedNavigationParams()(AnswerCommentList)}
                />
                <Stack.Screen
                    name="KnowledgeBaseDetail"
                    component={withMappedNavigationParams()(KnowledgeBaseDetail)}
                />
                <Stack.Screen
                    name="ProfileSetting"
                    component={withMappedNavigationParams()(ProfileSetting)}
                />
                <Stack.Screen
                    name="ProfileAbout"
                    component={withMappedNavigationParams()(ProfileAbout)}
                />
                <Stack.Screen
                    name="ProfileFontSize"
                    component={withMappedNavigationParams()(ProfileFontSize)}
                />
                <Stack.Screen
                    name="ProfilePerson"
                    component={withMappedNavigationParams()(ProfilePerson)}
                />
                <Stack.Screen
                    name="StarList"
                    component={withMappedNavigationParams()(StarList)}
                    options={{
                        title: '关注'
                    }}
                />
                <Stack.Screen
                    name="FollowerList"
                    component={withMappedNavigationParams()(FollowerList)}
                    options={{
                        title: '粉丝'
                    }}
                />
                <Stack.Screen
                    name="MessageIndex"
                    component={withMappedNavigationParams()(MessageIndex)}
                    options={{
                        title: '消息中心'
                    }}
                />
            </Stack.Navigator>
        );
    }
}
