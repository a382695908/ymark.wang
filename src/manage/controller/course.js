'use strict';
let UID = require('node-uuid');
let DateFormat = require('dateformat');
import Base from './base.js';

export default class extends Base {
    async getAction(){
        //获取信息
        if(this.id){

            return this.success('data');
        }
        // 获取列表
        else{

            let params      = this.get() || {},
                key         = params.searchPhrase,
                current     = params.current || 1,
                rowCount    = params.rowCount || 10;

            let where = {'adduser': this.getUserId() }
            if (key) { where['name'] = ['like', '%' + key + '%']; }

            let model = this.model('course');
            let articleList = await model.alias('base').join(['question q on base.uid=q.cuid']).group('base.uid').order('base.lasttime desc')
                                .field(['base.uid', 'base.name', 'base.summary', 'base.coverpics', 'base.lasttime' ,'count(q.id) questionnum'])
                                .page(current, rowCount).where(where).select();

            let count = await model.where(where).count('uid');

            return this.success({
              "current": current,
              "rowCount": rowCount,
              "rows": articleList,
              "total": count
            });
        }
    }

    // 添加一条数据
    async postAction(){
        
        let param = this.post();
        let uid = param.uid,
            name = param.name,
            time = DateFormat(new Date(), "yyyy-mm-dd hh:MM:ss");
        let row = {
            name: name, //课程名称
            coverpics: param.coverpics, //封面（存图片的，多张图片用逗号隔开）
            summary: param.summary, //简要介绍
            reurl: param.reurl, //关联的资料的路径（一个课程可以绑定一本所参考的教材，这里存的是教材的路径）
            lasttime: time, //最后更新时间
        }
        let model_course = this.model('course'),
            model_coursecatalog = this.model('coursecatalog'),
            model_coursemind = this.model('coursemind'),
            model_coursecontent = this.model('coursecontent');

        let userId = this.getUserId();
        // 添加的时候，还需要向课程目录表，插入一条内容
        // 当目录被添加时，向课程内容表中插入记录
        uid = UID.v1();
        row.uid = uid;
        row.adduser = userId; //创建人
        row.addtime = time; //创建时间
        row.status = 0; //状态（0：未上线，1：已上线，2：已下线）
        await model_course.add(row); //添加课程目录
        let catalogId = await model_coursecatalog.add({
            nodeid: 'r',
            cuid: uid,
            deep: 0,
            title: name,
            pid: 0,
            sort: 0
        }); //向课程目录表插入默认记录
        let contentId = await model_coursecontent.add({
            title: name,
            cuid: uid,
            cid: catalogId,
            status: 0,
            addtime: time,
            lasttime: time,
            adduser: userId
        }); //向课程内容表中插入记录
        await model_coursemind.add({
            nid: 'root',
            pnid: '0',
            title: name,
            cuid: uid,
            cid: catalogId,
            ctid: contentId
        });
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