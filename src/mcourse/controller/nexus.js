'use strict';

import Base from './base.js';
let DateFormat = require('dateformat');
export default class extends Base {
    async indexAction() {
        return this.display('list');
    }

    //获得列表树，返回一个格式化后的Tree
    async listAction() {
        console.log(this.get());
        let uid = this.get().uid;
        if (!uid) return this.fail('UID为空！');
        let model_catalog = this.model('coursecatalog');
        let list = await model_catalog.order('id').where({
            cuid: uid
        }).order('sort').select();
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
                            nodeid: item.nodeid,
                            cuid: item.cuid,
                            deep: item.deep,
                            text: item.title,
                            pid: item.pid,
                            sort: item.sort,
                            remark: item.remark,
                            wimport: item.wimport,
                            wscore: item.wscore
                        };
                        childs = getChilds(0, item.id);
                        if (childs.length > 0) node.children = childs;
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
                    if (pid == '0') {
                        node = {
                            id: k.id,
                            nodeid: k.nodeid,
                            cuid: k.cuid,
                            deep: k.deep,
                            text: k.title,
                            pid: k.pid,
                            sort: k.sort,
                            remark: k.remark,
                            wimport: k.wimport,
                            wscore: k.wscore
                        };
                        childs = getChilds(0, k.id);
                        if (childs.length > 0) node.children = childs;
                        res.push(node);
                    }
                });
                return res;
            }

        return this.json(getTreeList(list));
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
                    nid: '1',
                    pnid: 0,
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