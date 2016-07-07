'use strict';

export default class extends think.controller.base {
  /**
   * some base method in here
   */
  async __before() {

    const allowAccessOrigin = this.http.headers.origin;

    this.header('Access-Control-Allow-Origin', allowAccessOrigin);
    this.header('Access-Control-Allow-Headers', 'Content-Type,Content-Length, Authorization, Accept,X-Requested-With');
    this.header('Access-Control-Allow-Methods', "GET, OPTIONS ,POST");
    // this.header('Access-Control-Allow-Credentials', 'true');

    let method = this.http.method;
    if(method == 'OPTIONS'){
      return this.fail(-1);
    }


  }

  __call(){
    return this.fail('not found');
  }
}