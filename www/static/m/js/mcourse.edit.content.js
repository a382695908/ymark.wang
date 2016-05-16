seajs.config({
	// 设置路径，方便跨目录调用
	paths: {
		'mjs': '/static/m/js/',
		'fjs': '/static/fun/',
		'editor': '/static/fun/editor/',
	},
	// 设置别名，方便调用
	alias: {
		'jquery': '//apps.bdimg.com/libs/jquery/2.1.4/jquery.min.js',
		'editor': 'editor/wangEditor.js',
		'layer': '//apps.bdimg.com/libs/layer/2.1/layer.js',
		'util': 'mjs/util.js',
		'ionic': '/static/css/ionicons.min.css',

		'tree': 'fjs/tree/jstree.min.js',
		'treestyle': 'fjs/tree/default/style.min.css',

		'plupload': 'fjs/upload/plupload.full.min.js',
		'editorcss': 'editor/wangEditor.css',
		'editorPlugin': 'editor/js/custom-menu.js',

		'hlcss': 'editor/atelier-forest-dark.css',
		'hljs': 'editor/highlight.min.js'
	},
	preload: 'jquery'
});
/**
 * CW : CourseWindow
 * CCG : CourseCatalog
 * CCT : CourseContent
 * objEditor : 编辑器对象
 * quid : 课程的UID
 */
var CW = CCG = CCT = layer = objEditor = quid = null;

var frameConfig = null;


var
/**
 * 一些常用的方法，和对象没有关系
 */
	extFun = {
	/**
	 * 获取当前正在编辑的类型；
	 * @return {[type]} 0:知识点结构图，1:文章内容
	 */
	getEditType: function() {
		console.log()
		if ($('#panelEditor').css('zIndex') == '99') {
			return '1';
		}
		return '0';
	},
	setBtnTyping: function(dom, text, icon) {
		dom.html('&nbsp;&nbsp;' + text);
		dom.removeAttr('class');
		dom.addClass(icon).addClass('btn').addClass('ionic');
	}
}

seajs.use(['jquery', 'layer', 'util', 'tree', 'treestyle', 'ionic'], function() {
	layer.config({
		path: '/static/fun/layer/'
	});
	CW = CWindow();
	CCG = CCatalog();
	CCT = CContent();
	loadEditor();
	quid = $('#uid').val();


	// 单击保存的时候，锁住按钮
	// 主要是如果单击保存的时候，快速保存不能被单击；或单击快速保存的时候，保存不能被单击
	// 0 : 可以被触发保存，1:不可以被触发
	var btnSaveStatus = 0,
		layindex_form = 0,

		$panelArticleForm = $('#divPanelArticleForm');

	// 快速保存
	$('#btnContentSaveQuick').click(function() {
		var self = $(this);
		if (btnSaveStatus == 1 || self.attr('read') == '1') {
			return;
		} //避免连续操作
		btnSaveStatus = 1;
		self.attr('read', '1');
		extFun.setBtnTyping(self, '保存中...', 'ion-load-c');
		var callback = function(e) {
			if (e.errno > 0) {
				$.error(e.errmsg);
				extFun.setBtnTyping(self, '保存失败', 'ion-close-round');
			} else {
				extFun.setBtnTyping(self, '保存完成', 'ion-checkmark-round');
			}
			setTimeout(function() {
				self.attr('read', '0');
				btnSaveStatus = 0;
				extFun.setBtnTyping(self, '快速保存', 'ion-ios-download-outline');
			}, 3000);
		}
		if (extFun.getEditType() == '1') { //内容
			CCT.quickSave(function(e) {
				CCT.setSaveStatus(0);
				callback(e);
			});
		} else {
			if (frameConfig) {
				frameConfig.onQuickSave(function() {
					callback({
						errno: 0
					});
				});
			}
			// objMind.quickSave(function(e) {
			// 	objMind.setSaveStatus(0);
			// 	callback(e);
			// });
		}
		btnSaveStatus = 0;
		self.attr('read', '0');
	});

	$('#btnPreview').click(function() {
		window.open('/course/' + quid + '#' + $('#cid').val());
	})

	$('#btnSave').click(function() {
		var self = $(this);
		if (self.hasClass('disable')) {
			return;
		}
		console.log('saveing.kjka...all');
		return;

		if (btnSaveStatus == 1 || self.attr('read') == '1') {
			return;
		} //避免连续操作
		btnSaveStatus = 1;
		self.attr('read', '1');
		var callback = function(e) {
			if (e.errno != 0) {
				$.error(e.errmsg);
				self.html('&nbsp;&nbsp;保存失败');
			} else {
				self.html('&nbsp;&nbsp;保存完成');
			}
			setTimeout(function() {
				self.attr('read', '0');
				btnSaveStatus = 0;
				self.html('&nbsp;&nbsp;保存');
			}, 5000);
		}
		if (extFun.getEditType() == '1') { //内容
			layindex_form = layer.open({
				type: 1,
				title: '保存内容',
				shift: 5,
				content: $panelArticleForm
			});
			callback({
				errno: 0
			});
		} else {
			self.html('&nbsp;&nbsp;保存中...');
			objMind.quickSave(function(e) {
				objMind.setSaveStatus(0);
				callback(e);
			});
		}
	});
});

