import {requestWithTimeout, createOptions} from '../utils/request';
import * as types from '../actions/actionTypes';
import RequestUtils from "../utils/requestUtils";
import cheerio from "react-native-cheerio";


export type userInfoModel = {
  id: string,
  seniority: string,
  follows: string,
  stars: string,
  nickName: string,
  signature: string,
  updated: string,
  link: string,
  blogapp: string,
  avatar: string,
  postcount: string,
};


export type accountInfoModel = {
  countryCode: string; //"+86"
  displayName: string; //"做一个清醒者"
  email: string; //"546913738@qq.com"
  externalSignIns: Array<{
    externalUsername: string;
    isActive: boolean; //false
    provider: string;  //"WeChat"
    providerDisplayName: string; //"微信"
  }>,
  hasPassword: boolean;  //true
  loginName: string; //"yz1311"
  notificationEmail: string; //"546913738@qq.com"
  notificationType: number; //1
  phoneNum: string; //"18521014275"
  twoFactorEnabled: boolean; //false
};

export type changeBasicProfileRequest = RequestModel<{
  RealName: string;
  RealNamePublicType: number; //1
  Gender: number; //0  ,0是女，1是男
  GenderPublicType: number; //1
  BirthdayYear: string;
  BirthdayMonth: string;
  BirthdayDay: string;
  BirthdayPublicType: number; //1
  s1?: string; //湖北省
  s2?: string; //武汉市
  HometownProvince: string; //湖北省
  HometownCity: string; //武汉市
  HometownPublicType: number; //1
  IsHome_Hometown: boolean; //true
  reside1: string;  //请选择  现居地
  reside2: string;  //请选择
  ResideProvince: string; //请选择
  ResideCity: string; //请选择
  ResidePublicType: number;  //1
  IsHome_Reside: boolean; //true
  Marriage: number;  //0  婚姻
  MarriagePublicType: number; //1
  Position: string; //  职位
  PositionPublicType: number; //1
  Company: string; //  单位
  CompanyPublicType: number;  //1
  WorkStatus: number;  //0
  WorkStatusPublicType: number; //1
  btnSubmit?: string;  //保存
  __RequestVerificationToken: string;  //CfDJ8K5MrGQfPjpFvRyctF-QEQcENh2qW9DlIEWzs1_rYXIBGYIvxmJsN05pqYGPLbHbJDUrmdEMvWctKBozFff2FFf-4R1PwurWrMKrzxGydcO-r3CiqIyXvjoqrlBTDNhWZpiiE6rtUtOkrc9FJLcgUE0mILeqEImgSAbxXT3VcSaLlODQ7PkDOyNjxBM7o9V2WA
  IsHome_RealName: boolean;  //false
  IsHome_Gender: boolean;  //false
  IsHome_Birthday: boolean;  //false
  IsHome_Marriage: boolean;  //false
  IsHome_Position: boolean;  //false
  IsHome_Company: boolean;  //false
  IsHome_WorkStatus: boolean;  //false
}>;

export type basicProfileModel = {
  RealName: string;
  RealNamePublicType: number; //1
  Gender: number; //0  ,0是女，1是男
  GenderPublicType: number; //1
  BirthdayYear: string;
  BirthdayMonth: string;
  BirthdayDay: string;
  BirthdayPublicType: number; //1
  HometownProvince: string; //湖北省
  HometownCity: string; //武汉市
  HometownPublicType: number; //1
  IsHome_Hometown: boolean; //true
  ResideProvince: string; //请选择
  ResideCity: string; //请选择
  ResidePublicType: number;  //1
  IsHome_Reside: boolean; //true
  Marriage: number;  //0  婚姻
  MarriagePublicType: number; //1
  Position: string; //  职位
  PositionPublicType: number; //1
  Company: string; //  单位
  CompanyPublicType: number;  //1
  WorkStatus: number;  //0
  WorkStatusPublicType: number; //1
  __RequestVerificationToken: string;  //CfDJ8K5MrGQfPjpFvRyctF-QEQcENh2qW9DlIEWzs1_rYXIBGYIvxmJsN05pqYGPLbHbJDUrmdEMvWctKBozFff2FFf-4R1PwurWrMKrzxGydcO-r3CiqIyXvjoqrlBTDNhWZpiiE6rtUtOkrc9FJLcgUE0mILeqEImgSAbxXT3VcSaLlODQ7PkDOyNjxBM7o9V2WA
  IsHome_RealName: boolean;  //false
  IsHome_Gender: boolean;  //false
  IsHome_Birthday: boolean;  //false
  IsHome_Marriage: boolean;  //false
  IsHome_Position: boolean;  //false
  IsHome_Company: boolean;  //false
  IsHome_WorkStatus: boolean;  //false
};


//为0的时候表示可以连通
export const checkConnectivity = (data:RequestModel<{}>) => {
  const URL = `https://i.cnblogs.com/api/msg`;
  return RequestUtils.get<number>(URL);
};

export const getToken = data => {
  data.request = {
    client_id: gBaseConfig.clientId,
    client_secret: gBaseConfig.clientSecret,
    grant_type: 'client_credentials',
  };
  data.request = `client_id=${data.request.client_id}&client_secret=${
    data.request.client_secret
  }&grant_type=${data.request.grant_type}`;
  const URL = `https://api.cnblogs.com/token`;
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    },
    body: data.request,
  };
  return requestWithTimeout({
    URL,
    data,
    options,
    errorMessage: '获取token失败!',
    actionType: types.LOGIN_GET_TOKEN,
  });
};

