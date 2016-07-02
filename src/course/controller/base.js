'use strict';

export default class extends think.controller.base {
	__before() {
		const allowAccessOrigin = this.http.headers.origin;
		// console.log(this.http.res);
		// this.header('Access-Control-Allow-Origin', allowAccessOrigin);
		// this.header('Access-Control-Allow-Headers', 'Content-Type,Content-Length, Authorization, Accept,X-Requested-With');
		// this.header('Access-Control-Allow-Credentials', 'true');
		// this.header("Cache-Control", "no-cache, no-store, must-revalidate");
		// this.header("Pragma", "no-cache");
		// this.header("Expires", 0);

		// res.header("Cache-Control", "no-cache, no-store, must-revalidate");
		//   	res.header("Pragma", "no-cache");
		//   	res.header("Expires", 0);
		this.getUserId = function() {
			return '1';
		}
		if(think.env == 'development'){
			this.STATICURL='';
		}else{
			this.STATICURL='http://static.ymark.wang';
		}
	}
}