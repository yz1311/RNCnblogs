import React, {Component} from 'react'
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions, StyleProp, TextStyle, ViewStyle,
} from 'react-native';
import {Theme} from "@yz1311/teaset";

const PhoneWidth = Dimensions.get('window').width;
const Button = (props) => {
    return (
        <TouchableOpacity {...props} activeOpacity={0.95}>
            {props.children}
        </TouchableOpacity>
    )
};

export interface IProps {
    style?: StyleProp<ViewStyle>,
    locked?: boolean,
    activeTextStyle?: StyleProp<TextStyle>,
    inactiveTextStyle?: StyleProp<TextStyle>,
    underlineStyle?: StyleProp<ViewStyle>,
    goToPage?: any,
    renderTab?: any,
    activeTab?: any,
    tabs?: Array<string>
}

interface IState {

}

export default class ProfilePersonTab extends Component<IProps,IState> {

    constructor(props) {
        super(props);
        this.state = {};
    }

    renderTab(name, page, isTabActive, onPressHandler) {
        const textColor = isTabActive ? '#333333' : '#2D2E2E';
        const fontSize = isTabActive ? Theme.px2dp(30) : Theme.px2dp(30);

        return <Button
            key={name}
            accessible={true}
            accessibilityLabel={name}
            accessibilityTraits='button'
            onPress={() => {
                if (this.props.locked) {
                    return;
                }
                onPressHandler(page)
            }}>
            <View style={{alignItems: 'center', paddingHorizontal: Theme.px2dp(20)}}>
                <Text style={[{
                    color: textColor,
                    fontSize,
                    textAlignVertical:'bottom',
                    alignSelf:'flex-end'
                }, isTabActive ? this.props.activeTextStyle : this.props.inactiveTextStyle]}>
                    {name}
                </Text>
                <View style={[{
                    backgroundColor: isTabActive ? Theme.primaryColor : "#00000000",
                    marginVertical: Theme.px2dp(7),
                    height: Theme.px2dp(6),
                    borderRadius: Theme.px2dp(4.5)
                }, this.props.underlineStyle]}/>
            </View>
        </Button>;
    }

    render() {
        return (
            <View style={{
                flexDirection: 'row',
                alignItems: 'flex-end',
                backgroundColor:'white',
                paddingHorizontal: Theme.px2dp(10),
                marginVertical: Theme.px2dp(6)
            }}>
                {this.props.tabs.map((name, page) => {
                    const isTabActive = this.props.activeTab === page;
                    const renderTab = this.props.renderTab || this.renderTab.bind(this);
                    return renderTab(name, page, isTabActive, this.props.goToPage);
                })}
            </View>
        );
    }

}