function loadEditor() {
	var awidth = aheight = 0;
	var uploaderInit = function() {
		//加载自定义上传图片的功能
		seajs.use(['plupload'], function() {
			var btnId = objEditor.customUploadBtnId;
			var containerId = objEditor.customUploadContainerId;
			//实例化一个上传对象
			var uploader = new plupload.Uploader({
				browse_button: btnId,
				url: '/fun/upload/editorimg',
				flash_swf_url: '/static/fun/upload/Moxie.swf',
				sliverlight_xap_url: '/static/fun/upload/Moxie.xap',
				filters: {
					mime_types: [
						//只允许上传图片文件 （注意，extensions中，逗号后面不要加空格）
						{
							title: "图片文件",
							extensions: "jpg,gif,png,bmp"
						}
					]
				}
			});
			//存储所有图片的url地址
			var urls = [];
			//初始化
			uploader.init();
			//绑定文件添加到队列的事件
			uploader.bind('FilesAdded', function(uploader, files) {
				// 文件添加之后，开始执行上传
				uploader.start();
			});

			//单个文件上传之后
			uploader.bind('FileUploaded', function(uploader, file, responseObject) {
				//注意，要从服务器返回图片的url地址，否则上传的图片无法显示在编辑器中
				var url = eval('(' + responseObject.response + ')');
				//先将url地址存储来，待所有图片都上传完了，再统一处理
				urls.push(url.data);
			});

			//全部文件上传时候
			uploader.bind('UploadComplete', function(uploader, files) {
				// 用 try catch 兼容IE低版本的异常情况
				try {
					//打印出所有图片的url地址
					$.each(urls, function(key, value) {
						// 插入到编辑器中
						objEditor.command(null, 'insertHtml', '<img src="' + value + '" style="max-width:100%;"/>');
					});
				} catch (ex) {
					// 此处可不写代码
				} finally {
					//清空url数组
					urls = [];
					// 隐藏进度条
					objEditor.hideUploadProgress();
				}
			});

			// 上传进度条
			uploader.bind('UploadProgress', function(uploader, file) {
				// 显示进度条
				objEditor.showUploadProgress(file.percent);
			});
		});
	}
	seajs.use(['editor', 'hlcss', 'hljs'], function(e) {
		objEditor = new wangEditor('divEditor');
		// console.log(objEditor.config);
		objEditor.config.printLog = false;
		objEditor.config.customUpload = true; // 配置自定义上传
		objEditor.config.customUploadInit = uploaderInit; // 配置上传事件
		objEditor.config.menus = ['bold', 'underline', 'italic', 'strikethrough', 'forecolor', 'indent', '|',
			'quote', 'head', 'code', 'unorderlist', 'orderlist', '|',
			'link', 'unlink', 'table', '|',
			'img', 'insertcode', 'eraser'
		];
		objEditor.onchange = function() {
			CCT.setSaveStatus(1);
		}
		objEditor.create();
		CCG.loadTree();
		var panelHeigh = $('#panelEditor').height();
		$('#divEditor').height(panelHeigh - 30 - 18);
	});
}

