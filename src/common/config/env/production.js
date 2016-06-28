'use strict';

export default {
    STATIC_PATH : 'http://static.ymark.wang/',
  	log_error	: true, //是否打印错误日志
  	log_request	: true, //是否打印请求的日志
  	auto_reload	: false, //自动重新加载修改的文件，development 模式下使用
  	gc: {
    	on 		: true ,
    	interval: 3600, // 处理时间间隔，默认为一个小时
  	},
  	error: {
    	detail 	: true
  	}
};