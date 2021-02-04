import React, {FC} from "react";
import Modal from 'react-native-modal';
import {Image, ScrollView, Text, TouchableOpacity, View} from "react-native";
import {Theme} from "@yz1311/teaset";
import {statusOtherInfoModel} from "../../../api/status";
import StatusItem from "../status_item";
import {ReducerResult, StateView} from '@yz1311/react-native-state-view';

interface IProps {
    isVisible: boolean,
    onVisibleChange: (visible: boolean) => void;
    statusOtherInfo: Partial<statusOtherInfoModel>,
    loadOtherInfoResult: ReducerResult,
    loadData: ()=>void;
}

const StatusLuckModal:FC<IProps> = ({isVisible,onVisibleChange, statusOtherInfo, loadOtherInfoResult, loadData})=>{
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
                    fontWeight:"bold", marginTop:Theme.px2dp(10)}}>最新幸运闪</Text>
                <View style={{height: 1, backgroundColor: Theme.primaryColor, marginTop: Theme.px2dp(20)}} />
                <StateView
                    loadDataResult={loadOtherInfoResult}
                    placeholderTitle="暂无数据"
                    errorButtonAction={loadData}>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        style={{flex:1, marginTop: Theme.px2dp(15)}}
                    >
                        {
                            (statusOtherInfo.最新幸运闪||[]).map((item, index)=>{
                                return (
                                    <StatusItem item={item}
                                                key={index}
                                                hasShadow={false}
                                                navigation={NavigationHelper.navigation} />
                                );
                            })
                        }
                    </ScrollView>
                </StateView>
            </View>
        </Modal>
    );
}

export default React.memo(StatusLuckModal);
