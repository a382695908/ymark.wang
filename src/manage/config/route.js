'use strict';
/// 规则如下
/// 做了分支：
/// 	1.一个信息 	：/xxx/info
/// 	2.多个信息  ：/xxx/list
/// 
/// 比如课程模块
/// 
/// 加载课程列表模板		get 	/mcourse/list/
/// 获取所有的课程			get 	/mcourse/list/all
///  
/// 添加一个课程 			post 	/mcourse/info
/// 获取一个课程 			get 	/mcourse/info/xxxx
/// 修改一个课程 			put 	/mcourse/info/xxxx
/// 删除一个课程			delete 	/mcourse/info/xxxx
/// 

export default [
	// /manage/article -> manage/article/index
	// 在article.js中 定义indexAction(){ return this.display('list'); }
	// 这样就实现了自动输出模板
];