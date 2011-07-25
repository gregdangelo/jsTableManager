/*
jQuery TableManager plugin
Created by Greg D'Angelo
version: 0.1.0
Comments: The purpose of this guy is to help with the control of tables and table events specifically in regards to some of my other plugins
That being said it needs some well thought out ideas

This takes over where the Table plugin fails.
*/
(function($) { 
	$.fn.tableManager = function(settings) { 
		var config = {'test':true,loadRows:null};
		var elm;//Used for Caching
		var dim = {c:0,r:0};//dimension object
		var parts = {h:'',b:'',f:''};
		var events = {
			'clear':'columns'
			,'hdrcell':'click'
		};
		/*Somehow we'll want to distinguish different aspects of each column and include a default*/
		var colDefs = {
			'default':{'class':'cell-date',width:'',dtype:'alpha'}
			,n:[{'class':'cell-id'},{'class':'cell-name'}]
		};

		if (settings){ $.extend(config, settings); }
		
		/* EVENTS - start */
			/*
			Event List (idea):
			AddColumn
			RemoveColumn
			Scroll
			*/
		/* EVENTS - end */
		
		/* MANIPULATION - start */
		//Adding/Removing Columns
		this.Load = function(data){
			//Lets load in our Data!!!!!!!
			if(config.test){
				$.get(data,TableLoad);
			}
			return this;
		}
		var TableLoad = function(d){
			//o.log("TableLoad: called");
			addRows($.parseJSON(d));
		}
		//Not sure about just sticking this in like this.. it will definitely need more customization options
		//Partially done... we now use a custom callback if desired
		var addRows = function(){
			if(typeof config.loadRows == 'function'){
				return config.loadRows;
			}else{
				return function(d){
						//o.log(d[0]);
						var row;
						$(d).each(function(index,rows){
							row = $('<tr></tr>');//just some more caching
							$(rows).each(function(ind,dt){
								 $("<td>"+dt+"</td>").appendTo(row).addClass(/*(colDefs.n[ind] ? colDefs.n[ind].class: colDefs.default.class)*/ 'alpha');
							});
							$(row).appendTo(parts.b);
						});
						//parts.b.html("<tr><td>dfslfsdlfds</td></tr>");
					};
			}
		}();
		//Just a test function
		var TableCall = function(e){
			o.log("TableCall: called");
		}
		var setEvents = function(){
			//Listen for an empty (cleared) table
			parts.b.bind(events.clear,TableCall);
			$('th',parts.h).live(events.hdrcell,TableCall);
		}

		this.Clear = function(c){
			var clr = {'body':true,'head':false};
			$.extend(clr, c);
			if(clr.body){
				parts.b.empty().trigger(events.clear);
			}
			if(clr.head){
				parts.h.empty().trigger(events.clear);
			}
			return this;
		}
		/* MANIPULATION - end */

		/* TRAVERSING - start */
		//If Needed
		/* TRAVERSING - end */

		/* INFO - start */
		//This is where we store all the table info we need ie.column/row count
		var setDimensions = function(){
			setCols();
			setRows();
		}
		var setCols = function(){
			dim.c = $('tr:eq(1) td',elm).length;
		}
		this.updateCols = function(){
			dim.c = $('tr:eq(1) td',elm).length;
			return this;
		}
		this.getCols = function(){
			return dim.c;
		}
		var setRows = function(){
			dim.r = $('tr',elm).length;
		}
		this.updateRows = function(){
			dim.r = $('tr',elm).length;
			return this;
		}
		this.getRows = function(){
			return dim.r;
		}
		var setParts = function(){
			parts.h = $('thead',elm);
			parts.b = $('tbody',elm);
			parts.f = $('tfoot',elm);
		}
		/* INFO - end */

		/* INIT - start */
	
		var init = function(element){ 
			elm = $(element);//Cache our element
			setParts();
			setDimensions();
			setEvents();
		}

		this.each(function(){
			//element-specific code here
			init(this);
		});
		/* INIT - end */
		return this;
	}; 
})(jQuery);
o.log('jQuery TableManager');