import React, {Component} from 'react';
import {Alert, DeviceEventEmitter, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View,} from 'react-native';
import {Styles} from '../../common/styles';
import Entypo from 'react-native-vector-icons/Entypo';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import {IBaseDataPageProps,} from '../../components/YZBaseDataPage';
import {connect} from 'react-redux';
import HomeTabBar from './home_indexTab';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import SearchBlogList from '../blog/base_blog_list';
import SearchNewsList from '../news/base_news_list';
import SearchQuestionList from '../question/base_question_list';
import SearchStatusList from '../status/base_status_list';
import PropTypes from 'prop-types';
import {ReduxState} from '../../reducers';
import {BlogTypes} from "./home_index";
import {NewsTypes} from "../news/news_index";
import {Theme} from "@yz1311/teaset";
import {QuestionTypes} from "../question/question_index";
import {StatusTypes} from "../status/status_index";


export interface SearchParams {
  //浏览数，以上
  ViewCount: number,
  //推荐数，以上
  DiggCount: number,
  DateTimeRange: 'OneWeek'|'OneMonth'|'ThreeMonth'|'OneYear'|'Customer',
  from: string,
  to: string
}

const __ANDROID__ = Platform.OS === 'android';
const LeftItem = ({onPress, type, leftTitle}) => {
  const arrowColor = type == 'default' ? gColors.colorDarkPurple2 : '#fff';
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      style={styles.leftItem}
      onPress={onPress}>
      {(leftTitle && (
        <Text
          style={{
            fontSize: gFont.size15,
            color: gColors.themeColor,
            marginLeft: gMargin,
          }}>{`${leftTitle}`}</Text>
      )) || (
        <Entypo
          style={{}}
          name="chevron-thin-left"
          size={23}
          color={gColors.bgColorF}
        />
      )}
    </TouchableOpacity>
  );
};

interface IProps extends IBaseDataPageProps {
  type: string;
  initialPage?: number;
}

interface IState {
  keyword: string;
  showHistory: boolean;
  searchHistory: Array<any>;
  tabNames: Array<string>;
}

@(connect(
  (state: ReduxState) => ({}),
  dispatch => ({
  }),
) as any)
export default class home_search extends Component<IProps, IState> {
  static navigationOptions = ({navigation}) => {
    return {
      headerShown: false,
    };
  };

  static propTypes = {
    //搜索页面类型
    type: PropTypes.string,
  };

  static defaultProps = {
    type: 'default',
  };
  private storage_key: string;
  private page = 1;
  private textInput: any;
  private _scrollableTabView: any;
  private tabBar: any;

  constructor(props) {
    super(props);
    this.state = {
      keyword: '',
      showHistory: true,
      searchHistory: [],
      tabNames: ['博客', '新闻', '博问', '闪存'],
    };
    this.storage_key = props.type + '_searchHistory';
  }

  getParams = () => {
    let params = {
      request: {
        pageNum: this.page,
        pageSize: 10,
        keywords: undefined,
      },
      type: this.props.type,
    };
    if (this.state.keyword && this.state.keyword !== '') {
      params = {
        ...params,
        request: {
          ...params.request,
          keywords: this.state.keyword,
        },
      };
    }
    return params;
  };

  componentDidMount() {
    this.loadSearchHistory();
  }

  loadSearchHistory = async () => {
    let history = (await gStorage.load(this.storage_key)) || [];
    this.setState({
      searchHistory: history,
    });
  };

  loadData = () => {
    DeviceEventEmitter.emit('search_blog_list_reload');
    DeviceEventEmitter.emit('search_news_list_reload');
    DeviceEventEmitter.emit('search_question_list_reload');
    DeviceEventEmitter.emit('search_kb_list_reload');
  };

  onSearch = () => {
    this.setState(
      {
        showHistory: false,
      },
      () => {
        this.page = 1;
        setTimeout(() => {
          this.loadData();
        }, 0);
      },
    );
  };

  onChangeText = text => {
    this.setState({
      keyword: text,
      showHistory: true,
    });
    this.loadSearchHistory();
  };

  _onSubmitEditing = () => {
    this.onSearch();
  };

  _onChangeTab = obj => {
    switch (obj.i) {
      case 0:
        break;
      case 1: //eslint-disable-line
        break;
      case 2:
        break;
    }
  };

