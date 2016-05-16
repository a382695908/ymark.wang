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

        return this.display('index');
    }
    async detailAction() {
        let param = this.get();
        let list = await this.model('coursemind').field([
            'nid id',
            'pnid parentid',
            'title topic',
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
        let param = this.post(),
            catalogId = param.catalogId,
            data = param.data;
        if (!data) return this.success('没有任何操作!');

        data = JSON.parse(data);
        let adds = data.add,
            upds = data.upd,
            dels = data.del,
            thms = data.thm,
            newList = [];

        let model_catalog = this.model('coursecatalog'),
            model = this.model('coursemind');

        if (thms.update_structure) {
            model_catalog.update({
                structure: thms.update_structure,
                id: catalogId,
            });
        }

        if (thms.changeClassic) {
            model_catalog.update({
                classic: JSON.stringify(thms.changeClassic),
                id: catalogId,
            });
        }


        if (adds.length > 0) {
            newList = [];
            adds.map((k) => {
                newList.push({
                    nid: k.id,
                    pnid: k.parent,
                    title: k.title,
                    expanded: (k.collapsed ? '1' : '0'),
                    cuid: cuid,
                    cid: catalogId,
                });
            });
            if (newList.length > 0) {
                await model.addMany(newList);
            }

        }

        if (upds.length > 0) {
            newList = [];
            let rootsql = '';
            upds.map((k) => {
                if (k.id == 'root') {
                    rootsql = "UPDATE `coursemind` SET `title`='" + k.title + "',`expanded`=" + (k.collapsed ? '1' : '0') + ",`style`='" + (k.style ? JSON.stringify(k.style) : '') + "',`icons`='" + (k.icons ? JSON.stringify(k.icons) : '') + "',`url`='" + (k.link ? JSON.stringify(k.link) : '') + "',`remark`='" + (k.note ? k.note : '') + "' WHERE ( `nid` = 'root' and cuid='" + cuid + "' );";
                } else {
                    newList.push({
                        nid: k.id,
                        pnid: k.parent,
                        title: k.title,
                        expanded: (k.collapsed ? '1' : '0'),
                        style: (k.style ? JSON.stringify(k.style) : ''),
                        icons: (k.icons ? JSON.stringify(k.icons) : ''),
                        url: (k.link ? JSON.stringify(k.link) : ''),
                        remark: (k.note ? k.note : '')
                    });
                }
            });
            if (newList.length > 0) {
                await model.updateMany(newList);
            }
            if (rootsql) {
                await model.execute(rootsql);
            }
        }

        if (dels.length > 0) {
            await model.delete({
                where: {
                    nid: ["IN", dels]
                }
            })
        }



        return this.success('保存完成');
    }

    async save1Action() {
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