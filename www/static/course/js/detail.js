seajs.config({
	// 设置路径，方便跨目录调用
	paths: {
		'editor': BASEURL+'/static/fun/editor/',
	},
	// 设置别名，方便调用
	alias: {
		'jquery': '//apps.bdimg.com/libs/jquery/2.1.4/jquery.min.js',
		'tree': BASEURL+'/static/m/js/bootstrap-treeview.js',
		'hlcss': 'editor/atelier-forest-dark.css',
	},
	preload: 'jquery'
});

var CNT = CMD = extFun = null;
var isContent = false ,	//是否有内容
	contentHeight = 0;	// 内容的高度
seajs.use(['jquery', 'tree', 'hlcss'], function() {
	Catalog();
	CNT = Content();
	CMD = CourseMind();
	extFun = {
		/**
		 * 得到地址栏中所匹配到的CatalogID
		 * @return {int} CatalogID
		 */
		getUrlNid: function() {
			var hash = window.location.hash;
			if (hash) {
				hash = hash.substring(1);
				var p = hash.split('-');
				return {
					cid: p[0],
					nodeId: p[1]
				};
			}
		}
	}
	contentHeight = $('body').height() - 50 - 20 - 30;
	console.log('height:' ,contentHeight);
});

function Catalog() {
	var $tree = $('#catalogtree');
	$.get('/course/catalog/' + courseuid, null, function(e) {
		if (e.errno > 0) {
			console.error(e.errmsg);
			return;
		}
		e = e.data;
		$tree.treeview({
			data: e,
			levels: 100,
			onNodeSelected: function(e, node) {
				document.location.hash = '#' + node.id + '-' + node.nodeId;
				CMD.hide();
				CNT.loadContent(node.id, function() {
					CMD.reset(node.id);
				});
			}
		});
		var p = extFun.getUrlNid();
		if (!p) {
			p = e[0].id;
			CNT.loadContent(p, function() {
				CMD.reset(p);
			});
		} else {
			// 加载左侧的变蓝
			var nodeId = p.nodeId,
				cid = p.cid;
			$('[data-nodeid="' + nodeId + '"]').addClass('node-selected').css({
				color: '#FFFFFF',
				backgroundColor: '#428bca'
			});
			CNT.loadContent(cid, function() {
				CMD.reset(cid);
			});
		}
	})
}

function CourseMind() {
	var $panelFrame = $('#divFrame'),
		$frame = $('#iframeMind');

	var show = false;
	return {
		hide: function() {
			console.log('hide isContent:' ,isContent);
			$frame.removeAttr('src');
			$panelFrame.height(0);
			show = false;
		},
		show: function() {
			console.log('isContent:' ,isContent);
			if(!isContent){
				$panelFrame.height(contentHeight);	
			}else{
				$panelFrame.height('700');
			}
			
		},
		reset: function(catalogId) {
			if (!catalogId) {
				$panelFrame.height(0);
				show = false;
				return;
			}
			$frame.attr('src', '/course/mind/index/' + courseuid + '/' + catalogId);
			show = true;
		},
		getStatus : function(){
			return show;
		}
	}
}

function Content() {
	var $content = $('#divcontent'),
		$title = $('#info_title'),
		cacheData = {};

	var loadInfo = function(data, callback) {
		$title.html(data.title);
		setTimeout(function() {
			if(data.content){
				isContent = true;
				$content.html('<div class="content">'+data.content+'</div>');
				//所有的a标签，都是打开一个新页面
				$content.find('a').each(function() {
					$(this).attr('target', '_blank');
				});
			}else{
				isContent = false;
				if(!CMD.getStatus()){
					$content.html('<div class="bird noneContent"> 还没有录入内容 </div> <div class="bird"> <div class="big"></div> <div class="middle"></div> <div class="small"></div> </div>');	
				}
			}
		}, 200);
		callback(data);
	}

	return {
		loadContent: function(cid, callback) {
			callback = callback || function() {};
			var data = cacheData[cid];
			$content.html('');
			if (data) { //已经存在值了
				loadInfo(data, callback);
			} else {
				$.get('/course/content/' + cid, {}, function(e) {
					if (e.errno > 0) {
						console.error(e.errmsg);
						return;
					}
					e = e.data;
					cacheData[cid] = e;
					loadInfo(e, callback);
				});
			}
		}
	}
}