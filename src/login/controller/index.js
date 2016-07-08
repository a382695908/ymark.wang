'use strict';

import Base from './base.js';
let DateFormat = require('dateformat');
let CryptoJS = require("crypto-js");
let MD5 = require("blueimp-md5");

let crypKey = think.config('crypKey');

export default class extends Base {
  /**
   * index action
   * @return {Promise} []
   */
  indexAction(){
    return this.display();
  }

  async infoAction(){
  	let param = this.get();
    
    // param.userinfo = '{"imgurl":"http://q.qlogo.cn/qqapp/101331678/34DBDCD831787C9417A9AAB22C1720A0/100","gender":"男","nickname":"YMARK","city":"丰台","province":"北京"}';
    // param.access_token = '18FBDE6B1031F6731A84CA4F2F43F06D';
    // param.openid = '34DBDCD831787C9417A9AAB22C1720A0';
    // param.type = 1;

    let model_userlogin = this.model('userlogin') ;
    let model_userinfo = this.model('userinfo');

    let queryParamLogin = {
      openid : param.openid ,
      token  : param.access_token,
      authtype : param.type
    } ,
    returnParam = {};

    let userlogin = await model_userlogin.where(queryParamLogin).field(['userid' ,'lastlogintime']).select();

    let time = DateFormat(new Date(), "yyyy-mm-dd hh:MM:ss");
    if(userlogin.length == 0){  //没有此用户，需要将用户信息插入到数据库中，并返回
      
      let _userinfo = JSON.parse(param.userinfo);

      let userid = await model_userinfo.add({
        nickname : _userinfo.nickname,
        nickimg : _userinfo.imgurl,
        gender  : _userinfo.gender,
        city : _userinfo.city,
        province : _userinfo.province,
        username : _userinfo.nickname,
        password : '',
        phone : '',
        addtime : time,
      });

      await model_userlogin.add({
        userid :userid ,
        lastlogintime : time,
        authtype : param.type,
        openid :  param.openid ,
        token : param.access_token,
      });
      await this.session("userInfo", {
        token : param.access_token ,
        userid : userid
      });
      returnParam = {
         nickname : _userinfo.nickname ,
         nickimg : _userinfo.nickimg ,
         userid : userid ,
      };

    }else{  // 直接查询用户并更新登录时间

      let user = userlogin[0];
      let userList = await model_userinfo.where({id:user.userid}).field('nickname ,nickimg ,username').select();
      if(userList.length == 0){
        return this.fail(-1,'用户数据不存在！');
      }else{
        let usermodel = userList[0];
        await model_userlogin.where(queryParamLogin).update({lastlogintime:time}); //更新最后登录时间
        returnParam = {
           nickname : usermodel.nickname ,
           nickimg : usermodel.nickimg ,
           userid : user.userid 
        };
      }
    
    }
    // 加密用户数据
    let userStr = CryptoJS.AES.encrypt(JSON.stringify(returnParam), crypKey).toString();
    // this.cookie("token", userStr ,{
    //   timeout: 7 * 24 * 3600 //设置 cookie 有效期为 7 天
    // });
    return this.success(userStr);
  }

  async logininAction(){
    let ciphertext = this.post().s;
    if(!ciphertext) return this.fail(-1,'empty');

    // 解密
    let bytes  = CryptoJS.AES.decrypt(ciphertext, crypKey);
    let _userInfo = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

    if(!_userInfo.userName || !_userInfo.password){
      return this.fail(-1,'用户名或密码为空！');
    }

    // 实例表
    let model_userinfo = this.model('userinfo');

    // 查询是否存在
    let userInfo =  await model_userinfo.field('id userid,nickname,nickimg,phone').where({
      username : _userInfo.userName ,
      password : MD5(_userInfo.password)
    }).select();

    if(userInfo.length <= 0){
      return this.fail(-1,'用户名或密码错误！');
    }
    userInfo = userInfo[0];

    let time = DateFormat(new Date(), "yyyy-mm-dd hh:MM:ss");
    // 更新最后登录时间
    model_userinfo.where({id:userInfo.userid}).update({lastlogintime:time});
    // 加密用户数据
    let userStr = CryptoJS.AES.encrypt(JSON.stringify(userInfo), crypKey).toString();
    // this.cookie("token", userStr ,{
    //   timeout: 7 * 24 * 3600 //设置 cookie 有效期为 7 天
    // });
    return this.success(userStr);
  }

  loginoutAction(){
    this.cookie("token", null);
    return this.success('login out');
  }
}