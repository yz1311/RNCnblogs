import React, {FC} from "react";
import Modal from 'react-native-modal';
import {Image, ScrollView, Text, TouchableOpacity, View} from "react-native";
import {Theme} from "@yz1311/teaset";
import {statusOtherInfoModel} from "../../../api/status";
import ServiceUtils from "../../../utils/serviceUtils";
import {Styles} from "../../../common/styles";
import {Colors} from "react-native/Libraries/NewAppScreen";
import Entypo from "react-native-vector-icons/Entypo";

interface IProps {
    isVisible: boolean,
    onVisibleChange: (visible: boolean) => void;
    statusOtherInfo: Partial<statusOtherInfoModel>
}

const StatusLuckModal:FC<IProps> = ({isVisible,onVisibleChange, statusOtherInfo})=>{
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
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    style={{flex:1, marginTop: Theme.px2dp(15)}}
                >
                    {
                        (statusOtherInfo.最新幸运闪||[]).map((item, index)=>{
                            return (
                                <TouchableOpacity
                                    onPress={()=>{
                                        // onVisibleChange&&onVisibleChange(false);
                                        setTimeout(()=>{
                                            NavigationHelper.navigate('StatusDetail', {
                                                item: item,
                                            });
                                        }, 0);
                                    }}
                                    key={index} style={{paddingVertical: Theme.px2dp(20),
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
                                            source={{uri: '   '}}
                                        />
                                        <Text style={[Styles.userName]}>{item.author?.name}</Text>
                                    </TouchableOpacity>
                                    <View style={{flex:1}}>
                                        <Text style={{...Theme.fontSizeAndColor(28, gColors.color666), marginVertical: Theme.px2dp(10)}}>{item.content}</Text>
                                        <Text style={{...Theme.fontSizeAndColor(28, gColors.color666), textAlign:'right'}}>{item.replyCount}</Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })
                    }
                </ScrollView>
            </View>
        </Modal>
    );
}

export default React.memo(StatusLuckModal);
