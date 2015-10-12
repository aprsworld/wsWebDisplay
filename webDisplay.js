/********** Constants ************/
const HOST_DEFAULT = 'cam.aprsworld.com';
const TITLE_DEFAULT = 'wsWebDisplay';
/***** Global variables ********/
var editMode = false;
var time; //incremental variable that keeps track of time since last data update
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
				}
				//if not child properties, recurssively call function once more to find next level of objects/properties
				else{
					jsonItem ["id"] = id;
					jsonItem ["parent"] = parent;
					jsonItem ["text"] = property;
					jsonItem ["obj"] = {"path": stack + '.' + property};
					arr.push(jsonItem)
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
	var jsonString = JSON.stringify(arr);
    return jsonString;
}
/*this is an important function because it converts the dot notation string into an actual object reference and then returns that reference*/
function ref(obj, str) {
    str = str.split("."); //splits the dot notation
    for (var i = 1; i < str.length; i++) {
        obj = obj[str[i]];
    }
    return obj;
}

/*this function takes in the array of ids, the array of dot notation reference strings and our data object. it uses the length of the id array to find all values that need to be changed and then changes them dynamically*/
function dynamicUpdate($id_arr, $path_arr, data) {
    for ($i = 0; $i < $id_arr.length; $i++) {
		var value = ref(data, $path_arr[$i]); //finds value of object
        $('div#' + $id_arr[$i] + '').children('p').text(value);
    }
}
function getStations(data){
	var stations = [];
	var stationData =[];
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
		$('#preload').append('<img id="preload_div_ws_'+cam_arr[i][2]+'image_url_x" >');
	}	
}
function createCamFromTree(tree_id){
	var selection = tree_id;
	console.log('create ' + tree_id);
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
		$('#div_'+selection).children('img').attr('src',src);
		console.log($('#div_'+selection).children('img').width());
		$("#div_"+selection).css('display','inline');
		$('.imgCamContainer').resizable( "option", "aspectRatio", true );

	});
	preloadCam(selection);
}
	
