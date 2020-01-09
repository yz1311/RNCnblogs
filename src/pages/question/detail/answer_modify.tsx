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
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import PropTypes from 'prop-types';
import moment from 'moment';
import StringUtils from '../../../utils/stringUtils';
import {
  deleteQuestionAnswer,
  modifyQuestionAnswer,
} from '../../../actions/question/question_detail_actions';
import {Overlay, Label, Input} from '@yz1311/teaset';

interface IProps {
  title?: string;
  item: any;
  closeModal: any;
  onSubmit: any;
}

interface IState {
  answer: string;
}

export default class answer_modify extends PureComponent<IProps, IState> {
  static propTypes = {
    title: PropTypes.string,
    item: PropTypes.object,
    closeModal: PropTypes.func,
    onSubmit: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {
      //修改回答
      answer:
        props.item.Answer ||
        props.item.CommentContent ||
        props.item.Content ||
        '',
    };
  }

  render() {
    const {item, closeModal, title, onSubmit} = this.props;
    return (
      <View
        style={{
          backgroundColor: '#fff',
          paddingHorizontal: 10,
          borderRadius: 6,
          width: gScreen.width * 0.9,
          alignItems: 'center',
        }}>
        <Label
          style={{color: '#000', marginVertical: 20}}
          size="lg"
          text={title}
        />
        <Input
          style={{alignSelf: 'stretch', marginVertical: 15, height: 50}}
          value={this.state.answer}
          onChangeText={value => this.setState({answer: value})}
        />

        <View
          style={{
            marginTop: 20,
            height: 50,
            flexDirection: 'row',
            borderTopColor: gColors.borderColor,
            borderTopWidth: gScreen.onePix,
          }}>
          <TouchableOpacity
            activeOpacity={activeOpacity}
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}
            onPress={() => {
              closeModal && closeModal();
            }}>
            <Text style={{color: gColors.color999}}>取消</Text>
          </TouchableOpacity>
          <View
            style={{
              width: gScreen.onePix,
              backgroundColor: gColors.borderColor,
            }}
          />
          <TouchableOpacity
            activeOpacity={activeOpacity}
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}
            onPress={() => {
              onSubmit && onSubmit(this.state.answer);
            }}>
            <Text style={{color: gColors.themeColor}}>修改</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  avator: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  icon: {
    width: 40,
    height: 40,
  },
});
