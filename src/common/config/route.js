'use strict';
/**
 * err config
 */
export default [
	// /manage/article -> manage/article/index
	// 在article.js中 定义indexAction(){ return this.display('list'); }
	// 这样就实现了自动输出模板
	[/^mcourse\/(\w+)$/ ,{
		get 	: "mcourse/:1/index" ,
		post 	: "mcourse/:1/save"
	}],



	[/^mcourse\/(\w+)\/(\w+)$/, {
	    get 	: "mcourse/:1/detail?id=:2",
	    delete 	: "mcourse/:1/delete?id=:2",
	    put 	: "mcourse/:1/save?id=:2"
	}],
	["manage/article/:year/:month", "manage/article/list"]
];