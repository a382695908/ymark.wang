seajs.config({
    // 设置路径，方便跨目录调用
    paths: {
        'js': BASE_PATH+'/static/js/',
        'mjs': BASE_PATH+'/static/m/js/',
        'fjs': BASE_PATH+'/static/fun/'
    },

    // 设置别名，方便调用
    alias: {
        'jquery': '//apps.bdimg.com/libs/jquery/2.1.4/jquery.min.js',
        'layer': '//apps.bdimg.com/libs/layer/2.1/layer.js',
        'util': 'mjs/util.js',
        'bootgrid': 'mjs/jquery.bootgrid.min.js',
        'ionic': BASE_PATH+'/static/css/ionicons.min.css',
        'jquery-ui': '//apps.bdimg.com/libs/jqueryui/1.10.4/jquery-ui.min.js',
        'plupload': 'fjs/upload/plupload.full.min.js',
        'plupload-ui': 'fjs/upload/jquery.ui.plupload.min.js',
        'tree': 'fjs/tree/jstree.min.js',
        'treestyle': 'fjs/tree/default/style.min.css',
    },
    preload: 'jquery'
});
/**
 * CLT = CourseList
 * CFM = CourseForm
 * CTG = CourseCatalog
 * CGF = CatalogForm
 * CGS = CatalogSort
 * @type {[type]}
 */
var CLT = CFM = CTG = CGF = CGS = layer = null;
seajs.use(['jquery', 'layer', 'util', 'ionic', 'bootgrid', 'tree', 'treestyle'], function() {
    var navheight = 45 + 15;
    var dimension = $.getDimension(),
        height = dimension.height;

    layer.config({
        path: BASE_PATH+'/static/fun/layer/'
    });

    var loadingIndex = undefined;
    $(document).ajaxComplete(function(e, req, set) {
        var res = req.responseJSON;
        // layer.close(loadingIndex);
        if (!res) return;
        if (res.errno || res.errno > 0) {
            $.error(res.errmsg);
        }
    });

    $(document).ajaxError(function(e, req, set) {
        // layer.close(loadingIndex);
        console.log('ajaxError');
        console.log(req);
        console.log(set);
        $.error('请求出错啦~');
    });

    $(document).ajaxSend(function(e, req, set) {
        // loadingIndex = layer.load('加载中', {
        //     icon: 16,
        //     shade: [0.3, '#fff']
        // });
    });

    $('#gmn').height(height - navheight);
    CLT = CourseList();
    CFM = CourseForm();
    CTG = CourseCatalog();
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
                shift: 5,
                shade: [0.3, '#828282'],
                area: ['500px', '320px'], //宽高
                content: panelForm,
                closeBtn: 0,
                shadeClose: false,
                // move: false,
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
        layerIndexTip = null,
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
                    return '<a class="grid-a-blue" href="/mcourse/' + r.uid + '" > ' + r.uid + ' </a>';
                },
                "options": function(c, r) {
                    var id = r.uid;
                    return '<a class="grid-option" target="_blank" href="/course/' + id + '"><span class="grid-ionic ionic ion-eye"></span> 预览</a>&nbsp;&nbsp;&nbsp;&nbsp;' +
                        '<a class="grid-option" href="javascript:CTG.showCatalog(\'' + id + '\' ,\'' + r.name + '\')"><span class="grid-ionic ionic ion-ios-copy-outline"></span> 查看目录</a>&nbsp;&nbsp;&nbsp;&nbsp;' +
                        '<a class="grid-option" id="tp_' + id + '" href="javascript:CLT.tipMore(\'' + id + '\' ,\'' + r.name + '\')"><span class="grid-ionic ionic ion-more"></span></a>';
                }
            }
        },
        currentRow = null

    return {
        load: function() {
            objGrid.bootgrid(gridConfig).on("click.rs.jquery.bootgrid", function(e, c, r) {
                currentRow = r;
            });
            $('#btnAddCourse').show();
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
                    layer.close(layerIndexTip);
                    CLT.reload();
                }, 'delete');
            });
        },
        showEditForm: function(id, name) {
            CFM.resetForm(currentRow);
            CFM.showForm(name);
        },
        tipMore: function(id, name) {
            var html = '<a class="grid-option" href="javascript:CLT.delete(\'' + id + '\')"><span class="grid-ionic ionic ion-ios-trash-outline"></span> 删除</a>&nbsp;&nbsp;&nbsp;&nbsp;' +
                '<a class="grid-option" href="javascript:CLT.showEditForm(\'' + id + '\' ,\'' + name + '\')"><span class="grid-ionic ionic ion-ios-compose-outline"></span> 修改</a>';
            layerIndexTip = layer.tips(html, '#tp_' + id, {
                skin: 'tp-options',
                tips: [2, 'rgba(230, 230, 230, 0.73)'],
                shadeClose: true,
                time: 5000
            });
        }
    }
}

