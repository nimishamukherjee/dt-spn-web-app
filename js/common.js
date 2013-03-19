var sitesRouter, listOfDevicesRender, firewallRender, viewDeviceName="", activateDeviceType, deviceID;
function fnUpdateSectionDisplay(ref){
	$(".section").addClass("hidden");
	$(ref).removeClass("hidden");
	if(ref=="#eachDeviceInformation" || ref=="#viewFirewall" || ref=="#viewNetwork"){
		$('.sidebar-nav').removeClass("hide")
		$( ".sidebar-nav li" ).each(function( index ) {
  			$(this).find('a').removeClass("active_tab");
  			var hrefis = ($(this).find('a').attr("href").toLowerCase()).replace("#","");
  			if(ref.toLowerCase().indexOf(hrefis)>=0){
  				$(this).find('a').addClass("active_tab");  				
  			}
		});
	}
}

function fnUpdateUTMDisplay(ref){
	$(".section").addClass("hidden");
	$(ref).removeClass("hidden");
		$('.sidebar-nav').removeClass("hide")
		$( ".sidebar-nav li" ).each(function( index ) {
  			$(this).find('a').removeClass("active_tab");
  			var hrefis = ($(this).find('a').attr("href").toLowerCase()).replace("#","");
  			if(ref.toLowerCase().indexOf(hrefis)>=0){
  				$(this).find('a').addClass("active_tab");  				
  			}
		});
}
//Modal variables
var modalType, modalSection, secondAlert = false;
function fnShowAlert(msg,type,section){
	modalType = type;
	modalSection = section;
	$('.msg-modal-body p').html(msg);
	var footerref = ".modal-footer ."+type
	$(footerref).removeClass('hide');
	$('#msgModal').modal('show');
}

$(".modal-footer button").on('click', function(){
	switch($(this).html()){
		case "YES":			
			switch (modalSection){
				case 'device':
					//secondAlert = true;
					fnShowAlert("This is not a good idea. Reconsider!","delete","device2");
				break;
				case 'device2':
					$('#msgModal').modal('hide');
					sitesRouter.fnStartDelete();
				break;
			}
		break;
		case "NO":
		break;
		case "OK":
		break;
	}
})
dust.helpers.counter = function (chunk, ctx, bodies, params) {
  	switch(params.operand){
  		case "++":
  			vlanCtr++;
  		break;
  		case "--":
  			vlanCtr++;
  		break;
  		default:
  			vlanCtr;
  		break;
  	}
    	return chunk.write(vlanCtr);
   }