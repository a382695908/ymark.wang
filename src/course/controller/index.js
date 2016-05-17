'use strict';

import Base from './base.js';

export default class extends Base {
  /**
   * index action
   * @return {Promise} []
   */
  async indexAction() {
    let list = await this.model('course').field('uid,name,coverpics,summary,lasttime').order('addtime desc').select();
    this.list = list;
    return this.display();
  }

  async detailAction() {
    var uid = this.get().id;
    let list = await this.model('course').where({
      uid: uid
    }).field('uid,name,coverpics,summary,lasttime').limit(0, 1).select();
    this.model = list[0];
    return this.display('detail_list');
  }

  /**
   * 详细页目录列表，根据课程的UID
   * @return {[type]} [description]
   */
  async cataloglistAction() {
    let uid = this.get().uid;
    if (!uid) return this.fail('UID为空！');
    let model_catalog = this.model('coursecatalog');
    let list = await model_catalog.order('id').where({
      cuid: uid
    }).select();
    if (!list || list.length <= 0) return this.success({});
    let list_len = list.length;
    /**
     * 得到父节点为ID的节点
     * @param  {[type]} startIndex [开始遍历的索引]
     */
    let getChilds = function(startIndex, pid) {
        let item = undefined,
          node = undefined,
          childs = undefined,
          res = [];
        for (let i = startIndex; i < list_len; i++) {
          item = list[i];
          if (item.pid == pid) {
            node = {
              id: item.id,
              text: item.title,
              remark: item.remark
            };
            childs = getChilds(i, item.id);
            if (childs.length > 0) node.nodes = childs;
            res.push(node);
          }
        }
        return res;
      },
      getTreeList = function(data) {
        let pid = undefined,
          node = undefined,
          childs = undefined,
          res = [];

        data.map((k, v) => {
          pid = k.pid;
          if (pid == 0) {
            node = {
              id: k.id,
              text: k.title,
              remark: k.remark
            };
            childs = getChilds(v, k.id);
            if (childs.length > 0) node.nodes = childs;
            res.push(node);
          }
        });
        return res;
      }
    return this.success(getTreeList(list));
  }

  async contentAction() {
    var id = this.get().id;
    let list = await this.model('coursecontent').where({
      cid: id
    }).field('id,title,labels,summary,content,lasttime,viewnum,recontent').limit(0, 1).select();
    return this.success(list[0])
  }

  async mindAction() {
    var param = this.get(),
      uid = param.uid,
      cid = param.id;
    if (!uid || !cid) return this.fail('参数出错！');
    let list = await this.model('coursemind').field([
      'nid id',
      'pnid parentid',
      'title topic',
      'expanded',
      'url'
    ]).where({
      cuid: uid,
      cid: cid
    }).order('nid').select();
    return this.success(list);
  }

}