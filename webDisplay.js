/********** Constants ************/
const HOST_DEFAULT = 'cam.aprsworld.com';
const TITLE_DEFAULT = 'wsWebDisplay';
/***** Global variables ********/
var editMode = false;
var time; //incremental variable that keeps track of time since last data update
var	treeRefreshTimer = 0;
var loadedTime = 0;
var camTime = 0; //incremental variable that keeps track of time since last camera image update
var id_arr = [];
var path_arr = [];
var cell_arr = [];
var started = false; //this boolean makes sure we only execute some of our functions only once such as the jquery ui setup
var ageInterval;
var staticRegexPeriod = /\./g; //global declaration to reduce overhead
var isExpanded;
var tempArray = [];
/********************************************************************
Work around for jquery ui bug that causes aspect ratio option to fail
on resizables that have already been initialized
*********************************************************************/
$(function() {
	$.extend($.ui.resizable.prototype, (function (orig) {
		return {
			_mouseStart: function (event) {
				this._aspectRatio = !!(this.options.aspectRatio);
				return(orig.call(this, event));
			}
		};
	})($.ui.resizable.prototype["_mouseStart"]));
});

  (function( $ ) {
    $.widget( "custom.combobox", {
      _create: function() {
        this.wrapper = $( "<span>" )
          .addClass( "custom-combobox" )
          .insertAfter( this.element );
 
        this.element.hide();
        this._createAutocomplete();
        this._createShowAllButton();
      },
 
      _createAutocomplete: function() {
        var selected = this.element.children( ":selected" ),
          value = selected.val() ? selected.text() : "";
 
        this.input = $( "<input>" )
          .appendTo( this.wrapper )
          .val( value )
          .attr( "title", "" )
		  .attr( "id","comboBoxInput")
          .addClass( "custom-combobox-input ui-widget ui-widget-content ui-state-default ui-corner-left" )
          .autocomplete({
            delay: 0,
            minLength: 0,
            source: $.proxy( this, "_source" )
          })
          .tooltip({
            tooltipClass: "ui-state-highlight"
          });
 
        this._on( this.input, {
          autocompleteselect: function( event, ui ) {
			  
            ui.item.option.selected = true;
            this._trigger( "select", event, {
              item: ui.item.option
            });
          },
 
          autocompletechange: "_removeIfInvalid"
        });
      },
 
      _createShowAllButton: function() {
        var input = this.input,
          wasOpen = false;
 
        $( "<a>" )
          .attr( "tabIndex", -1 )
          .tooltip()
          .appendTo( this.wrapper )
          .button({
            icons: {
              primary: "ui-icon-triangle-1-s"
            },
            text: false
          })
          .removeClass( "ui-corner-all" )
          .addClass( "custom-combobox-toggle ui-corner-right" )
          .mousedown(function() {
            wasOpen = input.autocomplete( "widget" ).is( ":visible" );
          })
          .click(function() {
            input.focus();
 
            // Close if already visible
            if ( wasOpen ) {
              return;
            }
 
            // Pass empty string as value to search for, displaying all results
            input.autocomplete( "search", "" );
          });
      },
 
      _source: function( request, response ) {
        var matcher = new RegExp( $.ui.autocomplete.escapeRegex(request.term), "i" );
        response( this.element.children( "option" ).map(function() {
          var text = $( this ).text();
          if ( this.value && ( !request.term || matcher.test(text) ) )
            return {
              label: text,
              value: text,
              option: this
            };
        }) );
      },
 
      _removeIfInvalid: function( event, ui ) {
 
        // Selected an item, nothing to do
        if ( ui.item ) {
          return;
        }
 
        // Search for a match (case-insensitive)
        var value = this.input.val(),
          valueLowerCase = value.toLowerCase(),
          valid = false;
        this.element.children( "option" ).each(function() {
          if ( $( this ).text().toLowerCase() === valueLowerCase ) {
            this.selected = valid = true;
            return false;
          }
        });
 
        // Found a match, nothing to do
        if ( valid ) {
          return;
        }
 
        // Remove invalid value
        this.input
          .val( "" )
        this.element.val( "" );
        this._delay(function() {
          this.input.tooltip( "close" ).attr( "title", "" );
        }, 2500 );
        this.input.autocomplete( "instance" ).term = "";
      },
 
      _destroy: function() {
        this.wrapper.remove();
        this.element.show();
      }
    });
  })( jQuery );

//converts seconds into a time format (hours:minutes:seconds)
function ageTimer(){
	var length, k, value, id;
	ageInterval = setInterval(function(){ 
		length = cell_arr.length;
		for(k in cell_arr){
			if('timeStamp' == cell_arr[k]['path']){
				value = parseInt(cell_arr[k]['value'], 10);
				value++;
				cell_arr[k]['value'] = value;
				id = "div_"+cell_arr[k]['id'];
				$('div#' + id + '').children('p').text(value+" seconds old");
			}
		}
	}, 1000);
}
function secToTime(sec){
	var secs = sec
	if ( 1 == sec ) {
		return "1 second ";
	}
	if ( sec < 60 ) {
		return sec + " seconds ";
	}
	/* more than one minute */          
	var out = "";
	var days= Math.floor(sec/(24*60*60));
	sec = sec - (Math.floor(sec/(24*60*60))*(24*60*60));
	var hours= Math.floor(sec/(60*60));
	sec = sec - (Math.floor(sec/(60*60))*(60*60));
	var minutes= Math.floor(sec/(60));
	sec = sec - (Math.floor(sec/(60))*(60));
	out = ('00'+hours).slice(-2)+":"+('00'+minutes).slice(-2)+":"+('00'+sec).slice(-2);
	if ( 1 == days ) {
		out = days + " day, "+('00'+hours).slice(-2)+":"+('00'+minutes).slice(-2)+":"+('00'+sec).slice(-2);
		
	}
	if ( days > 1 ) {
		out = days + " days, "+('00'+hours).slice(-2)+":"+('00'+minutes).slice(-2)+":"+('00'+sec).slice(-2) ;
	}
	out+=" (hours:minutes:seconds)";
	return out;
	
}
//value = number being rounded, decimals = decimal places to round to
function round(value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals).toFixed(decimals);
}
function data_error(errors, delay) {
    $('#ws_status').text(errors[0] + ': Reconnecting in ' + delay + 's.');
}


