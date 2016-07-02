seajs.config({
	// 设置路径，方便跨目录调用
	paths: {
		'mjs': STATICURL+'/static/m/js/',
		'fjs': STATICURL+'/static/fun/',
	},
	// 设置别名，方便调用
	alias: {
		'jquery'	: '//apps.bdimg.com/libs/jquery/2.1.4/jquery.min.js',
		'editor'	: 'fjs/tinymce/tinymce.min.js',
		'layer'		: '//apps.bdimg.com/libs/layer/2.1/layer.js',
		'util'		: 'mjs/util.js',
		'ionic'		: STATICURL+'/static/css/ionicons.min.css',

		'tree'		: 'fjs/tree/jstree.min.js',
		'treestyle'	: 'fjs/tree/default/style.min.css',

		'plupload'	: 'fjs/upload/plupload.full.min.js',
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

var emptyFunction = function() {}

/**
 * 一些常用的方法，和对象没有关系
 */
var extFun = {
	interval: 10, //最短时间间隔提交一次Ajax，单位：秒
	surplusTime: 5, //还有surplus秒就可以执行保存
	isSaving: false, //是否正在保存
	_interval: null, //计时器对象
	/**
	 * 获取当前正在编辑的类型；
	 * @return {[type]} 0:知识点结构图，1:文章内容
	 */
	getEditType: function() {
		if ($('#panelEditor').css('zIndex') == '99') {
			return '1';
		}
		return '0';
	},
	setBtnTyping: function(dom, text, icon) {
		dom.html('&nbsp;&nbsp;' + text);
		dom.removeAttr('class');
		dom.addClass(icon).addClass('btn').addClass('ionic');
	},
	/**
	 * 自动保存内容的方法
	 * @return {[type]} [description]
	 */
	saveAuto: function() {
		var self = this,
			$btnSaveQuick = $('#btnContentSaveQuick');
		self._interval = setInterval(function() {
			if (self.surplusTime <= 0) {
				// 保存内容 或 保存节点的排序
				if ($btnSaveQuick.attr('read') == '0' && (CCT.getSaveStatus() == '1' || CCG.getSortStatus() == '1')) {
					self.isSaving = true;
					$btnSaveQuick.attr('read', '1');
					self.setBtnTyping($btnSaveQuick, '保存中...', 'ion-load-c');
					CCT.quickSave(function(e1) {
						CCT.setSaveStatus(0);
						CCG.saveNodeSort(function(e2) {
							CCG.setSortStatus(0);
							if (e1.errno > 0 || e2.errno > 0) {
								$.error(e1.errmsg + '\n' + e2.errmsg);
								self.setBtnTyping($btnSaveQuick, '保存失败', 'ion-close-round');
							} else {
								self.surplusTime = self.interval;
								self.setBtnTyping($btnSaveQuick, '保存完成', 'ion-checkmark-round');
							}
							setTimeout(function() {
								self.isSaving = false;
								$btnSaveQuick.attr('read', '0');
								self.setBtnTyping($btnSaveQuick, '快速保存', 'ion-ios-download-outline');
							}, 3000);
						});
					});
				} else {
					self.surplusTime = self.interval;
				}
				return;
			}
			self.surplusTime -= 1;
		}, 1000);
	}
}

seajs.use(['jquery', 'layer', 'util', 'tree', 'treestyle', 'ionic' ,'editor'], function() {
	layer.config({
		path: STATICURL+'/static/fun/layer/'
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
		if (btnSaveStatus == 1 || self.attr('read') == '1' || extFun.isSaving) {
			return;
		} //避免连续操作
		var showType = extFun.getEditType();
		if (showType == '1') {
			if (CCT.getSaveStatus() == '0') {
				return;
			}
		}
		window.clearInterval(extFun._interval);
		btnSaveStatus = 1;
		self.attr('read', '1');
		extFun.setBtnTyping(self, '保存中...', 'ion-load-c');
		var callback = function(e) {
			CCG.saveNodeSort(function(e2) {
				CCG.setSortStatus(0);
				if (e.errno > 0 || e2.errno > 0) {
					$.error(e1.errmsg + '\n' + e2.errmsg);
					extFun.setBtnTyping(self, '保存失败', 'ion-close-round');
				} else {
					extFun.surplusTime = extFun.interval;
					extFun.saveAuto();
					extFun.setBtnTyping(self, '保存完成', 'ion-checkmark-round');
				}
				setTimeout(function() {
					self.attr('read', '0');
					btnSaveStatus = 0;
					extFun.setBtnTyping(self, '快速保存', 'ion-ios-download-outline');
				}, 3000);
			});
		}
		if (showType == '1') { //内容
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
		}
		btnSaveStatus = 0;
		self.attr('read', '0');
	});

	$('#btnPreview').click(function() {
		window.open('/course/' + quid + '#' + $('#cid').val());
	})

	$('#btnSave').click(function() {
		var self = $(this);
		if (btnSaveStatus == 1 || self.attr('read') == '1' || extFun.isSaving || self.hasClass('disable')) {
			return;
		} //避免连续操作
		if (extFun.getEditType() == '1') { //内容
			layindex_form = layer.open({
				type: 1,
				title: '保存内容',
				shift: 5,
				content: $panelArticleForm
			});
		}
	});
	setTimeout(function() {extFun.saveAuto(); }, 3000);
});



function loadEditor() {
	var awidth = aheight = 0;

	// CCT.setSaveStatus(1);
	var panelHeigh = $('#panelEditor').height();
	tinymce.init({
    	selector: '#divEditor',
    	height : panelHeigh - 30 - 18 - 20,
    	menubar : false,
    	body_class : '',
    	style_formats : [
    		{ title: '大标题', block: 'h2' },
    		{ title: '中标题', block: 'h3' },
    		{ title: '小标题', block: 'h4' },
    		{ title: 'code', block: 'code' },
    	],
    	toolbar_items_size :'small',
    	content_css : STATICURL+'/static/css/pre/monokai-sublime.css',
    	plugins: ['autolink lists link image preview hr code media table codesample textcolor '],
    	toolbar :  ['undo redo | styleselect | bold italic underline forecolor  | alignleft aligncenter alignright | bullist numlist hr outdent indent | link image table  media codesample | code removeformat  preview']
  	});

	CCG.loadTree();
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
			$panelEditor.css({zIndex: 99, visibility: 'visible'});
			$panelMind.css({zIndex: -1, visibility: 'hidden'});
		},
		showMind: function() {
			$panelMind.css({zIndex: 99, visibility: 'visible'});
			$panelEditor.css({zIndex: -1, visibility: 'hidden'});
		},
		refreshMind: function(_id) {
			$iframeMind.attr('src', '/mcourse/cm/index/' + quid + '/' + _id);
		},
		goBack : function(){
			window.location.href = MANAGEURL+'/course'
		},
		/**
		 * 显示或隐藏目录
		 * @return {[type]} [description]
		 */
		toggleCatalog: function() {
			if (isShowCatalog) {
				$panelEditor.css({left: '0px', _marginLeft: '0px;'});
				$panelMind.css({left: '0px', _marginLeft: '0px;'});
				isShowCatalog = false;
			} else {
				$panelEditor.css({left: '250px', _marginLeft: '250px;'});
				$panelMind.css({left: '250px', _marginLeft: '250px;'});
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
		callback = callback || emptyFunction;
		var param = {
			id: id,
			content: tinymce.get('divEditor').getContent(),
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
			callback = callback || emptyFunction;
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
				// saveStatus = 0;
				tinymce.get('divEditor').setDirty(false);
				tinymce.get('divEditor').setContent(content || '');
				callback();
			});
		},
		/**
		 * 调用快速保存的方法
		 */
		quickSave: function(callback) {
			if (!tinymce.get('divEditor').isDirty()) {
				callback({errno: 0 });
			} else {
				saveQuick(callback);
			}
		},
		/**
		 * 设置当前文章保存的状态
		 * @param {[type]} status 要设置的状态
		 */
		setSaveStatus: function(status) {
			// saveStatus = status;
			var st = true;
			if(!status) st = false;
			return tinymce.get('divEditor').setDirty(st);
		},
		/**
		 * 得到文章保存的状态
		 * @return {[type]} [description]
		 */
		getSaveStatus: function() {
			return tinymce.get('divEditor').isDirty() ? '1' : '0';
			// return saveStatus;
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
	var dataList = [],
		listLen = 0,
		updateList = {},
		nodeSortStatus = '0';
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
					callback = callback || emptyFunction;
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
						CCG.loadTree();
						// domTree.jstree('refresh');
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
		},
		getData = function(callback) {
			$.get('/mcourse/nexus/' + $('#uid').val(), null, callback);
		},
		/**
		 * 让排序加一，从指定的排序节点开始
		 */
		updateSortAdd1 = function(pid, startSort, endSort, currentId, isChangePid) {
			var _startSort = startSort + 1;
			for (var i = 0, item, sort; i < listLen; i++) {
				item = dataList[i];
				if (item.pid == pid) {
					if (item.id == currentId) {
						dataList[i].sort = startSort + 1;
						if (isChangePid) {
							dataList[i].pid = pid;
							updateList[item.id] = {
								pid: pid,
								text: item.title,
								sort: 1
							};
						} else {
							updateList[item.id] = {
								pid: item.pid,
								text: item.title,
								sort: startSort + 1
							};
						}
					} else {
						if (item.sort > startSort && item.sort <= endSort) {
							_startSort += 1;
							dataList[i].sort = _startSort;
							updateList[item.id] = {
								pid: item.pid,
								text: item.title,
								sort: _startSort
							};
						}
					}
				}
			}
		},
		updateSortReduce1 = function(pid, startSort, endSort, currentId, isChangePid) {
			for (var i = 0, item, sort; i < listLen; i++) {
				item = dataList[i];
				if (item.pid == pid) {
					sort = item.sort;
					if (item.id == currentId) {
						dataList[i].sort = endSort;
						if (isChangePid) {
							dataList[i].pid = pid;
							updateList[item.id] = {
								pid: pid,
								text: item.title,
								sort: endSort
							};
						} else {
							updateList[item.id] = {
								pid: item.pid,
								text: item.title,
								sort: endSort
							};
						}
					} else {
						if (sort >= startSort && sort <= endSort) {
							dataList[i].sort = sort - 1;
							updateList[item.id] = {
								pid: item.pid,
								text: item.title,
								sort: sort - 1
							};
						}
					}
				}
			}
		}
	objForm = catalogForm();
	return {
		loadTree: function() {
			var isLoadContent = true;
			if (domTree.jstree(true)) {
				isLoadContent = false;
				domTree.jstree(true).destroy();
			}
			getData(function(e) {
				dataList = e.list;
				listLen = dataList.length;
				domTree.jstree({
					core: {
						animation: 0,
						check_callback: true,
						data: e.json,
						multiple: false
					},
					types: {
						"default": {"icon": "ionic ion-ios-bell"}
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
									// window.clearInterval(extFun._interval);
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
									// extFun.saveAuto();
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
											$.query('/mcourse/nexus/' + node.id, {
												uid: quid
											}, function(e) {
												if (e.errno != 0) {
													$.error(e.errmsg);
													return;
												}
												$.info(e.data);
												CCG.loadTree();
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
					plugins: ["contextmenu", "dnd", "html_data", "state", "types"]
				}).bind('loaded.jstree', function() {
					if (!isLoadContent) {
						domTree.jstree("open_all");
						return;
					}
					var cid = document.location.hash;
					if (cid) {
						cid = cid.substring(1);
					} else {
						cid = dataList[0].id;
					}
					domTree.jstree("open_all");
					// CCT.loadArticle(cid);
					$cuid.val(cid);
					document.location.hash = '#' + cid;
					CW.refreshMind(cid);
				});
				var objTree = domTree.jstree(true);
				$(document).on("dnd_stop.vakata", function(e, _data) {
					var c_id = _data.data.nodes[0],
						n_c_node = objTree.get_node("[id='" + c_id + "']"),
						n_p_id = n_c_node.parent,
						n_pv_id = objTree.get_node(objTree.get_prev_dom("[id='" + c_id + "']")).id,
						n_pv_node = o_p_id = null;

					for (var i = 0, item; i < listLen; i++) {
						item = dataList[i];
						if (item.id == c_id) {
							n_c_node = item;
							o_p_id = item.pid;
						} else if (item.id == n_pv_id) {
							n_pv_node = item;
						}
					}
					// 判断是否跨父节点
					if (o_p_id == n_p_id) {
						// 判断是上移还是下移
						if (n_c_node.sort > n_pv_node.sort) {
							updateSortAdd1(n_p_id, n_pv_node.sort, n_c_node.sort, c_id);
						} else {
							updateSortReduce1(n_p_id, n_c_node.sort, n_pv_node.sort, c_id);
						}
					} else {
						updateSortReduce1(o_p_id, n_c_node.sort, 2000);
						n_p_id = objTree.get_parent(c_id);
						for (var i = 0, item, _sort; i < listLen; i++) {
							item = dataList[i];
							if (item.id == c_id) {
								dataList[i].pid = n_p_id;
								dataList[i].sort = 1;
								updateList[item.id] = {
									pid: n_p_id,
									text: item.title,
									sort: 1
								};
							} else if (item.pid == n_p_id) {
								_sort = item.sort + 1;
								dataList[i].sort = _sort;
								updateList[item.id] = {
									pid: n_p_id,
									text: item.title,
									sort: _sort
								};
							}
						}
					}
					nodeSortStatus = '1';
				});
			});
		},
		/**
		 * 得到当前排序的状态
		 * @return {boolean} 1:已修改，需要保存；0:未修改，不需要保存
		 */
		getSortStatus: function() {
			return nodeSortStatus;
		},
		setSortStatus: function(v) {
			nodeSortStatus = v;
		},
		saveNodeSort: function(callback) {
			callback = callback || emptyFunction;
			if (nodeSortStatus == '1') {
				$.query('/mcourse/nexus/sort/' + $('#uid').val(), {
					data: JSON.stringify(updateList)
				}, callback, 'post');
			} else {
				callback({
					errno: 0
				})
			}
		}
	}
}