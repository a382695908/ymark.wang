'use strict';
/**
 * config
 */
export default {
  	encoding 	: "utf-8" ,
  	route_on 	: true ,
  	timeout 	: 30,
  	json_content_type: "application/json", //json 输出时设置的 Content-Type
  	resource_reg: /^((static|upload)\/|[^\/]+\.(?!js|html)\w+$)/, //静态资源的正则

  	uiStatic : '123123123123',

  	crypKey 	: 'xiaoli'
};