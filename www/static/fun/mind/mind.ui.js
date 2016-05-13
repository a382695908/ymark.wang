var des;
$(function() {
	des = new Designer();
	UI.init();
	Dock.init();
	des.events.addEventListener("selectChanged", function() {
		Dock.update();
		UI.updateHeader()
	});
	des.events.addEventListener("updateHeader", function() {
		UI.updateHeader()
	});
	des.events.addEventListener("undoStackChanged", function(a) {
		if (a == 0) {
			$("#head_undo").button("disable")
		} else {
			$("#head_undo").button("enable")
		}
	});
	des.events.addEventListener("redoStackChanged", function(a) {
		if (a == 0) {
			$("#head_redo").button("disable")
		} else {
			$("#head_redo").button("enable")
		}
	});
	des.events.addEventListener("backgroundChanged", function(a) {
		$("#btn_background_color").css({
			backgroundColor: a
		})
	});
	des.events.addEventListener("titleChanged", function(a) {
		UI.changeTitle(a);
		$(".header_title").text(a)
	});
	des.events.addEventListener("focusTopic", function(a) {
		UI.focusCenterTopic()
	});
	des.events.addEventListener("showHotkey", function(a) {
		UI.showHotKey()
	});
	des.events.addEventListener("brushTopic", function(a) {
		$("#header_brush").removeClass("active");
		UI.hideTip()
	});
	des.events.addEventListener("brushStart", function(a) {
		$(".header_action.brush").trigger("click")
	});
	des.events.addEventListener("showDockNote", function(a) {
		Dock.showView(a);
		$("#dock_note").focus()
	});
	des.events.addEventListener("reSortConnection", function(a) {
		delete a.con;
		var b = {
			action: "update_line_pos",
			line: a
		};
		// CLB.sendMsgDirectly(b)
	})
});
var UI = {
	init: function() {
		UI.setClassicName(des.model.topic.classic);
		$("#head_undo").button({
			onClick: function() {
				des.messageSource.undo()
			}
		});
		$("#head_redo").button({
			onClick: function() {
				des.messageSource.redo()
			}
		});
		$("#contextmenu_conn").find("li").on("mouseenter",
			function(d) {
				var a = $(this);
				var b = a.attr("ac");
				var c = $("#contextmenu_conn_" + b);
				c.css({
					left: a.outerWidth(),
					top: "0px"
				}).show();
				if (b == "linecolor") {
					c.find("li").off().on("click", function(g) {
						var f = $(this).find("div:first").css("background-color");
						des.connection.setLineStyle(b, f)
					})
				} else {
					if (b == "linewidth" || b == "linetype") {
						c.find("li").off().on("click", function(g) {
							var f = $(this).attr("ac");
							des.connection.setLineStyle(b, f)
						})
					}
				}
			}).on("mouseleave", function() {
			var a = $(this);
			var b = a.attr("ac");
			$("#contextmenu_conn_" + b).hide()
		});
		$(".header_action.delete").bind("click", function() {
			if ($(this).hasClass("disabled")) {
				return
			}
			var a = des.utils.getSelected();
			if (a.length > 0) {
				des.op.removeTopic()
			}
		});
		$(".header_action.add_topic").bind("click", function() {
			var a = des.utils.getSelected();
			if (a.length > 0) {
				var b = a[a.length - 1];
				des.painter.appendTopic(b)
			}
		});
		$("#header_relationship").bind("click", function(c) {
			if ($(this).hasClass("disabled")) {
				return
			}
			var b = des.utils.getSelected();
			if (b.length > 0) {
				var d = b[0];
				var a = des.model.getTopicDomByID(d);
				des.connection.startDrawLine(a, c)
			}
		});
		$(".header_action.brush").bind("click", function() {
			des.model.brushStyles = null;
			if ($(this).hasClass("disabled")) {
				return
			}
			var a = des.utils.getSelected();
			if (a.length > 0) {
				UI.showTip("直接点击主题，应用格式刷样式，ESC退出", "left", function() {
					des.model.brushStyles = null;
					des.events.push("brushTopic")
				});
				$(this).addClass("active");
				var c = a[a.length - 1];
				var b = des.model.copyTopicStype(c);
				des.model.brushStyles = b
			}
		});
		$("#header_classic").click(function() {
			UI.showPanel("mind_classic", this)
		});
		$("#classic_list").find(".classic_item").on("click", function() {
			var b = $(this);
			var a = b.attr("tit");
			UI.setClassicName(a);
			des.model.updateClassic(a);
			UI.closePanel()
		});
		$("#classic_custom").click(function() {
			UI.showClassicCustomize()
		});
		$("#unpublish_dlg_cancel").click(function() {
			UI.closePublish("unpublish")
		});
		$("#share_link_close").click(function(a) {
			UI.closePublish("link")
		});
		$("#export_close").click(function(a) {
			UI.closePublish("export")
		});
		$("#export_ok").click(function(a) {
			UI.doExport()
		});
		$("#colla_add_btn").click(function(a) {
			UI.doAddCollaboration()
		});
		$("#feedback").click(function(a) {
			UI.showFeedBack()
		});
		$("#open_chat_btn").click(function(a) {
			CLB.showChatWin()
		});
		$("#btn_zoombig").click(function() {
			if (des.config.scale > 1.5) {
				return
			}
			des.config.scale += 0.1;
			if (des.config.scale != 1) {
				$("#header_relationship").addClass("disabled")
			} else {
				$("#header_relationship").removeClass("disabled")
			}
			des.canvas.css({
				"-webkit-transform": "scale(" + des.config.scale + ")",
				"-ms-transform": "scale(" + des.config.scale + ")",
				"-moz-transform": "scale(" + des.config.scale + ")",
				"-o-transform": "scale(" + des.config.scale + ")",
				transform: "scale(" + des.config.scale + ")"
			});
			$("#btn_sign").text(parseInt(des.config.scale * 100))
		});
		$("#btn_zoomsmall").click(function() {
			if (des.config.scale < 0.6) {
				return
			}
			des.config.scale -= 0.1;
			if (des.config.scale != 1) {
				$("#header_relationship").addClass("disabled")
			} else {
				$("#header_relationship").removeClass("disabled")
			}
			des.canvas.css({
				"-webkit-transform": "scale(" + des.config.scale + ")",
				"-ms-transform": "scale(" + des.config.scale + ")",
				"-moz-transform": "scale(" + des.config.scale + ")",
				"-o-transform": "scale(" + des.config.scale + ")",
				transform: "scale(" + des.config.scale + ")"
			});
			$("#btn_sign").text(parseInt(des.config.scale * 100))
		});
		$("#btn_mind_style").click(function() {
			UI.showPanel("mind_type", this)
		});
		$("#btn_mind_pos").click(function() {
			UI.showPanel("mind_pos", this)
		});
		$("#dock_left_mind_type").find("li").on("click", function() {
			var b = $(this);
			if (b.attr("disabled")) {
				return
			}
			var a = $("#dock_left_mind_type").find(".mind_curr");
			a.appendTo(b);
			UI.closePanel()
		});
		$("#dock_left_mind_pos").find("li").on("click", function() {
			var a = $(this);
			if (a.attr("op") == "focuscenter") {
				UI.focusCenterTopic()
			} else {
				if (a.attr("op") == "fullscreen") {
					UI.enterFullScreen()
				}
			}
			UI.closePanel()
		});
		$("#btn_font_family").button({
			onMousedown: function() {
				$("#font_list").dropdown({
					target: $("#btn_font_family"),
					onSelect: function(b) {
						var a = b.text();
						des.op.setStyle({
							family: a
						});
						$("#btn_font_family").children(":first").text(a)
					}
				})
			}
		});
		$("#btn_zoom").spinner({
			min: 50,
			max: 150,
			step: 10,
			unit: "%",
			onChange: function(a) {}
		});
		$("#btn_font_size").spinner({
			min: 12,
			max: 100,
			step: 1,
			unit: "px",
			onChange: function(a) {
				des.op.setStyle({
					fontSize: a
				})
			}
		});
		$("#btn_font_bold").bind("click", function() {
			$(this).toggleClass("selected");
			var a = $(this).hasClass("selected");
			des.op.setStyle({
				bold: a
			})
		});
		$("#btn_font_italic").bind("click", function() {
			$(this).toggleClass("selected");
			var a = $(this).hasClass("selected");
			des.op.setStyle({
				italic: a
			})
		});
		$("#btn_font_color").bind("click", function() {
			var a = $(this).getBackgroundColor();
			$.colorpicker({
				target: $("#btn_font_color"),
				position: "right",
				setColor: a,
				onSelect: function(b) {
					des.op.setStyle({
						fontColor: b
					});
					$("#btn_font_color").css({
						"border-color": b,
						"background-color": b
					})
				}
			})
		});
		$("#btn_font_align").button({
			onMousedown: function() {
				$("#font_align_list").dropdown({
					target: $("#btn_font_align"),
					position: "center",
					onSelect: function(a) {
						var b = a.attr("al");
						des.op.setStyle({
							textAlign: b
						});
						$("#btn_font_align").children("div").attr("class", "ico20 align" + b)
					}
				})
			}
		});
		$("#btn_shape").button({
			onMousedown: function() {
				$("#shape_list").dropdown({
					target: $("#btn_shape"),
					onSelect: function(b) {
						var a = b.attr("s");
						des.op.setStyle({
							shape: a
						});
						$("#btn_shape").children(":first").text(b.text())
					}
				})
			}
		});
		$("#btn_bg_color").bind("click",
			function() {
				var a = $(this).getBackgroundColor();
				$.colorpicker({
					target: $("#btn_bg_color"),
					position: "center",
					setColor: a,
					onSelect: function(b) {
						des.op.setStyle({
							bgColor: b
						});
						$("#btn_bg_color").css({
							"border-color": b,
							"background-color": b
						})
					}
				})
			});
		$("#btn_background_color").bind("click",
			function() {
				var a = $(this).getBackgroundColor();
				$.colorpicker({
					target: $("#btn_background_color"),
					position: "center",
					setColor: a,
					onSelect: function(b) {
						UI.changeBg(b);
						$("#btn_background_color").css({
							"border-color": b,
							"background-color": b
						})
					}
				})
			});
		$("#btn_line_type").button({
			onMousedown: function() {
				$("#line_type_list").dropdown({
					target: $("#btn_line_type"),
					onSelect: function(b) {
						var a = b.attr("t");
						des.op.setStyle({
							lineType: a
						});
						$("#btn_line_type").children(":first").text(b.text())
					}
				})
			}
		});
		$("#btn_line_width").button({
			onMousedown: function() {
				$("#line_width_list").dropdown({
					target: $("#btn_line_width"),
					onSelect: function(b) {
						var a = parseInt(b.attr("w"));
						des.op.setStyle({
							lineWidth: a
						});
						$("#btn_line_width").text(b.text())
					}
				})
			}
		});
		$("#btn_line_color").bind("click",
			function() {
				var a = $(this).getBackgroundColor();
				$.colorpicker({
					target: $("#btn_line_color"),
					position: "right",
					setColor: a,
					onSelect: function(b) {
						des.op.setStyle({
							lineColor: b
						});
						$("#btn_line_color").css({
							"border-color": b,
							"background-color": b
						})
					}
				})
			});
	},
	changeTitle: function(b) {
		var a = {
			action: "changeTitle",
			title: b
		};
		CLB.send(a)
	},
	changeBg: function(a) {
		des.op.setBackground(a)
	},
	changeIcon: function(g, f) {
		f.stopPropagation();
		var d = $("#icon_change_box");
		if (d.length == 0) {
			d = $("<ul id='icon_change_box'></ul>").appendTo("body")
		}
		d.empty();
		d.append("<li class='tp_icon_remove' title='删除'></li>");
		var a = g.attr("n");
		if (a) {
			d.css("width", "auto")
		} else {
			d.css("width", "238px")
		}
		var b = $(".dock_ico[n=" + a + "]");
		b.each(function() {
			var e = $(this).clone().show();
			d.append(e)
		});
		d.dropdown({
			target: g,
			position: "center"
		});
		var c = g.parents(".tp_box").attr("id");
		des.utils.select(c);
		d.children(".dock_ico").bind("click", function() {
			var h = $(this).attr("n");
			var e = $(this).attr("ico");
			var j = g.attr("i");
			var i = {
				name: h,
				index: e
			};
			des.op.updateIcon(c, j, i)
		});
		d.children(".tp_icon_remove").bind("click", function() {
			var e = g.attr("i");
			des.op.deleteIcon(c, e)
		})
	},
	toRightAligned: function() {
		des.structure.switchStructure("mind_right")
	},
	toMind: function() {
		des.structure.switchStructure("mind")
	},
	updateHeader: function() {
		var a = des.utils.getSelected();
		if (a.length == 1) {
			var b = a[a.length - 1];
			if (b != des.model.topic.id) {
				$("#header_brush").removeClass("disabled");
				$("#header_delete").removeClass("disabled");
				$("#header_relationship").removeClass("disabled")
			} else {
				$("#header_brush").addClass("disabled");
				$("#header_delete").addClass("disabled");
				$("#header_relationship").addClass("disabled")
			}
		} else {
			$("#header_brush").addClass("disabled");
			$("#header_delete").addClass("disabled");
			$("#header_relationship").addClass("disabled")
		}
	},
	showDownload: function() {
		$("#export_dialog").dlg()
	},
	showHotKey: function() {
		$("#hotkey_list").dlg()
	},
	gettingStart: function(a) {
		this.showStartStep(1)
	},
	showStartStep: function(b, e) {
		$(".mark_content").hide();
		var a = $(".mark" + b + "_content");
		a.show();
		var d;
		var c;
		if (b == 1) {
			d = $("#header_bar").offset().top + 55;
			c = 100
		} else {
			if (b == 2) {
				d = $("#dock").offset().top + 10;
				c = $("#dock").offset().left - a.outerWidth() - 15
			} else {
				if (b == 3) {
					d = $("#designer_footer").offset().top - a.outerHeight() - 16;
					c = 10
				}
			}
		}
		a.css({
			top: d,
			left: c
		})
	},
	closeGettingStart: function(a) {
		$(".mark_content").hide()
	},
	showClassicCustomize: function() {
		var d = des.utils.getSelected();
		if (d.length > 0) {
			var f = d[d.length - 1];
			var a = des.model.getTopic(f);
			var c = des.utils.getTopicStyle(a);
			$("#styles_show").remove();
			var b = $("<div id='styles_show' style='overflow:auto;position:fixed;top:60px;left:70px;width:300px;height:auto;background:#666;color:#fff;'><div>").appendTo("body");
			var e = [];
			$.each(c, function(g, h) {
				e.push("<div>" + g + " : " + h + "</div>")
			});
			b.html(e.join(""))
		}
	},
	doExport: function() {
		var a = JSON.stringify(des.model.topic);
		$("#export_definition").val(a);
		$("#export_title").val($(".header_title").text() || "未命名文件");
		var b = $("#export_form input[name='type']:checked").val();
		if (b == "svg" || b == "pdfHD") {
			this.exportSVG(b)
		}
		$("#export_form").submit();
		$("#export_dialog").dlg("close")
	},
	exportSVG: function(e) {
		var t = $("#canvas .topic");
		$("#svg_dialog").empty();
		var n = SVG("svg_dialog");
		n.attr("id", "drawing");
		var w = "<script><![CDATA[(function(){var zooms=[25,33,50,67,75,100,120,150,200,250,300,400,500];var i=5;var draw=document.getElementById('drawing');var w=parseInt(draw.getAttribute('width').replace('px',''));var h=parseInt(draw.getAttribute('height').replace('px',''));draw.onmousewheel=function(e){e=e||window.e;event(this,e);};if(draw.addEventListener)return;function event(ele,e){if(!e.ctrlKey)return;e.returnValue=false;var d=e.wheelDelta;if(d==null&&e.detail&&e.axis==e.HORIZONTAL_AXIS)d=e.detail;d>0?i=i-(-1):i--;if(i>=zooms.length){i--;return;}if(i<0){i=0;return;}draw.setAttribute('width',w*(zooms[i]/100));draw.setAttribute('height',h*(zooms[i]/100));}})();]]><\/script>";
		var u = n.group().attr({
			transform: "translate(" + $("body").width() / 2 + " " + $("body").height() / 2 + ")"
		});
		var d = Export.getColor($("#canvas").css("background-color"));
		var c = u.path("M0 0h2v2h-2v-2").fill(d.color).opacity(d.opacity);
		var l = u.group(),
			k = u.group();
		var v = Export.svg,
			m = des.classic.getClassic();
		for (var s = 0; s < t.length; s++) {
			var r = t.eq(s);
			var b = des.model.topicList[r.parent().attr("id")];
			v.draw2svg(r, k, l, b, m, e)
		}
		line = des.model.topicList.root.lines;
		if (line) {
			for (var p in line) {
				v.line2svg(l, line[p], p)
			}
		}
		var a = v.getRect(u);
		n.viewbox(a.left - 10, a.top - 10, a.width + 20, a.height + 20);
		n.size(a.width + 20, a.height + 20);
		var f = des.utils.getRelativePos(0, 0, $("#canvas"));
		var j = f.x - $("#canvas").width() / 2;
		var h = f.y - $("#canvas").height() / 2;
		var o = [
			["M", -$("body").width() / 2 + a.left - 10, -$("body").height() / 2 + a.top - 10],
			["h", a.width + 20],
			["v", a.height + 20],
			["h", -a.width - 20],
			["v", -a.height - 20],
			["z"]
		];
		c.plot(o);
		var q = $("#svg_dialog").html();
		q = encodeURIComponent(q);
		$("#export_definition").val(q);
		$("#svg_dialog").empty()
	},
	showTip: function(a, d, c) {
		if (!d) {
			d = "center"
		}
		var b = $("#designer_ui_tip");
		if (b.length == 0) {
			b = $("<div id='designer_ui_tip'><div class='ui_tip_text'></div></div>").appendTo("body");
			b.append("<div class='ico ui_tip_close'></div>");
			b.children(".ui_tip_close").bind("click", function() {
				UI.hideTip()
			})
		}
		if (c) {
			b.children(".ui_tip_close").bind("click.callback", function() {
				c()
			})
		} else {
			b.children(".ui_tip_close").unbind("click.callback")
		}
		b.children(".ui_tip_text").html(a);
		if (d == "center") {
			b.css("left", ($("body").width() - b.outerWidth()) / 2)
		} else {
			b.css("left", "50px")
		}
		b.fadeIn("fast")
	},
	hideTip: function() {
		$("#designer_ui_tip").hide()
	},
	showPanel: function(b, d, f) {
		var a;
		var c = $(d);
		var e = "left";
		if (b == "mind_type") {
			a = $("#dock_left_mind_type")
		} else {
			if (b == "mind_pos") {
				a = $("#dock_left_mind_pos")
			} else {
				if (b == "mind_classic") {
					a = $("#classic_list");
					e = "top"
				}
			}
		}
		if (e == "top") {
			a.addClass("top");
			a.css({
				top: c.offset().top + c.height() + 12,
				left: c.offset().left - a.width() / 2 + c.outerWidth() / 2
			})
		} else {
			a.css({
				top: c.offset().top - 10
			})
		}
		a.show();
		a.off("mousedown.panel").on("mousedown.panel", function(g) {
			g.stopPropagation()
		});
		$(document).off("mousedown.panel").on("mousedown.panel", function() {
			a.hide()
		})
	},
	closePanel: function() {
		$("#dock_left_mind_type").hide();
		$("#dock_left_mind_pos").hide();
		$("#classic_list").hide()
	},
	focusCenterTopic: function() {
		$("#canvas_container").scrollTop((des.config.canvasHeight - $("#canvas_container").height()) / 2 + 25);
		$("#canvas_container").scrollLeft((des.config.canvasWidth - $("#canvas_container").width()) / 2);
	},
	fullScreen: function(a, b) {
		if (a.requestFullscreen) {
			a.requestFullscreen()
		} else {
			if (a.mozRequestFullScreen) {
				a.mozRequestFullScreen()
			} else {
				if (a.webkitRequestFullscreen) {
					a.webkitRequestFullscreen()
				} else {
					if (b) {
						$("#fullscreen_tip").find(".t").text("由于您的浏览器限制，无法进入演示视图。")
					} else {
						$("#fullscreen_tip").find(".t").text("无法进入全屏视图，您可以按(F11)进入。")
					}
					$("#fullscreen_tip").fadeIn()
				}
			}
		}
	},
	enterFullScreen: function() {
		UI.fullScreen(document.documentElement)
	},
	setClassicName: function(a) {
		if (a == null || a == "defaultClassic") {
			$("#header_classic").text("默认风格")
		} else {
			if (a == "niupizhi") {
				$("#header_classic").text("牛皮纸风格")
			} else {
				if (a == "caihongpao") {
					$("#header_classic").text("彩虹泡")
				} else {
					if (a == "shangwu") {
						$("#header_classic").text("简约商务")
					}
				}
			}
		}
	}
};
var Dock = {
	init: function() {
		var g = $(window).width() - $("#canvas_block").width();
		$("#dock").css("right", g + 2);
		$(".dock_view").css("right", g + 40);
		$(".dock_view").bind("keydown", function(i) {
			i.stopPropagation()
		});
		var f = 30;
		var e = 0;
		var a = $(".dock_icons");
		var c = [];
		while (e <= 66) {
			var b = $("<li class='dock_ico' ico='" + e + "'><span></span></li>").appendTo(a);
			var d = b.children("span");
			var h = f * e;
			d.css("background-position", "0px -" + h + "px");
			if (c.indexOf(e) >= 0) {
				b.hide()
			}
			if (e == 37) {
				a.append('<li class="dock_devider"></li>')
			}
			if (e <= 9 || e == 65 || e == 66) {
				b.attr("n", "priority")
			} else {
				if (e <= 16) {
					b.attr("n", "face")
				} else {
					if (e <= 25) {
						b.attr("n", "completion")
					} else {
						if (e <= 32) {
							b.attr("n", "flag")
						} else {
							if (e <= 37) {
								b.attr("n", "arrow")
							} else {
								b.attr("n", "")
							}
						}
					}
				}
			}
			e++
		}
		$(".dock_ico[ico=9]").after($(".dock_ico[ico=66]"));
		$(".dock_ico[ico=9]").after($(".dock_ico[ico=65]"));
		$(".ico_dock_collapse").off().on("click",
			function() {
				var i = $(this);
				i.parent().parent().hide();
				$(".dock_btn").removeClass("selected")
			});
		$(".dock_ico").bind("click",
			function() {
				var j = $(this).attr("n");
				var i = $(this).attr("ico");
				var k = {
					name: j,
					index: i
				};
				des.op.setIcon(k)
			});
		$("#dock_note").bind("blur",
			function() {
				var j = $(this).val();
				var i = des.utils.getSelected();
				if (i.length != 1) {
					return
				}
				var k = i[0];
				des.op.setNote(j, k)
			});
		$("#dock_tag").bind("blur",
			function() {
				var i = $(this).val();
				des.op.setTag(i)
			});
		$("#dock_link_url").bind("blur",
			function() {
				var i = $(this).val();
				if (i == "http://") {
					return
				}
				var j = {
					type: "url",
					value: i
				};
				des.op.setLink(j)
			});
		$("#task_priority").button({
			onMousedown: function() {
				$("#task_priority_list").dropdown({
					target: $("#task_priority"),
					onSelect: function(j) {
						var i = j.text();
						var l = j.attr("v");
						$("#task_priority").children(":first").text(i);
						$("#task_priority").attr("v", l);
						des.op.setTask({
							priority: l
						});
						if (l == "") {
							des.op.deleteIconByName("priority")
						} else {
							var m = j.attr("ico");
							var k = {
								name: "priority",
								index: m
							};
							des.op.setIcon(k)
						}
					}
				})
			}
		});
		$("#task_completion").button({
			onMousedown: function() {
				$("#task_completion_list").dropdown({
					target: $("#task_completion"),
					onSelect: function(j) {
						var i = j.text();
						var l = j.attr("v");
						$("#task_completion").children(":first").text(i);
						$("#task_completion").attr("v", l);
						des.op.setTask({
							completion: l
						});
						if (l == "") {
							des.op.deleteIconByName("completion")
						} else {
							var m = j.attr("ico");
							var k = {
								name: "completion",
								index: m
							};
							des.op.setIcon(k)
						}
					}
				})
			}
		});

		$("#task_dur").bind("blur",
			function() {
				des.op.setTask({
					duration: $("#task_dur").val()
				})
			});
		$("#task_dur_unit").button({
			onMousedown: function() {
				$("#task_dur_unit_list").dropdown({
					target: $("#task_dur_unit"),
					onSelect: function(j) {
						var i = j.text();
						var k = j.attr("v");
						$("#task_dur_unit").children(":first").text(i);
						$("#task_dur_unit").attr("v", k);
						des.op.setTask({
							durationUnit: k
						})
					}
				})
			}
		});
		$("#task_assigned").bind("blur",
			function() {
				des.op.setTask({
					assigned: $("#task_assigned").val()
				})
			})
	},
	reset: function() {
		var a = {
			btn_font_family: "字体",
			btn_shape: "形状",
			btn_line_type: "连线类型",
			btn_line_width: "连线宽度"
		};
		$("#task_priority").children(":first").text($("#task_priority_list").children(":first").text());
		$("#task_priority").attr("v", null);
		$("#task_completion").children(":first").text($("#task_completion_list").children(":first").text());
		$("#task_completion").attr("v", null);
		$("#task_start").val("");
		$("#task_end").val("");
		$("#task_dur").val("");
		$("#task_dur_unit").children(":first").text($("#task_dur_unit_list").children("[v=hour]").text()).attr("v", "hour");
		$("#task_assigned").val("");
		$("#btn_zoom").spinner("setValue", "100%");
		$("#dock_note").val("");
		$("#dock_tag").val("");
		$("#dock_link_url").val("http://");
		$("#btn_font_family").children(":first").text(a.btn_font_family);
		$("#btn_font_bold").removeClass("selected");
		$("#btn_font_italic").removeClass("selected");
		$("#btn_font_color").attr("style", null);
		$("#btn_font_align").removeClass("alignright").removeClass("aligncenter").addClass("alignleft");
		$("#btn_shape").children(":first").text(a.btn_shape);
		$("#btn_bg_color").attr("style", null);
		$("#btn_line_type").children(":first").text(a.btn_line_type);
		$("#btn_line_width").children(":first").text(a.btn_line_width);
		$("#btn_line_color").attr("style", null);
		$("#btn_font_size").spinner("setValue", "12px")
	},
	update: function() {
		this.reset();
		if (this.currentView == "link") {
			if (this.currentTab[this.currentView] == "topic") {
				this.buildTopicTree()
			}
		} else {
			if (this.currentView == "nav") {
				Navigator.init({
					domID: "nav_canvas"
				})
			} else {
				if (this.currentView == "style") {
					Dock.showStyle()
				} else {
					if (this.currentView == "note") {
						Dock.showNote()
					} else {
						if (this.currentView == "task") {
							Dock.showTask()
						}
					}
				}
			}
		}
	},
	currentView: "",
	currentTab: {},
	showView: function(a) {
		$(".dock_view").hide();
		$(".dock_view_" + a).show();
		var b = $("#dock_btn_" + a);
		$(".dock_btn").removeClass("selected");
		b.addClass("selected");
		this.currentView = a;
		this.update();
		$("#dock_link_url").select()
	},
	showTab: function(c, b) {
		var a = $(".dock_view_" + c);
		a.find(".tabs").children().removeClass("current");
		a.find(".tab_bar_" + b).addClass("current");
		a.find(".dock_tab").hide();
		a.find(".dock_tab_" + b).show();
		this.currentTab[c] = b;
		this.showView(c)
	},
	buildTopicTree: function() {
		var a = des.model.topic;
		var c = $(".dock_link_topics");
		c.empty();

		function b(e, d, k) {
			var j = $("<li><div tp_id='" + e.id + "'>" + e.title + "</div></li>").appendTo(d);
			var g = j.children("div");
			g.css("padding-left", k);
			if (e.children && e.children.length > 0) {
				var h = $("<ul></ul>").appendTo(j);
				g.append("<span class='ico20 arr_expanded'></span>");
				k += 20;
				for (var f = 0; f < e.children.length; f++) {
					var l = e.children[f];
					b(l, h, k)
				}
			} else {
				g.css("padding-left", k + 20)
			}
		}
		b(a, c, 5);
		c.find(".ico20").bind("click", function(g) {
			g.stopPropagation();
			var f = $(this).parent().parent();
			var d = f.children("ul");
			if ($(this).hasClass("arr_expanded")) {
				$(this).attr("class", "ico20 arr_collapsed");
				d.hide()
			} else {
				$(this).attr("class", "ico20 arr_expanded");
				d.show()
			}
		});
		c.find("div").bind("click", function() {
			c.find(".selected").removeClass("selected");
			$(this).addClass("selected");
			var e = $(this).attr("tp_id");
			var d = {
				type: "topic",
				value: e
			};
			des.op.setLink(d)
		})
	},
	showTask: function() {
		var c = des.utils.getSelected();
		if (c.length == 0) {
			return
		}
		if (c.length > 1) {
			return
		}
		var b = des.model.getTopic(c[0]);
		var a = b.task;
		if (a != null && a.priority != null) {
			var d = $("#task_priority_list li[v=" + a.priority + "]");
			$("#task_priority").children(":first").text(d.text())
		}
		if (a != null && a.start != null) {
			$("#task_start").val(a.start)
		}
		if (a != null && a.end != null) {
			$("#task_end").val(a.end)
		}
		if (a != null && a.duration != null) {
			$("#task_dur").val(a.duration)
		}
		if (a != null && a.durationUnit != null) {
			var d = $("#task_dur_unit_list li[v=" + a.durationUnit + "]");
			$("#task_dur_unit").children(":first").text(d.text())
		}
		if (a != null && a.completion != null) {
			var d = $("#task_completion_list li[v=" + a.completion + "]");
			$("#task_completion").children(":first").text(d.text())
		}
		if (a != null && a.assigned != null) {
			$("#task_assigned").val(a.assigned)
		}
	},
	showNote: function() {
		var d = des.utils.getSelected();
		if (d.length == 0) {
			return
		}
		if (d.length > 1) {
			return
		}
		var b = des.model.getTopic(d[0]);
		var c = b.note;
		var a = b.tag;
		$("#dock_note").val(c);
		$("#dock_tag").val(a)
	},
	showStyle: function() {
		var b = des.utils.getSelected();
		if (b.length == 0) {
			return
		}
		var a = des.model.getTopic(b[0]);
		c(a);

		function c(e) {
			var f = des.model.topic.background == "" ? des.classic.getBackground() : des.model.topic.background;
			des.events.push("backgroundChanged", f);
			var i = des.classic.getClassic();
			var d = des.utils.copy(i.commonStyle);
			if (e.parent == null) {
				d = $.extend(d, des.utils.copy(i.centerTopic))
			} else {
				if (e.parent == "root") {
					d = $.extend(d, des.utils.copy(i.childTopic))
				} else {
					d = $.extend(d, des.utils.copy(i.othersTopic))
				}
			}
			var h = $.extend(d, des.utils.copy(e.style));
			if (h != null) {
				var g = h;
				if (g.bold != null && g.bold == true) {
					$("#btn_font_bold").addClass("selected")
				}
				if (g.family != null) {
					$("#btn_font_family").children(":first").text(g.family)
				}
				if (g.fontColor != null) {
					$("#btn_font_color").css({
						"border-color": g.fontColor,
						"background-color": g.fontColor
					})
				}
				if (g.fontSize != null) {
					$("#btn_font_size").spinner("setValue", g.fontSize + "px")
				}
				if (g.italic != null && g.italic == true) {
					$("#btn_font_italic").addClass("selected")
				}
				if (g.textAlign != null) {
					$("#btn_font_align").children("div").attr("class", "ico20 align" + g.textAlign)
				}
				if (g.shape != null) {
					var j = $("#shape_list li[s=" + g.shape + "]");
					$("#btn_shape").children(":first").text(j.text())
				}
				if (g.bgColor != null) {
					$("#btn_bg_color").css({
						"border-color": g.bgColor,
						"background-color": g.bgColor
					})
				}
				if (g.lineType != null) {
					var j = $("#line_type_list li[t=" + g.lineType + "]");
					$("#btn_line_type").children(":first").text(j.text())
				}
				if (g.lineWidth != null) {
					var j = $("#line_width_list li[w=" + g.lineWidth + "]");
					$("#btn_line_width").text(j.text())
				} else {
					var j = $("#line_width_list li[w]:first");
					$("#btn_line_width").text(j.text())
				}
				if (g.lineColor != null) {
					$("#btn_line_color").css({
						"border-color": g.lineColor,
						"background-color": g.lineColor
					})
				}
			}
		}
	},
	drawNavigator: function() {
		var a = des.canvas.html()
	}
};
var sliderTip = {
	init: function(c) {
		var e = $(c.dom);
		e.fadeIn();
		var b = e.children().length;
		var d = e.height();
		var a = 0;

		function f() {
			e.css({
				top: -a * d
			});
			a++;
			if (a >= b) {
				a = 0
			}
		}
		window.setInterval(f, 7000)
	}
};
var Navigator = {
	topicPosList: {},
	topicLinkers: [],
	opt: {},
	context: null,
	buildTopicList: function() {
		var c = this;

		function a(p, q) {
			var s = {};
			var j = des.model.getTopicDomByID(p.id);
			var u = p.parent == "root" ? c.opt.subTopic.width : p.parent == null ? c.opt.rootTopic.width : c.opt.topic.width;
			var o = p.parent == "root" ? c.opt.subTopic.height : p.parent == null ? c.opt.rootTopic.height : c.opt.topic.height;
			if (j.width() < u) {
				s.x = j.offset().left
			} else {
				s.x = j.offset().left + j.width() / 2 - u / 2
			}
			if (j.width() < o) {
				s.y = j.offset().top
			} else {
				s.y = j.offset().top + j.height() / 2 - o / 2
			}
			s.w = u;
			s.h = o;
			c.topicPosList[p.id] = s;
			var g = p.children;
			var f = {};
			if (q == null) {
				f = c.getRootPos()
			} else {
				if (q != null) {
					f = q
				}
			}
			if (g.length > 0) {
				for (var n = 0; n < g.length; n++) {
					var v = g[n];
					var e = des.model.getTopicDomByID(v.id);
					var k = e.offset().left;
					var r = e.offset().top;
					var l = {};
					var m = {};
					l.y = r + e.height() / 2;
					m.y = r + e.height() / 2;
					if (k > d.x) {
						l.x = k;
						m.x = k + e.width()
					} else {
						l.x = k + e.width();
						m.x = k
					}
					c.topicLinkers.push({
						start: f,
						end: l
					});
					a(v, m)
				}
			}
		}
		var b = des.model.topic;
		c.topicPosList = {};
		c.topicLinkers = [];
		var d = c.getRootPos();
		a(b)
	},
	drawRect: function(b) {
		var a = this;
		if (a.context == null) {
			return
		}
		a.context.fillStyle = a.opt.itemBgColor;
		a.context.fillRect(b.x, b.y, b.w, b.h)
	},
	drawLinker: function(g, d) {
		var e = this;
		var f = g.start;
		var a = g.end;
		e.context.strokeStyle = e.opt.itemBgColor;
		e.context.lineWidth = 1;
		e.context.lineCap = "square";
		e.context.beginPath();
		e.context.moveTo(f.x, f.y);
		if (d.lineType == "straight") {
			e.context.lineTo(a.x, a.y);
			e.context.stroke();
			e.context.closePath()
		} else {
			if (d.lineType == "curve") {
				var c = {
					x: f.x,
					y: f.y / 2 + a.y / 2
				};
				var b = {
					x: a.x / 2 + f.x / 2,
					y: a.y
				};
				e.context.bezierCurveTo(c.x, c.y, b.x, b.y, a.x, a.y);
				e.context.stroke();
				e.context.closePath()
			} else {
				if (d.lineType == "broken" || d.lineType == "roundBroken") {
					e.context.lineTo(f.x, a.y);
					e.context.lineTo(a.x, a.y);
					e.context.stroke();
					e.context.closePath()
				}
			}
		}
	},
	getCanvas: function() {
		return document.getElementById(this.opt.domID)
	},
	getRootPos: function() {
		var b = des.model.topic;
		var a = des.model.getTopicDomByID(b.id);
		return {
			x: a.offset().left + a.width() / 2,
			y: a.offset().top + a.height() / 2
		}
	},
	getShapesArea: function() {
		var a = null;
		var d = null;
		var c = null;
		var b = null;
		des.canvas.find(".tp_container[style]").each(function() {
			var g = $(this);
			var h = g.offset();
			var f = h.left + g.width();
			var e = h.top + g.height();
			if (a == null || h.left < a) {
				a = h.left
			}
			if (d == null || h.top < d) {
				d = h.top
			}
			if (c == null || f > c) {
				c = f
			}
			if (b == null || e > b) {
				b = e
			}
		});
		return {
			w: c - a,
			h: b - d
		}
	},
	initContext: function() {
		var a = this.getCanvas();
		return a.getContext("2d")
	},
	init: function(d) {
		var f = this;
		f.opt = {};
		f.opt = $.extend({
				itemBgColor: "rgb(95, 213, 164)",
				rootTopic: {
					width: 130,
					height: 50
				},
				subTopic: {
					width: 90,
					height: 35
				},
				topic: {
					width: 50,
					height: 20
				}
			},
			d);
		var c = f.getCanvas();
		c.width = 150;
		c.height = 150;
		f.context = f.initContext();
		var e = f.getShapesArea();
		if (e.w < 150) {
			f.context.scale(0.5, 0.5);
			f.context.translate(-530, -175)
		} else {
			if (e.w / 150 > 1 && e.w / 150 < 2) {
				f.context.scale(0.4, 0.4);
				f.context.translate(-560, -130)
			} else {
				if (e.w / 150 > 2 && e.w / 150 < 3) {
					f.context.scale(0.3, 0.3);
					f.context.translate(-430, -75)
				} else {
					if (e.w / 150 > 3 && e.w / 150 < 5) {
						f.context.scale(0.2, 0.2);
						f.context.translate(-280, 120)
					} else {
						if (e.w / 150 > 5 && e.w / 150 < 6) {
							f.context.scale(0.15, 0.15);
							f.context.translate(-180, 210)
						} else {
							if (e.w / 150 > 6 && e.w / 150 < 12) {
								f.context.scale(0.1, 0.1);
								f.context.translate(180, 430)
							} else {
								if (e.w / 150 > 12 && e.w / 150 < 17) {
									f.context.scale(0.07, 0.07);
									f.context.translate(430, 1130)
								}
							}
						}
					}
				}
			}
		}
		f.buildTopicList();
		var g = f.topicPosList;
		$.each(g,
			function(j, i) {
				f.drawRect(i)
			});
		var b = des.model.topic;
		var a = des.utils.getTopicStyle(b);
		var h = f.topicLinkers;
		$.each(h,
			function(j, i) {
				f.drawLinker(i, a)
			})
	}
};
(function(c) {
	c.fn.button = function(e) {
		if (typeof e == "string") {
			if (e == "disable") {
				c(this).addClass("disabled");
				c(this).find("input").attr("disabled", true)
			} else {
				if (e == "enable") {
					c(this).removeClass("disabled");
					c(this).find("input").attr("disabled", false)
				} else {
					if (e == "isDisabled") {
						return c(this).hasClass("disabled")
					} else {
						if (e == "isSelected") {
							return c(this).hasClass("selected")
						} else {
							if (e == "unselect") {
								c(this).removeClass("selected")
							} else {
								if (e == "select") {
									c(this).addClass("selected")
								} else {
									if (e == "setText") {
										c(this).children(".text_content").html(arguments[1])
									} else {
										if (e == "setColor") {
											c(this).children(".btn_color").css("background-color", "rgb(" + arguments[1] + ")")
										} else {
											if (e == "getColor") {
												var d = c(this).children(".btn_color").css("background-color").replace(/\s/g, "");
												return d.substring(4, d.length - 1)
											}
										}
									}
								}
							}
						}
					}
				}
			}
			return c(this)
		}
		var f = c(this);
		f.unbind("click");
		f.unbind("mousedown");
		if (e.onClick) {
			f.bind("click", function() {
				if (f.button("isDisabled")) {
					return
				}
				e.onClick()
			})
		}
		if (e.onMousedown) {
			f.bind("mousedown", function(g) {
				if (f.button("isDisabled")) {
					return
				}
				e.onMousedown();
				g.stopPropagation()
			})
		}
	};
	var b = null;
	c.fn.dropdown = function(e) {
		var i = c(this);
		i.find(".ico_selected").remove();
		if (typeof e == "string") {
			if (e == "close") {
				des.op.opArea = "designer";
				i.hide();
				b.target.removeClass("selected");
				c(document).unbind("mousedown.ui_dropdown");
				b = null
			} else {
				if (e == "select") {
					arguments[1].prepend("<div class='ico ico_selected'></div>")
				}
			}
			return
		}
		if (b != null) {
			b.menu.dropdown("close")
		}
		var i = c(this);
		var d = e.target;
		b = {
			target: d,
			menu: i
		};
		var h = d.offset();
		d.addClass("selected");
		if (e.fade) {
			i.fadeIn("normal")
		} else {
			i.show()
		}
		var g;
		if (e.position == "center") {
			g = h.left + d.outerWidth() / 2 - i.outerWidth() / 2
		} else {
			if (e.position == "right") {
				g = h.left + d.outerWidth() - i.outerWidth()
			} else {
				g = h.left
			}
		}
		var f = h.top + d.outerHeight();
		if (f + i.outerHeight() > c(window).height()) {
			f = c(window).height() - i.outerHeight()
		}
		i.css({
			top: f,
			left: g
		});
		if (typeof e.zindex != "undefined") {
			i.css("z-index", e.zindex)
		}
		i.unbind("mousedown").bind("mousedown", function(j) {
			j.stopPropagation()
		});
		if (typeof e.bind == "undefined" || e.bind == true) {
			i.find("li:not(.devider,.menu_text)").unbind().bind("click", function() {
				var j = c(this);
				if (!j.menuitem("isDisabled") && j.children(".extend_menu").length == 0) {
					if (e.onSelect) {
						e.onSelect(j)
					}
					i.dropdown("close")
				}
			})
		}
		c(document).bind("mousedown.ui_dropdown", function() {
			i.dropdown("close")
		})
	};
	c.colorpicker = function(g) {
		des.op.opArea = "others";
		var f = c("#color_picker");
		f.find(".selected").removeClass("selected");
		var h = c.extend({},
			g, {
				bind: false
			});
		f.dropdown(h);
		f.find(".color_picker_left").children(".color_items").children("div").unbind().bind("click", function() {
			if (g.onSelect) {
				var i = c(this).css("background-color");
				i = i.replace(/\s/g, "");
				g.onSelect(i)
			}
			c("#color_picker").dropdown("close")
		});
		if (g.color) {
			f.find("div[col='" + g.color + "']").addClass("selected")
		}
		c("#color_picker").children(".color_extend").remove();
		if (g.extend) {
			c("#color_picker").append("<div class='color_extend'>" + g.extend + "</div>")
		}
		if (g.setColor != null) {
			var e = g.setColor;
			if (e.hex.indexOf("#") >= 0) {
				f.find("input[tit='hex']").val(e.hex.substring(1))
			}
			if (e.rgb.indexOf(",") >= 0) {
				var d = e.rgb.split(",");
				f.find("input[tit='red']").val(c.trim(d[0]));
				f.find("input[tit='green']").val(c.trim(d[1]));
				f.find("input[tit='blue']").val(c.trim(d[2]))
			}
		} else {
			f.find("input[tit]").val("")
		}
		f.find("input[tit=red],input[tit=green],input[tit=blue]").off("blur").on("blur", function(m) {
			var l = f.find("input[tit='red']").val();
			var k = f.find("input[tit='green']").val();
			var i = f.find("input[tit='blue']").val();
			if (l != "" && k != "" && i != "") {
				if (isNaN(l) || isNaN(k) || isNaN(i)) {
					return
				}
				var j = "rgb(" + l + "," + k + "," + i + ")";
				if (g.onSelect) {
					j = j.replace(/\s/g, "");
					g.onSelect(j)
				}
			}
		});
		f.find("input[tit=hex]").off("blur").on("blur", function(j) {
			if (c.trim(c(this).val()) == "") {
				return
			}
			if (g.onSelect) {
				var i = "#" + c(this).val();
				i = i.replace(/\s/g, "");
				g.onSelect(i)
			}
			c("#color_picker").dropdown("close");
			j.stopPropagation()
		})
	};
	c.fn.colorButton = function(e) {
		var d = c(this);
		if (typeof e == "string") {
			if (e == "setColor") {
				d.children(".picker_btn_holder").css("background-color", "rgb(" + arguments[1] + ")")
			}
			return
		}
		d.html("<div class='picker_btn_holder'></div><div class='ico ico_colordrop'></div>");
		d.bind("mousedown",
			function(h) {
				if (d.button("isDisabled")) {
					return
				}
				h.stopPropagation();
				var g = c.extend({},
					e);
				g.target = d;
				g.onSelect = function(i) {
					d.colorButton("setColor", i);
					if (e.onSelect) {
						e.onSelect(i)
					}
				};
				var f = c(this).children(".picker_btn_holder").css("background-color");
				f = f.replace(/\s/g, "");
				f = f.substring(4, f.length - 1);
				g.color = f;
				c.colorpicker(g)
			})
	};
	c.fn.spinner = function(g) {
		var j = c(this);
		if (typeof g == "string") {
			if (g == "getValue") {
				var d = j.find("input").val();
				d = parseInt(d);
				return d
			} else {
				if (g == "setValue") {
					j.find("input").val(arguments[1]);
					j.attr("old", arguments[1])
				} else {
					if (g == "setOptions") {
						var i = arguments[1];
						if (typeof i.min != "undefined") {
							j.attr("min", i.min)
						}
						if (typeof i.max != "undefined") {
							j.attr("max", i.max)
						}
					}
				}
			}
			return
		}
		j.html("<div class='spinner_input'><input/></div><div class='buttons'><div class='spinner_up'></div><div class='spinner_down'></div></div>");
		var h = {
			step: 1,
			unit: ""
		};
		g = c.extend(h, g);
		if (typeof g.min != "undefined") {
			j.attr("min", g.min)
		}
		if (typeof g.max != "undefined") {
			j.attr("max", g.max)
		}
		var e = j.children(".spinner_input");
		var f = e.find("input");
		j.spinner("setValue", g.min + g.unit);
		j.find(".spinner_up").bind("click", function() {
			if (j.button("isDisabled")) {
				return
			}
			var l = j.spinner("getValue");
			var k = l + g.step;
			a(j, k, g)
		});
		j.find(".spinner_down").bind("click", function() {
			if (j.button("isDisabled")) {
				return
			}
			var l = j.spinner("getValue");
			var k = l - g.step;
			a(j, k, g)
		});
		f.bind("keydown", function(l) {
			if (l.keyCode == 13) {
				var k = parseInt(c(this).val());
				if (isNaN(k)) {
					k = g.min
				}
				a(j, k, g)
			}
		}).bind("focus", function(l) {
			c(this).select();
			c(this).bind("mouseup",
				function(m) {
					m.preventDefault();
					c(this).unbind("mouseup")
				});
			var k = c(this).parent().parent();
			if (!k.hasClass("active")) {
				k.addClass("active inset")
			}
		}).bind("blur", function(l) {
			var k = c(this).parent().parent();
			if (k.hasClass("inset")) {
				k.removeClass("active inset")
			}
		})
	};

	function a(j, h, g) {
		if (j.attr("max")) {
			var d = parseInt(j.attr("max"));
			if (h > d) {
				h = d
			}
		}
		if (j.attr("min")) {
			var f = parseInt(j.attr("min"));
			if (h < f) {
				h = f
			}
		}
		var e = j.attr("old");
		var i = h + g.unit;
		if (e != i) {
			if (g.onChange) {
				g.onChange(h)
			}
		}
		j.spinner("setValue", h + g.unit)
	}
	c.fn.menuitem = function(d) {
		var e = c(this);
		if (typeof d == "string") {
			if (d == "disable") {
				e.addClass("disabled")
			} else {
				if (d == "enable") {
					e.removeClass("disabled")
				} else {
					if (d == "isDisabled") {
						return e.hasClass("disabled")
					} else {
						if (d == "isSelected") {
							return e.children(".ico_selected").length > 0
						} else {
							if (d == "unselect") {
								return e.children(".ico_selected").remove()
							} else {
								if (d == "select") {
									return e.prepend("<div class='ico ico_selected'></div>")
								}
							}
						}
					}
				}
			}
		}
	};
	c.fn.dlg = function(d) {
		var g = c(this);
		if (typeof d == "string") {
			if (d == "close") {
				g.children(".dlg_close").trigger("click")
			}
			return
		}
		var e = {
			closable: true
		};
		d = c.extend(e, d);
		var f = g.children(".dlg_close");
		if (f.length == 0) {
			f = c("<div class='ico dlg_close'></div>").appendTo(g)
		}
		if (d.closable == false) {
			f.hide()
		} else {
			f.show()
		}
		c(".dlg_mask").remove();
		c("body").append("<div class='dlg_mask'></div>");
		f.unbind().bind("click", function() {
			g.hide();
			c(".dlg_mask").remove();
			if (d && d.onClose) {
				d.onClose()
			}
			c(document).unbind("keydown.closedlg");
			g.find("input,textarea,select").unbind("keydown.closedlg")
		});
		g.css({
			left: (c(window).width() - g.outerWidth()) / 2,
			top: (c(window).height() - g.outerHeight()) / 2
		});
		g.show();
		if (d.closable) {
			g.find("input,textarea,select").unbind("keydown.closedlg").bind("keydown.closedlg", function(h) {
				if (h.keyCode == 27) {
					g.children(".dlg_close").trigger("click")
				}
			});
			c(document).unbind("keydown.closedlg").bind("keydown.closedlg", function(h) {
				if (h.keyCode == 27) {
					g.children(".dlg_close").trigger("click")
				}
			})
		}
		g.children(".dialog_header").unbind("mousedown.drag_dlg").bind("mousedown.drag_dlg", function(j) {
			var i = c(this).parent();
			var m = j.pageX;
			var k = j.pageY;
			var l = i.offset().left;
			var h = i.offset().top;
			c(document).bind("mousemove.drag_dlg", function(p) {
				var o = p.pageX - m + l;
				var n = p.pageY - k + h;
				i.offset({
					left: o,
					top: n
				})
			});
			c(document).bind("mouseup.drag_dlg", function(n) {
				c(document).unbind("mousemove.drag_dlg");
				c(document).unbind("mouseup.drag_dlg")
			})
		})
	};
	c.fn.getBackgroundColor = function() {
		var f = c(this).css("background-color") + "";
		var d = {};
		if (f.indexOf("rgba(0") < 0) {
			if (!c.browser.msie) {
				var e = f.substring(4, f.length - 1);
				d.rgb = e;
				f = f.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);

				function g(h) {
					return ("0" + parseInt(h).toString(16)).slice(-2)
				}
				f = "#" + g(f[1]) + g(f[2]) + g(f[3]);
				d.hex = f
			}
			return d
		} else {
			return null
		}
	}
})(jQuery);