//structure for jsonItem used in iterateStations
function treeitem(){
	this.id;
	this.parent;
	this.text;
	this.obj = function obj(){
		this.path;
		this.class = 'blah';
		this.value;
	};
	this.style;
	this.containerId;
	this.src;
	this.innerHtml;
	this.classes = function classes(){
		var classList = this.className.split(' ');
		return classList;
	};
}
function iterateStations(obj, stack, arr, lastk) {
	var jsonItem, jsonItem2, id, path, parent, value, title, units, typeUnits, type;
	for (var property in obj) {
		//main if block
		if (typeof obj[property] == "object") { //is this property an object? then find next property
			jsonItem = new treeitem();
			id = ("ws_" + stack+property+"_x").replace(staticRegexPeriod, "");	
			path = stack + '.' + property;
			parent = ("ws_"+stack+"_x").replace(staticRegexPeriod, "");
			//case for root node
			if(parent == "ws__x"){ 
				parent = "#";	
			}
			jsonItem["id"] = id;
			jsonItem["parent"] = parent;
			jsonItem["obj"] = {};
			jsonItem["obj"]["class"] = "";
			if('undefined' !== typeof obj[property]['image_url']){
				jsonItem ["id"] = id;
				jsonItem ["parent"] = parent;
				jsonItem ["text"] = property;
				jsonItem ["obj"] = {
					"path": stack + '.' + property+".image_url", 
					"class": "draggableCamNode"
				};
				arr.push(jsonItem);
				delete jsonItem;

				lastk = property; //keeps track of last property which is stored in a global variable
				iterateStations(obj[property], stack + '.' + property, arr, lastk); //combine stack and property and call function recurssively
			}
			else if('undefined' !== typeof obj[property]['title'] && 'undefined' == typeof obj[property]['value'] && 'undefined' == typeof obj[property]['units'] && typeof obj[property] == "object"){
				jsonItem ["text"] = obj[property]['title'];
				jsonItem ["id"] = id;
				jsonItem ["parent"] = parent;
				arr.push(jsonItem)
				lastk = property; //keeps track of last property which is stored in a global variable
				iterateStations(obj[property], stack + '.' + property, arr, lastk); //combine stack and property and call function recurssively
			}
			//checks for specific child properties of nested object - this will allow for dynamically adding units and titles to the cells
			else if('undefined' !== typeof obj[property]['title'] || 'undefined' !== typeof obj[property]['value'] || 'undefined' !== typeof obj[property]['units'] || 'undefined' !== typeof obj[property]['type'] || 'undefined' !== typeof obj[property]['typeUnits']){
				jsonItem["id"] = id;
				jsonItem["parent"] = parent;
				jsonItem["obj"] = {};
				jsonItem["obj"]["path"] = stack + '.' + property;
				// get title 
				if('undefined' !== typeof obj[property]['title']){
					title = obj[property]['title'];	
					jsonItem["obj"]["title"] = title;
					jsonItem["text"] = title;
				}
				else{
					jsonItem["text"] = property;
				}
				// get value 
				if('undefined' !== typeof obj[property]['value']){
					value = obj[property]['value'];	
					jsonItem["obj"]["value"] = value;
					jsonItem["obj"]["path"] = stack + '.' + property + ".value";
				}
				else{
					value = 'Incorrect Data Format';	
				}
				// get units 
				if('undefined' !== typeof obj[property]['units']){
					units = obj[property]['units'];	
					jsonItem["obj"]["units"] = units;
				}
				else{
					units = null;	
				}
				// get typeUnits 
				if('undefined' !== typeof obj[property]['typeUnits']){
					typeUnits = obj[property]['typeUnits'];
					jsonItem["obj"]["typeUnits"] = typeUnits;
				}
				else{
					typeUnits = null;
				}
				// get type 
				if('undefined' !== typeof obj[property]['type']){
					type = obj[property]['type'];
					jsonItem["obj"]["type"] = type;
				}
				else{
					type = null;	
				}
				//programatically set up timestamp leaf
				var timeStamp = {};
				timeStamp["id"] = id+"_ageOfData";
				timeStamp["parent"] = id;
				timeStamp["text"] = "Age of Data";
				timeStamp["obj"] = {};
				timeStamp["obj"]["path"] = "timeStamp";
				//enables dragging on non leaf-node data cells
				jsonItem["obj"]["class"] = "dataDraggable";
				arr.push(jsonItem, timeStamp);
				delete jsonItem;
				delete timeStamp;

			}
			//if not child properties, recurssively call function once more to find next level of objects/properties
			else{
				jsonItem ["id"] = id;
				jsonItem ["parent"] = parent;
				jsonItem ["text"] = property;
				jsonItem ["obj"] = {"path": stack + '.' + property};
				arr.push(jsonItem);
				delete jsonItem;

				lastk = property; //keeps track of last property which is stored in a global variable
				iterateStations(obj[property], stack + '.' + property, arr, lastk); //combine stack and property and call function recurssively
			}
		// if property is not an object AKA leaf node
		} else {
			var jsonItem = new treeitem();
			var id = ("ws_" + stack+property+"_x").replace(/\./g, "");
			var path = stack + '.' + property;
			var parent = ("ws_"+stack+"_x").replace(/\./g, "");
			jsonItem ["id"] = id;
			jsonItem ["parent"] = parent;
			jsonItem ["text"] = property;
			//case for when we are setting title of station with a child title node
			if(property !== 'title'){
				jsonItem ["obj"] = {"path": stack + '.' + property};
				//programatically set up timestamp leaf
				var timeStamp = {};
				timeStamp["id"] = id+"_ageOfData";
				timeStamp["parent"] = id;
				timeStamp["text"] = "Age of Data";
				timeStamp["obj"] = {};
				timeStamp["obj"]["path"] = "timeStamp";
				//enables dragging on non leaf-node data cells
				jsonItem["obj"]["class"] = "dataDraggable";
				arr.push(jsonItem, timeStamp);
				delete jsonItem;
				delete timeStamp;
			}
		}

    }
}
/*this is an important function because it converts the dot notation string into an actual object reference and then returns that reference*/
function ref(obj, str) {
    str = str.split("."); //splits the dot notation
    for (var i = 1; i < str.length; i++) {
	if (obj === undefined) {
		return undefined;
	}
        obj = obj[str[i]];
    }
    return obj;
}
/*this function takes in the array of ids, the array of dot notation reference strings and our data object. it uses the length of the id array to find all values that need to be changed and then changes them dynamically*/
function dynamicUpdate(data) {
	var idLength = cell_arr.length;
	var value, cellObj, id, label, loadingObject;
	
    cell_arr.forEach(function(objectFound){	
		// since the object array has textblocks and img blocks, we need to weed them out
		if(objectFound.elementType == 'pageCam' || objectFound.elementType == 'pageCell'){
		id = objectFound.id;
		//check if ID belongs to an age of data element (special case since it is programatically added after data comes in)
		if(id.indexOf("ageOfData") >= 0){
			value = 0+" seconds old";
			objectFound.value = 0;
			$('div#div_' + objectFound.id + '').children('p').text(value);
		}
		//cam update
		else if(id.indexOf("pageCam") >= 0){
			var currentCam;
			
			value = ref(data, objectFound.path);
			currentCam = $("#"+objectFound.fullId);
			currentCam = currentCam.attr('id');
			$('#preload_'+currentCam).unbind();
			$('#preload_'+currentCam).load(function() {
				var src = $(this).attr('src');
				var cam = $(this).attr('id').replace("preload_","");
				if(objectFound.src != src){	
					objectFound.src = src;
					objectFound.setHover(objectFound.hoverable, objectFound.hoverDelay);
				}
				$('#'+cam).css('background-image', 'url('+src+')');	
			});
			//src is set after the .load() function
			$('#preload_'+currentCam).attr('src',value);		
		}
		//for other elements...
		else{
			id = id.replace('div_', '');	
			//finds value of object
			value = ref(data, objectFound.path);
			//checks if the object has type, typeUnits, and typeChange properties
			if((objectFound.hasOwnProperty('type')) && (objectFound.hasOwnProperty('typeUnits')) && (objectFound.hasOwnProperty('typeChange'))){
				var type = objectFound.type;
				var typeUnits = objectFound.typeUnits.toUpperCase();
				var typeChange = objectFound.typeChange;
				if(typeChange !== typeUnits){
					console.log('line 433');
					var result = chooseConversion(type, typeUnits, value, typeChange);
					console.log('line 435: '+result.value);
				}
				else{
					var result = {};
					result.value = value;
					result.label = objectFound.units;
					console.log('test');
				}
				if(type != "time"){
					value = round(result.value, objectFound.precision);
					console.log('line 443: '+value);
				}
				else{
					value = result.value;
				}
				if(objectFound.hasOwnProperty('labelOverride') && objectFound.labelOverride == true){
					label = objectFound.label;
					$('div#div_' + id + '').children('.label').html(label);
				}
				else{
					label = result.label;
					objectFound.setLabel(label);
					$('div#div_' + id + '').children('.label').html(label);
				}
				
			}
			else if((objectFound.hasOwnProperty('type')) && (objectFound.hasOwnProperty('typeUnits'))){
				if(objectFound.hasOwnProperty('labelOverride') && objectFound.labelOverride == true){
					label = objectFound.label;
					$('div#div_' + id + '').children('.label').html(label);
				}
				else{
					label = objectFound.units;
					$('div#div_' + id + '').children('.label').html(label);
				}
			}
			else if(!isNaN(value)){
				value = round(parseFloat(value), objectFound.precision);
			}
			
			objectFound.value = 0;
			$('div#div_' + objectFound.id + '').children('p').text(value);
		}
		if (value === undefined) {
			value = 'MISSING DATA!';
		}
		
		clearInterval(ageInterval);						
		ageTimer();
    }
	});
	
}
function chooseConversion(type, typeUnits, value, typeChange){
	if(type == "temperature"){
		var x = TemperatureConvert.init(typeUnits, typeChange, value);
		return x;
	}
	else if(type == "speed"){
		return SpeedConvert.init(typeUnits, typeChange, value);
	}
	else if(type == "length"){
		console.log('line 497: '+type+' , '+typeUnits+' , '+value+' , '+typeChange);
		return LengthConvert.init(typeUnits, typeChange, value);
	}
	else if(type == "time"){
		return TimeConvert.init(typeUnits, typeChange, value);
	}
	else if(type == "atmosphericPressure"){
		typeChange = typeChange.toUpperCase();
		console.log('line 497: '+type+' , '+typeUnits+' , '+value+' , '+typeChange);
		return AtmosphericPressureConvert.init(typeUnits, typeChange, value);	
	}
}
function timer(){
	loadedTime = loadedTime+1;
	camTime = camTime+1;
	time = time+1;
	
	treeRefreshTimer = treeRefreshTimer+1;
	var convertedLoad = secToTime(loadedTime);
	$('#timer').text("Last data received " + time + " seconds ago - "+convertedLoad+' since page was loaded');
	//$('#camTimer').text("Camera image from approximately " + camTime + " seconds ago");
	if(time > 30){
		$('#timer').text("30+ seconds since last data received. Try refreshing your browser window.");
	}
	if(loadedTime%30 == 0){
		console.log(convertedLoad+' since page was loaded');	
	}
}
function clickToCreate(item, data, x ,y){
	var id = $(item).parent().parent().attr('id');
	var cellCount = cell_arr.length;
	var obj, new_id;
	if($('#'+id).hasClass('dataDraggable') || $('#'+id).hasClass('jstree-leaf')){
		obj = new pageCell();
		var idArrLen = cell_arr.length;
		new_id = "div_"+id+"_"+idArrLen;
		var treeNode = $.jstree.reference('#stationTree').get_node(id);
		var path = $('#stationTree').jstree(true).get_node(id).original.obj.path;
		var tooltip = path.substring(1).replace(staticRegexPeriod, " >> ");
		console.log(tooltip);
		var value = $('#stationTree').jstree(true).get_node(id).original.obj.value; 
		var units, title, type, typeUnits;
		obj["path"] = path;
		obj["id"] = id+"_"+idArrLen;
		obj["parentId"] = "cell"+cellCount;
		obj["containerId"] = new_id;
		obj["fullId"] = new_id;
		obj["toolTip"] = tooltip;
		if(obj["path"] == "timeStamp"){
			obj["value"] = 0;	
		}
		//gets typeUnits if there
		if($('#stationTree').jstree(true).get_node(id).original.obj.typeUnits){
			typeUnits = $('#stationTree').jstree(true).get_node(id).original.obj.typeUnits;
			obj["typeUnits"] = typeUnits;
		}
		else{
			typeUnits = "";
		}
		//gets type if there
		if($('#stationTree').jstree(true).get_node(id).original.obj.type){
			type = $('#stationTree').jstree(true).get_node(id).original.obj.type;
			obj["type"] = type;
		}
		else{
			type = "";
		}
		//gets units if there
		if($('#stationTree').jstree(true).get_node(id).original.obj.units){
			units = $('#stationTree').jstree(true).get_node(id).original.obj.units;
			obj["units"] = units;
		}
		else{
			units = "";
		}
		//gets title if there
		if($('#stationTree').jstree(true).get_node(id).original.obj.title){
			title = $('#stationTree').jstree(true).get_node(id).original.obj.title; 
			obj["title"] = title;
			var tooltipSplit = path.substring(1).split(staticRegexPeriod);
			tooltip = '';
			for(var i =0; i<tooltipSplit.length-2; i++){
				tooltip = tooltip+tooltipSplit[i]+' >> ';	
			}
			tooltip = tooltip+title;
			obj["toolTip"] = tooltip;
			console.log(tooltipSplit);
		}
		//case for elements with no valid path
		else{
			title = $('#'+id).text();
			obj["title"] = title;
			if(title == 'Age of Data'){
				var parentId = $('#stationTree').jstree(true).get_node(id).original.parent;
				var parentPath =  $('#stationTree').jstree(true).get_node(parentId).original.obj.path;
				var tooltipSplit = parentPath.substring(1).split(staticRegexPeriod);
				tooltip = '';
				for(var i =0; i<tooltipSplit.length; i++){
					tooltip = tooltip+tooltipSplit[i]+' >> ';	
				}
				tooltip = tooltip+title;
				console.log(tooltip);
				obj["toolTip"] = tooltip;
				console.log(tooltipSplit);
			}
		}
		
		obj["precision"] = 3;
		path_arr.push(path);
		id_arr.push(new_id);
		cell_arr.push(obj);
		console.log(obj);
			var updatedPath = ref(data, path);
			obj.createHtml(cellCount, updatedPath, x ,y);
		new_id = obj.parentId;
	 	positionDiv(obj, new_id);
		cellCount++;
	}
	else if($('#'+id).hasClass('draggableCamNode')){
		obj = new pageCam();
		var idArrLen = cell_arr.length;
		var instance = $('#stationTree').jstree(true);
		//var id = $(item).attr('id');
		new_id = "div_"+id+"_pageCam_"+idArrLen;
		var children = instance.get_node(id).children;
		var clength = children.length;
		var i;
		var path = $('#stationTree').jstree(true).get_node(id).original.obj.path;
		var tooltip = path.substring(1).replace(staticRegexPeriod, " >> ");
		console.log('TOOLTIP '+tooltip);
		obj["path"] = path;
		obj["containerId"] = new_id;
		obj["fullId"] = new_id;
		obj["parentId"] = new_id;
		obj["id"] = id+"_pageCam_"+idArrLen;
		obj["toolTip"] = tooltip;
		console.log(obj);
		//cell_arr.push(obj);
		var sendPath = ref(data, path);
		obj.createHtml(cellCount, sendPath, x, y);
		obj.setHover(true, obj.hoverDelay);
		console.log($('#'+new_id));
		positionDiv(obj, new_id);
		cellCount++;
	}
		
}

