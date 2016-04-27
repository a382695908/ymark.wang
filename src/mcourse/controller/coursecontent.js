'use strict';

import Base from './base.js';
let DateFormat = require('dateformat');
export default class extends Base {
    async indexAction(){
        return this.display('list');
    }

    async detailAction(){
        let cid     = this.get().id;
        let list    = await this.model('coursecontent').field([
                'id',
                'title',
                'labels',
                'content',
                'summary',
                'lasttime',
                'recontent',
            ]).where({cid:cid}).select();
        return this.success(list[0]);
    }

    async saveAction(){
        let id     = this.get().id;
        let method  = this.http.method;
        if(method!='POST' && method!='PUT' && !id) return this.success('提交错误');

        let param   = this.post();
        let savetype= param.savetype ,
            time    = DateFormat(new Date(), "yyyy-mm-dd hh:MM:ss");   

        let row = {
            content     : param.content ,
            lasttime    : time ,
            status      : 1
        }
        let model = this.model('coursecontent');
        if(savetype == 'quick'){    //快速保存
            await model.where({id:id}).update(row);
            return this.success('保存完成');
        }else{  // 保存

        }


        console.log(param);
        console.log('--->');
        console.log(id)
        return this.success('c');
    }
}