function CWindow() {
	var $panelEditor = $('#panelEditor'),
		$panelMind = $('#panelMind'),
		$iframeMind = $('#iframeMind'),

		isShowCatalog = true; //true:已显示

	return {
		/**
		 * 显示编辑器
		 * @return {[type]} [description]
		 */
		showEditor: function() {
			$panelEditor.css({
				zIndex: 99,
				visibility: 'visible'
			});
			$panelMind.css({
				zIndex: -1,
				visibility: 'hidden'
			});
		},
		showMind: function() {
			$panelMind.css({
				zIndex: 99,
				visibility: 'visible'
			});
			$panelEditor.css({
				zIndex: -1,
				visibility: 'hidden'
			});
		},
		refreshMind: function(_id) {
			$iframeMind.attr('src', '/mcourse/cm/index/' + quid + '/' + _id);
		},
		/**
		 * 显示或隐藏目录
		 * @return {[type]} [description]
		 */
		toggleCatalog: function() {
			if (isShowCatalog) {
				$panelEditor.css({
					left: '0px',
					_marginLeft: '0px;'
				});
				$panelMind.css({
					left: '0px',
					_marginLeft: '0px;'
				});
				isShowCatalog = false;
			} else {
				$panelEditor.css({
					left: '250px',
					_marginLeft: '250px;'
				});
				$panelMind.css({
					left: '250px',
					_marginLeft: '250px;'
				});
				isShowCatalog = true;
			}
		}
	}
}

function CContent() {
	var $content = $('#divEditor');
	var id = null,
		title = null,
		labels = null,
		summary = null,
		lasttime = null,
		recontent = null,
		catalogId = 0;

	var saveStatus = 0; //0仅是查看，并未做修改；1已经修改文章

	var saveQuick = function(callback) {
		callback = callback || function() {};
		var param = {
			id: id,
			content: objEditor.$txt.html(),
			savetype: 'quick'
		}
		$.query('/mcourse/cc/' + id, param, callback, 'post');
	}
	return {
		/**
		 * 加载一篇文章
		 * @param  {[type]} catalogId 要加载的文章的目录ID
		 */
		loadArticle: function(_catalogId, callback) {
			callback = callback || function() {};
			catalogId = _catalogId;
			$.get('/mcourse/cc/' + _catalogId, {
				uid: quid
			}, function(e) {
				if (e.errno > 0) {
					$.error(e.errmsg);
					return;
				}
				e = e.data;
				id = e.id;
				title = e.title;
				labels = e.labels;
				summary = e.summary;
				content = e.content;
				lasttime = e.lasttime;
				recontent = e.recontent;
				saveStatus = 0;
				objEditor.$txt.html(content);
				$content.find('pre code').each(function(i, block) {
					hljs.highlightBlock(block);
				});
				callback();
			});
		},
		/**
		 * 调用快速保存的方法
		 */
		quickSave: function(callback) {
			saveQuick(callback);
		},
		/**
		 * 设置当前文章保存的状态
		 * @param {[type]} status 要设置的状态
		 */
		setSaveStatus: function(status) {
			saveStatus = status;
		},
		/**
		 * 得到文章保存的状态
		 * @return {[type]} [description]
		 */
		getSaveStatus: function() {
			return saveStatus;
		},
		/**
		 * 得到当前文章的CID
		 * @return {[type]} [description]
		 */
		getId: function() {
			return catalogId;
		}
	}
}

