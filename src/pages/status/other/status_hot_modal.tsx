import React, {FC} from "react";
import Modal from 'react-native-modal';
import {Image, ScrollView, Text, TouchableOpacity, View} from "react-native";
import {Theme} from "@yz1311/teaset";
import {statusOtherInfoModel} from "../../../api/status";
import ServiceUtils from "../../../utils/serviceUtils";
import {Styles} from "../../../common/styles";
import {Colors} from "react-native/Libraries/NewAppScreen";
import Entypo from "react-native-vector-icons/Entypo";
import StatusItem from "../status_item";
import {ReducerResult} from "../../../utils/requestUtils";
import YZStateView from "../../../components/YZStateCommonView";

interface IProps {
    isVisible: boolean,
    onVisibleChange: (visible: boolean) => void;
    statusOtherInfo: Partial<statusOtherInfoModel>,
    loadOtherInfoResult: ReducerResult,
    loadData: ()=>void;
}

const StatusHotModal:FC<IProps> = ({isVisible,onVisibleChange, statusOtherInfo, loadOtherInfoResult, loadData})=>{
    return (
        <Modal
            style={{margin:0 , justifyContent:'center', alignItems:'center'}}
            coverScreen={false}
            isVisible={isVisible}
            onBackdropPress={()=>{
                onVisibleChange&&onVisibleChange(false);
            }}
            onBackButtonPress={()=>{
                onVisibleChange&&onVisibleChange(false);
            }}
        >
            <View style={{width: Theme.deviceWidth*0.9, borderRadius: Theme.px2dp(10),
                backgroundColor:'white', padding: Theme.px2dp(20),
                height: Theme.deviceHeight*0.7}}>
                <Text style={{alignSelf:'center', ...Theme.fontSizeAndColor(40, gColors.color0),
                    fontWeight:"bold", marginTop:Theme.px2dp(10)}}>今日最热闪存</Text>
                <View style={{height: 1, backgroundColor: Theme.primaryColor, marginTop: Theme.px2dp(20)}} />
                <YZStateView
                    loadDataResult={loadOtherInfoResult}
                    placeholderTitle="暂无数据"
                    errorButtonAction={loadData}>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        style={{flex:1, marginTop: Theme.px2dp(15)}}
                    >
                        {
                            (statusOtherInfo.今日最热闪存||[]).map((item, index)=>{
                                return (
                                    <StatusItem item={item}
                                                key={index}
                                                hasShadow={false}
                                                navigation={NavigationHelper.navigation} />
                                );
                            })
                        }
                    </ScrollView>
                </YZStateView>
            </View>
        </Modal>
    );
}

export default React.memo(StatusHotModal);