function CourseCatalog() {
    var layerIndexCatalog = null,

        panelCatalog = $('#panelCourseCatalog'),
        domCatalog = panelCatalog.children('#catalogTree'),

        $catalogUpdCnt = $('#catalogUpdCnt'),
        $catalogDelete = $('#catalogDelete'),
        $catalogPrew = $('#catalogPrew'),

        $panelForm = $('#catalogForm'),
        $panelList = $('#catalogOrderList'),
        $liall = $('#catalogul').children('li'),

        selectPanelNow = 'Form',
        isChanged = false,
        treeConfig = {
            core: {
                animation: 0,
                check_callback: true,
                data: {}
            },
            types: {
                "default": {
                    "icon": "ionic ion-ios-paw"
                }
            },
            plugins: ["state", "dnd", "types", "wholerow"]
        },
        /**
         * 表单的一些方法
         * @return {[type]} [description]
         */
        catalogForm = (function() {
            // var model = {id  ,nodeid ,deep ,title ,pid ,sort ,remark ,wimport ,wscore };
            var $title = $panelForm.find('#ctgTitle'),
                $remark = $panelForm.find('#ctgRemark'),
                $wimport = $panelForm.find('#ctgWimport'),
                $wscore = $panelForm.find('#ctgWscore'),
                $fall = $panelForm.find('input'),

                id = pid = nodeid = deep = cuid = null,

                optType = 1; //1:添加，2:修改

            var $btnclose = $('#catalog_btn_close'),
                $btnsave = $('#catalog_btn_submit'),
                $btnsavenew = $('#catalog_btn_submit_new');

            $btnclose.click(function() {
                layer.close(layindex_form);
            });
            $fall.change(function() {
                isChanged = true;
            });
            $btnsave.click(function() {
                isChanged = false;
                // saveNode(function() {
                //     layer.close(layindex_form);
                // });
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
             */
            var getNodeId = function(pid, pnid, brothers) {
                    var ref = domCatalog.jstree('get_children_dom', pid),
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
                        domCatalog.jstree('refresh');
                    }, optType == 1 ? 'post' : 'put');
                }

            return {
                /**
                 * 根据父节点，加载子节点的相关信息
                 */
                loadChildNode: function(pnode, brothers) {
                    optType = 1;
                    // $ptitle.text(pnode.text);
                    $deep.text(pnode.deep + 1);
                    $title.val('');
                    $remark.val('');
                    pid = pnode.id;
                    nodeid = getNodeId(pnode.id, pnode.nodeid, brothers);
                    id = 0;
                },
                /**
                 * 加载一个节点，主要是为了修改节点信息
                 */
                loadNode: function(node, callback) {
                    callback = callback || function() {};
                    $title.val(node.text);
                    $remark.val(node.remark);
                    $wimport.val(node.wimport);
                    $wscore.val(node.wscore);
                    id = node.id;
                    pid = node.pid;
                    nodeid = node.nodeid;
                    cuid = node.cuid;
                    optType = 1;
                    callback();
                }
            }
        })(),
        catalogSort = (function() {
            var objGrid = $('#catalogSortGrid'),

                tempData = {};


            return {
                load: function() {
                    // objGrid.bootgrid(gridConfig);
                },
                reload: function(data, callback) {
                    callback = callback || function() {};
                    if (!data.id) {
                        $.error('id为空诶！');
                        return;
                    }
                    var loadHtml = function(data) {
                        if (data.length <= 0) {
                            objGrid.html('<tr><td colspan="2" class="none">没有子节点...</td></tr>');
                            return;
                        }
                        var html = [];
                        for (var i = 0, len = data.length, item; i < len; i++) {
                            item = data[i];
                            html.push('<tr><td><a>' + item.name + '</a></td>');
                            html.push('<td><a class="grid-option" title="向上移动" href="javascript:;"><span class="grid-ionic ionic ion-chevron-up"></span></a>&nbsp;&nbsp;&nbsp;&nbsp;');
                            html.push('<a class="grid-option" title="向下移动" href="javascript:;"><span class="grid-ionic ionic ion-chevron-down"></span></a></td></tr>');
                        }
                        objGrid.html(html.join(''));
                    }
                    var td = tempData[data.id];
                    if (td) {
                        loadHtml(td);
                        return;
                    }
                    $.get('/mcourse/nexus/chdlist', {
                        pid: data.id
                    }, function(e) {
                        e = e.data;
                        tempData[data.id] = e;
                        loadHtml(e);
                    });
                    setTimeout(callback, 200);
                },
            }
        })();

    domCatalog.jstree(treeConfig).bind('loaded.jstree', function() {
        catalogSort.load();
    }).on("select_node.jstree", function(e, data) {
        var loadData = function() {
            data = data.node.original;
            $catalogUpdCnt.attr('href', '/mcourse/' + data.cuid + '#' + data.id);
            $catalogPrew.attr('href', '/course/' + data.cuid + '#' + data.id);
            if (selectPanelNow == 'Form') {
                catalogForm.loadNode(data, function() {
                    catalogSort.reload(data);
                });
            } else {
                catalogSort.reload(data, function() {
                    catalogForm.loadNode(data);
                });
            }
        }
        if (isChanged) {
            layer.confirm('表单已经修改过了，是否保存表单之后再加载新的呢？', {
                btn: ['保存后加载', '不保存就加载'] //按钮
            }, function() {
                catalogForm.saveNode(loadData);
            }, function() {
                loadData();
                isChanged = false;
            });
        } else {
            loadData();
        }
    }).on("refresh.jstree", function(e, data) {
        domCatalog.jstree("open_all");
    })
    return {
        showCatalog: function(id, title) {
            layerIndexForm = layer.open({
                type: 1,
                title: '目录 - ' + title,
                shift: 5,
                shade: [0.3, '#828282'],
                area: ['700px', '500px'], //宽高
                content: panelCatalog,
                closeBtn: 1,
                shadeClose: false,
            });

            domCatalog.jstree(true).settings.core.data = {
                url: function(node) {
                    return '/mcourse/nexus/' + id;
                },
                data: function(node) {
                    return {
                        'id': node.id
                    };
                }
            };
            domCatalog.jstree(true).refresh();
        },
        showPanel: function(key, n) {
            selectPanelNow = key;
            $liall.removeClass('z-crt');
            $liall.eq(n).addClass('z-crt');
            if (key == 'Form') {
                $panelForm.show();
                $panelList.hide();
            } else {
                $panelForm.hide();
                $panelList.show();
            }
        }
    }
}

function CatalogForm() {

}

function CatalogSort() {

}