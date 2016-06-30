'use strict';

import Base from './base.js';

export default class extends Base {
  indexAction() {
    return this.display();
  }

  async allAction() {
    let params = this.get() || {},
      key = params.searchPhrase,
      current = params.current || 1,
      rowCount = params.rowCount || 10;


    let where = {
      'adduser': this.getUserId()
    }

    if (key) {
      where['name'] = ['like', '%' + key + '%'];
    }


    let model = this.model('course');
    let list = await model.field([
      'uid',
      'name',
      'summary',
      'coverpics',
      'lasttime'
    ]).where(where).page(current, rowCount).select();

    let count = await model.count('uid');

    return this.json({
      "current": current,
      "rowCount": rowCount,
      "rows": list,
      "total": count
    });
  }
}