'use strict';

import Base from './base.js';
import treeUtil from './treeutil.js';
let DateFormat = require('dateformat');
export default class extends Base {
    async indexAction() {
        return this.display('list');
    }

    //获得列表树，返回一个格式化后的Tree
    async listAction() {
        let uid = this.get().uid;
        if (!uid) return this.fail('UID为空！');
        let model_catalog = this.model('coursecatalog');
        let list = await model_catalog.where({
            cuid: uid
        }).order('pid,sort').select();
        if (!list || list.length <= 0) return this.success({});
        return this.json({
            json: treeUtil.getCatalogTree(list),
            list: list
        });
    }

    savesortAction() {
        let uid = this.get().uid;
        let param = this.post();
        let updlist = JSON.parse(param.data);
        let sqlList = [],
            _tmp = null;
        for (let item in updlist) {
            _tmp = updlist[item];
            sqlList.push({
                pid: _tmp.pid,
                sort: _tmp.sort,
                id: item
            });
        }
        let model = this.model('coursecatalog');
        model.updateMany(sqlList);
        return this.success('保存成功');
    }

    //根据父节点，获得所有的子节点
    async childlistAction() {
        let params = this.get() || {},
            pid = params.pid,
            current = params.current || 1,
            rowCount = params.rowCount || 10;

        if (!pid) return this.fail('参数出错！');

        let model = this.model('coursecatalog');
        let list = await model.field([
            'id',
            'title name',
            'sort'
        ]).where({
            pid: pid
        }).page(current, rowCount).order('sort').select();
        return this.success(list);
    }

    async deleteAction() {
        let id = this.get().id;
        // cuid = this.post().uid;
        if (!id) return this.fail({
            errno: -1,
            errmsg: '请填写完整参数'
        });
        let model_catalog = this.model('coursecatalog'),
            model_coursemind = this.model('coursemind'),
            model_coursecontent = this.model('coursecontent');

        model_catalog.delete({
            where: {
                id: id
            }
        });
        model_coursecontent.delete({
            where: {
                cid: id
            }
        });
        model_coursemind.delete({
            where: {
                cid: id
            }
        });
        return this.success('删除成功！');
    }

    async saveAction() {
        let param = this.post();
        let id = this.get().id;
        let row = {
            nodeid: param.nodeid,
            deep: param.deep,
            title: param.title,
            pid: param.pid,
            cuid: param.cuid,
            remark: param.remark
        }
        let model_catalog = this.model('coursecatalog');
        if (id) {
            if (id == 'add') {
                // 添加的时候，会向文章表中插入一条所关联的文章的记录
                let model_coursecontent = this.model('coursecontent'),
                    model_coursemind = this.model('coursemind');
                let time = DateFormat(new Date(), "yyyy-mm-dd hh:MM:ss"),
                    userId = this.getUserId();
                // 先获取在他之前有几个兄弟节点，然后sort + 1
                let maxSort = await model_catalog.where({
                    pid: param.pid
                }).max('sort');
                if (maxSort == null) {
                    maxSort = 1;
                } else {
                    maxSort += 1;
                }
                row.sort = maxSort;
                let catalogId = await model_catalog.add(row);
                let contentId = await model_coursecontent.add({
                    title: param.title,
                    cuid: param.cuid,
                    cid: catalogId,
                    status: 0,
                    addtime: time,
                    lasttime: time,
                    adduser: userId
                });
                await model_coursemind.add({
                    nid: 'root',
                    pnid: '0',
                    title: param.title,
                    cuid: param.cuid,
                    cid: catalogId,
                    ctid: catalogId
                });
                return this.success('添加成功');
            } else {
                await model_catalog.where({
                    id: id
                }).update(row);
                return this.success('修改成功');
            }
        } else {
            return this.fail({
                errno: -1,
                errmsg: '请填写完整参数'
            });
        }
    }

}