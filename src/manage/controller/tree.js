'use strict';

import Base from './base.js';

export default class extends Base {
    async indexAction(){
        return this.display('list');
    }

    /**
     * 获得列表树，返回一个格式化后的Tree
     * @return {[type]} [description]
     */
    async listAction(){
        let model_tree = this.model('tree');
        let list = await model_tree.field(['id,title,pid,deep,remark']).order('id').select();
        if(!list || list.length <= 0) return this.success({});
        let list_len = list.length;
        /**
         * 得到父节点为ID的节点
         * @param  {[type]} startIndex [开始遍历的索引]
         * @param  {[type]} id         [description]
         * @return {[type]}            [description]
         */
        let getChilds = function(startIndex, pid){
            let item    = undefined ,
                node    = undefined ,
                childs  = undefined ,
                res     = [] ;
            for(let i=startIndex;i<list_len;i++){
                item    = list[i];
                if(item.pid == pid) {
                    node = {text:item.title ,id:item.id ,pid:item.pid ,deep:item.deep ,remark:item.remark};
                    childs = getChilds(i ,item.id);
                    if(childs.length > 0) node.nodes = childs;
                    res.push(node);
                }
            }
            return res;
        },
        getTreeList = function (data) {
            let pid     = undefined ,
                node    = undefined ,
                childs  = undefined ,
                res     = [] ;

            data.map( (k ,v) =>{
                pid = k.pid;
                // users.map( (uv) => {if(k.user_id == uv.id){k.user_name = uv.name; } });
                if(pid == '0'){
                    node = {text:k.title ,id:k.id ,pid:pid ,deep:k.deep ,remark:k.remark};
                    childs = getChilds(v ,k.id);
                    if(childs.length > 0) node.nodes = childs; 
                    res.push(node);
                }
            });
            return res;
        }
        
        return this.success(getTreeList(list));
    }

    detailAction(){
        console.log('detailAction');
        return this.success({a:'detailAction'});
    }

    async deleteAction(){
        console.log();
        let id = this.get().id;
        if(!id) return this.fail({errno: -1, errmsg: '请填写完整参数'});
        let model_tree = this.model('tree');
        model_tree.delete({where: {id: id} });
        return this.success('删除成功！');
    }

    async saveAction(){
        let param = this.post();
        let row = {
            id      : this.get().id ,
            title   : param.title ,
            pid     : param.pid ,
            deep    : param.deep ,
            remark  : param.remark 
        }
        let model_tree = this.model('tree');
        if(param.optType == 1){
           let insertId = await model_tree.add(row);
           return this.success('添加成功');
        }else if(param.optType == 2){
            let insertId = await model_tree.update(row);
            return this.success('修改成功');
        }else{
            return this.fail({errno: -1, errmsg: '请填写完整参数'});
        }
    }

}