var path 		= require('path') ,
	gulp 		= require('gulp') ,
	uglify 		= require('gulp-uglify') ,
	minifycss 	= require('gulp-minify-css'),
	rename 		= require('gulp-rename'),
	concat 		= require('gulp-concat') ,
	cleanCSS 	= require('gulp-clean-css'),
	jshint 		= require('gulp-jshint'),
	sourcemaps 	= require('gulp-sourcemaps') ;
	// jshintrc 	= require('./.jshintrc');

var basepath = __dirname + '/www/static/';

/**
 * 压缩CSS的任务
 * @param  {String} path    基本路径
 */
function minifyCss(path ,name){
	name = name || '*.css';
	return gulp.src(basepath+path+name)
	    .pipe(cleanCSS({compatibility: 'ie8'}))
	    .pipe(gulp.dest(basepath+path));
}
function minifyJs(path ,name){
	name = name || '*.js';
	return gulp.src(basepath+path+name)
        // .pipe(concat('main.js'))    //合并所有js到main.js
        // .pipe(gulp.dest(basepath+'js/js'))    //输出main.js到文件夹
        .pipe(rename({suffix: '.min'}))   //rename压缩后的文件名
        .pipe(jshint())    //压缩
        .pipe(jshint.reporter('default'));
}

gulp.task('lintHTML', function() {
  return gulp.src('./src/*.html')
    // if flag is not defined default value is 'auto'
    .pipe(jshint.extract('auto|always|never'))
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('serve', function() {
    var cssFile = {
    	'c-s/css/' 		: 'main.css' ,
    	'fun/jsmind/'	: 'jsmind.css' ,
    	'm/css/'		: 'base.css' ,
    	'css/' 			: ['custom.css' ,'pace.css'],
    };
    var jsFile 		= {
    	'c-s/scripts/'	: 'custom-scripts.js',
    	'fun/jsmind/'	: ['jsmind.js' ,'jsmind.draggable.js' ,'jsmind.screenshot.js'] ,
    	'js/'			: 'script.js',
    	'm/js/'			: ['bootstrap-treeview.js' ,'main.js' ,'ymark.js']
    };
    minifyJs('m/js/' ,'ymark.js');
    var ns = undefined;
    // for(var i in cssFile){
    // 	ns 	= cssFile[i];
    // 	if(ns instanceof  Array) for(var j=0,len=ns.length;j<len;j++){minifyCss(i ,ns[j]); }
    // 	else minifyCss(i ,ns);
    // }
    // console.log('压缩CSS完成！');
    // for(var i in jsFile){
    // 	ns 	= jsFile[i];
    // 	if(ns instanceof  Array) for(var j=0,len=ns.length;j<len;j++){minifyJs(i ,ns[j]); }
    // 	else minifyJs(i ,ns);
    // }
    console.log('压缩JS完成！');
});



gulp.task('minify-css', function() {return minifyCss('c-s/css/'); });



gulp.task('minify-error-css', function() {
    return gulp.src(basepath+'c-s/css/*.css')      //压缩的文件
    	// .pipe(concat('main.css'))    //合并所有js到main.js
        .pipe(gulp.dest(basepath+'c-s/'))   //输出文件夹
        // .pipe(rename({suffix: '.min'}))   //rename压缩后的文件名
        .pipe(minifycss());   //执行压缩
});

gulp.task('default', function() {
	// gulp.start('minify-js');
	minifyJs();
  // 将你的默认的任务代码放在这
  // gulp.src(basepath+'www/static/m/js/main.js')
  //     .pipe(uglify())
  //     .pipe(gulp.dest(basepath+'www/static/m/js/main2.js'))
});