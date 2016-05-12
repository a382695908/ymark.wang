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


seajs.use(['jquery', 'layer', 'util', 'tree', 'treestyle', 'ionic'], function() {
	layer.config({
		path: '/static/fun/layer/'
	});
	// $('#uid').val();



});