export const userLogin = data => {
  const URL = `https://oauth.cnblogs.com/connect/token`;
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    },
    body: data.request,
  };
  return requestWithTimeout({
    URL,
    data,
    options,
    errorMessage: '登录失败!',
    actionType: types.LOGIN_USERLOGIN,
  });
};

export const refreshToken = data => {
  const URL = `https://oauth.cnblogs.com/connect/token`;
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      // 'Authorization':'Basic '+gBaseConfig.clientId+':'+gBaseConfig.clientSecret
    },
    body: data.request,
  };
  return requestWithTimeout({
    URL,
    data,
    options,
    errorMessage: '刷新token失败!',
    actionType: types.LOGIN_USERLOGIN,
  });
};

export const getUserAlias = (data:RequestModel<{}>)=>{
  return RequestUtils.get<string>('https://home.cnblogs.com/user/CurrentUserInfo',{
    resolveResult: (result)=>{
      let userId = (result.match(/\/u\/[\s\S]+?(?=\/)/)||[])[0]?.replace(/\/u\//,'');
      return userId;
    }
  });
}

export const getAccountInfo = (data:RequestModel<{}>) => {
  const URL = `https://account.cnblogs.com/api/account`;
  return RequestUtils.get<accountInfoModel>(URL, data.request);
};

export const checkPhone = (data:RequestModel<{countryCode?:string, phoneNum: string}>) => {
  if(!data.request.countryCode) {
    data.request.countryCode = '+86';
  }
  const URL = `https://account.cnblogs.com/account/checkPhone`;
  let formData = new FormData();
  for (let key in data.request) {
    formData.append(key,data.request[key]);
  }
  return RequestUtils.post<boolean>(URL, formData);
};

export const checkLoginName = (data:RequestModel<{loginName: string}>) => {
  const URL = `https://account.cnblogs.com/account/checkLoginName`;
  let formData = new FormData();
  for (let key in data.request) {
    formData.append(key,data.request[key]);
  }
  return RequestUtils.post<boolean>(URL, formData);
};

export const changeLoginName = (data:RequestModel<{loginName: string, sameAsEmail: boolean}>) => {
  const URL = `https://account.cnblogs.com/api/account/login-name`;
  return RequestUtils.put<{message: string, success: boolean}>(URL, data.request);
};

export const checkDisplayName = (data:RequestModel<{displayName: string}>) => {
  const URL = `https://account.cnblogs.com/account/checkDisplayName`;
  let formData = new FormData();
  for (let key in data.request) {
    formData.append(key,data.request[key]);
  }
  return RequestUtils.post<boolean>(URL, formData);
};

export const changeDisplayName = (data:RequestModel<{displayName: string}>) => {
  const URL = `https://account.cnblogs.com/api/account/display-name`;
  return RequestUtils.put<{message: string, success: boolean}>(URL, data.request);
};


//绑定手机号时，需要验证密码 (密码是加密的，目前不知道加密方式)
export const checkPassword = (data:RequestModel<{password: string}>) => {
  const URL = `https://account.cnblogs.com/api/account/check-password`;
  return RequestUtils.post<{message: string, success: boolean}>(URL, data.request);
};

//发送验证码 (密码是加密的，目前不知道加密方式)
export const sendVerifyCode = (data:RequestModel<{countryCode?: string, phoneNum: string, password: string}>) => {
  if(!data.request.countryCode) {
    data.request.countryCode = '+86';
  }
  const URL = `https://account.cnblogs.com/api/account/phone`;
  return RequestUtils.post<{message: string, success: boolean, value: string}>(URL, data.request);
};

//绑定手机号 (密码是加密的，目前不知道加密方式)
export const bindPhone = (data:RequestModel<{countryCode?: string, phoneNum: string, password: string, verificationCode: string}>) => {
  if(!data.request.countryCode) {
    data.request.countryCode = '+86';
  }
  const URL = `https://account.cnblogs.com/api/account/phone`;
  return RequestUtils.put<{message: string, success: boolean}>(URL, data.request);
};


export const getBasicProfile = (data: RequestModel<{}>) => {
  const URL = `https://home.cnblogs.com/set/profile`;
  return RequestUtils.get<basicProfileModel>(URL, {
    resolveResult: (result) => {
      const $ = cheerio.load(result, { decodeEntities: false });
      const detailSection = $('div[id=main]');
      let detail = {
        RealName: detailSection.find('input[id=txt_name]').attr('value'),
        IsHome_RealName: detailSection.find('input[id=chk_name]').attr('checked') === 'checked',
        Gender: detailSection.find('input[name=Gender][type=radio][value=1]').attr('checked') === 'checked' ? 1 : 0,
        IsHome_Gender: detailSection.find('input[id=chk_gender]').attr('checked') === 'checked',
      } as Partial<basicProfileModel>;

    }
  });
};

export const changeBasicProfile = (data: changeBasicProfileRequest) => {
  data.request.btnSubmit = '保存';
  data.request.s1 = data.request.HometownProvince;
  data.request.s2 = data.request.HometownCity;
  data.request.reside1 = data.request.ResideProvince;
  data.request.reside2 = data.request.ResideCity;
  const URL = `https://account.cnblogs.com/api/account/phone`;
  return RequestUtils.post<boolean>(URL, data.request, {
    resolveResult: (result) => {
      return result.test(/更新成功/);
    }
  });
};

