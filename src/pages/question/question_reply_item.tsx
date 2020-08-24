import React, {FC} from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {BorderShadow} from '@yz1311/react-native-shadow';
import {questionModel} from '../../api/question';
import {NavigationScreenProp, NavigationState} from 'react-navigation';
import ServiceUtils from '../../utils/serviceUtils';
import {Styles} from '../../common/styles';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Markdown from 'react-native-markdown-renderer';
import {Theme} from '@yz1311/teaset';
import moment from 'moment';

interface IProps {
  setSelectedQuestionFn?: any;
  deleteQuestionFn?: any;
  item: questionModel;
  showAll?: boolean;
  clickable: boolean;
  selectable: boolean;
  navigation: any;
  canDelete?: any;
  canModify?: any;
  userInfo?: any;
  userId?: string;
}

const QuestionReplayItem:FC<IProps> = ({clickable, item,showAll})=>{
  let faceUrl = item.author?.avatar || 'https://pic.cnblogs.com/face/sample_face.gif';
  let detailProps = {};
  if (!showAll) {
    detailProps = {
      numberOfLines: 4,
    };
  }
  return (
    <BorderShadow
      setting={{width: gScreen.width, border: 3, color: gColors.color999}}>
      <TouchableOpacity
        activeOpacity={clickable ? activeOpacity : 1}
        onPress={() => {
          if (clickable) {
            NavigationHelper.navigate('QuestionDetail', {
              item: item
            });
          }
        }}>
        <View
          style={{
            backgroundColor: gColors.bgColorF,
            paddingVertical: 10,
            paddingHorizontal: 8,
          }}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <TouchableOpacity
              activeOpacity={activeOpacity}
              onPress={() => {
                ServiceUtils.viewProfileDetail(
                  this.props.dispatch,
                  item.author?.id,
                  faceUrl,
                );
              }}
              style={{
                flexDirection: 'row',
                alignSelf: 'stretch',
                alignItems: 'center',
              }}>
              {item.author != undefined ? (
                <Image
                  style={[Styles.avator]}
                  resizeMode="contain"
                  source={{uri: faceUrl}}
                />
              ) : (
                <View style={[styles.avator]} />
              )}
              {item.author != undefined ? (
                <Text style={[Styles.userName]}>
                  {item.author?.name}
                </Text>
              ) : (
                '--'
              )}
            </TouchableOpacity>
            <View style={{marginLeft: 10}}>
              <Text style={{color: gColors.color666, fontSize: gFont.size12}}>
                {item.publishedDesc}
              </Text>
            </View>
          </View>
          <Text
            style={[
              {
                color: gColors.color0,
                fontSize: gFont.size16,
                fontWeight: 'bold',
                marginVertical: 7,
              },
              Styles.text4Pie,
            ]}>
            {item.gold > 0 ? (
              <MaterialCommunityIcons
                name="coin"
                size={20}
                color={gColors.colorff}
              />
            ) : null}
            {item.gold > 0 ? (
              <Text style={{color: gColors.colorff}}>
                {item.gold + '   '}
              </Text>
            ) : null}
            <Text selectable>{item.title}</Text>
          </Text>
          <View style={{flexDirection: 'row'}}>
            {showAll ? (
              <Markdown>{item.summary}</Markdown>
            ) : (
              <Text
                style={[
                  {
                    color: gColors.color333,
                    fontSize: gFont.sizeDetail,
                    marginVertical: 4,
                  },
                  Styles.text4Pie,
                ]}
                {...detailProps}
                selectable>
                {item.summary}
              </Text>
            )}
          </View>
          <View style={{backgroundColor:'#f8f8f8',marginVertical:7,paddingVertical:10,paddingHorizontal:6,borderColor:gColors.color6e,borderWidth:gScreen.onePix}}>
            <Text style={{fontSize:gFont.size14,color:Theme.primaryColor}}>
              {item.reply?.author+": "}
              <Text style={{color:gColors.color0}}>{item.reply?.summary}</Text>
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 5,
            }}>
            <Text style={{color: gColors.color999, fontSize: gFont.size12}}>

            </Text>
            <View style={{flex: 1, alignItems: 'flex-end'}}>
              <Text style={{color: gColors.color999, fontSize: gFont.size12}}>
                {moment(item.published).format('YYYY-MM-DD HH:mm')}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </BorderShadow>
  );
}

const styles = StyleSheet.create({
  avator: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  icon: {
    width: 40,
    height: 40,
  },
});

export default QuestionReplayItem;
