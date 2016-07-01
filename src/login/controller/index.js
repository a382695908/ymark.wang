'use strict';

import Base from './base.js';

export default class extends Base {
  /**
   * index action
   * @return {Promise} []
   */
  indexAction(){
    return this.display();
  }

  infoAction(){
    return this.success('222');
  }

  loginoutAction(){
    return this.success('login out');
  }
}