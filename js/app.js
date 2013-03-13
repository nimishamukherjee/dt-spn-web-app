!function($) {
	$(function() {
		  // fix sub nav on scroll
		  var $win = $(window), $nav = $('.subnav'), navTop = $('.subnav').length
			  && $('.subnav').offset().top - 40, isFixed = 0;
		  processScroll();
		  $nav.on('click', function() {
					  if (!isFixed)
					  setTimeout(function() {
									 $win.scrollTop($win.scrollTop() - 47);
								 }, 10);
				  });
		  $win.on('scroll', processScroll);
		  function processScroll() {
			  var scrollTop = $win.scrollTop();
			  if (scrollTop >= navTop && !isFixed) {
				  isFixed = 1;
				  $nav.addClass('subnav-fixed');
			  } else if (scrollTop <= navTop && isFixed) {
				  isFixed = 0;
				  $nav.removeClass('subnav-fixed');
			  }
		  }

		  //var isAdmin = (getCookie("admin") == "true")?true:false; - RESET THIS
		  	var isAdmin = true;
			var prevMainDom = $("#rac");
			var prevSubDom = $("#serverkeysadmin");
		  // //////////////////////////////////////////
		  // OS detection & download control logic
		  var download = {
			  prefix: 'data/',//RESET THIS
			  os: $.client.OS,
			  version: "",
			  data: null
		  };
		  var downloadEvent = function (e) {
			  e.preventDefault();
			  if ($(this).hasClass('os')) {
			  	$('.activeicon').removeClass('activeicon');
				$(this).addClass('activeicon')
				download.os = $(this).attr('title');
				download.version = '';
			  }
			  if ($(this).hasClass('version')) {
				  download.version = $(this).text();				  
				  $.each(download.data[download.os], function (i,pkg) {
					if (pkg.version == download.version) {
						window.location.href = download.prefix + pkg.url;
						return;
					}
				});
			  }
			  $('#select-version').trigger('check');
		  };
		   
		  $('#select-version')
		  .on ('check', function (e) {
				   // check if we have download.data initialized
				   if (download.data == null) {
					   $.ajax({
								  url: download.prefix + 'manifest.json',
								  dataType: 'json',
								  success:function(data) {
									  if (!data && !data.user) {
										  return;
									  }

									  download.data = data.user;

									  if (isAdmin) {
									  	//enable the admin panel
									  	$('#admin-panel').removeClass('hide')
										  $.each(data.admin, function (os, list) {
													 $.each(list, function (key, entry) {
																download.data[os].push(entry);
															});
												 });
									  }
									  $('#select-version').trigger('check');
				 				  },
				 				  error:function(e){
									  // TODO - show some meaningful error message...
									  // console.log(e);
								  }
							  });
					   return;
				   }

				   if (download.os.match(/Windows|Mac|Linux/)) {
				   		$('#select-version').removeClass('hide');
				   		$("#activate-iphone").addClass('hide');
					   if (!download.version) 
					   {
							// need to re-populate available versions for this
							// OS selection
						   	$('#select-version #client ul').empty();
						   	$('#select-version #server ul').empty();
						   	$.each(download.data[download.os], function (i,pkg) {
						   		if(pkg.version.indexOf("Server")>=0){						   			
						   			$('#select-version #server ul')
									.append($('<li class=\"btn\">')
									.append($('<a>').attr('href','#').addClass('version').html(pkg.version).on('click', downloadEvent)));
						   		}else{
						 			$('#select-version #client ul')
									.append($('<li class=\"btn\">')
									.append($('<a>').attr('href','#').addClass('version').html(pkg.version).on('click', downloadEvent)));
								}
							});
							if($('#select-version #server ul li').length>0){
								$('#select-version #server').removeClass("hide")
							}else{
								$('#select-version #server').addClass("hide")	
							}
					   }
					   // if only ONE choice available, do not allow version
						// selection...
					   if (download.data[download.os].length == 1) {
						   download.version = download.data[download.os][0].version;
						   $('#select-version a').addClass('disabled');
					   } else {
						   $('#select-version a').removeClass('disabled');
					   }
					   if (download.version) 
					   {
						   $('#select-os [data-localize="select.os"]').hide();
						   $('#select-os .selected-os').text(download.os);

						   $('#select-version [data-localize="select.version"]').hide();
						   $('#select-version .selected-version').text(download.version);

						   $(this).removeAttr('disabled').focus();
					   } else 
					   {
						   $('#select-os [data-localize="select.os"]').hide();
						   $('#select-os .selected-os').text(download.os);

						   $('#select-version .selected-version').text('');
						   $('#select-version [data-localize="select.version"]').show();

						   $(this).attr('disabled','disabled');
						   $('#select-version a').focus();
					   }
				   } else {
				   		if(download.os=="iphone"){
				   			$('#select-version').addClass('hide');
				   			$("#activate-iphone").removeClass('hide');
				   		}
					   $(this).attr('disabled','disabled');
					   $('#select-os a').focus();
				   }
			   }).trigger('check');

		  $('#download a').on('click', downloadEvent);
		  $('#download').on('click', downloadEvent);

		  // //////////////////////////////////////////
		  // Session detection & VPNRAC connection control logic
		  var errorMsg  = $.url().param('error');
		  var sessionId = getCookie("sessionId");

		  $('#peers').hide()
		  .on('update', function (e, data) {
				  $('#peers ul').empty();
				  if (data && data.length == 0) {
					  var $item = $("<li>").attr("data-localize","vpnrac.nopeers").data("localize", "vpnrac.nopeers").localize("phrases", {pathPrefix : 'i18n', language : $.currentLanguage});
					  $('#peers ul').append($item);
				  } else {
					  $.each(data, function (x,item) {
								 $('#peers ul').append($("<li>").append($("<a>").attr("href", item.connectionString).html(item.name)));
							 });
				  }
			  });

		  var vpnrac = $.vpnrac(getCookie("sessionId"));

		  $(vpnrac)
		  .on('change', function (e, status, data) {
			  switch (status) {
				  case 'connected':
				  //$('#vpnrac-connect').button('reset');
				  $('#vpnrac-connect-message[data-localize]').data("localize", "vpnrac-disconnect").localize("phrases", {pathPrefix : 'i18n', language : $.currentLanguage});
				  $('#vpnrac-toggle [data-vpnrac="connect"]').removeAttr('disabled').button('toggle').focus();

				  $('#vpnrac-progress span').hide().filter('.success').show();
				  $('#vpnrac-progress .progress').addClass('progress-success').removeClass('active');
				  $('#vpnrac-progress').show().find('.bar').css('width', '100%');

				  $('#peers').fadeIn('fast');
				  break;

				  case 'disconnected':
				  //$('#vpnrac-connect').button('reset');
				  $('#vpnrac-connect-message[data-localize]').data("localize", "vpnrac-connect").localize("phrases", {pathPrefix : 'i18n', language : $.currentLanguage});
				  $('#vpnrac-toggle [data-vpnrac="connect"]').removeAttr('disabled').removeClass('active');
				  $('#vpnrac-toggle [data-vpnrac="disconnect"]').button('toggle').focus();

				  $('#vpnrac-progress').hide().find('.bar').css('width', '0%');

				  $('#peers').fadeOut('slow');
				  break;

				  case 'timeout':
				  $('#vpnrac-toggle [data-vpnrac="connect"]').removeAttr('disabled');
				  $('#vpnrac-toggle [data-vpnrac="disconnect"]').button('toggle').focus();

				  $('#vpnrac-progress span').hide().filter('.timeout').show();
				  $('#vpnrac-progress .progress').addClass('progress-danger').removeClass('active');
				  $('#vpnrac-progress').show().find('.bar').css('width', '100%');
				  break;

				  case 'peers':
				  $('#peers').trigger('update', [data]);
				  break;
			  }
		  })
		  .on('progress', function (e, data) {

				  $('#vpnrac-progress span').hide().filter('.wait').show();
				  $('#vpnrac-progress .progress').removeClass('progress-danger').removeClass('progress-success').addClass('active');
				  $('#vpnrac-progress').show().find('.bar').css('width', data+'%');

			  })
		  .on('error', function (e, data) {
				  $('#vpnrac '+data).remove();
				  $(data).clone(true,true).appendTo('#vpnrac-message');

				  $('#vpnrac-toggle button').attr('disabled','disabled');
				  //$('#vpnrac-toggle [data-vpnrac="disconnect"]').button('toggle');

				  $('#vpnrac-connect').attr('disabled','disabled');
			  });

		  $('#vpnrac-toggle [data-vpnrac="connect"]').on('click', function() {
															 if (!$(this).hasClass('active') && !vpnrac.isConnected) {
																 $(this).attr('disabled','disabled');
																 vpnrac.connect();
															 }
														 });
		  $('#vpnrac-toggle [data-vpnrac="disconnect"]').on('click', function() {
																if (!$(this).hasClass('active')) {
																	vpnrac.disconnect();
																}
														 });
		  /* single-button implementation
		  $('#vpnrac-connect').on('click', function(){
									  if (vpnrac.isConnected) {
										  $(this).button('loading');
										  vpnrac.disconnect();
									  } else {
										  $(this).button('loading');
										  vpnrac.connect();
									  }
								  });
		   */

		  if (errorMsg) {
			  $('#vpnrac #session-error').remove();
			  $('#session-error').clone(true,true).appendTo('#vpnrac-message').find('.error').html(errorMsg);
			  $('#vpnrac-connect').attr('disabled','disabled');
		  } else if (!sessionId) {
			  $('#vpnrac #session-invalid').remove();
			  $('#session-invalid').clone(true,true).appendTo('#vpnrac-message');
			  $('#vpnrac-connect').attr('disabled','disabled');
		  } else {
			  vpnrac.monitor(3000);
		  }

		  // //////////////////////////////////////////
		  // ADMIN functions
		  // isAdmin = true; sessionId='abcdefg'; //for debug
	       if (true) {//RESET THIS
		  //if (isAdmin && sessionId) {
			var fnAdmin = function (e) {
		  		e.preventDefault();
		  		$(this).siblings('.active').removeClass('active')
		  		$(this).addClass('active');
		  		var domRef = $("#"+$(this).find("a").attr("href"));
		  		domRef.removeClass('hide');
		  		if($(this).hasClass('main-admin-nav')){
		  			prevMainDom.addClass('hide');
		  			prevMainDom = domRef;
		  		}else{
		  			prevSubDom.addClass('hide');
		  			prevSubDom = domRef;	
		  		}
		  		
		  	};
		  	$('#admin-panel li').on('click', fnAdmin);
		  	$('#admin-manage li').on('click',fnAdmin);	
		  	
			  if ($.client && $.client.Browser == 'IE') {
				  $.ajaxSetup({ cache: false });
			  }

			  $.ajax({
				 url:"/rac/serverKey/" + sessionId,
				 // url:"data/sessionKeys.json", // for debug
				 dataType: 'json',
				 success:function(data) {
					$('#serverkeys tbody').empty();
					$.each(data, function (key, serverKey) {
							if (typeof serverKey == "object" && serverKey.href) {
								key = $.url(serverKey.href).param('ts');
								$('<tr><td>'+key+'</td></tr>').appendTo('#serverkeys tbody');
							}
						});
				 	},
				 	error:function(){
					$('#serverkeys tbody').html('<tr><td class="error"><em>Unable to retrieve available server keys</em></td></tr>');
				}
			  });
			  $.ajax({
				  url:"/rac/status/" + sessionId,
				  dataType:"json",
				  success:function(data){
					  $("#connection-list tbody").empty();
						  $.each(data.connections, function(key, connection){
						  $("<tr><td>" + connection.cname + "</td><td>" + connection.ip + "</td><td>" + connection.since + "</td><td>" + connection.received + "</td><td>" + connection.sent + "</td></tr>").appendTo("#connection-list tbody");
					 });
				},
				error:function(){
					  $('#connection-list tbody').html('<tr><td class="error"><em>Unable to retrieve connections</em></td></tr>');
				  }
				});
				  
		  }
		  
		  // //////////////////////////////////////////
		  // i18n localization
		  // on first run, assume English and skip it if
		  // browser detect English
		  $('[data-localize]')
		  .localize("phrases", { pathPrefix : 'i18n',	skipLanguage : /^en/ });
		  //.localize("requirements", { pathPrefix : 'i18n' })
		  //.localize("faqs", { pathPrefix : 'i18n' });
		  
		// toggle the language selection
		  $('#language button[localize-lang]').filter(
			  '[localize-lang="' + $.defaultLanguage + '"]').button('toggle');

		// if user manually toggles the button, apply the appropriate language
		// selection
		  $.currentLanguage = $.defaultLanguage;
		  $('#language button[localize-lang]')
		  .on('click', function() {
				  var lang = $(this).attr('localize-lang');
				  if (lang == $.currentLanguage) {
					  return;
				  }
				  $.currentLanguage = lang;
				  $('[data-localize]')
				  .localize("phrases", {
								pathPrefix : 'i18n',
								language : lang	});
				  // .localize("requirements", {
				  // 				pathPrefix : 'i18n',
				  // 				language : lang })
				  // .localize("faqs", {
				  // 				pathPrefix : 'i18n',
				  // 				language : lang
				  // 			});
			  });
		  
	  });
} (window.jQuery);

function setCookie(name, value, days) {
	var expires;
	if (days) {
		var date = new Date();
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		expires = "; expires=" + date.toGMTString();
	} else {
		expires = "";
	}
	document.cookie = name + "=" + value + expires + "; path=/";
}

function getCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for ( var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ')
			c = c.substring(1, c.length);
		if (c.indexOf(nameEQ) == 0)
			return c.substring(nameEQ.length, c.length);
	}
	return null;
}

function deleteCookie(name) {
	setCookie(name, "", -1);
}

/*os_icon show hide */

		$(document).ready(function(){


		   $('.os').click(
		   function(e){
				e.preventDefault;
				$('.activeicon ').removeClass('activeicon');
				$(this).addClass('activeicon');
				
  
			});

		 $('.but_download').click(
				   function(e){
						e.preventDefault;
						$('.activeicon ').removeClass('activeicon');
						$(this).addClass('activeicon');

					});
		$('a').click(
		   function(e){
				e.preventDefault;
				$('.but_activeicon').removeClass('but_activeicon');
				$(this).addClass('but_activeicon')
			});
				});
	

    
/* load id content */
