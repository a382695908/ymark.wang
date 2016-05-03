(function($) {
	var objCatalogue 	= null ,
		objDiagram 		= null ,
		objContent 		= null ,


		courseuid 		= $('#courseuid').val() ,

		$btnShowMind 	= $('#spanShowTypeMind') ,
		// 一些扩展的方法
		extFun 			= {
			/**
			 * 得到当前显示的内容
			 * @return {int} 1:知识点结构图，2:文章内容
			 */
			getShowType : function(){
				return $btnShowMind.hasClass('active') ? '1' : '2';
			},
			getHeight 	: function(){
				var _height ;
	            if(window.navigator.userAgent.indexOf("Firefox")>0){ _height = window.document.documentElement.scrollHeight; }
	            else{
	              if(window.addEventListener) {_height=window.document.body.scrollHeight; }
	              else if(window.attachEvent) {_height=jQuery(window).height();} 
	            }
	            return _height;
			},
			getWidth : function(){
	            var _width ;
	            if(window.navigator.userAgent.indexOf("Firefox")>0){ _width = window.document.documentElement.scrollWidth; }
	            else{
	              if(window.addEventListener) {_width=window.document.body.scrollWidth; }
	              else if(window.attachEvent) {_width=jQuery(window).width();} //> ? =IE8 [升级到11的IE8]
	            }
	            return _width;
	        },
	        /**
	         * 得到地址栏中所匹配到的CatalogID
	         * @return {int} CatalogID
	         */
	        getUrlNid : function(){
	        	var hash = window.location.hash;
	        	if(hash){
	        		hash = hash.substring(1);
	        		var p = hash.split('-');
	        		return {cid:p[0] ,nodeId:p[1]};
	        	}
	        }
		}


	$(function () {
		seajs.config({
		  // 设置别名，方便调用
		  alias: {
		  	'jsmindstyle'		: '/static/fun/jsmind/jsmind.css',
		    'jsmind'   			: '/static/fun/jsmind/jsmind.js',
		    'jsminddshot'		: '/static/fun/jsmind/jsmind.screenshot.js',
		    'tree'	            : '/static/m/js/bootstrap-treeview.js',
		    'hlcss'	            : '/static/fun/editor/atelier-forest-dark.css',
		    'hljs'	            : '/static/fun/editor/highlight.min.js'
		  }
		});
		seajs.use(['tree' ,'jsmind' ,'jsmindstyle' ,'jsminddshot' ,'hlcss' ,'hljs'] ,function() {
			objCatalogue 	= catalog();
			objDiagram 		= diagram();
			objContent 		= content();
			var height 		= extFun.getHeight() - 102,
				width 		= extFun.getWidth() - 280;
			$('#divstruct').width(width).height(height);
		});
		var $btnShowCont 	= $('#spanShowTypeCont') ,
			$content 		= $('#divcontent') ,
			$mind 	 		= $('#divstruct') ;

		$btnShowCont.click(function(){
			$content.show();
			$btnShowMind.removeClass('active');
			$(this).addClass('active');
			$mind.css('z-index','-1').css('visibility','hidden');
		});

		$btnShowMind.click(function(){
			$content.hide();
			$btnShowCont.removeClass('active');
			$(this).addClass('active');
			$mind.css('z-index','999').css('visibility','visible');
		})
	});

	function catalog(){
		var $tree = $('#divcatalogue');
		$.get('/course/catalog/'+courseuid ,null,function(e){
			if(e.errno > 0){console.error(e.errmsg); return; }
			e = e.data;
			$tree.treeview({
				data 	: e ,
				levels 	: 100 ,
				onNodeSelected     : function(e ,node){
					document.location.hash='#'+node.id+'-'+node.nodeId;
					objContent.loadContent(node.id ,function(){
						objDiagram.loadDiagram(node.id);
					}); 
				}
			});
			var p = extFun.getUrlNid();
			if(!p){
				p = e[0].id; 
				objContent.loadContent(p ,function(){objDiagram.loadDiagram(p); });
			}else{
				// 加载左侧的变蓝
				var nodeId 	= p.nodeId ,
					cid 	= p.cid;
				$('[data-nodeid="'+nodeId+'"]').addClass('node-selected').css({color:'#FFFFFF',backgroundColor:'#428bca'});
				objContent.loadContent(cid ,function(){objDiagram.loadDiagram(cid); });
			}
		})
	}

	/**
	 * 加载结构图
	 * @return {[type]} [description]
	 */
	function diagram(){
		var objDiagram = null ,

			cacheData = {};

        objDiagram = jsMind.show({
            container:'divstruct',
            editable:false,
            theme:'primary'
        });

        var loadMind = function(data ,callback){
			data[0]['isroot'] = true; 
	        objDiagram.show({
				"meta":{"name":"", "author":"328179934@qq.com", "version":"0.2"},
	            "format":"node_array",
	            "data": data
	        });
	        callback(data);
        }
        return {
        	loadDiagram 	: function(cid ,callback){
        		callback = callback || function(){};
        		var data = cacheData[cid];
		 		if(data){	//已经存在值了
		 			loadMind(data ,callback);
		 		}else{
		 			$.get('/course/mind/'+cid ,{uid:courseuid},function(e){
			          	if(e.errno > 0){console.error(e.errmsg); return; }
			          	e = e.data;
			          	cacheData[cid] = e;
			          	loadMind(e ,callback);
			        });
		 		}
        	}
        }
	}

	function content(){
        var $content 	= $('#divcontent') ,
        	$title 		= $('#info_title'),
        	cacheData 	= {};


        var loadInfo 	= function(data ,callback){
        	$title.html(data.title);
        	$content.html(data.content);
        	//加入代码高亮
        	$content.find('pre code').each(function(i, block) {hljs.highlightBlock(block); });
			//所有的a标签，都是打开一个新页面
			$content.find('a').each(function(){$(this).attr('target','_blank'); });
        	callback(data);
        }

		return {
		 	loadContent : function(cid ,callback){
		 		callback = callback || function(){};
		 		var data = cacheData[cid];
		 		if(data){	//已经存在值了
		 			loadInfo(data ,callback);
		 		}else{
		 			$.get('/course/content/'+cid ,{},function(e){
			          	if(e.errno > 0){console.error(e.errmsg); return; }
			          	e = e.data;
			          	cacheData[cid] = e;
			          	loadInfo(e ,callback);
			        });
		 		}
		 	}
		 }
	}
})(jQuery);