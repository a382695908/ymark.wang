'use strict';

import Base from './base.js';
import treeUtil from './treeutil.js';
let DateFormat = require('dateformat');
export default class extends Base {
    async indexAction() {
        let param = this.get();
        let cuid = param.uid,
            cid = param.id;

        if (!cuid || !cid) return this.fail('参数错误！');
        let model = this.model('coursemind');
        let list = await model.where({
            cuid: cuid,
            cid: cid
        }).select();
        var data = treeUtil.getMindTree(list);
        this.treeJson = JSON.stringify(data);
        return this.display('index');
    }
    async detailAction() {
        let param = this.get();
        let list = await this.model('coursemind').field([
            'nid id',
            'pnid parentid',
            'title topic',
            'direction',
            'expanded',
            'url'
        ]).where({
            cid: param.id,
            cuid: param.uid
        }).order('nid').select();
        return this.success(list);
    }

    async saveAction() {
        let cuid = this.get().cuid;
        let method = this.http.method;
        if (method != 'POST' && method != 'PUT' && !cuid) return this.fail('提交错误');
        let param = this.post(),
            cid = param.catalogId;
        if (!cid) return this.fail('参数错误！');
        let list = JSON.parse(param.list);

        let newList = [];
        list.map((k) => {
            newList.push({
                nid: k.id,
                pnid: (k.parentid || ''),
                title: k.topic,
                direction: (k.direction || 'right'),
                expanded: (k.expanded || '1'),
                cuid: cuid,
                cid: cid,
                url: (k.url || '')
            });
        });
        // 删除所有，之后再增加
        let model = this.model('coursemind');
        await model.delete({
            where: {
                cuid: cuid,
                cid: cid
            }
        });
        let rows = await model.addMany(newList, {}, true);
        return this.success('保存完成');
    }
}