import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  BackHandler,
  Keyboard,
  DeviceEventEmitter,
} from 'react-native';
import YZAnimatedModal from '../../components/YZAnimatedModal';
import PropTypes from 'prop-types';
import Feather from 'react-native-vector-icons/Feather';
import ThemeUtils from '../../utils/themeUtils';
import {Theme} from "@yz1311/teaset";
import StorageUtils from "../../utils/storageUtils";

interface IProps {
  dispatch?: any;
  userInfo?: any;
  title?: string | undefined;
}

interface IState {
  themes: Array<any>;
  selectedTheme: any;
}

export default class profile_themeModal extends Component<IProps, IState> {
  static propTypes = {
    title: PropTypes.string,
  };

  static defaultProps = {};

  private modal: any;
  private params: any;

  state = {
    themes: [
      {
        value: '#d33c30',
      },
      {
        value: '#c33f5b',
      },
      {
        value: '#7e48a2',
      },
      {
        value: '#5447a9',
      },
      {
        value: '#2d3c95',
      },
      {
        value: '#1a76d2',
      },
      {
        value: '#0288d1',
      },
      {
        value: '#2f97a7',
      },
      {
        value: '#2e7a6b',
      },
      {
        value: '#428e3c',
      },
      {
        value: '#689f38',
      },
      {
        value: '#afb42b',
      },
      {
        value: '#fbc034',
      },
      {
        value: '#faa12f',
      },
      {
        value: '#f57d29',
      },
    ],
    selectedTheme: Theme.primaryColor,
  };

  render() {
    return (
      <YZAnimatedModal
        ref={modal => (this.modal = modal)}
        header={this.renderHeader()}
        content={this.renderContent()}
        bottom={this.renderBottom()}
        contentWrapperStyle={{
          width: gScreen.width * 0.9,
          marginTop: -gScreen.headerHeight,
        }}
        contentStyle={{paddingVertical: 0, paddingTop: 10}}
        closeWhenBackgroundClicked={false}
      />
    );
  }

  renderHeader() {
    return (
      <View
        style={{borderTopLeftRadius: 6, borderTopRightRadius: 6, paddingTop: 6}}
      />
    );
  }

  renderContent() {
    const {title} = this.props;
    const params = this.params;
    return (
      <View
        style={{
          paddingHorizontal: 20,
          paddingBottom: 10,
          minHeight: 150,
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          height: 250,
        }}>
        {this.state.themes.map((theme, tIndex) => {
          return (
            <TouchableOpacity
              key={tIndex}
              activeOpacity={activeOpacity}
              onPress={() => {
                this.setState({
                  selectedTheme: theme.value,
                });
              }}
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: theme.value,
                marginTop: 10,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              {theme.value === this.state.selectedTheme ? (
                <Feather name="check" color={gColors.bgColorF} size={18} />
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  renderBottom() {
    return (
      <View style={{flexDirection: 'row'}}>
        <TouchableOpacity
          activeOpacity={0.75}
          style={[
            {
              flexGrow: 1,
              flexBasis: 0,
              height: 50,
              justifyContent: 'center',
              alignItems: 'center',
              borderTopWidth: gScreen.onePix,
              borderColor: gColors.borderColor,
            },
          ]}
          onPress={() => {
            this.close();
          }}>
          <Text style={{fontSize: gFont.size15, color: gColors.color666}}>
            取消
          </Text>
        </TouchableOpacity>
        <View
          style={{width: gScreen.onePix, backgroundColor: gColors.borderColor}}
        />
        <TouchableOpacity
          activeOpacity={0.75}
          style={[
            {
              flexGrow: 1,
              flexBasis: 0,
              height: 50,
              justifyContent: 'center',
              alignItems: 'center',
              borderTopWidth: gScreen.onePix,
              borderColor: gColors.borderColor,
            },
          ]}
          onPress={async () => {
            this.close();
            let themeInfo = await StorageUtils.load('themeInfo');
            await StorageUtils.save('themeInfo', {
              ...(themeInfo || {}),
              primaryColor: this.state.selectedTheme,
            });
            await ThemeUtils.reloadTheme();
            DeviceEventEmitter.emit('reloadTheme');
            NavigationHelper.goBack();
          }}>
          <Text style={{fontSize: gFont.size15, color: Theme.primaryColor}}>
            确定
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  show(params) {
    this.params = params || {};
    this.modal && this.modal.show();
  }

  close() {
    this.modal && this.modal._close();
  }

  isShow = () => {
    return this.modal.isShow();
  };
}
