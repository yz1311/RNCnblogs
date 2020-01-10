import React, {Component, PureComponent} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Text,
  Alert,
} from 'react-native';
import {connect} from 'react-redux';
import YZStateView from '../../components/YZStateCommonView';
import YZFlatList from '../../components/YZFlatList';
import Styles from '../../common/styles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PropTypes from 'prop-types';
import StringUtils from '../../utils/stringUtils';
import moment from 'moment';
import {deleteBookmark} from '../../actions/bookmark/bookmark_index_actions';
import {Overlay, Label, ListRow} from '@yz1311/teaset';
import {BorderShadow} from '@yz1311/react-native-shadow';
import {setSelectedQuestion} from '../../actions/question/question_detail_actions';
import {setSelectedDetail} from '../../actions/news/news_index_actions';
import {blogSchema, newsSchema, tables} from '../../common/database';
import {sagaActionToAction} from '../../utils/reduxUtils';
// import Realm from 'realm';
const Realm = {};
import {NavigationScreenProp, NavigationState} from 'react-navigation';
import {ReduxState} from '../../reducers';

interface IProps {
  userInfo?: any;
  dispatch?: any;
  setSelectedQuestionFn?: any;
  setSelectedDetailFn?: any;
  deleteBookmarkFn?: any;
  navigation: NavigationScreenProp<NavigationState>;
  item: bookmark;
  clickable?: boolean;
}

export interface bookmark {
  WzLinkId: string;
  LinkUrl: string;
  Title: string;
  Summary: string;
  DateAdded: string;
  postDate: string;
  postDateDesc: string;
  commentCount: number;
  Tags: Array<string>;
}

@(connect(
  (state: ReduxState) => ({
    userInfo: state.loginIndex.userInfo,
  }),
  dispatch => ({
    dispatch,
    setSelectedQuestionFn: data => dispatch(setSelectedQuestion(data)),
    setSelectedDetailFn: data => dispatch(setSelectedDetail(data)),
    deleteBookmarkFn: data => dispatch(deleteBookmark(data)),
  }),
) as any)
export default class bookmark_item extends PureComponent<IProps, {}> {
  static defaultProps = {
    clickable: true,
  };

  overlayKey = undefined;

  private fromView: any;

  _onModify = () => {
    Overlay.hide(this.overlayKey);
    const {item} = this.props;
    this.props.navigation.navigate('BookmarkModify', {
      item: item,
      isModify: true,
      title: '修改收藏',
    });
  };

  _onDelete = () => {
    Overlay.hide(this.overlayKey);
    Alert.alert('', '是否删除该条收藏?', [
      {
        text: '取消',
      },
      {
        text: '删除',
        onPress: () => {
          const {deleteBookmarkFn, item} = this.props;
          deleteBookmarkFn({
            request: {
              id: item.WzLinkId,
            },
          });
        },
      },
    ]);
  };

  showMenu = () => {
    this.fromView.measureInWindow((x, y, width, height) => {
      let popoverStyle = {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        paddingTop: 8,
        paddingBottom: 8,
        // paddingLeft: 12,
        paddingRight: 12,
      };
      y += __IOS__ ? 0 : 15;
      let fromBounds = {x, y, width, height};
      let overlayView = (
        <Overlay.PopoverView
          popoverStyle={popoverStyle}
          fromBounds={fromBounds}
          direction="left"
          align="start"
          directionInsets={4}
          onCloseRequest={() => {
            Overlay.hide(this.overlayKey);
            this.overlayKey = null;
          }}
          showArrow={true}>
          <ListRow
            style={{backgroundColor: 'transparent', width: 100}}
            titleStyle={{color: gColors.bgColorF, textAlign: 'center'}}
            title="修改"
            onPress={this._onModify}
          />
          <ListRow
            style={{backgroundColor: 'transparent', width: 100}}
            titleStyle={{color: gColors.colorRed, textAlign: 'center'}}
            bottomSeparator={null}
            title="删除"
            onPress={this._onDelete}
          />
        </Overlay.PopoverView>
      );
      this.overlayKey = Overlay.show(overlayView);
    });
  };

