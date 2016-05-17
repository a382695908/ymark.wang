/*
	Strata by HTML5 UP
	html5up.net | @n33co
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

(function($) {

	var settings = {
		// Parallax background effect?
		parallax: true,
		// Parallax factor (lower = more intense, higher = less intense).
		parallaxFactor: 20

	};

	skel.init({
		reset: 'full',
		containers: '100%',
		breakpoints: {
			global: {
				href: '/static/course/css/style.css',
				grid: {
					gutters: ['2.5em', 0]
				}
			},
			xlarge: {
				media: '(max-width: 1800px)',
				href: '/static/course/css/style-xlarge.css'
			},
			large: {
				media: '(max-width: 1280px)',
				href: '/static/course/css/style-large.css',
				grid: {
					gutters: ['2em', 0]
				}
			},
			medium: {
				media: '(max-width: 980px)',
				href: '/static/course/css/style-medium.css'
			},
			small: {
				media: '(max-width: 736px)',
				href: '/static/course/css/style-small.css',
				grid: {
					gutters: ['1.5em', 0],
					zoom: 2
				},
				viewport: {
					scalable: false
				}
			},
			xsmall: {
				media: '(max-width: 480px)',
				href: '/static/course/css/style-xsmall.css',
				grid: {
					zoom: 3
				}
			}
		}
	});

	$(function() {
		var $window = $(window),
			$body = $('body'),
			$header = $('#header');

		// Disable animations/transitions until the page has loaded.
		$body.addClass('is-loading');

		$window.on('load', function() {
			$body.removeClass('is-loading');
		});

		// Touch?
		if (skel.vars.isMobile) {
			$body.addClass('is-touch'); // Turn on touch mode.
			window.setTimeout(function() { // Height fix (mostly for iOS).
				$window.scrollTop($window.scrollTop() + 1);
			}, 0);
		}

		// Forms (IE<10).
		if (skel.vars.IEVersion < 10) {
			var $form = $('form');
			if ($form.length > 0) {
				$.fn.n33_formerize = function() {
					var _fakes = new Array(),
						_form = $(this);
					_form.find('input[type=text],textarea').each(function() {
						var e = $(this);
						if (e.val() == '' || e.val() == e.attr('placeholder')) {
							e.addClass('formerize-placeholder');
							e.val(e.attr('placeholder'));
						}
					}).blur(function() {
						var e = $(this);
						if (e.attr('name').match(/_fakeformerizefield$/)) return;
						if (e.val() == '') {
							e.addClass('formerize-placeholder');
							e.val(e.attr('placeholder'));
						}
					}).focus(function() {
						var e = $(this);
						if (e.attr('name').match(/_fakeformerizefield$/)) return;
						if (e.val() == e.attr('placeholder')) {
							e.removeClass('formerize-placeholder');
							e.val('');
						}
					});
					_form.find('input[type=password]').each(function() {
						var e = $(this);
						var x = $($('<div>').append(e.clone()).remove().html().replace(/type="password"/i, 'type="text"').replace(/type=password/i, 'type=text'));
						if (e.attr('id') != '') x.attr('id', e.attr('id') + '_fakeformerizefield');
						if (e.attr('name') != '') x.attr('name', e.attr('name') + '_fakeformerizefield');
						x.addClass('formerize-placeholder').val(x.attr('placeholder')).insertAfter(e);
						if (e.val() == '') e.hide();
						else x.hide();
						e.blur(function(event) {
							event.preventDefault();
							var e = $(this);
							var x = e.parent().find('input[name=' + e.attr('name') + '_fakeformerizefield]');
							if (e.val() == '') {
								e.hide();
								x.show();
							}
						});
						x.focus(function(event) {
							event.preventDefault();
							var x = $(this);
							var e = x.parent().find('input[name=' + x.attr('name').replace('_fakeformerizefield', '') + ']');
							x.hide();
							e.show().focus();
						});
						x.keypress(function(event) {
							event.preventDefault();
							x.val('');
						});
					});
					_form.submit(function() {
						$(this).find('input[type=text],input[type=password],textarea').each(function(event) {
							var e = $(this);
							if (e.attr('name').match(/_fakeformerizefield$/)) e.attr('name', '');
							if (e.val() == e.attr('placeholder')) {
								e.removeClass('formerize-placeholder');
								e.val('');
							}
						});
					}).bind("reset", function(event) {
						event.preventDefault();
						$(this).find('select').val($('option:first').val());
						$(this).find('input,textarea').each(function() {
							var e = $(this);
							var x;
							e.removeClass('formerize-placeholder');
							switch (this.type) {
								case 'submit':
								case 'reset':
									break;
								case 'password':
									e.val(e.attr('defaultValue'));
									x = e.parent().find('input[name=' + e.attr('name') + '_fakeformerizefield]');
									if (e.val() == '') {
										e.hide();
										x.show();
									} else {
										e.show();
										x.hide();
									}
									break;
								case 'checkbox':
								case 'radio':
									e.attr('checked', e.attr('defaultValue'));
									break;
								case 'text':
								case 'textarea':
									e.val(e.attr('defaultValue'));
									if (e.val() == '') {
										e.addClass('formerize-placeholder');
										e.val(e.attr('placeholder'));
									}
									break;
								default:
									e.val(e.attr('defaultValue'));
									break;
							}
						});
						window.setTimeout(function() {
							for (x in _fakes) _fakes[x].trigger('formerize_sync');
						}, 10);
					});
					return _form;
				};
				$form.n33_formerize();
			}
		}
	});
	console.log('hsow');
	$('body').show();
})(jQuery);

function noImg() {
	var img = event.srcElement;
	img.src = "/static/course/images/thumbs/03.jpg";
	img.onerror = null; //控制不要一直跳动
}