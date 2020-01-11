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
import BaseQuestionList from './base_question_list';
import ActionButton from 'react-native-action-button';
import {ReduxState} from '../../reducers';
import {NavigationScreenProp, NavigationState} from 'react-navigation';
import {Theme} from '@yz1311/teaset';

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

export enum QuestionTypes {
  待解决 = 'unsolved',
  高分 = 'highscore',
  新回答 = 'answered',
  新评论 = 'newcomment',
  零回答 = 'noanswer',
  已解决 = 'solved',
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
      tabNames: ['待解决', '高分', '零回答', '已解决', '新回答', '新评论'],
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
        <View
          style={{
            height: Theme.statusBarHeight,
            backgroundColor: Theme.navColor,
          }}
        />
        <ScrollableTabView
          renderTabBar={() => (
            <HomeTabBar
              ref={bar => (this.tabBar = bar)}
              containerStyle={{backgroundColor: Theme.navColor}}
              tabDatas={tabNames}
            />
          )}
          tabBarPosition="top"
          initialPage={this.props.initialPage || 0}
          scrollWithoutAnimation={true}
          locked={false}
          onChangeTab={this._onChangeTab}>
          <BaseQuestionList
            navigation={this.props.navigation}
            questionType={QuestionTypes.待解决}
          />
          <BaseQuestionList
            navigation={this.props.navigation}
            questionType={QuestionTypes.高分}
          />
          <BaseQuestionList
            navigation={this.props.navigation}
            questionType={QuestionTypes.零回答}
          />
          <BaseQuestionList
            navigation={this.props.navigation}
            questionType={QuestionTypes.已解决}
          />
          <BaseQuestionList
            navigation={this.props.navigation}
            questionType={QuestionTypes.新回答}
          />
          <BaseQuestionList
            navigation={this.props.navigation}
            questionType={QuestionTypes.新评论}
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
