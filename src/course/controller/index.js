'use strict';

import Base from './base.js';

export default class extends Base {
  /**
   * index action
   * @return {Promise} []
   */
  indexAction(){
    //auto render template file index_index.html
    return this.display();
  }

  detailAction(){
    console.log('2222222222222');
    return this.display('detail_list');
  }

  /**
   * 详细页目录列表，根据课程的UID
   * @return {[type]} [description]
   */
  cataloglistAction(){
    var tree = [
      {text: "教程信息" },
      {text: "序/前言"},
      {text: "整体知识结构图"},
      {
        text: "第一章 诸论",
        nodes: [
          {
            text: "什么是项目",
            nodes: [{text: "项目的定义"}, {text: "信息系统项目的特点"} ]
          },
          {text: "项目与日常运营"},
          {text: "项目和战略"},
          {text: "项目管理的定义及其他知识范围"},
          {text: "项目管理需要的专门知识领域" ,
              nodes: [
                {text: "项目管理知识体系"}, 
                {text: "应用领域的知识、标准和规定"}, 
                {text: "理解项目环境"}, 
                {text: "一般的管理知识和技能"}, 
                {text: "处理人际关系技能"} ]
          },
          {text: "项目管理高级话题"}
        ]
      },
      
      {
        text: "Parent 3"
      },
      {
        text: "Parent 4"
      },
      {
        text: "Parent 5"
      }
    ];
    return this.success(tree)
  }

  contentAction(){
    var res = [
      '项目具有临时性、独特性和渐进性特点。',
      '',
      '1. 临时性：每个项目都有确定的开始和结束。',
      '2. 独特的产品、服务或成果：',
      '  项目创造独特的可交付成果：产品、服务、成果。',
      '  - 产品：项目可以创造、生产出来可以量化的产品或制品。',
      '  - 服务：',
      '  - 成果：',
      '3. 渐进明细：项目逐步完善的过程。',
      '  渐进明细意味着分布、连续的积累。',
    ];
    return this.success(res.join(''))
  }

}