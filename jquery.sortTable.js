/*
jQuery SortTable plugin
Created by Greg D'Angelo
version: 1.0.0
Comments: this is the second successful implementation of this plugin
*/
(function($) { 
	$.fn.sortTable = function(settings) { 
		//I feel like there is a better way do to this then a bunch of Arrays but can't think of one so Arrays it is
		var config = {sortCols:[],headerRow:'',int:[],bool:[],date:[],func:[],sfuncs:[],rowColor:null,callback:null,precall:null};
		var elm;
		//var callback;
		//var precall;

		if (settings){
			$.extend(config, settings);
		}
		/*
		The bulk of the plugin is the actual sort which this is
		This function is Private
		*/
		sortColumn = function(column,ctype,sDir,func){
			var col = column || 0;
			var sortDir = (sDir.toLowerCase()=='asc') ? 1 : -1;//set the direction
	
			if(typeof config.precall == 'function'){
				config.precall();
			}

			//Make sure not to sort the header row if we have one
			hdrRow = '';
			if(config.headerRow){
				hdrRow = ":not("+config.headerRow+")";//Not sure if I like this or not
			}
			//Grab our rows... notice the table NEEDS a tbody
			var rows = $(elm).find('tbody > tr'+hdrRow).get();//the tbody bugs me; what if its in the thead

			//Set up out rows by adding a sortkey
			$.each(rows, function(index, row) {
				//figure out how we are sorting
				switch(ctype){
					/*
					//This can be used if we're controlling 2 tables at once but the function needs some modification
					case 'match':
						row.sortKey = $.inArray(parseInt($(row).attr('rownum')),matchArray)+1;
						break;
					*/
					case 'int':
						row.sortKey = parseInt($(row).children('td').eq(col).text());
						break;
					//Boolean Seems kind of useless since we could just use alpha and get pretty much the same results
					case 'bool':
						row.sortKey = $(row).children('td').eq(col).text() == "Yes" ? true: false;
						break;
					case 'date':
						/* I wonder If I could simplify this in any way*/
						$em  = $(row).children('td').eq(col);
						//lets default to the beginning of time if we have no actual date value
						sKey = Date.UTC();
						if($em.text().length > 0){
							//Want to make sure that the string manipulation is done first so split this into 2 lines
							var dateString = $em.text().stripslashes().trim();
							var dateArray = dateString.split('/');
							sKey = Date.UTC(dateArray[2],dateArray[1],dateArray[0]);
							sKey = sKey >= 0 ? sKey : Date.UTC();
						}
						row.sortKey = sKey;
						break;
					case 'func':
						//call our custom sort function
						row.sortKey = func($(row).children('td').eq(col).text());
						break;
					//everything is alpha by default
					case 'alpha':
					default:
						row.sortKey = $(row).children('td').eq(col).text().trim().toUpperCase();		
						break;
				}
				
			});
			//Do the sort. Adjust the result based on the sort Direction
			rows.sort(function(a, b) {
				var res = 0
				if (a.sortKey < b.sortKey){res = -sortDir;}
				if (a.sortKey > b.sortKey){res = sortDir;}
				return res;
			});
			//re-add our rows and remove the sort key
			$.each(rows, function(index, row) {
				$(elm).children('tbody').append(row);
				row.sortKey = null;
			});
			//if we have a rowcolouring function add it in here
			if(config.rowColor){
				if(typeof config.rowColor == 'function'){
					config.rowColor();
				}
			}
			return this;
		}
		
		var setupHeader = function(){
			var l = $(config.headerRow + " td, "+config.headerRow + " th,",elm);
			//o.log($(config.headerRow + " td, "+config.headerRow + " th,",elm));
			$(config.headerRow + " td, "+config.headerRow + " th,",elm).click(function(){
				var e = $(this);//save out element and speed up the process
				var st = e.attr('sortDir');
				func = function(){ return false; };
				$('.sortDirAsc,.sortDirDesc').removeClass('sortDirDesc').removeClass('sortDirAsc').removeAttr('sortdir');//Remove any other Sorting currently on
				switch(st){
					case 'asc':
						st='desc'
						e.addClass('sortDirAsc');
						break;
					//Default to a Descending sort
					case 'desc':
					default:
						st = 'asc';
						e.addClass('sortDirDesc');
						break;
				}
				e.attr('sortDir',st);//Add out sort dir
				c = e.prevAll().length;//find out where we are and adjust the sorting criteria
				ct = 'alpha'
				if(config.int.length){
					ct = (config.int.indexof(c+1) != -1) ? 'int' : ct;
				}
				if(config.bool.length && ct === 'alpha'){
					ct = (config.bool.indexof(c+1) != -1) ? 'bool' : ct;
				}
				if(config.date.length && ct === 'alpha'){
					ct = (config.date.indexof(c+1) != -1) ? 'date' : ct;
				}
				//Need to allow special sorting
				if(config.func.length && ct === 'alpha'){
					var fp = config.func.indexof(c+1);
					if(fp != -1){
						if(typeof config.sfuncs[fp] == 'function'){ //make sure that our function ACTUALLY exists
							ct = 'func';
							func = config.sfuncs[fp];
						}
					}
				}
				//do the actual sort now
				sortColumn(c,ct,st,func);
			})/*.css({cursor:'pointer'})*/;
		}
		
		var init = function(element){ 
			elm = element;
			setupHeader();
		}

		this.each(function() {
			//element-specific code here
			init(this);
		});

		return this;
	}; 
})(jQuery);