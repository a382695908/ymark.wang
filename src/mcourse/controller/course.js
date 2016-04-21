'use strict';
let UID = require('node-uuid');
let DateFormat = require('dateformat');
import Base from './base.js';

export default class extends Base {
    async indexAction(){
        return this.display('list');
    }

    detailAction(){
        console.log('detailAction');
        return this.success({a:'detailAction'});
    }

    async deleteAction(){
        let id = this.get().id;
        if(!id) return this.fail({errno: -1, errmsg: '请填写完整参数'});
        let model_tree = this.model('tree');
        model_tree.delete({where: {id: id} });
        return this.success('删除成功！');
    }

    async saveAction(){
        let param = this.post();
        let uid = param.uid ;
        let time = DateFormat(new Date(), "yyyy-mm-dd hh:MM:ss");
        let row = {
            name        : param.name , //课程名称
            coverpics   : param.coverpics , //封面（存图片的，多张图片用逗号隔开）
            summary     : param.summary , //简要介绍
            reurl       : param.reurl , //关联的资料的路径（一个课程可以绑定一本所参考的教材，这里存的是教材的路径）
            lasttime    : time , //最后更新时间
        }
        let model = this.model('course');
        if(!uid){
            uid = UID.v1();
            row.uid = uid;
            row.adduser = '1' ; //创建人
            row.addtime = time; //创建时间
            row.status  = 0 ; //状态（0：未上线，1：已上线，2：已下线）
            await model.add(row);
            return this.success(uid);
        }else{
            let insertId = await model.update(row).where({uid:uid});
            console.log(insertId);
            return this.success('修改成功');
        }
    }

}