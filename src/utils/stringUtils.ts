import moment from "moment";
import React from 'react';
import {
    PixelRatio
} from 'react-native';

export default class stringUtils
{
    static isBlank(input)
    {
        return input == null || /^\s*$/.test(input);
    }

    static encrypyStr = (sourceStr, startIndex, starLength)=>{
        if (sourceStr.length < starLength + startIndex - 1) return null
        let fstStr = sourceStr.substring(0, startIndex-1);
        let scdStr = sourceStr.substring(startIndex-1, startIndex+starLength-1);
        let lstStr = sourceStr.substring(startIndex+starLength-1, sourceStr.length);
        return `${fstStr}${scdStr.replace(/[\s\S]/g, '*')}${lstStr}`
    }

    static formatDate = (date)=>{
        let today = moment(moment().format('YYYY-MM-DD'));
        date = moment(date);
        let days = today.diff(moment(moment(date).format('YYYY-MM-DD')),'days');
        //今天的数据
        if(days === 0)
        {
            let seconds = moment().diff(moment(date),'seconds');
            if(seconds < 60*60)
            {
                let minute = parseInt(String(seconds / 60)) || 1;
                return minute+'分钟前';
            }
            else {
                // return date.format(parseInt(seconds/60/60)+'小时前');
                return '今天'+date.format('HH:mm');
            }
        }
        //昨天的数据
        else if(days === 1)
        {
            return '昨天 '+date.format('HH:mm');
        }
        else {
            //如果是同一年的，则不显示年
            if(date.year() === today.year())
            {
                return date.format('MM-DD HH:mm');
            }
            else
            {
                return date.format('YYYY-MM-DD HH:mm');
            }
        }
    }

    //获取html的图片
    static getImgUrls = (source)=>{
        let imgList = [];
        let matches = (source || '').match(/<img [^>]*src=['"]([^'"]+)[^>]*>/gi);
        if(matches != null) {
            for (let match of matches) {
                let srcMatches = match.match(/src=['"][\s\S]+?['"]/);
                if(srcMatches!=null&&srcMatches.length>0)
                {
                    //有一部分图片带&amp;,需要直接替换为&
                    imgList.push(srcMatches[0].replace('src=','').replace(/"/g,'').replace(/'/g,'').replace(/&amp;/g,'&'));
                }
            }
        }
        return imgList;
    }

    //获取markdown的图片
    static getMarkdownImgUrls = (source)=>{
        let imgList = [];
        let matches = (source || '').match(/!\[(.*?)\]\([\s\S]+?\)/gi);
        if(matches != null) {
            for (let match of matches) {
                let srcMatches = match.match(/\]\([\s\S]+?\)/);
                if(srcMatches!=null&&srcMatches.length>0)
                {
                    //有一部分图片带&amp;,需要直接替换为&
                    imgList.push(srcMatches[0].replace('](','').replace(/\)/g,''));
                }
            }
        }
        return imgList;
    }
}