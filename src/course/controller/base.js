'use strict';

export default class extends think.controller.base {
  	__before(){
	  	this.getUserId = function(){
	        return '1';
	    }
	}
}