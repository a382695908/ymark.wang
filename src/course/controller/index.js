'use strict';

import Base from './base.js';
import treeUtil from '../../mcourse/controller/treeutil.js';
var moment = require('moment');
export default class extends Base {
  /**
   * index action
   * @return {Promise} []
   */
  async indexAction() {
    let list = await this.model('course').field('uid,name,coverpics,summary,lasttime').select();
    this.list = list;
    return this.display('index');
  }

  async mindindexAction() {
    let param = this.get();
    let cuid = param.uid,
      cid = param.id;
    if (!cuid || !cid) return this.fail('参数错误！');
    let model = this.model('coursemind');
    let model_catalog = this.model('coursecatalog');
    let list = await model.where({
      cuid: cuid,
      cid: cid
    }).select();

    let cataloglist = await model_catalog.where({
      cuid: cuid,
      id: cid
    }).select();
    let catalogmodel = cataloglist[0];
    let data = treeUtil.getMindTree(list);

    // 设置一些全局变量
    this.treeJson = JSON.stringify(data); //脑图数的数据
    this.cuid = cuid; //课程的UID
    this.cid = cid; //目录的UID
    this.structure = catalogmodel.structure || 'mind'; //脑图显示的结构类型
    this.catalogtitle = catalogmodel.title; //脑图的标题
    let classic = catalogmodel.classic; //脑图的风格
    if (classic) {
      classic = JSON.parse(classic);
      this.classic_bg = classic.bg;
      this.classic_classic = classic.classic;
    } else {
      this.classic_bg = "rgb(255,255,255)";
      this.classic_classic = "defaultClassic";
    }
    return this.display('mind');
  }

  async detailAction() {
    let uid = this.get().id;
    let list = await this.model('course').alias('base')
    .join('userinfo us on base.adduser = us.id')
    .where("base.uid='"+uid+"'")
    .field('base.uid,base.name,base.coverpics,base.lasttime,us.nickname author').limit(0, 1).select();
    this.cuid = uid; //课程的UID
    let model = list[0];
    model.time = moment(model.lasttime).format('YYYY-MM-DD') 
    this.model = model;
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
    let list = await model_catalog.where(" cuid='"+uid+"'").order('pid,sort').select();
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
            res = getChilds(v, k.id);
          }
        });
        return res;
      }
    return this.success(getTreeList(list));
  }

  async contentAction() {
    let id = this.get().id;
    let list = await this.model('coursecontent').where({cid:id}).field('id,cuid,title,labels,summary,content,lasttime,viewnum,recontent').limit(0, 1).select();
    let model = list[0];
    let mind_count = await this.model('coursemind').where({cid:id ,cuid:model.cuid}).count();
    model.showmind = mind_count > 1;
    model.lasttime = moment(model.lasttime).format('YYYY-MM-DD') 
    return this.success(model);
  }

  async mindAction() {
    let param = this.get(),
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