'use strict';
let UID = require('node-uuid');
let DateFormat = require('dateformat');
import Base from './baserest.js';

export default class extends Base {
    async getAction(){
        let key = this.id;
        let model_inventory = this.model('inventory');
        //获取信息
        if(key == 'new'){
            let nowData = await model_inventory.field('date,data').where('type=3').select();
            let clist = await model_inventory.field('addtime,data').order('addtime desc').where("type=1").limit(10).select();
            let qlist = await model_inventory.field('addtime,data').order('addtime desc').where("type=2").limit(10).select();
            return this.success({data:nowData[0].data,record:{pickup:qlist ,survival:clist}});
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
}