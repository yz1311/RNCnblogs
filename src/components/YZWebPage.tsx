import React, {Component} from 'react';
import {Clipboard, Linking, Share, View, TouchableOpacity} from 'react-native';
import {WebView} from 'react-native-webview';
import PropTypes from 'prop-types';
import Feather from 'react-native-vector-icons/Feather';
import {ListRow, NavigationBar, Overlay} from '@yz1311/teaset';
import CommonUtils from '../utils/commonUtils';
import YZBackHandler from './YZBackHandler';

const injectedJsCode = `var headArr = document.getElementsByTagName('head');
            var meta = document.createElement('meta');
            meta.name = 'viewport';
            meta.content = 'width=device-width,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no';
            headArr[0].appendChild(meta);
            var bodyArr = document.getElementsByTagName('body');
             
             bodyArr[0].style.padding='0px 0px 0px 0px';
            `;

export interface IProps {
  uri: string;
  content: string;
  navigation: any;
  title: string;
  injectedJavaScript: string;
}

//@ts-ignore
@YZBackHandler
export default class YZWebPage extends Component<IProps, any> {
  static propTypes = {
    uri: PropTypes.string,
    title: PropTypes.string,
  };

  private fromView: any;
  private overlayKey: any;
  private webView: any;


  _onCopy = () => {
    Overlay.hide(this.overlayKey);
    this.overlayKey = null;
    CommonUtils.copyText(this.props.content);
  };

  _onOpen = () => {
    Overlay.hide(this.overlayKey);
    this.overlayKey = null;
    const {uri} = this.props;
    CommonUtils.openUrl(uri);
  };

  _onShare = async () => {
    Overlay.hide(this.overlayKey);
    this.overlayKey = null;
    const {uri} = this.props;
    CommonUtils.share('', uri);
  };

  _onBack = () => {
    if (this.overlayKey) {
      Overlay.hide(this.overlayKey);
      this.overlayKey = null;
      return true;
    }
    this.props.navigation.goBack();
    return true;
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
            style={{backgroundColor: 'transparent', width: 140}}
            titleStyle={{color: gColors.bgColorF, textAlign: 'center'}}
            title="复制链接"
            onPress={this._onCopy}
          />
          <ListRow
            style={{backgroundColor: 'transparent', width: 140}}
            titleStyle={{color: gColors.bgColorF, textAlign: 'center'}}
            title="在浏览器打开"
            onPress={this._onOpen}
          />
          <ListRow
            style={{backgroundColor: 'transparent', width: 140}}
            titleStyle={{color: gColors.bgColorF, textAlign: 'center'}}
            bottomSeparator={null}
            title="分享"
            onPress={this._onShare}
          />
        </Overlay.PopoverView>
      );
      this.overlayKey = Overlay.show(overlayView);
    });
  };

  render() {
    return (
      <View style={{flex: 1}}>
        <NavigationBar title={this.props.title} rightView={
          <TouchableOpacity
              activeOpacity={activeOpacity}
              style={{paddingHorizontal: 8}}
              ref={ref => (this.fromView = ref)}
              onPress={() => {
                this.showMenu();
              }}>
            <Feather name="more-horizontal" size={32} color={gColors.bgColorF} />
          </TouchableOpacity>
        } />
        <View style={{flex: 1, overflow: 'hidden'}}>
          <WebView
            ref={ref => (this.webView = ref)}
            source={{uri: this.props.uri}}
            automaticallyAdjustContentInsets
            // scalesPageToFit
            injectedJavaScript={injectedJsCode+';'+this.props.injectedJavaScript}
            style={{flex: 1}}
          />
        </View>
      </View>
    );
  }
}
