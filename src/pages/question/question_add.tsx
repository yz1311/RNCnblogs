import React, {Component, FC, PureComponent} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Text,
  TextInput,
  DeviceEventEmitter,
} from 'react-native';
import {connect} from 'react-redux';
import YZCheckbox from '../../components/YZCheckbox';
import {Styles} from '../../common/styles';
import Feather from 'react-native-vector-icons/Feather';
import {Button, ListRow, NavigationBar, Theme} from '@yz1311/teaset';
import PropTypes from 'prop-types';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {KeyboardAwareScrollView} from '@codler/react-native-keyboard-aware-scroll-view';
import {ReduxState} from '../../reducers';
import {personQuestionIndex, questionModel} from '../../api/question';
import {Api} from '../../api';
import ToastUtils from '../../utils/toastUtils';
import SyanImagePicker from 'react-native-syan-image-picker';
import UploadUtils from "../../utils/uploadUtils";
import YZSafeAreaView from "../../components/YZSafeAreaView";

interface IProps extends IReduxProps {
  item: questionModel;
  clickable: boolean;
  navigation: any;
  userInfo?: any;
}

interface IState {
  title: string;
  value: string;
  isPublishToTop: boolean;
  tag: string;
  tagList: Array<any>;
  canSubmit: boolean;
  questionData: Partial<personQuestionIndex>,
  integral: string
}

@(connect(
  (state: ReduxState) => ({
    userInfo: state.loginIndex.userInfo,
  })
) as any)
export default class QuestionAdd extends PureComponent<IProps, IState> {
  static propTypes = {
    item: PropTypes.object,
    clickable: PropTypes.bool,
  };

  static defaultProps = {
    clickable: true,
  };

  constructor(props:IProps) {
    super(props);
    this.state = {
      title: '',
      value: '',
      isPublishToTop: true,
      tag: '',
      tagList: [],
      canSubmit: false,
      questionData: {},
      integral: '0'
    };
    if (props.item?.title) {
      this.state = {
        ...this.state,
        title: props.item.title,
        value: props.item.summary,
        tagList: props.item.tags?.map(x=>x.name) || []
      };
    }
  }

  componentDidMount() {
    this.validate();
    this.getMyQuestionData();
  }

  getMyQuestionData = async ()=>{
    try {
      let response = await Api.question.getPersonQuestionIndex({
        request: {
          userId: gUserData.userId
        }
      });
      this.setState({
        questionData: response.data
      });
    } catch (e) {

    } finally {

    }
  }

  _rightAction = async () => {
    if (this.state.canSubmit) {
      const { item} = this.props;
      ToastUtils.showLoading();
      //修改
      if (item?.title) {
        try {
          let response = await Api.question.modifyQuestion({
            request: {
              qid: parseInt(item.id),
              Title: this.state.title,
              Content: this.state.value,
              PublishOption: this.state.isPublishToTop,
            }
          });
          ToastUtils.showToast('修改成功!');
          //返回到上一级，并刷新所有的列表
          NavigationHelper.goBack();
          //刷新‘待解决’和‘没有答案'、'我的问题'三个列表
          DeviceEventEmitter.emit('question_list_refresh',-1);
        } catch (e) {

        } finally {
          ToastUtils.hideLoading();
        }
      }
      //新增
      else {
        try {
          let response = await Api.question.addQuestion({
            request: {
              Title: this.state.title,
              Content: this.state.value,
              Tags: this.state.tagList.join(','),
              PublishOption: this.state.isPublishToTop,
              SaveOption: !this.state.isPublishToTop,
              Award: parseInt(this.state.integral),
              FormatType: 2
            }
          })
          //返回到上一级，并刷新所有的列表
          NavigationHelper.goBack();
          //刷新‘待解决’和‘没有答案'、'我的问题'三个列表
          DeviceEventEmitter.emit('question_list_refresh',-1);
        } catch (e) {

        } finally {
          ToastUtils.hideLoading();
        }
      }
    } else {
      const validateResult = this.validate();
      ToastUtils.showToast(validateResult[0]);
    }
  };