function positionDiv(obj, new_id){
var posTop, posLeft, width, height;
	collapseWindows();
	var posSpan = document.createElement("SPAN"); 
	var posDiv = document.createElement("DIV");
	posDiv.id = 'positionDiv';
	console.log(new_id);
	$('#rulerBox2').append(posDiv);
	console.log($('#'+new_id));
	posSpan.textContent = "("+posLeft+", "+posTop+")";
	posSpan.id = 'positionSpan';
	$('#positionDiv').append('<i class="fa fa-long-arrow-down fa-rotate-320"></i>');
	$('#positionDiv').append(posSpan);
	$( document ).one('mousemove', function(e){
		$('#rulerBox, #rulerBox2, #rulerBox3').show();
	});
	$( document ).on('mousemove', function(e){
		posTop = (Math.floor(e.pageY / obj.gridProps.size) * obj.gridProps.size);
		posLeft = (Math.floor(e.pageX / obj.gridProps.size) * obj.gridProps.size);
		width = posLeft+'px';	
		height = posTop+'px';

		$('#positionSpan').text("("+posLeft+", "+posTop+")");
		$('#'+new_id).css({
			'top': posTop,
			'left': posLeft
		});
		$('#positionDiv').css('top', posTop-18);
		$('#rulerBox').css({
			height: height,
			width: width
		});
		$('#rulerBox2').css({
			left: width,
			height: height,
			width: "100%",
		});
		$('#rulerBox3').css({
			top: height,
			width: width,
			height: "100%",
		});
	});
	$( document ).on('mousedown', function(e){
		console.log('click');
		$('#rulerBox, #rulerBox2, #rulerBox3').hide();	
		$('#positionDiv').remove();
			$( document ).off('mousemove');
			$( document ).off('mousedown');
			$( document ).off('keyup');
			collapseWindows();

			$( document ).keyup(function(e) {
				if (e.keyCode == 27){
					collapseWindows()			
				}
			});
	});
	$( document ).off('keyup');
	$( document ).keyup(function(e) {
		if (e.keyCode == 27){
			obj.removeSelf();
			$('#positionDiv').remove();
			$('#rulerBox, #rulerBox2, #rulerBox3').hide();	
			$( document ).off('mousemove');
			$( document ).off('mousedown');
			$( document ).off('keyup');
			collapseWindows();

			$( document ).keyup(function(e) {
				if (e.keyCode == 27){
					collapseWindows()			
				}
			});
		}
	});
}

function collapseWindows(){
	if(isExpanded){
		$('.controls').animate({'width': '0px', 'margin':'0', 'padding': '0'},100);
		$('.editWindow').animate({'width': '0px', 'margin':'0', 'padding': '0'},50);
		$('.controlRow').hide();
		$('#stationTree').hide();
		console.log('now collapsed');
		$("#editMaximize").show();
		$("#editMinimize").hide();
		isExpanded = false;
		console.log('test');
	}
	else{
		$('.controls').animate({'width': '250px', 'padding-left': '10px', 'padding-right': '10px'},200);
		$('.editWindow').animate({'width': '280px','padding': '20px'},200);	
		$('.controlRow').show();
		$('#stationTree').show();
		console.log('now expanded');
		$("#editMaximize").hide();
		$("#editMinimize").show();
		isExpanded = true;
	}
}
/*function that periodically updates the data */
function data_update(data) {
	time=0;
	var incomingData = data;
	//var cams = getCamData(data);
    if (started === false) { //we only want the below block of code to execute once because it is in charge of data creation and initiating a path to the various nested object properties
		started = true; //sets our boolean to true so the above only executes once
        $(".controls").resizable({ //makes our controls div resizable and draggable
            minHeight: 70,
			maxWidth: 250,
			resize: function (event, ui){
				if(ui.size.width <= 25){
					$(".controls").css("padding-left", "1px").css("padding-right","1px");
					$(".controls").children("#stationTree, .controlRow, .controlsTitle").hide();
					//$("#stationTree").hide();
				}
				else{
					$(".controls").css("padding-left", "10px").css("padding-right","10px");
					$(".controls").children("#stationTree, .controlRow, .controlsTitle").show();					
					//$("#stationTree").show();
				}
			}
        });
        $(document).ready(function() {
			$( "#fontComboBox" ).combobox({
				 select: function (event, ui) { 
					$('#comboBoxInput').attr('value', this.value);
					$('#comboBoxInput').text(this.value).trigger("input");
				} 
			});
			$( document ).off('click','#loadConfig').on('click', '#loadConfig', function() {
				loadFromList();	
			});
			// all tooltips located in tooltips.js due to messy strings
			$('[title]:not(.imgBlockContainer, .imgCamContainer, .textBlockContainer, .imgBlockContainer)').tooltip({ 
				//items: ":not(.imgBlockContainer, .imgCamContainer, .textBlockContainer, .imgBlockContainer)",
				position: {my: "right bottom"},
				show: { effect: "fade", delay: 600 },
				content: function() {
					var element = $( this );
					if(	element.is( "#bodyInputInfo" )){
						return tooltips.bodyInput;
					}
					else if( element.is( "#jsTreeInfo" )){
						return tooltips.jsTree;
					}
					else{
						return element.attr( "title" );
					}
			   }
					
			});
			//attempts to grab the get parameter to set background color
			var bgColor = getUrlVars()["bgColor"];
			if(bgColor !== undefined){
				$('html').css('background-color',bgColor);
			}
			setInterval(timer,1000);
			//populateCams(cams);
			var lastk = "#";
			var jsonArray = [];
			var json = iterateStations(data, "", jsonArray, lastk);
			//sets up our tree
			$(function () {$('#stationTree').jstree({ 'core' : {'multiple' : false, 'cache':false, 'data' : jsonArray},"plugins" : [ "sort" ]})});
			//adds classes from object properties to certain nodes in the tree - this allows for certain nodes to be dragged out of tree and 
			$("#stationTree")
				.bind('open_node.jstree', function(e, data) {
					$( "li.jstree-node" ).each(function() {
						var id = $(this).attr('id');
						var findClass = $('#stationTree').jstree(true).get_node(id).original.obj.class;
						$(this).addClass(findClass);
						

					});
					$('.jstree-themeicon').off('click').on('click', function(e) {
						var item = this;
						var pageX = e.pageX;
						var pageY = e.pageY;
						clickToCreate(item, incomingData, pageX, pageY)
					});

				})

			//sets up the drag and drop for the tree
			
			
		//grabs layout parameter fromt he url
		var layout = getUrlVars()["layout"];
		var cellCount = cell_arr.length;
		data_object.ValueGet(function(rsp){
				if(!rsp.data || rsp.error){
					// Couldn't get configuration data from server
					return;
				}
				console.log(rsp);
				var loadedLayout = rsp.data[layout];
				console.log(loadedLayout);
				getConfigs(rsp.data)
				if (layout) {
					loadState(loadedLayout);
					$(".imgCamContainer").draggable( "option", "disabled", true ).resizable( "option", "disabled", true );
					$(".draggable").draggable( "option", "disabled", true ).resizable( "option", "disabled", true );
					$('.textBlockContainer').draggable( "option", "disabled", true ).resizable( "option", "disabled", true );
					$('.imgBlockContainer').draggable( "option", "disabled", true ).resizable( "option", "disabled", true );
					var lastCell = $('#'+id_arr[id_arr.length-1]).parent().attr('id');
					cellCount = parseInt(lastCell, 10)+1;
				}

			},'webdisplay/configs');			
		//if layout parameter found, load that layout
		if(layout != undefined){
		   $(".imgCamContainer").draggable( "option", "disabled", true ).resizable( "option", "disabled", true );
		   $(".draggable").draggable( "option", "disabled", true ).resizable( "option", "disabled", true );
		   $('.textBlockContainer').draggable( "option", "disabled", true ).resizable( "option", "disabled", true );
		   $('.imgBlockContainer').draggable( "option", "disabled", true ).resizable( "option", "disabled", true );

		}
		var objId = 'pageSettings';	
		console.log(cell_arr);
		var elementPos = cell_arr.map(function(x) {return x.id; }).indexOf(objId);
		var pageSettingsObj = cell_arr[elementPos];
		console.log(elementPos);
		
		if(elementPos <= -1){
			pageSettingsObj = new pageSettings();
			pageSettingsObj.setPageTitle('wsWebDisplay');
			pageSettingsObj.createGrid(10);
			cell_arr.push(pageSettingsObj);
			console.log(pageSettingsObj);
		}			
        });
		
	}
	var x = $(document).ready(function() {
		$( document ).off( "click", "#refreshTree" );
		$( document ).on( "click", "#refreshTree" , function() {	
			refreshTree(data);
		});	
		//if edit mode is not on and it has been almost 15 seconds since last tree refresh, the tree will refresh
		if(editMode == false && treeRefreshTimer >= 14){
			refreshTree(data);	
			console.log('refreshed');
			treeRefreshTimer = 0;
		}
	});
	// clears document ready function
	x = null;
	//refreshCams(cams);
	dynamicUpdate( data); //updates all data cells to their current values
	
}
//gets parameters in url
//called like: var host = getUrlVars()["host"];
function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,    
    function(m,key,value) {
      vars[key] = value;
    });
    return vars;
  }

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function getConfigs(data) {
	for(var k in data){
		$('#configDrop')
          .append($('<option>', { value : k })
          .text(k));
	}
}

