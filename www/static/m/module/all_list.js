seajs.config({
  // 设置路径，方便跨目录调用
  paths: {
    'js' 	: '/static/js/',
    'mjs' 	: '/static/m/js/' ,
    'fjs' 	: '/static/fun/' 
  },

  // 设置别名，方便调用
  alias: {
    'bootstrap'	: 'js/bootstrap.min.js',
    'material'	: 'mjs/material.min.js',
    'ripples'	  : 'mjs/ripples.min.js',
    'treeview'	: 'mjs/bootstrap-treeview.js',
    'jsmind'	  : 'mjs/jsmind/jsmind.js',
    'jsminddraggable'	: 'mjs/jsmind/jsmind.draggable.js',
    'layer'     : 'fjs/layer/layer.js',
    'ymark'	    : 'mjs/ymark.js',
    
  }
});
var layer = undefined ;
seajs.use(['bootstrap' ,'material' ,'ripples' ,'layer' ,'ymark'] ,function() {
    $.material.init();
    layer.config({path: '/static/fun/layer/'});
    var objForm = courseForm() ,
        loadingIndex = undefined ;
    $('#btnAddCourse').click(function(){
      $('#modal_course_form').modal();
      objForm.resetForm();
    });
    $('#btnSaveCourse').click(objForm.saveForm);
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
        loadingIndex = layer.load(1, {
          shade: [0.4,'#fff'] //0.1透明度的白色背景
        });
    });
});

function courseForm(){
    var $formTitle  = $('#courseForm') ,
        $name       = $('#courseName') ,
        $summary    = $('#courseSummary') ;
 
    var uid         = undefined ;   // 当前操作表单课程的UID

    var callback_save   = function (e) {
        if(e.errno > 0){console.error(e.errmsg); return; }
        $.info(e.data);
    }
    return {
        /**
         * 重置表单
         * @param  {int} type undefined : 添加，否则，修改
         */
        resetForm   : function (_uid) {
          console.log(_uid);
          if(!_uid){ //添加
              $formTitle.text('添加课程');
          }else{
              uid = _uid;
              $formTitle.text('修改课程');
          }
        },
        /**
         * 保存一个表单
         */
        saveForm  : function(){
            if(!$name.val()){$.error('请填写课题名称啊~少年'); return; }
            var summary = $summary.val();
            if(!summary){$.error('最好填写一下简要介绍！比如：<br/>软考-高级，结构化整理<br/>等等'); return; }
            if(summary.length >= 200){$.error('字数不要超过200字~');return;}
            var param = {uid:uid ,name:$name.val() ,summary:summary} ;
            if(uid) $.query('/mcourse/course/'+uid ,param ,callback_save ,'put');
            else $.query('/mcourse/course/' ,param ,callback_save ,'post');
        }
    }
}