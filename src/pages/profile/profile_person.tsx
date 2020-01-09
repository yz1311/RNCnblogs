import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  DeviceEventEmitter,
  InteractionManager,
  RefreshControl,
} from 'react-native';
import Styles from '../../common/styles';
import {ListRow} from '@yz1311/teaset';
import {connect} from 'react-redux';
import {
  getPersonInfo,
  clearPersonInfo,
  getPersonSignature,
  getPersonBlogList,
  clearPersonBlogList,
} from '../../actions/profile/profile_index_actions';
import Entypo from 'react-native-vector-icons/Entypo';
import PropTypes from 'prop-types';
import YZBaseDataPage, {
  IBaseDataPageProps,
} from '../../components/YZBaseDataPage';
import YZStateView from '../../components/YZStateCommonView';
import YZFlatList from '../../components/YZFlatList';
import BlogItem from '../blog/blog_item';
import CommonUtils from '../../utils/commonUtils';
import {ReduxState} from '../../reducers';

const avatorRadius = 40;

interface IProps extends IBaseDataPageProps {
  userAlias: string;
  getPersonInfoFn?: any;
  clearPersonInfoFn?: any;
  getPersonSignatureFn?: any;
  personInfo: any;
  avatorUrl: string;
  getPersonInfoResult?: any;
  dataList?: Array<any>;
  noMore?: boolean;
}

interface IState {
  isRefreshing: boolean;
}

@(connect(
  (state: ReduxState) => ({
    userInfo: state.loginIndex.userInfo,
    personInfo: state.profileIndex.personInfo,
    getPersonInfoResult: state.profileIndex.getPersonInfoResult,
    dataList: state.blogIndex.personBlogList,
    noMore: state.blogIndex.personBlogList_noMore,
    loadDataResult: state.blogIndex.getPersonBlogListResult,
    isLogin: state.loginIndex.isLogin,
  }),
  dispatch => ({
    dispatch,
    getPersonInfoFn: data => dispatch(getPersonInfo(data)),
    clearPersonInfoFn: data => dispatch(clearPersonInfo(data)),
    getPersonSignatureFn: data => dispatch(getPersonSignature(data)),
    loadDataFn: data => dispatch(getPersonBlogList(data)),
    clearDataFn: data => dispatch(clearPersonBlogList(data)),
  }),
) as any)
export default class profile_person extends YZBaseDataPage<IProps, IState> {
  static propTypes = {
    userAlias: PropTypes.string.isRequired,
    avatorUrl: PropTypes.string.isRequired,
  };

  static navigationOptions = ({navigation}) => {
    let {title} = (navigation.state || {}).params || {title: undefined};
    return {
      title: title || '园友',
    };
  };

