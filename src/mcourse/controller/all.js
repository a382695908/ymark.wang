'use strict';

import Base from './base.js';

export default class extends Base {
	indexAction(){
		return this.display('list');
	}
	
  	async listAction(){
  		let params 	= this.post() || {};
  		let limit 	= params.limit || 10 ;
  		let page 	= (params.offset / limit) + 1 ;

	  	// let model 	= this.model('course') ;
	  	// let userList 	= await model.field([
	  	// 	'uid',
	  	// 	'title',
	  	// 	'synopsis',
	  	// 	'status',
	  	// 	"date_format(lasttime,'%Y年%m月%d日 %k:%i:%s') lasttime",
	  	// 	"date_format(addtime,'%Y年%m月%d日 %k:%i:%s') addtime",
	  	// ]).page(page, limit).select();

	  	let count = await model.count('uid');
	    var data = [
            {
                "id": 0,
                "name": "Item 0",
                "price": "$0"
            },
            {
                "id": 1,
                "name": "Item 1",
                "price": "$1"
            },
            {
                "id": 2,
                "name": "Item 2",
                "price": "$2"
            },
            {
                "id": 3,
                "name": "Item 3",
                "price": "$3"
            },
            {
                "id": 4,
                "name": "Item 4",
                "price": "$4"
            },
            {
                "id": 5,
                "name": "Item 5",
                "price": "$5"
            }
        ];
	   	return this.success({
	   		data 	: userList ,
	   		count 	: count
	   	});
  	}

  	detailAction(){
	  	let id = this.get("id");
	  	console.log('-------->');
	  	console.log(id)
	    return this.success({a:'33332'});
  	}
}