  renderHeader = () => {
    return (
      <View>
        <View style={[styles.header]}>
          <LeftItem
            onPress={() => {
              this.props.navigation.goBack();
            }}
            type={''}
            leftTitle={''}
          />
          <View style={[styles.textInputWrapper]}>
            <EvilIcons
              style={[styles.icon, {marginLeft: 5}]}
              name="search"
              size={24}
              color={gColors.color333}
            />
            <TextInput
              ref={input => (this.textInput = input)}
              style={[styles.textInput]}
              placeholder="搜索"
              autoFocus
              underlineColorAndroid="transparent"
              placeholderTextColor={gColors.color999}
              onChangeText={this.onChangeText}
              blurOnSubmit={false}
              onSubmitEditing={this._onSubmitEditing}
              value={this.state.keyword}
              returnKeyType="search"
            />
          </View>
          <TouchableOpacity
            activeOpacity={activeOpacity}
            onPress={() => this.onSearch()}
            style={[styles.cancelButtonWrapper]}>
            <Text style={[styles.cancelButtonText]}>搜索</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  renderNoContent = () => {
    const {searchHistory} = this.state;
    console.log(searchHistory);
    return (
      <View
        style={{
          flex: 1,
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
        }}>
        <View style={{height: 10, backgroundColor: gColors.bgColorF}} />
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: gColors.bgColorF,
            alignItems: 'center',
            height: 40,
            paddingLeft: 14,
            borderBottomWidth: 1,
            borderBottomColor: gColors.color999,
          }}>
          <Text
            style={{color: gColors.color999, fontSize: gFont.size15, flex: 1}}>
            {'历史搜索'}
          </Text>
          <TouchableOpacity
            activeOpacity={activeOpacity}
            style={{
              flexDirection: 'row',
              paddingRight: 10,
              alignSelf: 'stretch',
              alignItems: 'center',
            }}
            onPress={async () => {
              Alert.alert(
                '提示',
                '是否清空搜索历史?',
                [
                  {
                    text: '取消',
                  },
                  {
                    text: '清空',
                    onPress: async () => {
                      await gStorage.remove(this.storage_key);
                      this.setState({
                        searchHistory: [],
                      });
                    },
                  },
                ],
                {cancelable: false},
              );
            }}>
            <Text style={{color: gColors.themeColor, fontSize: gFont.size15}}>
              清空
            </Text>
            <EvilIcons
              style={[styles.icon, {marginLeft: 4}]}
              name="trash"
              size={24}
              color={gColors.themeColor}
            />
          </TouchableOpacity>
        </View>
        <View
          style={{
            flex: 1,
            backgroundColor: gColors.backgroundColor,
            paddingHorizontal: 10,
            flexDirection: 'row',
            flexWrap: 'wrap',
          }}>
          {searchHistory.map((x, index) => {
            return (
              <TouchableOpacity
                key={index}
                activeOpacity={activeOpacity}
                onPress={() => {
                  this.setState(
                    {
                      keyword: x,
                    },
                    this.onSearch,
                  );
                }}
                style={{
                  marginTop: 16,
                  justifyContent: 'center',
                  borderRadius: 12,
                  marginRight: 20,
                  backgroundColor: '#dbdcdd',
                  height: 30,
                  paddingHorizontal: 12,
                }}>
                <Text style={{color: '#585859', fontSize: gFont.size13}}>
                  {x}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  render() {
    return (
      <View style={[Styles.container]}>
        <View
          style={{
            position: 'absolute',
            width: gScreen.width,
            height: gScreen.statusBarHeight,
            backgroundColor: Theme.primaryColor,
          }}
        />
        {this.renderHeader()}
        <View style={{flex: 1}}>
          <ScrollableTabView
            ref={ref => (this._scrollableTabView = ref)}
            renderTabBar={() => (
              <HomeTabBar
                ref={bar => (this.tabBar = bar)}
                containerStyle={{backgroundColor: Theme.primaryColor}}
                tabDatas={this.state.tabNames}
              />
            )}
            tabBarPosition="top"
            initialPage={this.props.initialPage || 0}
            scrollWithoutAnimation={true}
            locked={false}
            onChangeTab={this._onChangeTab}>
            <SearchBlogList
              navigation={this.props.navigation}
              keyword={this.state.keyword}
              tabIndex={0}
              blogType={BlogTypes.搜索}
            />
            <SearchNewsList
              navigation={this.props.navigation}
              keyword={this.state.keyword}
              newsType={NewsTypes.搜索}
            />
            <SearchQuestionList
              keyword={this.state.keyword}
              questionType={QuestionTypes.搜索}
            />
            <SearchStatusList
              navigation={this.props.navigation}
              keyword={this.state.keyword}
              statusType={StatusTypes.搜索}
            />
          </ScrollableTabView>
          {this.state.showHistory ? this.renderNoContent() : null}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    //2018/04/09 由于有SafeAreaView的存在，所以现在不采用paddingTop的方式了
    height: __ANDROID__ ? 50 : 44 + gScreen.statusBarHeight,
    // width: screenW,
    paddingTop: __ANDROID__ ? 0 : gScreen.statusBarHeight,
    backgroundColor: Theme.primaryColor,
    flexDirection: 'row',
    // justifyContent: 'center',
    // alignItems: 'center',
  },
  leftItem: {
    // position: 'absolute',
    // top: isAndroid ? 0 : gScreen.statusBarHeight,
    // left: 0,
    height: __ANDROID__ ? 50 : 44,
    width: 50,
    paddingLeft: 6,
    paddingRight: 7,
    justifyContent: 'center',
  },
  textInputWrapper: {
    alignSelf: 'center',
    backgroundColor: gColors.bgColorF,
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    borderRadius: 17.5,
    paddingHorizontal: 13,
  },
  icon: {
    // backgroundColor:gColors.bgColorF,
  },
  textInput: {
    flex: 1,
    height: gScreen.isAndroid ? 42 : 38,
    fontSize: gFont.size13,
    // backgroundColor:gColors.bgColorF,
    marginLeft: 3,
  },
  cancelButtonWrapper: {
    alignSelf: 'stretch',
    justifyContent: 'center',
    paddingLeft: 8,
  },
  cancelButtonText: {
    color: gColors.bgColorF,
    marginHorizontal: 8,
  },
});
