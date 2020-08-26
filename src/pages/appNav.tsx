import React, {Component} from 'react';
import {View, TouchableOpacity, Text} from 'react-native';
import {withMappedNavigationParams} from 'react-navigation-props-mapper';
import {
  createStackNavigator
} from '@react-navigation/stack';
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
import NewsIndex from '../pages/news/news_index';
import RankList from '../pages/discover/rank_list';
import {NavigationBar, Theme} from '@yz1311/teaset';
import {NavigationHelper} from '@yz1311/teaset-navigation';
import Ionicons from "react-native-vector-icons/Ionicons";
import BaseQuestionList from '../pages/question/base_question_list';
import BaseStatusList from '../pages/status/base_status_list';

const Stack = createStackNavigator();

export default class AppNavigation extends Component {
    render() {
        return (
            <Stack.Navigator
                initialRouteName="AppEntry"
                screenOptions={({navigation, route}) => {
                    NavigationHelper.navigation = navigation;
                    let params = route?.params as any;
                    let title, leftTitle, leftAction;
                    if (params) {
                        title = params.title;
                        leftTitle = params.leftTitle;
                        leftAction = params.leftAction;
                    }
                    return {
                        headerShown: false,
                        headerBackTitle: ' ', // 左上角返回键文字
                        //标题的对齐方向，android默认为left，ios默认为center，取代了前面上一层的headerLayoutPreset
                        headerTitleAlign: 'center',
                        headerTitleStyle: {
                            //防止标题过长
                            maxWidth: Theme.deviceWidth / 2,
                            color: Theme.navTintColor,
                        },
                        headerStyle: {
                            backgroundColor: Theme.navColor,
                        },
                        //ios默认开启，android默认关闭,现在开启
                        gestureEnabled: true,
                        gestureResponseDistance: {
                            //默认值50距离太宽了
                            horizontal: 30,
                            //这是默认值
                            vertical: 135,
                        },
                        //5.x版本，必须要设置这个才能android下滑动关闭
                        gestureDirection: 'horizontal',
                        //统一两端的动画效果
                        cardStyleInterpolator: props =>
                            StackViewStyleInterpolator.forHorizontalIOS(props),
                    };
                }}
            >
                <Stack.Screen
                    name="YZTabBarView"
                    component={withMappedNavigationParams()(YZTabBarView)}
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
                        headerShown: false,
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
                    options={({route}) => {
                        const {title} = route?.params || {} as any;
                        return {
                            title: title || '新闻'
                        };
                    }}
                />
                <Stack.Screen
                    name="NewsCommentList"
                    component={withMappedNavigationParams()(NewsCommentList)}
                    options={({route}) => {
                        const {title} = route?.params || {} as any;
                        return {
                            title: `${title ? title + '条' : ''}评论`,
                        };
                    }}
                />
                <Stack.Screen
                    name="Status"
                    component={withMappedNavigationParams()(Status)}
                    options={({route}) => {
                        const {title, rightAction} = route?.params || {} as any;
                        return {
                            title: '闪存',
                            headerRight: () => (
                                <TouchableOpacity
                                    activeOpacity={activeOpacity}
                                    style={{
                                        alignSelf: 'stretch',
                                        justifyContent: 'center',
                                        paddingHorizontal: 8,
                                    }}
                                    onPress={rightAction}>
                                    <Ionicons name="md-add" size={30} color={gColors.bgColorF} />
                                </TouchableOpacity>
                            ),
                        };
                    }}
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
                    options={({route}) => {
                        const {title, rightAction} = route?.params || {} as any;
                        return {
                            title: `${title ? title + '条' : ''}评论`,
                        };
                    }}
                />
                <Stack.Screen
                    name="KnowledgeBaseDetail"
                    component={withMappedNavigationParams()(KnowledgeBaseDetail)}
                    options={({route}) => {
                        const {title, rightAction} = route?.params || {} as any;
                        return {
                            title: title || '知识库',
                        };
                    }}
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
                    name="NewsIndex"
                    component={withMappedNavigationParams()(NewsIndex)}
                />
                <Stack.Screen
                    name="RankList"
                    component={withMappedNavigationParams()(RankList)}
                />
                <Stack.Screen
                    name="StarList"
                    component={withMappedNavigationParams()(StarList)}
                />
                <Stack.Screen
                    name="FollowerList"
                    component={withMappedNavigationParams()(FollowerList)}
                />
                <Stack.Screen
                    name="MessageIndex"
                    component={withMappedNavigationParams()(MessageIndex)}
                />
                <Stack.Screen
                    name="BaseQuestionList"
                    component={withMappedNavigationParams()(BaseQuestionList)}
                />
                <Stack.Screen
                    name="BaseStatusList"
                    component={withMappedNavigationParams()(BaseStatusList)}
                />
            </Stack.Navigator>
        );
    }
}
