import React, {Component} from 'react'
import {
    StyleSheet,
    TouchableOpacity,
    Animated,
    AppState, BackHandler
} from 'react-native'
import PropTypes from 'prop-types';
import Picker from 'react-native-picker'

const styles = StyleSheet.create({
    animatedView: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
    }
})

export interface IProps {
    isShow: boolean,
    closeWhenBackgroundClicked: boolean
}

export interface IState {
    isShow: boolean,
    selectedValue: any,
    pickerData: any,
    opacityAnimatedValue: any,
    onPickerSelect: any,
    onPickerConfirm: any,
    onPickerCancel: any,
    pickerTitleText: string,
    pickerConfirmBtnText: string,
    pickerCancelBtnText: string,
    pickerBg: Array<number>,
    pickerToolBarBg: Array<number>,
    pickerTitleColor: Array<number>,
    pickerToolBarFontSize: number,
    pickerConfirmBtnColor: Array<number>,
    pickerCancelBtnColor: Array<number>,
}

export default class YZPicker extends Component<IProps,IState> {

    static defaultProps = {
        pickerTitleColor: [3, 3, 3, 1],
        pickerConfirmBtnColor: [57, 203, 24, 1],
        pickerCancelBtnColor: [100, 100, 100, 1],
        pickerToolBarBg: [255, 255, 255, 1],
        pickerBg: [255, 255, 255, 1],
        pickerCancelBtnText: "取消",
        pickerConfirmBtnText: "确定",
        pickerToolBarFontSize:parseInt(gFont.size15),
        closeWhenBackgroundClicked:true
    }

    static propTypes = {
        pickerData: PropTypes.array,
        selectedValue: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
        pickerTitleText: PropTypes.string,
        pickerConfirmBtnText: PropTypes.string,
        pickerCancelBtnText: PropTypes.string,
        pickerBg: PropTypes.array,
        pickerToolBarBg: PropTypes.array,
        pickerTitleColor: PropTypes.array,
        pickerToolBarFontSize: PropTypes.number,
        onPickerConfirm: PropTypes.func,
        onPickerCancel: PropTypes.func,
        onPickerSelect: PropTypes.func,
        pickerConfirmBtnColor: PropTypes.array,
        pickerCancelBtnColor: PropTypes.array,
        //是否点击阴影部分关闭modal,默认是true
        closeWhenBackgroundClicked:PropTypes.bool
    }

    private pickerWrapper: any;

    constructor(props) {
        super(props)

        let initialState = this._checkOutInitialState(props)
        this.state = {
            isShow: false,
            opacityAnimatedValue: new Animated.Value(0),
            ...initialState
        }
    }

    componentDidMount() {
        AppState.addEventListener('change', this._handleAppStateChange)
        BackHandler.addEventListener('hardwareBackPress', this._handleHwBackEvent);
    }

    componentWillReceiveProps(nextProps) {
        const {selectedValue, pickerData} = nextProps
        this.setState({selectedValue, pickerData})
    }

    componentWillUnmount()
    {
        AppState.removeEventListener('change', this._handleAppStateChange);
        BackHandler.removeEventListener('hardwareBackPress', this._handleHwBackEvent);
    }

    _handleHwBackEvent=()=>{
        //默认就是关闭当前modal
        if(this.state.isShow)
        {
            this._onPickerCancel();
            return true;
        }
        return false;
    }

    _handleAppStateChange = appState => {
        // Android下APP从后台重新进入前台时，Picker会自动隐藏，此时将后面遮盖层去掉
        if (appState === 'active' && gScreen.isAndroid) {
            this.state.opacityAnimatedValue.setValue(0)
            this.pickerWrapper && this.setState({isShow: false})
        }
    }

    _checkOutInitialState = props => {
        const {
            pickerData, pickerTitleText, selectedValue,
            pickerConfirmBtnText, pickerCancelBtnText,
            pickerBg, pickerToolBarBg, pickerTitleColor, pickerToolBarFontSize,
            onPickerSelect, onPickerConfirm, onPickerCancel,
            pickerConfirmBtnColor,pickerCancelBtnColor
        } = props
        return {
            pickerData, pickerTitleText, selectedValue,
            pickerConfirmBtnText, pickerCancelBtnText,
            pickerBg, pickerToolBarBg, pickerTitleColor, pickerToolBarFontSize,
            onPickerSelect, onPickerConfirm, onPickerCancel,
            pickerConfirmBtnColor,pickerCancelBtnColor
        }
    }

    _onPickerSelect = data => {
        this.state.onPickerSelect && this.state.onPickerSelect(data)
    }

    _onPickerConfirm = data => {
        this.hide()
        this.state.onPickerConfirm && this.state.onPickerConfirm(data)
    }

    _onPickerCancel = (data:any = undefined) => {
        this.hide()
        this.state.onPickerCancel && this.state.onPickerCancel(data)
    }

    show = () => {
        this.setState({isShow: true}, () => {
            Animated.timing(this.state.opacityAnimatedValue, {
                toValue: 1,
                duration: 200
            }).start()
        })
        Picker.init({
            pickerData: this.state.pickerData,
            selectedValue: this.state.selectedValue,
            pickerTitleText: this.state.pickerTitleText,
            pickerConfirmBtnText: this.state.pickerConfirmBtnText,
            pickerCancelBtnText: this.state.pickerCancelBtnText,
            pickerBg: this.state.pickerBg,
            pickerToolBarBg: this.state.pickerToolBarBg,
            pickerTitleColor: this.state.pickerTitleColor,
            pickerToolBarFontSize: this.state.pickerToolBarFontSize,
            onPickerSelect: this._onPickerSelect,
            onPickerConfirm: this._onPickerConfirm,
            onPickerCancel: this._onPickerCancel,
            pickerConfirmBtnColor:this.state.pickerConfirmBtnColor,
            pickerCancelBtnColor:this.state.pickerCancelBtnColor
        });
        Picker.show();
    }

    hide = () => {
        Animated.timing(this.state.opacityAnimatedValue, {
            toValue: 0,
            duration: 200
        }).start(() => this.setState({isShow: false}))
        Picker.hide()
    }

    render() {
        if (!this.state.isShow) return null

        const {opacityAnimatedValue} = this.state
        const opacity = opacityAnimatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['rgba(1,1,1,0)', 'rgba(1,1,1,0.6)']
        })
        return (
            <Animated.View
                ref={r => this.pickerWrapper = r}
                style={[styles.animatedView, {backgroundColor: opacity}]}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    style={{flex: 1}}
                    onPress={()=>{
                        const {closeWhenBackgroundClicked} = this.props;
                        if(closeWhenBackgroundClicked) {
                            this.hide();
                        }
                    }}
                />
            </Animated.View>
        )
    }

    isShow=()=>{
        return this.state.isShow;
    }
}