  validate = () => {
    let errors = [];
    if (this.state.title.length < 6 || this.state.title.length > 200) {
      errors.push('标题,6~200字符');
    }
    if (this.state.value.length < 20 || this.state.value.length > 100000) {
      errors.push('内容,20~100000字符');
    }
    if(!(parseInt(this.state.integral)>=0&&parseInt(this.state.integral)<=this.state.questionData?.integral)) {
      errors.push('悬赏值必须是0~'+this.state.questionData?.integral+'之间');
    }
    this.setState({
      canSubmit: errors.length === 0,
    });
    return errors;
  };

  render() {
    const {item, clickable} = this.props;
    const canAddTag = this.state.tagList.length < 5;
    return (
        <YZSafeAreaView>
          <NavigationBar
              title={this.state.title || '提问'}
              rightView={
                <TouchableOpacity
                    activeOpacity={activeOpacity}
                    style={{
                      alignSelf: 'stretch',
                      justifyContent: 'center',
                      paddingHorizontal: 8,
                    }}
                    onPress={this._rightAction}>
                  <FontAwesome name="send" size={18} color={gColors.bgColorF} />
                </TouchableOpacity>
              }
              />
          <KeyboardAwareScrollView style={[Styles.container, {backgroundColor: gColors.bgColorF}]}>
            <View style={[Styles.container, {backgroundColor: gColors.bgColorF}]}>
              <ListRow
                title={'标题'}
                detail={
                  <TextInput
                    style={[styles.input]}
                    value={this.state.title}
                    placeholder="请输入标题"
                    onChangeText={value => this.setState({title: value}, this.validate)}
                    />
                }
                />
              <ListRow
                title={'标签'}
                detail={
                  <View
                    style={{
                      flex:1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginLeft: 10,
                    }}>
                    <TextInput
                      style={[styles.input,{flex:1}]}
                      editable={!(item?.title)}
                      placeholder={'准确的Tag有助于专家高手发现问题'}
                      value={this.state.tag}
                      maxLength={30}
                      onChangeText={value => this.setState({tag: value})}
                    />
                    <TouchableOpacity
                      activeOpacity={activeOpacity}
                      onPress={() => {
                        if (canAddTag) {
                          if(this.state.tag!='') {
                            this.setState(
                              {
                                tagList: this.state.tagList.concat([this.state.tag]),
                                tag: '',
                              },
                              this.validate,
                            );
                          }
                        } else {
                          ToastUtils.showToast('最多添加5个tag');
                        }
                      }}
                      style={{
                        paddingHorizontal: 14,
                        paddingVertical: 7,
                        backgroundColor: canAddTag
                          ? Theme.primaryColor
                          : gColors.borderColor,
                        borderRadius: 6,
                      }}>
                      <Text style={{color: 'white'}}>添加</Text>
                    </TouchableOpacity>
                  </View>
                }
              />
              <ListRow
                title={
                  <View>
                    <Text style={{color:Theme.labelTextTitleColor,fontSize:Math.round(Theme.labelFontSizeMD * Theme.labelTitleScale)}}>
                    悬赏(您目前剩余
                    <Text style={{color:gColors.colorRed}}>{this.state.questionData?.integral||'--'}</Text>
                    园豆)</Text>
                    <Text style={{fontSize:Theme.labelFontSizeSM,color:gColors.color6e,marginTop:6}}>悬赏园豆越多，您的问题会越受关注，从而得到更佳答案。</Text>
                  </View>
                }
                detail={
                  <TextInput
                    style={[styles.input]}
                    editable={!(item?.title)}
                    value={this.state.integral}
                    keyboardType={'numeric'}
                    placeholder="请输入悬赏值"
                    onChangeText={value => this.setState({integral: value}, this.validate)}
                  />
                }
              />
              <View
                style={{
                  flexDirection: 'row',
                  paddingHorizontal: 6,
                  flexWrap: 'wrap',
                  paddingVertical: 7,
                  paddingBottom: 10,
                  borderBottomColor: gColors.borderColor,
                  borderBottomWidth: gScreen.onePix,
                }}>
                {this.state.tagList.map((x, xIndex) => {
                  return (
                    <Tag
                      key={xIndex}
                      index={xIndex}
                      item={x}
                      onDeleteTag={() => {
                        this.setState({
                          tagList: this.state.tagList.filter(n => n !== x),
                        });
                      }}
                    />
                  );
                })}
              </View>
              <TextInput
                placeholder={
                  '1、只允许发布IT技术相关问题\n2、认真清晰的提问，问题就解决了一半\n3、避免提问内容全部代码没有说明\n' +
                  '4、准确的Tag有助于专家高手发现问题\n'+'5、Tag最多5个，且单个长度不得大于30个字'+'6、悬赏园豆越多，您的问题会越受关注'
                }
                textAlignVertical="top"
                underlineColorAndroid="transparent"
                style={[
                  {
                    padding: 8,
                    fontSize: gFont.size15,
                    color: gColors.color333,
                    height: gScreen.height * 0.4,
                  },
                ]}
                value={this.state.value}
                multiline={true}
                onChangeText={value => this.setState({value}, this.validate)}
              />
              <View style={{height: 1, backgroundColor: gColors.borderColor}} />
              <View
                style={{
                  marginTop: 10,
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  paddingRight: 10,
                }}>
                <TouchableOpacity
                  activeOpacity={activeOpacity}
                  onPress={() => {
                    this.setState({
                      isPublishToTop: true,
                    });
                  }}
                  style={{flexDirection: 'row', alignItems: 'center'}}>
                  <YZCheckbox
                    checked={this.state.isPublishToTop}
                    size={20}
                    onPress={() => {
                      this.setState({
                        isPublishToTop: true,
                      });
                    }}
                  />
                  <Text style={{marginLeft: 4}}>发布至首页</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={activeOpacity}
                  onPress={() => {
                    this.setState({
                      isPublishToTop: false,
                    });
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginLeft: 18,
                  }}>
                  <YZCheckbox
                    checked={!this.state.isPublishToTop}
                    size={20}
                    onPress={() => {
                      this.setState({
                        isPublishToTop: false,
                      });
                    }}
                  />
                  <Text style={{marginLeft: 4}}>不发布至首页</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAwareScrollView>
        </YZSafeAreaView>
    );
  }
}

const Tag: FC<{item: any; index: number; style?: any; onDeleteTag: any}> = ({
  item,
  index,
  style,
  onDeleteTag,
}) => {
  let height = 30;
  return (
    <View style={{paddingTop: 8, paddingRight: 8, marginTop: 8}}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {}}
        style={[
          {
            height: height,
            justifyContent: 'center',
            borderRadius: 6,
            paddingHorizontal: 10,
            backgroundColor: gColors.borderColor,
            marginLeft: index !== 0 ? 8 : 0,
          },
          style,
        ]}>
        <Text style={{color: Theme.primaryColor, fontSize: gFont.size13}}>
          {item}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        activeOpacity={activeOpacity}
        onPress={() => {
          onDeleteTag && onDeleteTag(item);
        }}
        style={{
          width: 16,
          height: 16,
          borderRadius: 8,
          position: 'absolute',
          right: 0,
          top: 0,
          backgroundColor: gColors.colorRed,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Text
          style={{
            fontSize: gFont.size12,
            color: gColors.bgColorF,
            fontWeight: 'bold',
          }}>
          x
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  avator: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  input: {
    flex:1,
    textAlign:'right',
    marginLeft:10,
    height:__ANDROID__?40:35,
  }
});
