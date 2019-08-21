import React, {Component, PureComponent} from 'react'
import {
    StyleSheet,
    View,
    TouchableOpacity,
    Image,
    Text
} from 'react-native'
import {connect} from 'react-redux';
import YZStateView from '../../components/YZStateCommonView';
import YZFlatList from '../../components/YZFlatList';
import Styles from '../../common/styles';
import Feather from 'react-native-vector-icons/Feather';
import {ListRow} from "@yz1311/teaset";
import PropTypes from 'prop-types';
import StringUtils from '../../utils/stringUtils';
import {BorderShadow} from "@yz1311/react-native-shadow";
import {NavigationScreenProp, NavigationState} from "react-navigation";

interface IProps {
    navigation: NavigationScreenProp<NavigationState>,
    setSelectedDetailFn?: any,
    item: knowledge
}

interface IState {
    tabNames: Array<string>,
}

export interface knowledge {
    Title: string,
    Author: string | undefined,
    Description: string | undefined,
    TopicIcon: string | undefined,
    Summary: string | undefined,
    DiggCount: number | undefined,
    CommentCount: number | undefined,
    ViewCount: number | undefined,
    postDateDesc: string | undefined,
}

export default class knowledgeBase_item extends PureComponent<IProps,IState> {

    static propTypes = {
        item: PropTypes.object
    };

    render() {
        const {item} = this.props;
        return (
            <BorderShadow setting={{width:gScreen.width,border:3,color:gColors.color999}}>
                <TouchableOpacity
                    activeOpacity={activeOpacity}
                    onPress={()=>{
                        this.props.navigation.navigate('KnowledgeBaseDetail',{
                            item: item
                        });
                    }}
                >
                    <View style={{backgroundColor:gColors.bgColorF,paddingVertical:10,paddingHorizontal:8}}>
                        <View style={{flexDirection:'row',alignItems:'center'}}>
                            <Text
                                style={{color:gColors.color333,fontSize:gFont.size12,marginLeft:7}}
                            >
                                {item.Author || '佚名'}
                            </Text>
                        </View>
                        <Text
                            style={{color:gColors.color0,fontSize:gFont.size16,fontWeight:'bold',marginVertical:7}}
                        >
                            {item.Title}
                        </Text>
                        <Text
                            style={{color:gColors.color4c,fontSize:gFont.sizeDetail,marginVertical:4}}
                            numberOfLines={4}
                        >
                            {item.Description}
                        </Text>
                        <View style={{flexDirection:'row',alignItems:'center',marginTop:5}}>
                            <Text
                                style={{color:gColors.color999,fontSize:gFont.size12}}
                            >
                                {item.DiggCount+' 推荐 · '}
                            </Text>
                            <Text
                                style={{color:gColors.color999,fontSize:gFont.size12}}
                            >
                                {item.ViewCount+' 阅读'}
                            </Text>
                            <View style={{flex:1,alignItems:'flex-end'}}>
                                <Text
                                    style={{color:gColors.color999,fontSize:gFont.size12}}
                                >
                                    {item.postDateDesc}
                                </Text>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            </BorderShadow>
        )
    }
}


const styles = StyleSheet.create({
    avator: {
        width:20,
        height:20,
        borderRadius:10,
    }
});
