'use strict';

export default class extends think.controller.base {
  /**
   * some base method in here
   */
  __before(){
  	let http = this.http;
  	// console.log(http.version);
  	// console.log(http.headers);
  	// console.log(http.host);
  	//判断COOKIE中是否有信息
  }
}