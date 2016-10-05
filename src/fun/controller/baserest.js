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