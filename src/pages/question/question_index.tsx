import React, {Component} from 'react';
import {
  DeviceEventEmitter,
  EmitterSubscription,
  StyleSheet,
  View,
} from 'react-native';
import {connect} from 'react-redux';
import YZHeader from '../../components/YZHeader';
import Styles from '../../common/styles';
import Feather from 'react-native-vector-icons/Feather';
import HomeTabBar from '../home/home_indexTab';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import UnsolvedQuestionList from './list/unsolved_question_list';
import HighscoreQuestionList from './list/highscore_question_list';
import NoanswerQuestionList from './list/noanswer_question_list';
import SolvedQuestionList from './list/solved_question_list';
import MyQuestionList from './list/myquestion_question_list';
import ActionButton from 'react-native-action-button';
import {ReduxState} from '../../reducers';
import {NavigationScreenProp, NavigationState} from 'react-navigation';

interface IProps extends IReduxProps {
  initialPage?: number;
  navigation: NavigationScreenProp<NavigationState>;
  isLogin?: boolean;
  tabIndex?: number;
}

interface IState {
  tabNames: Array<string>;
  isActionButtonVisible: boolean;
}

@(connect(
  (state: ReduxState) => ({
    isLogin: state.loginIndex.isLogin,
  }),
  dispatch => ({
    dispatch,
  }),
) as any)
export default class question_index extends Component<IProps, IState> {
  static navigationOptions = ({navigation}) => {
    return {
      title: '闪存',
    };
  };
  private toggleActionButtonListener: EmitterSubscription;
  private tabBar: any;

  constructor(props) {
    super(props);
    this.state = {
      tabNames: ['待解决', '高分', '零回答', '已解决', '我的问题'],
      isActionButtonVisible: true,
    };
    this.toggleActionButtonListener = DeviceEventEmitter.addListener(
      'toggleActionButton_question',
      state => {
        this.setState({
          isActionButtonVisible: state || false,
        });
      },
    );
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    this.toggleActionButtonListener && this.toggleActionButtonListener.remove();
  }

  _onChangeTab = obj => {
    DeviceEventEmitter.emit('toggleActionButton_question', true);
    switch (obj.i) {
      case 0:
        break;
      case 1: //eslint-disable-line
        break;
      case 2:
        break;
    }
  };

  render() {
    const {tabNames} = this.state;
    return (
      <View style={[Styles.container]}>
        {__IOS__ ? (
          <View
            style={{
              height: gScreen.statusBarHeight,
              backgroundColor: gColors.themeColor,
            }}
          />
        ) : null}
        <ScrollableTabView
          renderTabBar={() => (
            <HomeTabBar
              ref={bar => (this.tabBar = bar)}
              containerStyle={{backgroundColor: gColors.themeColor}}
              tabDatas={tabNames}
            />
          )}
          tabBarPosition="top"
          initialPage={this.props.initialPage || 0}
          scrollWithoutAnimation={true}
          locked={false}
          onChangeTab={this._onChangeTab}>
          <UnsolvedQuestionList
            navigation={this.props.navigation}
            tabIndex={this.props.tabIndex}
          />
          <HighscoreQuestionList
            navigation={this.props.navigation}
            tabIndex={this.props.tabIndex}
          />
          <NoanswerQuestionList
            navigation={this.props.navigation}
            tabIndex={this.props.tabIndex}
          />
          <SolvedQuestionList
            navigation={this.props.navigation}
            tabIndex={this.props.tabIndex}
          />
          <MyQuestionList
            navigation={this.props.navigation}
            tabIndex={this.props.tabIndex}
          />
        </ScrollableTabView>
        {this.state.isActionButtonVisible ? (
          <ActionButton
            buttonColor="rgba(231,76,60,1)"
            hideShadow={true}
            onPress={() => {
              if (!this.props.isLogin) {
                NavigationHelper.navigate('Login');
              } else {
                this.props.navigation.navigate('QuestionAdd');
              }
            }}
          />
        ) : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({});