function CCatalog() {
	var domTree = $('#catalogTree'),
		$cuid = $('#cid');
	var objForm = layindex_form = null;
	var data = [];
	//表单的一些方法
	var catalogForm = function() {
		// var model = {id  ,nodeid ,deep ,title ,pid ,sort ,remark ,wimport ,wscore };
		var $ptitle = $('#catalog_ptitle'),
			$deep = $('#catalog_deep'),
			$title = $('#catalog_title'),
			$remark = $('#catalog_remark'),

			id = null,
			pid = null,
			nodeid = null,
			cuid = $('#uid').val(),
			optType = 1; //1:添加，2:修改

		var $btnclose = $('#catalog_btn_close'),
			$btnsave = $('#catalog_btn_submit'),
			$btnsavenew = $('#catalog_btn_submit_new');

		$btnclose.click(function() {
			layer.close(layindex_form);
		});

		$btnsave.click(function() {
			saveNode(function() {
				layer.close(layindex_form);
			});
		});

		$btnsavenew.click(function() {
			saveNode(function() {
				$title.val('');
				$remark.val('');
				var fd = nodeid.substring(0, nodeid.length - 2);
				var ld = parseInt(nodeid.substr(nodeid.length - 2));
				ld += 1;
				if (ld > 9) {
					nodeid = fd + '' + ld;
				} else {
					nodeid = fd + '0' + ld;
				}
				optType = 1;
				id = 0;
			});
		});

		/**
		 * 获取子节点的节点值
		 * @param  {[type]} pid      [description]
		 * @param  {[type]} pnid     [description]
		 * @param  {[type]} brothers [description]
		 */
		var getNodeId = function(pid, pnid, brothers) {
				var ref = domTree.jstree('get_children_dom', pid),
					inst = jQuery.jstree.reference(ref);

				var maxId = 0, //获取最后两位的值
					bnode = '';

				for (var i = 0, len = brothers.length, item, inode, mid; i < len; i++) {
					item = inst.get_node(brothers[i]);
					inode = item.original.nodeid;
					mid = parseInt(inode.substr(inode.length - 2));
					if (mid > maxId) maxId = mid;
				}
				maxId += 1;
				if (maxId > 9) {
					return pnid + '' + maxId;
				} else {
					return pnid + '0' + maxId;
				}
			},
			/**
			 * 保存一个节点
			 * @param  {Function} callback [description]
			 */
			saveNode = function(callback) {
				var title = $title.val();
				if (!title) {
					$.error('节点名称可不能为空！~');
					return;
				}
				callback = callback || function() {};
				var param = {
					nodeid: nodeid,
					deep: $deep.text(),
					title: title,
					pid: pid,
					cuid: cuid,
					remark: $remark.val()
				}
				var url = '/mcourse/nexus/';
				if (optType == 1) {
					url += 'add';
				} else if (optType == 2) {
					url += id;
				} else {
					$.error('操作类型出错！');
					return;
				}
				$.query(url, param, function(e) {
					if (e.errno > 0) {
						$.error(e.errmsg);
						return;
					}
					$.info(e.data);
					callback();
					domTree.jstree('refresh');
				}, optType == 1 ? 'post' : 'put');
			}

		return {
			/**
			 * 根据父节点，加载子节点的相关信息
			 * @param  {[type]} pnode    [description]
			 * @param  {[type]} brothers [description]
			 * @return {[type]}          [description]
			 */
			loadChildNode: function(pnode, brothers) {
				optType = 1;
				$ptitle.text(pnode.text);
				$deep.text(pnode.deep + 1);
				$title.val('');
				$remark.val('');
				pid = pnode.id;
				nodeid = getNodeId(pnode.id, pnode.nodeid, brothers);
				id = 0;
			},
			/**
			 * 加载一个节点，主要是为了修改节点信息
			 * @param  {[type]} node [description]
			 */
			loadNode: function(node) {
				var ref = domTree.jstree('get_children_dom', node.pid),
					inst = jQuery.jstree.reference(ref);
				if (!inst) {
					return;
				}
				optType = 2;
				var pnode = inst.get_node(node.pid);
				id = node.id;
				$ptitle.text(pnode.text);
				$deep.text(node.deep);
				$title.val(node.text);
				$remark.val(node.remark);
				pid = node.pid;
				nodeid = node.nodeid;
			}
		}
	}
	objForm = catalogForm();
	return {
		loadTree: function() {
			domTree.jstree({
				core: {
					animation: 0,
					check_callback: true,
					data: {
						url: function(node) {
							return '/mcourse/nexus/' + $('#uid').val();
						},
						data: function(node) {
							return {
								'id': node.id
							};
						}
					}
				},
				types: {
					"default": {
						"icon": "ionic ion-ios-bell"
					}
				},
				contextmenu: {
					"items": {
						"create": null,
						"rename": null,
						"remove": null,
						"ccp": null,
						"editMind": {
							"label": "编辑结构图",
							"action": function(data) {
								var inst = jQuery.jstree.reference(data.reference),
									obj = inst.get_node(data.reference).original;
								CW.showMind();
								$('#btnSave').addClass('disable');
								if ($cuid.val() == obj.id) {
									return;
								}
								$cuid.val(obj.id);
								document.location.hash = '#' + obj.id;
								CW.refreshMind(obj.id);

							}
						},
						"editContent": {
							"label": "编辑文章",
							"action": function(data) {
								CW.showEditor();
								var inst = jQuery.jstree.reference(data.reference),
									obj = inst.get_node(data.reference),
									cid = obj.id;
								$('#btnSave').removeClass('disable');
								if (CCT.getId() == cid) return;
								if (CCT.getSaveStatus() == 1) {
									layer.confirm('文章还没有被保存！要不要保存文章后再加载？', {
										btn: ['保存', '不']
									}, function(i) {
										layer.close(i);
										var index = layer.load(1, {
											shade: [0.1, '#fff']
										});
										CCT.quickSave(function() {
											CCT.loadArticle(cid, function() {
												layer.close(index);
											});
										});
									}, function() {
										CCT.loadArticle(cid);
									});
									return;
								} else {
									CCT.loadArticle(cid);
								}
								$cuid.val(cid);
								document.location.hash = '#' + cid;

							}
						},
						"addNode": {
							"label": "添加子节点",
							"action": function(data) {
								var inst = jQuery.jstree.reference(data.reference),
									obj = inst.get_node(data.reference);
								objForm.loadChildNode(obj.original, obj.children);
								layindex_form = layer.open({
									type: 1,
									title: '添加“' + obj.text + '”的子节点',
									shift: 5,
									area: ['350px', '390px'],
									// move : false,
									content: $('#divCatalogForm')
								});
							}
						},
						"delNode": {
							"label": "删除",
							"action": function(data) {
								var inst = jQuery.jstree.reference(data.reference),
									obj = inst.get_node(data.reference),
									node = obj.original,
									child = obj.children;
								if (node.nodeid == 'r') {
									layer.msg('此节点为根节点，不能被删除，只有删除整个课程的时候，此节点才会被删除！');
									return;
								}
								if (child.length > 0) {
									layer.msg('节点存在子节点，不能被删除！你可以一个一个从子节点开始删除~');
								} else {
									layer.confirm('删除节点会把节点所关联的文章删除，一定要删除吗？', {
										btn: ['一定要删除', '还是取消吧']
									}, function() {
										console.log(quid);
										$.query('/mcourse/nexus/' + node.id, {
											uid: quid
										}, function(e) {
											if (e.errno != 0) {
												$.error(e.errmsg);
												return;
											}
											$.info(e.data);
											domTree.jstree('refresh');
										}, 'delete');
									});
								}

							}
						},
						"editNode": {
							"label": "编辑节点",
							"action": function(data) {
								var inst = jQuery.jstree.reference(data.reference),
									obj = inst.get_node(data.reference).original;
								if (obj.pid == 0) {
									$.error('根节点不能被修改！');
									return;
								}
								objForm.loadNode(obj);
								layindex_form = layer.open({
									type: 1,
									title: '修改节点：“' + obj.text + '”',
									shift: 5,
									area: ['350px', '390px'],
									// move : false,
									content: $('#divCatalogForm')
								});
							}
						}
					}
				},
				plugins: ["contextmenu", "search", "state", "types", "wholerow"]
			}).bind('loaded.jstree', function() {
				var cid = document.location.hash;
				if (cid) {
					cid = cid.substring(1);
				} else {
					cid = domTree.jstree('get_json')[0].id;
				}
				domTree.jstree("open_all");
				// CCT.loadArticle(cid);
				$cuid.val(cid);
				document.location.hash = '#' + cid;
				CW.refreshMind(cid);
			}).on("refresh.jstree", function(e, data) {
				domTree.jstree("open_all");
			})
		}
	}
}