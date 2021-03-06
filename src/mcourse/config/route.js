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
	[/^mcourse\/info\/(\S*)$/, {
		get: "mcourse/course/detail?id=:1",
		post: "mcourse/course/save?id=:1",
		delete: "mcourse/course/delete?id=:1",
		put: "mcourse/course/save?id=:1"
	}],
	[/^mcourse\/nexus\/sort\/(\S*)$/, {
		post: "mcourse/nexus/savesort?uid=:1"
	}],
	[/^mcourse\/nexus\/(((?!chdlist).)*)$/, {
		get: "mcourse/nexus/list?uid=:1",
		post: "mcourse/nexus/save?id=:1",
		delete: "mcourse/nexus/delete?id=:1",
		put: "mcourse/nexus/save?id=:1"
	}],
	[/^mcourse\/nexus\/(chdlist)/, {
		get: "mcourse/nexus/childlist"
	}],
	[/^mcourse\/cc\/(\S*)$/, { //course content
		get: "mcourse/coursecontent/detail?id=:1",
		post: "mcourse/coursecontent/save?id=:1",
		delete: "mcourse/coursecontent/delete?id=:1",
		put: "mcourse/coursecontent/save?id=:1"
	}],
	[/^mcourse\/cm\/index\/(\S*)\/(\S*)$/, {
		get: "mcourse/coursemind/index?uid=:1&id=:2"
	}],

	[/^mcourse\/cm\/(\S*)$/, { //course mind
		get: "mcourse/coursemind/detail?id=:1",
		post: "mcourse/coursemind/save?cuid=:1",
		delete: "mcourse/coursemind/delete?id=:1",
		put: "mcourse/coursemind/save?cuid=:1"
	}],
	[/^mcourse\/(((?!list).)*)$/, {
		get: "mcourse/course/index?id=:1"
	}],
];