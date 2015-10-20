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
var name_arr = [];
var savedStates = []; //set of saved table states in the format of a multi Dimensional array consisting of coordinates of each cell
var textBlocks = []; //array to keep track of ids of generated text blocks
var imgBlocks = []; //array to keep track of ids of generated images
var started = false; //this boolean makes sure we only execute some of our functions only once such as the jquery ui setup
/*******************************/
/*function config_retr(url) {
	$.ajax(url, {
		cache: false,
		dataType: 'json',
	}).done(function (data, status, XHR) {
		// XXX: status, XHR?
		if (!data || typeof data !== 'object' || data.error || !data.result || typeof data.result !== 'object') {
			alert('Failed to load configurations from server.');
			return;
		}
		savedStates = data.result;
		$('#stateSelect').empty();
		var i;
		for (i = 0; i < savedStates.length; i++) {
			var option = document.createElement("option");
        		option.text = "Layout#" + i;
    			option.value = i;
			$('#stateSelect').append(option);
		}
	}).fail(function (XHR, status, error) {
		//alert('Failed to load configurations from server.');
	});
}
function config_send(url) {
	$.ajax(url, {
		cache: false,
		dataType: 'json',
		method: 'POST',
		contentType: 'text/plain',	// XXX: application/json but this has complications
		processData: false,
		data: JSON.stringify(savedStates)
	}).done(function (data, status, XHR) {
		if (!data || typeof data !== 'object' || data.error || !data.result || data.result != "STORED") {
			//alert('Failed to save configurations to server.');
		}
	}).fail(function (XHR, status, error) {
		//alert('Failed to save configurations to server.');
	});
}*/

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
function table_generate(data) {
    var $dtable = $('<table border=1></table>');
    for (var p in data) {
        var $drow = $('<tr></tr>');
        var $th = $('<th></th>');
        $th.text(p);
        $drow.append($th);
        // Nest Objects
        if (typeof data[p] === 'object') {
            $drow.append(table_generate(data[p]));
        } else {
            var $td = $('<td></td>');
            $td.text(data[p]);
            $drow.append($td);
        }
        $dtable.append($drow);
    }
    return $dtable;
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
				margin: '10px',
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
				margin: '10px',
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
				margin: '10px',
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
				margin: '10px',
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

function iterateStations(obj, stack, arr, lastk) {
	for (var property in obj) {
        if (obj.hasOwnProperty(property)) {
            if (typeof obj[property] == "object") { //is this property an object? then find next property
				var jsonItem = {};
				var id = ("ws_" + stack+property+"_x").replace(/\./g, "");				
				var path = stack + '.' + property;
				var parent = ("ws_"+stack+"_x").replace(/\./g, "");
				if(parent == "ws__x"){ //case for root node
					parent = "#";	
				}
				jsonItem ["id"] = id;
				jsonItem ["parent"] = parent;
				if('undefined' !== typeof obj[property]['title'] && 'undefined' == typeof obj[property]['value'] && 'undefined' == typeof obj[property]['units'] && typeof obj[property] == "object"){
					jsonItem ["text"] = obj[property]['title'];
					jsonItem ["id"] = id;
					jsonItem ["parent"] = parent;
					arr.push(jsonItem)
					lastk = property; //keeps track of last property which is stored in a global variable
					iterateStations(obj[property], stack + '.' + property, arr, lastk); //combine stack and property and call function recurssively
				}
				//checks for specific child properties of nested object - this will allow for dynamically adding units and titles to the cells
				else if('undefined' !== typeof obj[property]['title'] || 'undefined' !== typeof obj[property]['value'] || 'undefined' !== typeof obj[property]['units']){
					jsonItem ["id"] = id;
					jsonItem ["parent"] = parent;
					//case for all three child properties existing
					if('undefined' !== typeof obj[property]['title'] && 'undefined' !== typeof obj[property]['value'] && 'undefined' !== typeof obj[property]['units']){
						jsonItem ["text"] = obj[property]['title'];
						jsonItem ["obj"] = {"path": stack + '.' + property + ".value", "value": obj[property]['value'], "units": obj[property]['units'], "title": obj[property]['title']};
					}
					//case for missing title property
					else if('undefined' !== typeof obj[property]['value'] && 'undefined' !== typeof obj[property]['units']){
						jsonItem ["text"] = property;
						jsonItem ["obj"] = {"path": stack + '.' + property + ".value", "value": obj[property]['value'], "units": obj[property]['units']};
					}
					//case for missing value property
					else if('undefined' !== typeof obj[property]['title'] && 'undefined' !== typeof obj[property]['units']){
						jsonItem ["obj"] = {"path": stack + '.' + property, "units": obj[property]['units'], "title": obj[property]['title']};
					}
					//case for missing units property
					else if('undefined' !== typeof obj[property]['title'] && 'undefined' !== typeof obj[property]['value']){
						jsonItem ["obj"] = {"path": stack + '.' + property + ".value", "value": obj[property]['value'], "title": obj[property]['title']};
					}
					//case fo rmissing units and value property
					else if('undefined' !== typeof obj[property]['title']){
						jsonItem ["obj"] = {"path": stack + '.' + property, "title": obj[property]['title']};						
					}
					//case for missing units and title property
					else if('undefined' !== typeof obj[property]['value']){
						jsonItem ["text"] = property;
						jsonItem ["obj"] = {"path": stack + '.' + property + ".value"};						
					}
					//case for missing value and title property
					else if('undefined' !== typeof obj[property]['units']){
						jsonItem ["text"] = property;
						jsonItem ["obj"] = {"path": stack + '.' + property, "units": obj[property]['units']};												
					}
					arr.push(jsonItem);
					delete jsonItem;

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
            } else {
				var jsonItem = {};
				var id = ("ws_" + stack+property+"_x").replace(/\./g, "");
				var path = stack + '.' + property;
				var parent = ("ws_"+stack+"_x").replace(/\./g, "");
				jsonItem ["id"] = id;
				jsonItem ["parent"] = parent;
				jsonItem ["text"] = property;
				//case for when we are setting title of station with a child title node
				if(property !== 'title'){
					jsonItem ["obj"] = {"path": stack + '.' + property};
					arr.push(jsonItem);
				}
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
function dynamicUpdate($id_arr, $path_arr, data) {
	var idLength = $id_arr.length;
    for ($i = 0; $i < idLength; $i++) {
		var value = ref(data, $path_arr[$i]); //finds value of object
	if (value === undefined) {
		value = 'MISSING DATA!';
	}
        $('div#' + $id_arr[$i] + '').children('p').text(value);
    }
}
function getStations(data){
	var stations = [];
	var lastk = "#";
	var i = 0;
	for(var k in data){
		if( i = 0){
			//do nothing since this is not a station	
		}
		else{
			var station_arr;
			stations.push(k);
			iterateStations(k, "",station_arr, lastk);
		}
		i++;
	}
}	
function getCamData(data){
	var pairs = []; //array to hold serial key pairs
	var serials; //names of each camera
	var keys; //image url source for each camera
	var path
	var i = 0;
	for(var k in data){
		if( i = 0){
			//do nothing since this is not a station	
		}
		else{
			for(var c in data[k]['cameras']){
				var stationName = k;
				var camNumber = c;
				keys = (data[k]['cameras'][c]['image_url']);
				serials = (data[k]['cameras'][c]['source_serial']);
				path = stationName+"cameras"+camNumber;
				pairs.push([serials, keys, path]);
			}
		}
	}
	return pairs;
}
function populateCams(cam_arr){
	for(var i =0; i<cam_arr.length; i++){
		$('#content').append('<div class="imgCamContainer" id=div_ws_'+cam_arr[i][2]+'image_url_x style="background-image:url('+cam_arr[i][1]+'); display: none;"><img style="visibility:hidden;" src=""></div>');
		$('#preload').append('<img alt="camimage" src="" id="preload_div_ws_'+cam_arr[i][2]+'image_url_x" >');
	}	
}
function createCamFromTree(tree_id){
	var selection = tree_id;
	$('.imgCamContainer').draggable({
		grid: [1, 1],
		snap: true,
		snapTolerance: 10,
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
				margin: '10px',
				padding: '20px'
			},200);
			$('.controlRow').show();
			$('.controls h2').show();
		},
		disabled: false}).resizable({disabled: false, handles: 'all'});
	$('#preload_div_'+selection).load(function() {
		var src = $(this).attr("src");
		
		$('.imgCamContainer').resizable( "option", "aspectRatio", true );
		$('#div_'+selection).children('img').attr('src',src);
		//proof of concept
		$('#div_'+selection).children('img').attr('alt','1');
		$("#div_"+selection).css('display','inline');
	});
	var url = $('#div_'+selection).css('background-image').replace(/^url\(["']?/, '').replace(/["']?\)$/, ''); //gets url from background-image prop
	$('#preload_div_'+selection).attr('src', url);
}
	
//function that refreshes cams and preloads the refreshed image before displaying it	
function refreshCams(cam_arr){
	//iterates through known cams
	var camLength = cam_arr.length;
	for(var i =0; i<camLength; i++){
		//only finds cams that are visible
		var currentCam;
		if($('#div_ws_'+cam_arr[i][2]+'image_url_x').is(":visible")){
			//the camera image is not displayed until the image is done loading
			currentCam = $('#div_ws_'+cam_arr[i][2]+'image_url_x');
			currentCam = currentCam.attr('id');
			$('#preload_'+currentCam).unbind()
			$('#preload_'+currentCam).load(function() {
				var src = $(this).attr('src');
				var cam = $(this).attr('id').replace("preload_","");
				document.getElementById(cam).style.backgroundImage = 'url('+src+')';
				
			});
			//src is set after the .load() function
			$('#preload_'+currentCam).attr('src',cam_arr[i][1]);		

		}
	}
	//empty array
	camLength = null;
	cam_arr.length = 0;
}	
function fontSizeChange(direction, id){
	var fontsize = $('#'+id).css('font-size');
	if(direction == 'decrease'){
		fontsize = fontsize.replace("px",'');
		fontsize = (parseInt(fontsize)-1).toString();
		fontsize = fontsize+"px";
		$('#'+id).css('font-size', fontsize);
	}
	else if(direction == 'increase'){
		fontsize = fontsize.replace("px",'');
		fontsize = (parseInt(fontsize)+1).toString();
		fontsize = fontsize+"px";
		$('#'+id).css('font-size', fontsize);	
	}
	$('#fontSize').val((fontsize).slice(0,-2));
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
	if(camTime > 90){
		//$('#camTimer').text("90+ seconds since last camera image received. Try refreshing your browser window.");	
	}
}

/*function that periodically updates the data */
function data_update(data) {
	time=0;
	var cams = getCamData(data);
    if (started === false) { //we only want the below block of code to execute once because it is in charge of data creation and initiating a path to the various nested object properties
    	started = true; //sets our boolean to true so the above only executes once
        //path_arr = iteratePath(data, '');
	
        $(".draggable").draggable({ //makes our data cells draggable
            disabled: true,
			grid: [1, 1],
            snap: true,
            snapTolerance: 10,
            start: function(event, ui) {
                $(this).addClass('draggable_focus_in');
            },
            stop: function(event, ui) {
                $(this).removeClass('draggable_focus_in');
            }
        });
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
			populateCams(cams);
			var lastk = "#";
			var jsonArray = [];
			var json = iterateStations(data, "", jsonArray, lastk);
			//sets up our tree
			$(function () {$('#stationTree').jstree({ 'core' : {'multiple' : false, 'cache':false, 'data' : jsonArray},"plugins" : [ "sort" ]})});
			$("#stationTree").bind("open_node.jstree", function (event,  data) {
				$(".jstree-leaf").draggable({
					helper: "clone",
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
						
					},
					stop: function (event, ui) {
						$('.controls').animate({
							width: '250px'
						},200);
						$('.editWindow').animate({
							width: '280px',
							margin: '10px',
							padding: '20px'
						},200);
						$('.controlRow').show();
						$('.controls h2').show();
					}
				});
			});
			initJqueryUI();
			$(".top-container").droppable({
        		accept: '.jstree-leaf',
				drop: function( event, ui ) {
					var $element, $me, $newElement;
					
					$element = $(ui.draggable);
					var id = $($element).attr('id');
					var new_id = "div_"+id;
					var treeNode = $.jstree.reference('#stationTree').get_node(id);
					var path = $('#stationTree').jstree(true).get_node(id).original.obj.path;
					var value = $('#stationTree').jstree(true).get_node(id).original.obj.value; 
					var units;
					
					if($('#stationTree').jstree(true).get_node(id).original.obj.units){
						units = $('#stationTree').jstree(true).get_node(id).original.obj.units;
					}
					else{
						units = "";
					}
					var title;
					if($('#stationTree').jstree(true).get_node(id).original.obj.title){
						title = $('#stationTree').jstree(true).get_node(id).original.obj.title; 
					}
					else{
						title = $($element).text();
					}
					path_arr.push(path);
					id_arr.push(new_id);
					var pageX = event.pageX;
					var pageY = event.pageY;
					//check if id contains image_url - if it does, then we create a camera feed, if it does not we create a data cell
					if(id.indexOf("image_url") >= 0){
						$('#div_'+id).css('position', 'absolute');
						$('#div_'+id).css('top',pageY);
						$('#div_'+id).css('left',pageX);
						createCamFromTree(id);
					cellCount++;
					}
					else{
						$('.top-container').append('<div class="tr draggable" id="' + cellCount + '"><div class="td dg-arrange-table-rows-drag-icon"></div><div class="td myTableID"> ID: <span>' + title + '</span> </div><div class="td myTableTitle"><input title="Original text: '+ title +'" class="titleEdit" type="text"></input><input title="Add a unit label -- Example: &deg;C" class="labelEdit" placeholder="Add a unit label" type="text"></input><p class="titleText">' + title + '</p></div><div class="td myTableValue" id="' + new_id + '"><p>Loading...</p><span class="path">'+ path +'</span><span class="label"> '+ units +'</span></div><div class="td dg-arrange-table-rows-close-icon"><span>Hide:</span><input autocomplete="off" class="checkBox" type="checkbox"></div></div>');
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
									margin: '10px',
									padding: '20px'
								},200);
								$('.controlRow').show();
								$('.controls h2').show();
							}
						}).resizable({});						
						$(".draggable").draggable( "option", "disabled", false )
						$('#'+cellCount).css('position', 'absolute');
						$('#'+cellCount).css('top',pageY);
						$('#'+cellCount).css('left',pageX);
					cellCount++;
					}
				}
			});	
		var layout = getUrlVars()["layout"];
		var cellCount = 0;
		if(layout != undefined){
			$("#stateSelect").val(layout);
			loadState();
                       $(".imgCamContainer").draggable( "option", "disabled", true ).resizable( "option", "disabled", true );
                       $(".draggable").draggable( "option", "disabled", true ).resizable( "option", "disabled", true );
                       $('#ws_status').draggable( "option", "disabled", true ).resizable( "option", "disabled", true );
                       $('.textBlockContainer').draggable( "option", "disabled", true ).resizable( "option", "disabled", true );
                       $('.imgBlockContainer').draggable( "option", "disabled", true ).resizable( "option", "disabled", true );
			var lastCell = $('#'+id_arr[id_arr.length-1]).parent().attr('id');
			cellCount = parseInt(lastCell, 10)+1;
		}
		//allows cams to be hoverable outside of edit function
			var hoverTimeout;
			var hoverImg = document.createElement('img');
			$('.imgCamContainer').hover(function(){
				var camID = $(this).attr('id');
				var camWidth = $(this).children('img').width();
				var camHeight = $(this).children('img').height();
				var camSrc = $(this).css('background-image').replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
				var isWebkit = 'WebkitAppearance' in document.documentElement.style
				var hoverImgID = camID+'hover';
				var timeOut = 1000;
				timeOut = parseInt($('#'+camID).children('img').attr('alt'), 10)*1000;
				var enabled = $('#'+camID).hasClass('hoverables');
					if(editMode == false && enabled == true){	
							hoverTimeout = setTimeout(function() {						
								$(hoverImg).width(camWidth);
								$(hoverImg).height(camHeight);
								hoverImg.src = camSrc;
								console.log(hoverImg);
								$('#'+camID).append(hoverImg);
								$('#'+camID).addClass('focusedCam');
								if (isWebkit) {
									hoverImg.className = 'webKitCam';
									hoverImg.id = hoverImgID;
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
		
        });
	}
	$(document).ready(function() {
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
	refreshCams(cams);
    dynamicUpdate(id_arr, path_arr, data); //updates all data cells to their current values
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
		savedStates = rsp.data;
		$('#stateSelect').empty();
		var i;
		for (i = 0; i < savedStates.length; i++) {
			var option = document.createElement("option");
        		option.text = "Layout#" + i;
    			option.value = i;
			$('#stateSelect').append(option);
		}
		// If ?display=x is specified in the URL, load that one
		var load = getParameterByName('display');
		if (load) {
				load = parseInt(load);
				$( "#stateSelect" ).val(load); 
				loadState();
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
	
	index = textBlocks.length;
	//set default text
	textContent = "Click to change text";
	//create a div to hold the text
	textBlock = document.createElement("div");
	textBlock.className = "textBlockContainer";
	//incremental ID attribute
	textBlock.id = "block"+index;
	//appends a textblock to the div with our default text
	$(textBlock).append('<p>'+textContent+'</p>');
	//appends the textblock to the page
	$('#content').append(textBlock);
	//pushes our id to the global array
	textBlocks.push("block"+index);
	//makes block draggable and resizable
	$(".textBlockContainer").draggable({
		disabled: false,
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
				margin: '10px',
				padding: '20px'
			},200);
			$('.controlRow').show();
			$('.controls h2').show();
		}
		}).resizable({
			disabled: false
		});	
}
function createImage(){
	var imgURL, index;
	index = imgBlocks.length;
	imgBlocks.push("img"+index);
	imgURL = $('#createImageURL').val();
	if(imgURL != ""){
		$('#content').append('<div id=img'+index+'container class="imgBlockContainer"><div class="cam-drag-handle"></div><img class="imageInsert" width="320" height="240" onerror="brokenImg(img'+index+')" id=img'+index+' alt=img'+index+' src="images/insert_image.svg"></img></div>');
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
				margin: '10px',
				padding: '20px'
			},200);
			$('.controlRow').show();
			$('.controls h2').show();
		}
		});
		$("#img"+index+"").resizable({ 
					disabled: false,
					minHeight: 70,
					minWidth: 150,
					aspectRatio: true
		});	
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
							}, 2000);
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
	$('#hoverTimeRow, #hoverRow, #zRow, #titleRow, #labelRow, #urlRow, #bodyRow, #fontSizeRow, #backgroundColorRow, #textColorRow, #opacityRow, #resizeModule, #cropModule, #endCrop').hide();
	$('.editWindow').show(150);
	selectedModule = $(this).attr('id');
	
	//color picker setup
	$('.backgroundColorChange, .textColorChange').colorpicker({
		hideButton: true,
		defaultPalette: 'web',
		showOn: "focus"
	});
	$(".backgroundColorChange").off("mouseover.color");
	$(".backgroundColorChange").on("mouseover.color", function(event, color){
    	$('#'+selectedModule).css('background-color', color);
		$('#opacitySlider .ui-slider-range').css('background', color );
  		$('#opacitySlider .ui-slider-handle').css('border-color', color);
	});
	$('#hideModule,#deleteModule').show();
	if($(this).attr('id') == 'pageEdit'){
		$('.editWindow h2').text("Edit Page");
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
	else if($(this).hasClass('imgCamContainer')){
		$('#cropModule, #resizeModule, #zRow, #hoverRow').show();
		$('.editWindow h2').text("Edit Camera");
		moduleContainer = $(this).attr('id');
		
		//checks to see if image has added hoverables class and checks appropriate radio button
		var radiobtn
		if($('#'+selectedModule).hasClass('hoverables')){
			radiobtn = document.getElementById("hoverEnabled");
			radiobtn.checked = true;
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
				$('#'+selectedModule).addClass('hoverables');
				$('#hoverTimeRow').show();
			}
			else{
				$('#'+selectedModule).removeClass('hoverables');
				$('#hoverTimeRow').hide();
			}
		});
		
		//proof of concept change later
		$( document ).off( "keyup", "input#hoverTime");
		$( document ).on( "keyup", "input#hoverTime" , function() {
			$('#'+selectedModule).children('img').attr('alt',$('input#hoverTime').val());
		});
		// delete event hanlder
		$( document ).off( "click", "#deleteModule"); //unbind old events, and bind a new one
		$( document ).on( "click", "#deleteModule" , function() {
			$("#"+selectedModule).removeClass("cropped");
			$("#"+selectedModule).resizable({disabled: false});
			var width = $("#"+selectedModule).children('img').width();
			var height = $("#"+selectedModule).children('img').height();
			$("#"+selectedModule).css('width', width);
			$("#"+selectedModule).css('height',height);
			$("#"+selectedModule).css("background-size","contain");
			$("#"+selectedModule).css("background-position","50% 50%");
			$("#"+selectedModule).hide();
			$('.editWindow').hide(150);
		});
		// delete event hanlder
		$( document ).off( "click", "#resizeModule"); //unbind old events, and bind a new one
		$( document ).on( "click", "#resizeModule" , function() {
			$("#"+selectedModule).removeClass("cropped");
			$("#"+selectedModule).resizable({disabled: false});
			var width = $("#"+selectedModule).children('img').width();
			var height = $("#"+selectedModule).children('img').height();
			$("#"+selectedModule).css('width', width);
			$("#"+selectedModule).css('height',height);
			$("#"+selectedModule).css("background-size","contain");
			$("#"+selectedModule).css("background-position","50% 50%");
		});
		$( document ).off( "click", "#cropModule"); //unbind old events, and bind a new one
		$( document ).on( "click", "#cropModule" , function() {	
			$('#cropModule').hide();
			$('#endCrop').show();
			var nativeWidth = $("#"+selectedModule).children('img').width();
			var nativeHeight = $("#"+selectedModule).children('img').height();
			$("#"+selectedModule).hide();
			var cropWidth, cropHeight, cropLeft, cropTop;
			var thismodule = $("#"+selectedModule);
			var width = $("#"+selectedModule).css('width');
			var height = $("#"+selectedModule).css('height');
			var left = $("#"+selectedModule).css('left');
			var top = $("#"+selectedModule).css('top');
			var src = $("#"+selectedModule).find('img').attr('src');
			var diffFromNatHeight = (height.slice(0,-2))/nativeHeight;
			var diffFromNatWidth = (width.slice(0,-2))/nativeWidth;
			$('#content').append('<div class="cropperWrapper"><img class="cropperWrapperImg" width="'+(width.slice(0,-2)*diffFromNatWidth)+' " height="'+(height.slice(0,-2)*diffFromNatHeight)+' "src="'+src+'"></div>');
			$('.cropperWrapper').css({ "position":"absolute","top": top, "left": left, "width": width, "height": height });
			$('.cropperwrapper > img').cropper({
				aspectRatio: width / height,
				autoCropArea: .8,
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
				$('#cropModule').show();
				$('#endCrop').hide();
				width = parseInt((width.slice(0,-2)));
				height = parseInt((height.slice(0,-2)));
				var changeWidth = ((((width-cropWidth)/width)));
				var changeHeight = (((height-cropHeight)/height));
				var changeLeft = ((((top-cropTop)/1))*100);
				var changeTop = (((left-cropLeft)/1)*100);
				$('.cropperWrapper').remove();
				if(cropTop == 0 || cropLeft == 0){
					$("#"+selectedModule).css("background-position", ""+(cropLeft*diffFromNatWidth)+"px "+(cropTop*diffFromNatHeight)+"px");
				}
				else{
					$("#"+selectedModule).css("background-position", "-"+(cropLeft*diffFromNatWidth)+"px -"+(cropTop*diffFromNatHeight)+"px");
				}
				$("#"+selectedModule).css("top",Math.abs(top)+Math.abs((cropTop*diffFromNatHeight)));
				$("#"+selectedModule).css("left",Math.abs(left)+Math.abs((cropLeft*diffFromNatWidth)));
				$("#"+selectedModule).css("width",cropWidth*diffFromNatWidth+"px");
				$("#"+selectedModule).css("height",cropHeight*diffFromNatHeight+"px");
				$("#"+selectedModule).css("background-size",width+"px "+height+"px ");
				$("#"+selectedModule).css("overflow","hidden");
				$("#"+selectedModule).show();
				$("#"+selectedModule).addClass("cropped");
				$(".cropped").resizable({disabled:true});
			});
		});
	}
	else if($(this).hasClass('textBlockContainer')){
		$('#zRow, #bodyRow, #fontSizeRow, #backgroundColorRow, #textColorRow, #opacityRow').show();
		$('.editWindow h2').text("Edit Text Block");
		id = $(this).attr('id');
		body = $(this).children('p');
		moduleContainer = $(this).attr('id');
		$(bodyChange).val(body.html());
		$(bgColor).val($('#'+id).css('background-color'));
		$(textColor).val($('#'+id).children('p').css('color'));
		var backgroundColor = $('#'+selectedModule).css('background-color');

		fontPlus.attr('onclick', "fontSizeChange('increase','"+ id +"')");
		fontMinus.attr('onclick', "fontSizeChange('decrease','"+ id +"')");					 
		fontSize.val($(this).css('font-size').slice(0, - 2));	//takes 'px' off end
		$(".textColorChange").off("mouseover.color");
		$(".textColorChange").on("mouseover.color", function(event, color){
			$('#'+selectedModule).children('p').css('color',color);
		});
		
		//fontsize input change event handler
		$( document ).off( "keyup", "input#fontSize") //unbind old events, and bind a new one
		$( document ).on( "keyup", "input#fontSize" , function() {	
			fontsize = $('#'+id).css('font-size');
			$('#'+id).css('font-size', fontSize.val());				
		});
		//background color input change event handler
		$( document ).off( "keyup", "input.backgroundColorChange") //unbind old events, and bind a new one
		$( document ).on( "keyup", "input.backgroundColorChange" , function() {	
			var enteredColor = bgColor.val();
			$('#'+id).css('background-color', enteredColor);	
			$('#opacitySlider .ui-slider-range').css('background', enteredColor );
  			$('#opacitySlider .ui-slider-handle').css('border-color', enteredColor);
		});
		//color input change event handler
		$( document ).off( "keyup", "input.textColorChange") //unbind old events, and bind a new one
		$( document ).on( "keyup", "input.textColorChange" , function() {	
			var enteredTextColor = textColor.val();
			$('#'+id).children('p').css('color', enteredTextColor);				
		});
		// delete event hanlder
		$( document ).off( "click", "#deleteModule"); //unbind old events, and bind a new one
		$( document ).on( "click", "#deleteModule" , function() {	
			$("#"+selectedModule).remove();
			$('.editWindow').hide(150);
		});
		$( document ).off( "keyup", "textarea.bodyChange"); //unbind old events, and bind a new one		
		$( document ).on( "keyup", "textarea.bodyChange" , function() {	
			var enteredText = bodyChange.val();
			//allows line breaks and consecutive spaces but also replaces "<" with the entity to remove possibility of script injection
			enteredText = enteredText.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "").replace(/\n/g,  "<br>");
			$(body).html(enteredText);
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
				if($('#'+selectedModule).css('background-color').indexOf("rgba") < 0){
					newColor = $('#'+selectedModule).css('background-color').replace(')', ', '+((ui.value)*.01)+')').replace('rgb', 'rgba');
				}
				else{
					var currentColor = $('#'+selectedModule).css('background-color');
					var splitColor = currentColor.split(',');
					newColor = splitColor[0] + "," + splitColor[1] + "," + splitColor[2] + "," + (Math.round(ui.value)*.01) + ')';
					$('#opacityPercent').text(' '+ui.value+'%');
				}
				$('#'+selectedModule).css('background-color', newColor);
				$('.backgroundColorChange').val(''+newColor);
				$('#opacitySlider .ui-slider-range').css('background', newColor );
  				$('#opacitySlider .ui-slider-handle').css('border-color', newColor);
			}
		});
	}
	else if($(this).hasClass('imgBlockContainer')){
		//show appropriate parts of edit window
		$('#zRow, #urlRow , #resizeModulem, #hoverRow').show();
		moduleContainer = $(this).attr('id');
		//change title of edit window 
		$('.editWindow h2').text("Edit Image");
		//find parts of the image and assign them to variables
		selectedModule = $(this).children().children('img').attr('id');
		url = $(this).find('img');
		//populate input fields with image specific information
		$(urlChange).val(url.attr('src'));
		
		var radiobtn
		if($('#'+moduleContainer).hasClass('hoverables')){
			radiobtn = document.getElementById("hoverEnabled");
			radiobtn.checked = true;
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
		
		//delegate event handler for url change
		$( document ).off( "paste", "input.urlChange"); //unbind old events, and bind a new one		
		$( document ).on( "paste", "input.urlChange" , function() {	
			var tempImg = document.createElement('img');
			$(tempImg).load(function() {
				var width = tempImg.naturalWidth;
				var height = tempImg.naturalHeight;
				url.attr('width',width);
				url.attr('height',height);
				$("#"+selectedModule).css('width', width);
				$("#"+selectedModule).css('height',height);
				$("#"+selectedModule).parent().css('width', width);
				$("#"+selectedModule).parent().css('height',height);
				url.attr('src', urlChange.val());
			});
			//wait split second for paste of new url
			setTimeout(function () {
				//reset image attributes
				url.attr('width','0');
				url.attr('height','0');
				tempImg.src = urlChange.val();
			}, 100); 
		});
		//unbind old events, and bind a new one
		$( document ).off( "click", "#deleteModule"); 
		$( document ).on( "click", "#deleteModule" , function() {
			$("#"+selectedModule).parent().parent().remove();
			$('.editWindow').hide(150);
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
		
	}
	else if($(this).hasClass('tr')){
		//show the appropriate parts of the edit window
		$('#zRow, #titleRow, #labelRow, #fontSizeRow,#backgroundColorRow, #textColorRow, #opacityRow').show();
		moduleContainer = $(this).attr('id');
		//change title of edit window
		$('.editWindow h2').text("Edit Cell");
		//find parts of the data cell and assign them to a variable
		title = $(this).children('.myTableTitle').children('p');
		label = $(this).children('.myTableValue').children('.label');
		value = $(this).children('.myTableValue');
		id = $(this).children('.myTableValue').attr('id');
		originalTitle = $(this).children('.myTableID').children('span').text();
		fontPlus.attr('onclick', "fontSizeChange('increase','"+ id +"')");
		fontMinus.attr('onclick', "fontSizeChange('decrease','"+ id +"')");					 
		fontSize.val(value.css('font-size').slice(0, - 2));	//takes 'px' off end
		var backgroundColor = $('#'+selectedModule).css('background-color');

		
		//populate input fields with cell specific information
		$('.backgroundColorChange').val($('#'+selectedModule).css('background-color'));
		$('.textColorChange').val($('#'+id).children('p').css('color'));
		
		//delegate even handler for mousing over 
		$(".textColorChange").off("mouseover.color");
		$(".textColorChange").on("mouseover.color", function(event, color){
			$('#'+id).children('p').css('color',color);
			$('#'+id).children('span').css('color',color);
			$('#'+id).parent().children('.myTableTitle').children('p').css('color',color);
			$('#opacitySlider .ui-slider-range').css('background', color );
  			$('#opacitySlider .ui-slider-handle').css('border-color', color);
		});	
		//fontsize input change event handler
		$( document ).off( "keyup", "input#fontSize") //unbind old events, and bind a new one
		$( document ).on( "keyup", "input#fontSize" , function() {	
			fontsize = $('#'+id).css('font-size');
			$('#'+id).css('font-size', fontSize.val());				
		});
		//title change event handler
		$( document ).off( "keyup", "input.titleChange"); //unbind old events, and bind a new one
		$( document ).on( "keyup", "input.titleChange" , function() {	
			title.text(titleChange.val());
			//gets makes background-color on title transparent if the title field is empty
			if(titleChange.val() == ""){
				title.parent().css('background-color','transparent');	
			}
			else{
				title.parent().css('background-color','rgba(0, 0, 0, 0.35)');	
			}
		});
		// label change event handler
		$( document ).off( "keyup", "input.labelChange"); //unbind old events, and bind a new one
		$( document ).on( "keyup", "input.labelChange" , function() {	
			label.text(htmlEntities(labelChange.val()));
		});
		// delete event handler
		$( document ).off( "click", "#deleteModule"); //unbind old events, and bind a new one
		$( document ).on( "click", "#deleteModule" , function() {	
			$("#"+selectedModule).remove();
			$('.editWindow').hide(150);
		});
		//background color input change event handler
		$( document ).off( "keyup", "input.backgroundColorChange") //unbind old events, and bind a new one
		$( document ).on( "keyup", "input.backgroundColorChange" , function() {	
			var enteredColor = bgColor.val();
			$('#'+selectedModule).css('background-color', enteredColor);
			$('#opacitySlider .ui-slider-range').css('background', enteredColor );
  			$('#opacitySlider .ui-slider-handle').css('border-color', enteredColor);
		});
		//color input change event handler
		$( document ).off( "keyup", "input.textColorChange") //unbind old events, and bind a new one
		$( document ).on( "keyup", "input.textColorChange" , function() {	
			var enteredTextColor = textColor.val();
			$('#'+id).children('p').css('color',enteredTextColor);
			$('#'+id).children('span').css('color',enteredTextColor);
			$('#'+id).parent().children('.myTableTitle').children('p').css('color',enteredTextColor);
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
				if($('#'+selectedModule).css('background-color').indexOf("rgba") < 0){
					newColor = $('#'+selectedModule).css('background-color').replace(')', ', '+((ui.value)*.01)+')').replace('rgb', 'rgba');
				}
				else{
					var currentColor = $('#'+selectedModule).css('background-color');
					var splitColor = currentColor.split(',');
					newColor = splitColor[0] + "," + splitColor[1] + "," + splitColor[2] + "," + (Math.round(ui.value)*.01) + ')';
					$('#opacityPercent').text(' '+ui.value+'%');
				}
				$('#'+selectedModule).css('background-color', newColor);
				$('.backgroundColorChange').val(''+newColor);
				$('#opacitySlider .ui-slider-range').css('background', newColor );
  				$('#opacitySlider .ui-slider-handle').css('border-color', newColor);
			}
		});
		//tool tip shows original title
		$(titleChange).attr('title','Original Title: '+originalTitle);
		$(titleChange).val(title.text());
		$(labelChange).val(label.text());
	}
	var zIndex = $('#'+moduleContainer).css('z-index'); 
	$('#zSlider').slider({
			min: 0,
			max: 100,
			value: zIndex,
			slide: function( event, ui ) {
				$('#'+moduleContainer).css('z-index', ui.value ); 
			}
		});
	if($("#"+selectedModule).hasClass('hide')){
		$('#hideModule').attr('onclick', "showModule('"+ selectedModule +"')");
		$('#hideModule').text('Unhide selected');
	}
	else{
		$('#hideModule').attr('onclick', "hideModule('"+ selectedModule +"')");
		$('#hideModule').text('Hide selected');
	}
};
function edit(handler) {
	editMode = true;
	$('#masterEdit').css('background-color','green');
	$('#masterEdit').attr('onclick', 'nonEdit()');
	$('.tr').css('cursor','pointer');
	$('.textBlockContainer').css('cursor','pointer');
	$('.hide').css('visibility','visible');
	$('.controls').show(200);
	//delegate events
	$('.top-container').delegate('.tr','click', editWindow);
	$('#content').delegate('.textBlockContainer','click', editWindow);	
	$('#content').delegate('.imgBlockContainer','click',editWindow);
	$('#content').delegate('.imgCamContainer','click',editWindow);
	$('.controls').delegate('#pageEdit','click',editWindow);
	
	//enable draggables and resizables
	$('.ui-icon').show();
	$(".jstree-leaf").draggable({
		helper: "clone"
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
	$('#masterEdit').attr('onclick', 'edit()');
	$('.tr').css('cursor','initial');
	$('.textBlockContainer').css('cursor','initial');
	$('.hide').css('visibility', 'hidden');
	$('.editWindow').hide(150);
	$('.controls').hide(200);
	//delegate events
	$('#content').undelegate('.textBlockContainer','click', editWindow);
	$('.top-container').undelegate('.tr','click', editWindow);
	$('#content').undelegate('.imgBlockContainer','click',editWindow);
	$('#content').undelegate('.imgCamContainer','click',editWindow);
	$('.controls').undelegate('#pageEdit','click',editWindow);

	//disable draggables and resizables
	$('.ui-icon').hide();
	$(".imgCamContainer").draggable( "option", "disabled", true ).resizable( "option", "disabled", true );
	$(".draggable").draggable( "option", "disabled", true ).resizable( "option", "disabled", true );
	$('.textBlockContainer').draggable( "option", "disabled", true ).resizable( "option", "disabled", true );
	$('.imgBlockContainer').draggable( "option", "disabled", true ).resizable( "option", "disabled", true );
}
function hideModule(id) {
	$("#"+id).addClass('hide');
	$("#"+id).css('opacity','.2');
	$('#hideModule').attr('onclick', "showModule('"+ id +"')");	
	$('#hideModule').text('unhide selected');
}
function showModule(id) {
	$("#"+id).css('opacity','1.0');
	$("#"+id).removeClass('hide');
	$('#hideModule').attr('onclick', "hideModule('"+ id +"')");
	$('#hideModule').text('hide selected');
}
//function that allows for the safe decoding of html entities	
function htmlEntities(str) {
   	var decoded = $('<div/>').html(str).text();
	return decoded
}

/*function that iterates through all instances of the ".tr, .imgBlockContainer, .textBlockContainer, .imgCamContainer" class selectors
and records all relevant data from the elements with these classes, create objects using the data as properties, and then loads the objects into
individual arrays for each type of selector class. once Each array has been created, a saved state array encompasses all of the data.*/
function captureState(){
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
		cameras.push(savedCam);	
		}
		else if($(this).hasClass("hide")){
			savedCam.top = $(this).css('top');
			savedCam.left = $(this).css('left');
			savedCam.width = $(this).css('width');
			savedCam.height = $(this).css('height');
			savedCam.divID = $(this).attr('id');
			savedCam.hidden = true;
			
		cameras.push(savedCam);		
		}
	});
	//load our object arrays into the saved state array
	saved_state = {"cells":cells, "text_Blocks":text_Blocks, "cameras":cameras, "img_Blocks":img_Blocks};
	populateSelection();
	var jsonString = JSON.stringify(saved_state);
	savedStates.push(jsonString);
		//for testing purposes
		//$('#json').val(jsonString);
	//config_send("http://cam.aprsworld.com:8888/.config");
	data_object.ValueSet(function(rsp){
		if (rsp.error) {
			alert('Failed to save configuration to server!');
		}
	},'webdisplay/configs',savedStates,0);
}
/* grabs the latest saved state and populates the select field for loading */
function populateSelection(){
	var option = document.createElement("option");
	if ($('#saveAs').val() !== '') {
        option.text = $('#saveAs').val();
    } else {
        option.text = "Layout#" + savedStates.length;
    }
    option.value = savedStates.length;
    $('#stateSelect').append(option);
}
function deleteState(){
	var index = $( "#stateSelect option:selected" ).attr("value"); 
	savedStates.splice(index, 1);
	$("select#stateSelect option[value='"+index+"']").remove();
}
/*A function that is passed a json string that holds elements and their properties from a saved state of a layout. Once it takes in the json string
it will iterate through the properties of the ".tr, .imgBlockContainer, .textBlockContainer, .imgCamContainer" elements and create them as they were in 
the saved state*/
function loadState(){
	var index = $( "#stateSelect option:selected" ).attr("value"); 
	var jsonString = savedStates[index];
	var stateObject = $.parseJSON(jsonString);
	id_arr.length = 0;
	path_arr.length = 0;
	$('.tr, .textBlockContainer, .imgBlockContainer').remove();
	$('.imgCamContainer').hide();
	//iterate over all keys in the saved state object
	for(var k in stateObject){
		if(k == 'cells'){
			for(var cells in stateObject[k]){
				//find the cell object
				var savedCell = stateObject[k][cells];
				//get attributes of cell object 
				var savedCellTop = savedCell.top; 
				var savedCellLeft = savedCell.left; 
				var savedCellWidth = savedCell.width; 
				var savedCellHeight = savedCell.height; 
				var savedCellTitle = savedCell.title; 
				var savedCellOriginalTitle = savedCell.originalTitle; 
				var savedCellLabel = savedCell.label; 
				var savedCellFontSize = savedCell.fontSize;
				var savedCellDivID = savedCell.divID; 
				var savedCellID = savedCell.id; 
				var savedCellPath = savedCell.path;
				var savedCellVisibility = savedCell.hidden;
				//append a cell with these properties to the top-container div
				$('.top-container').append('<div class="tr draggable" id="' + savedCellDivID + '"><div class="td dg-arrange-table-rows-drag-icon"></div><div class="td myTableID"> ID: <span>' + savedCellDivID + '</span> </div><div class="td myTableTitle"><input title="Original text: '+ savedCellOriginalTitle +'" class="titleEdit" type="text"></input><input title="Add a unit label -- Example: &deg;C" class="labelEdit" placeholder="Add a unit label" type="text"></input><p class="titleText">' + savedCellTitle + '</p></div><div class="td myTableValue" id="' + savedCellID + '"><p>Loading...</p><span class="path">'+ savedCellPath +'</span><span class="label">'+ savedCellLabel +'</span></div><div class="td dg-arrange-table-rows-close-icon"><span>Hide:</span><input autocomplete="off" class="checkBox" type="checkbox"></div></div>');
				$("#"+savedCellDivID).css('position','absolute');
				$("#"+savedCellDivID).css('top', savedCellTop);
				$("#"+savedCellDivID).css('left',savedCellLeft);
				$("#"+savedCellDivID).css('width',savedCellWidth);
				$("#"+savedCellDivID).css('height',savedCellHeight);
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
				id_arr.push(savedCellID);
				path_arr.push(savedCellPath);
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
				var src = $("#"+savedCamDivID).css('background-image');
				src = src.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
				$("#"+savedCamDivID).css('top',savedCamTop);
				$("#"+savedCamDivID).css('left',savedCamLeft);
				$("#"+savedCamDivID).css('width',savedCamWidth);
				$("#"+savedCamDivID).css('height',savedCamHeight);
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
				var savedImgId = savedImg.id; 
				var savedImgVisibility = savedImg.hidden;
				//append the image to the content div and set its properties
				$('#content').append('<div id='+savedImgId+'container class="imgBlockContainer"><div class="cam-drag-handle"></div><img onerror="brokenImg('+savedImgId+')" id='+savedImgId+' alt='+savedImgId+' src='+savedImgSrc+'></div>');
				$("#"+savedImgId).parent().css('top',savedImgTop);
				$("#"+savedImgId).parent().css('left',savedImgLeft);
				$("#"+savedImgId).css('width',savedImgWidth);
				$("#"+savedImgId).css('height',savedImgHeight);
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
				padding: '0',
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
				margin: '10px',
				padding: '20px',
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
				margin: '10px',
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
				margin: '10px',
				padding: '20px'
			},200);
			$('.controlRow').show();
			$('.controls h2').show();
		},
		disabled: false}).resizable({disabled: false, handles: 'all'});
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
				margin: '10px',
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