  pageIndex = 1;
  private namePositionY;

  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      isRefreshing: false,
    };
  }

  getParams = () => {
    const params = {
      request: {
        blogApp: this.props.userAlias,
        pageIndex: this.pageIndex,
      },
    };
    return params;
  };

  componentDidMount() {
    super.componentDidMount();
    this.getPersonInfo();
  }

  getPersonInfo = () => {
    this.props.getPersonInfoFn({
      request: {
        userAlias: this.props.userAlias,
      },
    });
  };

  componentWillReceiveProps(nextProps, nextContext) {
    if (this.props.loadDataResult !== nextProps.loadDataResult) {
      this.setState({
        isRefreshing: false,
      });
    }
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    this.props.clearPersonInfoFn();
  }

  _renderHeader = () => {
    const {personInfo, avatorUrl} = this.props;
    return (
      <YZStateView
        getResult={this.props.getPersonInfoResult}
        placeholderTitle="暂无数据"
        errorButtonAction={this.getPersonInfo}>
        <View
          style={{paddingTop: avatorRadius, borderRadius: 10, marginTop: 16}}>
          <View
            style={{
              paddingHorizontal: 8,
              paddingTop: avatorRadius,
              paddingBottom: 15,
              backgroundColor: gColors.bgColorF,
            }}>
            <View>
              <Text
                style={{
                  fontSize: gFont.size24,
                  fontWeight: 'bold',
                  marginTop: 10,
                }}>
                {personInfo.nickName}
              </Text>
              <View
                onLayout={({nativeEvent}) => {
                  this.namePositionY =
                    nativeEvent.layout.y + nativeEvent.layout.height;
                }}
                style={{flexDirection: 'row', marginTop: 10}}>
                <View
                  style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                  <Text style={styles.title}>园龄：</Text>
                  <Text style={styles.titleDesc}>{personInfo.age}</Text>
                </View>
                <View
                  style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                  <Text style={styles.title}>关注：</Text>
                  <Text style={styles.titleDesc}>{personInfo.stars}</Text>
                </View>
                <View
                  style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                  <Text style={styles.title}>粉丝：</Text>
                  <Text style={styles.titleDesc}>{personInfo.follows}</Text>
                </View>
              </View>
            </View>
            <Text style={{marginTop: 15}}>{personInfo.subTitle}</Text>
          </View>
          <Image
            defaultSource={require('../../resources/ico/simple_avatar.gif')}
            style={{
              width: avatorRadius * 2,
              height: avatorRadius * 2,
              borderRadius: avatorRadius,
              position: 'absolute',
              left: 15,
              borderWidth: gScreen.onePix,
              borderColor: gColors.borderColor,
            }}
            source={{uri: avatorUrl}}
          />
          <View style={{height: 15}} />
          <View
            style={{
              backgroundColor: gColors.themeColor,
              height: 40,
              paddingLeft: 10,
              justifyContent: 'center',
            }}>
            <Text
              style={{
                color: gColors.bgColorF,
                fontSize: gFont.size18,
                fontWeight: 'bold',
              }}>
              博客
            </Text>
          </View>
        </View>
      </YZStateView>
    );
  };

  _renderItem = ({item, index}) => {
    return (
      <BlogItem
        item={item}
        canViewProfile={false}
        navigation={this.props.navigation}
      />
    );
  };

  _handleScroll = event => {
    let curScrollY = event.nativeEvent.contentOffset.y;
    const {personInfo} = this.props;
    let {title} = (this.props.navigation.state || {params: undefined})
      .params || {title: undefined};
    title = title || '园友';
    if (curScrollY > this.namePositionY && title == '园友') {
      this.props.navigation.setParams({
        title: personInfo.nickName,
      });
    } else if (
      curScrollY < this.namePositionY &&
      title == personInfo.nickName
    ) {
      this.props.navigation.setParams({
        title: '园友',
      });
    }
  };

  render() {
    const {personInfo} = this.props;
    return (
      <View style={[Styles.container]}>
        {this.props.loadDataResult.success &&
        this.props.dataList.length == 0 ? (
          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={this.state.isRefreshing}
                onRefresh={() => {
                  this.setState(
                    {
                      isRefreshing: true,
                    },
                    this.loadData,
                  );
                }}
                colors={[gColors.themeColor]}
              />
            }
            style={{flex: 1, overflow: 'hidden'}}>
            {this._renderHeader()}
            <View style={{marginVertical: 30, alignItems: 'center'}}>
              <Text style={{color: gColors.color999}}>-- 暂无博客 --</Text>
            </View>
          </ScrollView>
        ) : (
          <YZStateView
            getResult={this.props.loadDataResult}
            placeholderTitle="暂无数据"
            errorButtonAction={this.loadData}>
            <YZFlatList
              onScroll={CommonUtils.throttle(this._handleScroll, 100)}
              renderItem={this._renderItem}
              ListHeaderComponent={() => this._renderHeader()}
              data={this.props.dataList}
              loadDataResult={this.props.loadDataResult}
              noMore={this.props.noMore}
              initialNumToRender={10}
              loadData={this.loadData}
              onPageIndexChange={pageIndex => {
                this.pageIndex = pageIndex;
              }}
              ItemSeparatorComponent={() => (
                <View style={{height: 0, backgroundColor: 'transparent'}} />
              )}
            />
          </YZStateView>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  title: {
    fontSize: gFont.size14,
    color: gColors.color666,
  },
  titleDesc: {
    fontSize: gFont.size14,
    color: gColors.themeColor,
  },
});
