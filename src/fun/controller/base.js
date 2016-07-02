'use strict';

export default class extends think.controller.base {
  /**
   * some base method in here
   */
  async __before() {

    const allowAccessOrigin = this.http.headers.origin;

    this.header('Access-Control-Allow-Origin', allowAccessOrigin);
    this.header('Access-Control-Allow-Headers', 'Content-Type,Content-Length, Authorization, Accept,X-Requested-With');
    this.header('Access-Control-Allow-Credentials', 'true');
  }
}