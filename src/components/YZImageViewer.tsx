import React, {Component} from 'react';
import {Image, View, Text, StyleSheet, Modal, BackHandler} from 'react-native';
import ImageViewer, {
  ImageViewerPropsDefine,
} from 'react-native-image-zoom-viewer';
import PropTypes from 'prop-types';
import {IImageInfo} from 'react-native-image-zoom-viewer/built/image-viewer.type';

export interface IProps extends ImageViewerPropsDefine {
  images: IImageInfo[];
  visible: boolean;
}

export default class YZImageViewer extends Component<IProps, any> {
  static propTypes = {
    // ...ImageViewer.propTypes,
    images: PropTypes.array.isRequired,
    visible: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    images: [],
    visible: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      images: props.images || [],
      visible: props.visible,
    };
  }

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this._handleHwBackEvent);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener(
      'hardwareBackPress',
      this._handleHwBackEvent,
    );
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      images: nextProps.images,
      visible: nextProps.visible,
    });
  }

  _handleHwBackEvent = () => {
    //默认就是关闭当前modal
    if (this.state.visible) {
      this.setState({
        visible: false,
      });
      return true;
    }
    return false;
  };

  render() {
    const {visible, images} = this.state;
    return (
      <Modal
        animationType="fade"
        onRequestClose={() => {
          this.setState({
            visible: false,
          });
        }}
        visible={visible}
        transparent={true}>
        <ImageViewer
          imageUrls={images}
          onClick={() => {
            this.setState({
              visible: false,
            });
          }}
          onSwipeDown={() => {
            this.setState({
              visible: false,
            });
          }}
        />
      </Modal>
    );
  }
}
