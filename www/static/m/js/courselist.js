seajs.config({
    // 设置路径，方便跨目录调用
    paths: {
        'js': '/static/js/',
        'mjs': '/static/m/js/',
        'fjs': '/static/fun/'
    },

    // 设置别名，方便调用
    alias: {
        'jquery': 'js/jquery-2.1.3.min.js',
        'layer': 'fjs/layer/layer.js',
        'util': 'mjs/util.js',
        'bootgrid': 'mjs/jquery.bootgrid.min.js',
        'ionic': '/static/css/ionicons.min.css',
        'jquery-ui': 'fjs/upload/jquery-ui.min.js',
        'plupload': 'fjs/upload/plupload.full.min.js',
        'plupload-ui': 'fjs/upload/jquery.ui.plupload.min.js',
    },
    preload: 'jquery'
});
var CLT = CFM = layer = null;
seajs.use(['jquery', 'layer', 'util', 'ionic', 'bootgrid'], function() {
    var navheight = 45 + 15;
    var dimension = $.getDimension(),
        height = dimension.height;

    layer.config({
        path: '/static/fun/layer/'
    });

    var loadingIndex = undefined;
    $(document).ajaxComplete(function(e, req, set) {
        var res = req.responseJSON;
        layer.close(loadingIndex);
        if (res.errno || res.errno > 0) {
            $.error(res.errmsg);
        }
    });

    $(document).ajaxError(function(e, req, set) {
        layer.close(loadingIndex);
        console.log('ajaxError');
        console.log(req);
        console.log(set);
        $.error('请求出错啦~');
    });

    $(document).ajaxSend(function(e, req, set) {
        loadingIndex = layer.load('加载中', {
            icon: 16,
            shade: [0.3, '#fff']
        });
    });

    $('#gmn').height(height - navheight);
    CLT = CourseList();
    CFM = CourseForm();
    CLT.load();

    $('#btnAddCourse').click(function() {
        CFM.resetForm();
        CFM.showForm();
    })
});

function CourseForm() {
    var $name = $('#courseName'),
        $summary = $('#courseSummary'),
        panelForm = $('#panelCourseForm'),
        objUpload = $("#uploader");

    var uid = formtitle = null, // 当前操作表单课程的UID
        fileArr = [],
        layerIndexForm = null;

    var save = function() {
        var param = {
            uid: uid,
            name: $name.val(),
            summary: $summary.val(),
            coverpics: ''
        };
        if (fileArr.length > 0) {
            param.coverpics = fileArr.join('/');
        }
        var url = '/mcourse/info/';
        if (uid) {
            url += uid;
        } else {
            url += 'add';
            param.uid = 'add';
        }
        $.query(url, param, function(e) {
            if (e.errno > 0) {
                return;
            }
            layer.close(layerIndexForm);
            $.info(e.data);
            CLT.reload();
        }, uid ? 'put' : 'post');
    }
    return {
        /**
         * 重置表单
         * @param  {string} type undefined : 添加，否则，修改
         */
        resetForm: function(data) {
            if (data && data.uid) {
                uid = data.uid;
                formtitle = '修改';
                $name.val(data.name);
                $summary.val(data.summary);
                var coverpics = data.coverpics;
                if (coverpics.indexOf('/') > 0) {
                    coverpics.split('/');
                } else {
                    coverpics = [coverpics];
                }
                fileArr = coverpics;
            } else { //添加
                uid = '';
                formtitle = '添加课程';
                $name.val('');
                $summary.val('');
                fileArr = [];
            }
        },
        /**
         * 保存一个表单
         */
        saveForm: function() {
            if (!$name.val()) {
                $.error('请填写课题名称啊~少年');
                return;
            }
            save();
            return;
            // 先上传图片
            if (objUpload.plupload('getFiles').length > 0) {
                objUpload.plupload('start');
            } else {
                layer.confirm('没有上传封面，您确认要继续添加课程吗？', {
                    btn: ['继续保存！', '算了还是不添加了']
                }, save);
            }
        },
        /**
         * 加载上传组件
         */
        loadUpload: function() {
            objUpload.plupload({
                runtimes: 'html5,flash,silverlight,html4',
                url: '/fun/upload/file',
                max_file_count: 5,
                chunk_size: '3mb',
                filters: {
                    max_file_size: '10mb',
                    mime_types: [{
                        title: "Image files",
                        extensions: "jpeg,jpg,png"
                    }]
                },
                rename: false,
                sortable: true,
                dragdrop: false,
                views: {
                    list: false,
                    thumbs: true,
                    active: 'thumbs'
                },
                init: {
                    BeforeUpload: function() {
                        fileArr = [];
                    },
                    FileUploaded: function(up, file, info) {
                        info = eval('(' + info.response + ')');
                        if (info.errno > 0) {
                            $.error(info.msg);
                        }
                        fileArr.push(info.data.name);
                    },
                    UploadComplete: function(up, files) {
                        save();
                    }
                }
            });
        },
        showForm: function(title) {
            if (title) formtitle = formtitle + ' - ' + title;
            layerIndexForm = layer.open({
                type: 1,
                title: formtitle,
                area: ['500px', '320px'], //宽高
                content: panelForm,
                closeBtn: 0,
                shadeClose: false,
                move: false,
            });
        },
        closeForm: function() {
            layer.close(layerIndexForm);
        }
    }
}

