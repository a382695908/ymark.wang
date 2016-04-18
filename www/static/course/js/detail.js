(function($) {
	var objCatalogue 	= undefined ,
		objDiagram 		= undefined ,
		objEditor 		= undefined ;

	var courseuid = $('#courseuid').val() ;


	$(function () {
		catalog();
		setTimeout(diagram ,50);
		setTimeout(content ,200);
	});



	function catalog(){
		$.get('/course/catalog/'+courseuid ,null,function(e){
			if(e.errno > 0){console.error(e.errmsg); return; }
			objCatalogue = $('#divcatalogue').treeview({
				data 	: e.data ,
				levels 	: 100 ,
				onNodeSelected     : function(e ,node){
					// objForm.loadNodeInfo(node); 
				}
			});
		})
	}

	/**
	 * 加载结构图
	 * @return {[type]} [description]
	 */
	function diagram(){
		var mind = {
            "meta":{
                "name":"ss",
                "author":"hizzgdev@163.com",
                "version":"0.2",
            },
            "format":"node_array",
            "data":[
                {"id":"root", "isroot":true, "topic":"jsMind"},

                {"id":"sub1", "parentid":"root", "topic":"sub1"},
                {"id":"sub11", "parentid":"sub1", "topic":"sub11"},
                {"id":"sub12", "parentid":"sub1", "topic":"sub12"},
                {"id":"sub13", "parentid":"sub1", "topic":"sub13"},

                {"id":"sub2", "parentid":"root", "topic":"sub2"},
                {"id":"sub21", "parentid":"sub2", "topic":"sub21"},
                {"id":"sub22", "parentid":"sub2", "topic":"sub22"},

                {"id":"sub3", "parentid":"root", "topic":"sub3"},
            ]
        };
        var options = {
            container:'divdiagram',
            editable:false,
            theme:'primary'
        }
        var jm = jsMind.show(options,mind);
	}

	function content(){
        $.get('/course/content/'+courseuid ,null,function(e){
            // $('#divcontent').html()
        });
		 

	}
	

})(jQuery);