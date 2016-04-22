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
    // https://thinkjs.org/zh-cn/doc/2.2/question.html#toc-244
    //部分 action 下不检查
    // let blankActions = ["login"];
    // if(blankActions.indexOf(this.http.action)){
    //   return;
    // }
    // let userInfo = await this.session("userInfo");
    // //判断 session 里的 userInfo
    // if(think.isEmpty(userInfo)){
    //   return this.redirect("/user/login");
    // }
    this.getUser = function(){

    }

    this.getUserId = function(){
        return '1';
    }
  }
}