//function that refreshes cams and preloads the refreshed image before displaying it	
function refreshCams(cam_arr){
	//iterates through known cams
	for(var i =0; i<cam_arr.length; i++){
		//only finds cams that are visible
		if($('#div_ws_'+cam_arr[i][2]+'image_url_x').is(":visible")){
			//the camera image is not displayed until the image is done loading
			$('#preload_div_ws_'+cam_arr[i][2]+'image_url_x').load(function() {
				var src = $(this).attr('src');
				var cam = $(this).attr('id').replace("preload_","");
				$("#"+cam).css('background-image','url('+src+')');
				
			});
			//src is set after the .load() function
			$('#preload_div_ws_'+cam_arr[i][2]+'image_url_x').attr('src',cam_arr[i][1]);		

		}
	}
}	
function preloadCam(selection){
	var url = $('#'+selection).css('background-image').replace(/^url\(["']?/, '').replace(/["']?\)$/, ''); //gets url from background-image prop
	$('#preload_div_'+selection).attr('src', url);

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
	camTime = camTime+1;
	time = time+1;
	$('#timer').text("Last data received " + time + " seconds ago ");
	//$('#camTimer').text("Camera image from approximately " + camTime + " seconds ago");
	if(time > 30){
		$('#timer').text("30+ seconds since last data received. Try refreshing your browser window.");
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
		var cellCount = 0;
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
				$('.top-container').css('background-color',bgColor);
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
					console.log("IDs " + id_arr);
					console.log("paths " + path_arr);
					var pageX = event.pageX;
					var pageY = event.pageY;
					//check if id contains image_url - if it does, then we create a camera feed, if it does not we create a data cell
					if(id.indexOf("image_url") >= 0){
						createCamFromTree(id);
						$('#div_'+id).css('position', 'absolute');
						$('#div_'+id).css('top',pageY);
						$('#div_'+id).css('left',pageX);
					cellCount++;
					}
					else{
						$('.top-container').append('<div class="tr draggable" id="' + cellCount + '"><div class="td dg-arrange-table-rows-drag-icon"></div><div class="td myTableID"> ID: <span>' + title + '</span> </div><div class="td myTableTitle"><input title="Original text: '+ title +'" class="titleEdit" type="text"></input><input title="Add a unit label -- Example: &deg;C" class="labelEdit" placeholder="Add a unit label" type="text"></input><p class="titleText">' + title + '</p></div><div class="td myTableValue" id="' + id_arr[cellCount] + '"><p>Loading...</p><span class="path">'+ path +'</span><span class="label"> '+ units +'</span></div><div class="td dg-arrange-table-rows-close-icon"><span>Hide:</span><input autocomplete="off" class="checkBox" type="checkbox"></div></div>');
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
        });
		var layout = getUrlVars()["layout"];
		if(layout != undefined){
			$("#stateSelect").val(layout);
			loadState();
                       $(".imgCamContainer").draggable( "option", "disabled", true ).resizable( "option", "disabled", true );
                       $(".draggable").draggable( "option", "disabled", true ).resizable( "option", "disabled", true );
                       $('#ws_status').draggable( "option", "disabled", true ).resizable( "option", "disabled", true );
                       $('.textBlockContainer').draggable( "option", "disabled", true ).resizable( "option", "disabled", true );
                       $('.imgBlockContainer').draggable( "option", "disabled", true ).resizable( "option", "disabled", true );
		}
	}
	$(document).ready(function() {
		$( document ).off( "click", "#refreshTree" );
		$( document ).on( "click", "#refreshTree" , function() {	
				refreshTree(data);
		});	
		if(editMode == false){
			refreshTree(data);	
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
	console.log(host);
    data_object = new BroadcastClient({
        callback_update: data_update,
        callback_error: data_error,
        // XXX: These are temporary
        //url_ajax: 'http://'+host+':8888/.data',
		//url: 'http://'+host+':8888/.data',
        //url_ws: 'ws://'+host+':8888/.data'
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
//function that expands inputs for creating images	
function createImage(){
//unhide inputs
	$('#createTextTitle').hide();
	$('#createTextBody').hide();
	$('#createImageURL').show();
	$('#createImageURL').val('');
	$('#createImg').text('Submit URL');
	$('#createText').text('Create Text');
//change function of button
    $('#createText').attr('onclick', 'createText()');
    $('#createImg').attr('onclick', 'submitURL()');
}
function submitURL(){
	var imgURL, index;
	index = imgBlocks.length;
	imgBlocks.push("img"+index);
	imgURL = $('#createImageURL').val();
	if(imgURL != ""){
		$('#content').append('<div class="imgBlockContainer"><div class="cam-drag-handle"></div><img onerror="brokenImg(img'+index+')" id=img'+index+' alt=img'+index+' src='+imgURL+'></img></div>');
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
}
function refreshTree(newData){
	var lastk = "#";
	var jsonArray = [];
	var json = iterateStations(newData, "", jsonArray, lastk);
	$('#stationTree').jstree(true).settings.core.data = jsonArray;
	$('#stationTree').jstree(true).refresh();
}
/* function that removes an image if it returns a 404 error.*/
function brokenImg(id){
	alert('invalid URL');
	$(id).closest('.imgBlockContainer').remove();
}
var editWindow =  function() {
	var selectedModule, body, title, label, url, titleChange, labelChange, textColor, bgColor, urlChange, id, value, submitButton, fontPlus, fontMinus, bodyChange, fontSize, originalTitle;
	titleChange = $('.titleChange');
	labelChange = $('.labelChange');
	bodyChange = $('.bodyChange');
	urlChange = $('.urlChange');
	fontSize = $('#fontSize');
	fontPlus = $('#fontSizePlus');
	fontMinus = $('#fontSizeMinus');
	bgColor = $('.backgroundColorChange');
	textColor= $('.textColorChange');
	
	$('#titleRow, #labelRow, #urlRow, #bodyRow, #fontSizeRow, #backgroundColorRow, #textColorRow, #resizeModule, #cropModule, #endCrop').hide();
	$('.editWindow').show(150).draggable({});
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
	});
	$('#hideModule,#deleteModule').show();
	if($(this).attr('id') == 'pageEdit'){
		$('.editWindow h2').text("Edit Page");
		$('#titleRow,#backgroundColorRow').show();
		$('#hideModule,#deleteModule').hide();
		$('.titleChange').val(document.title);
		$('.backgroundColorChange').val($('.top-container').css('background-color'));
		
		//delegate event handler for color picker
		$(".backgroundColorChange").off("mouseover.color");
		$(".backgroundColorChange").on("mouseover.color", function(event, color){
			$('.top-container').css('background-color', color);
		});
		//background color input change event handler
		$( document ).off( "keyup", "input.backgroundColorChange") //unbind old events, and bind a new one
		$( document ).on( "keyup", "input.backgroundColorChange" , function() {	
			var enteredColor = bgColor.val();
			$('.top-container').css('background-color', enteredColor);				
		});
		//delegate title change event handler
		$( document ).off( "keyup", "input.titleChange"); //unbind old events, and bind a new one
		$( document ).on( "keyup", "input.titleChange" , function() {	
			var newTitle = titleChange.val();
			document.title = newTitle;
		});
	}
	else if($(this).hasClass('imgCamContainer')){
		$('#cropModule').show();
		$('#resizeModule').show();
		$('.editWindow h2').text("Edit Camera");
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
			console.log(nativeWidth+" x "+nativeHeight);
			var width = $("#"+selectedModule).css('width');
			var height = $("#"+selectedModule).css('height');
			var left = $("#"+selectedModule).css('left');
			var top = $("#"+selectedModule).css('top');
			var src = $("#"+selectedModule).find('img').attr('src');
			var diffFromNatHeight = (height.slice(0,-2))/nativeHeight;
			var diffFromNatWidth = (width.slice(0,-2))/nativeWidth;
			console.log(diffFromNatWidth+" x "+diffFromNatHeight);
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
				console.log(cropTop+" X "+cropLeft);
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
				console.log($("#"+selectedModule).css("background-position"));
				console.log("background-size "+$("#"+selectedModule).css("background-size"));
				$("#"+selectedModule).css("overflow","hidden");
				$("#"+selectedModule).show();
				$("#"+selectedModule).addClass("cropped");
				$(".cropped").resizable({disabled:true});
			});
		});
	}
	else if($(this).hasClass('textBlockContainer')){
		$('#bodyRow, #fontSizeRow, #backgroundColorRow, #textColorRow').show();
		$('.editWindow h2').text("Edit Text Block");
		id = $(this).attr('id');
		body = $(this).children('p');
		$(bodyChange).val(body.html());
		$(bgColor).val($('#'+id).css('background-color'));
		$(textColor).val($('#'+id).children('p').css('color'));
		
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
	}
	else if($(this).hasClass('imgBlockContainer')){
		//show appropriate parts of edit window
		$('#urlRow').show();
		//change title of edit window 
		$('.editWindow h2').text("Edit Image");
		//find parts of the image and assign them to variables
		selectedModule = $(this).children().children('img').attr('id');
		url = $(this).find('img');
		//populate input fields with image specific information
		$(urlChange).val(url.attr('src'));
		
		//delegate event handler for url change
		$( document ).off( "paste", "input.urlChange"); //unbind old events, and bind a new one		
		$( document ).on( "paste", "input.urlChange" , function() {	
			console.log('fired');
			var element = this;
 			setTimeout(function () {
				url.attr('src', urlChange.val());
			}, 100);	 
		});
		//unbind old events, and bind a new one
		$( document ).off( "click", "#deleteModule"); 
		$( document ).on( "click", "#deleteModule" , function() {
			$("#"+selectedModule).parent().parent().remove();
			$('.editWindow').hide(150);
		});
		
	}
	else if($(this).hasClass('tr')){
		//show the appropriate parts of the edit window
		$('#titleRow, #labelRow, #fontSizeRow,#backgroundColorRow, #textColorRow').show();
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
		//populate input fields with cell specific information
		$('.backgroundColorChange').val($('#'+selectedModule).css('background-color'));
		$('.textColorChange').val($('#'+id).children('p').css('color'));
		
		//delegate even handler for mousing over 
		$(".textColorChange").off("mouseover.color");
		$(".textColorChange").on("mouseover.color", function(event, color){
			$('#'+id).children('p').css('color',color);
			$('#'+id).children('span').css('color',color);
			$('#'+id).parent().children('.myTableTitle').children('p').css('color',color);
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
		});
		//color input change event handler
		$( document ).off( "keyup", "input.textColorChange") //unbind old events, and bind a new one
		$( document ).on( "keyup", "input.textColorChange" , function() {	
			var enteredTextColor = textColor.val();
			$('#'+id).children('p').css('color',enteredTextColor);
			$('#'+id).children('span').css('color',enteredTextColor);
			$('#'+id).parent().children('.myTableTitle').children('p').css('color',enteredTextColor);
		});
		//tool tip shows original title
		$(titleChange).attr('title','Original Title: '+originalTitle);
		$(titleChange).val(title.text());
		$(labelChange).val(label.text());
	}
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
	console.log(id);
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
	console.log(savedStates);
}
/*A function that is passed a json string that holds elements and their properties from a saved state of a layout. Once it takes in the json string
it will iterate through the properties of the ".tr, .imgBlockContainer, .textBlockContainer, .imgCamContainer" elements and create them as they were in 
the saved state*/
function loadState(){
	var index = $( "#stateSelect option:selected" ).attr("value"); 
	var jsonString = savedStates[index];
	var stateObject = $.parseJSON(jsonString);
	console.log(index);
	console.log(jsonString);
	console.log(stateObject);
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
					console.log('false');
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
					console.log('false');
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
				$("#"+savedCamDivID).css('top',savedCamTop);
				$("#"+savedCamDivID).css('left',savedCamLeft);
				$("#"+savedCamDivID).css('width',savedCamWidth);
				$("#"+savedCamDivID).css('height',savedCamHeight);
				if(savedCamVisibility == true){
					$("#"+savedCamDivID).addClass('hide');
					$("#"+savedCamDivID).css('opacity','0.2');

				}
				else{
					console.log('false');
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
				$('#content').append('<div class="imgBlockContainer"><div class="cam-drag-handle"></div><img onerror="brokenImg('+savedImgId+')" id='+savedImgId+' alt='+savedImgId+' src='+savedImgSrc+'></img></div>');
				$("#"+savedImgId).parent().css('top',savedImgTop);
				$("#"+savedImgId).parent().css('left',savedImgLeft);
				$("#"+savedImgId).css('width',savedImgWidth);
				$("#"+savedImgId).css('height',savedImgHeight);
				if(savedImgVisibility == true){
					$("#"+savedImgId).addClass('hide');
					$("#"+savedImgId).css('opacity','0.2');

				}
				else{
					console.log('false');
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
