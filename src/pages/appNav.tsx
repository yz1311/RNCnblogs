import React from 'react';
import {View} from 'react-native';
import {withMappedNavigationProps} from 'react-navigation-props-mapper';
import {withNavigationFocus} from 'react-navigation';
import {
  CardStyleInterpolators,
  createStackNavigator,
} from 'react-navigation-stack';

import YZTabBarView from '../pages/YZTabBarView';
import YZWebPage from '../components/YZWebPage';
import Login from './login/login_index';
import AppEntry from './login/app_entry';
import HomeSearch from '../pages/home/home_search';
import BlogDetail from '../pages/blog/blog_detail';
import BlogCommentList from '../pages/blog/blog_comment_list';
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

const AppNavigation = createStackNavigator(
  {
    YZTabBarView: {
      screen: withMappedNavigationProps(withNavigationFocus(YZTabBarView)),
    },
    YZWebPage: {screen: withMappedNavigationProps(YZWebPage)},
    Login: {screen: withMappedNavigationProps(Login)},
    AppEntry: {screen: withMappedNavigationProps(AppEntry)},
    HomeSearch: {
      screen: withMappedNavigationProps(HomeSearch),
      navigationOptions: {
        cardStyleInterpolator: props =>
          CardStyleInterpolators.forVerticalIOS(props),
      },
    },
    BlogDetail: {screen: withMappedNavigationProps(BlogDetail)},
    BlogCommentList: {screen: withMappedNavigationProps(BlogCommentList)},
    NewsDetail: {screen: withMappedNavigationProps(NewsDetail)},
    NewsCommentList: {screen: withMappedNavigationProps(NewsCommentList)},
    Status: {screen: withMappedNavigationProps(Status)},
    StatusDetail: {screen: withMappedNavigationProps(StatusDetail)},
    StatusAdd: {screen: withMappedNavigationProps(StatusAdd)},
    Bookmark: {screen: withMappedNavigationProps(Bookmark)},
    BookmarkModify: {screen: withMappedNavigationProps(BookmarkModify)},
    QuestionDetail: {screen: withMappedNavigationProps(QuestionDetail)},
    QuestionAdd: {screen: withMappedNavigationProps(QuestionAdd)},
    AnswerCommentList: {screen: withMappedNavigationProps(AnswerCommentList)},
    KnowledgeBaseDetail: {
      screen: withMappedNavigationProps(KnowledgeBaseDetail),
    },
    ProfileSetting: {screen: withMappedNavigationProps(ProfileSetting)},
    ProfileAbout: {screen: withMappedNavigationProps(ProfileAbout)},
    ProfileFontSize: {screen: withMappedNavigationProps(ProfileFontSize)},
    ProfilePerson: {screen: withMappedNavigationProps(ProfilePerson)},
  },
  {
    initialRouteName: 'AppEntry',
    defaultNavigationOptions: ({navigation}) => {
      NavigationHelper.navigation = navigation;
      let params = navigation.state.params;
      let leftTitle;
      if (params) {
        leftTitle = params.leftTitle;
      }
      return {
        headerBackTitle: null, // 左上角返回键文字
        headerTitleAlign: 'center',  //标题的对齐方向，android默认为left，ios默认为center，取代了前面上一层的headerLayoutPreset
        // header:null,
        headerTintColor: gColors.bgColorF,
        headerStyle: {
          backgroundColor: gColors.themeColor,
        },
        //ios默认开启，android默认关闭,现在开启
        gestureEnabled: true,
        cardStack: {
          gestureEnabled: true,
        },
        cardStyleInterpolator: (props)=> CardStyleInterpolators.forHorizontalIOS(props)
      };
    },
  },
);

export default AppNavigation;
