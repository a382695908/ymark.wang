'use strict';
let UID = require('node-uuid');
let DateFormat = require('dateformat');
import Base from './baserest.js';

export default class extends Base {
    async getAction(){
        let key = this.id;
        let model_inventory = this.model('inventory');
        //获取信息
        if(key){
            if(key == 'new'){
                let dataList = await model_inventory.field('date,data,type').group('type').order('date desc').select();
                console.log('dataList:',dataList)
                let dateObj = {};
                let nowData = null;
                dataList.map((k) => {
                    if(k.type == 1){
                        dateObj.survival = DateFormat(new Date(k.date), "yyyy-mm-dd");
                    }else if(k.type == 2){
                        dateObj.pickup = DateFormat(new Date(k.date), "yyyy-mm-dd");
                    }else if(k.type == 3){
                        dateObj.now = DateFormat(new Date(k.date), "yyyy-mm-dd");
                        nowData = k.data;
                    }
                })
                return this.success({data:nowData ,date:dateObj});
            }
            return this.success('data');
        }
        // 获取列表
        else{

            // let params      = this.get() || {},
            //     key         = params.searchPhrase,
            //     current     = params.current || 1,
            //     rowCount    = params.rowCount || 10;

            // let where = {'adduser': this.getUserId() }
            // if (key) { where['name'] = ['like', '%' + key + '%']; }

            // let model = this.model('course');
            // let articleList = await model.alias('base').join(['question q on base.uid=q.cuid']).group('base.uid').order('base.lasttime desc')
            //                     .field(['base.uid', 'base.name', 'base.summary', 'base.coverpics', 'base.lasttime' ,'count(q.id) questionnum'])
            //                     .page(current, rowCount).where(where).select();

            // let count = await model.where(where).count('uid');

            // return this.success({
            //   "current": current,
            //   "rowCount": rowCount,
            //   "rows": articleList,
            //   "total": count
            // });
            return this.success('2');
        }
    }

    // 添加一条数据
    async postAction(){
        let param = this.post();
        let time = DateFormat(new Date(), "yyyy-mm-dd hh:MM:ss"),
            date = DateFormat(new Date(), "yyyy-mm-dd"),
            type = param.type,
            data = param.data;

        let row = {
            uid: UID.v1(), 
            date: date, 
            type: type, 
            data: JSON.stringify(data), 
            addtime: time, 
        }
        let model_inventory = this.model('inventory');
        let syData = await model_inventory.limit(1).where('type=3').select();
        let syUid = syData[0].uid;
        syData = JSON.parse(syData[0].data);
        let _z=0,_j=0;        
        if(type == 1){ // 存货
            for(let k in syData){
                _j = parseInt(data[k] || 0);
                _z = parseInt(syData[k]) || 0;
                syData[k] = _j + _z;
            }
        }else{
            for(let k in syData){
                _j = parseInt(data[k] || 0);
                _z = parseInt(syData[k]) ;
                if(_z >= _j){
                    syData[k] = _z - _j;
                }else{
                    syData[k] = 0;
                }
            }
        }
        await model_inventory.where("uid='"+syUid+"'").update({data:JSON.stringify(syData)});
        await model_inventory.add(row);
        return this.success('添加成功！');
    }

    // 修改一条数据
    async putAction(){
        if(!this.id){
            return this.fail('id为空！');
        }

        let param = this.post();

        let uid = param.uid,
            name = param.name,
            time = DateFormat(new Date(), "yyyy-mm-dd hh:MM:ss");

        let model_course = this.model('course');

        let row = {
            name: name, //课程名称
            coverpics: param.coverpics, //封面（存图片的，多张图片用逗号隔开）
            summary: param.summary, //简要介绍
            reurl: param.reurl, //关联的资料的路径（一个课程可以绑定一本所参考的教材，这里存的是教材的路径）
            lasttime: time, //最后更新时间
        }


        let insertId = await model_course.where({
            uid: uid
        }).update(row);
        return this.success('修改成功');
    }

    async testAction(){
        
        return this.success('删除成功！');
    }

    async deleteAction(){
        let uid = this.id;
        if (!uid) return this.fail('id为空！');
        // 需要删除 课程表、课程目录表、课程内容表、课程结构表、课程分享表、试题表、纠错表
        let model_course = this.model('course'),
            model_coursecatalog = this.model('coursecatalog'),
            model_coursecontent = this.model('coursecontent'),
            model_coursemind = this.model('coursemind'),
            model_courseshare = this.model('courseshare'),
            model_question = this.model('question'),
            model_buglog = this.model('buglog');

        model_course.delete({where: {uid: uid } });
        model_coursemind.delete({where: {cuid: uid } });
        model_coursecatalog.delete({where: {cuid: uid } });
        model_coursecontent.delete({where: {cuid: uid } });
        model_courseshare.delete({where: {cuid: uid } });
        model_question.delete({where: {cuid: uid } });
        model_buglog.delete({where: {cuid: uid } });
        return this.success('删除成功！');
    }
}