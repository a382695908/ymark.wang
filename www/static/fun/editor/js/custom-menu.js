(function () {
    // 获取 wangEditor 构造函数和 jquery
    var E = window.wangEditor;
    var $ = window.jQuery;

    // 创建返回按钮
    E.createMenu(function (check) {
        var menuId = 'menureturn';
        if (!check(menuId)) {return; }
        var editor = this;
        var menu = new E.Menu({
            editor: editor,  // 编辑器对象
            id: menuId,  // 菜单id
            title: '返回', // 菜单标题
            $domNormal: $('<a href="javascript:;" tabindex="-1"><i class="glyphicon glyphicon-menu-left"></i></a>'),
            $domSelected: $('<a href="javascript:;" tabindex="-1" class="selected"><i class="glyphicon glyphicon-menu-left"></i></a>')
        });
        // 菜单正常状态下，点击将触发该事件
        menu.clickEvent = window.onReturn;
        // 增加到editor对象中
        editor.menus[menuId] = menu;
    });

    // 创建目录按钮
    E.createMenu(function (check) {
        var menuId = 'catalog';
        if (!check(menuId)) {return; }
        var editor = this;
        var menu = new E.Menu({
            editor: editor,  // 编辑器对象
            id: menuId,  // 菜单id
            title: '编辑目录', // 菜单标题
            $domNormal: $('<a href="javascript:;" tabindex="-1"><i class="glyphicon glyphicon-th-list"></i></a>'),
            $domSelected: $('<a href="javascript:;" tabindex="-1" class="selected"><i class="glyphicon glyphicon-th-list"></i></a>')
        });
        // 菜单正常状态下，点击将触发该事件
        menu.clickEvent = window.onCatalog;
        // 增加到editor对象中
        editor.menus[menuId] = menu;
    });
})();