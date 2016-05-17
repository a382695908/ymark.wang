var minX = null;
var maxX = null;
var minY = null;
var maxY = null;
$(function() {
	var e = {
		bgColor: "#fff",
		readonly: true
	};
	des = new Designer(e);
	$(".content_box").css("min-height", $(".right_box").height());
	var b = $("#view_container");
	if (document.getElementById("support_canvas").getContext) {
		$(".tp_box").addClass("readonly");
		var c = $("#canvas");
		c.find(".tp_container[style]").each(function() {
			var h = $(this);
			var i = h.position();
			var g = i.left + h.width();
			var f = i.top + h.height();
			if (minX == null || i.left < minX) {
				minX = i.left
			}
			if (maxX == null || g > maxX) {
				maxX = g
			}
			if (minY == null || i.top < minY) {
				minY = i.top
			}
			if (maxY == null || f > maxY) {
				maxY = f
			}
		});
		var a = maxX - minX;
		if (a < b.width()) {
			c.css("left", (b.width() - maxX - minX) / 2)
		} else {
			c.css("left", -minX)
		}
		var d = maxY - minY;
		if (d < b.height()) {
			c.css("top", (b.height() - maxY - minY) / 2)
		} else {
			c.css("top", -minY + 50)
		}
	}
	initChartOperate();
	if (!document.getElementById("support_canvas").getContext) {
		$("#canvas").empty().append("<img src='/chart_image/id/" + chartId + ".png'/>");
		$(".op_zoom").hide()
	}
});

function initChartOperate() {
	$("#view_container").css({
		height: $(window).height() - $("#viewbar").outerHeight() - 42
	});
	var a = $(window).width();
	e();
	$(window).on("resize.view",
		function() {
			e()
		});

	function e() {
		if (a <= 1024) {
			if ($(".right_box").is(":visible")) {
				$(".right_box").hide();
				$(".left_box").css("margin-right", "0px")
			}
		} else {
			if (!$(".right_box").is(":visible")) {
				$(".right_box").show();
				$(".left_box").css("margin-right", "360px")
			}
		}
	}
	$("#view_container").on("touchstart",
		function(h) {
			var k = h.originalEvent.changedTouches[0];
			var j = k.pageX;
			var f = k.pageY;
			$("#view_container").css("cursor", "move");
			var i = $("#canvas").position().left / c;
			var g = $("#canvas").position().top / c;
			$("#view_container").on("touchmove",
				function(n) {
					var m = n.originalEvent.changedTouches[0];
					var l = m.pageX - j;
					var o = m.pageY - f;
					n.preventDefault();
					$("#canvas").css({
						left: i + l / c + "px",
						top: g + o / c + "px"
					})
				});
			$("#view_container").on("touchend",
				function(l) {
					$("#view_container").off("touchmove");
					$("#view_container").off("touchend");
					$("#view_container").css("cursor", "default")
				})
		});
	var c = 1;
	$("#view_container").bind("dragstart",
		function() {
			return false
		});
	$("#view_container").mousedown(function(g) {
		var j = g.pageX;
		var f = g.pageY;
		$("#view_container").css("cursor", "move");
		var i = $("#canvas").position().left / c;
		var h = $("#canvas").position().top / c;
		$(document).bind("mousemove.drag",
			function(l) {
				var k = (l.pageX - j);
				var m = (l.pageY - f);
				$("#canvas").css({
					left: (i + k / c) + "px",
					top: (h + m / c) + "px"
				})
			});
		$(document).mouseup(function(k) {
			$(document).unbind("mousemove.drag");
			$(document).unbind("mouseup");
			$("#view_container").css("cursor", "default")
		})
	});
	var b = $("#view_container")[0];
	var d = b.requestFullScreen || b.webkitRequestFullScreen || b.mozRequestFullScreen || b.msRequestFullScreen;
	if (d) {
		$("#view_container").unbind("webkitfullscreenchange").bind("webkitfullscreenchange",
			function(f) {
				toogleFullDocument()
			});
		$(document).unbind("mozfullscreenchange").unbind("fullscreenchange").bind("mozfullscreenchange",
			function(f) {
				toogleFullDocument()
			}).bind("fullscreenchange",
			function(f) {
				toogleFullDocument()
			});
		$("#op_fullscreen").bind("click",
			function(f) {
				d.call(b)
			});
		$(window).bind("keydown",
			function(f) {
				if (f.keyCode == 122) {
					d.call(b);
					f.preventDefault()
				}
			})
	} else {
		$("#op_fullscreen").bind("click",
			function(f) {
				toogleFullDocument(false)
			});
		$(window).bind("keydown",
			function(f) {
				if (f.keyCode == 122) {
					toogleFullDocument()
				}
			})
	}
	$("#op_zoomin").bind("click",
		function() {
			if (c >= 1.5) {
				return
			}
			c += 0.1;
			$("#canvas").css({
				"-webkit-transform": "scale(" + c + ")",
				"-ms-transform": "scale(" + c + ")",
				"-moz-transform": "scale(" + c + ")",
				"-o-transform": "scale(" + c + ")",
				transform: "scale(" + c + ")"
			})
		});
	$("#op_zoomout").bind("click",
		function() {
			if (c <= 0.5) {
				return
			}
			c -= 0.1;
			$("#canvas").css({
				"-webkit-transform": "scale(" + c + ")",
				"-ms-transform": "scale(" + c + ")",
				"-moz-transform": "scale(" + c + ")",
				"-o-transform": "scale(" + c + ")",
				transform: "scale(" + c + ")"
			})
		})
}

