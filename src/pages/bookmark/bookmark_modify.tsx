import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
  Keyboard,
} from 'react-native';
import {connect} from 'react-redux';
import {Styles} from '../../common/styles';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {ListRow, Input} from '@yz1311/teaset';
import {NavigationScreenProp, NavigationState} from 'react-navigation';
import {ReduxState} from '../../reducers';
import {bookmarkModel} from '../../api/bookmark';
import {Api} from '../../api';

interface IProps {
  dispatch: any;
  deleteBookmarkFn: any;
  addBookmarkFn: any;
  modifyBookmarkFn: any;
  navigation: NavigationScreenProp<NavigationState>;
  item: bookmarkModel;
  successAction: any;
}

interface IState {
  WzLinkId: string;
  Title: string;
  LinkUrl: string;
  Summary: string;
  DateAdded: string;
  FromCNBlogs: boolean;
  Tags: Array<string>;
  TagsDesc: string;
}

@(connect(
  (state: ReduxState) => ({}),
  dispatch => ({
    dispatch,

  }),
) as any)
export default class bookmark_modify extends Component<IProps, IState> {
  static navigationOptions = ({navigation}) => {
    const {state} = navigation;
    const {rightAction} = state.params || {rightAction: undefined};
    return {
      title: navigation.state.params.title || '添加收藏',
      headerRight: (
        <TouchableOpacity
          activeOpacity={activeOpacity}
          style={{
            alignSelf: 'stretch',
            justifyContent: 'center',
            paddingHorizontal: 8,
          }}
          onPress={rightAction}>
          <FontAwesome name="send" size={18} color={gColors.bgColorF} />
        </TouchableOpacity>
      ),
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      //收藏编号
      WzLinkId: '',
      Title: '',
      LinkUrl: '',
      Summary: '',
      DateAdded: '',
      FromCNBlogs: true,
      Tags: [],
      TagsDesc: '',
    };
  }

  componentDidMount() {
    let {item} = this.props;

    this.setState({
      WzLinkId: item.id,
      Title: item.title,
      LinkUrl: item.link,
      Summary: item.summary,
      DateAdded: item.published,
      Tags: item.Tags,
      TagsDesc: ((item || {Tags: undefined}).Tags || []).join(','),
    });
    this.props.navigation.setParams({
      rightAction: this.rightAction,
    });
  }

  rightAction = () => {
    Keyboard.dismiss();
    Alert.alert('', '是否保存?', [
      {
        text: '取消',
      },
      {
        text: '保存',
        onPress: () => {
          let request = {
            title: this.state.Title,
            url: this.state.LinkUrl,
            summary: this.state.Summary,
            tags: this.state.TagsDesc.split(',').join(','),
          };
          let method:any = null;
          //修改
          if (this.state.WzLinkId) {
            method = Api.bookmark.modifyBookmark({
              request: {
                ...request,
                wzLinkId: this.state.WzLinkId,
              }
            });
          } else {
            method = Api.bookmark.addBookmark({request: request});
            this.props.addBookmarkFn({
              request: request,
              successAction:
                this.props.successAction && this.props.successAction(),
            });
          }
        },
      },
    ]);
  };

  render() {
    return (
      <View style={[Styles.container]}>
        <ListRow
          title="标题"
          detail={
            <Input
              style={{flex: 1, marginLeft: 7}}
              value={this.state.Title}
              onChangeText={value => this.setState({Title: value})}
            />
          }
        />
        <ListRow
          title="网址"
          detail={
            <Input
              style={{flex: 1, marginLeft: 7}}
              value={this.state.LinkUrl}
              onChangeText={value => this.setState({LinkUrl: value})}
            />
          }
        />
        <ListRow
          title="标签"
          detail={
            <Input
              style={{flex: 1, marginLeft: 7}}
              placeholder="多个标签用逗号隔开"
              value={this.state.TagsDesc}
              onChangeText={value => this.setState({TagsDesc: value})}
            />
          }
        />
        <Input
          style={{height: 80, marginTop: 15, marginHorizontal: 2}}
          placeholder="摘要不超过200字"
          multiline={true}
          value={this.state.Summary}
          onChangeText={value => this.setState({Summary: value})}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  textInput: {},
});
