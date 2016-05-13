seajs.config({
	// 设置路径，方便跨目录调用
	paths: {
		'mind': '/static/fun/mind/',
	},
	// 设置别名，方便调用
	alias: {
		'jquery': 'mind/jquery.js',
		// 'layer': '//apps.bdimg.com/libs/layer/2.1/layer.js',
		'clb': 'mind/collaboration.js',
		'core': 'mind/mind.core.js',
		'ui': 'mind/mind.ui.js',
		'util': 'mind/util.js',
		'svg': 'mind/svg.min.js',
	},
	preload: 'jquery'
});
var CLB = {
	send: function(e) {
		console.log(e);
	}
};
seajs.use(['jquery', 'core', 'ui', 'util', 'svg'], function() {
	$(function() {
		$("#publish_category").val("");
		if ("" != "") {
			$("#publish_language").val("");
		}
		$("#publish_tags").val("");
		$("#public_edit").attr("checked", false);
		if (tutorial) {
			UI.gettingStart();
		}
	});
});