function newCreateConfirm(a) {
	Util.checkPrivateFileCount(function() {
		location = "/diagraming/new?template=" + a + "&category=mind"
	})
}

function viewTip(b, a, c) {
	$(".view_tip").html(b).css({
		left: a,
		top: c
	});
	$(".view_tip").fadeIn(300);
	setTimeout(function() {
			$(".view_tip").animate({
					top: c - 50,
					opacity: 0
				},
				400,
				function() {
					$(".view_tip").css("opacity", 1).hide()
				})
		},
		3000)
}

function replaceFace(b) {
	var a = b.find(".ico-face");
	a.each(function(c, d) {
		if ($(d).is("img")) {
			$(d).replaceWith($("<img class='" + $(d).attr("class") + "' src='" + $(d).attr("src") + "'>"))
		}
	})
}

function replaceDIV(c) {
	var a = c.find("div, p");
	a.each(function(d, e) {
		if ($(this).html().replace(/\s+|<br>/g, "") != "") {
			$(e).replaceWith(":br:" + $(e).html())
		} else {
			$(e).remove()
		}
	});
	var b = c.html().replace(/<br>/g, ":br:");
	c.html(b);
	a = c.find("div, p");
	if (a.length > 0) {
		Stream.replaceDIV(c)
	}
}


function showLikedUsers() {
	Util.ajax({
		url: "/view/getlikedusers",
		data: {
			chartId: chartId
		},
		success: function(c) {
			$(".rate_users_list").empty();
			if (c.count > 0) {
				for (var b = 0; b < c.users.length; b++) {
					var a = c.users[b];
					$(".rate_users_list").append("<a href='/u/" + a.userName + "/profile'><img src='" + a.bgImg + "' class='user_quickinfo' userid='" + a.userId + "'></a>")
				}
				if (c.count > c.users.length) {
					$(".rate_users_list").append("<span>...</span>")
				}
				$(".rate_users_list").append("<div style='clear:both'></div>");
				$(".rate_users").show()
			} else {
				$(".rate_users").hide()
			}
			$(".like_btn_label").text(c.count);
			$(".rate_num").text(c.count)
		}
	})
}

function doLikeChart(a) {
	Util.ajax({
		url: "/view/dolike",
		data: {
			chartId: chartId
		},
		success: function(b) {
			if (b.result) {
				$(a).attr("title", "取消赞");
				$(a).children().addClass("ac")
			} else {
				$(a).attr("title", "赞一下");
				$(a).children().removeClass("ac")
			}
			showLikedUsers()
		}
	})
}

function showWeixin(c) {
	var b = $(c).offset().left;
	var a = $(c).offset().top;
	$("#pageurl_div").css({
		left: b,
		top: a - $("#pageurl_div").outerHeight() - 6
	}).show();
	$(document).on("mousedown",
		function() {
			$("#pageurl_div").hide()
		})
};