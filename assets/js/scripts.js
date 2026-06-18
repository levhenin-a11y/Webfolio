$(document).ready(function() {
	
	/*============================================
	Page Preloader
	==============================================*/
	
	$(window).load(function(){
		$('#page-loader').fadeOut(500,function(){
			loadGmap();
		});
		
	})	
	
	/*============================================
	Header
	==============================================*/

	function syncHomeMinHeight() {
		var viewportWidth = $(window).width();
		var minHeight = ($(window).height()+50) + 'px';

		if (viewportWidth <= 767) {
			minHeight = 'auto';
		} else if (viewportWidth <= 1099) {
			minHeight = Math.max(Math.round($(window).height() * 0.72), 620) + 'px';
		}

		$('#home').css({
			'height': 'auto',
			'min-height': minHeight
		});
	}

	function syncHomeTopSpacing() {
		var viewportWidth = $(window).width();
		var navHeight = $('#main-nav').outerHeight() || 0;
		var extraOffset = 26;

		if (viewportWidth <= 767) {
			extraOffset = 6;
		} else if (viewportWidth <= 1099) {
			extraOffset = 12;
		} else if (viewportWidth <= 1355 && viewportWidth >= 1115) {
			extraOffset = 6;
		}

		$('#home').css({
			'padding-top': (navHeight + extraOffset) + 'px'
		});
	}

	syncHomeMinHeight();
	syncHomeTopSpacing();
	
	$.backstretch('assets/images/header-bg-test4.jpg');
	
	$(window).scroll( function() {
		var st = $(this).scrollTop(),
			wh = $(window).height();
		var heroOpacity = Math.max(0, 1.4 - st/400);
		var postsOpacity = Math.min(1, Math.max(0.4, 1.08 - st/1400));
		
		$('#home > .container.text-center, #home > .container_park').css({ 'opacity' : heroOpacity });
		$('#home > .facebook-posts-panel-header').css({ 'opacity' : postsOpacity });
		
		if($(window).scrollTop() > ($(window).height()+50)){
			$('.backstretch').hide();
		}else{
			$('.backstretch').show();
		}
		
	});
	
	var st = $(this).scrollTop();
	var heroOpacity = Math.max(0, 1.4 - st/400);
	var postsOpacity = Math.min(1, Math.max(0.4, 1.08 - st/1400));

	$('#home > .container.text-center, #home > .container_park').css({ 'opacity' : heroOpacity });
	$('#home > .facebook-posts-panel-header').css({ 'opacity' : postsOpacity });

	
	/*============================================
	Navigation Functions
	==============================================*/
	if ($(window).scrollTop()< ($(window).height()-50)){
		$('#main-nav').removeClass('scrolled');
	}
	else{
		$('#main-nav').addClass('scrolled');    
	}

	$(window).scroll(function(){
		if ($(window).scrollTop()< ($(window).height()-50)){
			$('#main-nav').removeClass('scrolled');
		}
		else{
			$('#main-nav').addClass('scrolled');    
		}

		syncHomeTopSpacing();
	});

	var $siteNav = $('#site-nav');
	var $mainNavToggle = $('.navbar-toggle[data-target="#site-nav"]');
	var $languageToggles = $('#main-nav .dropdown-toggle');
	var navSmartTimer = null;
	var SMART_NAV_MIN = 768;
	var SMART_NAV_MAX = 1099;

	function syncMainNavToggleState() {
		var isExpanded = $siteNav.hasClass('in');
		$mainNavToggle.attr('aria-expanded', isExpanded ? 'true' : 'false');
	}

	function shouldForceCollapsedNav() {
		var viewportWidth = $(window).width();
		if (viewportWidth < SMART_NAV_MIN || viewportWidth > SMART_NAV_MAX) {
			return false;
		}

		var $items = $siteNav.find('> ul.navbar-nav > li:visible').not('.sr-only');
		if (!$items.length) {
			return false;
		}

		var firstTop = null;
		var wraps = false;

		$items.each(function(){
			var top = Math.round($(this).position().top);
			if (firstTop === null) {
				firstTop = top;
			} else if (Math.abs(top - firstTop) > 2) {
				wraps = true;
				return false;
			}
		});

		var navList = $siteNav.find('> ul.navbar-nav').get(0);
		var overflows = navList ? (navList.scrollWidth > navList.clientWidth + 2) : false;

		return wraps || overflows;
	}

	function applySmartNavBreakpoint() {
		var viewportWidth = $(window).width();
		var isNativeMobile = viewportWidth < SMART_NAV_MIN;
		var isWideDesktop = viewportWidth > SMART_NAV_MAX;

		if (isNativeMobile || isWideDesktop) {
			$('#main-nav').removeClass('nav-force-collapsed');
			$siteNav.removeClass('in');
			syncMainNavToggleState();
			syncHomeTopSpacing();
			return;
		}

		var hadForceClass = $('#main-nav').hasClass('nav-force-collapsed');
		$('#main-nav').removeClass('nav-force-collapsed');
		$siteNav.addClass('in');

		var mustCollapse = shouldForceCollapsedNav();

		if (mustCollapse) {
			$('#main-nav').addClass('nav-force-collapsed');
			$siteNav.removeClass('in');
		} else if (!hadForceClass) {
			$siteNav.removeClass('in');
		}

		syncMainNavToggleState();
		syncHomeTopSpacing();
	}

	syncMainNavToggleState();
	applySmartNavBreakpoint();

	$(window).on('resize orientationchange', function(){
		clearTimeout(navSmartTimer);
		navSmartTimer = setTimeout(function(){
			syncHomeMinHeight();
			applySmartNavBreakpoint();
		}, 120);
	});

	$(window).on('load', function(){
		applySmartNavBreakpoint();
	});

	$siteNav.on('shown.bs.collapse hidden.bs.collapse', function(){
		syncMainNavToggleState();
		syncHomeTopSpacing();
	});

	$mainNavToggle.on('keydown', function(e){
		if (e.key === 'Escape') {
			if ($siteNav.hasClass('in')) {
				$siteNav.collapse('hide');
			}
			$(this).focus();
		}
	});

	$siteNav.on('keydown', function(e){
		if (e.key === 'Escape' && $siteNav.hasClass('in')) {
			$siteNav.collapse('hide');
			$mainNavToggle.first().focus();
		}
	});

	$languageToggles.on('keydown', function(e){
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			$(this).trigger('click');
		}

		if (e.key === 'ArrowDown') {
			e.preventDefault();
			$(this).trigger('click');
			$(this).closest('li').find('.dropdown-item:visible').first().focus();
		}

		if (e.key === 'Escape') {
			e.preventDefault();
			$(this).closest('li').removeClass('open');
			$(this).attr('aria-expanded', 'false');
		}
	});

	$languageToggles.on('click', function(){
		var $toggle = $(this);
		setTimeout(function(){
			var isOpen = $toggle.closest('li').hasClass('open') || $toggle.attr('aria-expanded') === 'true';
			$toggle.attr('aria-expanded', isOpen ? 'true' : 'false');
		}, 0);
	});

	$('#main-nav .dropdown-item').on('keydown', function(e){
		if (e.key === 'Escape') {
			e.preventDefault();
			var $toggle = $(this).closest('li').find('.dropdown-toggle').first();
			$toggle.closest('li').removeClass('open');
			$toggle.attr('aria-expanded', 'false').focus();
		}
	});
	
	/*============================================
	ScrollTo Links
	==============================================*/
	$('a.scrollto').click(function(e){
		var navHeight = $('#main-nav').outerHeight() || 0;
		var anchorGap = navHeight + 5;

		$('html,body').scrollTo(this.hash, this.hash, {gap:{y:-anchorGap}});
		e.preventDefault();

		if ($('.navbar-collapse').hasClass('in')){
			$('.navbar-collapse').removeClass('in').addClass('collapse');
		}
	});

	/*============================================
	Skills
	==============================================*/
	$('.skills-item').each(function(){
		var perc = $(this).find('.percent').data('percent');

		$(this).data('height',perc);
	})
	
	$('.touch .skills-item').each(function(){
		$(this).css({'height':$(this).data('height')+'%'});
	})
	
	$('.touch .skills-bars').css({'opacity':1});
		
	/*============================================
	Project thumbs - Masonry
	==============================================*/
	$(window).load(function(){

		$('#projects-container').css({visibility:'visible'});

		$('#projects-container').masonry({
			itemSelector: '.project-item:not(.filtered)',
			//columnWidth:370,
			isFitWidth: true,
			isResizable: true,
			isAnimated: !Modernizr.csstransitions,
			gutterWidth: 25
		});

		scrollSpyRefresh();
		waypointsRefresh();
		
	});
	
	/*============================================
	Filter Projects
	==============================================*/
	$(document).on('click', '#filter-works a', function(e){
		e.preventDefault();
		
		if($('#project-preview').hasClass('open')){
			closeProject();
		}
		
		$('#filter-works li').removeClass('active');
		$(this).parent('li').addClass('active');

		var category = $(this).attr('data-filter');

		$('.project-item').each(function(){
			if($(this).is(category)){
				$(this).removeClass('filtered');
			}
			else{
				$(this).addClass('filtered');
			}
		});

		$('#projects-container').masonry('reload');

		scrollSpyRefresh();
		waypointsRefresh();
	});
	
	/*============================================
	Project Preview
	==============================================*/
	var $projectPreview = $('#project-preview');
	var $projectPreviewHost = $projectPreview.parent();

	$(document).on('click', '.project-item', function(e){
		e.preventDefault();

		var elem = $(this),
			title = elem.find('.project-title').text(),
			descr = elem.find('.project-description').html(),
			slidesHtml = '<ul class="slides">',
			elemDataCont = elem.find('.project-description'),
			imagesData = elemDataCont.data('images'),
			videosData = elemDataCont.data('videos'),
			slides = imagesData ? String(imagesData).split(',') : [],
			videos = videosData ? String(videosData).split(',') : [];

		for (var i = 0; i < slides.length; ++i) {
			var imageSrc = $.trim(slides[i]);

			if (!imageSrc) {
				continue;
			}

			slidesHtml = slidesHtml + '<li><img src="' + encodeURI(imageSrc) + '" alt=""></li>';
		}

		for (var j = 0; j < videos.length; ++j) {
			var videoSrc = $.trim(videos[j]);

			if (!videoSrc) {
				continue;
			}

			slidesHtml = slidesHtml + '<li><video class="project-slide-video" controls preload="metadata" playsinline><source src="' + encodeURI(videoSrc) + '" type="video/mp4">Your browser does not support the video tag.</video></li>';
		}
		
		slidesHtml = slidesHtml + '</ul>';
		
		$('#project-title').text(title);
		$('#project-content').html(descr);
		$('#project-slider').html(slidesHtml);
		
		openProject(0);
		
	});

	$(document).on('click', '.about-photos__grid img', function(e){
		e.preventDefault();

		var $grid = $(this).closest('.about-photos__grid');
		var $images = $grid.find('img');

		if (!$images.length) {
			return;
		}

		var slidesHtml = '<ul class="slides">';
		$images.each(function(){
			var src = $(this).attr('src');
			slidesHtml = slidesHtml + '<li><img src="' + encodeURI(src) + '" alt=""></li>';
		});
		slidesHtml = slidesHtml + '</ul>';

		$('#project-title').text('Biography photos');
		$('#project-content').html('');
		$('#project-slider').html(slidesHtml);

		openProject($images.index($(this)));
	});

	function bindPreviewVideoInteractions() {
		$('#project-slider').find('.project-slide-video').each(function(){
			var videoElement = this;

			if (videoElement._previewVideoInteractionBound) {
				return;
			}

			videoElement._previewVideoInteractionBound = true;
			videoElement._lastTouchToggleAt = 0;
			videoElement.style.touchAction = 'manipulation';

			var stopSliderGesture = function(event) {
				event.stopPropagation();
			};

			var activateVideo = function(event) {
				var isTouchLike = event.type === 'touchend' || event.type === 'MSPointerUp' || (event.type === 'pointerup' && event.pointerType !== 'mouse');

				if (!isTouchLike && Date.now() - videoElement._lastTouchToggleAt < 500) {
					return;
				}

				event.preventDefault();
				event.stopPropagation();

				if (isTouchLike) {
					videoElement._lastTouchToggleAt = Date.now();
				}

				togglePreviewVideoPlayback(videoElement);
			};

			videoElement.addEventListener('touchstart', stopSliderGesture, false);
			videoElement.addEventListener('touchmove', stopSliderGesture, false);
			videoElement.addEventListener('touchend', activateVideo, false);
			videoElement.addEventListener('pointerdown', stopSliderGesture, false);
			videoElement.addEventListener('pointerup', activateVideo, false);
			videoElement.addEventListener('MSPointerDown', stopSliderGesture, false);
			videoElement.addEventListener('MSPointerUp', activateVideo, false);
			videoElement.addEventListener('click', activateVideo, false);
		});
	}

	function openProject(startAt){
		var slideIndex = typeof startAt === 'number' ? startAt : 0;
		var hasVideoSlides = $('#project-slider').find('video').length > 0;
		bindPreviewVideoInteractions();
		
		if (!$projectPreview.parent().is('body')) {
			$projectPreview.appendTo('body');
		}

		$projectPreview.addClass('open');
		$('body').addClass('project-preview-open');
		$projectPreview.show().animate({'opacity':1},220);

		$('#project-slider').flexslider({
			prevText: '<i class="fa fa-angle-left"></i>',
			nextText: '<i class="fa fa-angle-right"></i>',
			animation: 'slide',
			video: hasVideoSlides,
			startAt: slideIndex,
			directionNav: true,
			slideshowSpeed: 3000,
			useCSS: true,
			touch: true,
			keyboard: true,
			controlNav: true, 
			pauseOnAction: false, 
			pauseOnHover: true,
			smoothHeight: false,
			start: function(){
				bindPreviewVideoInteractions();
				$(window).trigger('resize');
			}
		});
		
	}
	
	function closeProject(){
	
		$projectPreview.removeClass('open');
		$projectPreview.animate({'opacity':0},220, function(){
			$projectPreview.hide();
			if (!$projectPreview.parent().is($projectPreviewHost)) {
				$projectPreview.appendTo($projectPreviewHost);
			}
		});

		if($('#project-slider').hasClass('flexslider')){
			$('#project-slider').flexslider('destroy');
		}

		$('body').removeClass('project-preview-open');

		setTimeout(function(){
			$('#projects-container').masonry('reload');
		},260)
	}
	
	$('.close-preview').click(function(){
		closeProject();
	})

	function togglePreviewVideoPlayback(videoElement) {
		if (!videoElement) {
			return;
		}

		if (videoElement.paused) {
			var playPromise = videoElement.play();
			if (playPromise && typeof playPromise.catch === 'function') {
				playPromise.catch(function(){});
			}
		} else {
			videoElement.pause();
		}
	}

	$projectPreview.on('click', function(e){
		if (e.target === this && $(this).hasClass('open')) {
			closeProject();
		}
	});

	$(document).on('keydown', function(e){
		if (e.key === 'Escape' && $('#project-preview').hasClass('open')) {
			closeProject();
		}
	});
	
	/*============================================
	Twitter
	==============================================*/
	var tweetsLength = $('#twitter-slider').data('tweets-length'),
		widgetID = $('#twitter-slider').data('widget-id');
	
	twitterFetcher.fetch(widgetID, 'twitter-slider', tweetsLength, true, false, true, '', false, handleTweets);

	function handleTweets(tweets){
	
		var x = tweets.length,
			n = 0,
			tweetsHtml = '<ul class="slides">';
			
		while(n < x) {
			tweetsHtml += '<li>' + tweets[n] + '</li>';
			n++;
		}
		
		tweetsHtml += '</ul>';
		$('#twitter-slider').html(tweetsHtml);
	
		$('.twitter_reply_icon').html("<i class='fa fa-reply'></i>");
		$('.twitter_retweet_icon').html("<i class='fa fa-retweet'></i>");
		$('.twitter_fav_icon').html("<i class='fa fa-star'></i>");
	  
		$('#twitter-slider').flexslider({
			prevText: '<i class="fa fa-angle-left"></i>',
			nextText: '<i class="fa fa-angle-right"></i>',
			slideshowSpeed: 5000,
			useCSS: true,
			controlNav: false, 
			pauseOnAction: false, 
			pauseOnHover: true,
			smoothHeight: false
		});
	}
	/*============================================
	Contact Map
	==============================================*/
	function loadGmap(){
	
	if($('#gmap').length){
	
		var map;
		var mapstyles = [ { "stylers": [ { "saturation": -100 } ] } ];
		
		var infoWindow = new google.maps.InfoWindow;
		
		var pointLatLng = new google.maps.LatLng(mapPoint.lat, mapPoint.lng);

		var mapOptions = {
			zoom: mapPoint.zoom,
			center: pointLatLng,
			zoomControl : true,
			panControl : false,
			streetViewControl : false,
			mapTypeControl: false,
			overviewMapControl: false,
			scrollwheel: false,
			styles: mapstyles
		}
		
		map = new google.maps.Map(document.getElementById("gmap"), mapOptions);
		
		var marker = new google.maps.Marker({
			position: pointLatLng, 
			map: map, 
			title:mapPoint.linkText,
			icon: mapPoint.icon
		});
		
		var mapLink = 'https://www.google.com/maps/preview?ll='+mapPoint.lat+','+mapPoint.lng+'&z=14&q='+mapPoint.mapAddress;
		
		var html = '<div class="infowin">'
				+ mapPoint.infoText
				+ '<a href="'+mapLink+'" target="_blank">'+mapPoint.linkText+'</a>'
				+ '</div>';

		google.maps.event.addListener(marker, 'mouseover', function() {
			infoWindow.setContent(html);
			infoWindow.open(map, marker);
		});

		google.maps.event.addListener(marker, 'click', function() {
			window.open(mapLink,'_blank');
		});
		
	}
	}
	/*============================================
	Waypoints Animations
	==============================================*/
	$('#skills').waypoint(function(){
	
		$('.skills-item').each(function(){
			$(this).css({'height':$(this).data('height')+'%'});
		})
		
		$('.skills-bars').css({'opacity':1});
		
	},{offset:'40%'});
	
	$('.scrollimation').waypoint(function(){
		$(this).addClass('in');
	},{offset:'90%'});
	
	/*============================================
	Resize Functions
	==============================================*/
	var thumbSize = $('.project-item').width();
	
	$(window).resize(function(){
		syncHomeMinHeight();
		
		if($('.project-item').width() != thumbSize){
		
			$('#projects-container').masonry('reload');
			thumbSize = $('.project-item').width();
		}
		
		scrollSpyRefresh();
		waypointsRefresh();
	});
	
	/*============================================
	Refresh scrollSpy function
	==============================================*/
	function scrollSpyRefresh(){
		setTimeout(function(){
			$('body').scrollspy('refresh');
		},1000);
	}
	
	/*============================================
	Refresh waypoints function
	==============================================*/
	function waypointsRefresh(){
		setTimeout(function(){
			$.waypoints('refresh');
		},1000);
	}
});