  _onPress = async () => {
    const {item, userInfo} = this.props;
    //根据链接类型，跳转到对应的本地页面，而不是打开网页
    //博问
    if (/q\.cnblogs\.com\/q\//.test(item.LinkUrl)) {
      let Qid = '0';
      let matches = (item.LinkUrl || '').match(/q\/\d+?(\/){0,1}$/);
      if (matches && matches.length > 0) {
        Qid = matches[0].replace('q/', '').replace('/', '');
      }
      this.props.setSelectedQuestionFn({
        Qid: Qid,
        Url: item.LinkUrl,
        QuestionUserInfo: {
          // UserID: userInfo.SpaceUserID,
        },
      });
      this.props.navigation.navigate('QuestionDetail', {});
    }
    //知识库
    else if (/kb\.cnblogs\.com\//.test(item.LinkUrl)) {
      let id = '0';
      let matches = (item.LinkUrl || '').match(/\/\d+?(\/){0,1}$/);
      if (matches && matches.length > 0) {
        id = matches[0].replace('/', '');
      }
      this.props.navigation.navigate('KnowledgeBaseDetail', {
        item: {
          Title: item.Title,
          //暂时没有下面两个字段
          Author: '',
          PostDate: '',
          Url: item.LinkUrl,
          Id: id,
        },
      });
    }
    //新闻
    else if (/news\.cnblogs\.com\//.test(item.LinkUrl)) {
      let id = '0';
      let matches = (item.LinkUrl || '').match(/\/\d+?(\/){0,1}$/);
      if (matches && matches.length > 0) {
        id = matches[0].replace('/', '');
      }
      let selectedItem = {
        Title: item.Title,
        //暂时没有下面两个字段
        DateAdded: '',
        CommentCount: 0,
        Url: item.LinkUrl,
        Id: id,
      };
      let realm;
      try {
        const realm = await Realm.open({schema: [newsSchema]});
        let blogs = realm.objects(tables.news);
        let curNews: any = blogs.filtered(`id = "${selectedItem.Id}"`);
        if (curNews != undefined && curNews.length > 0) {
          console.log('curNews[0]');
          console.log(curNews[0]);
          selectedItem = {
            ...selectedItem,
            DateAdded: curNews[0].postDate,
            CommentCount: curNews[0].commentCount,
          };
        }
      } catch (e) {
        console.log(e);
      } finally {
        if (realm) {
          realm.close();
        }
      }
      this.props.setSelectedDetailFn(selectedItem);
      this.props.navigation.navigate('NewsDetail', {
        item: selectedItem
      });
    } else {
      let id = '0',
        blogApp = '';
      let matches = (item.LinkUrl || '').match(/\/\d+?\.html/);
      if (matches && matches.length > 0) {
        id = matches[0].replace('.html', '').replace('/', '');
      }
      matches = (item.LinkUrl || '').match(/com\/[\s\S]+?\//);
      if (matches && matches.length > 0) {
        blogApp = matches[0].replace('com/', '').replace('/', '');
      }
      let selectedItem = {
        Title: item.Title,
        //Tddo:暂时没有下面三个字段
        Author: '',
        PostDate: '',
        CommentCount: 0,
        Url: item.LinkUrl,
        Id: id,
        BlogApp: blogApp,
      };
      //本地查找数据，尝试填充那三个字段
      let realm;
      try {
        realm = await Realm.open({schema: [blogSchema]});
        let blogs = realm.objects(tables.blog);
        let curBlogs = blogs.filtered(`id = "${selectedItem.Id}"`);
        if (curBlogs != undefined && curBlogs.length > 0) {
          selectedItem = {
            ...selectedItem,
            Author: curBlogs[0].author,
            PostDate: curBlogs[0].postDate,
            CommentCount: curBlogs[0].commentCount,
          };
        }
      } catch (e) {
        console.log(e);
      } finally {
        if (realm) {
          realm.close();
        }
      }
      NavigationHelper.push('BlogDetail', {
        item: item,
      });
    }
    // this.props.navigation.navigate('YZWebPage',{
    //     uri: item.LinkUrl,
    //     title: '详情'
    // });
  };

  render() {
    const {item} = this.props;
    return (
      <BorderShadow
        setting={{width: gScreen.width, border: 3, color: gColors.color999}}>
        <TouchableOpacity
          activeOpacity={activeOpacity}
          onPress={() => {
            if (this.props.clickable) {
              this._onPress();
            }
          }}>
          <View
            style={{
              backgroundColor: gColors.bgColorF,
              paddingBottom: 10,
              paddingLeft: 8,
            }}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text
                style={{
                  color: gColors.color0,
                  fontSize: gFont.size16,
                  fontWeight: 'bold',
                  paddingVertical: 17,
                  flex: 1,
                }}>
                {item.Title}
              </Text>
              <TouchableOpacity
                ref={ref => (this.fromView = ref)}
                activeOpacity={activeOpacity}
                style={{
                  paddingTop: 17,
                  paddingHorizontal: 10,
                  paddingLeft: 17,
                  alignSelf: 'stretch',
                }}
                onPress={this.showMenu}>
                <Ionicons name="ios-more" size={25} color={gColors.color0} />
              </TouchableOpacity>
            </View>
            <Text
              style={{
                color: gColors.color4c,
                fontSize: gFont.sizeDetail,
                marginVertical: 7,
              }}>
              {item.LinkUrl}
            </Text>
            <Text
              style={{
                color: gColors.color999,
                fontSize: gFont.size12,
                marginRight: 10,
                alignSelf: 'flex-end',
              }}>
              {item.postDateDesc}
            </Text>
          </View>
        </TouchableOpacity>
      </BorderShadow>
    );
  }
}

const styles = StyleSheet.create({
  avator: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
});
