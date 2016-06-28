'use strict';

export default class extends think.controller.base {
  /**
   * some base method in here
   */
  async __before() {

    const allowAccessOrigin = this.http.headers.origin;

    this.header('Access-Control-Allow-Origin', allowAccessOrigin);
    this.header('Access-Control-Allow-Headers', 'Content-Type,Content-Length, Authorization, Accept,X-Requested-With');
    this.header('Access-Control-Allow-Credentials', 'true');

    this.getUser = function(){

    }

    this.getUserId = function(){
        return '1';
    }

    if(think.env == 'development'){
      this.STATICURL='';
    }else{
      this.STATICURL='http://static.ymark.wang';
    }
  }
}