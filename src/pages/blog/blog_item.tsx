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
import {ListRow} from 'teaset';
import PropTypes from 'prop-types';
import {showToast} from "../../actions/app_actions";
import {clearBlogIsFav, deleteBookmarkByUrl} from "../../actions/bookmark/bookmark_index_actions";
import {BorderShadow} from 'react-native-shadow'
import {ReduxState} from '../../reducers';
import {NavigationScreenProp, NavigationState} from "react-navigation";
import {blogModel} from "../../api/blog";

interface IProps {
    item: blogModel,
    //是否点击头像查看详情
    canViewProfile: boolean,
    isLandscape?: boolean,
    navigation: NavigationScreenProp<NavigationState>
}

interface IState {

}


@connect((state: ReduxState)=>({
    isLandscape: state.app.isLandscape
}),dispatch=>({
    dispatch,
}))
export default class blog_item extends PureComponent<IProps,IState> {

    static defaultProps = {
        canViewProfile: true
    };

    render() {
        const {item} = this.props;
        console.log(gScreen.width)
        return (
            <BorderShadow setting={{width:gScreen.width,border:3,color:gColors.color999}}>
                <TouchableOpacity
                    activeOpacity={activeOpacity}
                    onPress={()=>{
                        NavigationHelper.push('BlogDetail',{
                            item: item
                        });
                    }}
                    style={{flex:1}}
                >
                    <View style={{backgroundColor:gColors.bgColorF,paddingVertical:10,paddingHorizontal:8}}>
                        <TouchableOpacity
                            activeOpacity={activeOpacity}
                            onPress={()=>{
                                if(this.props.canViewProfile) {
                                    NavigationHelper.navigate('ProfilePerson', {
                                        userAlias: item.BlogApp,
                                        avatorUrl: item.Avatar
                                    });
                                }
                            }}
                            style={{flexDirection:'row',alignSelf:'stretch',alignItems:'center'}}
                        >
                            <Image
                                style={[Styles.avator]}
                                resizeMode="contain"
                                defaultSource={require('../../resources/ico/simple_avatar.gif')}
                                source={{uri: item.Avatar}}/>
                            <Text
                                style={[Styles.userName]}
                            >
                                {item.Author}
                            </Text>
                        </TouchableOpacity>
                        <Text
                            style={[{color:gColors.color0,fontSize:gFont.size16,fontWeight:'bold',marginVertical:7},Styles.text4Pie]}
                        >
                            {item.Title}
                        </Text>
                        <Text
                            style={[{color:gColors.color4c,fontSize:gFont.sizeDetail,marginVertical:4},Styles.text4Pie]}
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
                                {item.CommentCount+' 评论 · '}
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
