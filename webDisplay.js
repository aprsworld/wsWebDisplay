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
var savedStates = []; //set of saved table states in the format of a multi Dimensional array consisting of coordinates of each cell
var textBlocks = []; //array to keep track of ids of generated text blocks
var imgBlocks = []; //array to keep track of ids of generated images
var started = false; //this boolean makes sure we only execute some of our functions only once such as the jquery ui setup
var ageInterval;
var staticRegexPeriod = /\./g; //global declaration to reduce overhead
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
//initilizes all draggables and resizables to avoid uninitlized errors
function initJqueryUI(){
	$(".draggable").draggable({ //makes our data cells draggable
		disabled: true,
		grid: [1, 1],
		snap: true,
		snapTolerance: 10,
		start: function(event, ui) {
			$(this).addClass('draggable_focus_in');
			$('.controls').animate({
				width: '10px'
			},100);
			$('.editWindow').animate({
				width: '0px',
				margin: '0',
				padding: '0'
			},50);
			$('.controlRow').hide();
			$('.controls h2').hide();
		},
		stop: function(event, ui) {
			$(this).removeClass('draggable_focus_in');
			$('.controls').animate({
				width: '250px'
			},200);
			$('.editWindow').animate({
				width: '280px',
				padding: '20px'
			},200);
			$('.controlRow').show();
			$('.controls h2').show();
		}
	}).resizable({});
	$(".textBlockContainer").draggable({
		disabled: false,
		start: function(event, ui) {
				$(this).addClass('draggable_focus_in');
				$('.controls').animate({
					width: '10px'
				},100);
				$('.editWindow').animate({
					width: '0px',
					margin: '0',
					padding: '0'
				},50);
				$('.controlRow').hide();
				$('.controls h2').hide();
			},
		stop: function(event, ui) {
			$(this).removeClass('draggable_focus_in');
			$('.controls').animate({
				width: '250px'
			},200);
			$('.editWindow').animate({
				width: '280px',
				padding: '20px'
			},200);
			$('.controlRow').show();
			$('.controls h2').show();
		}
		}).resizable({
			disabled: false,
			handles: 'all'
		});
	$(".imgBlockContainer").draggable({
			grid: [1, 1],
			snap: true,
			snapTolerance: 10,
			start: function(event, ui) {
			$(this).addClass('draggable_focus_in');
				$('.controls').animate({
					width: '10px'
				},100);
				$('.editWindow').animate({
					width: '0px',
					margin: '0',
					padding: '0'
				},50);
				$('.controlRow').hide();
				$('.controls h2').hide();
			},
		stop: function(event, ui) {
			$(this).removeClass('draggable_focus_in');
			$('.controls').animate({
				width: '250px'
			},200);
			$('.editWindow').animate({
				width: '280px',
				padding: '20px'
			},200);
			$('.controlRow').show();
			$('.controls h2').show();
		}
		});
	$('.imgCamContainer').draggable({
		grid: [1, 1],
		snap: true,
		snapTolerance: 10,
		containment: "parent",
		start: function(event, ui) {
			$('.controls').animate({
				width: '10px'
			},100);
			$('.editWindow').animate({
				width: '0px',
				margin: '0',
				padding: '0'
			},50);
			$('.controlRow').hide();
			$('.controls h2').hide();
		},
		stop: function(event, ui) {
			$('.controls').animate({
				width: '250px'
			},200);
			$('.editWindow').animate({
				width: '280px',
				padding: '20px'
			},200);
			$('.controlRow').show();
			$('.controls h2').show();
		},
		disabled: false}).resizable({disabled: false, handles: 'all'});
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
					value = null;	
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
	var value, cellObj, id, label, objectFound;
	
    for ($i = 0; $i < idLength; $i++) {
		objectFound = cell_arr[$i];
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
			$('#preload_'+currentCam).unbind()
			$('#preload_'+currentCam).load(function() {
				var src = $(this).attr('src');
				var cam = $(this).attr('id').replace("preload_","");
				objectFound.src = src;
				document.getElementById(cam).style.backgroundImage = 'url('+src+')';	
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
					var result = chooseConversion(type, typeUnits, value, typeChange);
				}
				else{
					var result = {};
					result.value = value;
					result.label = objectFound.units;
				}
				if(type != "time"){
					value = round(result.value, objectFound.precision);
				}
				else{
					value = result.value;
				}
				label = result.label;
				$('div#div_' + id + '').children('.label').html(label);
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
	}
	
}
function chooseConversion(type, typeUnits, value, typeChange){
	if(type == "temperature"){
		return TemperatureConvert.init(typeUnits, typeChange, value);
	}
	else if(type == "speed"){
		return SpeedConvert.init(typeUnits, typeChange, value);
	}
	else if(type == "length"){
		return LengthConvert.init(typeUnits, typeChange, value);
	}
	else if(type == "time"){
		return TimeConvert.init(typeUnits, typeChange, value);
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
function hoverCamInit(){
	//allows cams to be hoverable outside of edit function
	var hoverTimeout;
	var hoverImg = document.createElement('img');
	var hoverImgLink = document.createElement('a');
	$('.imgCamContainer').hover(function(){
	var camID = $(this).attr('id');
	var camWidth = $(this).children('img').width();
	var divWidth = parseInt($(this).css('width').slice(0,-2));
	var camHeight = $(this).children('img').height();
	var camSrc = $(this).css('background-image').replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
	var isWebkit = 'WebkitAppearance' in document.documentElement.style;
	var hoverImgID = camID+'hover';
	var timeOut = 1000;
	var suppress = false;
	if((camWidth <= divWidth) && $(this).hasClass('suppressHover')){
		suppress = true;
	}
	timeOut = parseInt($('#'+camID).children('img').attr('alt'), 10)*1000;
	var enabled = $('#'+camID).hasClass('hoverables');
	console.log(camWidth+" , "+divWidth);
		if(editMode == false && enabled == true && suppress == false){	
				hoverTimeout = setTimeout(function() {						
					$(hoverImg).width(camWidth);
					$(hoverImg).height(camHeight);
					hoverImg.src = camSrc;
					hoverImgLink.href = camSrc;
					hoverImgLink.target = '_blank';
					hoverImgLink.appendChild(hoverImg);
					console.log(hoverImg);
					$('#'+camID).append(hoverImgLink);
					$('#'+camID).addClass('focusedCam');
					if (isWebkit) {
						hoverImg.className = 'webKitCam';
						hoverImgLink.id = hoverImgID;
						var top = ''+$('#'+camID).css('top');
						var left = ''+$('#'+camID).css('left');
						$('#'+hoverImgID).css('position','absolute');
						$('#'+hoverImgID).css('left','50% ');
						$('#'+hoverImgID).css('top','50%');
						top = '-'+$('#'+camID).css('top');
						left= '-'+$('#'+camID).css('left');
						$('#'+hoverImgID).css({'-webkit-transform':'translate(calc(0% + '+left+'), calc(0% + '+top+')'});
						console.log(top);

					}
					else{
						hoverImg.className = 'expandedCam';
					}	
				}, timeOut);
			}
		}, function () {
			if(editMode == false){	
				clearTimeout(hoverTimeout);
				$(hoverImg).remove();
				$('.imgCamContainer').removeClass('focusedCam');
			}
		}

	);	
		//end of cam hoverable event 	
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
			maxWidth: 250	
        });
        $(document).ready(function() {
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
				})
			//sets up the drag and drop for the tree
			$("#stationTree").bind("open_node.jstree", function (event,  data) {
				$(".jstree-leaf, .dataDraggable").draggable({
					helper: "clone",
					grid: [1,1],
					delay: 150,
					opacity: 0.75,
					start: function (event, ui) {
						$('.controls').animate({
							width: '10px'
						},100);
						$('.editWindow').animate({
							width: '0px',
							margin: '0',
							padding: '0'
						},50);
						$('.controlRow').hide();
						$('.controls h2').hide();
						//below code allows preview of data cell to show up when dragging
						var id = ui.helper.context.id;
						$(ui.helper).addClass("ui-draggable-helperCell");
						$(ui.helper).html('');
						var path = $('#stationTree').jstree(true).get_node(id).original.obj.path;
						console.log($('#stationTree').jstree(true).get_node(id).original.obj);
						var title = $('#stationTree').jstree(true).get_node(id).text;
						$(ui.helper).append('<div class="tr draggable" id="helperTr"><div class="td myTableID"> ID: <span></span> </div><div class="td myTableTitle"><p class="titleText">'+title+'</p></div><div class="td myTableValue" id=""><p>Preview</p><span class="path"></span><span class="label"></span></div></div>');						
					},
					stop: function (event, ui) {
						$('.controls').animate({
							width: '250px'
						},200);
						$('.editWindow').animate({
							width: '280px',
							padding: '20px'
						},200);
						$('.controlRow').show();
						$('.controls h2').show();
					}
				});
				$( ".draggableCamNode" ).draggable({
					helper: "clone",
					grid: [1,1],
					delay: 150,
					opacity: 0.75,
					start: function (event, ui) {
						$('.controls').animate({
							width: '10px'
						},100);
						$('.editWindow').animate({
							width: '0px',
							margin: '0',
							padding: '0'
						},50);
						$('.controlRow').hide();
						$('.controls h2').hide();
						
						//below code allows preview of image to show up when dragging
						$(ui.helper).addClass("ui-draggable-helper");
						$(ui.helper).html('');
						var id = ui.helper.context.id;
						var instance = $('#stationTree').jstree(true);
						var children = instance.get_node(id).children;
						var clength = children.length;
						var i;
						console.log(children);
						for(i = 0; i < clength; i++) {
							console.log(children[i]);
							if (children[i].indexOf("image_url_x") >= 0){
								var childId = children[i];
							}
						}
						var path = $('#stationTree').jstree(true).get_node(childId).original.obj.path;
						var value = ref(incomingData, path);
						console.log(ui.helper);
						var tempImg = document.createElement('img');
						$(tempImg).load(function() {
							var width = tempImg.naturalWidth;
							var height = tempImg.naturalHeight;
							$(ui.helper).css('background-image','url('+value+')');
							$(ui.helper).css('height',height);
							$(ui.helper).css('width', width);
							$(ui.helper).css('background-position',"50% 0%");
						});
						tempImg.src = value;
					},
					stop: function (event, ui) {
						$('.controls').animate({
							width: '250px'
						},200);
						$('.editWindow').animate({
							width: '280px',
							padding: '20px'
						},200);
						$('.controlRow').show();
						$('.controls h2').show();
						$(ui.helper).removeClass("ui-draggable-helper");
					}	
				});
			});
			//makes everything draggable
			//initJqueryUI();
			$(".top-container").droppable({
        		accept: function(d) { 
					if(d.hasClass("jstree-leaf")){ 
						console.log('true');
						return true;
					}
					else if(d.hasClass("draggableCamNode")){
						console.log('true');
						return true;
					}
					else if(d.hasClass("dataDraggable")){
						console.log('true');
						return true;	
					}
					else if(d.hasClass("jstree-node")){
						var id = $(this).attr('id');
						var findClass = $('#stationTree').jstree(true).get_node(id).original.obj.class;
						if(findClass == 'draggableCamNode'){
							return true;	
						}
					}
				},
				//drop event
				drop: function( event, ui ) {
					var $element, $me, $newElement;
					$element = $(ui.draggable);
					var pageX = $(ui.helper).css('left');
					var pageY = $(ui.helper).css('top');
/*------------------------  if cam	------------------------------*/									
					if(($($element).hasClass('draggableCamNode'))){
						var tree_item = new pageCam();
						//tree_item.prototype = pageElement;
						console.log(tree_item);
						var idArrLen = cell_arr.length;
						var instance = $('#stationTree').jstree(true);
						var id = $($element).attr('id');
						var new_id = "div_"+id+"_pageCam_"+idArrLen;
						var children = instance.get_node(id).children;
						var clength = children.length;
						var i;
						var path = $('#stationTree').jstree(true).get_node(id).original.obj.path;
						var tooltip = path.substring(1).replace(staticRegexPeriod, " >> ");
						console.log('TOOLTIP '+tooltip);
						tree_item["path"] = path;
						tree_item["containerId"] = new_id;
						tree_item["fullId"] = new_id;
						tree_item["parentId"] = new_id;
						tree_item["id"] = id+"_pageCam_"+idArrLen;
						tree_item["toolTip"] = tooltip;
						console.log(children);
						for(i = 0; i < clength; i++) {
							console.log(children[i]);
							if (children[i].indexOf("image_url_x") >= 0){
								var childId = children[i];
							}
						}
						
						cell_arr.push(tree_item);
						var sendPath = ref(data, path);
						console.log(tree_item);
						tree_item.createHtml(cellCount, sendPath, pageX, pageY);
						tree_item.setHover(true, tree_item.hoverDelay);
						console.log($('#'+new_id));
						
					cellCount++;   
					}
/*------------------------  if not cam	------------------------------*/				
					else{
						var tree_item = new pageCell();
						//tree_item.prototype = pageElement;
						console.log(tree_item);
						var idArrLen = cell_arr.length;
						var id = $($element).attr('id');
						var new_id = "div_"+id+"_"+idArrLen;
						var treeNode = $.jstree.reference('#stationTree').get_node(id);
						var path = $('#stationTree').jstree(true).get_node(id).original.obj.path;
						var tooltip = path.substring(1).replace(staticRegexPeriod, " >> ");
						console.log(tooltip);
						var value = $('#stationTree').jstree(true).get_node(id).original.obj.value; 
						var units, title, type, typeUnits;
						tree_item["path"] = path;
						tree_item["id"] = id+"_"+idArrLen;
						tree_item["parentId"] = "cell"+cellCount;
						tree_item["containerId"] = new_id;
						tree_item["fullId"] = new_id;
						tree_item["toolTip"] = tooltip;
						if(tree_item["path"] == "timeStamp"){
							tree_item["value"] = 0;	
						}
						//gets typeUnits if there
						if($('#stationTree').jstree(true).get_node(id).original.obj.typeUnits){
							typeUnits = $('#stationTree').jstree(true).get_node(id).original.obj.typeUnits;
							tree_item["typeUnits"] = typeUnits;
						}
						else{
							typeUnits = "";
						}
						//gets type if there
						if($('#stationTree').jstree(true).get_node(id).original.obj.type){
							type = $('#stationTree').jstree(true).get_node(id).original.obj.type;
							tree_item["type"] = type;
						}
						else{
							type = "";
						}
						//gets units if there
						if($('#stationTree').jstree(true).get_node(id).original.obj.units){
							units = $('#stationTree').jstree(true).get_node(id).original.obj.units;
							tree_item["units"] = units;
						}
						else{
							units = "";
						}
						//gets title if there
						if($('#stationTree').jstree(true).get_node(id).original.obj.title){
							title = $('#stationTree').jstree(true).get_node(id).original.obj.title; 
							tree_item["title"] = title;
							var tooltipSplit = path.substring(1).split(staticRegexPeriod);
							tooltip = '';
							for(var i =0; i<tooltipSplit.length-2; i++){
								tooltip = tooltip+tooltipSplit[i]+' >> ';	
							}
							tooltip = tooltip+title;
							tree_item["toolTip"] = tooltip;
							console.log(tooltipSplit);
						}
						//case for elements with no valid path
						else{
							title = $($element).text();
							tree_item["title"] = title;
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
								tree_item["toolTip"] = tooltip;
								console.log(tooltipSplit);
							}
						}
						tree_item["precision"] = 3;
						path_arr.push(path);
						id_arr.push(new_id);
						cell_arr.push(tree_item);
						console.log(tree_item);
						console.log(cell_arr);
							//$('.top-container').append('<div title="'+tooltip+'" class="tr draggable" id="' + cellCount + '"><div class="td myTableID"> ID: <span>' + title + '</span> </div><div class="td myTableTitle"><p class="titleText">' + title + '</p></div><div class="td myTableValue" id="' + new_id + '"><p>Loading...</p><span class="path">'+ path +'</span><span class="label"> '+ units +'</span></div></div>');
							tree_item.createHtml(cellCount);
							$(".draggable").draggable({ //makes our data cells draggable
								start: function(event, ui) {
									//$(this).addClass('draggable_focus_in');
									/*$('.controls').animate({
										width: '10px'
									},100);
									$('.editWindow').animate({
										width: '0px',
										margin: '0',
										padding: '0'
									},50);*/
									/*$('.controlRow').hide();
									$('.controls h2').hide();
									var posLeft = ui.position.left;
									var posTop = ui.position.top;
									var posSpan = document.createElement("SPAN"); 
									var posDiv = document.createElement("DIV");
									posDiv.id = 'positionDiv';
									$(this).append(posDiv);
									$('#positionDiv').html('<i class="fa fa-long-arrow-down fa-rotate-45"></i>');
									posSpan.textContent = "("+posLeft+", "+posTop+")";
									posSpan.id = 'positionSpan';			
									$('#positionDiv').append(posSpan);*/

								}
						});
							$(".draggable").draggable( "option", "disabled", false )
							$('#'+tree_item.parentId).css('position', 'absolute');
							$('#'+tree_item.parentId).css('top',pageY);
							$('#'+tree_item.parentId).css('left',pageX);
						cellCount++;
					}
				}
			});	
		//grabs layout parameter fromt he url
		var layout = getUrlVars()["layout"];
		var cellCount = 0;
		data_object.ValueGet(function(rsp){
				if(!rsp.data || rsp.error){
					// Couldn't get configuration data from server
					return;
				}
				console.log(rsp);
				var loadedLayout = rsp.data[layout];
				console.log(loadedLayout);
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

	cell_arr.push(imgBlock);

	if(imgURL != ""){
		//$('#content').append('<div id=img'+index+'container class="imgBlockContainer"><div class="cam-drag-handle"></div><img class="imageInsert" width="320" height="240" onerror="brokenImg(img'+index+')" id=img'+index+' alt=img'+index+' src="images/insert_image.svg"></img></div>');
		/*$(".imgBlockContainer").draggable({
			grid: [1, 1],
			snap: true,
			snapTolerance: 10,
			start: function(event, ui) {
			$(this).addClass('draggable_focus_in');
				$('.controls').animate({
					width: '10px'
				},100);
				$('.editWindow').animate({
					width: '0px',
					margin: '0',
					padding: '0'
				},50);
				$('.controlRow').hide();
				$('.controls h2').hide();
			},
		stop: function(event, ui) {
			$(this).removeClass('draggable_focus_in');
			$('.controls').animate({
				width: '250px'
			},200);
			$('.editWindow').animate({
				width: '280px',
				padding: '20px'
			},200);
			$('.controlRow').show();
			$('.controls h2').show();
			imgBlock.onChangeStyle();
		}
		});
		$("#img"+index+"").resizable({ 
					disabled: false,
					minHeight: 70,
					minWidth: 150,
					grid: [1, 1],
					aspectRatio: true,
					stop: function(event, ui){
						imgBlock.onChangeStyle();	
					}
		});	*/
	}
	//allows images to be hoverable outside of edit function
			var hoverTime;
			var hoverImage = document.createElement('img');
			$('.imgBlockContainer').hover(function(){
				var imgID = $(this).attr('id');	
				var imgWidth = $('#'+imgID).find('img').naturalWidth;
				var imgHeight = $('#'+imgID).find('img').naturalHeight;
				var imgSrc = $('#'+imgID).find('img').attr('src');
				var isWebkit = 'WebkitAppearance' in document.documentElement.style
				var hoverImgID = imgID+'hover';
				var enabled = $('#'+imgID).hasClass('hoverables');
				var timeOut = 1000;
				timeOut = parseInt($('#'+imgID).find('img').attr('alt'), 10)*1000;
					if(editMode == false && enabled == true){	
						console.log(imgSrc);
							hoverTime = setTimeout(function() {
								$(hoverImage).width(imgWidth);
								$(hoverImage).height(imgHeight);
								hoverImage.src = imgSrc;
								console.log(hoverImage);
								$('#'+imgID).append(hoverImage);
								$('#'+imgID).addClass('focusedCam');
								if (isWebkit) {
									hoverImage.className = 'webKitCam';
									hoverImage.id = hoverImgID;
									var top = ''+$('#'+camID).css('top');
									var left = ''+$('#'+camID).css('left');
									$('#'+hoverImgID).css('left','50% ');
									$('#'+hoverImgID).css('top','50%');
									top = '-'+$('#'+camID).css('top');
									left= '-'+$('#'+camID).css('left');
									$('#'+hoverImgID).css({'-webkit-transform':'translate(calc(0% + '+left+'), calc(0% + '+top+')'});
									console.log(top);
									
								}
								else{
									hoverImage.className = 'expandedCam';
								}	
							}, timeOut);
						}
					}, function () {
						if(editMode == false){	
							clearTimeout(hoverTime);
							$(hoverImage).remove();
							$('.imgBlockContainer').removeClass('focusedCam');
						}
					}
			
			);	
		//end of hoverable event 	
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
		//leave function due to incorrect format of object.type
		else{
			return;	
		}
		console.log("hi "+currentUnits);
		$("#unitSelect").val(currentUnits);
	}
}

var editWindow =  function() {
	var moduleContainer, selectedModule, body, title, label, url, titleChange, labelChange, textColor, bgColor, urlChange, id, value, submitButton, fontPlus, fontMinus, bodyChange, fontSize, originalTitle;
	titleChange = $('.titleChange');
	labelChange = $('.labelChange');
	bodyChange = $('.bodyChange');
	urlChange = $('.urlChange');
	fontSize = $('#fontSize');
	fontPlus = $('#fontSizePlus');
	fontMinus = $('#fontSizeMinus');
	bgColor = $('.backgroundColorChange');
	textColor= $('.textColorChange');
	$('#cropRow, #hideDelRow, #configRow, #staticRow, #hoverTimeRow, #hoverRow, #roundingRow, #unitRow, #zRow, #titleRow, #labelRow, #urlRow, #bodyRow, #fontSizeRow, #backgroundColorRow, #textColorRow, #opacityRow, #resizeModule, #cropModule, #endCrop').hide();
	$('.editWindow').removeClass('editHide').show(150);
	$('.imgBlockContainer, .textBlockContainer, .imgCamContainer, .tr').removeClass('selectedShadow');
	$("#editMaximize").hide();
	$("#editMinimize").show();
	selectedModule = $(this).attr('id');
	
	//color picker setup
	$('.backgroundColorChange, .textColorChange').colorpicker({
		hideButton: true,
		defaultPalette: 'web',
		showOn: "focus"
	});
	$("#editMinimize").off("click");
	$("#editMinimize").on("click", function(event, color){
    	$('.editWindow').addClass('editHide');
		$("#editMaximize").show();
		$("#editMinimize").hide();
	});
	$("#editMaximize").off("click");
	$("#editMaximize").on("click", function(event, color){
    	$('.editWindow').removeClass('editHide');
		$("#editMaximize").hide();
		$("#editMinimize").show();
	});
	$(".backgroundColorChange").off("mouseover.color");
	$(".backgroundColorChange").on("mouseover.color", function(event, color){
    	$('#'+selectedModule).css('background-color', color);
		$('#opacitySlider .ui-slider-range').css('background', color );
  		$('#opacitySlider .ui-slider-handle').css('border-color', color);
	});
	$('#hideModule,#deleteModule').show();
/*****************************************************************
CREATE STATIC ELEMENTS CASE
******************************************************************/	
	if($(this).attr('id') == 'createStatic'){
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
		$('.editWindow h2').text("Page");
		$('#titleRow,#backgroundColorRow,#opacityRow').show();
		$('#hideModule,#deleteModule').hide();
		$('.titleChange').val(document.title);
		$('.backgroundColorChange').val($('html').css('background-color'));
		var backgroundColor = $('html').css('background-color');

		
		//delegate event handler for color picker
		$(".backgroundColorChange").off("mouseover.color");
		$(".backgroundColorChange").on("mouseover.color", function(event, color){
			$('html').css('background-color', color);
		});
		//background color input change event handler
		$( document ).off( "keyup", "input.backgroundColorChange") //unbind old events, and bind a new one
		$( document ).on( "keyup", "input.backgroundColorChange" , function() {	
			var enteredColor = bgColor.val();
			$('html').css('background-color', enteredColor);
			$('#opacitySlider .ui-slider-range').css('background', enteredColor );
  			$('#opacitySlider .ui-slider-handle').css('border-color', enteredColor);
		});
		//delegate title change event handler
		$( document ).off( "keyup", "input.titleChange"); //unbind old events, and bind a new one
		$( document ).on( "keyup", "input.titleChange" , function() {	
			var newTitle = titleChange.val();
			document.title = newTitle;
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
				$('html').css('background-color', newColor);
				$('.backgroundColorChange').val(''+newColor);
				$('#opacitySlider .ui-slider-range').css('background', newColor );
  				$('#opacitySlider .ui-slider-handle').css('border-color', newColor);
			}
		});
	}
/*****************************************************************
CAMERA CASE
******************************************************************/	
	else if($(this).hasClass('imgCamContainer')){
		$('#hideDelRow,#cropRow, #cropModule, #resizeModule, #zRow, #hoverRow, #suppressHoverable').show();
		$('.editWindow h2').text($(this).attr('title'));
		$(this).addClass('selectedShadow');
		
		moduleContainer = $(this).attr('id');
		console.log(moduleContainer);
		var objId = moduleContainer.replace('div_','');	
		var elementPos = cell_arr.map(function(x) {return x.id; }).indexOf(objId);
		var objectFound = cell_arr[elementPos];
	
		var camera = $(this);
		//checks to see if image has added hoverables class and checks appropriate radio button
		var radiobtn
		$('#hoverTime').val(objectFound.hoverDelay);
		if(objectFound.hoverable == true){
			radiobtn = document.getElementById("hoverEnabled");
			radiobtn.checked = true;
			$('#hoverTimeRow').show();
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
			}
			else{
				objectFound.setHover(false, objectFound.hoverDelay);
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
			}
			else{
				objectFound.hoverDelay = 0;
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
			$('#cropModule, #hideDelRow, #resizeModule, #hoverRow, #zRow, #hoverTimeRow').hide();
			$('#endCrop, #cancelCrop').show();
			var nativeWidth = $("#"+selectedModule).children('img').width();
			var nativeHeight = $("#"+selectedModule).children('img').height();
			$("#"+selectedModule).hide();
			var cropWidth, cropHeight, cropLeft, cropTop;
			var width = $("#"+selectedModule).css('width');
			var height = $("#"+selectedModule).css('height');
			var left = $("#"+selectedModule).css('left');
			var top = $("#"+selectedModule).css('top');
			var src = $("#"+selectedModule).css('background-image').replace(/^url\(["']?/, '').replace(/["']?\)$/, ''); //.find('img').attr('src');
			var diffFromNatHeight = (height.slice(0,-2))/nativeHeight;
			var diffFromNatWidth = (width.slice(0,-2))/nativeWidth;
			$('#content').append('<div class="cropperWrapper"><img class="cropperWrapperImg" width="'+(width.slice(0,-2)*diffFromNatWidth)+' " height="'+(height.slice(0,-2)*diffFromNatHeight)+' "src="'+src+'"></div>');
			$('.cropperWrapper').css({ "position":"absolute","top": top, "left": left, "width": width, "height": height });
			$('.cropperwrapper > img').cropper({
				aspectRatio: width / height,
				autoCropArea: 1.0,
				dragCrop: true,
				scaleable: false,
				movable: false,
				modal: true,
				strict: false,
				zoomable: false,
				mouseWheelZoom: false,
				crop: function(e) {
					cropHeight = e.height;
					cropWidth = e.width;
					cropLeft = e.x;
					cropTop = e.y;
				}
			});
			$( document ).off( "click", "#endCrop"); //unbind old events, and bind a new one
			$( document ).on( "click", "#endCrop" , function() {
				$('#cropModule, #hideDelRow, #resizeModule, #hoverRow, #zRow, #hoverTimeRow').show();
				$('#endCrop, #cancelCrop').hide();
				width = parseInt((width.slice(0,-2)));
				height = parseInt((height.slice(0,-2)));
				$('.cropperWrapper').remove();
				console.log(diffFromNatHeight);
				console.log(diffFromNatWidth);
				if(cropTop == 0 || cropLeft == 0){
					if(cropTop == 0){
						$("#"+selectedModule).css("background-position", "-"+(cropLeft*diffFromNatWidth)+"px "+((cropTop*diffFromNatHeight))+"px");
					}
					else if(cropLeft == 0){
						$("#"+selectedModule).css("background-position", ""+(cropLeft*diffFromNatWidth)+"px -"+(cropTop*diffFromNatHeight)+"px");
					}
					else if(cropLeft == 0 && cropTop ==0){
						$("#"+selectedModule).css("background-position", "-"+(cropLeft*diffFromNatWidth)+"px -"+(cropTop*diffFromNatHeight)+"px");
					}
					console.log($("#"+selectedModule).css("background-position"));
				}
				else{
					$("#"+selectedModule).css("background-position", "-"+(cropLeft*diffFromNatWidth)+"px -"+(cropTop*diffFromNatHeight)+"px");
				}
				$("#"+selectedModule).css("top",top+(cropTop*diffFromNatHeight));
				$("#"+selectedModule).css("left",left+(cropLeft*diffFromNatWidth));
				$("#"+selectedModule).css("width",cropWidth*diffFromNatWidth+"px");
				$("#"+selectedModule).css("height",cropHeight*diffFromNatHeight+"px");
				$("#"+selectedModule).css("background-size",width+"px "+height+"px ");
				$("#"+selectedModule).css("overflow","hidden");
				$("#"+selectedModule).show();
				$("#"+selectedModule).addClass("cropped");
				$(".cropped").resizable({disabled:true});
			});
			$( document ).off( "click", "#cancelCrop"); //unbind old events, and bind a new one
			$( document ).on( "click", "#cancelCrop" , function() {
				$("#"+selectedModule).show();
				$('#cropModule, #hideDelRow, #resizeModule, #hoverRow, #zRow, #hoverTimeRow').show();
				$('#endCrop, #cancelCrop').hide();
				$('.cropperWrapper').remove();
			});
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
		$(this).addClass('selectedShadow');

		body = $(this).children('p');
		moduleContainer = $(this).attr('id');
		
		var objId = moduleContainer;	
		var elementPos = cell_arr.map(function(x) {return x.id; }).indexOf(objId);
		var objectFound = cell_arr[elementPos];
		console.log(objectFound);
		
		$(bodyChange).val(body.html());
		$(bgColor).val($('#'+id).css('background-color'));
		$(textColor).val($('#'+id).children('p').css('color'));
		var backgroundColor = $('#'+selectedModule).css('background-color');	 
		fontSize.val($(this).css('font-size').slice(0, - 2));	//takes 'px' off end
		
		$(".textColorChange").off("mouseover.color");
		$(".textColorChange").on("mouseover.color", function(event, color){
			$('#'+selectedModule).css('color',color);
		});
		
		//event handler for plus and minus font size
		$( document ).off("click", "#fontSizePlus, #fontSizeMinus");
		$( document ).on("click", "#fontSizePlus, #fontSizeMinus", function() {
			if($(this).attr('id') == 'fontSizeMinus'){
				objectFound.fontPlusMinus('minus')
			}
			else{
				objectFound.fontPlusMinus('plus')
			}
		});
		
		//delegate even handler for mousing over 
		$(".textColorChange").off("mouseover.color");
		$(".textColorChange").on("mouseover.color", function(event, color){
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
		// delete event handler
		$( document ).off( "click", "#deleteModule"); //unbind old events, and bind a new one
		$( document ).on( "click", "#deleteModule" , function() {	
			$("#"+selectedModule).remove();
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
		$('#hideDelRow, #zRow, #urlRow , #resizeModule, #cropRow, #hoverRow').show();
		moduleContainer = $(this).attr('id');
		selectedModule = $(this).find('img').attr('id');

		//change title of edit window 
		$('.editWindow h2').text("Image "+moduleContainer);
		$(this).addClass('selectedShadow');
		
		var objId = selectedModule;
		console.log(moduleContainer);
		var elementPos = cell_arr.map(function(x) {return x.id; }).indexOf(objId);
		var objectFound = cell_arr[elementPos];
		console.log(objectFound);
		
		url = $(this).find('img');
		//populate input fields with image specific information
		$(urlChange).val(url.attr('src'));
		
		var radiobtn
		if(objectFound.hoverable){
			radiobtn = document.getElementById("hoverEnabled");
			radiobtn.checked = true;
			$('#hoverTime').val($('#'+selectedModule).attr('alt'));
			$('#hoverTimeRow').show();

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
				$('#'+moduleContainer).addClass('hoverables');
				
				$('#hoverTimeRow').show();

			}
			else{
				$('#'+moduleContainer).removeClass('hoverables');
				$('#hoverTimeRow').hide();
			}
		});
		
		$( document ).off( "keyup", "input#hoverTime");
		$( document ).on( "keyup", "input#hoverTime" , function() {
			$('#'+selectedModule).attr('alt',$('input#hoverTime').val());
		});
		
		//delegate event handler for url change
		$( document ).off( "paste", "input.urlChange"); //unbind old events, and bind a new one		
		$( document ).on( "paste", "input.urlChange" , function() {	
			objectFound.setSrc();
		});
		//unbind old events, and bind a new one
		$( document ).off( "click", "#deleteModule"); 
		$( document ).on( "click", "#deleteModule" , function() {
			objectFound.deleteElement();
		});
		// unbind old event handler
		$( document ).off( "click", "#resizeModule"); //unbind old events, and bind a new one
		$( document ).on( "click", "#resizeModule" , function() {
			var width = document.getElementById(selectedModule).naturalWidth;
			var height = document.getElementById(selectedModule).naturalHeight;
			$("#"+selectedModule).css('width', width);
			$("#"+selectedModule).css('height',height);
			$("#"+selectedModule).parent().css('width', width);
			$("#"+selectedModule).parent().css('height',height);
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
		
		$('.roundingChange').val(objectFound.precision)
		populateConversions(objId);
		
		
		$( document ).off( "keyup", "input.roundingChange") //unbind old events, and bind a new one
		$( document ).on( "keyup", "input.roundingChange" , function() {	
			objectFound.setPrecision($('.roundingChange').val());
		});
		
		//event handler for font plus and minus being clicked
		$( document ).off("click", "#fontSizePlus, #fontSizeMinus");
		$( document ).on("click", "#fontSizePlus, #fontSizeMinus", function() {
			if($(this).attr('id') == 'fontSizeMinus'){
				objectFound.fontPlusMinus('minus')
			}
			else{
				objectFound.fontPlusMinus('plus')
			}
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
		$(".textColorChange").off("mouseover.color");
		$(".textColorChange").on("mouseover.color", function(event, color){
			objectFound.fontColorChange(color);
		});	
		//fontsize input change event handler
		$( document ).off( "keyup", "input#fontSize") //unbind old events, and bind a new one
		$( document ).on( "keyup", "input#fontSize" , function() {
			var size = fontSize.val()
			$('#'+moduleContainer).css('font-size', fontSize.val());				
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
			var text = htmlEntities(labelChange.val());
			objectFound.setLabel(text);
		});
		// delete event handler
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
	/*if($("#"+selectedModule).hasClass('hide')){
		$('#hideModule').attr('onclick', "showModule('"+ selectedModule +"')");
		$('#hideModule').html('<i class="fa fa-eye fa-2x"></i> Unhide Selected');
	}
	else{
		$('#hideModule').attr('onclick', "hideModule('"+ selectedModule +"')");
		$('#hideModule').html('<i class="fa fa-eye-slash fa-2x"></i> Hide Selected');
	}*/
};
function edit(handler) {
	editMode = true;
	$('#masterEdit').css('background-color','green');
	$('.tr').css('cursor','pointer');
	$('.textBlockContainer').css('cursor','pointer');
	$('.hide').css('visibility','visible');
	$('.controls').show(200);
	$('#masterEdit').attr('onclick', 'nonEdit()');
	//delegate events
	$('.top-container').delegate('.tr','click', editWindow);
	$('#content').delegate('.textBlockContainer, .imgBlockContainer, .imgCamContainer','click', editWindow);	
	//$('#content').delegate('.imgBlockContainer','click',editWindow);
	//$('#content').delegate('.imgCamContainer','click',editWindow);
	$('.controls').delegate('#pageEdit, #createStatic, #configMenu','click',editWindow);

	
	//enable draggables and resizables
	$('.ui-icon').show();
	$(".jstree-leaf").draggable({
		helper: "clone",
		delay: 300
	});
	$(".imgCamContainer").draggable( "option", "disabled", false ).resizable( "option", "disabled", false );
	$(".cropped").resizable({disabled:true});
	$(".draggable").draggable( "option", "disabled", false ).resizable( "option", "disabled", false );
	$('.textBlockContainer').draggable( "option", "disabled", false ).resizable( "option", "disabled", false );
	$('.imgBlockContainer').draggable( "option", "disabled", false ).resizable( "option", "disabled", false );
}
function nonEdit(handler) {
	editMode = false;
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
	$('#content').undelegate('.textBlockContainer, .imgBlockContainer, .imgCamContainer','click', editWindow);
	$('.top-container').undelegate('.tr','click', editWindow);
	//$('#content').undelegate('.imgBlockContainer','click',editWindow);
	//$('#content').undelegate('.imgCamContainer','click',editWindow);
	$('.controls').delegate('#pageEdit, #createStatic, #configMenu','click',editWindow);
	
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

function captureState(){
	for(var k in cell_arr){
		cell_arr[k].onChangeStyle();
	}
	var saveName = $('#saveAs').val().replace(' ','%20');

	var jsonString = JSON.stringify(cell_arr);
	//savedStates.push(jsonString);
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

	for(var k in configObject){
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
			cell_arr.push(configObject[k]);
			configObject[k].loadHtml();

		}
		else if(configObject[k].elementType == 'pageImg'){
			var img = new pageImg();
			console.log(cell);
			configObject[k].__proto__ = img.__proto__;
			cell_arr.push(configObject[k]);
			configObject[k].loadHtml();

		}
		else if(configObject[k].elementType == 'pageText'){
			var text = new pageText();
			configObject[k].__proto__ = text.__proto__;
			cell_arr.push(configObject[k]);
			configObject[k].loadHtml();
		}
	}
	console.log( cell_arr );
}
/*function that iterates through all instances of the ".tr, .imgBlockContainer, .textBlockContainer, .imgCamContainer" class selectors
and records all relevant data from the elements with these classes, create objects using the data as properties, and then loads the objects into
individual arrays for each type of selector class. once Each array has been created, a saved state array encompasses all of the data.*/
function captureState1(){
	//saved_state array to hold individual object arrays
	var saved_State = [];
	//object arrays for different types of objects
	var cells = [];
	var text_Blocks = [];
	var cameras = [];
	var img_Blocks = [];
	//object for storing data
	var SavedElement = function SavedElement() {
		//default attributes
		SavedElement.prototype.top;
		SavedElement.prototype.left;
		SavedElement.prototype.width;
		SavedElement.prototype.height;
		SavedElement.prototype.fontSize;
		SavedElement.prototype.fontColor;
		SavedElement.prototype.bgColor;
		SavedElement.prototype.id;
		SavedElement.prototype.innerHTML;
		SavedElement.prototype.src;
		SavedElement.prototype.title;
		SavedElement.prototype.label;
		SavedElement.prototype.path;
		SavedElement.prototype.divID;	
		SavedElement.prototype.hidden;	
		SavedElement.prototype.hoverToggle;
		SavedElement.prototype.zIndex;
	}
	//iterate through cells currently on screen
	$( '.tr' ).each(function( index ) {
		//create an instance of the SavedElement object
		var savedCell = new SavedElement;
		//set attributes to the values of the current cell
		savedCell.top = $(this).css('top');
		savedCell.left = $(this).css('left');
		savedCell.width = $(this).css('width');
		savedCell.height = $(this).css('height');
		savedCell.title = $(this).children('.myTableTitle').children('.titleText').text();
		savedCell.originalTitle = $(this).children('.mytableTitle').children('.titleEdit').attr('title');
		savedCell.label = $(this).children('.myTableValue').children('.label').text();
		savedCell.fontSize = $(this).children('.myTableValue').css('font-size');
		savedCell.divID = $(this).attr('id');
		savedCell.id = $(this).children('.myTableValue').attr('id');
		savedCell.path = $(this).children('.myTableValue').children('.path').text();
		savedCell.zIndex = $(this).css('z-index');
		console.log($(this).children('.myTableTitle').find('.titleText').text());
			//var value = $('#stationTree').jstree(true).get_node(treeID).original.obj.value; 
			var units, title, type, typeUnits, typeChange, precision;
			var pos = savedCell.id.lastIndexOf('_');
			var treeID = savedCell.id.slice(4,pos);
			//gets typeUnits if there
			console.log(cell_arr[0].id);
			console.log(savedCell.id);
			var elementPos = cell_arr.map(function(x) {return x.id; }).indexOf(savedCell.id.replace('div_',''));
			var objectFound = cell_arr[elementPos];
			if(objectFound['typeUnits'] !== undefined){
				typeUnits = $('#stationTree').jstree(true).get_node(treeID).original.obj.typeUnits;
				savedCell.typeUnits = typeUnits;
			}
			else{
				typeUnits = "";
			}
			if(objectFound['precision'] !== undefined){
				precision =	objectFound['precision'];
				savedCell.precision = precision;
			}
			if(objectFound['typeChange'] !== undefined){
				typeChange = objectFound['typeChange'];
				savedCell.typeChange = typeChange;
			}
			else{
				type = "";
			}
			//gets type if there
			if(objectFound['type'] !== undefined){
				type = $('#stationTree').jstree(true).get_node(treeID).original.obj.type;
				savedCell.type = type;
			}
			else{
				type = "";
			}
			//gets units if there
			if(objectFound['units'] !== undefined){
				units = $('#stationTree').jstree(true).get_node(treeID).original.obj.units;
				savedCell.units = units;
			}
			else{
				units = "";
			}
			//gets title if there
			if(objectFound['title'] == 'undefined'){
				title = $('#stationTree').jstree(true).get_node(treeID).original.obj.title; 
				savedCell.title = title;
				console.log('TITLE ' + objectFound['title']);
			}
			else{

			}
		if($(this).hasClass("hide")){
				savedCell.hidden = true;
		}
		//push the object to the cell array
		cells.push(savedCell);
	});
	//iterate through user created images
	$( '.imgBlockContainer' ).each(function( index ) {
		//create an instance of the SavedElement object
		var savedImg = new SavedElement;
		//set attributes to the values of the current image
		savedImg.top = $(this).css('top');
		savedImg.left = $(this).css('left');
		savedImg.width = $(this).children('.ui-wrapper').children('img').css('width');
		savedImg.height = $(this).children('.ui-wrapper').children('img').css('height');
		savedImg.src = $(this).children('.ui-wrapper').children('img').attr('src');
		savedImg.id = $(this).children('.ui-wrapper').children('img').attr('id');
		savedImg.zIndex = $(this).css('z-index');
		if($(this).find('img').hasClass('hoverables')){
			savedImg.hoverToggle = true;
		}
		else{
			savedImg.hoverToggle = false;
		}
		if($(this).children('.ui-wrapper').children('img').hasClass("hide")){
			savedImg.hidden = true;
		}
		//push the object to the img_Blocks array
		img_Blocks.push(savedImg);
	});
	//iterate through user created text
	$( '.textBlockContainer' ).each(function( index ) {
		//create an instance of the savedElement object
		var savedText = new SavedElement;
		//set attributes to the values of the current text block
		savedText.top = $(this).css('top');
		savedText.left = $(this).css('left');
		savedText.width = $(this).css('width');
		savedText.height = $(this).css('height');
		savedText.fontSize = $(this).css('font-size');
		savedText.fontColor = $(this).children('p').css('color');
		savedText.bgColor = $(this).css('background-color');
		savedText.divID = $(this).attr('id');
		savedText.innerHTML = $(this).children('p').html();
		savedText.zIndex = $(this).css('z-index');
		if($(this).hasClass("hide")){
				savedText.hidden = true;
		}
		//push the object to the img_Blocks array
		text_Blocks.push(savedText);
	});
	//iterate through active cams
	$( '.imgCamContainer' ).each(function( index ) {
		var savedCam = new SavedElement;
		if($(this).is(":visible") && !$(this).hasClass("hide")){
			savedCam.top = $(this).css('top');
			savedCam.left = $(this).css('left');
			savedCam.width = $(this).css('width');
			savedCam.height = $(this).css('height');
			savedCam.divID = $(this).attr('id');
			savedCam.zIndex = $(this).css('z-index');
		cameras.push(savedCam);	
		}
		else if($(this).hasClass("hide")){
			savedCam.top = $(this).css('top');
			savedCam.left = $(this).css('left');
			savedCam.width = $(this).css('width');
			savedCam.height = $(this).css('height');
			savedCam.divID = $(this).attr('id');
			savedCam.zIndex = $(this).css('z-index');
			savedCam.hidden = true;
		cameras.push(savedCam);		
		}
	});
	var saveName = $('#saveAs').val().replace(' ','%20');
	//load our object arrays into the saved state array
	if(saveName == ''){
		saved_state = {"cells":cells, "text_Blocks":text_Blocks, "cameras":cameras, "img_Blocks":img_Blocks};
	}
	else{
		saved_state =   {"name": saveName, "cells":cells, "text_Blocks":text_Blocks, "cameras":cameras, "img_Blocks":img_Blocks};
	}
	var jsonString = JSON.stringify(saved_state);
	//savedStates.push(jsonString);
	console.log(savedStates);
		//for testing purposes
		//$('#json').val(jsonString);
	//config_send("http://cam.aprsworld.com:8888/.config");
	data_object.ValueSet(function(rsp){
		console.log(rsp);
		if (rsp.error) {
			alert('Failed to save configuration to server!');
		}
	},'webdisplay/configs/'+saveName,jsonString,0);
}
/*A function that is passed a json string that holds elements and their properties from a saved state of a layout. Once it takes in the json string
it will iterate through the properties of the ".tr, .imgBlockContainer, .textBlockContainer, .imgCamContainer" elements and create them as they were in 
the saved state*/
function loadState1(jsonString){
	var stateObject = JSON.parse(jsonString);
	console.log(stateObject);
	id_arr.length = 0;
	path_arr.length = 0;
	cell_arr.length = 0;
	$('.tr, .textBlockContainer, .imgBlockContainer').remove();
	$('.imgCamContainer').hide();
	//iterate over all keys in the saved state object
	for(var k in stateObject){
		if(k.hasOwnProperty('name')){
			//do nothing
		}
		else if(k == 'cells'){
			for(var cells in stateObject[k]){
				//find the cell object
				var savedCell = stateObject[k][cells];
				//get attributes of cell object 
				var savedCellTop = savedCell.top; 
				var savedCellLeft = savedCell.left; 
				var savedCellWidth = savedCell.width; 
				var savedCellHeight = savedCell.height; 
				var savedCellzIndex = savedCell.zIndex;
				var savedCellTitle = savedCell.title; 
				var savedCellOriginalTitle = savedCell.originalTitle; 
				var savedCellLabel = savedCell.label; 
				var savedCellFontSize = savedCell.fontSize;
				var savedCellDivID = savedCell.divID; 
				var savedCellID = savedCell.id; 
				var savedCellPath = savedCell.path;
				var savedCellVisibility = savedCell.hidden;
				//append a cell with these properties to the top-container div
				$('.top-container').append('<div class="tr draggable" id="' + savedCellDivID + '"><div class="td myTableID"> ID: <span>' + savedCellDivID + '</span> </div><div class="td myTableTitle"><p class="titleText">' + savedCellTitle + '</p></div><div class="td myTableValue" id="' + savedCellID + '"><p>Loading...</p><span class="path">'+ savedCellPath +'</span><span class="label">'+ savedCellLabel +'</span></div></div>');
				$("#"+savedCellDivID).css('position','absolute');
				$("#"+savedCellDivID).css('top', savedCellTop);
				$("#"+savedCellDivID).css('left',savedCellLeft);
				$("#"+savedCellDivID).css('width',savedCellWidth);
				$("#"+savedCellDivID).css('height',savedCellHeight);
				$("#"+savedCellDivID).css('z-index',savedCellzIndex);
				$("#"+savedCellDivID).children('.myTableValue').css('font-size', savedCellFontSize);
				if(savedCellVisibility == true){
					$("#"+savedCellDivID).addClass('hide');
					$("#"+savedCellDivID).css('opacity','0.2');
				}
				else{
					if($("#"+savedCellDivID).hasClass('hide')){
						$("#"+savedCellDivID).removeClass('hide');
						$("#"+savedCellDivID).css('opacity','1.0');
					}
				}
				var tree_item = {};
				if(savedCell['typeUnits'] !== undefined){
					tree_item['typeUnits'] = savedCell.typeUnits;
				}
				if(savedCell['typeChange'] !== undefined){
					tree_item['typeChange'] = savedCell.typeChange;
				}
				if(savedCell['units'] !== undefined){
					tree_item['units'] = savedCell.units;
				}
				if(savedCell['title'] !== undefined){
					tree_item['title'] = savedCell.title;
				}
				if(savedCell['type'] !== undefined ){
					tree_item['type'] = savedCell.type;
				}
				if(savedCell['precision'] !== undefined ){
					tree_item['precision'] = savedCell.precision;	
				}
				var pos = savedCellID.lastIndexOf('_');
				var treeID = savedCellID.slice(4,pos);
				id_arr.push(savedCellID);
				path_arr.push(savedCellPath);
				tree_item["path"] = savedCellPath;
				tree_item["id"] = savedCellID.replace('div_', '');
				cell_arr.push(tree_item);
				console.log(tree_item);
				console.log(path_arr);
				console.log(id_arr);
			}
		}
		else if(k == 'text_Blocks'){
			for(var textBlocks in stateObject[k]){
				//find the text block object
				var savedText = stateObject[k][textBlocks];
				//get attributes of the text block object
				var savedTbTop = savedText.top; 
				var savedTbLeft = savedText.left; 
				var savedTbWidth = savedText.width; 
				var savedTbHeight = savedText.height;
				var savedTbzIndex = savedText.zIndex;
				var savedTbFontSize = savedText.fontSize;
				var savedTbFontColor = savedText.fontColor;
				var savedTbBgColor = savedText.bgColor
				var savedTbDivID = savedText.divID; 
				var savedTbInnerHtml = savedText.innerHTML;
				var savedTbVisibility = savedText.hidden;
				//append text block with these properties to the content div
				$('#content').append('<div class="textBlockContainer" id="'+ savedTbDivID +'"><p>'+ savedTbInnerHtml +' </p></div>');
				$("#"+savedTbDivID).css('top',savedTbTop);
				$("#"+savedTbDivID).css('left', savedTbLeft);
				$("#"+savedTbDivID).css('width', savedTbWidth);
				$("#"+savedTbDivID).css('height',savedTbHeight);
				$("#"+savedTbDivID).css('font-size', savedTbFontSize);
				$("#"+savedTbDivID).children('p').css('color', savedTbFontColor);
				$("#"+savedTbDivID).css('background-color', savedTbBgColor);
				$("#"+savedTbDivID).css('z-index',savedTbzIndex);
				console.log(savedTbDivID+" has a top of "+savedTbTop+" and a left of "+savedTbLeft);
				if(savedTbVisibility == true){
					$("#"+savedTbDivID).addClass('hide');
					$("#"+savedTbDivID).css('opacity','0.2');

				}
				else{
					if($("#"+savedTbDivID).hasClass('hide')){
						$("#"+savedTbDivID).removeClass('hide');
						$("#"+savedTbDivID).css('opacity','1.0');
					}
				}
			}
		}
		else if(k == 'cameras'){
			for(var cameras in stateObject[k]){
				//find the camera object
				var savedCam = stateObject[k][cameras];
				//get attributes of the camera object	
				var savedCamTop = savedCam.top;
				var savedCamLeft = savedCam.left;
				var savedCamWidth = savedCam.width;
				var savedCamHeight = savedCam.height;
				var savedCamDivID = savedCam.divID;
				var savedCamVisibility = savedCam.hidden;
				var savedCamzIndex = savedCam.zIndex;
				var src = $("#"+savedCamDivID).css('background-image');
				src = src.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
				$("#"+savedCamDivID).css('top',savedCamTop);
				$("#"+savedCamDivID).css('left',savedCamLeft);
				$("#"+savedCamDivID).css('width',savedCamWidth);
				$("#"+savedCamDivID).css('height',savedCamHeight);
				$("#"+savedCamDivID).css('z-index',savedCamzIndex);
				$("#"+savedCamDivID).children('img').attr('src',src);

				if(savedCamVisibility == true){
					$("#"+savedCamDivID).addClass('hide');
					$("#"+savedCamDivID).css('opacity','0.2');

				}
				else{
					if($("#"+savedCamDivID).hasClass('hide')){
						$("#"+savedCamDivID).removeClass('hide');
						$("#"+savedCamDivID).css('opacity','1.0');
					}
				}
				$("#"+savedCamDivID).show();
			}
		}
		else if(k == 'img_Blocks'){
			for(var imgBlocks in stateObject[k]){
				//find the img block object
				var savedImg = stateObject[k][imgBlocks];
				//get attributes of the imgBlock Object
				var savedImgTop = savedImg.top; 
				var savedImgLeft = savedImg.left; 
				var savedImgWidth = savedImg.width; 
				var savedImgHeight = savedImg.height; 
				var savedImgSrc = savedImg.src; 
				var savedImgzIndex = savedImg.zIndex;				
				var savedImgId = savedImg.id; 
				var savedImgVisibility = savedImg.hidden;
				//append the image to the content div and set its properties
				$('#content').append('<div id='+savedImgId+'container class="imgBlockContainer"><div class="cam-drag-handle"></div><img onerror="brokenImg('+savedImgId+')" id='+savedImgId+' alt='+savedImgId+' src='+savedImgSrc+'></div>');
				$("#"+savedImgId).parent().css('top',savedImgTop);
				$("#"+savedImgId).parent().css('left',savedImgLeft);
				$("#"+savedImgId).css('width',savedImgWidth);
				$("#"+savedImgId).css('height',savedImgHeight);
				$("#"+savedImgId).css('z-index',savedImgzIndex);
				if(savedImgVisibility == true){
					$("#"+savedImgId).addClass('hide');
					$("#"+savedImgId).css('opacity','0.2');

				}
				else{
					if($("#"+savedImgId).hasClass('hide')){
						$("#"+savedImgId).removeClass('hide');
						$("#"+savedImgId).css('opacity','1.0');
					}
				}
				$("#"+savedImgId).show();
			}
		}
	}
	//make new cells draggable and resizable
	$(".draggable").draggable({ //makes our data cells draggable
		disabled: true,
		grid: [1, 1],
		snap: true,
		snapTolerance: 10,
		start: function(event, ui) {
			$(this).addClass('draggable_focus_in');
			$('.controls').animate({
				width: '10px'
			},100);
			$('.editWindow').animate({
				width: '0px',
				margin: '0',
			},50);
			$('.controlRow').hide();
			$('.controls h2').hide();
		},
		stop: function(event, ui) {
			$(this).removeClass('draggable_focus_in');
			$('.controls').animate({
				width: '250px'
			},200);
			$('.editWindow').animate({
				width: '280px',
			},200);
			$('.controlRow').show();
			$('.controls h2').show();
		}
		}).resizable({});						
		$(".draggable").draggable( "option", "disabled", false )
	//makes text blocks draggable and resizable after being loaded
	$(".textBlockContainer").draggable({
		disabled: false,
		start: function(event, ui) {
					$(this).addClass('draggable_focus_in');
					$('.controls').animate({
						width: '10px'
					},100);
					$('.editWindow').animate({
						width: '0px',
						margin: '0',
						padding: '0'
					},50);
					$('.controlRow').hide();
					$('.controls h2').hide();
				},
		stop: function(event, ui) {
			$(this).removeClass('draggable_focus_in');
			$('.controls').animate({
				width: '250px'
			},200);
			$('.editWindow').animate({
				width: '280px',
				padding: '20px'
			},200);
			$('.controlRow').show();
			$('.controls h2').show();
		}
		}).resizable({
			disabled: false,
			handles: 'all'
		});
	//makes cameras draggable and resizable after being loaded
	$('.imgCamContainer').draggable({
		start: function(event, ui) {
				$('.controls').animate({
					width: '10px'
				},100);
				$('.editWindow').animate({
					width: '0px',
					margin: '0',
					padding: '0'
				},50);
				$('.controlRow').hide();
				$('.controls h2').hide();
			},
		stop: function(event, ui) {
			$('.controls').animate({
				width: '250px'
			},200);
			$('.editWindow').animate({
				width: '280px',
				padding: '20px'
			},200);
			$('.controlRow').show();
			$('.controls h2').show();
		},
		disabled: false}).resizable({disabled: false, aspectRatio: true, handles: 'all'});
	//makes images draggable and resziable after being loaded
	$(".imgBlockContainer").draggable({
		start: function(event, ui) {
		$(this).addClass('draggable_focus_in');
			$('.controls').animate({
				width: '10px'
			},100);
			$('.editWindow').animate({
				width: '0px',
				margin: '0',
				padding: '0'
			},50);
			$('.controlRow').hide();
			$('.controls h2').hide();
		},
		stop: function(event, ui) {
			$(this).removeClass('draggable_focus_in');
			$('.controls').animate({
				width: '250px'
			},200);
			$('.editWindow').animate({
				width: '280px',
				padding: '20px'
			},200);
			$('.controlRow').show();
			$('.controls h2').show();
		}
		});
		$(".imgBlockContainer").find('img').resizable({ 
					disabled: false,
					minHeight: 70,
					minWidth: 150,
					aspectRatio: true,
					handles: 'all'
		});	
}
