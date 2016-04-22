'use strict';

import Base from './base.js';

export default class extends Base {
    async indexAction(){
        let model   = this.model('course') ;
        this.list = await model.field([
            'uid',
            'name'
        ]).where({'adduser'   : this.getUserId() }).select(); ;
        return this.display();
    }
	
  	async allAction(){
  		let params 	= this.post() || {};

	  	let model 	= this.model('course') ;
	  	let list 	= await model.field([
            'uid',
            'name',
            'summary',
            'coverpics'
	  	]).where({'adduser'   : this.getUserId() }).select();

	  	let count = await model.count('uid');
	   
	   	return this.success(list);
  	}
}