function CourseList() {
    var objGrid = $("#grid-data"),
        rowCount = 15,
        current = 1,
        gridConfig = {
            columnSelection: false,
            ajax: true,
            ajaxSettings: {
                method: "GET",
                cache: true,
            },
            rowCount: rowCount,
            current: current,
            sorting: false,
            url: "/mcourse/list/all",
            labels: {
                loading: '正在加载中...',
                infos: '从{{ctx.start}}至{{ctx.end}}，共{{ctx.total}}条数据',
                noResults: '没有数据',
                search: '关键字...'
            },
            formatters: {
                "link": function(c, r) {
                    return '<a href="/mcourse/' + r.uid + '" > ' + r.uid + ' </a>';
                },
                "options": function(c, r) {
                    var id = r.uid;
                    return '<a class="grid-option" href="javascript:CLT.delete(\'' + id + '\')"><span class="grid-ionic ionic ion-ios-trash-outline"></span> 删除</a>&nbsp;&nbsp;&nbsp;&nbsp;' +
                        '<a class="grid-option" href="javascript:CLT.showEditForm(\'' + id + '\' ,\'' + r.name + '\')"><span class="grid-ionic ionic ion-ios-compose-outline"></span> 修改</a>&nbsp;&nbsp;&nbsp;&nbsp;' +
                        '<a class="grid-option" target="_blank" href="/course/' + id + '"><span class="grid-ionic ionic ion-eye"></span> 预览</a>';
                }
            }
        },
        currentRow = null;

    return {
        load: function() {
            objGrid.bootgrid(gridConfig).on("click.rs.jquery.bootgrid", function(e, c, r) {
                currentRow = r;
            });
        },
        reload: function() {
            objGrid.bootgrid("reload");
        },
        delete: function(pkey) {
            layer.confirm('将会删除以下内容：课程表、课程目录表、课程内容表、课程分享表、试题表、纠错表；确认要删除吗？', {
                btn: ['就是要删除', '还是取消吧']
            }, function() {
                if (!pkey) {
                    console.error('deleteNode id is empty');
                    return;
                }
                $.query('/mcourse/info/' + pkey, {}, function(e) {
                    if (e.errno > 0) {
                        console.error(e.errmsg);
                        return;
                    }
                    $.info(e.data);
                    CLT.reload();
                }, 'delete');
            });
        },
        showEditForm: function(id, name) {
            CFM.resetForm(currentRow);
            CFM.showForm(name);
        }
    }
}