import  React from 'react';
import {StyleSheet,Platform} from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: gColors.backgroundColor,
    },
    modalTitleImage:{
        height: 50,
        width: gScreen.width - 15 * 2,
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalTitle:{
        color: '#fff',
        fontSize: gFont.size16,
        fontWeight: 'bold',
        backgroundColor: 'rgba(1,1,1,0)'
    },
    ensureBtn: {
        width: gScreen.width - 10 * 2,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        left: 10,
        bottom: 15,
        backgroundColor: gColors.themeColor,
        borderRadius: 5
    },
    //relative类型的按钮
    ensureBtn1: {
        width: gScreen.width - 10 * 2,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        //reltive中使用left right top bottom依旧有效
        marginLeft: 10,
        marginBottom:15,
        backgroundColor: gColors.themeColor,
        borderRadius: 5
    },
    ensureTitle: {
        color: '#fff',
        fontSize: gFont.size15
    },
    sectionTitleContainer:{
        borderWidth:gScreen.onePix,
        borderColor:gColors.borderColor,
        paddingHorizontal:gMargin,
        paddingTop:15,
        paddingBottom:10,
        justifyContent: 'center',
        alignItems: 'flex-start'
    },
    sectionTitle:{
        color:gColors.color666,
        fontSize:gFont.size13
    },
    text_infoWindow:{
        fontSize:gFont.size12,
        color:gColors.themeColor,
        //ios下面无效
        // borderBottomColor:gColors.themeColor,
        // borderBottomWidth:gScreen.onePix,
        marginLeft:10,
        textDecorationLine:'underline'
    },
    separator:{
        height:gScreen.onePix,
        alignSelf:'stretch',
        backgroundColor:gColors.color999
    },
    dateWrapper: {
        height: 50,
        // borderColor: gColors.borderColor,
        // borderBottomWidth: gScreen.onePix,
        backgroundColor: gColors.themeColor,
        flexDirection: 'row',
        alignItems: 'center',
    },
    homeStyle:{
        fontSize:gFont.size18,
        color:gColors.color40,
        fontWeight:'bold',
        marginLeft:10,
        marginTop:15,
        marginBottom:12
    },
    userAccountOpeTitle:{
        fontSize:gFont.size20,
        color:gColors.color0,
        alignSelf:'center',
        marginTop:40,
        marginBottom:55
    },
    gardenHeaderContainer:{
        //gScreen.statusBarHeight未初始化
        // height: Platform.OS==='android' ? (50+gScreen.statusBarHeight) : (44+gScreen.statusBarHeight),
        // paddingTop: Platform.OS==='android' ? 0 : gScreen.statusBarHeight,
        // flexDirection:'row',
        // alignItems:'center',
        position:'absolute',
        right:0,
        left:0,
        backgroundColor:'transparent'
    },
    avator: {
        width:30,
        height:30,
        borderRadius:15,
    },
    userName: {
        color:gColors.color333,
        fontSize:gFont.size13,
        marginLeft:7,
        fontWeight: 'bold'
    },
    text4Pie: {
        lineHeight: Platform.OS==='android'&&Platform.Version>=28?20:null
    }
});