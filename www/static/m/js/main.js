seajs.config({
  // 设置路径，方便跨目录调用
  paths: {
    'js' 	: '/static/js/',
    'mjs' 	: '/static/m/js/' ,
    'fjs' 	: '/static/fun/' 
  },

  // 设置别名，方便调用
  alias: {
    'bootstrap'         : 'js/bootstrap.min.js',
    'material'          : 'mjs/material.min.js',
    'ripples'           : 'mjs/ripples.min.js',
    'treeview'          : 'mjs/bootstrap-treeview.js',
    'jsmind'            : 'mjs/jsmind/jsmind.js',
    'jsminddraggable'	: 'mjs/jsmind/jsmind.draggable.js',
    'ymark'	            : 'mjs/ymark.js',
    'layer'             : 'fjs/layer/layer.js',
    'jquery-ui'         : 'fjs/upload/jquery-ui.min.js',
    'plupload'          : 'fjs/upload/plupload.full.min.js',
    'plupload-ui'       : 'fjs/upload/jquery.ui.plupload.min.js',
  } ,
  preload : 'bootstrap'
});
var layer = undefined ;
seajs.use(['ripples','material' ,'layer' ,'ymark'] ,function() {
    $.material.init();
    layer.config({path: '/static/fun/layer/'});
    
    var loadingIndex = undefined ;
    $(document).ajaxComplete(function(e,req, set){
        var res = req.responseJSON;
        layer.close(loadingIndex);
        if(res.errno || res.errno > 0){
            $.error(res.errmsg);
        }
    });

    $(document).ajaxError(function(e,req, set){
        layer.close(loadingIndex);
        console.log('ajaxError');
        console.log(req);
        console.log(set);
        $.error('请求出错啦~');
    });

    $(document).ajaxSend(function(e,req, set){
        loadingIndex = layer.load('加载中', {icon: 16 , shade: [0.3,'#fff'] }); 
    });
});

function noImg(){
    var img=event.srcElement;
    img.src="/static/img/none.png";
    img.onerror=null; //控制不要一直跳动
}