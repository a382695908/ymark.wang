'use strict';

import Base from './base.js';
let DateFormat = require('dateformat');

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
        return this.fail('用户数据不存在！');
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

    console.log('设置 请求端的COOkie：',JSON.stringify({token:param.access_token ,userid:returnParam.userid}));

    this.cookie("userInfo", JSON.stringify({token:param.access_token ,userid:returnParam.userid}) ,{
      timeout: 1 * 24 * 3600 // 1天
    });
    return this.success(returnParam);
  }

  async logininAction(){

    console.log('post :', this.post());

    return this.success('login in');
  }

  loginoutAction(){
    this.cookie("userInfo", null);
    return this.success('login out');
  }
}