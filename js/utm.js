window.Templating = {};


Templating.start = function() {
	function compileTemplates() {
		$('script[type="text/html"]').each(function(a, b) {
			var script = $(this), text = $.trim(script.html());
			id = script.attr('id');
			dust.compileFn(text, id);
		});
	}
	
$(document).ready(function() {
	$("#dialog" ).dialog({
      autoOpen: false,     
      modal: true
	});
	
	$("#CatContainer").hide();
	$("#BlkLstContainer").hide();
	
//Antivirus Section
	//Antivirus Model
	var AntivirusModel =  Backbone.Model.extend({
		});
	var AntivirusCollection = Backbone.Collection.extend({
			model: AntivirusModel,
			urlRoot : "data/antivirus.json",
			url:function()
			{
				return this.urlRoot;
			}
		});
	
	var Antivirus = Backbone.View.extend({
		currentTemplate: "AntivirusTemp",
		initialize:function(){
			//this.render();
			this.bind('change', this.render(), this);
		},
			
		setToggle: function(status){
			//alert(status);
			this.model.set({"enabled":status});
			//alert(JSON.stringify(this.model));
			
		},
		
		render: function(){
			var thisObj=this;
			dust.render(this.currentTemplate, this.model.toJSON(),function(err,output){
							if(err){
								}else{
									$(thisObj.el).append(output);
								}
							});
				return this;
		}
		});
	
	
	var AntivirusView = Backbone.View.extend({
			
		
		saveToggle: function(status){
			var antivirus = new Antivirus({model:new AntivirusModel(this.model.toJSON()[0])});
				antivirus.setToggle(status);
		},
			render: function () {
			for(var i = 0; i < this.model.toJSON().length; i++)
			{
				$("#virusContToggle").append(new Antivirus({model:new AntivirusModel(this.model.toJSON()[i])}).el);
			}
       } 
		});
//End Antivirus



//Content Filtering
	//Content Filtering Model
	var ContFltrModel =  Backbone.Model.extend({
		});
	var ContFltrCollection = Backbone.Collection.extend({
			model: ContFltrModel,
			urlRoot : "data/contentfilter.json",
			url:function()
			{
				return this.urlRoot;
			}
		});
	
	var ContFltr = Backbone.View.extend({
		currentTemplate: "ContFltrTemp",
		initialize:function(){
			//this.render();
			this.bind('change', this.render(), this);
		},
		setToggle: function(status){
			//alert(status);
			this.model.set({"enabled":status});
			//alert(JSON.stringify(this.model));
			
		},
		render: function(){
			var thisObj=this;
			dust.render(this.currentTemplate, this.model.toJSON(),function(err,output){
							if(err){
								}else{
									$(thisObj.el).append(output);
								}
							});
				return this;
		}
		});
	
	var ContFltrView = Backbone.View.extend({
											
			render: function () {
			for(var i = 0; i < this.model.toJSON().length; i++)
			{
				$("#ContFltrToggle").append(new ContFltr({model:new ContFltrModel(this.model.toJSON()[i])}).el);
			}
       } ,
	   saveToggle: function(status){
			var antivirus = new ContFltr({model:new ContFltrModel(this.model.toJSON()[0])});
				antivirus.setToggle(status);
		}
		});
//End Content Filtering



	
//Categories			   
var CategoryModel = Backbone.Model.extend({
											  
   });

//Black List		   
var BlackListModel = Backbone.Model.extend({
   });



//Categories Collection
var CategoryCollection = Backbone.Collection.extend({
			model : CategoryModel,
			urlRoot : "data/ContFltr_Cat.json",
			url:function()
			{
				return this.urlRoot;
			}
		});
	
//Black List Collection
var BlackListCollection = Backbone.Collection.extend({
			model : BlackListModel,
			urlRoot : "data/blakList.json",
			url:function()
			{
				return this.urlRoot;
			}
						 
		});


	//Categories ViewItem
var CategoryViewItem = Backbone.View.extend({
		tagName: "li",
      	className: "span3",
		currentTemplate : "CatTemplate", 
		initialize: function() {		
				return this.render();
		},
		
		render : function() {
				var thisObj = this;
					dust.render(this.currentTemplate, this.model.toJSON(), function(err, output) {
					if (err) {
					} else {
						$(thisObj.el).append(output);
						
						
					}
				});
				return this;
			},
			
		events: {
			"click input.CatChkbox": "FindChkStatus"
			},
			
		FindChkStatus:function(e){
			var isChecked = e.currentTarget.checked;
			this.model.set({"blocked":isChecked});
			//whenever you select/deselect - write back the information to the parent
			categoriesListView.saveEachCategory(this.model);			
		 }
		});
	
	
	// Categories Masterview
var CategoriesListView = Backbone.View.extend({
											   
		events: {
        	"click button.refresh": "refreshCat",
			"click button.submit": "SaveCat",
			"click input.CatChkbox": "Buttonactions"
			},
			
		refreshCat: function(){
				$("#CatList").html("");
				this.render();
		},
		
		saveEachCategory:function(data){
			this.model.get(data.get('id')).set(data);
			
		},
		
		SaveCat: function(e){
			//alert(JSON.stringify(this.model.toJSON()));
		},
		
		Buttonactions: function(){
			$(".submit").removeClass("disabled");
			$(".refresh").removeClass("disabled");
		},
		
		
        render: function () {
			for(var i = 0; i < this.model.toJSON().length; i++)
			{
				$("#CatList").append(new CategoryViewItem({model:new CategoryModel(this.model.toJSON()[i])}).el);
			}
       }
	
		
    });
	
	
	
//Black List Item
var BlackListViewItem = Backbone.View.extend({
			initialize:function(){
							this.render();
							},
			tagName: "li",
        	className: "span3_blklist",
			currentTempl: "BlackListTemplate",
			events : {
				"click img.delete" : "deleteItem"
			},
			
			deleteItem : function(){
				var url = this.model.get('url');
				var deleteItem = this.model;
				var that = this;
				$("#dialog").dialog("open").html(" Are you sure you want to delete <br>" + "<b>" + url + "</b>" + "?");
					$("#ui-dialog-title-dialog").html("Confirmation required");
					 $("#dialog").dialog({
								buttons : {
									"Confirm" : function() {
									  //that.remove();
									  blacklistview.deleteItem(deleteItem);
									   $(this).dialog("close");
									},
									"Cancel" : function() {
									  $(this).dialog("close");
									}
								}
								});
					  ;
			},
			render: function(){
				var thisObj = this;
					dust.render(this.currentTempl, this.model.toJSON(), function(err, output){
								if(err){
								}else{
									$(thisObj.el).append(output);
									} 
								});
					return this;
			}
		});
	//BlackList Master View
var blackListView = Backbone.View.extend({
											 initialize:function(){
												 
												 this.collection = new BlackListCollection();
												 this.collection.bind('add', this.appendItem);
												 this.collection.bind('remove', this.deleteItem);
												 
											},
											events : {
												"click button.block": "addItem",
											},
											addItem: function(){
												var validUrl = /^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/;
												var blockitem = $("#itemToAdd").val();
												var item = new BlackListModel();
												liLength = $("#BlkLst li").length + 1;
												if(blockitem.match(validUrl)){
													item.set({
														id:"u"+liLength,
        												url: blockitem 
     												});
													//alert(JSON.stringify(item));
													this.collection.add(item);
													$("#itemToAdd").val("");
													this.model.push(item);
													this.render();
													//alert(JSON.stringify(this.model));
												}else{
													$("#dialog").dialog("open").html("Please enter a valid URL");
													$("#ui-dialog-title-dialog").html("Alert");
												    $("#dialog").dialog({
															buttons : {
																"Ok" : function() {
																  $(this).dialog("close");
																}
														}
													});
												}
												
											},
											
											deleteItem: function(deleteitem){
												this.model.remove(deleteitem);
												this.render();
											},   
											
											render: function(){
												 var self = this;
												 $("#BlkLst").html("");
     											 //$(this.el).append("<button id='add'>Add list item</button>");
												for(var i = 0; i < this.model.toJSON().length; i++){
												$("#BlkLst").append(new BlackListViewItem({model: new BlackListModel(this.model.toJSON()[i])}).el);
												}
												
											},
											appendItem: function(item){
     										 var itemView = new BlackListViewItem({
												   model: item
     											 });
     											$("#BlkLst").append(itemView.el);//for rendering
											}
											
										});
											
	
var accountRouter = Backbone.Router.extend({
        routes: {
            "": "fnInitAntivirus",
 	    	"utm":"fnGetUTM",
 	    	"viewconn":"fnGetViewConn",
 	    	"viewserver":"fnGetServerKeys"
        },

        fnInitList: function (type) {
			this.cCollection=new CategoryCollection();
			$("#CatList").html("");
			this.cCollection.fetch({
				success:function(model, response){	
				categoriesListView = new CategoriesListView({el: $("#CatContainer"), model:model});
				categoriesListView.render();
				},
				error:function(data){
					alert("Error loading json")
				}
			});
		},

		//UTM

		fnGetUTM: function(){
			$('#utm').tab('show');
	        $('.nav-tabs a[href=#utm]').tab('show').css('cursor', 'pointer');
	        
         },

         fnGetViewConn: function(){
        		$('#viewconn').tab('show');
	        $('.nav-tabs a[href=#viewconn]').tab('show').css('cursor', 'pointer');
         },

  		fnGetServerKeys: function(){
        	$('#viewserver').tab('show');
	        $('.nav-tabs a[href=#viewserver]').tab('show').css('cursor', 'pointer');
         },
         

		fnInitBlackList : function(type){
			this.blackListCollection=new BlackListCollection();
			$("#BlkLst").html("");
			this.blackListCollection.fetch({
				success:function(model, response){	
				blacklistview = new blackListView({el: $("#BlkLstContainer"), model:model});
				blacklistview.render();
				},
				error:function(data){
					alert("Error loading json")
				}
			});
		},
		
		fnInitAntivirus : function(type){
			this.virusCollection=new AntivirusCollection();
			this.virusCollection.fetch({
				success:function(model, response){	
				antivirusview = new AntivirusView({el: $("#virusContianer"), model:model});
				antivirusview.render();
				$('#anti-toggle-button').toggleButtons({
							onChange: function ($el, status, e) {
									antivirusview.saveToggle(status);
									}
								});
				},
				error:function(data){
					alert("Error loading json");
				}
				
			});
			this.fnInitContFltr();
		},
		fnInitContFltr : function(type){
			this.contfltrCollection=new ContFltrCollection();
			this.contfltrCollection.fetch({
				success:function(model, response){	
				contfltrsview = new ContFltrView({el: $("#filterContainer"), model:model});
				contfltrsview.render();
				
				var buttonstatus = model.toJSON()[0].enabled;
				if(buttonstatus == "true"){
					app.fnInitBlackList();
					app.fnInitList();
					$("#CatContainer").show();
					$("#BlkLstContainer").show();
				}
				
				$('#contFltr-toggle-button').toggleButtons({
						 onChange: function ($el, status, e) {
							 	contfltrsview.saveToggle(status);
								if(status == true){
									app.fnInitBlackList();
									app.fnInitList();
									$("#CatContainer").show();
									$("#BlkLstContainer").show();
									}
								else{
									$("#CatContainer").hide();
									$("#BlkLstContainer").hide();
									}
							}
						});
				},
				error:function(data){
					alert("Error loading json")
				}
				
			});
		}
		
		
    });
    
   	compileTemplates();
		var app = new accountRouter();
		Backbone.history.stop();
		Backbone.history.start();
			   });
};
	Templating.start();
