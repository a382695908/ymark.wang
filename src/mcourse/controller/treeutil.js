'use strict';


export default {
  /**
   * 根据Catalog表，返回TREE
   * @return {[type]} [description]
   */
  getCatalogTree: function(data) {
    if (!data || data.length <= 0) return [];
    let list_len = data.length;
    let pid = undefined,
      node = undefined,
      childs = undefined,
      res = [];

    let getChilds = function(startIndex, pid) {
      let item = undefined,
        node = undefined,
        _childs = undefined,
        res = [];
      for (let i = startIndex; i < list_len; i++) {
        item = data[i];
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
          _childs = getChilds(0, item.id);
          if (_childs.length > 0) node.children = _childs;
          res.push(node);
        }
      }
      return res;
    };

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
  },
  getMindTree: function(data) {
    console.log(data);
    if (!data || data.length <= 0) return [];
    let list_len = data.length;
    let pnid = undefined,
      node = undefined,
      res = [];

    let getChilds = function(startIndex, pnid) {
      let item = undefined,
        node = undefined,
        _childs = undefined,
        _res = [];
      for (let i = startIndex; i < list_len; i++) {
        item = data[i];
        if (item.pnid == pnid) {
          node = {
            id: item.nid,
            title: item.title,
            parent: item.pnid,
            note: item.remark,
            collapsed: (item.expanded == '1' ? true : false)
          };
          _childs = getChilds(0, item.nid);
          node.children = _childs;
          _res.push(node);
        }
      }
      return _res;
    };

    data.map((k, v) => {
      pnid = k.pnid;
      if (pnid == '0') {
        node = {
          id: k.nid,
          title: k.title,
          parent: k.pnid,
          note: k.remark,
          collapsed: (k.expanded == '1' ? true : false)
        };
        node.children = getChilds(0, k.nid);
        res.push(node);
      }
    });
    return res;
  }
}