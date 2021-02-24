import React, {FC} from "react";
import {Image, Text, TouchableOpacity, View} from "react-native";
import ServiceUtils from "../../../utils/serviceUtils";
import {Styles} from "../../../common/styles";
import Feather from "react-native-vector-icons/Feather";
import {BorderShadow} from '@yz1311/react-native-shadow';
import {searchUserModal} from "../../../api/home";
import {useSelector} from "react-redux";
import {ReduxState} from "../../../reducers";
import {Theme} from "@yz1311/teaset";

interface IProps {
    item: Partial<searchUserModal>;
    clickable?: boolean
}

const SearchUserListItem:FC<IProps> = ({item, clickable})=>{
    const {userInfo} = useSelector((state:ReduxState)=>({
        userInfo: state.loginIndex.userInfo
    }));

    return (
        <BorderShadow
            setting={{width: gScreen.width, border: 3, color: gColors.color999}}>
            <TouchableOpacity
                activeOpacity={clickable ? activeOpacity : 1}
                onPress={() => {
                    if (clickable) {
                        ServiceUtils.viewProfileDetail(
                            gStore.dispatch,
                            item.id,
                            item.name,
                            item.avatar,
                        );
                    }
                }}>
                <View
                    style={{
                        backgroundColor: gColors.bgColorF,
                        paddingVertical: 15,
                        paddingHorizontal: 8,
                    }}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <TouchableOpacity
                            activeOpacity={activeOpacity}
                            disabled
                            // onPress={() => {
                            //     if(this.props.canViewProfile) {
                            //         ServiceUtils.viewProfileDetail(
                            //             gStore.dispatch,
                            //             item.id,
                            //             item.avatar,
                            //         );
                            //     }
                            // }}
                            style={{
                                flexDirection: 'row',
                                alignSelf: 'stretch',
                                alignItems: 'center',
                            }}>
                            <Image
                                style={[Styles.avator, {width: 42, height: 42, borderRadius: 21}]}
                                resizeMode="contain"
                                source={{uri: item.avatar}}
                            />
                            <View>
                                <Text style={[Styles.userName, {fontSize: Theme.px2dp(32)}]}>{item.name}</Text>
                                <Text style={[Styles.userName, {color: gColors.color999, fontSize: gFont.size11, marginTop: Theme.px2dp(8)}]}>{item.id}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
                {/*{item.id === userInfo.id ? (*/}
                {/*    <TouchableOpacity*/}
                {/*        ref={ref => (this.fromView = ref)}*/}
                {/*        activeOpacity={activeOpacity}*/}
                {/*        style={{*/}
                {/*            position: 'absolute',*/}
                {/*            right: 0,*/}
                {/*            top: 0,*/}
                {/*            paddingVertical: 10,*/}
                {/*            paddingHorizontal: 12,*/}
                {/*        }}*/}
                {/*        onPress={this.showMenu}>*/}
                {/*        <Feather name="more-horizontal" size={25} color={gColors.color0} />*/}
                {/*    </TouchableOpacity>*/}
                {/*) : null}*/}
            </TouchableOpacity>
        </BorderShadow>
    );
}

SearchUserListItem.defaultProps = {
    clickable: true
};

export default SearchUserListItem;
