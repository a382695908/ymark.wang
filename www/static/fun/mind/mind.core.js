function Designer(a) {
	var b = this;
	this.config = {
		canvasWidth: 20000,
		canvasHeight: 20000,
		topicMargin: 40,
		readonly: false,
		showHead: true,
		scale: 1
	};
	this.canvas = null;
	this.toScale = function(c) {
		return c * b.config.scale
	};
	this.restoreScale = function(c) {
			return c / b.config.scale
		},
		this.model = {
			topic: {
				id: "root",
				title: "",
				children: [],
				structure: "mind",
				classic: "defaultClassic",
				background: ""
			},
			topicList: {},
			persistenceList: {},
			clipboard: {
				type: "copy",
				list: []
			},
			buildTopicList: function() {
				function c(d) {
					b.model.topicList[d.id] = d;
					b.model.persistenceList[d.id] = b.utils.copy(d);
					if (d.children && d.children.length > 0) {
						for (var e = 0; e < d.children.length; e++) {
							var f = d.children[e];
							c(f)
						}
					}
				}
				b.model.topicList = {};
				b.model.persistenceList = {};
				c(this.topic)
			},
			getTopic: function(c) {
				return this.topicList[c]
			},
			getTopicString: function() {
				return JSON.stringify(b.model.topic)
			},
			getTopicIndex: function(h) {
				var f = this.getParent(h);
				var c = 0;
				if (f != null) {
					var e = f.children;
					for (var d = 0; d < e.length; d++) {
						var g = e[d];
						if (g.id == h) {
							c = d;
							break
						}
					}
				}
				return c
			},
			getTopicDomByID: function(c) {
				return $(".tp_box[id=" + c + "]")
			},
			getTopicLinkerByID: function(c) {
				return $("#tp_linker_" + c)
			},
			getTopicSubLinkersByID: function(c) {
				return $(".sub_linker_canvas[fortp=" + c + "]")
			},
			getParent: function(d) {
				var c = this.getTopic(d);
				if (c) {
					return this.getTopic(c.parent)
				}
				return null
			},
			getSubTopic: function(d) {
				var c = this.getTopic(d);
				while (c.parent != b.model.topic.id) {
					c = this.getTopic(c.parent)
				}
				return c
			},
			getNextTopic: function(g) {
				var f = b.model.getParent(g),
					e = null;
				if (f != null) {
					for (var d = 0; d < f.children.length; d++) {
						var c = f.children[d];
						if (c.id == g) {
							if (d == 0) {
								e = f.children[d + 1];
								break
							} else {
								e = f.children[d - 1];
								break
							}
						}
					}
					if (e == null) {
						e = f
					}
				}
				return e
			},
			getPreTopic: function(h, d) {
				var f = b.model.getTopic(h),
					g = null;
				for (var e = 0; e < f.children.length; e++) {
					var c = f.children[e];
					if (d == e) {
						g = f.children[e];
						break
					}
				}
				return g
			},
			getChildrenIndex: function(l) {
				var k = {};
				for (var e = 0; e < l.length; e++) {
					var d = l[e],
						h = d.id;
					if (h == this.topic.id) {
						continue
					}
					var f = this.getParent(h);
					if (f) {
						for (var c = 0; c < f.children.length; c++) {
							var g = f.children[c];
							if (g.id == h) {
								k[h] = c
							}
						}
					}
				}
				return k
			},
			getChildrenIds: function(c) {
				var e = [];

				function d(j) {
					var h = j.children;
					e.push(j.id);
					if (h != null && h.length > 0) {
						for (var g = 0; g < h.length; g++) {
							var f = h[g];
							d(f)
						}
					}
				}
				d(c);
				return e
			},
			resetTopicId: function(d, c) {
				if (c != null) {
					d.parent = c
				}
				d.id = b.utils.newId();
				var g = d.children;
				if (g != null && g.length > 0) {
					for (var f = 0; f < g.length; f++) {
						var e = g[f];
						this.resetTopicId(e, d.id)
					}
				}
			},
			addTopic: function(d, c) {
				this.addMulti([d], c)
			},
			addTopicGradient: function(d, c) {
				this.addMultiGradient([d], c)
			},
			addMulti: function(k, f) {
				var j = [];
				var e = b.model.getTopicString();
				for (var g = 0; g < k.length; g++) {
					var d = b.utils.copy(k[g]);
					if (e.indexOf(d.id) >= 0) {
						continue
					}
					this.topicList[d.id] = d;
					this.persistenceList[d.id] = b.utils.copy(d);
					j.push(d.id);
					var h = this.getParent(d.id);
					if (h) {
						if (f != null) {
							h.children.splice(f[d.id], 0, d)
						} else {
							h.children.push(d)
						}
					}
				}
				b.model.buildTopicList();
				for (var g = 0; g < k.length; g++) {
					var d = k[g];
					if (d.id != b.model.topic.id) {
						var c = b.model.getSubTopic(d.id);
						b.painter.renderSubTopic(c)
					} else {
						b.painter.renderSubTopic(d)
					}
				}
				b.painter.rangeTopic();
				if (b.messageSource.isCollaboration == false) {
					b.utils.select(j)
				}
				b.messageSource.send("create", {
					content: k,
					index: f
				});
				b.connection.delayResortConnection()
			},
			addMultiGradient: function(j, e) {
				var h = [];
				var d = b.model.getTopicString();
				for (var f = 0; f < j.length; f++) {
					var c = j[f];
					if (d.indexOf(c.id) >= 0) {
						continue
					}
					this.topicList[c.id] = c;
					this.persistenceList[c.id] = b.utils.copy(c);
					h.push(c.id);
					var g = this.getParent(c.id);
					if (g) {
						if (e != null) {
							g.children.splice(e[c.id], 0, c)
						} else {
							g.children.push(c)
						}
					}
				}
				b.model.buildTopicList();
				for (var f = 0; f < j.length; f++) {
					var c = j[f];
					if (d.indexOf(c.id) >= 0) {
						continue
					}
					b.painter.renderTopic(c)
				}
				if (b.messageSource.isCollaboration == false) {
					b.utils.select(h)
				}
				b.messageSource.send("create", {
					content: j,
					index: e
				});
				b.connection.delayResortConnection()
			},
			updateTopic: function(c) {
				this.updateMulti([c])
			},
			updateMulti: function(k) {
				var c = [],
					j = [];
				for (var f = 0; f < k.length; f++) {
					var e = b.utils.copy(k[f]);
					$.extend(this.topicList[e.id], e);
					var g = this.persistenceList[e.id];
					c.push(b.utils.copy(g));
					j.push(b.utils.copy(e));
					if (e.id != b.model.topic.id) {
						var d = b.model.getSubTopic(e.id);
						b.painter.renderSubTopic(d)
					} else {
						b.painter.renderSubTopic(e)
					}
				}
				b.model.buildTopicList();
				b.painter.rangeTopic();
				if (b.messageSource.isCollaboration == false) {
					b.utils.select(b.utils.selectedIds)
				}
				var h = {
					original: c,
					updates: j
				};
				b.messageSource.send("update", h);
				b.connection.delayResortConnection()
			},
			updateBg: function(e) {
				var c = b.model.topic.background == "" ? b.classic.getBackground() : b.model.topic.background;
				b.model.topic.background = e;
				b.canvas.css({
					background: e
				});
				var d = {
					oldBg: c,
					newBg: e
				};
				b.messageSource.send("updateBg", d)
			},
			updateClassic: function(f) {
				var d = b.model.topic;
				d.background = "";
				d.classic = f;
				b.painter.renderSubTopic(d);
				b.painter.rangeTopic();
				var e = b.model.topic.background == "" ? b.classic.getBackground() : b.model.topic.background;
				b.op.bindBackground(e);
				var g = {
					action: "changeClassic",
					content: {
						classic: f,
						bg: e
					}
				};
				var c = {
					action: "command",
					messages: [g]
				};
				CLB.send(c)
			},
			updatePos: function(v, y) {
				var w = [],
					m = [],
					c = {},
					f = {},
					q = [],
					x = [];
				if (v.length > 1) {
					for (var u = 0; u < v.length; u++) {
						var r = v[u];
						var l = b.utils.isParentsChecked(r.id);
						if (l) {
							continue
						}
						x.push(r)
					}
					v = [];
					v = x
				}
				for (var u = 0; u < v.length; u++) {
					var r = b.utils.copy(v[u]);
					var p = this.persistenceList[r.id];
					w.push(b.utils.copy(p));
					m.push(b.utils.copy(r));
					var e = this.getTopic(p.parent);
					if (r.parent && (p.parent != r.parent)) {
						for (var s = 0; s < e.children.length; s++) {
							var h = e.children[s];
							if (h.id == p.id) {
								f[p.id] = s;
								e.children.splice(s, 1);
								break
							}
						}
						var n = this.getTopic(r.parent);
						if (y != null) {
							var k = y[r.id];
							c[r.id] = k;
							n.children.splice(k, 0, r)
						} else {
							n.children.push(r);
							c[r.id] = n.children.length - 1
						}
						q.push(r.parent);
						q.push(e.id)
					} else {
						var z = b.model.getTopicIndex(p.id);
						e.children.splice(z, 1);
						e.children.push(r);
						c[r.id] = e.children.length;
						f[r.id] = z;
						q.push(r.parent)
					}
				}
				b.model.buildTopicList();
				q = b.utils.uniqueArray(q);
				for (var u = 0; u < q.length; u++) {
					var o = q[u];
					if (o != b.model.topic.id) {
						var g = b.model.getSubTopic(o);
						b.painter.renderSubTopic(g)
					} else {
						var d = b.model.getTopic(o);
						b.painter.renderSubTopic(d)
					}
				}
				b.painter.rangeTopic();
				if (b.messageSource.isCollaboration == false) {
					b.utils.select(b.utils.selectedIds)
				}
				var t = {
					original: w,
					updates: m,
					newIndex: c,
					oldIndex: f
				};
				b.messageSource.send("updatepos", t);
				b.connection.delayResortConnection()
			},
			updateSort: function(v, z) {
				var w = [],
					n = [],
					f = {},
					q = [],
					l = "",
					x = [];
				if (v.length > 1) {
					for (var u = 0; u < v.length; u++) {
						var r = v[u];
						var k = b.utils.isParentsChecked(r.id);
						if (k) {
							continue
						}
						x.push(r)
					}
					v = [];
					v = x
				}
				for (var u = 0; u < v.length; u++) {
					var r = v[u];
					var p = this.persistenceList[r.id];
					w.push(b.utils.copy(p));
					n.push(b.utils.copy(r));
					var e = this.getTopic(p.parent);
					for (var s = 0; s < e.children.length; s++) {
						var h = e.children[s];
						if (h.id == p.id) {
							f[p.id] = s;
							e.children.splice(s, 1);
							break
						}
					}
					q.push(e.id);
					if (l == "") {
						l = r.parent
					}
				}
				var m = this.getTopic(l);
				var y = this.persistenceList[l];
				q.push(l);
				var d = m.children;
				if (z > d.length - 1) {
					z = z - (y.children.length - d.length)
				}
				for (var u = v.length - 1; u >= 0; u--) {
					var r = v[u];
					d.splice(z, 0, r)
				}
				b.model.buildTopicList();
				q = b.utils.uniqueArray(q);
				for (var u = 0; u < q.length; u++) {
					var o = q[u];
					var c = b.model.getTopic(o);
					if (c.id != b.model.topic.id) {
						var g = b.model.getSubTopic(c.id);
						b.painter.renderSubTopic(g)
					} else {
						b.painter.renderSubTopic(c)
					}
				}
				b.painter.rangeTopic();
				if (b.messageSource.isCollaboration == false) {
					b.utils.select(b.utils.selectedIds)
				}
				var t = {
					original: w,
					updates: n,
					newIndex: z,
					oldIndex: f
				};
				b.messageSource.send("updatesort", t);
				b.connection.delayResortConnection()
			},
			remove: function(c) {
				this.removeMulti([c])
			},
			removeMulti: function(e) {
				if (e.length > 0) {
					var q = [],
						p = [],
						l = e[e.length - 1],
						n = this.getNextTopic(l.id);
					var s = this.getChildrenIndex(e);
					for (var m = 0; m < e.length; m++) {
						var o = e[m],
							f = o.id;
						if (f == this.topic.id) {
							continue
						}
						var h = $("#" + f);
						if (h.length > 0) {
							h.parent().remove()
						}
						$(".linker_canvas[fortp='" + f + "']").remove();
						var d = this.getSubTopic(f);
						if (q.indexOf(d.id) < 0) {
							q.push(d.id)
						}
						var r = this.getParent(f);
						if (r) {
							for (var k = 0; k < r.children.length; k++) {
								var g = r.children[k];
								if (g.id == f) {
									p.push(b.utils.copy(g));
									r.children.splice(k, 1);
									break
								}
							}
						}
					}
					this.buildTopicList();
					for (var m = 0; m < q.length; m++) {
						var c = q[m];
						var d = this.getTopic(c);
						if (d) {
							b.painter.renderSubTopic(d)
						}
					}
					b.painter.rangeTopic();
					if (b.messageSource.isCollaboration == false) {
						b.utils.select(n.id)
					}
					b.connection.deleteConnectionByTopics(p);
					b.messageSource.send("remove", {
						content: p,
						index: s
					});
					b.connection.delayResortConnection()
				}
			},
			copyTopic: function(j) {
				var e = [];
				if (j.length > 1) {
					for (var d = 0; d < j.length; d++) {
						var h = j[d];
						var g = b.utils.isParentsChecked(h);
						if (g) {
							continue
						}
						e.push(h)
					}
					j = [];
					j = e
				}
				b.canvas.find(".cut_related").removeClass("cut_related");
				this.clipboard.list = [];
				this.clipboard.type = "copy";
				for (var d = 0; d < j.length; d++) {
					var h = j[d];
					var c = b.model.getTopic(h);
					var f = b.utils.copy(c);
					this.resetTopicId(f);
					this.clipboard.list.push(f)
				}
			},
			cutTopic: function(k) {
				var f = [];
				if (k.length > 1) {
					for (var e = 0; e < k.length; e++) {
						var j = k[e];
						var h = b.utils.isParentsChecked(j);
						if (h) {
							continue
						}
						f.push(j)
					}
					k = [];
					k = f
				}
				b.canvas.find(".cut_related").removeClass("cut_related");
				this.clipboard.list = [];
				this.clipboard.type = "cut";
				for (var e = 0; e < k.length; e++) {
					var j = k[e];
					var d = b.model.getTopic(j);
					var g = b.utils.copy(d);
					this.clipboard.list.push(g);
					var c = b.model.getTopicDomByID(j);
					c.parent().find(".tp_box").addClass("cut_related");
					c.parent().find(".sub_linker_canvas").addClass("cut_related")
				}
			},
			pasteTopic: function(c) {
				var h = this.clipboard,
					g = b.utils.copy(this.clipboard);
				var j = h.list;
				var f = h.type;
				if (f == "cut") {
					this.removeMulti(j)
				}
				for (var e = 0; e < j.length; e++) {
					var d = j[e];
					d.parent = c.id
				}
				this.addMulti(j);
				for (var e = 0; e < g.list.length; e++) {
					var d = g.list[e];
					this.resetTopicId(d)
				}
				this.clipboard = g
			},
			brushStyles: null,
			copyTopicStype: function(d) {
				var c = b.model.getTopic(d);
				return b.utils.getTopicStyle(c)
			},
			pasteTopicStyle: function(e, d) {
				var c = b.model.getTopic(e);
				c.style = $.extend(c.style, d);
				b.model.updateMulti([c])
			},
			uniqueTopic: function() {
				var g = [];
				var k = [];
				var c = [];

				function h(l) {
					g.push(l.id);
					var n = l.children;
					if (n.length > 0) {
						for (var m = 0; m < n.length; m++) {
							var o = n[m];
							h(o)
						}
					}
				}

				function f(p, l) {
					if (l.id == p && l.children.length < 1) {
						delete l;
						return
					} else {
						var n = l.children;
						if (n.length > 0) {
							for (var m = 0; m < n.length; m++) {
								var o = n[m];
								f(p, o)
							}
						}
					}
				}
				h(b.model.topic);
				for (var e = 0; e < g.length; e++) {
					var j = g[e];
					if (k.indexOf(j) >= 0) {
						c.push(j)
					} else {
						k.push(j)
					}
				}
				for (var e = 0; e < c.length; e++) {
					var j = c[e];
					var d = b.model.topic;
					f(j, d)
				}
				b.model.buildTopicList()
			}
		};
	this.classic = {
		list: {
			defaultClassic: {
				background: "#ffffff",
				commonStyle: {
					family: "微软雅黑",
					fontSize: 25,
					bold: false,
					italic: false,
					textAlign: "left",
					fontColor: "rgb(68,68,68)",
					bgColor: "white",
					shape: "roundRectangle",
					lineType: "curve",
					boxshadow: "1px 2px 4px rgba(0, 0, 0, 0.2)",
					border: "1px solid #bbb"
				},
				centerTopic: {
					fontColor: "white",
					bgColor: "#5fd5a4",
					lineWidth: 1,
					lineColor: "#AAA"
				},
				childTopic: {
					fontSize: 14,
					bgColor: "white",
					lineType: "curve"
				},
				othersTopic: {
					fontColor: "rgb(98,98,98)",
					fontSize: 13,
					bgColor: "white",
					shape: "underline",
					lineType: "curve"
				}
			},
			shangwu: {
				background: "#ffffff",
				commonStyle: {
					family: "微软雅黑",
					fontSize: 27,
					bold: false,
					italic: false,
					textAlign: "left",
					fontColor: "rgb(68,68,68)",
					bgColor: "white",
					shape: "roundRectangle",
					lineType: "curve",
					boxshadow: "none",
					border: "none"
				},
				centerTopic: {
					fontColor: "white",
					bgColor: "rgb(102, 102, 255)",
					lineWidth: 1,
					lineColor: "rgb(0, 0, 204)"
				},
				childTopic: {
					fontSize: 14,
					bgColor: "transparent",
					lineType: "curve",
					fontColor: "rgb(102, 102, 255)",
					lineColor: "rgb(102, 102, 255)"
				},
				othersTopic: {
					fontColor: "rgb(102, 102, 255)",
					fontSize: 13,
					bgColor: "transparent",
					lineType: "curve"
				}
			},
			caihongpao: {
				background: "#ffffff",
				commonStyle: {
					family: "微软雅黑",
					fontSize: 27,
					bold: false,
					italic: false,
					textAlign: "left",
					fontColor: "rgb(68,68,68)",
					bgColor: "white",
					shape: "roundRectangle",
					lineType: "curve",
					boxshadow: "none",
					border: "none"
				},
				centerTopic: {
					fontColor: "white",
					bgColor: "#5fd5a4",
					lineWidth: 1,
					lineColor: "rgb(204, 204, 255)"
				},
				childTopic: {
					fontSize: 14,
					lineType: "curve",
					fontColor: "#888",
					lineColor: "#3399ff"
				},
				othersTopic: {
					fontColor: "#999",
					fontSize: 13,
					lineType: "curve",
					lineWidth: 1,
					lineColor: "rgb(204, 204, 255)"
				}
			},
			niupizhi: {
				background: "url(/themes/default/images/diagraming/mind/classic/niupizhi.png) repeat",
				commonStyle: {
					family: "微软雅黑",
					fontSize: 25,
					bold: false,
					italic: false,
					textAlign: "left",
					fontColor: "rgb(68,68,68)",
					bgColor: "white",
					shape: "roundRectangle",
					lineType: "curve",
					boxshadow: "none",
					border: "none"
				},
				centerTopic: {
					fontColor: "white",
					bgColor: "#cc9933",
					lineWidth: 1,
					lineColor: "#AAA"
				},
				childTopic: {
					fontSize: 14,
					fontColor: "#ffffff",
					bgColor: "#ddaa44",
					lineType: "curve",
					lineColor: "#cc9933"
				},
				othersTopic: {
					fontColor: "#bb8822",
					fontSize: 13,
					bgColor: "transparent",
					shape: "underline",
					lineType: "curve"
				}
			}
		},
		getClassic: function() {
			var c = b.model.topic.classic || "defaultClassic";
			var d = this.list[c];
			d.key = c;
			return d
		},
		getClassicByKey: function(c) {
			return this.list[c]
		},
		getBackground: function() {
			var c = b.model.topic.classic || "defaultClassic";
			return this.list[c].background
		},
		getRadomColor: function() {
			var d = ["rgb(255,204,204)", "rgb(255,230,204)", "rgb(255,255,204)", "rgb(230,255,204)", "rgb(204,255,230)", "rgb(204,229,255)", "rgb(204,204,255)", "rgb(229,204,255)", "rgb(255,204,255)", "rgb(255,204,230)"];
			var c = parseInt(Math.random() * 10);
			return d[c]
		}
	};
	this.contextMenu = {
		menuCon: null,
		topicId: null,
		init: function() {
			b.canvas.off("contextmenu.rightclick").on("contextmenu.rightclick",
				function(d) {
					var c = d.pageX;
					var f = d.pageY;
					b.contextMenu.show(c, f, $(d.target));
					d.preventDefault()
				})
		},
		initEvent: function() {
			b.contextMenu.menuCon.find("li").off("click").on("click",
				function(h) {
					var c = $(this);
					if (c.hasClass("disabled")) {
						return
					}
					var f = b.model.getTopicDomByID(b.contextMenu.topicId);
					if (c.attr("ac") == "edit") {
						b.op.editText(f)
					} else {
						if (c.attr("ac") == "insert") {
							b.painter.appendTopic(b.contextMenu.topicId)
						} else {
							if (c.attr("ac") == "delete") {
								b.op.removeTopic()
							} else {
								if (c.attr("ac") == "copy") {
									var g = b.utils.getSelected();
									if (g.length > 0) {
										b.model.copyTopic(g)
									}
								} else {
									if (c.attr("ac") == "cut") {
										var g = b.utils.getSelected();
										if (g.length > 0) {
											b.model.cutTopic(g)
										}
									} else {
										if (c.attr("ac") == "paste") {
											var g = b.utils.getSelected();
											if (g.length > 0) {
												var d = b.model.getTopic(g[g.length - 1]);
												b.model.pasteTopic(d)
											}
										} else {
											if (c.attr("ac") == "focus") {
												b.events.push("focusTopic")
											} else {
												if (c.attr("ac") == "kuaijiejian") {
													b.events.push("showHotkey")
												} else {
													if (c.attr("ac") == "connection") {
														b.connection.startDrawLine(f, h)
													} else {
														if (c.attr("ac") == "linecolor") {
															b.events.push("showLineColor")
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
					b.contextMenu.close()
				})
		},
		show: function(c, j, h) {
			b.contextMenu.menuCon = $("#contextmenu");
			if (h.attr("id") == b.canvas.attr("id")) {
				b.contextMenu.menuCon = $("#contextmenu_canvas")
			} else {
				if (h.hasClass("topic_text") || h.hasClass("topic")) {
					var i = h.parent().parent().attr("id");
					if (i == null) {
						i = h.parent().attr("id")
					}
					b.contextMenu.topicId = i;
					var d = b.model.getTopic(i);
					if (d.id == b.model.topic.id) {
						b.contextMenu.menuCon.find("li[root_dis_item]").addClass("disabled")
					} else {
						b.contextMenu.menuCon.find("li.disabled").removeClass("disabled")
					}
					if (b.model.clipboard.list.length > 0) {
						b.contextMenu.menuCon.find("li[ac=paste]").removeClass("disabled")
					} else {
						b.contextMenu.menuCon.find("li[ac=paste]").addClass("disabled")
					}
					if (b.config.scale != 1) {
						b.contextMenu.menuCon.find("li[ac=connection]").addClass("disabled")
					}
				} else {
					if (h.hasClass("connection_canvas")) {
						if (b.connection.isInLine) {
							b.contextMenu.menuCon = $("#contextmenu_conn")
						} else {
							b.contextMenu.menuCon = $("#contextmenu_canvas")
						}
					} else {
						b.contextMenu.menuCon = $("#contextmenu_canvas")
					}
				}
			}
			var g = b.contextMenu.menuCon;
			var f = c;
			var e = j;
			if (j + g.outerHeight() >= $(window).height()) {
				e = j - g.outerHeight()
			}
			if (c + g.outerWidth() > $(window).width()) {
				f = c - g.outerWidth()
			}
			g.css({
				left: f,
				top: e
			}).show();
			b.contextMenu.initEvent()
		},
		close: function() {
			if (b.contextMenu.menuCon != null) {
				b.contextMenu.menuCon.hide()
			}
			b.contextMenu.menuCon = null;
			b.contextMenu.topicId = null
		}
	};
	this.connection = {
		currCon: null,
		selectIds: [],
		tempData: null,
		isInLine: false,
		data: {},
		config: {
			lineColor: "rgb(113, 203, 45)",
			lineWidth: "1",
			lineType: "solid",
			color: "#ffffff"
		},
		getStartOrEndPoint: function(g, h) {
			var j = {};
			var d = h.offset().left;
			var c = h.offset().top;
			var e = b.utils.getRelativePos(d, c, b.canvas);
			var f = {
				x: e.x,
				y: e.y + h.height()
			};
			if (g.x < f.x) {
				j = {
					x: f.x - 2,
					y: f.y - h.height() / 2 + 4,
					p: "left"
				}
			} else {
				if (g.x >= f.x && g.x <= f.x + h.width()) {
					var i = g.y > f.y;
					j = {
						x: f.x + h.width() / 2,
						y: (i) ? f.y + 8 : (f.y - h.height() - 2),
						p: i ? "bottom" : "top"
					}
				} else {
					if (g.x > f.x) {
						j = {
							x: f.x + h.width() + 8,
							y: f.y - h.height() / 2 + 4,
							p: "right"
						}
					}
				}
			}
			return j
		},
		getPointByDirection: function(e, c, f) {
			var d = {};
			if (e == "left") {
				d.x = c.x - f.width() / 2 - 4;
				d.y = c.y + 4
			} else {
				if (e == "right") {
					d.x = c.x + f.width() / 2 + 8;
					d.y = c.y + 4
				}
			}
			if (e == "top") {
				d.x = c.x;
				d.y = c.y - f.height() / 2 - 2
			}
			if (e == "bottom") {
				d.x = c.x;
				d.y = c.y + f.height() / 2 + 8
			}
			d.p = e;
			return d
		},
		getConnectionDomByID: function(c) {
			return b.canvas.find(".connection_box#" + c)
		},
		selectConnection: function(d) {
			if (b.connection.selectIds.length < 1) {
				b.connection.selectIds.push(d);
				b.connection.currCon = b.connection.getConnectionDomByID(d);
				b.connection.showConnectionControl(d);
				b.connection.renderTextarea(d);
				var c = this.getConnectionDomByID(d);
				c.css({
					zIndex: 1
				})
			}
		},
		unSelectConnection: function() {
			b.connection.hideConnectionControl();
			b.connection.selectIds = [];
			b.connection.currCon = null;
			var c = b.canvas.find(".connection_textarea");
			c.each(function() {
				if ($.trim($(this).val()) == "" || $.trim($(this).val()) == "Label") {
					$(this).remove()
				}
			});
			b.canvas.find(".connection_box").css("z-index", 0)
		},
		getConnectionPoints: function(c) {
			var e = [];
			var f = 0.05;
			var d = 0;
			while (d <= 1) {
				var g = {
					x: (1 - d) * (1 - d) * (1 - d) * c.start.x + 3 * (1 - d) * (1 - d) * d * c.points[0].x + 3 * (1 - d) * d * d * c.points[1].x + d * d * d * c.end.x,
					y: (1 - d) * (1 - d) * (1 - d) * c.start.y + 3 * (1 - d) * (1 - d) * d * c.points[0].y + 3 * (1 - d) * d * d * c.points[1].y + d * d * d * c.end.y
				};
				e.push(g);
				d += f
			}
			e.push(c.end);
			return e
		},
		getConnectionMidPoint: function(c) {
			return {
				x: 0.125 * c.start.x + 0.375 * c.points[0].x + 0.375 * c.points[1].x + 0.125 * c.end.x,
				y: 0.125 * c.start.y + 0.375 * c.points[0].y + 0.375 * c.points[1].y + 0.125 * c.end.y
			}
		},
		getControlPoints: function(j, d) {
			var h = [];
			var g = {};
			var f = {};
			var e = {
				h: Math.abs(d.y - j.y),
				w: Math.abs(d.x - j.x)
			};
			var c;
			var i;
			if (j.x < d.x) {
				c = j.x
			} else {
				c = d.x
			}
			if (j.y < d.y) {
				i = j.y
			} else {
				i = d.y
			}
			if (j.x <= d.x && j.y <= d.y) {
				g.x = e.w / 3;
				g.y = e.h / 3;
				f.x = e.w / 3 * 2;
				f.y = e.h / 3 * 2
			} else {
				if (j.x <= d.x && j.y >= d.y) {
					g.x = e.w / 3;
					g.y = e.h / 3 * 2;
					f.x = e.w / 3 * 2;
					f.y = e.h / 3
				} else {
					if (j.x >= d.x && j.y >= d.y) {
						g.x = e.w / 3 * 2;
						g.y = e.h / 3 * 2;
						f.x = e.w / 3;
						f.y = e.h / 3
					} else {
						if (j.x >= d.x && j.y <= d.y) {
							g.x = e.w / 3 * 2;
							g.y = e.h / 3;
							f.x = e.w / 3;
							f.y = e.h / 3 * 2
						}
					}
				}
			}
			g.x += c;
			g.y += i;
			f.x += c;
			f.y += i;
			h.push(g);
			h.push(f);
			return h
		},
		pointInConnection: function(j, d, h) {
			var l = this.getConnectionPoints(d);
			var f = {
				x: j.x - h,
				y: j.y
			};
			var e = {
				x: j.x + h,
				y: j.y
			};
			var c = {
				x: j.x,
				y: j.y - h
			};
			var n = {
				x: j.x,
				y: j.y + h
			};
			for (var g = 1; g < l.length; g++) {
				var m = l[g - 1];
				var k = l[g];
				var i = this.checkCross(f, e, m, k);
				if (i) {
					return g
				}
				i = this.checkCross(c, n, m, k);
				if (i) {
					return g
				}
			}
			return -1
		},
		getConnectionByPoint: function(c, f) {
			var d = [];
			var e;
			$.each(b.connection.data,
				function(j, g) {
					var h = b.canvas.find("#" + j);
					e = b.connection.pointInConnection({
							x: c,
							y: f
						},
						g, 7);
					if (e > 0) {
						d.push(h);
						return false
					}
				});
			return {
				inline: e,
				lines: d
			}
		},
		checkCross: function(k, i, h, g) {
			var c = false;
			var j = (i.x - k.x) * (g.y - h.y) - (i.y - k.y) * (g.x - h.x);
			if (j != 0) {
				var f = ((k.y - h.y) * (g.x - h.x) - (k.x - h.x) * (g.y - h.y)) / j;
				var e = ((k.y - h.y) * (i.x - k.x) - (k.x - h.x) * (i.y - k.y)) / j;
				if ((f >= 0) && (f <= 1) && (e >= 0) && (e <= 1)) {
					c = true
				}
			}
			return c
		},
		showConnectionControl: function(h) {
			var g = b.connection.data[h];
			var e = g.points;
			this.hideConnectionControl();

			function f(l, o) {
				var k;
				if (o == "from") {
					k = g.start
				} else {
					k = g.end
				}
				var r = $("<div tp='" + o + "' class='connection_line'></div>").appendTo(b.canvas);
				var q = $("<div tp='" + o + "' class='connection_point'></div>").appendTo(b.canvas);
				if (g.styles.lineColor != null) {
					r.css("background", g.styles.lineColor);
					q.css("border", "1px solid " + g.styles.lineColor)
				} else {}
				var i = l.x;
				var n = l.y;
				var p = {
					x: (i + k.x) / 2,
					y: (n + k.y) / 2
				};
				var m = b.utils.calcDistance({
						x: i - 3.5,
						y: n - 3.5
					},
					k);
				var j = b.utils.getAngle({
						x: i,
						y: n
					},
					k);
				q.css({
					left: i - 7,
					top: n - 7
				});
				r.css({
					left: p.x,
					top: p.y - m / 2,
					height: m,
					"-webkit-transform": "rotate(" + (90 + j) + "deg)",
					transform: "rotate(" + (90 + j) + "deg)"
				});
				b.canvas.find(".connection_point").off("mousedown.point").on("mousedown.point",
					function(v) {
						var z = v.pageX;
						var w = v.pageY;
						g = b.connection.data[h];
						var s = $(this);
						var t = null;
						var u = null;
						if (s.attr("tp") == "from") {
							u = g.points[0];
							t = b.model.getTopicDomByID(g.from)
						} else {
							u = g.points[1];
							t = b.model.getTopicDomByID(g.to)
						}
						var C = t.offset().left;
						var B = t.offset().top;
						var A = b.utils.getRelativePos(C, B, b.canvas);
						b.connection.tempData = b.utils.copy(g);
						v.stopPropagation();
						b.canvas.on("mousemove.pointdrag",
							function(x) {
								g = b.connection.data[h];
								var D = x.pageX;
								var y = x.pageY;
								var F = b.utils.getRelativePos(D, y, b.canvas);
								u.x = F.x;
								u.y = F.y;
								if (s.attr("tp") == "from") {
									g.points[0] = u;
									g.angle = j;
									g.start = b.connection.getStartOrEndPoint(F, t)
								} else {
									g.points[1] = u;
									var E = b.utils.getAngle({
											x: F.x,
											y: F.y
										},
										k);
									g.angle = E;
									g.end = b.connection.getStartOrEndPoint(F, t)
								}
								g.load = false;
								b.connection.data[g.id] = g;
								b.connection.drawLine(false, g.id);
								b.connection.showConnectionControl(g.id);
								b.connection.renderTextarea(g.id)
							});
						b.canvas.off("mouseup.pointdrag").on("mouseup.pointdrag",
							function(x) {
								b.canvas.off("mousemove.pointdrag");
								b.canvas.off("mouseup.pointdrag");
								b.connection.updateConnection()
							})
					})
			}
			var d = e[0];
			var c = e[1];
			f(d, "from");
			f(c, "to")
		},
		hideConnectionControl: function() {
			b.canvas.find(".connection_line").remove();
			b.canvas.find(".connection_point").remove()
		},
		drawLine: function(G, H) {
			var r = {};
			var E = b.connection.data[H];
			var m = E.start;
			var l = E.end;
			var h = E.styles || {};
			var w = E.points;
			var j = {};
			var g = {};
			if (G == true) {
				w = b.connection.getControlPoints(m, l)
			} else {
				w = E.points
			}
			if (E.load) {
				w = E.points;
				r = E.canvasPos
			} else {
				var D;
				var B;
				var F;
				var C;
				if (m.x < l.x) {
					D = l.x;
					F = m.x
				} else {
					D = m.x;
					F = l.x
				}
				if (m.y < l.y) {
					B = l.y;
					C = m.y
				} else {
					B = m.y;
					C = l.y
				}
				if (G != true) {
					for (var z = 0; z < w.length; z++) {
						var u = w[z];
						if (u.x <= F) {
							F = u.x
						} else {
							if (u.x > D) {
								D = u.x
							}
						}
						if (u.y < C) {
							C = u.y
						} else {
							if (u.y > B) {
								B = u.y
							}
						}
					}
				}
				r.x = F;
				r.y = C;
				r.w = Math.abs(D - F);
				r.h = Math.abs(B - C)
			}
			j = w[0];
			g = w[1];
			b.connection.currCon.css({
				left: r.x - 10,
				top: r.y - 10,
				width: r.w + 20,
				height: r.h + 20
			});
			var k = b.connection.currCon.find(".connection_canvas");
			k.attr({
				width: r.w + 20,
				height: r.h + 20
			});
			var t = k[0].getContext("2d");
			t.translate(10, 10);
			var c = h.lineWidth == null ? b.connection.config.lineWidth : h.lineWidth;
			var e = h.lineColor == null ? b.connection.config.lineColor : h.lineColor;
			var o = {
				lineWidth: c,
				lineColor: e,
				color: b.connection.config.color,
				lineType: h.lineType
			};
			t.lineWidth = o.lineWidth;
			t.strokeStyle = o.lineColor;
			t.fillStyle = o.lineColor;
			t.lineCap = "square";
			t.beginPath();
			var f = {};
			var q = m.x - r.x;
			var p = m.y - r.y;
			t.arc(q, p, 2, 0, Math.PI * 2);
			t.fill();
			t.moveTo(q, p);
			f.x = l.x - r.x;
			f.y = l.y - r.y;
			if (h.lineType == "dashed") {
				var n = b.connection.getConnectionPoints(E);
				var v = "line";
				n.splice(n.length - 1, 1);
				for (var z = 0; z < n.length; z++) {
					var s = n[z];
					s.x = s.x - r.x;
					s.y = s.y - r.y;
					if (v == "line") {
						t.moveTo(s.x, s.y);
						v = "move"
					} else {
						t.lineTo(s.x, s.y);
						v = "line"
					}
				}
			} else {
				t.bezierCurveTo(b.restoreScale(j.x - r.x), b.restoreScale(j.y - r.y), b.restoreScale(g.x - r.x), b.restoreScale(g.y - r.y), b.restoreScale(f.x), b.restoreScale(f.y))
			}
			t.stroke();
			var A = b.utils.getAngle({
					x: g.x,
					y: g.y
				},
				l);
			var d = [];
			d[0] = f.x - parseInt(8 * Math.cos(Math.PI / 180 * (A - 27)));
			d[1] = f.y - parseInt(8 * Math.sin(Math.PI / 180 * (A - 27)));
			d[2] = f.x - parseInt(8 * Math.cos(Math.PI / 180 * (A + 27)));
			d[3] = f.y - parseInt(8 * Math.sin(Math.PI / 180 * (A + 27)));
			t.beginPath();
			t.moveTo(d[0], d[1]);
			t.lineTo(f.x, f.y);
			t.lineTo(d[2], d[3]);
			t.lineTo(r.w - parseInt(25 * Math.cos(d[4] * Math.PI / 180)), r.h - parseInt(25 * Math.sin(d[4] * Math.PI / 180)));
			t.lineTo(d[0], d[1]);
			t.closePath();
			t.fill();
			t.stroke();
			E.points = [];
			E.points.push({
				x: j.x,
				y: j.y
			});
			E.points.push({
				x: g.x,
				y: g.y
			});
			E.angle = A;
			E.canvasPos = r;
			E.styles = o
		},
		setLineStyle: function(f, h) {
			var e = b.connection.selectIds;
			if (e.length > 0) {
				var i = e[0];
				var c = b.connection.data[i];
				var d = b.utils.copy(c);
				var g = c.styles;
				if (f == "linecolor") {
					g.lineColor = h
				} else {
					if (f == "linewidth") {
						g.lineWidth = h
					} else {
						if (f == "linetype") {
							g.lineType = h
						}
					}
				}
				c.load = true;
				b.connection.renderTextarea(i);
				b.connection.drawLine(false, i);
				b.connection.showConnectionControl(i);
				b.connection.tempData = d;
				b.connection.updateConnectionByLine(c)
			}
		},
		saveConnection: function(c) {
			b.connection.saveConnectionMulti([c])
		},
		saveConnectionMulti: function(d) {
			var f = b.connection.data;
			for (var e = 0; e < d.length; e++) {
				var c = d[e];
				delete c.con;
				f[c.id] = b.utils.copy(c)
			}
			b.messageSource.send("create_line", {
				content: d
			})
		},
		updateConnection: function() {
			var c = {},
				g = {};
			var e = b.connection.selectIds;
			if (e.length > 0) {
				var h = e[0];
				var d = b.utils.copy(b.connection.data[h]);
				delete d.con;
				if (b.connection.tempData != null) {
					delete b.connection.tempData.con;
					c = b.connection.tempData
				}
				g = d;
				var f = {
					original: c,
					updates: g
				};
				b.messageSource.send("update_line", f)
			}
		},
		updateConnectionByLine: function(d) {
			delete d.con;
			delete b.connection.tempData.con;
			var c = b.connection.tempData,
				f = b.utils.copy(d);
			var e = {
				original: c,
				updates: f
			};
			b.messageSource.send("update_line", e)
		},
		createConnection: function(i, k, n, c, l) {
			var f = true;
			if (l != null) {
				f = l
			}
			var h = {};
			if (n == null) {
				var e = i.start;
				var m = b.utils.copy(e);
				var j;
				var g = i.end;
				m = b.connection.getStartOrEndPoint(g, k);
				h.id = b.utils.newId();
				h.from = k.attr("id");
				h.start = m;
				h.end = g;
				h.load = false;
				b.connection.data[h.id] = h
			} else {
				h = n;
				h.load = true;
				if (c != null) {
					h.load = c
				}
			}
			var d = $("<div id='" + h.id + "' class='connection_box'><canvas class='connection_canvas'></canvas></div>").appendTo(b.canvas);
			this.currCon = d;
			b.connection.drawLine(f, h.id);
			if (n != null && h.label != null) {
				b.connection.renderTextarea(n.id)
			}
			$(document).off("mousemove.connection").on("mousemove.connection",
				function(q) {
					var o = q.pageX;
					var r = q.pageY;
					if (k == null) {
						return
					}
					var p = b.utils.getRelativePos(o, r, b.canvas);
					j = b.utils.copy(e);
					j = b.connection.getStartOrEndPoint(p, k);
					h.start = j;
					h.end = p;
					b.connection.drawLine(true, h.id);
					b.canvas.css({
						cursor: "move"
					})
				});
			b.canvas.find(".connection_canvas").off("mousedown.connection").on("mousedown.connection",
				function(s) {
					var o = s.pageX;
					var t = s.pageY;
					if (k == null) {
						return
					}
					var q = b.utils.getTopicByPoint(o, t);
					if (q == null || (q.attr("id") == k.attr("id"))) {
						$(document).off("mousemove.connection");
						b.canvas.find(".connection_canvas").off("mousedown.connection");
						b.canvas.find(".connection_box[id=" + h.id + "]").remove();
						delete b.connection.data[h.id]
					} else {
						var p = b.utils.getRelativePos(q.offset().left + q.width() / 2, q.offset().top + q.height() / 2, b.canvas);
						var r = b.connection.getStartOrEndPoint(j, q);
						h.start = j;
						h.end = r;
						b.connection.drawLine(true, h.id);
						$(document).off("mousemove.connection");
						b.canvas.find(".connection_canvas").off("mousedown.connection");
						b.canvas.css({
							cursor: "default"
						});
						b.canvas.find(".connection_box").css({
							zIndex: 0
						});
						h.to = q.attr("id");
						h.start = j;
						h.end = r;
						b.connection.data[h.id] = h;
						b.connection.selectIds = [h.id];
						b.connection.showConnectionControl(h.id);
						b.connection.renderTextarea(h.id);
						b.connection.saveConnection(h)
					}
					s.stopPropagation()
				})
		},
		deleteConnection: function(c) {
			b.connection.deleteConnectionMulti([c])
		},
		deleteConnectionMulti: function(d) {
			if (d.length > 0) {
				for (var e = 0; e < d.length; e++) {
					var c = d[e];
					b.connection.hideConnectionControl();
					b.canvas.find(".connection_box[id=" + c.id + "]").remove();
					delete b.connection.data[c.id];
					delete c.con;
					b.connection.selectIds = []
				}
				b.messageSource.send("delete_line", {
					content: d
				})
			}
		},
		deleteConnectionByTopics: function(h) {
			if (h.length > 0) {
				var c = [];
				for (var f = 0; f < h.length; f++) {
					var e = h[f];
					var g = b.model.getChildrenIds(e);
					var d = g.join(",");
					$.each(b.connection.data,
						function(k, j) {
							if (d.indexOf(j.from) >= 0 || d.indexOf(j.to) >= 0) {
								c.push(j)
							}
						})
				}
				b.connection.deleteConnectionMulti(c)
			}
		},
		renderTextarea: function(h) {
			var g = b.connection.data[h];
			var c = b.connection.getConnectionDomByID(h);
			if (c.length == 0) {
				return
			}
			var d = c.find(".connection_textarea");
			if (d.length == 0) {
				d = $("<textarea  class='connection_textarea'>Label</textarea>").appendTo(c);
				if (b.config.readonly != true) {
					d.off("keyup").on("keyup",
						function(i) {
							var j = $(this).val();
							e(j, i);
							f();
							i.stopPropagation()
						})
				}
				b.connection.tempData = b.utils.copy(g);
				if (g.label != null) {
					d.val(g.label);
					d.trigger("keyup")
				}
			} else {}

			function e(l, i) {
				if (l == "") {
					return
				}
				l = l == null ? "" : l;
				var k = l.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br/>");
				var m = $("<div style='display:inline-block;font-size:12px;line-height:18px;' id='temp1_textarea_div'></div>").appendTo(b.canvas);
				var j = $("<div style='min-width:50px;word-break:break-all;text-align:left;font-size:12px;line-height:18px;' id='temp2_textarea_div'></div>").appendTo(b.canvas);
				if (i != null && i.keyCode == 13) {
					k += "<br>"
				}
				m.html(k);
				j.html(k);
				d.css({
					width: m.width() + 15,
					height: j.height()
				});
				m.remove();
				j.remove()
			}
			b.canvas.find(".connection_textarea").on("keydown",
				function(i) {
					i.stopPropagation()
				});
			if (b.config.readonly != true) {
				d.off("blur.conn").on("blur.conn",
					function(i) {
						var j = $(this).val();
						if ($.trim(j) != "") {
							g.label = j;
							b.connection.updateConnectionByLine(g)
						}
						i.stopPropagation()
					})
			}
			d.off("mousedown").on("mousedown",
				function(i) {
					i.stopPropagation()
				});

			function f() {
				g = b.connection.data[h];
				var i = b.connection.getConnectionMidPoint(g);
				i.x -= g.canvasPos.x;
				i.y -= g.canvasPos.y;
				d.css({
					left: i.x - d.width() / 2 + 8,
					top: i.y,
					color: g.styles.color
				})
			}
			d.css("background", g.styles.lineColor);
			e(g.label);
			f()
		},
		initConnectionClick: function(c) {
			b.canvas.off("mousedown.connection").on("mousedown.connection",
				function(d) {
					b.connection.selectConnection(c);
					b.utils.unselect();
					d.stopPropagation()
				})
		},
		loadConnections: function() {
			var c = b.model.topic.lines;
			if (c == null) {
				c = {}
			}
			b.connection.data = c;
			b.connection.selectIds = [];
			b.connection.reSortConnection()
		},
		startDrawLine: function(d, h) {
			var g = d.position().left + d.width() / 2;
			var f = d.position().top + d.height() / 2;
			var j = b.utils.getRelativePos(g, f, b.canvas);
			var c = b.utils.getRelativePos(h.pageX, h.pageY, b.canvas);
			var i = {
				id: b.contextMenu.topicId,
				start: j,
				end: c
			};
			b.connection.createConnection(i, d)
		},
		reSortConnection: function() {
			var c = b.connection.data;
			if (c.length == 0) {
				return
			}
			$.each(c,
				function(p, t) {
					var n = t.from;
					var f = t.to;
					var q = b.canvas.find(".tp_box[id=" + n + "]"),
						m = b.canvas.find(".tp_box[id=" + f + "]");
					if (q.length && m.length) {
						var s = q.offset().left;
						var k = q.offset().top;
						var r = b.utils.getRelativePos(s + q.width() / 2, k + q.height() / 2, b.canvas);
						var d = m.offset().left;
						var h = m.offset().top;
						var g = b.utils.getRelativePos(d + m.width() / 2, h + m.height() / 2, b.canvas);
						var e = b.utils.copy(t.start);
						var l = b.utils.copy(t.end);
						t.start = b.connection.getPointByDirection(t.start.p, r, q);
						t.end = b.connection.getPointByDirection(t.end.p, g, m);
						if (t.points != null) {
							var o = b.connection.getStartOrEndPoint(g, q);
							var j = b.connection.getStartOrEndPoint(r, m);
							t.points[0].x = t.points[0].x + (t.start.x - e.x);
							t.points[0].y = t.points[0].y + (t.start.y - e.y);
							t.points[1].x = t.points[1].x + (t.end.x - l.x);
							t.points[1].y = t.points[1].y + (t.end.y - l.y)
						}
						b.canvas.find(".connection_box[id=" + t.id + "]").remove();
						b.connection.createConnection(null, null, t, false, false);
						b.events.push("reSortConnection", t)
					}
				});
			b.canvas.find(".connection_box").css({
				zIndex: 0
			})
		},
		resorting: false,
		delayResortConnection: function(c) {
			if (b.connection.resorting == false) {
				c = c == null ? 2000 : c;
				b.connection.resorting = true;
				window.setTimeout(function() {
						b.connection.reSortConnection();
						b.connection.resorting = false
					},
					c)
			}
		},
		showConnection: function(d, e) {
			var c = b.connection.data;
			if (c.length == 0) {
				return
			}
			$.each(c,
				function(j, g) {
					var h = g.from;
					var f = g.to;
					if ($.inArray(h, e) >= 0 || $.inArray(f, e) >= 0) {
						if (d) {
							b.canvas.find(".connection_box[id=" + g.id + "]").show()
						} else {
							b.canvas.find(".connection_box[id=" + g.id + "]").hide()
						}
					}
				})
		}
	};
	this.structure = {
		switchStructure: function(e) {
			var c = b.model.topic;
			var g = c.structure;
			if (c.structure == e) {
				return
			}
			c.structure = e;
			var h = b.utils.copy(c);
			var f = {
				structure: e,
				old: g
			};
			b.messageSource.send("update_structure", f);
			this.clear();
			b.open(h)
		},
		clear: function() {
			b.model.topic = {};
			b.model.persistenceList = {};
			b.model.topicList = {};
			b.model.clipboard = {
				type: "copy",
				list: []
			};
			b.canvas.find(".linker_canvas").remove();
			b.canvas.find(".tp_container").remove()
		}
	};
	this.utils = {
		newId: function(e, d) {
			function c() {
				return (((1 + Math.random()) * 65536) | 0).toString(16).substring(1)
			}
			return (c() + c() + "" + c() + "" + c() + "" + c())
		},
		selectedIds: [],
		select: function(g) {
			if (typeof g == "string") {
				var f = g;
				g = [];
				g.push(f)
			}
			if (g.length <= 0) {
				return
			}
			this.selectedIds = [];
			$(".tp_selected").find("textarea").remove();
			$(".tp_selected").removeClass("tp_selected");
			for (var e = 0; e < g.length; e++) {
				var f = g[e];
				var d = b.model.getTopic(f);
				if (d == null) {
					continue
				}
				$("#" + f).addClass("tp_selected");
				this.selectedIds.push(f);
				var c = $("<textarea id='textarea_" + f + "'></textarea>").appendTo($("#" + f));
				c.css({
					opacity: 0,
					filter: "alpha(opacity=0)",
					"z-index": -10,
					bottom: -15
				});
				c.val(d.title);
				c.select()
			}
			b.events.push("selectChanged")
		},
		unselect: function() {
			$(".tp_selected").find("textarea").remove();
			$(".tp_selected").removeClass("tp_selected");
			this.selectedIds = [];
			b.events.push("selectChanged")
		},
		getSelected: function() {
			return this.selectedIds
		},
		getSelectedDom: function() {
			var c = [];
			b.canvas.find("div.tp_selected[id]").each(function() {
				var d = $(this);
				c.push(d.attr("id"))
			});
			return c
		},
		isSelected: function(c) {
			if (this.selectedIds.indexOf(c) >= 0) {
				return true
			}
			return false
		},
		isParentsChecked: function(d) {
			var c = b.model.getTopic(d);
			while (c.parent != b.model.topic.id) {
				c = b.model.getTopic(c.parent);
				if (b.utils.selectedIds.indexOf(c.id) >= 0) {
					return true
				}
			}
			return false
		},
		selectAll: function() {
			var c = [];
			for (var d in b.model.topicList) {
				c.push(d)
			}
			this.select(c)
		},
		getTopicContainer: function(c) {
			return $("#" + c).parent()
		},
		pointInRect: function(d, c, e) {
			if (d >= e.x && d <= e.x + e.w && c >= e.y && c <= e.y + e.h) {
				return true
			}
			return false
		},
		pointBeforeOrAfter: function(d, c, e) {
			if (c >= (e.y + e.h + 3) && c <= (e.y + e.h + 10) && d >= e.x && d <= e.x + e.w) {
				return "after"
			} else {
				if (c >= (e.y - 10) && c <= (e.y - 3) && d >= e.x && d <= e.x + e.w) {
					return "before"
				}
			}
			return false
		},
		pointBeforeOrAfter1: function(d, c, e) {
			if (c >= (e.y + e.h) && c <= (e.y + e.h + b.config.topicMargin / 2 + 10) && d >= e.x && d <= e.x + e.w) {
				return "after"
			} else {
				if (c >= (e.y - 10 - b.config.topicMargin / 2) && c <= (e.y - 3) && d >= e.x && d <= e.x + e.w) {
					return "before"
				}
			}
			return false
		},
		copy: function(c) {
			return $.extend(true, {},
				c)
		},
		getTopicStyle: function(c) {
			var e = b.classic.getClassic();
			var d = b.utils.copy(e.commonStyle);
			if (c.id == b.model.topic.id) {
				$.extend(d, b.utils.copy(e.centerTopic))
			} else {
				if (c.parent == b.model.topic.id) {
					$.extend(d, b.utils.copy(e.childTopic));
					if (e.key == "caihongpao") {
						d.bgColor = b.classic.getRadomColor()
					}
				} else {
					$.extend(d, b.utils.copy(e.othersTopic));
					if (e.key == "caihongpao") {
						d.bgColor = b.classic.getRadomColor()
					}
				}
			}
			$.extend(d, b.utils.copy(c.style));
			return d
		},
		getExtendStyle: function(c) {
			var f = [];
			var c = b.model.getTopic(c.id);
			while (c.id != b.model.topic.id) {
				var e = this.getTopicStyle(c);
				f.push(e);
				c = b.model.getTopic(c.parent)
			}
			var e = this.getTopicStyle(b.model.topic);
			var d = f.length - 1;
			while (d >= 0) {
				var g = f[d];
				$.extend(e, g);
				d--
			}
			return e
		},
		getSublings: function(k) {
			var f = b.utils.getSelected();
			var h = b.model.getTopic(f[0]);
			if (f.length == 0) {
				return null
			}
			var l = b.model.topic;
			if (b.model.topic.structure == "mind") {
				if (k == "left") {
					if (h.id == l.id) {
						for (var g = 0; g < l.children.length; g++) {
							var c = l.children[g];
							if (b.painter.ranged[c.id] == "left") {
								return c
							}
						}
					} else {
						var e = b.model.getSubTopic(h.id);
						var d = b.painter.ranged[e.id];
						if (d == "right") {
							return b.model.getParent(h.id)
						} else {
							if (h.children.length > 0) {
								return h.children[0]
							}
						}
					}
				} else {
					if (k == "right") {
						if (h.id == l.id) {
							for (var g = 0; g < l.children.length; g++) {
								var c = l.children[g];
								if (b.painter.ranged[c.id] == "right") {
									return c
								}
							}
						} else {
							var e = b.model.getSubTopic(h.id);
							var d = b.painter.ranged[e.id];
							if (d == "left") {
								return b.model.getParent(h.id)
							} else {
								if (h.children.length > 0) {
									return h.children[0]
								}
							}
						}
					} else {
						if (k == "up") {
							if (h.id == l.id) {
								return null
							} else {
								if (h.parent != l.id) {
									var m = b.model.getTopic(h.parent);
									var j = -1;
									for (var g = 0; g < m.children.length; g++) {
										var c = m.children[g];
										if (c.id == h.id) {
											j = g - 1;
											break
										}
									}
									if (j >= 0) {
										return m.children[j]
									}
								}
								var e = b.model.getSubTopic(h.id);
								var j = -1;
								for (var g = 0; g < l.children.length; g++) {
									var c = l.children[g];
									if (c.id == e.id) {
										j = g - 1;
										break
									}
								}
								if (j >= 0) {
									return l.children[j]
								}
							}
						} else {
							if (k == "down") {
								if (h.id == l.id) {
									return null
								} else {
									if (h.parent != l.id) {
										var m = b.model.getTopic(h.parent);
										var j = -1;
										for (var g = 0; g < m.children.length; g++) {
											var c = m.children[g];
											if (c.id == h.id) {
												j = g + 1;
												break
											}
										}
										if (j <= m.children.length - 1) {
											return m.children[j]
										}
									}
									var e = b.model.getSubTopic(h.id);
									var j = -1;
									for (var g = 0; g < l.children.length; g++) {
										var c = l.children[g];
										if (c.id == e.id) {
											j = g + 1;
											break
										}
									}
									if (j <= l.children.length - 1) {
										return l.children[j]
									}
								}
							}
						}
					}
				}
			} else {
				if (b.model.topic.structure == "mind_right") {
					if (k == "left") {
						if (h.id == l.id) {
							return null
						} else {
							return b.model.getParent(h.id)
						}
					} else {
						if (k == "right") {
							if (h.id == l.id) {
								if (l.children.length > 0) {
									return l.children[0]
								} else {
									return null
								}
							} else {
								if (h.children.length > 0) {
									return h.children[0]
								} else {
									return null
								}
							}
						} else {
							if (k == "up") {
								if (h.id == l.id) {
									return null
								} else {
									if (h.parent != l.id) {
										var m = b.model.getTopic(h.parent);
										var j = -1;
										for (var g = 0; g < m.children.length; g++) {
											var c = m.children[g];
											if (c.id == h.id) {
												j = g - 1;
												break
											}
										}
										if (j >= 0) {
											return m.children[j]
										}
									}
									var e = b.model.getSubTopic(h.id);
									var j = -1;
									for (var g = 0; g < l.children.length; g++) {
										var c = l.children[g];
										if (c.id == e.id) {
											j = g - 1;
											break
										}
									}
									if (j >= 0) {
										return l.children[j]
									}
								}
							} else {
								if (k == "down") {
									if (h.id == l.id) {
										return null
									} else {
										if (h.parent != l.id) {
											var m = b.model.getTopic(h.parent);
											var j = -1;
											for (var g = 0; g < m.children.length; g++) {
												var c = m.children[g];
												if (c.id == h.id) {
													j = g + 1;
													break
												}
											}
											if (j <= m.children.length - 1) {
												return m.children[j]
											}
										}
										var e = b.model.getSubTopic(h.id);
										var j = -1;
										for (var g = 0; g < l.children.length; g++) {
											var c = l.children[g];
											if (c.id == e.id) {
												j = g + 1;
												break
											}
										}
										if (j <= l.children.length - 1) {
											return l.children[j]
										}
									}
								}
							}
						}
					}
				}
			}
			return null
		},
		getRelativePos: function(e, d, f) {
			var c = f.offset();
			if (c == null) {
				c = {
					left: 0,
					top: 0
				}
			}
			return {
				x: e - c.left + f.scrollLeft(),
				y: d - c.top + f.scrollTop()
			}
		},
		getTopicsByRange: function(f) {
			var d = [];
			for (var i in b.model.topicList) {
				var j = $(".tp_box#" + i);
				if (j.length == 0) {
					continue
				}
				var c = j.offset().left;
				var k = j.offset().top;
				var e = j.width();
				var g = j.height();
				if (this.pointInRect(c, k, f) && this.pointInRect(c + e, k, f) && this.pointInRect(c + e, k + g, f) && this.pointInRect(c, k + g, f)) {
					d.push(i)
				}
			}
			return d
		},
		getTopicByPoint: function(c, h) {
			var f = null;
			for (var g in b.model.topicList) {
				var e = $(".tp_box#" + g);
				if (e.length == 0) {
					continue
				}
				var d = {};
				d.x = e.offset().left;
				d.y = e.offset().top;
				d.w = e.width();
				d.h = e.height();
				if (this.pointInRect(c, h, d)) {
					f = e;
					break
				}
			}
			return f
		},
		mergeArray: function(d, c) {
			for (var e = 0; e < c.length; e++) {
				var f = c[e];
				if (d.indexOf(f) < 0) {
					d.push(f)
				}
			}
			return d
		},
		removeFromArray: function(e, d) {
			var c = e.indexOf(d);
			if (c >= 0) {
				e.splice(c, 1)
			}
			return e
		},
		uniqueArray: function(g) {
			var d = [],
				f = {};
			for (var c = 0,
					e;
				(e = g[c]) != null; c++) {
				if (!f[e]) {
					d.push(e);
					f[e] = true
				}
			}
			return d
		},
		filterXss: function(c) {
			if (c == null || c == "") {
				return ""
			}
			c = c.toString();
			c = c.replace(/</g, "&lt;");
			c = c.replace(/%3C/g, "&lt;");
			c = c.replace(/>/g, "&gt;");
			c = c.replace(/%3E/g, "&gt;");
			c = c.replace(/'/g, "&#39;");
			c = c.replace(/"/g, "&quot;");
			return c
		},
		restoreXss: function(c) {
			if (c == null || c == "") {
				return ""
			}
			c = c.replace("&lt;", "<");
			c = c.replace("&gt;", ">");
			c = c.replace("&#39;", '"');
			c = c.replace("&quot;", "'");
			return c
		},
		calcDistance: function(f, e) {
			var d = e.y - f.y;
			var c = e.x - f.x;
			return Math.sqrt(Math.pow(d, 2) + Math.pow(c, 2))
		},
		getAngle: function(e, c) {
			var d = Math.atan(Math.abs(e.y - c.y) / Math.abs(e.x - c.x)) / Math.PI * 180;
			if (c.x <= e.x && c.y > e.y) {
				d = 180 - d
			} else {
				if (c.x < e.x && c.y <= e.y) {
					d = 180 + d
				} else {
					if (c.x >= e.x && c.y < e.y) {
						d = 360 - d
					}
				}
			}
			return d
		}
	};
	this.op = {
		opArea: "designer",
		topicDraggable: function(k, l) {
			if (l.altKey) {
				return
			}
			var d = k.attr("id");
			var c = k.find(".topic");
			if (d == "root") {
				return
			}
			var o = b.utils.getSelectedDom();
			if (o == null || o.length == 1) {
				o[0] = d
			}
			var h = null,
				n = l.pageX,
				m = l.pageY;
			var j = n - c.offset().left;
			var i = m - c.offset().top;
			var f = null,
				g = null;
			b.canvas.unbind("mousemove.drag").bind("mousemove.drag",
				function(q) {
					if (Math.abs(q.pageX - n) > 5 || Math.abs(q.pageY - m) > 5) {
						if (h == null) {
							h = c.clone().appendTo(b.canvas);
							h.addClass("tp_moving");
							if (k.parent().parent().hasClass("tp_children")) {
								h.addClass("moving_sub_topic")
							}
							h.css({
								"border-radius": "3px"
							});
							k.parent().find(".tp_box").addClass("moving_related");
							k.parent().find(".sub_linker_canvas").addClass("moving_related");
							if (o.length > 1) {
								for (var r = 0; r < o.length; r++) {
									var s = o[r];
									if (s == d) {
										continue
									}
									var p = b.model.getTopicDomByID(s);
									p.parent().find(".tp_box").addClass("moving_related");
									p.parent().find(".sub_linker_canvas").addClass("moving_related")
								}
							}
						}
						h.css({
							left: q.pageX - j,
							top: q.pageY - i
						});
						f = null;
						g = {};
						$(".moveing_on").removeClass("moveing_on");
						$("#moveing_insert").remove();
						$(".tp_box").each(function() {
							var v = $(this);
							var y = v.attr("id"),
								w = b.model.getTopic(y);
							if (!v.hasClass("moving_related")) {
								var x = {
									x: v.offset().left,
									y: v.offset().top,
									w: v.width(),
									h: v.height()
								};
								var z = b.utils.pointInRect(q.pageX, q.pageY, x);
								if (z) {
									f = y;
									return false
								}
								if (y != b.model.topic.id) {
									if (w.parent != b.model.topic.id) {
										var u = b.utils.pointBeforeOrAfter(q.pageX, q.pageY, x);
										if (u == "after") {
											g.id = y;
											g.pos = "after";
											return false
										} else {
											if (u == "before") {
												g.id = y;
												g.pos = "before";
												return false
											}
										}
									} else {
										var u = b.utils.pointBeforeOrAfter1(q.pageX, q.pageY, x);
										if (u == "after") {
											g.id = y;
											g.pos = "after";
											return false
										} else {
											if (u == "before") {
												g.id = y;
												g.pos = "before";
												return false
											}
										}
									}
								}
							}
						});
						if (f) {
							$("#" + f).addClass("moveing_on")
						} else {
							if (g.id != null) {
								var t = b.model.getTopic(g.id);
								if (t.parent == b.model.topic.id) {
									var e = $("<span id='moveing_insert' class='moveing_sub_insert'></span>");
									if (g.pos == "after") {
										e.appendTo("#" + g.id)
									} else {
										if (g.pos == "before") {
											e.addClass("before");
											e.prependTo("#" + g.id);
											if ($("#" + g.id).outerHeight() >= 50) {
												e.css({
													bottom: 53
												})
											}
										}
									}
								} else {
									var e = $("<span id='moveing_insert' class='moveing_insert'></span>");
									if (g.pos == "after") {
										e.appendTo("#" + g.id)
									} else {
										if (g.pos == "before") {
											e.addClass("before");
											e.prependTo("#" + g.id);
											e.css({})
										}
									}
								}
							}
						}
					}
				});
			$(document).bind("mouseup.drag",
				function() {
					b.canvas.find(".tp_moving_temp").remove();
					$(".moving_related").removeClass("moving_related");
					$(".moveing_on").removeClass("moveing_on");
					$("#moveing_insert").remove();
					b.canvas.unbind("mousemove.drag");
					$(document).unbind("mouseup.drag");
					if (h != null) {
						h.remove()
					}
					if (o.length == 0) {
						o.push(d)
					}
					if (f) {
						var p = [];
						for (var t = 0; t < o.length; t++) {
							var v = o[t];
							var u = b.model.getTopic(v);
							if (u.parent == "root") {
								$("#tp_linker_" + u.id).remove()
							}
							var q = b.utils.copy(u);
							q.parent = f;
							p.push(q)
						}
						b.model.updatePos(p)
					} else {
						if (g != null && g.id != null) {
							var s = b.model.getTopic(g.id);
							var r = b.model.getTopicIndex(g.id);
							if (g.pos == "after") {
								r = r + 1
							}
							var p = [],
								w = {};
							for (var t = 0; t < o.length; t++) {
								var v = o[t];
								var e = b.model.getTopic(v);
								if (e.parent == "root") {
									$("#tp_linker_" + e.id).remove()
								}
								var q = b.utils.copy(e);
								q.parent = s.parent;
								p.push(q)
							}
							b.model.updateSort(p, r)
						}
					}
				})
		},
		editText: function(f) {
			var e = f.children(".topic");
			var d = f.attr("id");
			var h = f.find("#textarea_" + d);
			h.attr("disabled", false);
			h.css({
				opacity: 1,
				filter: "alpha(opacity=100)",
				zIndex: 1
			});
			h.select();
			var i = f.find(".topic_text:first").text();
			var g = b.model.getTopic(d);
			var c = b.utils.getTopicStyle(g);
			var l = {
				"font-family": c.family,
				"font-size": c.fontSize + "px",
				"font-weight": c.bold ? "bold" : "normal",
				"font-style": c.italic ? "italic" : "normal",
				"text-align": c.textAlign
			};
			h.css(l);
			var j = $("#tp_text_ruler");
			if (j.length == 0) {
				j = $("<div id='tp_text_ruler'></div>").appendTo("body")
			}
			j.css(l);
			h.bind("keyup",
				function() {
					var s = b.utils.filterXss($(this).val());
					var o = s.split(/\n/g);
					for (var r = 0; r < o.length; r++) {
						var q = o[r];
						if (q.trim() == "") {
							o[r] = "&nbsp;"
						}
					}
					j.html(o.join("<br/>"));
					var n = j.height();
					var m = j.width() + 20;
					if (m < f.width()) {
						m = f.width()
					}
					h.css({
						top: (f.height() - (n + 12)) / 2 + 1,
						left: (f.width() - (m + 12)) / 2,
						width: m,
						height: n
					})
				}).bind("keydown",
				function(m) {
					m.stopPropagation();
					if (!m.shiftKey && m.keyCode == 13) {
						m.preventDefault();
						k(i)
					}
				}).bind("blur",
				function(m) {
					k(i)
				}).bind("mousedown.drag",
				function(m) {
					m.stopPropagation()
				}).bind("mouseup.drag",
				function(m) {
					m.stopPropagation()
				});
			h.trigger("keyup");

			function k(m) {
				if ($.trim(m) != $.trim(h.val())) {
					g.title = h.val();
					b.model.updateTopic(g)
				}
				h.remove()
			}
		},
		setStyle: function(f) {
			var e = b.utils.getSelected();
			var h = [];
			for (var d = 0; d < e.length; d++) {
				var g = e[d];
				var c = b.model.getTopic(g);
				c.style = $.extend(c.style, f);
				h.push(c)
			}
			b.model.updateMulti(h)
		},
		setBackground: function(c) {
			b.model.updateBg(c)
		},
		bindBackground: function(d) {
			var c;
			if (d != null) {
				c = d
			} else {
				c = b.model.topic.background == "" ? b.classic.getBackground() : b.model.topic.background
			}
			b.canvas.css({
				background: c
			})
		},
		setIcon: function(m) {
			var f = b.utils.getSelected();
			for (var h = 0; h < f.length; h++) {
				var d = f[h];
				var k = b.model.getTopic(d);
				if (!k.icons) {
					k.icons = []
				}
				var c = null;
				for (var g = 0; g < k.icons.length; g++) {
					var l = k.icons[g];
					if (m.name == l.name && m.index == l.index) {
						c = g;
						break
					}
				}
				if (c != null) {
					k.icons.splice(c, 1)
				} else {
					if (m.name) {
						var n = null;
						for (var g = 0; g < k.icons.length; g++) {
							var l = k.icons[g];
							if (l.name && l.name == m.name) {
								n = l;
								break
							}
						}
						if (n == null) {
							k.icons.push(m)
						} else {
							$.extend(n, m)
						}
					} else {
						k.icons.push(m)
					}
				}
				b.model.updateTopic(k);
				if (k.id != b.model.topic.id) {
					var e = b.model.getSubTopic(k.id);
					b.painter.renderSubTopic(e)
				} else {
					b.painter.renderSubTopic(k)
				}
			}
			b.painter.rangeTopic();
			b.utils.select(b.utils.selectedIds)
		},
		updateIcon: function(g, e, f) {
			var d = b.model.getTopic(g);
			d.icons[e] = f;
			b.model.updateTopic(d);
			if (d.id != b.model.topic.id) {
				var c = b.model.getSubTopic(d.id);
				b.painter.renderSubTopic(c)
			} else {
				b.painter.renderSubTopic(d)
			}
			b.painter.rangeTopic();
			b.utils.select(b.utils.selectedIds)
		},
		deleteIcon: function(f, e) {
			var d = b.model.getTopic(f);
			d.icons.splice(e, 1);
			b.model.updateTopic(d);
			if (d.id != b.model.topic.id) {
				var c = b.model.getSubTopic(d.id);
				b.painter.renderSubTopic(c)
			} else {
				b.painter.renderSubTopic(d)
			}
			b.painter.rangeTopic();
			b.utils.select(b.utils.selectedIds)
		},
		deleteIconByName: function(c) {
			var f = b.utils.getSelected();
			for (var k = 0; k < f.length; k++) {
				var d = f[k];
				var l = b.model.getTopic(d);
				if (!l.icons) {
					l.icons = []
				}
				var h = false;
				for (var g = 0; g < l.icons.length; g++) {
					var m = l.icons[g];
					if (m.name == c) {
						l.icons.splice(g, 1);
						h = true;
						break
					}
				}
				if (h) {
					b.model.updateTopic(l);
					if (l.id != b.model.topic.id) {
						var e = b.model.getSubTopic(l.id);
						b.painter.renderSubTopic(e)
					} else {
						b.painter.renderSubTopic(l)
					}
				}
			}
			b.painter.rangeTopic();
			b.utils.select(b.utils.selectedIds)
		},
		setNote: function(e, f) {
			var d = b.model.getTopic(f);
			d.note = e;
			b.model.updateTopic(d);
			if (d.id != b.model.topic.id) {
				var c = b.model.getSubTopic(d.id);
				b.painter.renderSubTopic(c)
			} else {
				b.painter.renderSubTopic(d)
			}
			b.painter.rangeTopic();
			b.utils.select(f)
		},
		setTag: function(c) {
			var f = b.utils.getSelected();
			if (f.length != 1) {
				return
			}
			var e = b.model.getTopic(f[0]);
			e.tag = c;
			b.model.updateTopic(e);
			if (e.id != b.model.topic.id) {
				var d = b.model.getSubTopic(e.id);
				b.painter.renderSubTopic(d)
			} else {
				b.painter.renderSubTopic(e)
			}
			b.painter.rangeTopic();
			b.utils.select(b.utils.selectedIds)
		},
		setLink: function(f) {
			var e = b.utils.getSelected();
			if (e.length != 1) {
				return
			}
			var d = b.model.getTopic(e[0]);
			d.link = f;
			b.model.updateTopic(d);
			if (d.id != b.model.topic.id) {
				var c = b.model.getSubTopic(d.id);
				b.painter.renderSubTopic(c)
			} else {
				b.painter.renderSubTopic(d)
			}
			b.painter.rangeTopic();
			b.utils.select(b.utils.selectedIds)
		},
		setTask: function(f) {
			var e = b.utils.getSelected();
			if (e.length == 0) {
				return
			}
			var c = b.model.getTopic(e[0]);
			var g = false;
			for (var d in f) {
				if (!c.task || c.task[d] != f[d]) {
					g = true;
					c.task = $.extend({},
						c.task, f)
				}
			}
			if (g) {
				b.model.updateTopic(c)
			}
		},
		removeTopic: function() {
			var e = b.utils.getSelected(),
				f = [];
			if (e.length == 0) {
				return
			}
			for (var d = 0; d < e.length; d++) {
				var g = e[d];
				var c = b.model.getTopic(g);
				f.push(c)
			}
			b.model.removeMulti(f)
		}
	};
	this.painter = {
		initTopicEvent: function() {
			if (b.config.readonly) {
				return
			}
			var c = $(".tp_box[id]");
			c.unbind("dblclick").bind("dblclick",
				function(f) {
					var d = $(this);
					b.op.editText(d)
				});
			c.unbind("mousedown.drag").bind("mousedown.drag",
				function(i) {
					var g = $(this);
					if (g.attr("id") == b.model.topic.id) {
						var h = b.canvas.parent();
						var f = h.scrollTop();
						var d = h.scrollLeft();
						b.canvas.bind("mousemove.dragcanvas",
							function(j) {
								if (Math.abs(j.pageX - i.pageX) > 6 || Math.abs(j.pageY - i.pageY) > 6) {
									var e = j.pageX - i.pageX;
									var k = j.pageY - i.pageY;
									h.scrollLeft(d - e);
									h.scrollTop(f - k)
								}
							});
						$(document).unbind("mouseup.drag_canvas").bind("mouseup.drag_canvas",
							function(e) {
								b.canvas.unbind("mousemove.dragcanvas")
							})
					} else {
						b.canvas.unbind("mousemove.drag");
						b.op.topicDraggable(g, i)
					}
				});
			c.off("click.select").on("click.select",
				function(g) {
					b.contextMenu.close();
					var d = $(this);
					var h = d.attr("id");
					if (b.model.brushStyles != null) {
						b.model.pasteTopicStyle(h, b.model.brushStyles)
					}
					if (b.canvas.find(".connection_point").length > 0) {
						b.connection.unSelectConnection()
					}
					b.events.push("updateHeader");
					if (g.ctrlKey) {
						var f = b.utils.getSelected();
						if (b.utils.isSelected(h)) {
							b.utils.removeFromArray(f, h)
						} else {
							f.push(h)
						}
						b.utils.select(f)
					} else {
						if (b.utils.getSelected().indexOf(h) < 0) {
							b.utils.select(h)
						}
					}
					g.stopPropagation()
				});
			c.off("mouseup.select").on("mouseup.select",
				function(f) {
					var d = $(this);
					var g = d.attr("id");
					$("#textarea_" + g).select()
				})
		},
		renderTopic: function(B, r) {
			var P = $("#" + B.id);
			if (P.length) {
				P.parent().remove()
			}
			var U = $("<div class='tp_container'><div class='tp_box' id='" + B.id + "'><div class='topic'></div></div></div>");
			if (r == "left") {
				U.addClass("tp_part_left")
			}
			var H = null;
			if (B.parent == b.model.topic.id || B.id == b.model.topic.id) {
				H = b.canvas
			} else {
				var J = $("#" + B.parent).parent();
				H = J.children(".tp_children");
				if (H.length == 0) {
					if (r == "left") {
						H = $("<div class='tp_children'></div>").prependTo(J)
					} else {
						H = $("<div class='tp_children'></div>").appendTo(J)
					}
				}
			}
			var g = U.appendTo(H);
			if (B.tag != null && $.trim(B.tag) != "" && B.parent != null && B.parent.length > 8) {
				var y = $("<div class='tp_container_temp'></div>");
				y.css({
					height: 25
				});
				U.after(y)
			}
			if (B.id == "root") {
				g.css("position", "absolute")
			}
			var i = $("#" + B.id);
			var L = i.children(".topic");
			var D = b.utils.filterXss(B.title);
			var x = D.split(/\n/);
			for (var s = 0; s < x.length; s++) {
				var O = x[s];
				if (O.trim() == "") {
					x[s] = "&nbsp;"
				}
			}
			L.html("<span class='topic_text'>" + x.join("<br/>") + "</span>");
			var Q = b.utils.getTopicStyle(B);
			if (Q.shape != "underline" && Q.shape != "none" && Q.bgColor == "white" && Q.fontColor == "white") {
				Q.fontColor = "rgb(68,68,68)"
			}
			var m = {
				"font-family": Q.family,
				"font-size": Q.fontSize + "px",
				"font-weight": Q.bold ? "bold" : "normal",
				"font-style": Q.italic ? "italic" : "normal",
				"text-align": Q.textAlign,
				color: Q.fontColor,
				border: Q.border,
				"box-shadow": Q.boxshadow
			};
			L.css(m);
			if (b.config.readonly == false) {
				this.initTopicEvent()
			}
			if (B.icons && B.icons.length > 0) {
				var V = $("<div class='topic_icon_box'></div>").prependTo(L);
				var n = L.height();
				var c = 30;
				if (n > c) {
					V.css("padding", L.height() / 2 - c / 2 + "px 0px")
				} else {
					L.children(".topic_text").css("padding", c / 2 - L.height() / 2 + "px 0px")
				}
				for (var S = 0; S < B.icons.length; S++) {
					var q = B.icons[S];
					var R = $("<div class='topic_ico'></div>").appendTo(V);
					var E = c * q.index;
					R.attr({
						n: q.name,
						index: q.index,
						i: S
					});
					R.css("background-position", "0px -" + E + "px");
					R.bind("mousedown",
						function(h) {
							UI.changeIcon($(this), h)
						})
				}
			}
			if (B.note || B.link) {
				var F = $("<div class='topic_extend_box'></div>").prependTo(L);
				var n = L.height();
				var c = 24;
				if (n > c) {
					F.css("padding", L.height() / 2 - c / 2 + "px 0px")
				} else {
					L.children(".topic_text").css("padding", c / 2 - L.height() / 2 + "px 0px")
				}
				if (B.note) {
					var d = $("<div note_tpid='" + B.id + "' class='tp_extend_item note'><span></span></div>").appendTo(F);
					// d.bind("click", function(Y) {
					// 	console.log('mouseover');
					// 	var X = $(this);
					// 	var Z = X.attr("note_tpid");
					// 	var w = b.model.getTopic(Z).note;
					// 	// var j = window.markdownit();
					// 	// var h = j.render(w);
					// 	var h = '';
					// 	var W = $("#note_view_box");
					// 	if (W.length == 0) {
					// 		W = $("<div id='note_view_box'></div>").appendTo("body")
					// 	}
					// 	var p = $("<div id='note_view_box_temp'></div>").appendTo("body");
					// 	p.html(h);
					// 	W.css({
					// 		height: p.height(),
					// 		width: p.width() + 25,
					// 		zIndex: "9999999999"
					// 	});
					// 	p.remove();
					// 	W.html(h).hide();
					// 	W.dropdown({
					// 		target: X,
					// 		position: "center",
					// 		fade: true
					// 	})
					// }).bind("mouseleave", function(h) {});
					if (b.config.readonly == false) {
						d.bind("click.show",
							function(h) {
								var j = d.parent().parent().parent().attr("id");
								b.utils.select(j);
								b.events.push("showDockNote", "note");
								h.stopPropagation()
							})
					}
				}
				if (B.link && B.link.value) {
					var e = $("<a class='tp_extend_item link' href='javascript:'><span></span></a>").appendTo(F);
					if (B.link.type == "url") {
						var f = B.link.value;
						if (f.indexOf("http") < 0) {
							f = "http://" + f
						}
						e.attr({
							href: f,
							target: "_blank"
						})
					} else {
						if (B.link.type == "topic") {
							e.attr({
								tp_id: B.link.value
							});
							e.bind("click.show", function(h) {
								b.utils.select($(this).attr("tp_id"));
								h.stopPropagation()
							})
						}
					}
				}
			}
			if ((B.icons && B.icons.length > 0) || B.note || B.link) {
				L.append("<div style='clear: both'></div>")
			}
			if (B.tag) {
				var t = $("<div class='topic_tag'></div>").appendTo(i);
				t.text(B.tag);
				t.css({
					left: "50%",
					marginLeft: -t.outerWidth() / 2
				});
				if (b.config.readonly == false) {
					t.on("click.show",
						function(h) {
							var j = t.parent().attr("id");
							b.utils.select(j);
							b.events.push("showDockNote", "note");
							h.stopPropagation()
						})
				}
			}
			if (B.task && (B.task.start || B.task.end || B.task.assigned)) {
				var I = $("<div class='tp_task'></div>").appendTo(L);
				if (B.task.start || B.task.end) {
					var C = "";
					if (B.task.start) {
						C += B.task.start
					} else {
						C += "<span class='tp_task_line'>__</span>"
					}
					C += " : ";
					if (B.task.end) {
						C += B.task.end
					} else {
						C += "<span class='tp_task_line'>__</span>"
					}
					I.append(C);
					I.children(".tp_task_line").css("border-color", Q.fontColor)
				}
			}
			var u = Q.shape;
			if (u == "roundRectangle") {
				var M = 6;
				var K = L.outerWidth();
				var T = L.outerHeight();
				var l = T;
				if (K < T) {
					l = K
				}
				if (l >= 50) {
					M = 7
				} else {
					if (l >= 40) {
						M = 6
					} else {
						M = 4
					}
				}
				L.css({
					"background-color": Q.bgColor,
					"border-radius": M + "px"
				})
			} else {
				if (u == "rectangle") {
					L.css({
						"background-color": Q.bgColor,
						border: "0px"
					})
				} else {
					if (u == "round") {
						L.css({
							"background-color": "transparent",
							"box-shadow": "none",
							padding: "10px 15px",
							border: "0px"
						});
						var k = $("<canvas class='tp_shape_canvas'></canvas>").prependTo(L);
						var K = L.outerWidth();
						var T = L.outerHeight();
						k.attr({
							width: K + 10,
							height: T + 10
						});
						var v = k[0].getContext("2d");
						v.translate(5, 5);
						v.beginPath();
						v.moveTo(0, T / 2);
						v.bezierCurveTo(0, -T / 6, K, -T / 6, K, T / 2);
						v.bezierCurveTo(K, T + T / 6, 0, T + T / 6, 0, T / 2);
						v.closePath();
						v.fillStyle = Q.bgColor;
						v.lineWidth = 0;
						v.shadowColor = "rgba(0, 0, 0, 0.2)";
						v.shadowBlur = 4;
						v.shadowOffsetX = 1;
						v.shadowOffsetY = 3;
						v.fill()
					} else {
						if (u == "diamond") {
							L.css({
								"background-color": "transparent",
								"box-shadow": "none",
								padding: "25px 30px",
								border: "0px"
							});
							var k = $("<canvas class='tp_shape_canvas'></canvas>").prependTo(L);
							var K = L.outerWidth();
							var T = L.outerHeight();
							k.attr({
								width: K + 10,
								height: T + 10
							});
							var v = k[0].getContext("2d");
							v.translate(5, 5);
							v.beginPath();
							v.moveTo(0, T / 2);
							v.lineTo(K / 2, 0);
							v.lineTo(K, T / 2);
							v.lineTo(K / 2, T);
							v.closePath();
							v.fillStyle = Q.bgColor;
							v.lineWidth = 0;
							v.shadowColor = "rgba(0, 0, 0, 0.2)";
							v.shadowBlur = 4;
							v.shadowOffsetX = 1;
							v.shadowOffsetY = 3;
							v.fill()
						} else {
							if (u == "underline") {
								var N = b.utils.getExtendStyle(B);
								var o = N.lineWidth + "px solid " + N.lineColor;
								L.css({
									"background-color": "transparent",
									"box-shadow": "none",
									border: "0px",
									"border-bottom": o
								})
							} else {
								if (u == "bubbleRound") {
									L.css({
										"background-color": "transparent",
										"box-shadow": "none",
										border: "0px"
									});
									var k = $("<canvas class='tp_shape_canvas'></canvas>").prependTo(L);
									var K = L.outerWidth();
									var T = L.outerHeight();
									k.attr({
										width: K + 10,
										height: T + 10
									});
									var v = k[0].getContext("2d");
									v.translate(5, 5);
									v.fillStyle = Q.bgColor;
									v.lineWidth = 0;
									v.save();
									v.shadowColor = "rgba(0, 0, 0, 0.2)";
									v.shadowBlur = 4;
									v.shadowOffsetX = 1;
									v.shadowOffsetY = 3;
									v.beginPath();
									v.moveTo(0, T / 2);
									v.bezierCurveTo(0, -T / 6, K, -T / 6, K, T / 2);
									v.bezierCurveTo(K, T + T / 6, 0, T + T / 6, 0, T / 2);
									v.closePath();
									v.fill();
									v.restore();
									v.beginPath();
									v.moveTo(K / 5, T / 2);
									v.lineTo(0, T);
									v.lineTo(K * 0.75, T / 2);
									v.closePath();
									v.fill()
								} else {
									if (u == "bubbleRectangle") {
										L.css({
											"background-color": "transparent",
											"box-shadow": "none",
											border: "0px"
										});
										var M = 6;
										var K = L.outerWidth();
										var T = L.outerHeight();
										var l = T;
										if (K < T) {
											l = K
										}
										if (l >= 50) {
											M = 7
										} else {
											if (l >= 40) {
												M = 6
											} else {
												M = 4
											}
										}
										var k = $("<canvas class='tp_shape_canvas'></canvas>").prependTo(L);
										var K = L.outerWidth();
										var T = L.outerHeight();
										k.attr({
											width: K + 10,
											height: T + 15
										});
										var v = k[0].getContext("2d");
										v.translate(5, 5);
										v.fillStyle = Q.bgColor;
										v.lineWidth = 0;
										v.save();
										v.shadowColor = "rgba(0, 0, 0, 0.2)";
										v.shadowBlur = 4;
										v.shadowOffsetX = 1;
										v.shadowOffsetY = 3;
										v.beginPath();
										v.moveTo(0, M);
										v.quadraticCurveTo(0, 0, M, 0);
										v.lineTo(K - M, 0);
										v.quadraticCurveTo(K, 0, K, M);
										v.lineTo(K, T - M);
										v.quadraticCurveTo(K, T, K - M, T);
										v.lineTo(M, T);
										v.quadraticCurveTo(0, T, 0, T - M);
										v.closePath();
										v.fill();
										var z = 10;
										var A = 24;
										var G = 10;
										if (l < 40) {
											z = 7;
											A = 15;
											G = 7
										}
										v.restore();
										v.beginPath();
										v.moveTo(z, T);
										v.lineTo(0, T + G);
										v.lineTo(10 + A, T);
										v.closePath();
										v.fill()
									} else {
										L.css({
											"background-color": "transparent",
											"box-shadow": "none"
										})
									}
								}
							}
						}
					}
				}
			}
			return g
		},
		renderSubTopic: function(d) {
			function c(f, e) {
				if (!e && f.parent == b.model.topic.id) {
					var e = b.painter.ranged[f.id];
					if (!e) {
						e = "right"
					}
				}
				b.painter.renderTopic(f, e);
				if (f.children && !f.collapsed) {
					var g = 0;
					while (g < f.children.length) {
						var h = f.children[g];
						c(h, e);
						g++
					}
				}
				if (f.parent == b.model.topic.id) {
					b.painter.drawChildrenLinker(f)
				}
			}
			c(d)
		},
		ranged: {},
		rangeTopic: function(m) {
			var p = b.model.topic;
			var w = {
				x: b.config.canvasWidth / 2,
				y: b.config.canvasHeight / 2
			};
			var n = b.utils.getTopicContainer(b.model.topic.id);
			n.css({
				left: (b.config.canvasWidth - n.outerWidth()) / 2,
				top: (b.config.canvasHeight - n.outerHeight()) / 2
			});
			if (p.children.length == 0) {
				return
			}
			if (b.model.topic.structure == "mind") {
				if (m) {
					for (var s = 0; s < p.children.length; s++) {
						var e = p.children[s];
						b.painter.renderSubTopic(e)
					}
				}
				var v = {
					topics: [],
					h: 0,
					type: "right"
				};
				var h = {
					topics: [],
					h: 0,
					type: "left"
				};
				var x = 0;
				for (var s = 0; s < p.children.length; s++) {
					var q = p.children[s];
					var j = b.utils.getTopicContainer(q.id);
					var d = j.height();
					x += d
				}
				if (p.children.length <= 2) {
					v.topics = p.children;
					x += b.config.topicMargin * (p.children.length - 1);
					v.h = x
				} else {
					x += b.config.topicMargin * (p.children.length - 2);
					var r = x / 2;
					var f = v;
					var k = 0;
					for (var s = 0; s < p.children.length; s++) {
						var q = p.children[s];
						var j = b.utils.getTopicContainer(q.id);
						var d = j.height();
						if (k != 0) {
							d += b.config.topicMargin
						}
						var g = f.h + d;
						if (g > r + 50 && f.type == "right") {
							f = h;
							k = 0;
							g = j.height()
						}
						f.h = g;
						f.topics.push(q);
						k++
					}
				}

				function o(A) {
					if (A.topics.length == 0) {
						return
					}
					var F = b.utils.getTopicContainer(A.topics[0].id);
					var y = b.utils.getTopicContainer(A.topics[A.topics.length - 1].id);
					A.h = A.h - F.height() / 2;
					A.h = A.h - y.height() / 2;
					var B = w.y - A.h / 2;
					B = B - F.height() / 2;
					for (var C = 0; C < A.topics.length; C++) {
						var E = A.topics[C];
						var z = b.utils.getTopicContainer(E.id);
						z.css("position", "absolute");
						var D = w.x + n.width() / 2 + 40;
						if (A.type == "right") {
							z.css("left", D)
						} else {
							z.css("right", D)
						}
						if (C != 0) {
							B += b.config.topicMargin
						}
						z.css("top", B);
						var G = z.height();
						B += G;
						b.painter.drawMainLinker(E)
					}
				}

				function u(D) {
					for (var E = 0; E < D.topics.length; E++) {
						var H = D.topics[E];
						b.painter.ranged[H.id] = D.type;
						if ((c[H.id] == "undefined" && D.type == "left") || (c[H.id] != "undefined" && D.type != c[H.id])) {
							b.painter.renderSubTopic(H)
						}
					}
					if (D.topics.length == 1) {
						var G = D.topics[0];
						var B = b.utils.getTopicContainer(G.id);
						B.css("position", "absolute");
						B.css({
							position: "absolute",
							top: w.y - 100 - B.height() / 2
						});
						var F = w.x + n.width() / 2 + 40;
						if (D.type == "right") {
							B.css("left", F)
						} else {
							B.css("right", F)
						}
						b.painter.drawMainLinker(G)
					} else {
						if (D.topics.length == 2) {
							var C = D.topics[0];
							var A = b.utils.getTopicContainer(C.id);
							var z = D.topics[1];
							var y = b.utils.getTopicContainer(z.id);
							if (A.height() / 2 + y.height() / 2 <= 200 - b.config.topicMargin) {
								A.css({
									position: "absolute",
									top: w.y - 100 - A.height() / 2
								});
								y.css({
									position: "absolute",
									top: w.y + 100 - y.height() / 2
								});
								var F = w.x + n.width() / 2 + 40;
								if (D.type == "right") {
									A.css("left", F);
									y.css("left", F)
								} else {
									A.css("right", F);
									y.css("right", F)
								}
								b.painter.drawMainLinker(C);
								b.painter.drawMainLinker(z)
							} else {
								o(D)
							}
						} else {
							o(D)
						}
					}
				}
				var c = b.utils.copy(this.ranged);
				this.ranged = {};
				u(v);
				u(h)
			} else {
				if (b.model.topic.structure == "mind_right") {
					var x = 0;

					function l(y, i) {
						$.each(y,
							function(z, A) {
								b.painter.renderTopic(A);
								if (A.children.length > 0 && !A.collapsed) {
									l(A.children)
								}
								b.painter.drawChildrenLinker(A)
							})
					}

					function t(y, i) {
						var z = x / 2;
						$.each(y,
							function(B, C) {
								var A = b.utils.getTopicContainer(C.id);
								A.css({
									position: "absolute",
									left: b.restoreScale(i.position().left) + i.width() + 40,
									top: b.restoreScale(i.position().top) + i.height() / 2 - z
								});
								b.painter.drawMainLinker(C);
								z -= A.height()
							})
					}
					l(p.children);
					for (var s = 0; s < p.children.length; s++) {
						var q = p.children[s];
						var j = b.utils.getTopicContainer(q.id);
						var d = j.height();
						x += d
					}
					t(p.children, n)
				}
			}
		},
		drawMainLinker: function(j) {
			var i = b.utils.getTopicContainer(j.id);
			var c = b.utils.getTopicStyle(b.model.topic);
			var e = b.utils.getTopicStyle(j);
			e = $.extend({},
				c, e);
			var d = {
				x: b.config.canvasWidth / 2,
				y: b.config.canvasHeight / 2
			};
			var l = {
				x: b.restoreScale(i.position().left - b.toScale(d.x))
			};
			if (e.shape == "underline") {
				var n = i.children(".tp_box").outerHeight();
				l.y = b.restoreScale(i.position().top - b.toScale(d.y)) + i.height() / 2 + n / 2 - 3 - e.lineWidth / 2
			} else {
				l.y = b.restoreScale(i.position().top - b.toScale(d.y)) + i.height() / 2
			}
			var h = {};
			if (l.x > 0) {
				h.x = 0;
				h.w = l.x + 2
			} else {
				h.x = l.x + i.width() - 2;
				h.w = Math.abs(l.x + i.width())
			}
			h.h = Math.abs(l.y);
			var o = {};
			if (l.y > 0) {
				h.y = 0;
				if (l.x > 0) {
					o.y1 = 0;
					o.y2 = h.h
				} else {
					o.y1 = h.h;
					o.y2 = 0
				}
			} else {
				h.y = l.y;
				if (l.x > 0) {
					o.y1 = h.h;
					o.y2 = 0
				} else {
					o.y1 = 0;
					o.y2 = h.h
				}
			}
			var f = i.children(".tp_box").attr("id");
			var g = $("#tp_linker_" + f);
			if (g.length == 0) {
				g = $("<canvas id='tp_linker_" + f + "' class='linker_canvas' fortp='" + f + "'></canvas>").appendTo(b.canvas)
			}
			g.attr({
				width: h.w + 10,
				height: h.h + 10
			});
			g.css({
				left: d.x + h.x - 5,
				top: d.y + h.y - 5
			});
			var k = g[0];
			var m = k.getContext("2d");
			m.strokeStyle = e.lineColor;
			m.lineWidth = e.lineWidth;
			m.lineCap = "square";
			m.translate(5, 5);
			m.beginPath();
			m.moveTo(0, o.y1);
			if (c.lineType == "straight") {
				m.lineTo(h.w, o.y2);
				m.stroke()
			} else {
				if (c.lineType == "curve") {
					if (l.x > 0) {
						m.bezierCurveTo(0, h.h / 2, h.w / 2, o.y2, h.w, o.y2)
					} else {
						m.bezierCurveTo(h.w / 2, o.y1, h.w, h.h / 2, h.w, o.y2)
					}
					m.stroke()
				} else {
					if (c.lineType == "broken") {
						if (l.x > 0) {
							m.lineTo(0, o.y2);
							m.lineTo(h.w, o.y2)
						} else {
							m.lineTo(h.w, o.y1);
							m.lineTo(h.w, o.y2)
						}
						m.stroke()
					} else {
						if (c.lineType == "roundBroken") {
							if (l.x > 0) {
								if (o.y2 < o.y1) {
									m.lineTo(0, o.y2 + 10)
								} else {
									m.lineTo(0, o.y2 - 10)
								}
								m.quadraticCurveTo(0, o.y2, 10, o.y2);
								m.lineTo(h.w, o.y2)
							} else {
								m.lineTo(h.w - 10, o.y1);
								if (o.y2 < o.y1) {
									m.quadraticCurveTo(h.w, o.y1, h.w, o.y1 - 10)
								} else {
									m.quadraticCurveTo(h.w, o.y1, h.w, o.y1 + 10)
								}
								m.lineTo(h.w, o.y2)
							}
							m.stroke()
						}
					}
				}
			}
		},
		drawChildrenLinker: function(w) {
			var t = b.utils.getExtendStyle(w);
			var o = b.utils.getTopicContainer(w.id);
			var f = o.children(".tp_children");
			f.children(".sub_linker_canvas").remove();
			f.children(".tp_expand_box").remove();
			if (!w.children || w.children.length == 0) {
				return
			}
			var y = o.children(".tp_box");
			var q = $("<div class='tp_expand_box'><div class='tp_expand_ico' updateId='" + w.id + "'></div></div>").appendTo(y);
			q.children().bind("click",
				function() {
					var C = $(this).attr("updateId");
					var D = b.model.getTopic(C);
					D.collapsed = !$(this).parent().hasClass("collapsed");
					if (b.config.readonly == false) {
						b.model.updateTopic(D)
					}
					var i = b.model.getSubTopic(C);
					b.painter.renderSubTopic(i);
					b.painter.rangeTopic();
					var B = b.model.getChildrenIds(D);
					b.connection.showConnection(!D.collapsed, B)
				});
			if (o.hasClass("tp_part_left")) {
				q.css("left", "-15px")
			} else {
				q.css("right", "-15px")
			}
			q.css({
				height: t.lineWidth,
				background: t.lineColor
			});
			q.children().css("top", (t.lineWidth - 14) / 2);
			var p;
			if (t.shape == "underline") {
				p = f.height() / 2 + y.height() / 2 - t.lineWidth / 2;
				q.css("top", y.height() - t.lineWidth + 1)
			} else {
				p = f.height() / 2;
				var m = y.height() + 2;
				q.css("top", m / 2 - t.lineWidth / 2)
			}
			if (w.collapsed) {
				q.addClass("collapsed").css("background", "transparent");
				return
			}
			for (var x = 0; x < w.children.length; x++) {
				var l = w.children[x];
				var A = b.utils.getExtendStyle(l);
				var n = $("#" + l.id);
				var r = n.parent();
				var s = r.position().top;
				var e;
				if (A.shape == "underline") {
					e = b.restoreScale(n.position().top) + n.height() + 3 - A.lineWidth / 2
				} else {
					e = b.restoreScale(s) + r.height() / 2
				}
				var h = $("<canvas id='sub_linker_" + w.id + "' fortp='" + w.id + "' width='18px' class='sub_linker_canvas'></canvas>").appendTo(f);
				var u = Math.abs(e - p);
				var k = Math.min(p, e);
				h.attr("height", u + 8);
				h.css("top", Math.floor(k - 4));
				var z = h[0];
				var v = z.getContext("2d");
				if (A.lineWidth % 2 != 0) {
					v.translate(4, 4.5)
				} else {
					v.translate(4, 4)
				}
				v.strokeStyle = A.lineColor;
				v.lineWidth = A.lineWidth;
				v.beginPath();
				var g = p - k;
				var c = e - k;
				var j = 0;
				var d = 10;
				if (o.hasClass("tp_part_left")) {
					j = 10;
					d = 0;
					h.css("right", "-4px")
				} else {
					h.css("left", "-4px")
				}
				v.moveTo(j, g);
				if (t.lineType == "straight") {
					v.lineTo(d, c)
				} else {
					if (t.lineType == "curve") {
						v.quadraticCurveTo(j, c, d, c)
					} else {
						if (t.lineType == "broken") {
							v.lineTo(j, c);
							v.lineTo(d, c)
						} else {
							if (t.lineType == "roundBroken") {
								if (Math.abs(e - p) >= 10) {
									if (e < p) {
										v.lineTo(j, c + 10)
									} else {
										v.lineTo(j, c - 10)
									}
								}
								v.quadraticCurveTo(j, c, d, c)
							}
						}
					}
				}
				v.stroke();
				this.drawChildrenLinker(l)
			}
		},
		appendTopic: function(k, g) {
			var e = b.utils.newId();
			var j;
			if (k == b.model.topic.id) {
				j = "分支主题 " + (b.model.topic.children.length + 1)
			} else {
				j = "子主题"
			}
			var f = {
				id: e,
				title: j,
				parent: k,
				children: [],
				collapsed: false
			};
			if (g != null) {
				var d = {};
				d[f.id] = g;
				var h = b.model.getPreTopic(k, g - 1);
				if (h != null) {
					var c = b.utils.copy(h);
					f.style = c.style;
					delete c
				}
				b.model.addTopic(f, d)
			} else {
				b.model.addTopic(f)
			}
		}
	};
	this.events = {
		push: function(e, c) {
			var d = this.listeners[e];
			if (d) {
				return d(c)
			}
			return null
		},
		listeners: {},
		addEventListener: function(d, c) {
			this.listeners[d] = c
		}
	};
	this.open = function(c) {
		if (c.id != null) {
			this.model.topic = c
		}
		b.model.buildTopicList();
		this.painter.renderTopic(this.model.topic);
		b.painter.rangeTopic(true);
		b.connection.loadConnections()
	};
	this.hotkey = {
		init: function() {
			$(window).unbind("keydown.hotkey").bind("keydown.hotkey",
				function(m) {
					if (b.op.opArea != "designer") {
						return
					}
					if (m.keyCode == 37) {
						var k = b.utils.getSublings("left");
						if (k != null) {
							m.preventDefault();
							b.utils.select(k.id)
						}
					} else {
						if (m.keyCode == 38) {
							var k = b.utils.getSublings("up");
							if (k != null) {
								m.preventDefault();
								b.utils.select(k.id)
							}
						} else {
							if (m.keyCode == 39) {
								var k = b.utils.getSublings("right");
								if (k != null) {
									m.preventDefault();
									b.utils.select(k.id)
								}
							} else {
								if (m.keyCode == 40) {
									var k = b.utils.getSublings("down");
									if (k != null) {
										m.preventDefault();
										b.utils.select(k.id)
									}
								} else {
									if (m.keyCode == 45 || m.keyCode == 9) {
										var f = b.utils.getSelected();
										if (f.length > 0) {
											m.preventDefault();
											var j = f[f.length - 1];
											b.painter.appendTopic(j)
										}
									} else {
										if (m.keyCode == 13) {
											var f = b.utils.getSelected();
											if (f.length > 0) {
												var d = f[f.length - 1];
												var g = Number(b.model.getTopicIndex(d)) + 1;
												if (d == "root") {
													b.painter.appendTopic(d)
												} else {
													var n = b.model.getParent(d);
													b.painter.appendTopic(n.id, g)
												}
											}
										} else {
											if ((m.ctrlKey || m.metaKey) && m.keyCode == 65) {
												b.utils.selectAll()
											} else {
												if ((m.ctrlKey || m.metaKey) && m.keyCode == 67) {
													var f = des.utils.getSelected();
													if (f.length > 0) {
														b.model.copyTopic(f)
													}
												} else {
													if ((m.ctrlKey || m.metaKey) && m.keyCode == 88) {
														var f = des.utils.getSelected();
														if (f.length > 0) {
															b.model.cutTopic(f)
														}
													} else {
														if ((m.ctrlKey || m.metaKey) && m.keyCode == 66) {
															var f = des.utils.getSelected();
															if (f.length > 0) {
																b.events.push("brushStart");
																m.preventDefault()
															}
														} else {
															if ((m.ctrlKey || m.metaKey) && m.keyCode == 86) {
																var f = des.utils.getSelected();
																if (f.length > 0) {
																	var l = b.model.getTopic(f[f.length - 1]);
																	b.model.pasteTopic(l)
																}
															} else {
																if ((m.ctrlKey || m.metaKey) && m.keyCode == 90) {
																	b.messageSource.undo();
																	m.preventDefault()
																} else {
																	if ((m.ctrlKey || m.metaKey) && m.keyCode == 89) {
																		b.messageSource.redo();
																		m.preventDefault()
																	} else {
																		if (m.keyCode == 46 || m.keyCode == 8) {
																			b.op.removeTopic();
																			var c = b.connection.selectIds;
																			if (c.length > 0) {
																				var d = c[0];
																				var o = b.connection.data[d];
																				b.connection.deleteConnection(o)
																			}
																			m.preventDefault()
																		} else {
																			if (m.keyCode == 27) {
																				if (b.model.brushStyles != null) {
																					b.model.brushStyles = null;
																					b.events.push("brushTopic")
																				} else {
																					b.utils.unselect()
																				}
																			} else {
																				if (m.keyCode == 32) {
																					var f = des.utils.getSelected();
																					if (f.length > 0) {
																						m.preventDefault();
																						var d = f[f.length - 1];
																						var h = $(".tp_box#" + d);
																						b.op.editText(h)
																					}
																				} else {
																					if (m.keyCode != 18 && m.keyCode != 17 && m.keyCode != 116) {
																						var f = des.utils.getSelected();
																						if (f.length > 0) {
																							var d = f[f.length - 1];
																							var h = $(".tp_box#" + d);
																							b.op.editText(h)
																						}
																					}
																				}
																			}
																		}
																	}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				})
		}
	};
	this.messageSource = {
		isCollaboration: false,
		isUndo: true,
		withMessage: true,
		messages: [],
		send: function(c, d) {
			this.isCollaboration = false;
			this.messages.push({
				action: c,
				content: d
			});
			this.submit()
		},
		submit: function() {
			if (this.messages.length != 0) {
				if (this.withMessage == false) {
					this.messages = [];
					return
				}
				if (this.isUndo) {
					this.undoStack.push(this.messages)
				}
				if (chartId != "") {
					var c = {
						action: "command",
						messages: this.messages,
						name: userName
					};
					CLB.send(c)
				}
				this.messages = []
			}
		},
		receive: function(d, c) {
			this.isCollaboration = true;
			this.doWithoutMessage(function() {
				b.messageSource.executeMessages(d)
			})
		},
		undoStack: {
			stack: [],
			push: function(d, c) {
				this.stack.push(d);
				if (typeof c == "undefined") {
					c = true
				}
				if (c) {
					b.messageSource.redoStack.stack = []
				}
				b.events.push("undoStackChanged", this.stack.length)
			},
			pop: function() {
				var d = this.stack.length;
				if (d == 0) {
					return null
				}
				var c = this.stack[d - 1];
				this.stack.splice(d - 1, 1);
				b.messageSource.redoStack.push(c);
				b.events.push("undoStackChanged", this.stack.length);
				return c
			}
		},
		redoStack: {
			stack: [],
			push: function(c) {
				this.stack.push(c);
				b.events.push("redoStackChanged", this.stack.length)
			},
			pop: function() {
				var d = this.stack.length;
				if (d == 0) {
					return null
				}
				var c = this.stack[d - 1];
				this.stack.splice(d - 1, 1);
				b.messageSource.undoStack.push(c, false);
				b.events.push("redoStackChanged", this.stack.length);
				return c
			}
		},
		undo: function() {
			this.isCollaboration = false;
			var c = this.undoStack.pop();
			if (c == null) {
				return
			}
			this.doWithoutUndo(function() {
				for (var h = 0; h < c.length; h++) {
					var e = c[h];
					if (e.action == "create") {
						var d = e.content.content;
						b.model.removeMulti(d)
					} else {
						if (e.action == "update") {
							var f = e.content.original;
							b.model.updateMulti(f)
						} else {
							if (e.action == "updateBg") {
								var g = e.content.oldBg;
								b.model.updateBg(g)
							} else {
								if (e.action == "updatepos" || e.action == "updatesort") {
									var f = e.content.original,
										o = e.content.oldIndex,
										p = e.content.updates;
									for (var h = 0; h < p.length; h++) {
										var k = p[h];
										if (k.parent == "root") {
											$("#tp_linker_" + k.id).remove()
										}
									}
									b.model.updatePos(f, o)
								} else {
									if (e.action == "remove") {
										var m = e.content.content;
										var l = e.content.index;
										b.model.addMulti(m, l)
									} else {
										if (e.action == "create_line") {
											var d = e.content.content;
											b.connection.deleteConnectionMulti(d)
										} else {
											if (e.action == "delete_line") {
												var n = e.content.content;
												b.connection.saveConnectionMulti(n);
												for (var h = 0; h < n.length; h++) {
													var q = n[h];
													b.connection.createConnection(null, null, q)
												}
											} else {
												if (e.action == "update_line") {
													var j = e.content.original;
													b.connection.saveConnectionMulti(j);
													b.canvas.find(".connection_box[id=" + j.id + "]").remove();
													b.connection.createConnection(null, null, j);
													b.connection.showConnectionControl(j.id)
												} else {
													if (e.action == "update_structure") {
														var g = e.content.old;
														b.structure.switchStructure(g)
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			})
		},
		redo: function() {
			this.isCollaboration = false;
			var c = this.redoStack.pop();
			if (c == null) {
				return
			}
			this.doWithoutUndo(function() {
				b.messageSource.executeMessages(c)
			})
		},
		executeMessages: function(g) {
			for (var h = 0; h < g.length; h++) {
				var d = g[h];
				if (d.action == "create") {
					var k = d.content.content;
					var n = d.content.index;
					b.model.addMulti(k, n)
				} else {
					if (d.action == "update") {
						var q = d.content.updates;
						b.model.updateMulti(q)
					} else {
						if (d.action == "updateBg") {
							var l = d.content.newBg;
							b.events.push("backgroundChanged", l);
							b.model.updateBg(l)
						} else {
							if (d.action == "updatepos") {
								var q = d.content.updates,
									e = d.content.original,
									p = d.content.newIndex;
								for (var h = 0; h < e.length; h++) {
									var k = e[h];
									if (k.parent == "root") {
										$("#tp_linker_" + k.id).remove()
									}
								}
								b.model.updatePos(q, p)
							} else {
								if (d.action == "updatesort") {
									var q = d.content.updates,
										e = d.content.original,
										p = d.content.newIndex;
									for (var h = 0; h < e.length; h++) {
										var k = e[h];
										if (k.parent == "root") {
											$("#tp_linker_" + k.id).remove()
										}
									}
									b.model.updateSort(q, p)
								} else {
									if (d.action == "remove") {
										if (b.messageSource.isCollaboration == false) {
											b.utils.unselect()
										}
										var m = d.content.content;
										var n = d.content.index;
										b.model.removeMulti(m, n)
									} else {
										if (d.action == "create_line") {
											var c = d.content.content;
											b.connection.saveConnectionMulti(c);
											for (var h = 0; h < c.length; h++) {
												var r = c[h];
												b.connection.createConnection(null, null, r)
											}
										} else {
											if (d.action == "delete_line") {
												var o = d.content.content;
												b.connection.deleteConnectionMulti(o)
											} else {
												if (d.action == "update_line") {
													var j = d.content.updates;
													b.canvas.find(".connection_box[id=" + j.id + "]").remove();
													b.connection.saveConnectionMulti(j);
													b.connection.createConnection(null, null, j);
													b.connection.showConnectionControl(j.id)
												} else {
													if (d.action == "update_structure") {
														var f = d.content.structure;
														b.structure.switchStructure(f)
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		},
		doWithoutUndo: function(c) {
			this.isUndo = false;
			c();
			this.isUndo = true
		},
		doWithoutMessage: function(c) {
			this.withMessage = false;
			c();
			this.withMessage = true
		}
	};
	this.initialize = function(c) {
		this.config = $.extend(this.config, c);
		b.model.topicList.root = this.model.topic;
		b.model.persistenceList.root = this.utils.copy(this.model.topic);
		b.canvas = $("#canvas");
		if (b.config.readonly != true) {
			$(window).bind("resize.layout",
				function() {
					$("#canvas_container").height($(window).height() - (b.config.showHead == false ? 0 : 32))
				});
			$(window).bind("selectstart",
				function() {
					return false
				});
			$(window).trigger("resize.layout")
		}
		b.canvas.css({
			width: b.config.canvasWidth + "px",
			height: b.config.canvasHeight + "px"
		});
		if (b.config.readonly != true) {
			$("#canvas_container").scrollTop((b.config.canvasHeight - $("#canvas_container").height()) / 2 + 25);
			$("#canvas_container").scrollLeft((b.config.canvasWidth - $("#canvas_container").width()) / 2)
		}
		if (role == "viewer") {
			b.config.readonly = true
		}
		this.open(definition);
		this.op.bindBackground();
		if (b.config.readonly) {
			return
		}
		setTimeout(function() {
				b.utils.select(b.model.topic.id)
			},
			300);
		this.hotkey.init();
		this.contextMenu.init();
		b.canvas.bind("mousedown",
			function(j) {
				b.contextMenu.close();
				if (b.canvas.find(".connection_point").length > 0) {
					b.connection.unSelectConnection()
				}
				if (j.altKey) {
					var h = b.canvas.parent();
					var g = h.scrollTop();
					var f = h.scrollLeft();
					b.canvas.bind("mousemove.dragcanvas",
						function(m) {
							var l = m.pageX - j.pageX;
							var n = m.pageY - j.pageY;
							h.scrollLeft(f - l);
							h.scrollTop(g - n)
						});
					$(document).unbind("mouseup.drag_canvas").bind("mouseup.drag_canvas",
						function(l) {
							b.canvas.unbind("mousemove.dragcanvas")
						})
				} else {
					var k = $(j.target);
					var i = k.parents(".tp_box");
					if (i.length > 0) {
						return
					}
					var e = null;
					var d = b.utils.getRelativePos(j.pageX, j.pageY, b.canvas);
					b.canvas.bind("mousemove.multiselect",
						function(m) {
							if (e == null) {
								e = $("<div id='selecting_box'></div>").appendTo(b.canvas)
							}
							var l = b.utils.getRelativePos(m.pageX, m.pageY, b.canvas);
							var n = {
								left: l.x,
								top: l.y
							};
							if (l.x > d.x) {
								n.left = d.x
							}
							if (l.y > d.y) {
								n.top = d.y
							}
							n.width = Math.abs(l.x - d.x);
							n.height = Math.abs(l.y - d.y);
							e.css(n)
						});
					$(document).unbind("mouseup.multiselect").bind("mouseup.multiselect",
						function(n) {
							if (e != null) {
								var l = {
									x: e.offset().left,
									y: e.offset().top,
									w: e.width(),
									h: e.height()
								};
								var o = b.utils.getTopicsByRange(l);
								if (n.ctrlKey) {
									var m = b.utils.getSelected();
									b.utils.mergeArray(o, m)
								}
								b.utils.select(o);
								e.remove()
							}
							$(document).unbind("mouseup.multiselect");
							b.canvas.unbind("mousemove.multiselect")
						})
				}
			}).unbind("click").bind("click",
			function(e) {
				var f = $(e.target);
				var d = f.parents(".tp_box");
				if (d.length == 0) {
					b.utils.unselect()
				}
				if (b.model.brushStyles != null) {
					b.model.brushStyles = null;
					b.events.push("brushTopic")
				}
			}).off("mousemove.op").on("mousemove.op",
			function(f) {
				var g = b.utils.getRelativePos(f.pageX, f.pageY, b.canvas);
				var d = b.connection.getConnectionByPoint(g.x, g.y);
				if (d.inline > 0) {
					var e = d.lines[0];
					b.canvas.css("cursor", "pointer");
					b.connection.initConnectionClick(e.attr("id"));
					b.connection.isInLine = true
				} else {
					b.canvas.css("cursor", "default");
					b.canvas.off("mousedown.connection");
					b.connection.isInLine = false
				}
			})
	};
	this.initialize.apply(this, arguments, a)
};