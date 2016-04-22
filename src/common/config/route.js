'use strict';

export default {
	mcourse : {reg :/^mcourse/ }
};

// export default [

// 	[/^course\/(\w+)$/ , "course/index/detail?id=:1"],
// 	[/^course\/catalog\/(\w+)$/ , "course/index/cataloglist?id=:1"],
// 	[/^course\/content\/(\w+)$/ , "course/index/content?id=:1"],

// 	[/^test\/(\w+)$/ ,{
// 		get 	: "mcourse/test/:1" 
// 	}],

// 	// /manage/article -> manage/article/index
// 	// 在article.js中 定义indexAction(){ return this.display('list'); }
// 	// 这样就实现了自动输出模板
// 	[/^mcourse\/(\w+)$/ ,{
// 		get 	: "mcourse/:1/index" ,
// 		post 	: "mcourse/:1/save"
// 	}],

	

// 	[/^mcourse\/(\w+)\/(\w+)$/, {
// 	    get 	: "mcourse/:1/detail?id=:2",
// 	    delete 	: "mcourse/:1/delete?id=:2",
// 	    put 	: "mcourse/:1/save?id=:2"
// 	}]
// ];