function loadFromList(){
	var arrlength = cell_arr.length;
	for(var i = 0; i< arrlength; i++){
		console.log(cell_arr[i]);		
		$('#'+cell_arr[i].parentId).remove();
	}
	cell_arr.length = 0;
	data_object.ValueGet(function(rsp){
		if(!rsp.data || rsp.error){
			// Couldn't get configuration data from server
			return;
		}
		console.log(rsp);
		console.log(loadedLayout);
		var selected = $( "#configDrop option:selected" ).text();
		var loadedLayout = rsp.data[selected];
		
		loadState(rsp.data[selected]);
		$('.gridlines').show();

		$(".imgCamContainer").draggable( "option", "disabled", true ).resizable( "option", "disabled", true );
		$(".draggable").draggable( "option", "disabled", true ).resizable( "option", "disabled", true );
		$('.textBlockContainer').draggable( "option", "disabled", true ).resizable( "option", "disabled", true );
		$('.imgBlockContainer').draggable( "option", "disabled", true ).resizable( "option", "disabled", true );
		var lastCell = $('#'+id_arr[id_arr.length-1]).parent().attr('id');
		cellCount = parseInt(lastCell, 10)+1;
	
	},'webdisplay/configs');
	
}
var data_object;
/*function initiates the data transfer*/
function data_start() {
	ageTimer();
	$('#version').text(wdVersion);
	//user defined host via url get parameter 
	var host = getUrlVars()["host"];
	if(host == undefined){
		host = HOST_DEFAULT;
	}
	//config_retr("http://"+host+":8888/.config");
    data_object = new BroadcastClient({
        callback_update: data_update,
        callback_error: data_error,
		url: 'http://'+host+':8888/.data/',
    });
	data_object.ValueGet(function(rsp){
		if(!rsp.data || rsp.error){
			// Couldn't get configuration data from server
			return;
		}
		console.log(rsp);
		// If ?display=x is specified in the URL, load that one
		var load = getParameterByName('display');
		var loadedConfig = JSON.stringify(rsp.data[load]);
		console.log(loadedConfig);
		if (load) {
				loadState(loadedConfig);
				$(".imgCamContainer").draggable( "option", "disabled", true ).resizable( "option", "disabled", true );
				$(".draggable").draggable( "option", "disabled", true ).resizable( "option", "disabled", true );
				$('#ws_status').draggable( "option", "disabled", true ).resizable( "option", "disabled", true );
				$('.textBlockContainer').draggable( "option", "disabled", true ).resizable( "option", "disabled", true );
				$('.imgBlockContainer').draggable( "option", "disabled", true ).resizable( "option", "disabled", true );
		}
	},'webdisplay/configs');
	var title = getUrlVars()["title"];
	if(title == undefined){
    	document.title = TITLE_DEFAULT;
	}
	else{
		document.title = title.replace('%20'," ");	
	}
}
function createText(){
	var textBlock, textTitle, textContent, title, index;
	textBlock = new pageText();
	index = cell_arr.length;
	textBlock.createHtml(index);
	cell_arr.push(textBlock);

}
function createImage(){
	var imgBlock, imgURL, index;
	index = cell_arr.length;
	imgBlock = new pageImg();
	imgBlock.id = 'img'+index;
	imgBlock.parentId = 'img'+index+'container';
	imgURL = $('#createImageURL').val();
	imgBlock.createHtml(index);
	imgBlock.natHeight = 240;
	imgBlock.natWidth = 320;
	cell_arr.push(imgBlock);
	//allows images to be hoverable outside of edit function
	var hoverTime;
	var hoverImage = document.createElement('img');
	imgBlock.hoverDelay = 1;
	imgBlock.setSuppression(true);
	imgBlock.setHover(false, imgBlock.hoverDelay);
}
function refreshTree(newData){
	var lastk = "#";
	var jsonArray = [];
	iterateStations(newData, "", jsonArray, lastk);
	$('#stationTree').jstree(true).settings.core.data = jsonArray;
	$('#stationTree').jstree(true).refresh();
	//empty array for the sake of performance
	jsonArray.length = 0;
}
/* function that removes an image if it returns a 404 error.*/
function brokenImg(id){
	alert('invalid URL - please paste a valid URL');
}
//populates the conversion dropdown based on the id
function populateConversions(id){
	$('#unitRow').hide();
	var temperatureUnits = ['C','F','K'];
	var speedUnits = ['KM/HR','MI/HR','M/S','KTS'];
	var lengthUnits = ['IN','FT','MI','MM','CM','M','KM'];
	var timeUnits = ['UNIX','MYSQL'];
	var apUnits = ['Atmosphere','Pascal','Bar','millibar','hectopascal','mmHg','inHg','psi'];
	
	id = id.replace('div_', '');	
	var cellObj = $.grep(cell_arr, function(e){ return e.id === id});
	var type = cellObj[0].type;
	var label = cellObj[0].units;
	var currentUnits = cellObj[0].typeUnits;
	//empty selection list in case there was elements in it from the last click
	$("#unitSelect").empty();
	//leave function if either undefined
	if(currentUnits == 'undefined' || type == 'undefined'){
		console.log('fail');
		return;	
	}
	else{
		//
		//logic block that matches type with one of the arrays above. it will then populate the selection list in the edit window and unhide it.
		//
		if(type == 'temperature'){
			var i = 0;
			var length = temperatureUnits.length;
			for(i; i<length; i++){
				console.log(temperatureUnits[i]);
				$('#unitSelect').append($('<option>', {
					value: temperatureUnits[i],
					text: ''+temperatureUnits[i]+''
				}));	
			}
			$('#unitRow').show();
		}
		else if(type == 'speed'){
			var i = 0;
			var length = speedUnits.length;
			for(i; i<length; i++){
				console.log(speedUnits[i]);
				$('#unitSelect').append($('<option>', {
					value: speedUnits[i],
					text: ''+speedUnits[i]+''
				}));	
			}
			$('#unitRow').show();
		}
		else if(type == 'length'){
			var i = 0;
			var length = lengthUnits.length;
			for(i; i<length; i++){
				console.log(lengthUnits[i]);
				$('#unitSelect').append($('<option>', {
					value: lengthUnits[i],
					text: ''+lengthUnits[i]+''
				}));	
			}
			$('#unitRow').show();
		}
		else if(type == 'time'){
			var i = 0;
			var length = timeUnits.length;
			for(i; i<length; i++){
				console.log(timeUnits[i]);
				$('#unitSelect').append($('<option>', {
					value: timeUnits[i],
					text: ''+timeUnits[i]+''
				}));	
			}
			$('#unitRow').show();
		}
		else if(type == 'atmosphericPressure'){
			var i = 0;
			var length = apUnits.length;
			for(i; i<length; i++){
				console.log(apUnits[i]);
				$('#unitSelect').append($('<option>', {
					value: apUnits[i],
					text: ''+apUnits[i]+''
				}));	
			}
			$('#unitRow').show();
		}
		//leave function due to incorrect format of object.type
		else{
			return;	
		}
		$("#unitSelect").val(currentUnits);
	}
}

