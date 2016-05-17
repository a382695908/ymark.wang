seajs.config({
	// 设置路径，方便跨目录调用
	paths: {
		'mind': '/static/fun/mind/',
	},
	// 设置别名，方便调用
	alias: {
		'jquery': 'mind/jquery.js',
		'clb': 'mind/collaboration.js',
		'core': 'mind/mind.core.js',
		'ui': 'mind/mind.ui.js',
		'util': 'mind/util.js',
		'svg': 'mind/svg.min.js',
	},
	preload: 'jquery'
});
window.parent.frameConfig = {
	onQuickSave: function(callback) {
		// 快速保存时调用的方法
		callback = callback || function() {};
		if (!CLB.isSaving) {
			CLB.submit(callback);
		} else {
			var _int = setInterval(function() {
				CLB.submit(function() {
					window.clearInterval(_int);
					callback();
				});
			}, 1000);
		}
	}
}
var CLB = {
	interval: 10, //最短时间间隔提交一次Ajax，单位：秒
	surplusTime: 0, //还有surplus秒就可以执行保存
	isSaving: false, //是否正在保存
	_interval: null, //计时器对象
	cache: {
		add: [],
		upd: [],
		del: [],
		thm: {}
	},
	submit: function(callback) {
		callback = callback || function() {};
		var self = this;
		var isEmpty = false;
		var cache = self.cache;
		// 判断cache中是否存在数据，若不存在数据，则取消提交
		if (cache.add.length > 0 || cache.upd.length > 0 || cache.del.length > 0) {
			isEmpty = true;
		}
		if (!isEmpty) {
			for (var prop in cache.thm) {
				isEmpty = true;
				break;
			}
		}
		if (!isEmpty) {
			console.log('cache is null;');
			callback();
			return;
		}
		var $text = $('#saving_tip');
		$text.text('保存中...');
		self.isSaving = true;
		Util.ajax({
			url: "/mcourse/cm/" + courseUid,
			data: {
				catalogId: catalogId,
				data: JSON.stringify(cache),
			},
			success: function(n) {
				$text.text('保存完成');
				self.isSaving = false;
				self.cache = {
					add: [],
					upd: [],
					del: [],
					thm: {}
				}
				self.surplusTime = self.interval;
				self.startCountdown();
				callback();
				setTimeout(function() {
					$text.text('');
				}, 2000);
			}
		});
	},
	/**
	 * 得到要删除的节点的子节点
	 */
	getDelsNodes: function(node) {
		var ids = [];
		var getChildrenIds = function(_node) {
			if (!_node) {
				return;
			}
			console.log(_node);
			ids.push(_node.id);
			var _cdn = _node.children;
			if (_cdn.length > 0) {
				for (var i = 0, len = _cdn.length; i < len; i++) {
					getChildrenIds(_cdn[i]);
				}
			}
		}
		getChildrenIds(node);
		return ids;
	},
	/**
	 * 保存后需要控制间隔时间	123
	 * 启动倒计时
	 */
	startCountdown: function() {
		var self = this;
		if (self.surplusTime == 0) {
			$('#saving_tip').text('');
			return;
		}
		self._interval = setInterval(function() {
			if (self.surplusTime <= 0) { //判断cache是否存在东西，存在则调用保存的方法
				window.clearInterval(self._interval);
				var cache = self.cache;
				self.submit(function() {
					setTimeout(function() {
						$('#saving_tip').text('');
					}, 2000);
				});
				return;
			}
			self.surplusTime -= 1;
		}, 1000);
	},
	send: function(e) {
		var self = this;
		if (!e.length) {
			if (e.action == 'command') {
				var e = e.messages[0];
				if (e.action == 'changeClassic') {
					e = e.content;
					self.cache.thm.changeClassic = {
						bg: e.bg,
						classic: e.classic
					};
				}
			}
		} else {
			e = e[0];
			var opttype = e.action,
				_temp = null; //操作类型
			// 加入到cache中
			if (opttype == 'create') {
				_temp = e.content.content[0];
				delete _temp.children;
				self.cache.add.push(_temp);
			} else if (opttype == 'update') {
				var os = e.content.updates;
				for (var i = 0, len = os.length; i < len; i++) {
					_temp = os[i];
					delete _temp.children;
					self.cache.upd.push(_temp);
				}
			} else if (opttype == 'remove') {
				_temp = self.getDelsNodes(e.content.content[0]);
				for (var i = 0, len = _temp.length; i < len; i++) {
					self.cache.del.push(_temp[i]);
				}
			} else if (opttype == "update_structure") {
				self.cache.thm.update_structure = e.content.structure;
			} else {
				return;
			}
		}
		// console.log(self.cache);
		if (self.surplusTime == 0) {
			self.submit();
		}
	}
};
seajs.use(['jquery', 'core', 'ui', 'util', 'svg'], function() {
	$(function() {
		$("#public_edit").attr("checked", false);
		if (tutorial) {
			UI.gettingStart();
		}
	});
});