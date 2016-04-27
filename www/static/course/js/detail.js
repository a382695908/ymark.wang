(function($) {
	var objCatalogue 	= undefined ,
		objDiagram 		= undefined ,
		objContent 		= undefined ;

	var courseuid = $('#courseuid').val() ;


	$(function () {
		objCatalogue 	= catalog();
		loadEvent();
		objDiagram 		= diagram();
		objContent 		= content();

	});

	function loadEvent() {
		var $show = $('[showTo]');
		$show.click(function () {
			var self = $(this);
			$show.removeClass('active');
			self.addClass('active');
			$(self.attr('hideTo')).hide();
			$(self.attr('showTo')).show();
		});

	}

	function catalog(){
		$.get('/course/catalog/'+courseuid ,null,function(e){
			if(e.errno > 0){console.error(e.errmsg); return; }
			objCatalogue = $('#divcatalogue').treeview({
				data 	: e.data ,
				levels 	: 100 ,
				onNodeSelected     : function(e ,node){
					objContent.loadContent(node.id); 
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
            container:'divstruct',
            editable:false,
            theme:'primary'
        }
        var jm = jsMind.show(options,mind);

        return {
        	loadDiagram 	: function(courseuid){
        		
        	}
        }
	}

	function content(){
        var $content = $('#divcontent') 
		return {
		 	loadContent : function(courseuid){
		 		$.get('/course/content/'+courseuid ,null,function(e){
		          	if(e.errno > 0){console.error(e.errmsg); return; }
		          	e = e.data;
		          	$content.html(e.content);
		        });
		 	}
		 }

	}
	

})(jQuery);