jQuery.extend( {
	urlVal : function(name) {
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
		var r = window.location.search.substr(1).match(reg);
		if (r != null)
			return unescape(r[2]);
		return "";
	},
	getNow : function(){
		var now = new Date(),
		year = now.getFullYear(),       //年
        month = now.getMonth() + 1,     //月
        day = now.getDate(),            //日
        hh = now.getHours(),            //时
        mm = now.getMinutes(),          //分
        ss = now.getSeconds(),
        clock = year + "-";
       
        if(month < 10) clock += "0";
        clock += month + "-";
        if(day < 10)  clock += "0";
        clock += day + " ";
        if(hh < 10)  clock += "0";
        clock += hh + ":";
        if (mm < 10) clock += '0'; 
        clock += mm + ":"; 
        if (ss < 10) clock += '0'; 
        clock += ss; 
        return clock; 
	},
    getRandom : function(len){
        len = len || 32;
    　　var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
    　　var maxPos = $chars.length;
    　　var pwd = '';
    　　for (i = 0; i < len; i++) {
    　　　　pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
    　　}
    　　return pwd;
    },
    getDate : function(date){
        var now = undefined ;
        if(date && typeof(date) == 'Date') now = date;
        else now = new Date(),
         
        year = now.getFullYear(),       //年
        month = now.getMonth() + 1,     //月
        day = now.getDate(),            //日
        clock = year + "-";
       
        if(month < 10) clock += "0";
        clock += month + "-";
        if(day < 10)  clock += "0";
        clock += day + " ";
        return clock; 
    },
    getHeight : function(){
        var _parent = window.parent;
        if(_parent!=window){
            var _temp = _parent.layout;
            if(_temp){
                _temp = _temp.contentHeight;
                if(_temp) return _temp;
            }
        }
        var _height;
        if(navigator.userAgent.indexOf("Firefox")>0){   //判断火狐浏览器[39.0]
          _t = document.documentElement; _height = _t.scrollHeight;
        }else{
          if(window.addEventListener) {
            //if(navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion.match(/8./i)=="8."){
            //  alert('IE8');
            //}
            //if((navigator.userAgent.indexOf('MSIE') >= 0) && (navigator.userAgent.indexOf('Opera') < 0)){
            //  alert('IE8 - 2')
            //}
            _t=document.body; _height=_t.scrollHeight;

          } //其他浏览器:谷歌 ，360[7.1]
          else if(window.attachEvent) {_t=$(window); _height=_t.height();} //> ? =IE8 [升级到11的IE8]
          else console.log("这种情况发生在不支持DHTML的老版本浏览器（现在一般都支持）");
        }
        return _height;
    },
	// ajax : function(url, method, param, callback) {
 //        callback   = callback || function(e){}
 //        var al = arguments.length;
 //        if(al != 3) {
 //            console.error('参数个数出错！');
 //            callback({err:'参数个数出错！'});
 //            return;
 //        }
 //        this._ajax(url ,param ,callback ,'post');
	// },
    query : function (url ,param ,callback ,type) {
        callback   = callback || function(e){}
        var al = arguments.length;
        if(al != 3 && al != 4) {
            console.error('参数个数出错！');
            callback({err:'参数个数出错！'});
            return;
        }
        if(url.indexOf('/') != 0) url = '/'+url;
        var config = {  
            url     : 'http://'+ window.location.host +'/manage'+ url ,    // 跳转到 action  
            // async   : true ,            //默认值: true。默认设置下，所有请求均为异步请求。如果需要发送同步请求，请将此选项设置为 false。同步请求将锁住浏览器
            cache   : false,            //默认值: true，dataType 为 script 和 jsonp 时默认为 false。设置为 false 将不缓存此页面。
            // contentType : 'application/x-www-form-urlencoded' , //默认值适合大多数情况。如果你明确地传递了一个 content-type 给 $.ajax() 那么它必定会发送给服务器（即使没有数据要发送）。
            // beforeSend  : function(XHR){} ,     //发送请求前可修改 XMLHttpRequest 对象的函数，如添加自定义 HTTP 头。如果返回 false 可以取消本次 ajax 请求
            // complete    : function((XHR, TS){}, //请求完成后回调函数 (请求成功或失败之后均调用)。
            // xhr         : function(XMLHttpRequest){},   //需要返回一个 XMLHttpRequest 对象。默认在 IE 下是 ActiveXObject 而其他情况下是 XMLHttpRequest 。用于重写或者提供一个增强的 XMLHttpRequest 对象。这个参数在 jQuery 1.3 以前不可用。
            // dataFilter  : function(data ,type){},               //给 Ajax 返回的原始数据的进行预处理的函数。data 是 Ajax 返回的原始数据，type 是调用 jQuery.ajax 时提供的 dataType 参数。函数返回的值将由 jQuery 进一步处理。
            // dataType    : 'json' ,      //
            // global      : true ,        //是否触发全局 AJAX 事件。默认值: true。设置为 false 将不会触发全局 AJAX 事件，如 ajaxStart 或 ajaxStop 可用于控制不同的 Ajax 事件。
            // ifModified  : false ,       //仅在服务器数据改变时获取新数据。默认值: false。使用 HTTP 包 Last-Modified 头信息判断。
            // traditional : false ,       //如果你想要用传统的方式来序列化数据，那么就设置为 true。请参考工具分类下面的 jQuery.param 方法。
            // username    : 'xx',         //用于响应 HTTP 访问认证请求的用户名。
            // password    : 'xx',         //用于响应 HTTP 访问认证请求的密码
            // processData : true ,        //默认值: true。默认情况下，通过data选项传递进来的数据，如果是一个对象(技术上讲只要不是字符串)，都会处理转化成一个查询字符串，以配合默认内容类型 "application/x-www-form-urlencoded"。如果要发送 DOM 树信息或其它不希望转换的信息，请设置为 false。
            // jsonp       : '',           //在一个 jsonp 请求中重写回调函数的名字。这个值用来替代在 "callback=?" 这种 GET 或 POST 请求中 URL 参数里的 "callback" 部分，比如 {jsonp:'onJsonPLoad'} 会导致将 "onJsonPLoad=?" 传给服务器。
            // jsonpCallback   : '' ,      //为 jsonp 请求指定一个回调函数名。这个值将用来取代 jQuery 自动生成的随机函数名。这主要用来让 jQuery 生成度独特的函数名，这样管理请求更容易，也能方便地提供回调函数和错误处理。你也可以在想让浏览器缓存 GET 请求的时候，指定这个回调函数名。
            // scriptCharset   : '' ,      //只有当请求时 dataType 为 "jsonp" 或 "script"，并且 type 是 "GET" 才会用于强制修改 charset。通常只在本地和远程的内容编码不同时使用。
            timeout     : '5000',       //设置请求超时时间（毫秒）。此设置将覆盖全局设置。
            data        : param,  
            type        : type || 'get',
            dataType    : 'json',  
            success     : function(data) { callback(data); },
            error       : function() { callback({err:'错误！'}); }
        }
        $.ajax(config);
    },
    /**
     * 弹出错误信息
     * @param  {[type]} msg 弹出的错误消息
     * @return {[type]}     [description]
     */
    error : function(msg){
        layer.msg(msg, {offset: '65px', shift: 6 });
    },
    info : function(msg){
        layer.msg(msg, {offset: '65px'});
    }
});