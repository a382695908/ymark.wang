'use strict';
/**
 * err config
 */
export default [
	// /manage/article -> manage/article/index
	// 在article.js中 定义indexAction(){ return this.display('list'); }
	// 这样就实现了自动输出模板
	[/^manage\/(\w+)$/ ,{
		get 	: "manage/:1/index" ,
		post 	: "manage/:1/save"
	}],



	[/^manage\/(\w+)\/(\w+)$/, {
	    get 	: "manage/:1/detail?id=:2",
	    delete 	: "manage/:1/delete?id=:2",
	    put 	: "manage/:1/save?id=:2"
	}],
	["manage/article/:year/:month", "manage/article/list"]
];