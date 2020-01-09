/**
 * 用于动画折叠组件的父组件
 */
import React, {Component, PureComponent} from 'react';
import {Animated, StyleSheet, View, LayoutAnimation} from 'react-native';
import PropTypes from 'prop-types';

const customLayoutAnimation = {
  duration: 200,
  update: {
    type: LayoutAnimation.Types.linear,
  },
};

export interface IProps {
  isToggle: boolean;
  style: any;
}

export interface IState {
  heightAnimatedValue: any;
  maxHeight: number;
  isToggle: boolean;
}

class YZCollapsableWrapper extends Component<IProps, IState> {
  static propTypes = {
    isToggle: PropTypes.bool.isRequired,
    maxHeight: PropTypes.number.isRequired,
    style: PropTypes.any,
  };

  //在android上面会出现item的高度不够
  useLayoutAnimation = false;

  private myView: any;

  constructor(props) {
    super(props);

    let initialValue = props.isToggle ? 1 : 0;
    this.state = {
      heightAnimatedValue: new Animated.Value(initialValue),
      maxHeight: props.maxHeight,
      isToggle: props.isToggle,
    };
  }

  componentWillReceiveProps(nextProps) {
    const {isToggle, maxHeight} = nextProps;
    if (this.props.isToggle !== nextProps.isToggle) {
      if (!this.useLayoutAnimation) {
        if (isToggle != this.state.isToggle) {
          Animated.timing(this.state.heightAnimatedValue, {
            toValue: isToggle ? 1 : 0,
            duration: 300,
          }).start();
        }
        this.setState({maxHeight, isToggle});
      } else {
        LayoutAnimation.configureNext(customLayoutAnimation);
        this.myView.setNativeProps({
          style: {
            maxHeight: isToggle ? maxHeight : 0,
          },
        });
      }
    }
  }

  // shouldComponentUpdate(nextProps,nextState)
  // {
  //     return this.props.isToggle!==nextProps.isToggle||this.props.maxHeight!==nextProps.maxHeight;
  // }

  render() {
    // console.log('YZCollapsableWrapper render');
    let wrapperHeight;
    const {heightAnimatedValue, maxHeight} = this.state;
    if (!this.useLayoutAnimation) {
      wrapperHeight = heightAnimatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, maxHeight],
      });
    }

    return (
      <Animated.View
        ref={view => (this.myView = view)}
        style={[{height: wrapperHeight}, this.props.style]}>
        {this.props.children}
      </Animated.View>
    );
  }
}

export default YZCollapsableWrapper;
