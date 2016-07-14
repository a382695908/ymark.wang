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
		'cy-ds': 'https://changyan.sohu.com/js/changyan.labs.https.js?appid=cysmsRfN6',	//畅云-打赏
		'cy-pl': 'http://changyan.sohu.com/upload/changyan.js',	//畅云-评论
	},
	preload: 'jquery'
});

var CNT = CMD = CTG = extFun = null;
var isPhone = false; 	// 查看方式是否为手机
var isContent = false ,	//是否有内容
	contentHeight = 0;	// 内容的高度

var $treeSide = null;
seajs.use(['jquery', 'tree', 'hlcss'], function() {
	CTG = Catalog();
	CNT = Content();
	CMD = CourseMind();
	$treeSide = $('.tree-side');
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
	isPhone = 'fixed' == $treeSide.css('position');
	if(isPhone){ // 移动端，不加载评论

	}else{
		setTimeout(CY,100);
	}
	
});

// 畅云相关
function CY(){
	seajs.use(['cy-pl'], function() {
		window.changyan.api.config({
			appid: 'cysmsRfN6', 
			conf: 'prod_f76b245414b99243ceadf39762200c60'
		});
	});
}

function Catalog() {
	var $tree = $('#catalogtree');
	var $body = $('#body');
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
				if(isPhone){	//移动用户；单击后应该隐藏选择框
					$body.removeClass('phone-side-open');
					$treeSide.animate({left:'-250px'});
				}else{
					 $('body').animate({scrollTop:'0'} ,0);
				}
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

	return {
		togglePhoneSide : function(){
			if($body.hasClass('phone-side-open')){
				$body.removeClass('phone-side-open');
				$treeSide.animate({left:'-250px'});
			}else{
				$body.addClass('phone-side-open');	
				$treeSide.animate({left:0});
			}
		},

		hidePhoneSide : function(){
			$body.removeClass('phone-side-open');
			$treeSide.animate({left:'-250px'});
		}
	}
}

function CourseMind() {
	var $panelFrame = $('#divFrame'),
		$frame = $('#iframeMind');

	var show = false;
	return {
		hide: function() {
			$frame.removeAttr('src');
			$panelFrame.height(0);
			show = false;
		},
		show: function() {
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
				$content.show();
				isContent = true;
				$content.html('<div class="content">'+data.content+'</div>');
				//所有的a标签，都是打开一个新页面
				$content.find('a').each(function() {
					$(this).attr('target', '_blank');
				});
			}else{
				isContent = false;
				if(!CMD.getStatus()){
					$content.html('还没有录入内容');	
				}else{
					$content.hide();
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
				// jQuery.ajax({
	   //              url: '/course/content/' + cid, // 跳转到 action  
	   //              // async   : true ,            //默认值: true。默认设置下，所有请求均为异步请求。如果需要发送同步请求，请将此选项设置为 false。同步请求将锁住浏览器
	   //              cache: true, //默认值: true，dataType 为 script 和 jsonp 时默认为 false。设置为 false 将不缓存此页面。
	   //              ifModified  : true ,       //仅在服务器数据改变时获取新数据。默认值: false。使用 HTTP 包 Last-Modified 头信息判断。
	   //              timeout: '5000', //设置请求超时时间（毫秒）。此设置将覆盖全局设置。
	   //              type: 'get',
	   //              dataType: 'json',
	   //              success: function(data) {
	   //              	console.log('sss:' ,data);
	   //                  callback(data);
	   //              },
	   //              error: function() {
	   //                  callback({err: '错误！'});
	   //              }
	   //          });
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