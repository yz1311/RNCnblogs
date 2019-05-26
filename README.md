# 博客园

### 介绍
博客园是一个基于React Native开发的第三方cnblogs客户端,采用官方的提供的api接口以及部分官方接口实现的一个较完善的客户端。




### 功能描述
1.登录博客园(未登录也支持部分功能)

2.博客相关功能，包括博客、精华、关注、知识库，支持离线缓存

3.新闻相关功能，包括最新新闻、推荐新闻、本周热门，支持离线缓存

4.博问相关功能，包括待解决、高分、没有答案、已解决，支持增删改

5.闪存相关功能，包括全站、新回应、关注、我的、我回应，支持增删

6.四大模块支持添加、修改、删除收藏

7.四大模块支持发布、修改、删除评论(部分模块没有删除或者修改Api)

8.全局搜索

9.全局主题(15种颜色)

![](https://github.com/yz1311/RNCnblogs/screenshots/blog_list.png)
![](https://github.com/yz1311/RNCnblogs/screenshots/blog_detail.png)
![](https://github.com/yz1311/RNCnblogs/screenshots/comment.png)

![](https://github.com/yz1311/RNCnblogs/screenshots/question_detail.png)
![](https://github.com/yz1311/RNCnblogs/screenshots/status_detail.png)
![](https://github.com/yz1311/RNCnblogs/screenshots/app_theme.png)

### 下载
`Android:`

https://www.coolapk.com/apk/221669

`iOS:`

暂无开发者账号，可以自行clone源代码在模拟器上运行


### 软件架构
整体采用[Redux](https://github.com/reduxjs/redux)、[Redux-saga](https://github.com/redux-saga/redux-saga)、[immer](https://github.com/immerjs/immer)自行封装的一套基础框架(或者成为组件库+通用业务处理库)

整体采用标准的redux开发流程，包括action的SFA标准化，数据流部分只要存在副作用(主要是接口和本地realm数据库调用),
都采用redux-saga进行处理，reducer部分采用immer的强大功能，不必自动处理深度拷贝，直接赋值处理就可以.
同时对接口调用进行了统一的封装了处理

通过上述的处理和一些常用的使用经验，解决了下面的常见的几个问题
> - 支持全局loading
> - 支持全局toast已经页面级toast(依赖于react-native-toot-toast)
> - 任意组件支持Loading(加载中)、Empty(内容为空)、Error(错误)页面自动展示,并支持点击刷新和联网后自动刷新等常规逻辑
> - 


### 使用说明
由于本项目涉及到oauth的登录授权，所以如果想调用接口成功，需要向博客园申请授权

申请地址:

http://api.cnblogs.com/

收到邮件后，打开/src/common/constants.ts文件，按照下面修改即可
```
global.gBaseConfig = {
    PushToken: '',
    UniqueId: '',
    BuildVersion: '1.0.3',
    iOSCameraPermissionPrompt: '',
    clientId: '',       //填入clientId
    clientSecret: ''    //填入clientSecret
}
```

### 安装教程

1. clone the repository
2. run `npm install`
3. run `npm run watch`
4. run `react-native run-android` or   `react-native run-ios`


