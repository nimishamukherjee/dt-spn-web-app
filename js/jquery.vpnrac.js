;(function($) {

	  $.vpnrac = function (sessionId) {

		  if ($.client && $.client.Browser == 'IE') {
			  $.ajaxSetup({ cache: false });
		  }

		  return {
			  sessionId: sessionId,

			  isConnected: false,

			  checkThread:   null,
			  monitorThread: null,
			  
			  connectinprog: false,//PT 35289547 - If connect is in progress and off is clicked - /rac/check/ goes into infinite loop 
			  
			  prevPeerData: null, //PT 34604767 - Prevent Peer dropdown from blinking

			  connect: function (sessionId) {
				  var self = this;
				  sessionId = self.sessionId = (sessionId !== undefined ? sessionId : self.sessionId);

				  $.ajax({
							 url:"/rac/url/" + sessionId,
							 success:function(vpnrackey) {
								 location.assign(vpnrackey);
								 // upon clicking on connect, we check every two seconds upto 30 times to look for a status change
								 if (self.checkThread) {
									 clearTimeout(self.checkThread);
									 self.checkThread = null;
								 }
								 self.check(2000,30);
							 },
							 error:function(){
								 $(self).trigger('error', ['#session-expired']);
//								 self.check(1000,10);
							 }
						 });
			  },

			  disconnect: function () {
				  var self = this;
				  location.assign("vpnrac://?pl=disconnect");
				  // when explicit disconnect is called, the server may take some time to reflect actual status
				  if (self.checkThread) {
					  clearTimeout(self.checkThread);
					  self.checkThread = null;
				  }

				 // check for disconnected status every two seconds upto 30 times (60 seconds total)
				 //Added condition for Off being clicked when connection is being established.
				  if(self.connectinprog){
					  self.monitorThread = null;
					  self.monitor(3000);
					  self.connectinprog = false;//Set connectinprog to false - indicate connect is not in progress
					  $(self).trigger('change',['disconnected']);
				  }else{
					  self.check(2000,30);
				  }
				  //self.isConnected = false;
				  //clearTimeout(self.monitorThread);
				  //$(self).trigger('change', ['disconnected']);
			  },

			  check: function (delay, retry) {
				  var self = this;
				  var maxRetry = retry;

				  var checkConnected = function (retry) {

					  if (retry) {
						  var progress = (maxRetry - retry + 1) * 100 / maxRetry;
						  self.connectinprog = true;//Set connectinprog to true - indicate connect is in progress
						  $(self).trigger('progress', progress);
					  } else if (maxRetry) {
						  // indirect closure check to see if it was originally called with RETRY
						  self.connectinprog = false;//Set connectinprog to false - indicate connect is not in progress
						  $(self).trigger('change',['timeout']);
						  // turn monitoring back on
						  self.monitor(5000);
						  return;
					  }

					  $.ajax({
								 url:"/rac/check/" + self.sessionId,
								 dataType:"json",
								 success: function(data){
									 if (!data || data.result == null) {
										 data = { result: self.isConnected };
									 }
									 self.connectinprog = false;//Set connectinprog to false - indicate connect is not in progress
									 $(self).trigger('status',[data.result ? "connected" : "disconnected"]);

									 if (self.isConnected != data.result) {
										 self.isConnected = data.result;
										 if (self.isConnected) {
											 $(self).trigger('change',['connected']);
										 } else {
											 $(self).trigger('change',['disconnected']);
										 }
										 // turn monitoring back on
										 self.monitor(5000);
									 } else {
										 if (retry) {
											 // no status change and we want to retry
											 self.checkThread = setTimeout(function() {checkConnected(retry-1);}, delay);
											 return;
										 }
									 }

									 if (self.isConnected) {
										 $.ajax({ url:"/rac/peer/" + self.sessionId,
												  dataType: 'json',
												  success: function(data){
													  //Only if there is a change in the peer list refresh the peer list
													  if (Object.identical(self.prevPeerData, data) !== true) {
														  self.prevPeerData = data;
														  $(self).trigger('change',['peers',data]);
													  }
												  }
												});
									 }
								 },
								 error: function () {
									 if (retry) {
										 self.checkThread = setTimeout(function() {checkConnected(retry-1);}, delay);
										 return;
									 }
								 }
							 });
					  
				  };

				  // one-time executed upon invoke of .check routine
				  
				  if (retry) {
					  self.connectinprog = true;//Set connectinprog to true - indicate connect is in progress
					  $(self).trigger('progress',5);
					  // disable monitoring thread when called with retry checks
					  self.monitor(false);
				  }

				  if (delay) {
					  self.checkThread = setTimeout(function () {checkConnected(retry);}, delay);
				  } else {
					  checkConnected(retry);
				  }
			  },

			  monitor: function (delay) {
				  var self = this;
				  if (delay == false && self.monitorThread) {
					  clearTimeout(self.monitorThread);
					  self.monitorThread = null;
					  return;
				  }

				  // if no monitor thread currently scheduled
				  if (!self.monitorThread) {
					  self.check();
					  self.monitorThread = setTimeout(function () {self.monitorThread = null; self.monitor(delay);}, delay);
				  }
			  }
		  };
	 };

})(jQuery);
