import React, {FC} from "react";
import Modal from 'react-native-modal';
import {Image, ScrollView, Text, TouchableOpacity, View} from "react-native";
import {Theme} from "@yz1311/teaset";
import {statusOtherInfoModel} from "../../../api/status";
import ServiceUtils from "../../../utils/serviceUtils";
import {Styles} from "../../../common/styles";
import {Colors} from "react-native/Libraries/NewAppScreen";
import Entypo from "react-native-vector-icons/Entypo";
import {ReducerResult, StateView} from '@yz1311/react-native-state-view';

interface IProps {
    isVisible: boolean,
    onVisibleChange: (visible: boolean) => void;
    statusOtherInfo: Partial<statusOtherInfoModel>,
    loadOtherInfoResult: ReducerResult,
    loadData: ()=>void;
}

const StatusRankModal:FC<IProps> = ({isVisible,onVisibleChange, statusOtherInfo,  loadOtherInfoResult, loadData})=>{
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
                    fontWeight:"bold", marginTop:Theme.px2dp(10)}}>今日星星排行榜TOP12</Text>
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
                            (statusOtherInfo.今日星星排行榜||[]).map((item, index)=>{
                                return (
                                    <TouchableOpacity
                                        onPress={()=>{
                                            // onVisibleChange&&onVisibleChange(false);
                                            setTimeout(()=>{
                                                ServiceUtils.viewProfileDetail(
                                                    gStore.dispatch,
                                                    item.id,
                                                    item.avatar,
                                                );
                                            }, 0);
                                        }}
                                        key={index} style={{paddingVertical: Theme.px2dp(20),
                                        flexDirection:'row', justifyContent:"space-between",
                                        borderBottomWidth: Theme.onePix*1.5, borderBottomColor: gColors.borderColore5}}>
                                        <TouchableOpacity
                                            activeOpacity={activeOpacity}
                                            disabled
                                            style={{
                                                flexDirection: 'row',
                                                alignSelf: 'stretch',
                                                alignItems: 'center',
                                            }}>
                                            <Image
                                                style={[Styles.avator]}
                                                resizeMode="contain"
                                                source={{uri: item.avatar}}
                                            />
                                            <Text style={[Styles.userName]}>{item.name}</Text>
                                        </TouchableOpacity>
                                        <View style={{flexDirection:'row', alignItems:"center"}}>
                                            <Entypo
                                                style={{marginRight: 6, marginLeft: -5}}
                                                size={23}
                                                color={gColors.colorRed}
                                                name="star"
                                            />
                                            <Text style={{...Theme.fontSizeAndColor(28, gColors.color666), width: 20, textAlign:'right'}}>{item.starNum}</Text>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })
                        }
                    </ScrollView>
                </StateView>
            </View>
        </Modal>
    );
}

export default React.memo(StatusRankModal);
