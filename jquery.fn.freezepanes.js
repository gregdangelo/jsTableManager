//jquery freeze panes
//main-comms-table
(function($) {
 	/*
 		info:
 			VERT refers to the top pane which is frozen vertically
 			HORZ refers to the top pane which is frozen horizontally
 			CORNER refers to the upper left section that will remain frozen
 	*/
   $.fn.freezepanes = function(settings) {
     var config = {'horz': false,'vert':false};
 	 var elm;
 	 var frzpns;
 	 var didScroll = false,didSort = false,didAddCol=false;
 	 var hC;
 
     if (settings){$.extend(config, settings);}
     
     //if we're freezing both Horizontally and Vertically then freeze the upper corner too
     config.corner = config.horz && config.vert;
     
     var scrollControl = function(){
     			var pos = elm.position();
     			
  				if(config.horz){pos.left = Math.abs(pos.left)+'px';frzpns.horz.css('left',pos.left);};
				if(config.vert){pos.top = Math.abs(pos.top)+'px';frzpns.vert.css('top',pos.top);};
				if(config.corner){frzpns.corner.css({top:pos.top,left:pos.left});};
		
				return false;
     		};
     var setEvents = function(){
     	$(config.container).scroll(function() { didScroll = true; });
		
		/*
		We're going to use the interval here to help speed things up by slowing them down.
		*/
		setInterval(function() {
			if(didScroll){
				didScroll = false;
				scrollControl();
			}
			if(didSort){
				didSort = false;
				reLoadSide();
			}
			if(didAddCol){
				didAddCol = false;
				reLoadVert();
				if(config.horz){
					reLoadSide();
					reLoadCorner();
				}
			}
		}, 200);
		
		//Functions for Row and Column highlighting
		if(config.horz){		
			//Row Highlighting
			/*$('tr',elm).hover(function(){	
				$('tbody tr:eq('+$(this).prevAll().length+')',frzpns.horz).toggleClass('hghrow');
			});*/
			$(elm).delegate("tr", "hover", function(){
				$('tbody tr:eq('+$(this).prevAll().length+')',frzpns.horz).toggleClass('hghrow');
			});

			$(frzpns.horz).delegate("tr", "hover", function(){
				$('tbody tr:eq('+$(this).prevAll().length+')',elm).toggleClass('hghrow');
			});
			/*$('tr',frzpns.horz).hover(function(){	
				$('tbody tr:eq('+$(this).prevAll().length+')',elm).toggleClass('hghrow');
			});*/
			//$(frzpns.horz).bind('refreeze-h',reLoadSide);
			//We're going to use the interval here
			$(frzpns.horz).bind('refreeze-h',function() { didSort = true; });
		}
		if(config.vert){
			$(frzpns.vert).bind('refreeze-v',function() { didAddCol = true; });
		}
		//Column Highlighting BUT only if we're just doing vertical otherwise it's too much visial
		if(config.vert && !config.corner){
			$('th',frzpns.vert).hover(function(){	
				$('tbody tr td:nth-child('+parseInt(1+ $(this).prevAll().length)+')',elm).toggleClass('hghcol');
			});
		}
		
     }
     
     var cloneHeader = function(){
     	//o.log($('thead',frzpns.vert));
     	$('thead',frzpns.vert).html($(".freeze-vert",elm).html());
     }
     var cloneCorner = function(){
     	//All in one copy and paste...Notice the Clone, this is there to prevent appendTo from removing from our vertical frozen pane
     	$('.freeze-horz',frzpns.vert).clone().appendTo($('<tr></tr>').appendTo($('thead',frzpns.corner)));
     }
     var cloneSide = function(prms){
     	//if we're doing sorting then we only want to recreate the body, hence the params
     	var p = {h:true,b:true};
     	if (prms){$.extend(p, prms);};
     	
     	var l = $('.freeze-horz',elm).length;
     	var m = (l-1);
     	var tbody = $('tbody',frzpns.horz);
     	var rhtml = [];
     	//o.log(m);
     	
     	if(p.h){
			//Recreate the Header
			$('th:lt('+l+')',$('tr',elm)).each(function(i){
				rhtml[i%l] = $(this).clone();
				if(i%l === m){
					$(rhtml).appendTo($('<tr></tr>').appendTo($('thead',frzpns.horz)));
					rhtml = [];
				}    		
			});
     	}
		if(p.b){
			//Recreate the Body
			$('td:lt('+l+')',$('tr',elm)).each(function(i){
				rhtml[i%l] = $(this).clone();
				if(i%l === m){
					$(rhtml).appendTo($('<tr></tr>').appendTo(tbody));
					rhtml = [];
				}
			});
     	}
     }
     var reLoadSide = function(){
     	//o.log("hi Side");
     	//Empty the body and just redraw it
     	$('tbody,thead',frzpns.horz).empty();
     	cloneSide({h:true});
     }
     var reLoadVert = function(){
     	//o.log("hi Vert");
     	//Empty the body and just redraw it
     	$('thead',frzpns.vert).empty();
     	cloneHeader();
     }
     var reLoadCorner = function(){
     	$('thead',frzpns.corner).empty();
     	cloneCorner();
     }
     var startTransfer = function(){
     	if(config.vert){
     		cloneHeader();
     	}
     	if(config.corner){
     		cloneCorner();
     	}   	    	
     	//this will be the most intensive bit of work hence why it's a the end
     	if(config.horz){
     		cloneSide();
     	}
     	//hide headers -- bad idea
     	//$('th',elm).addClass('invisible');
     }
     this.reset = function(){
     	$([config.horz,config.vert,config.corner]).remove();
     }
     var init = function(element){
     	elm = $(element);
     	var divhtml = '';
     	var deftable = '<table cellspacing="0" cellpadding="0" border="0"><thead></thead><tbody></tbody></table>';
     	     	
     	if(config.horz){
     		//create horizontal div
     		divhtml += '<div id="table-overlay-horz">' + deftable + '</div>';
     	}
     	if(config.vert){
     		//create vertical div
     		divhtml += '<div id="table-overlay-vert">' + deftable + '</div>';
     	}
     	if(config.corner){
     		//create corner div
     		divhtml += '<div id="table-overlay-corn">' + deftable + '</div>';
     	}
     	if(divhtml){
     		//Add in all our DIVs at once... no sense wasting resources here
     		$(divhtml).insertAfter(elm);
     		//Cache our divs
     		frzpns = {
     			horz: (config.horz ? $('#table-overlay-horz') : '')
     			,vert:(config.vert ? $('#table-overlay-vert') : '')
     			,corner:(config.corner ? $('#table-overlay-corn') : '')
     		};
     		//copy over some rows and columns
     		startTransfer();
     		//Set up our events
     		setEvents();
     	}
     };
     
     this.each(function() {
		init(this);
     });
 
     return this;
 
   };
 
})(jQuery);