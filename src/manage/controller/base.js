'use strict';

let CryptoJS = require("crypto-js");
let crypKey = think.config('crypKey');

export default class extends think.controller.rest {
  /**
   * some base method in here
   */
  async __before() {

    const allowAccessOrigin = this.http.headers.origin;

    this.header('Access-Control-Allow-Origin', allowAccessOrigin);
    this.header('Access-Control-Allow-Headers', 'Content-Type,Content-Length, Authorization, Accept,X-Requested-With');
    this.header('Access-Control-Allow-Methods', "GET, POST, PUT, DELETE, OPTIONS");
    this.header('Access-Control-Allow-Credentials', 'true');

    console.log('qingqiudaodecookie:');
    let ciphertext = this.cookie("token");
    console.log('this cookie:->' ,ciphertext)

    if(!ciphertext){
      return this.fail(-2, '未登录！');
    }

    // 解密
    let bytes  = CryptoJS.AES.decrypt(ciphertext, crypKey);
    let _userInfo = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));


    if(!_userInfo || !_userInfo.userid){
      return this.fail(-2 ,'登录信息不正确！');
    }

    console.log('_userInfo:',_userInfo)

    this.getUser = function(){

    }

    this.getUserId = function(){
        return _userInfo.userid;
    }

    if(think.env == 'development'){
      this.STATICURL='';
    }else{
      this.STATICURL='http://static.ymark.wang';
    }
  }

  __call(){
    return this.fail('not found');
  }
}