var editWindow =  function(e) {
	
	var changeArray, moduleContainer, selectedModule, body, title, label, url, titleChange, labelChange, textColor, bgColor, urlChange, id, value, submitButton, fontPlus, fontMinus, bodyChange, fontSize, originalTitle;
	titleChange = $('.titleChange');
	labelChange = $('.labelChange');
	bodyChange = $('.bodyChange');
	urlChange = $('.urlChange');
	fontSize = $('#comboBoxInput');
	fontPlus = $('#fontSizePlus');
	fontMinus = $('#fontSizeMinus');
	bgColor = $('.backgroundColorChange');
	textColor= $('.textColorChange');
	$('#gridRow, #cropRow, #hideDelRow, #configRow, #staticRow, #hoverTimeRow, #hoverRow, #roundingRow, #unitRow, #zRow, #titleRow, #labelRow, #urlRow, #bodyRow, #fontSizeRow, #backgroundColorRow, #textColorRow, #opacityRow, #resizeModule, #cropModule, #endCrop, #suppressHoverable, #titleInputInfo').hide();
	$('.editWindow').removeClass('editHide').show(150);
	$("#editMaximize").hide();
	$("#editMinimize").show();
	selectedModule = $(this).attr('id');
	
	
	
	//color picker setup
	$('.backgroundColorChange, .textColorChange').colorpicker({
		transparentColor: true,
		defaultPalette: 'web',
		showOn: "button"
	});
	var bgColorVal = $('#'+selectedModule).css('background-color');
	var textColorVal = $('#'+selectedModule).css('color');
	$('#backgroundColorRow').find('.evo-colorind-ff').css('background-color', bgColorVal);
	$('#textColorRow').find('.evo-colorind-ff').css('background-color',textColorVal);

	$(".backgroundColorChange").off("change.color");
	$(".backgroundColorChange").on("change.color", function(event, color){
    	$('#'+selectedModule).css('background-color', color);
		$('#opacitySlider .ui-slider-range').css('background', color );
  		$('#opacitySlider .ui-slider-handle').css('border-color', color);
	});
	$('#hideModule,#deleteModule').show();
	
	$(document).off('click','.tr, .textBlockContainer, .imgBlockContainer, .imgCamContainer');
/*****************************************************************
MULTIPLE SELECTIONS (shift key is held when clicking)
******************************************************************/			
	if(e.ctrlKey && ($('#'+selectedModule).hasClass('imgCamContainer') || $('#'+selectedModule).hasClass('imgBlockContainer')||$('#'+selectedModule).hasClass('tr') ||$('#'+selectedModule).hasClass('textBlockContainer') )) {	
		var length = tempArray.length;
		if(length > 0){
			$('#hideDelRow, #fontSizeRow, #backgroundColorRow, #textColorRow, #opacityRow').show();
		}
		else{
			$('#hideDelRow, #fontSizeRow, #backgroundColorRow, #textColorRow, #opacityRow, .editWindow').hide();
		}
		$('.selectedShadow').removeClass('selectedShadow');
		for(var i = 0; i<length; i++){
			var parent = tempArray[i].parentId;	
			$('#'+parent).addClass('selectedShadow');
		}
		var clicked = this;
		var id;
		var elementPos = tempArray.map(function(x) {return x.parentId; }).indexOf(selectedModule);
		var objectFound;
		//if element is in the array we want it to be removed from the array if it is clicked
		if(elementPos != -1){
			$('#'+selectedModule).removeClass('selectedShadow');
			tempArray.splice(elementPos, 1);
			console.log(tempArray);
			if(tempArray.length === 0){
				$('.editWindow').hide();
			}
			else{
				selectedModule = tempArray[0].parentId;
				objectFound = tempArray[0];
				console.log(selectedModule);
			}
		}
		else{
			elementPos = cell_arr.map(function(x) {return x.parentId; }).indexOf(selectedModule);
			objectFound = cell_arr[elementPos];
			tempArray.push(objectFound);
			$(clicked).addClass('selectedShadow');
		}
		if(tempArray.length > 0){
			$('.editWindow h2').text('Multiple Elements');
			var tempLength = tempArray.length;
			var sliderValue, backgroundColor;
			if(objectFound.getType == 'pageCell' || objectFound.getType == 'pageText'){
				backgroundColor = objectFound.backgroundColor;
			}
			else{
				backgroundColor = 'rgba(0,0,0,0)';	
			}
			//destroy previous sliders
			var sliderExists = $("#opacitySlider").is(':ui-slider');
			if(sliderExists){
				$('#opacitySlider').slider('destroy');
			}
			sliderExists = $("#zSlider").is(':ui-slider');
			if(sliderExists){
				$('#zSlider').slider('destroy');
			}
			//delete key handler
			$( 'html').off('keyup');
			$( 'html').on('keyup', function(e){
				if (e.keyCode == 46 && !$(e.target).is('input, textarea')){
					console.log(tempArray);
					for(var i = 0; i<tempLength; i++){
						tempArray[i].removeSelf();	
					}
					$('.editWindow').hide(150);	
					console.log(cell_arr);
				}
			});
			//font size handler
			$('#comboBoxInput').off('input');
			$('#comboBoxInput').on('input', function() { 
				console.log('fired');
				var input = this;
				//wait a fraction of a second for the combobox to register the change
				setTimeout(function () {
					var newSize = $(input).val() // get the current value of the input field.
					console.log(newSize);
					for(var i = 0; i<tempLength; i++){
						if(tempArray[i].getType() == 'pageCell' || tempArray[i].getType() =='pageText'){
							tempArray[i].fontSizeChange(newSize);
						}
					}
				}, 100);
			});
			//fontsize input change event handler
			$( document ).off( "keyup", "input#fontSize") //unbind old events, and bind a new one
			$( document ).on( "keyup", "input#fontSize" , function() {	
				var size = fontSize.val()
				for(var i = 0; i<tempLength; i++){
					if(tempArray[i].getType() == 'pageCell' || tempArray[i].getType() =='pageText'){
						tempArray[i].fontSizeChange(size)
					}
				}
			});
			//background color input change event handler
			$( document ).off( "keyup", "input.backgroundColorChange"); //unbind old events, and bind a new one
			$( document ).on( "keyup", "input.backgroundColorChange" , function() {	
				var enteredColor = bgColor.val();
				for(var i = 0; i<tempLength; i++){
					if(tempArray[i].getType() == 'pageCell' || tempArray[i].getType() =='pageText'){
						tempArray[i].backgroundColorChange(enteredColor);
					}
				}
			});
			//delegate event handler for color picker
			$(".backgroundColorChange").off("change.color");
			$(".backgroundColorChange").on("change.color", function(event, color){
				if(color != undefined){
					for(var i = 0; i<tempLength; i++){
						if(tempArray[i].getType() == 'pageCell' || tempArray[i].getType() =='pageText'){
							tempArray[i].backgroundColorChange(color);
						}
					}
				}
			});
			//delegate event handler for font color picker
			$(".textColorChange").off("change.color");
			$(".textColorChange").on("change.color", function(event, color){
				if(color != undefined){
					for(var i = 0; i<tempLength; i++){
						if(tempArray[i].getType() == 'pageCell' || tempArray[i].getType() =='pageText'){
							tempArray[i].fontColorChange(color);
						}
					}
				}
			});
			$(".textColorChange").off("change.color");
			$(".textColorChange").on("change.color", function(event, color){
				for(var i = 0; i<tempLength; i++){
					if(tempArray[i].getType() == 'pageCell' || tempArray[i].getType() =='pageText'){
						tempArray[i].fontColorChange(color);
					}
				}
			});
			
			if(backgroundColor.indexOf('rgba') >= 0){
				var splitColor =  backgroundColor.split(',');
				sliderValue = Math.round(parseFloat(splitColor[3].slice(0, - 1), 10)*100);
			}
			else{
				sliderValue = 100;
			}
			$('#opacitySlider .ui-slider-range').css('background', backgroundColor );
			$('#opacitySlider .ui-slider-handle').css('border-color', backgroundColor);
			$('#opacityPercent').text(' '+sliderValue+'%');
			//opacity slider setup
			$('#opacitySlider').slider({
				min: 1,
				max: 100,
				range: "min",
				value: sliderValue,
				stop: function( event, ui) {
					var opacity = $(this).slider('value', ui.value);
					for(var i = 0; i<tempLength; i++){
						if(tempArray[i].getType() == 'pageCell' || tempArray[i].getType() =='pageText'){
							console.log(tempArray[i]);
							tempArray[i].setOpacity(opacity, tempArray[i].parentId, ui);
						}
					}
				}
			});//end of slider setup
			$( document ).off( "click", "#deleteModule"); //unbind old events, and bind a new one
			$( document ).on( "click", "#deleteModule" , function() {	
				for(var i = 0; i<tempLength; i++){
					tempArray[i].removeSelf();	
				}
				$('.editWindow').hide(150);
			});
			$( document ).off( "click", "#hideModule") //unbind old events, and bind a new one
			$( document ).on( "click", "#hideModule" , function() {
				for(var i = 0; i<tempLength; i++){
					tempArray[i].setHidden(tempArray[i].parentId);				

				}
			});
		}
	}
/*****************************************************************
CREATE STATIC ELEMENTS CASE
******************************************************************/	
	else if($(this).attr('id') == 'createStatic'){
		$('.editWindow h2').text("Static Elements");
		$('#staticRow').show();
	}
/*****************************************************************
CONFIGRATIONS CASE
******************************************************************/	
	else if($(this).attr('id') == 'configMenu'){
		$('.editWindow h2').text("Configurations");
		$('#configRow').show();
	}
/*****************************************************************
PAGE EDIT CASE
******************************************************************/	
	else if($(this).attr('id') == 'pageEdit'){
		tempArray.length = 0;
		$('.imgBlockContainer, .textBlockContainer, .imgCamContainer, .tr').removeClass('selectedShadow');
		$('.editWindow h2').text("Page");
		$('#gridRow, #titleRow,#backgroundColorRow,#opacityRow,#titleInputInfo').show();
		$('#hideModule,#deleteModule').hide();
		$('.titleChange').val(document.title);
		$('.backgroundColorChange').val($('html').css('background-color'));
	
		var objId = 'pageSettings';	
		var elementPos = cell_arr.map(function(x) {return x.id; }).indexOf(objId);
		var objectFound = cell_arr[elementPos];
		var gridSize = objectFound.gridProps.size;
		var backgroundColor = objectFound.backgroundColor;
		console.log(backgroundColor);
		
		$('.gridSelect').val(gridSize);
		
		//delegate event handler for color picker
		$(".backgroundColorChange").off("change.color");
		$(".backgroundColorChange").on("change.color", function(event, color){
			if(color != undefined){
				objectFound.backgroundColorChange(color);
				console.log(color);
			}
		});
		
		//gridSize toggle event handler
		$( document ).off( "change", ".gridSelect");
		$( document ).on( "change", ".gridSelect", function() {
			var newSize = parseInt($('.gridSelect').val(), 10);
			objectFound.gridProps.size = newSize; 
			objectFound.updateGrid(newSize)	
		});
		
		//background color input change event handler
		$( document ).off( "keyup", "input.backgroundColorChange"); //unbind old events, and bind a new one
		$( document ).on( "keyup", "input.backgroundColorChange" , function() {	
			var enteredColor = bgColor.val();
			objectFound.backgroundColorChange(enteredColor);
			
		});
		
		//delegate title change event handler
		$( document ).off( "keyup", "input.titleChange"); //unbind old events, and bind a new one
		$( document ).on( "keyup", "input.titleChange" , function() {	
			var newTitle = titleChange.val();
			objectFound.setPageTitle(newTitle);
		});
		
		var sliderValue;
		if(backgroundColor.indexOf('rgba') >= 0){
			var splitColor =  backgroundColor.split(',');
			sliderValue = Math.round(parseFloat(splitColor[3].slice(0, - 1), 10)*100);
		}
		else{
			sliderValue = 100;
		}
		$('#opacitySlider .ui-slider-range').css('background', backgroundColor );
  		$('#opacitySlider .ui-slider-handle').css('border-color', backgroundColor);
		$('#opacityPercent').text(' '+sliderValue+'%');
		//opacity slider setup
		$('#opacitySlider').slider({
			min: 1,
			max: 100,
			range: "min",
			value: sliderValue,
			slide: function( event, ui ) {
				var opacity = $(this).slider('value', ui.value);
				opacity = opacity.toString();
				var newColor;
				if($('html').css('background-color').indexOf("rgba") < 0){
					
					newColor = $('html').css('background-color').replace(')', ', '+((ui.value)*.01)+')').replace('rgb', 'rgba');
				}
				else{
					var currentColor = $('html').css('background-color');
					var splitColor = currentColor.split(',');
					newColor = splitColor[0] + "," + splitColor[1] + "," + splitColor[2] + "," + (Math.round(ui.value)*.01) + ')';
					$('#opacityPercent').text(' '+ui.value+'%');
				}
				objectFound.backgroundColorChange(newColor);
				/*$('html').css('background-color', newColor);
				$('.backgroundColorChange').val(''+newColor);
				$('#opacitySlider .ui-slider-range').css('background', newColor );
  				$('#opacitySlider .ui-slider-handle').css('border-color', newColor);*/
			}
		});
	}
/*****************************************************************
CAMERA CASE
******************************************************************/	
	else if($(this).hasClass('imgCamContainer')){
		$('#hideDelRow,#cropRow, #cropModule, #resizeModule, #zRow, #hoverRow').show();
		$('.editWindow h2').text($(this).attr('title'));
		$('.imgBlockContainer, .textBlockContainer, .imgCamContainer, .tr').removeClass('selectedShadow');
		$(this).addClass('selectedShadow');
		
		moduleContainer = $(this).attr('id');
		console.log(moduleContainer);
		var objId = moduleContainer.replace('div_','');	
		var elementPos = cell_arr.map(function(x) {return x.id; }).indexOf(objId);
		var objectFound = cell_arr[elementPos];
		objectFound.setSelected();
		tempArray.length = 0;
		tempArray.push(objectFound);
		if(objectFound.hoverable){
			$('#hoverTimeRow, #suppressHoverable').show();		
		}
		
		console.log(objectFound);
		
		var camera = $(this);
		//checks to see if image has added hoverables class and checks appropriate radio button
		var radiobtn
		$('#hoverTime').val(objectFound.hoverDelay);
		if(objectFound.hoverable == true){
			radiobtn = document.getElementById("hoverEnabled");
			radiobtn.checked = true;
			$('#hoverTimeRow, #suppressHoverable').show();
		}
		else{
			radiobtn = document.getElementById("hoverDisabled");
			radiobtn.checked = true;
		}
		var suppressButton;
		if(objectFound.suppressed == true){
			suppressButton = document.getElementById("suppressHover");
			suppressButton.checked = true;
			camera.addClass('suppressHover');
		}
		else{
			suppressButton = document.getElementById("unsuppressHover");
			suppressButton.checked = true;
			camera.removeClass('suppressHover');
		}
		var radioChecked;
		$( document ).off( "change", "input[type=radio][name=hoverToggle]");
		$( document ).on( "change", "input[type=radio][name=hoverToggle]", function(){
			radioChecked = $('input[name=hoverToggle]:checked').val();
			if(radioChecked == 'enabled'){
				objectFound.setHover(true, objectFound.hoverDelay);
				$('#hoverTimeRow, #suppressHoverable').show();		

			}
			else{
				objectFound.setHover(false, objectFound.hoverDelay);
				$('#hoverTimeRow, #suppressHoverable').hide();		

			}
		});
		var suppressedChecked;
		$( document ).off( "change", "input[type=radio][name=suppressHover]");
		$( document ).on( "change", "input[type=radio][name=suppressHover]", function(){
			suppressedChecked = $('input[name=suppressHover]:checked').val();
			if(suppressedChecked == 'enabled'){
				objectFound.suppressed = true;
				objectFound.setHover(objectFound.hoverable, objectFound.hoverDelay);
			}
			else{
				objectFound.suppressed = false;
				objectFound.setHover(objectFound.hoverable, objectFound.hoverDelay);
			}
		});
		$( document ).off( "keyup", "input#hoverTime");
		$( document ).on( "keyup", "input#hoverTime" , function() {
			console.log(parseInt($('input#hoverTime').val()));
			if(!isNaN($('input#hoverTime').val())){
				objectFound.hoverDelay = $('input#hoverTime').val();
				objectFound.setHover(objectFound.hover,objectFound.hoverDelay);
			}
			else{
				objectFound.hoverDelay = 0;
				objectFound.setHover(objectFound.hover,objectFound.hoverDelay);

			}
		});
		// delete event hanlder
		$( document ).off( "click", "#deleteModule"); //unbind old events, and bind a new one
		$( document ).on( "click", "#deleteModule" , function() {		
			objectFound.deleteElement();
			$('.editWindow').hide(150);
		});
		$( document ).off( "click", "#resizeModule"); //unbind old events, and bind a new one
		$( document ).on( "click", "#resizeModule" , function() {
			objectFound.resize();
		});
		$( document ).off( "click", "#cropModule"); //unbind old events, and bind a new one
		$( document ).on( "click", "#cropModule" , function() {	
			$('#cropModule, #hideDelRow, #resizeModule, #hoverRow, #zRow, #hoverTimeRow, .editWindow, .controls').hide();
			$('#endCrop, #cancelCrop, #cropDialog').show();
			objectFound.camCrop();
		});
		$( document ).off( "click", "#hideModule") //unbind old events, and bind a new one
		$( document ).on( "click", "#hideModule" , function() {
			objectFound.setHidden(objectFound.parentId);				
		});
		
	}
/*****************************************************************
TEXT BLOCKS CASE
******************************************************************/
	else if($(this).hasClass('textBlockContainer')){
		$('#hideDelRow, #zRow, #bodyRow, #fontSizeRow, #backgroundColorRow, #textColorRow, #opacityRow').show();
		id = $(this).attr('id');
		$('.editWindow h2').text("Text "+id);
		$('.imgBlockContainer, .textBlockContainer, .imgCamContainer, .tr').removeClass('selectedShadow');
		$(this).addClass('selectedShadow');

		body = $(this).children('p');
		moduleContainer = $(this).attr('id');
		
		var objId = moduleContainer;	
		var elementPos = cell_arr.map(function(x) {return x.id; }).indexOf(objId);
		var objectFound = cell_arr[elementPos];
		objectFound.setSelected();
		tempArray.length = 0;
		tempArray.push(objectFound);
		console.log(objectFound);
		
		$(bodyChange).val(objectFound.text);
		
		$(bgColor).val($('#'+id).css('background-color'));
		$(textColor).val($('#'+id).children('p').css('color'));
		var backgroundColor = $('#'+selectedModule).css('background-color');	 
		fontSize.val($(this).css('font-size').slice(0, - 2));	//takes 'px' off end
		
		$(".textColorChange").off("change.color");
		$(".textColorChange").on("change.color", function(event, color){
			objectFound.fontColorChange(color);
		});
		
		$('#comboBoxInput').off('input');
		$('#comboBoxInput').on('input', function() { 
			console.log('fired');
			var input = this;
			setTimeout(function () {
				var newSize = $(input).val() // get the current value of the input field.
				console.log(newSize);

				objectFound.fontSizeChange(newSize);
			}, 100);
		});
		//delegate even handler for mousing over 
		$(".textColorChange").off("change.color");
		$(".textColorChange").on("change.color", function(event, color){
			objectFound.fontColorChange(color);
		});	
		//fontsize input change event handler
		$( document ).off( "keyup", "input#fontSize") //unbind old events, and bind a new one
		$( document ).on( "keyup", "input#fontSize" , function() {	
			var size = fontSize.val()
			objectFound.fontSizeChange(size)
		});
		//background color input change event handler
		$( document ).off( "keyup", "input.backgroundColorChange") //unbind old events, and bind a new one
		$( document ).on( "keyup", "input.backgroundColorChange" , function() {	
			var enteredColor = bgColor.val();
			objectFound.backgroundColorChange(enteredColor);
		});
		//color input change event handler
		$( document ).off( "keyup", "input.textColorChange") //unbind old events, and bind a new one
		$( document ).on( "keyup", "input.textColorChange" , function() {	
			var enteredColor = textColor.val();
			objectFound.fontColorChange(enteredColor);				
		});
		$( document ).off( "click", "#deleteModule"); //unbind old events, and bind a new one
		$( document ).on( "click", "#deleteModule" , function() {	
				objectFound.removeSelf();
			$('.editWindow').hide(150);
		});
		$( document ).off( "keyup", "textarea.bodyChange"); //unbind old events, and bind a new one		
		$( document ).on( "keyup", "textarea.bodyChange" , function() {	
			var enteredText = bodyChange.val();
			objectFound.setText(enteredText);
		});
		var sliderValue;
		if(backgroundColor.indexOf('rgba') >= 0){
			var splitColor =  backgroundColor.split(',');
			sliderValue = Math.round(parseFloat(splitColor[3].slice(0, - 1), 10)*100);
		}
		else{
			sliderValue = 100;
		}
		$('#opacitySlider .ui-slider-range').css('background', backgroundColor );
  		$('#opacitySlider .ui-slider-handle').css('border-color', backgroundColor);
		$('#opacityPercent').text(' '+sliderValue+'%');
		//opacity slider setup
		$('#opacitySlider').slider({
			min: 1,
			max: 100,
			range: "min",
			value: sliderValue,
			slide: function( event, ui ) {
				var opacity = $(this).slider('value', ui.value);
				objectFound.setOpacity(opacity, selectedModule, ui);
			}
		});
		$( document ).off( "click", "#hideModule") //unbind old events, and bind a new one
		$( document ).on( "click", "#hideModule" , function() {
			objectFound.setHidden(objectFound.parentId);				
		});
	}
/*****************************************************************
IMG BLOCKS CASE
******************************************************************/	
	else if($(this).hasClass('imgBlockContainer')){
		//show appropriate parts of edit window
		$('#hideDelRow, #zRow, #urlRow , #resizeModule, #cropModule, #cropRow, #hoverRow').show();
		
		moduleContainer = $(this).attr('id');
		selectedModule = $(this).find('img').attr('id');

		//change title of edit window 
		$('.editWindow h2').text("Image "+moduleContainer);
		$('.imgBlockContainer, .textBlockContainer, .imgCamContainer, .tr').removeClass('selectedShadow');			
		$(this).addClass('selectedShadow');
		
		var objId = selectedModule;
		console.log(moduleContainer);
		var elementPos = cell_arr.map(function(x) {return x.id; }).indexOf(objId);
		var objectFound = cell_arr[elementPos];
		console.log(objectFound);
		objectFound.setSelected();
		tempArray.length = 0;
		tempArray.push(objectFound);
		console.log(objectFound);
		
		url = $(this).find('img');
		//populate input fields with image specific information
		$(urlChange).val(url.attr('src'));
		
		var radiobtn
		if(objectFound.hoverable){
			radiobtn = document.getElementById("hoverEnabled");
			radiobtn.checked = true;
			$('#hoverTime').val(objectFound.hoverDelay);
			$('#hoverTimeRow').show();
			$('#suppressHoverable').show();	
		}
		else{
			radiobtn = document.getElementById("hoverDisabled");
			radiobtn.checked = true;
		}
		var radioChecked;
		$( document ).off( "change", "input[type=radio][name=hoverToggle]");
		$( document ).on( "change", "input[type=radio][name=hoverToggle]", function(){
			radioChecked = $('input[name=hoverToggle]:checked').val();
			if(radioChecked == 'enabled'){
				objectFound.setHover(true, objectFound.hoverDelay);
				
				$('#hoverTimeRow').show();
				$('input#hoverTime').val() = objectFound.hoverDelay;

			}
			else{
				objectFound.setHover(false, objectFound.hoverDelay);
				$('#hoverTimeRow').hide();
			}
		});
		
		$( document ).off( "keyup", "input#hoverTime");
		$( document ).on( "keyup", "input#hoverTime" , function() {
			var time = $('input#hoverTime').val();
			objectFound.setHover(true, time);
			objectFound.hoverDelay = time;
		});
		
		//delegate event handler for url change

		$( document ).off( "paste", "input.urlChange"); //unbind old events, and bind a new one		
		$( document ).on( "paste", "input.urlChange" , function() {	
			
			objectFound.setSrc();
		});
		$( document ).off( "click", "#cropModule"); //unbind old events, and bind a new one
		$( document ).on( "click", "#cropModule" , function() {	
			$('#cropModule, #hideDelRow, #resizeModule, #hoverRow, #zRow, #hoverTimeRow, .editWindow, .controls').hide();
			$('#endCrop, #cancelCrop, #cropDialog').show();
			objectFound.imgCrop();
		});
		//unbind old events, and bind a new one
		// delete event handler
		$( document ).off( "click", "#deleteModule"); 
		$( document ).on( "click", "#deleteModule" , function() {
			objectFound.removeSelf();
			$('.editWindow').hide(150);			
		});
		// unbind old event handler
		$( document ).off( "click", "#resizeModule"); //unbind old events, and bind a new one
		$( document ).on( "click", "#resizeModule" , function() {
			/*var width = document.getElementById(selectedModule).naturalWidth;
			var height = document.getElementById(selectedModule).naturalHeight;
			$("#"+selectedModule).css('width', width);
			$("#"+selectedModule).css('height',height);
			$("#"+selectedModule).parent().css('width', width);
			$("#"+selectedModule).parent().css('height',height);*/
			objectFound.resize();
		});
		$( document ).off( "click", "#hideModule") //unbind old events, and bind a new one
		$( document ).on( "click", "#hideModule" , function() {
			objectFound.setHidden(objectFound.parentId);				
		});
		
	}
/*****************************************************************
DATA CELLS CASE
******************************************************************/
	else if($(this).hasClass('tr')){
		//show the appropriate parts of the edit window
		$('#hideDelRow, #zRow, #unitRow, #titleRow, #labelRow, #fontSizeRow,#backgroundColorRow, #textColorRow, #roundingRow, #opacityRow').show();
		moduleContainer = $(this).attr('id');
		//change title of edit window
		$('.editWindow h2').text($(this).attr('title'));
		$('.imgBlockContainer, .textBlockContainer, .imgCamContainer, .tr').removeClass('selectedShadow');	
		$(this).addClass('selectedShadow');

		//find parts of the data cell and assign them to a variable
		title = $(this).children('.myTableTitle').children('p');
		label = $(this).children('.myTableValue').children('.label');
		value = $(this).children('.myTableValue');
		if(isNaN(value.find('p').text())){
			$('#roundingRow').hide();	
		}
		id = $(this).children('.myTableValue').attr('id');
		originalTitle = $(this).children('.myTableID').children('span').text();				 
		fontSize.val(value.css('font-size').slice(0, - 2));	//takes 'px' off end
		var backgroundColor = $('#'+selectedModule).css('background-color');

		var objId = id.replace('div_', '');	
		var elementPos = cell_arr.map(function(x) {return x.id; }).indexOf(objId);
		var objectFound = cell_arr[elementPos];
		console.log(objectFound);
		objectFound.setSelected();
		tempArray.length = 0;
		tempArray.push(objectFound);
		$('.roundingChange').val(objectFound.precision)
		populateConversions(objId);
		
		
		$( document ).off( "keyup", "input.roundingChange") //unbind old events, and bind a new one
		$( document ).on( "keyup", "input.roundingChange" , function() {	
			objectFound.setPrecision($('.roundingChange').val());
		});
		$('#comboBoxInput').off('input');
		$('#comboBoxInput').on('input', function() { 
			console.log('fired');
			var input = this;
			setTimeout(function () {
				var newSize = $(input).val() // get the current value of the input field.
				console.log(newSize);

				objectFound.fontSizeChange(newSize);
			}, 100);
		});
		
		//event handler for converting units
		$("#unitSelect").off('change');
		$("#unitSelect").on('change', function() {
			objectFound.setTypeChange($( "#unitSelect" ).val());
		});	
		//populate input fields with cell specific information
		$('.backgroundColorChange').val($('#'+selectedModule).css('background-color'));
		$('.textColorChange').val($('#'+id).children('p').css('color'));
		
		//delegate even handler for mousing over 
		$(".textColorChange").off("change.color");
		$(".textColorChange").on("change.color", function(event, color){
			objectFound.fontColorChange(color);
		});	

		//title change event handler
		$( document ).off( "keyup", "input.titleChange"); //unbind old events, and bind a new one
		$( document ).on( "keyup", "input.titleChange" , function() {	
			var text = titleChange.val();
			objectFound.setTitle(text);
		});
		// label change event handler
		$( document ).off( "keyup", "input.labelChange"); //unbind old events, and bind a new one
		$( document ).on( "keyup", "input.labelChange" , function() {	
			//label.text(htmlEntities(labelChange.val()));
			console.log(labelChange);
			if(labelChange.val() == ''){
				objectFound.setLabelOverride(false);
				console.log(objectFound.labelOverride);
			}
			else{
				var text = htmlEntities(labelChange.val());
				objectFound.setLabel(text);
				objectFound.setLabelOverride(true);
			}
		});
		
		$( document ).off( "click", "#deleteModule"); //unbind old events, and bind a new one
		$( document ).on( "click", "#deleteModule" , function() {	
			$("#"+selectedModule).remove();
			objectFound.deleteElement();
			$('.editWindow').hide(150);
		});
		//background color input change event handler
		$( document ).off( "keyup", "input.backgroundColorChange") //unbind old events, and bind a new one
		$( document ).on( "keyup", "input.backgroundColorChange" , function() {	
			var enteredColor = bgColor.val();
			objectFound.backgroundColorChange(enteredColor);
		});
		//color input change event handler
		$( document ).off( "keyup", "input.textColorChange") //unbind old events, and bind a new one
		$( document ).on( "keyup", "input.textColorChange" , function() {	
			var enteredTextColor = textColor.val();
			$('#'+moduleContainer).css('color', enteredTextColor);
		});
		var sliderValue;
		if(backgroundColor.indexOf('rgba') >= 0){
			var splitColor =  backgroundColor.split(',');
			sliderValue = Math.round(parseFloat(splitColor[3].slice(0, - 1), 10)*100);
		}
		else{
			sliderValue = 100;
		}
		$('#opacitySlider .ui-slider-range').css('background', backgroundColor );
  		$('#opacitySlider .ui-slider-handle').css('border-color', backgroundColor);
		$('#opacityPercent').text(' '+sliderValue+'%');
		//opacity slider setup
		$('#opacitySlider').slider({
			min: 1,
			max: 100,
			range: "min",
			value: sliderValue,
			slide: function( event, ui ) {
				console.log('BLAH');
				var opacity = $(this).slider('value', ui.value);
				objectFound.setOpacity(opacity, selectedModule, ui);
			}
		});
		$( document ).off( "click", "#hideModule") //unbind old events, and bind a new one
		$( document ).on( "click", "#hideModule" , function() {
			objectFound.setHidden(objectFound.parentId);				
		});
		$(titleChange).val(title.text());
		$(labelChange).val(label.text());
	}
	var zIndex = $('#'+moduleContainer).css('z-index'); 
	$('#zSlider').slider({
		min: 0,
		max: 100,
		value: zIndex,
		slide: function( event, ui ) {
			objectFound.setZindex(moduleContainer, ui.value);
			//$('#'+moduleContainer).css('z-index', ui.value ); 
		}
	});
};
function edit(handler) {
	editMode = true;
	isExpanded = true;
	$( document ).keyup(function(e) {
		if (e.keyCode == 27){
			collapseWindows()			
		}
	});
	$("#editMaximize").hide();
	$("#editMinimize").show();
	$("#editMinimize").off("click");
	$("#editMinimize").on("click", function(event, color){
    	//$('.editWindow').addClass('editHide');
		collapseWindows();
		$("#editMaximize").show();
		$("#editMinimize").hide();
	});
	$("#editMaximize").off("click");
	$("#editMaximize").on("click", function(event, color){
    	//$('.editWindow').removeClass('editHide');
		collapseWindows();
		$("#editMaximize").hide();
		$("#editMinimize").show();
	});
	$('.gridlines').show();
	$('#masterEdit').css('background-color','green');
	$('.tr').css('cursor','pointer');
	$('.textBlockContainer').css('cursor','pointer');
	$('.hide').css('visibility','visible');
	$('.controls').show(200);
	$('#masterEdit').attr('onclick', 'nonEdit()');
	
	//delegate events
	//$('.top-container').delegate('.tr','click', editWindow);
	$('#content').delegate('.tr, .textBlockContainer, .imgBlockContainer, .imgCamContainer','click', editWindow);	
	
	//$('#content').delegate('.imgBlockContainer','click',editWindow);
	//$('#content').delegate('.imgCamContainer','click',editWindow);
	$('.controls').delegate('#pageEdit, #createStatic, #configMenu','click',editWindow);
	
	//enable draggables and resizables
	$('.ui-icon').show();
	$(".imgCamContainer").draggable( "option", "disabled", false ).resizable( "option", "disabled", false );
	$(".cropped").resizable({disabled:true});
	$(".draggable").draggable( "option", "disabled", false ).resizable( "option", "disabled", false );
	$('.textBlockContainer').draggable( "option", "disabled", false ).resizable( "option", "disabled", false );
	$('.imgBlockContainer').draggable( "option", "disabled", false ).resizable( "option", "disabled", false );
}
function nonEdit(handler) {
	editMode = false;	
	$( document ).off('keyup');
	$('.gridlines').hide();
	$('#masterEdit').css('background-color',' rgba(222,222,222,.0)');
	$('.imgBlockContainer, .textBlockContainer, .imgCamContainer, .tr').removeClass('selectedShadow');
	$('#masterEdit').attr('onclick', 'edit()');
	$('.tr').css('cursor','initial');
	$('.textBlockContainer').css('cursor','initial');
	$('.hide').css('visibility', 'hidden');
	$('.editWindow').hide(150);
	$('.controls').hide(200);
	$("#editMaximize").hide();
	$("#editMinimize").hide();
	//delegate events
	$('#content').undelegate('.tr, .textBlockContainer, .imgBlockContainer, .imgCamContainer','click', editWindow);
	//$('.top-container').undelegate('.tr','click', editWindow);
	//$('#content').undelegate('.imgBlockContainer','click',editWindow);
	//$('#content').undelegate('.imgCamContainer','click',editWindow);
	$('.controls').delegate('#pageEdit, #createStatic, #configMenu','click',editWindow);
	tempArray.length = 0;
	console.log(tempArray);
	//disable draggables and resizables
	$('.ui-icon').hide();
	$(".imgCamContainer").draggable( "option", "disabled", true ).resizable( "option", "disabled", true );
	$(".draggable").draggable( "option", "disabled", true ).resizable( "option", "disabled", true );
	$('.textBlockContainer').draggable( "option", "disabled", true ).resizable( "option", "disabled", true );
	$('.imgBlockContainer').draggable( "option", "disabled", true ).resizable( "option", "disabled", true );
}
//function that allows for the safe decoding of html entities	
function htmlEntities(str) {
   	var decoded = $('<div/>').html(str).text();
	return decoded
}
function delHandle(objectFound){
	return function ( e ){
		//if delete key is pressed and the input nor text area are not receiving focus, the element is deleted
		if (e.keyCode == 46 && !$(e.target).is('input, textarea')){
			objectFound.deleteElement();
			$('.editWindow').hide(150);			
		}
	}
}
function captureState(){
	for(var k in cell_arr){
		cell_arr[k].onChangeStyle();
		console.log(cell_arr[k]);
	}
	var saveName = $('#saveAs').val().replace(' ','%20');

	var jsonString = JSON.stringify(cell_arr);
	var configObject = JSON.parse(jsonString);
	
	data_object.ValueSet(function(rsp){
		console.log(rsp);
		if (rsp.error) {
			alert('Failed to save configuration to server!');
		}
	},'webdisplay/configs/'+saveName,jsonString,0);
}
function loadState(jsonString){
	var configObject = JSON.parse(jsonString);
	var count = 0;

	for(var k in configObject){
		if(configObject[k].count >= count){
			count = configObject[k].count;
		}
		if(configObject[k].elementType == 'pageSettings'){
			var objId = 'pageSettings';	
			console.log(cell_arr);
			var elementPos = cell_arr.map(function(x) {return x.id; }).indexOf(objId);
			var pageSettingsObj = cell_arr[elementPos];
			console.log(elementPos);

			if(elementPos > -1){
				cell_arr.splice(elementPos, 1);
			}
			var settings = new pageSettings();
			console.log(configObject[k]);
			configObject[k].__proto__ = settings.__proto__;
			
			configObject[k].backgroundColorChange(configObject[k].backgroundColor);
			configObject[k].setPageTitle(configObject[k].title);
			configObject[k].updateGrid(configObject[k].gridSize);
			$('.gridlines').hide();
			cell_arr.push(configObject[k]);
			console.log(cell_arr);
		}
		if(configObject[k].elementType == 'pageCell'){
			var cell = new pageCell();
			console.log(cell);
			configObject[k].__proto__ = cell.__proto__;
			cell_arr.push(configObject[k]);
			configObject[k].loadHtml();

		}
		else if(configObject[k].elementType == 'pageCam'){
			var cam = new pageCam();
			console.log(cell);
			configObject[k].__proto__ = cam.__proto__;
			configObject[k].loadHtml();
			cell_arr.push(configObject[k]);

		}
		else if(configObject[k].elementType == 'pageImg'){
			var img = new pageImg();
			configObject[k].__proto__ = img.__proto__;
			console.log(cell_arr);
			configObject[k].loadHtml();
			cell_arr.push(configObject[k]);			

		}
		else if(configObject[k].elementType == 'pageText'){
			var text = new pageText();
			configObject[k].__proto__ = text.__proto__;
						console.log(configObject[k]);

			cell_arr.push(configObject[k]);
			configObject[k].loadHtml();
		}
		else{
			console.log('undefined');	
		}
	}
	cell_arr.length = count+1;
	console.log(cell_arr.length);
	console.log( cell_arr );
}
