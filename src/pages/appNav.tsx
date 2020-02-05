import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import {withMappedNavigationProps} from 'react-navigation-props-mapper';
import {withNavigationFocus} from 'react-navigation';
import {
  CardStyleInterpolators,
  createStackNavigator,
} from 'react-navigation-stack';
import Entypo from 'react-native-vector-icons/Entypo';

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

const AppNavigation = createStackNavigator(
  {
    YZTabBarView: {
      screen: withMappedNavigationProps(withNavigationFocus(YZTabBarView)),
      // navigationOptions: {
      //   cardStyleInterpolator: props =>
      //     CardStyleInterpolators.forNoAnimation(),
      // }
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
    BaseBlogList: {screen: withMappedNavigationProps(BaseBlogList)},
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
    StarList: {screen: withMappedNavigationProps(StarList), navigationOptions: {headerTitle: '关注'}},
    FollowerList: {screen: withMappedNavigationProps(FollowerList), navigationOptions: {headerTitle: '粉丝'}},
    MessageIndex: {screen: withMappedNavigationProps(MessageIndex),navigationOptions: {headerTitle: '消息中心'}},
  },
  {
    initialRouteName: 'AppEntry',
    //@ts-ignore
    defaultNavigationOptions: ({navigation}) => {
      NavigationHelper.navigation = navigation;
      let params = navigation.state.params;
      let leftTitle;
      if (params) {
        leftTitle = params.leftTitle;
      }
      const leftView = (
        <TouchableOpacity
          activeOpacity={activeOpacity}
          style={{
            paddingLeft: 9,
            paddingRight: 8,
            alignSelf: 'stretch',
            justifyContent: 'center',
          }}
          onPress={() => {
            navigation.goBack();
          }}>
          <Entypo name={'chevron-thin-left'} size={23} color={gColors.bgColorF} />
        </TouchableOpacity>
      );
      return {
        // header: props => {
        //   let options = props.scene.descriptor.options;
        //   return (
        //     <NavigationBar
        //       style={{position: 'relative', paddingLeft: 0}}
        //       // type={'ios'}
        //       title={
        //         options?.headerTitle
        //         ||
        //         navigation.state.params?.title
        //         ||
        //         ''
        //       }
        //       leftView={options?.headerLeft || leftView}
        //     />
        //   );
        // },
        headerLeft: leftView,
        headerTitle: params?.headerTitle || params?.title || '',
        headerBackTitle: ' ', // 左上角返回键文字
        headerTitleAlign: 'center',  //标题的对齐方向，android默认为left，ios默认为center，取代了前面上一层的headerLayoutPreset
        // header:null,
        headerTintColor: gColors.bgColorF,
        headerTitleStyle: {
          //防止标题过长
          maxWidth: Theme.deviceWidth/2
        },
        headerStyle: {
          backgroundColor: Theme.navColor,
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
