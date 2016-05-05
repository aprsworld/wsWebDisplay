/***********************************************************************************
* Function that extends parent object prototype to a child object
************************************************************************************/
function extend(ChildClass, ParentClass) {
	ChildClass.prototype = new ParentClass();
	ChildClass.prototype.constructor = ChildClass;
}

/***********************************************************************************
* GENERAL OBJECT
************************************************************************************/
var pageElement = function(){
	this.elementType = 'generalElement';
	this.count;
}

pageElement.prototype = {
	hidden: false,
	gridProps: {
		"grid":[1,1],
		"snap":"true",
		"snapTolerance":.4	
	},
	setStyle: function(styleList) {
		this.style = styleList;
		console.log(this.style);
	},
	getStyle: function() {
		var style =  $('#'+this.parentId).attr('style');
		return style;
	},
	//sets type of element to be a data cell, image block, textblock, camera, etc.
	setType: function(elementType) {
		this.elementType = elementType;	
	},
	//gets the type
	getType: function(){
		return this.elementType;
	},
	onChangeStyle: function(){
		var style = this.getStyle();
		this.setStyle(style);
	},
	deleteElement: function(){
		var elementPos = cell_arr.map(function(x) {return x.id; }).indexOf(this.id);
		if (elementPos > -1) {
			$('#'+this.parentId).remove();
			$('.timerBlock').remove();

			cell_arr.splice(elementPos, 1);	
			console.log(cell_arr);
		}	
	},
	setZindex: function(zIndex){
		$('#'+this.parentId).css('z-index', zIndex ); 
		var style = this.getStyle();
		this.setStyle(style);
	},
	setHidden: function(id) {
		if(this.hidden == true){
			this.hidden = false;
			$("#"+id).css('opacity','1.0');
			$("#"+id).removeClass('hide');
			$('#hideModule').html('<i class="fa fa-eye-slash fa-2x"></i> Hide Selected');
		}
		else{
			this.hidden = true;
			$("#"+id).addClass('hide');
			$("#"+id).css('opacity','.2');
			$('#hideModule').html('<i class="fa fa-eye fa-2x"></i> Unhide Selected');	
		}
	},
	setSelected: function() {
		var objectFound = this;
		for(var k in cell_arr){
			cell_arr[k].setDeselected();	
		}
		
		this.selected = true;
		if(this.type != 'pageSettings'){
			$( 'html' ).off('keyup');
			$( 'html').on('keyup', delHandle(objectFound));
		}
	},
	setDeselected: function() {
		var objectFound = this;
		this.selected = false;
	},
	setDrag: function() {
		console.log(this.parentId);
		var thisObj = this;
		var startTop;
		var startLeft;
		var distanceTop;
		var distanceLeft;
		var currentL, currentT;
		var posDiv
		$('#'+this.parentId).draggable({
			cursor: "move", disabled: false, delay: 50,
			start: function(event, ui){
				$('#'+thisObj.parentId).off('mouseup');
				var title = thisObj.toolTip;
				$(this).removeAttr("title");
				$('.timerBlock').css('display','none');
				$('#'+thisObj.parentId).on('mouseup', function(e) {
					console.log(title);
					$('#'+thisObj.parentId).attr('title',title);
					$('.timerBlock').css('display','inline-block');

				});
				//collapses windows when dragging
				if(isExpanded){
					collapseWindows();
				}
				console.log(ui)
				var posLeft = ui.position.left;
				var posTop = ui.position.top;
				console.log('start: '+posTop);
				var posSpan = document.createElement("SPAN"); 
				posDiv = document.createElement("DIV");
				posDiv.id = 'positionDiv';
				$('body').append(posDiv);
				posSpan.textContent = " ("+posLeft+", "+posTop+")";
				posSpan.id = 'positionSpan';
				$('#positionDiv').append('<i class="fa fa-long-arrow-down fa-rotate-320"></i>');
				$('#positionDiv').append(posSpan);
				$('#rulerBox, #rulerBox2, #rulerBox3').show();
				
				var fullId;

				if(tempArray.length > 1){
					for(var i = 0; i< tempArray.length; i++){
						fullId = tempArray[i].parentId;
						if(thisObj.parentId != fullId){
							console.log(topOffSet);
							$('#'+fullId).css({
								top: $('#'+fullId).offset().top+topOffSet,
								left:  $('#'+fullId).offset().left+leftOffSet
							});
							$('#'+fullId).css('top');
						}	
					}
				}
			},
			drag: function(event, ui){
				
				var posTop = (Math.floor((ui.position.top-topOffSet) / thisObj.gridProps.size) * thisObj.gridProps.size);
				var posLeft = (Math.floor((ui.position.left-leftOffSet) / thisObj.gridProps.size) * thisObj.gridProps.size);
				ui.position.top = posTop;
				ui.position.left = posLeft;
				startTop = $(this).offset().top;
				startLeft = $(this).offset().left;
				distanceTop = posTop-startTop;
				distanceLeft = posLeft-startLeft;
				var fullId;
				
				if(tempArray.length > 1){
					for(var i = 0; i< tempArray.length; i++){
						fullId = tempArray[i].parentId;
						if(thisObj.parentId != fullId){
							console.log(topOffSet);
							$('#'+fullId).css({
								top: $('#'+fullId).offset().top+distanceTop,
								left:  $('#'+fullId).offset().left+distanceLeft
							});
							$('#'+fullId).css('top');
						}	
					}
				}
				$('#positionSpan').text("("+posLeft+", "+posTop+")");
				var width = posLeft+'px';	
				var height = posTop+'px';
				$('#positionDiv').css({
					'top': posTop-18,
					'left': posLeft-10
				});
				$(this).css({
					'top': posTop,
					'left': posLeft
				});
				
				$('#rulerBox').css({
					height: height,
					width: width
				});
				$('#rulerBox2').css({
					left: width,
					height: height,
					width: "100%"
					
				});
				$('#rulerBox3').css({
					top: height,
					width: width,
					height: "100%"
				});

			},
			stop: function(event, ui){
				//uncollapses windows when done dragging
				if(!isExpanded){
					collapseWindows();
				}
				console.log($('#positionDiv').children().text());
				$('#positionDiv').remove();
				console.log(thisObj.gridProps.grid);
				var roundedTop = (Math.floor(ui.position.top / thisObj.gridProps.size) * thisObj.gridProps.size);
				var roundedLeft = (Math.floor(ui.position.left / thisObj.gridProps.size) * thisObj.gridProps.size);
				console.log(roundedLeft, roundedTop);
				$(this).css({
					'top': roundedTop,
					'left': roundedLeft
				});
				thisObj.top = roundedTop;
				thisObj.left = roundedLeft;
				thisObj.onChangeStyle();
				$('#rulerBox, #rulerBox2, #rulerBox3').hide();
				
			}
		});
	},
	setResize: function() {
		var handleTarget;
		var thisObj = this;		
		$('#'+thisObj.parentId).resizable({
			grid: [1,1], handles: 'all', aspectRatio: true, disabled: false,
			start: function(event, ui){
				$('#'+thisObj.parentId).off('mouseup');
				var title = thisObj.toolTip;
				$(this).removeAttr("title");			
				$('#'+thisObj.parentId).on('mouseup', function(e) {
					$('#'+thisObj.parentId).attr('title',title);	
				});
				var width = $('#'+thisObj.parentId).css('width');
				var height = $('#'+thisObj.parentId).css('height');
				var posSpan = document.createElement("SPAN"); 
				posSpan.id = 'resizeSpan';
				posSpan.textContent = "Width: "+width+"  Height: "+height+")";
				$('#resizeSpan').css({
					top: event.clientY+5,
					left: event.clientX+5
				});
				$('body').append(posSpan);
				handleTarget = $(event.originalEvent.target);
			},
			resize: function(event, ui){
				var width = $('#'+thisObj.parentId).css('width');
				var height = $('#'+thisObj.parentId).css('height');
				var top = $('#positionDiv').css('top');
				var left = $('#positionDiv').css('left');
				$('#resizeSpan').css({
					top: event.clientY+5,
					left: event.clientX+5
				}); 
				$('#resizeSpan').text("Width: "+width+"  Height: "+height+"");
			},
			stop: function(event, ui){
				$('#resizeSpan').remove();
				thisObj.changedWidth = $('#'+thisObj.parentId).css('width');
				thisObj.changedHeight = $('#'+thisObj.parentId).css('height');
				thisObj.heightToSave = $('#'+thisObj.parentId).height();
				thisObj.widthToSave = $('#'+thisObj.parentId).width();
				thisObj.onChangeStyle();

			}
		});
	},
	removeSelf: function(){
		var obj = this;
		var objId = obj.parentId;
		var id = obj.id;
		var elementPos = cell_arr.map(function(x) {return x.id; }).indexOf(id);
		var objectFound = cell_arr[elementPos];
		console.log(elementPos);
		console.log(cell_arr.length);
		cell_arr.splice(elementPos, 1);
		console.log(cell_arr.length);
		$('.timerBlock').remove();

		$('#'+objId).remove();
		console.log(cell_arr);
	},
	getTop: function(){
		if(typeof this.top !== 'undefined'){
			return this.top;
		}
		return $("#"+this.parentId).css('top');
	},
	getLeft: function(){
		if(typeof this.left !== 'undefined'){
			return this.left;
		}
		return $("#"+this.parentId).css('left');
	},
	getWidth: function(){
		return $("#"+this.parentId).width();
	},
	getHeight: function(){
		return $("#"+this.parentId).height();
	},
	applyWidthHeight: function(){
		var width = $("#manualWidth").val();
		var height = $("#manualHeight").val();
		console.log(width+" "+height);
		console.log(this);
		$("#"+this.parentId).css("height",height+"px");
		$("#"+this.parentId).css("width",width+"px");

		//this.onChangeStyle();
	},
	applyWidth: function(){
		var width = $("#manualWidth").val();
		$("#"+this.parentId).css("width",width+"px");
		this.widthToSave = $('#'+this.parentId).width();
		this.heightToSave = $('#'+this.parentId).height();
	},
	applyHeight: function(){
		var height = $("#manualHeight").val();
		$("#"+this.parentId).css("height",height+"px");
		this.widthToSave = $('#'+this.parentId).width();
		this.heightToSave = $('#'+this.parentId).height();
	},
	setWidthField: function(){
		var obj = this;
		var width = this.getWidth();
		$("#manualWidth").val(width);
	},
	setHeightField: function(){
		var obj = this;
		var height = this.getHeight();
		$("#manualHeight").val(height);

	},
	setWidthHeightFields: function(){
		var obj = this;
		var width = this.getWidth();
		var height = this.getHeight();
		$("#manualWidth").val(width);
		$("#manualHeight").val(height);
	},
	timerAppend: function() {
		//set variables in this scope so that they work in the hover handler and the callback
		//var appendedDiv = document.createElement('span'),
		var objectFound = this,
			timeSinceData,
			parentWidth,
			parentTop,
			divWidth,
			parentLeft;
		
		$( "#"+this.parentId ).hover(function(e){
			console.log(e);
			//set interval to change text content every second
			objectFound.timeInterval = setInterval( function(){
				//human readable time
				timeSinceData = parseInt(round((Date.now()-objectFound.lastData)/1000, 0),10);
				if(!isNaN(timeSinceData) && objectFound.lastData !== null && typeof timeSinceData === 'number'){
					console.log('tick');
					timeSinceData = secToTime(timeSinceData);
					$('#dataAge').css({
						"display" : "block",
						"top": objectFound.top-10,
						"left": objectFound.left+objectFound.widthToSave+10
					});
					console.log(e);
					$('#dataAge').text('This Element: '+timeSinceData+' old');

					/*if(objectFound.lastData == oldestElement.time){
						console.log('oldest');
						appendedDiv.textContent = 'Last data received: '+timeSinceData+' \n Oldest Data on Page';
						$('#dataAge').text('Last data received: '+timeSinceData);

					}
					if(objectFound.lastData == newestElement.time){
						console.log('newest');
						appendedDiv.textContent = 'Last data received: '+timeSinceData+' \n Newest Data on Page';
					}
					if(objectFound.lastData == newestElement.time && objectFound.lastData == oldestElement.time){
						appendedDiv.textContent = 'Last data received: '+timeSinceData;
					}
					if(objectFound.lastData != newestElement.time && objectFound.lastData != oldestElement.time){
						//appendedDiv.textContent = 'Last data received: '+timeSinceData+' Newest Data on Page is '+newestElement.item+' Oldest Data on page '+oldestElement.item;
					}*/
				}
			}, 1000 );
		}, function () {
			console.log('unhover');
			$('#dataAge').css('display','none');
			$('#dataAge').text('');
			//when user "un-hovers," clear interval and remove text
			clearInterval(objectFound.timeInterval);
			//appendedDiv.remove();
		});	
	}
}
/***********************************************************************************
* PAGE SETTINGS OBJECT
************************************************************************************/
var pageSettings = function() {
	this.setType('pageSettings');
	this.backgroundColor = '#333';
	this.title;
	this.id = 'pageSettings';
	this.gridSize = true;
	this.layoutList;
	this.currentLayoutIndex;
	this.cycleInterval = 1000;
	this.pageTable = new Array();
	this.updateTable = [];
}
extend(pageSettings, pageElement);

/*
*	Functions for hash table that keeps track of what elements are on the page
*/
pageSettings.prototype.addToTable = function(path, value){
	if(typeof this.pageTable !== 'undefined' && !this.tableHasItem(path)){
		this.pageTable[path] = value;
	}
	console.log(this.pageTable);
}

//checks if the hash table contains the element we are looking for
pageSettings.prototype.tableHasItem = function(key){
	if(typeof this.pageTable === 'undefined'){
		return false;
	}
	return this.pageTable.hasOwnProperty(key);
}


pageSettings.prototype.isTableItemCurrent = function(key, newValue){
	if(this.pageTable[key] != newValue){
		this.pageTable[key] = newValue;
		return false;	
	}
	else{
		return true;	
	}
}

pageSettings.prototype.removeTableEntry = function(key){
	delete this.pageTable[key];	
}

/*
*	End of functions for hashtable
*/

pageSettings.prototype.backgroundColorChange = function(color){
	this.backgroundColor = color;
	$('html').css('background-color', color);
	$('.backgroundColorChange').val(''+color);
	$('#opacitySlider .ui-slider-range').css('background', color );
  	$('#opacitySlider .ui-slider-handle').css('border-color', color);
}

pageSettings.prototype.setPageTitle = function(title){
	this.title = title;
	document.title = title;
}

pageSettings.prototype.cyclePlay = function() {
	var obj = this;
	clearInterval(obj.cycleTimeout);
	$('#cycleMessage').remove();
	obj.cycleTimeout = setInterval(function(){ 
		obj.nextItem();
	}, obj.cycleInterval);
	var message = "Auto Play Started With An Interval Of "+obj.cycleInterval/1000+" Seconds"; 
	createMessage(message, 2000);
}
pageSettings.prototype.changeInterval = function(){
	var obj = this;
	var value = $('#cycleIntervalInput').val();
	if(typeof value !== undefined && value !== ''){
		value = parseInt(value, 10);
		clearInterval(obj.cycleTimeout);
		obj.cycleInterval = value*1000;
		obj.cycleTimeout = setInterval(function(){ 
			obj.nextItem();
		}, obj.cycleInterval);
		var message = "Changed Auto Play Interval To "+value+" seconds";
		createMessage(message, 2000);
	}
	else if(value <= 2){
		var message = "Please Enter a Value Greater Than 2 Into The Input Field";
		createMessage(message, 2000);
	}
	
}
pageSettings.prototype.cyclePause = function() {
	var obj = this;
	console.log(obj);
	$('#cycleMessage').remove();
	clearInterval(obj.cycleTimeout);
	var message = "Auto Play Stopped";
	createMessage(message, 2000);

}
pageSettings.prototype.resetInterval = function() {
	var obj = this;
	clearInterval(obj.cycleTimeout);
	obj.cycleTimeout = setInterval(function(){ 
		obj.nextItem();
	}, obj.cycleInterval);
	
}
pageSettings.prototype.nextItem = function() {
	$('.imgCamContainer').remove();
	var arr = this.layoutList;
	$('#cycleMessage').remove();
	$('.itemBlock').remove();
	if(typeof this.currentLayoutIndex !== 'undefined'){
		var message = "Next Configuration...";
		createMessage(message, 2000);
		this.currentLayoutIndex++;
		if(this.currentLayoutIndex >= arr.length){
			this.currentLayoutIndex = 0;	
		}
		var layout = arr[this.currentLayoutIndex]
		var arrlength = cell_arr.length;
		for(var i = 0; i< arrlength; i++){
			console.log(cell_arr[i]);		
			$('#'+cell_arr[i].parentId).remove();
		}
		cell_arr.length = 0;
		loadState(layout);
		//this.resetInterval();
	}
}

pageSettings.prototype.prevItem = function() {
	$('.imgCamContainer').remove();
	var arr = this.layoutList;
	$('#cycleMessage').remove();
	$('.itemBlock').remove();
	if(typeof this.currentLayoutIndex !== 'undefined'){
		var message = "Previous Configuration..."; 
		createMessage(message, 2000);
		this.currentLayoutIndex--;
		if(this.currentLayoutIndex < 0){
			this.currentLayoutIndex = arr.length-1;
		}

		var layout = arr[this.currentLayoutIndex]
		var arrlength = cell_arr.length;
		for(var i = 0; i< arrlength; i++){
			console.log(cell_arr[i]);		
			$('#'+cell_arr[i].parentId).remove();
		}
		cell_arr.length = 0;
		//this.resetInterval();
		loadState(layout);
	}
}

pageSettings.prototype.updateElementDimensions = function(obj){
	console.log(this);
	var length = this.elementDimensions.length;
	var oldObj;
	if(length == 0){
		this.elementDimensions.push(obj);
	}
	else if(this.elementDimensions.length <= 1){
		oldObj = this.elementDimensions[length-1];
		if(obj.containerId != oldObj.containerId){
			this.elementDimensions.push(obj);
		}
	}
	else{
		oldObj = this.elementDimensions[length-1];
		if(obj.containerId != oldObj.containerId){
			this.elementDimensions.shift();
			this.elementDimensions.push(obj);
			
		}
	}
	console.log(this.elementDimensions);
}
pageSettings.prototype.previousElementDimensions = function(){
	var dims = this.elementDimensions[0];
	console.log(dims);
	$("#manualWidth").val(dims.getWidth());
	$("#manualHeight").val(dims.getHeight());
}
pageSettings.prototype.previousElementWidth = function(){
	var dims = this.elementDimensions[0];
	console.log(dims);
	$("#manualWidth").val(dims.getWidth());	
}
pageSettings.prototype.previousElementHeight = function(){
	var dims = this.elementDimensions[0];
	console.log(dims);
	$("#manualHeight").val(dims.getHeight());	
}
pageSettings.prototype.createGrid = function createGrid(size) {
		$('.gridlines').remove();

    var i,
    sel = $('.top-container'),
        height = sel.height(),
        width = sel.width(),
        ratioW = Math.floor(width / size),
        ratioH = Math.floor(height / size);
			console.log(width+" "+height);

    for (i = 0; i <= ratioW; i++) { // vertical grid lines
      $('<div />').css({
            'top': 0,
            'left': i * size,
            'width': '0px',
		  	'border-left': '1px solid #444',
            'height': height

      })
        .addClass('gridlines')
        .appendTo(sel);
    }

    for (i = 0; i <= ratioH; i++) { // horizontal grid lines
      $('<div />').css({
            'top': i * size,
            'left': 0,
            'width': width,
		  	'border-bottom': '1px solid #444',
            'height': '0px'

		  
      })
        .addClass('gridlines')
        .appendTo(sel);
    }
	var snapTolerance = size*.6;
	pageElement.prototype.gridProps = {
		"grid":[size/2, size/2],
		"snap":".gridlines",
		"snapTolerance":snapTolerance,	
		"size":size
	}
	
	this.gridSize = size;

}

pageSettings.prototype.updateGrid = function updateGrid(size) {
	$('.gridlines').remove();
	this.createGrid(size);
	$('.gridlines').show();
}

pageSettings.prototype.elementDimensions = [];
/***********************************************************************************
* DATA LOG OBJECT
************************************************************************************/
var pageLog = function(){
	this.setType('pageLog');
	this.timeStamp;
	this.value;
	this.type;
	this.typeUnits;
	this.units = '';
	this.label = '';
	this.path;
	this.title;
	this.id;
	this.containerId;
	this.parentId = "testLog";
	this.hidden;
	this.elementType;	
	this.logLimit = 10;
	this.head = null;
	this.tail = null;
	this._length = 0;
	this.interval = 1000; //in milliseconds
	this.nodeArray;
}
extend(pageLog, pageElement);

//creates html from object properties
pageLog.prototype.createHtml = function(cellCount, currentData, pageX, pageY){
	var log = this;
	var logId = this.parentId;
	var tableId = this.parentId+'_table';
	this.id = this.parentId;
	var treeTime = $('#stationTree').jstree(true).get_node(log.treeId).original.obj.time;
	
	$('.top-container').append('<div title="'+this.toolTip+'" id="'+logId+'"class="dataLog"><h2> Log:' + this.title + ' </h2><div class="logContainer"><table id="'+tableId+'"><thead><tr><th>Time</th><th>Data</th></tr></thead><tbody></tbody></table></div></div>');
	console.log(logId);
	$('#'+logId).css('top',pageY);
	$('#'+logId).css('left',pageX);
	this.setDrag();
	this.setResize();
	this.timerAppend();
	this.count = cellCount;	
	this.top = pageY;
	this.left = pageX;
	this.heightToSave = $('#'+this.parentId).height();
	this.widthToSave = $('#'+this.parentId).width();
	this.typeChange = this.typeUnits;
	
	$('#'+this.parentId).css('z-index',this.count);

	
	var pageObjId = 'pageSettings';	
	var pageElementPos = cell_arr.map(function(x) {return x.id; }).indexOf(pageObjId);
	var pageObj= cell_arr[pageElementPos];
	var updatePath = this.path.split(".");
	
	updatePath.length = updatePath.length-1;
	updatePath = updatePath.join();
	updatePath = updatePath.replace(/\,/g,"/");
	if(SUBSCRIBE){
		pageObj.updateTable.push(updatePath);
		console.log(pageObj.updateTable);
		data_object.filters_set(pageObj.updateTable);

	}
}

//creates html based on loaded object properties
pageLog.prototype.loadHtml = function(){
	var logId = this.parentId;
		var tableId = this.parentId+'_table';

	//this.arrayToList();
	console.log(this);
	this._length = 0;
	this.head = null;
	this.tail = null;
	$('.top-container').append('<div style="'+this.style+'" title="'+this.toolTip+'" id="'+logId+'"class="dataLog"><h2> Log:' + this.title + ' </h2><div class="logContainer"><table id="'+tableId+'"><thead><tr><th>Time</th><th>Data</th></tr></thead><tbody></tbody></table></div></div>');
	var objectFound = this;
	this.setDrag();
	this.setResize();
	this.lastData = null;

	this.timerAppend();
	if(this.hidden){
		$('#'+this.parentId).addClass('hide');
		console.log($('#'+this.parentId).attr('class'));
		if(editMode == false){
			$('#'+this.parentId).css('visibility','hidden');
		}
	}	
	
	if(editMode == false){
		$('#'+this.parentId).draggable({disabled:true});
		$('#'+this.parentId).resizable({disabled:true});
	}
	else{
		$('#'+this.parentId).draggable({disabled:false});
		$('#'+this.parentId).resizable({disabled:false});
	}
	var pageObjId = 'pageSettings';	
	var pageElementPos = cell_arr.map(function(x) {return x.id; }).indexOf(pageObjId);
	var pageObj= cell_arr[pageElementPos];
	var updatePath = this.path.split(".");
	
	updatePath.length = updatePath.length-1;
	updatePath = updatePath.join();
	updatePath = updatePath.replace(/\,/g,"/");
	if(SUBSCRIBE){
		pageObj.updateTable.push(updatePath);
		console.log(pageObj.updateTable);
		data_object.filters_set(pageObj.updateTable);

	}
}
/*
*	the structure for an entry will be that of a doubly linked list. Therefore it will have to be its own object with a pointer
*	to the previous object, data, timestamp, and a pointer to the next object in the list
*/
var logEntry = function(){
	this.elementType = 'logEntry';
	this.count;
	this.previous = null;
	this.next = null;
	this.data;
	this.timeStamp;
};
//Not currently in use
//this was used when logs were on a fixed interval
//it checks to see if the interval has passed and returns a boolean based on the result
pageLog.prototype.checkInterval = function(time){
	if(this.tail == null){
		return true;	
	}
	var oldTime = this.tail.timeStamp;
	var difference = time-oldTime;
	if(difference > this.interval){
		return true;
	}
	else{
		return false;	
	}
};
//creates a logEntry object and inserts it into the queue
pageLog.prototype.push = function(time, currentTime, currentData){
		var tableId = this.parentId+'_table';

	if( this.tail == null || this.tail.timeStamp != time){
		var node = new logEntry();
		//case for a non-empty list
		if (this._length) {
			//removes first entry if the loglimit is reached
			if(this.logLimit !== 'infinity' && this._length >= this.logLimit){
				this.remove(1);
			}
			//finds the next property of the current tail node and makes it equal to the logEntry we just created
			this.tail.next = node;
			//sets our newly created logEntry previous property to the current tail
			node.previous = this.tail;
			//sets our newly created logEntry as the tail of our queue
			this.tail = node;
		//case for empty list
		} else {
			//sets the head to our newly created logEntry
			this.head = node;
			//sets the tail to our newly created logEntry
			this.tail = node;
		}
		node.data = currentData;
		node.timeValue = currentTime;
		node.timeStamp = time;
		this._length++;

	} else {
		console.log('duplicate');	
	}

};

//converts the doubly linked list to an array
//not currently in use
pageLog.prototype.listToArray = function() {
	var currentNode, nextNode, previousNode, index;
	this.nodeArray = [];
	previousNode = null;
	currentNode = this.head;
	nextNode = currentNode.next;
	index = 0;
	
	while(currentNode.next !== null){
		//store current node in current index of array
		this.nodeArray[index] = currentNode;
		//set previous node to current node;
		previousNode = currentNode;
		//set current node to next node
		currentNode = nextNode;
		//set new next node
		nextNode = currentNode.next;
		//remove circular references that pose problems for json serialization
		previousNode.previous = null;
		previousNode.next = null;
		index++;
	}
	currentNode.previous = null;
	//PROBLEMATIC CODE - causes cyclic reference
	this.nodeArray[index] = currentNode;
	//get rid of head and tail properties
	this.head = null;
	this.tail = null;
	this._length = null;
	//cleanup
	currentNode, nextNode, previousNode, index = null;
}
//converts an array to a list 
//not currently in use
pageLog.prototype.arrayToList = function() {
	var length = this.nodeArray.length;
	var index = 1;
	var currentNode, previousNode;
	this.head = this.nodeArray[0];
	if(length > 0){
		this.head.next = this.nodeArray[1];
		this._length = this.nodeArray.length;
	}
	else{
		this.tail = null;
		this._length = 0;
		return;
	}
	previousNode = this.head;
	for(index; index<length; index++){	
		//set current node to the value of the current array position
		currentNode = this.nodeArray[index];
		console.log(currentNode);
		//set previous node's next to the current node
		previousNode.next = currentNode;
		//link current node to previous node
		currentNode.previous = this.nodeArray[index-1];
		//prepare for next iteration
		previousNode = currentNode;
	}
	this.tail = this.nodeArray[index-1];
}
//searches for a node at a specific position in the doubly linked list
pageLog.prototype.searchNodeAt = function(position) {
    var currentNode = this.head,
        length = this._length,
        count = 1,
        message = {failure: 'Failure: non-existent node in this list.'};
 
    // 1st use-case: an invalid position
    if (length === 0 || position < 1 || position > length) {
        throw new Error(message.failure);
    }
 
    // 2nd use-case: a valid position
    while (count < position) {
        currentNode = currentNode.next;
        count++;
    }
 
    return currentNode;
};

//converts current value and all previous values
pageLog.prototype.convertAll = function() {
	 var currentNode = this.head,
        length = this._length,
        count = 1,
        message = {failure: 'Failure: non-existent node in this list.'},
	 	objectFound = this;
		var newVal;
	//iterates through all values in list
	 while (count <= this._length) {
		newVal = chooseConversion(objectFound.type, objectFound.typeUnits.toUpperCase(), parseFloat(currentNode.data), $( "#unitSelect" ).val()).value;
		//$("#"+objectFound.parentId).find('tbody').append('<tr id="'+objectFound.parentId+'_'+currentNode.timeStamp+'"><td>'+currentNode.timeValue+'</td><td>'+ currentNode.data +'<span class="logLabel">'+objectFound.units+'</span></td></tr>');
		newVal = round(newVal, objectFound.precision);
		 $("#"+objectFound.parentId+'_'+currentNode.timeStamp).html('<td>'+currentNode.timeValue+'</td><td>'+ newVal +'<span class="logLabel">'+objectFound.label+'</span></td>');
		 currentNode = currentNode.next;
		
        count++;
    }	
}

//removes an element from the doubly linked list and links remaining nodes together
pageLog.prototype.remove = function(position) {
	var currentNode = this.head,
        length = this._length,
        count = 1,
        message = {failure: 'Failure: non-existent node in this list.'},
        beforeNodeToDelete = null,
		afterNodeToDelete = null,
        nodeToDelete = null,
        deletedNode = null;
 
    // 1st use-case: an invalid position
    if (length === 0 || position < 1 || position > length) {
        //throw new Error(message.failure);
		console.log('failure');
    }
 
    // 2nd use-case: the first node is removed
    if (position === 1) {
		if (this.head){
			var id = this.parentId+'_'+currentNode.timeStamp;
        	this.head = currentNode.next;
			this.head.previous = null;
			$('#'+id).remove();

		}
        // 2nd use-case: there is a second node
        else if (!this.head) {
            this.head.previous = null;
        // 2nd use-case: there is no second node
        } else {
            this.tail = null;
        }
 
    // 3rd use-case: the last node is removed
    } else if (position === this._length) {
        this.tail = this.tail.previous;
        this.tail.next = null;
    // 4th use-case: a middle node is removed
    } else {
        while (count < position) {
            currentNode = currentNode.next;
            count++;
        }
 
        beforeNodeToDelete = currentNode.previous;
        nodeToDelete = currentNode;
        afterNodeToDelete = currentNode.next;
 
        beforeNodeToDelete.next = afterNodeToDelete;
        afterNodeToDelete.previous = beforeNodeToDelete;
        deletedNode = nodeToDelete;
        nodeToDelete = null;
    }
 
    this._length--;
};

//sets the type changes for our conversions javascript
pageLog.prototype.setTypeChange = function(type){
	this.typeChange = type;
}

//sets the label
pageLog.prototype.setLabel = function(text){
	var containerId = this.parentId;	
	if(this.hasOwnProperty('labelOverride') && this.labelOverride == true){
		$('#'+containerId).find('.label').text(text);
	}
	else{
		$('#'+containerId).find('.label').text(text);
		this.label = text;
	}
	//this.units = text;
}

//allows for the element to be resized by the user
pageLog.prototype.setResize = function(){
	var handleTarget;
	var thisObj = this;		
	$('#'+thisObj.parentId).resizable({
		grid: [1,1], handles: 'all', disabled: false,
		//start function
		start: function(event, ui){
			$('#'+thisObj.parentId).off('mouseup');
				var title = thisObj.toolTip;
				$(this).removeAttr("title");			
				$('#'+thisObj.parentId).on('mouseup', function(e) {
					$('#'+thisObj.parentId).attr('title',title);	
				});
			var width = $('#'+thisObj.parentId).css('width');
			var height = $('#'+thisObj.parentId).css('height');
			var posSpan = document.createElement("SPAN"); 
			posSpan.id = 'resizeSpan';
			posSpan.textContent = "Width: "+width+"  Height: "+height+")";
			$('#resizeSpan').css({
				top: event.clientY+5,
				left: event.clientX+5
			});
			$('#'+thisObj.parentId).append(posSpan);
			handleTarget = $(event.originalEvent.target);
		},
		//during function
		resize: function(event, ui){
			var width = $('#'+thisObj.parentId).css('width');
			var height = $('#'+thisObj.parentId).css('height');
			var top = $('#positionDiv').css('top');
			var left = $('#positionDiv').css('left');
			var newWidth, newHeight;
			
			
			var direction = $(event.target).data('ui-resizable').axis;
			if(direction == 'e' || direction == 'se' || direction == 's'){
				newWidth = (Math.floor(ui.size.width / thisObj.gridProps.size) * thisObj.gridProps.size);
				newHeight = (Math.floor(ui.size.height / thisObj.gridProps.size) * thisObj.gridProps.size);
				$('#'+thisObj.parentId).width(newWidth);
				$('#'+thisObj.parentId).height(newHeight);
			}
			else{
				
				var posTop = (Math.floor(ui.position.top / thisObj.gridProps.size) * thisObj.gridProps.size);
				var posLeft = (Math.floor(ui.position.left / thisObj.gridProps.size) * thisObj.gridProps.size);
				newWidth = (Math.ceil(ui.size.width / thisObj.gridProps.size) * thisObj.gridProps.size);
				newHeight = (Math.ceil(ui.size.height / thisObj.gridProps.size) * thisObj.gridProps.size);
				
				ui.position.top = posTop;
				ui.position.left = posLeft;
				$('#'+thisObj.parentId).css('top',posTop);
				$('#'+thisObj.parentId).css('left',posLeft);
				$('#'+thisObj.parentId).width(newWidth);
				$('#'+thisObj.parentId).height(newHeight);
				
			}
			
			$('#resizeSpan').css({
				top: event.clientY+5,
				left: event.clientX+5
			}); 
			$('#resizeSpan').text("Width: "+newWidth+"  Height: "+newHeight+"");
		},
		//after function
		stop: function(event, ui){
			$('#resizeSpan').remove();
			thisObj.onChangeStyle();
			thisObj.heightToSave = $('#'+thisObj.parentId).height();
			thisObj.widthToSave = $('#'+thisObj.parentId).width();
		}
	});
	
}

//function that changes the fontsize
pageLog.prototype.fontSizeChange = function(size){
	var containerId = this.parentId;
	size = size.trim();
	$('#'+containerId).css('font-size', size+'px');
	/*var style = this.getStyle();
	this.setStyle(style);*/
}

//sets title of log, erases title if text variable empty string
pageLog.prototype.setTitle = function(text){
	var containerId = this.parentId;
	if(text == ''){
		$('#'+containerId).children('h2').text(text);	
	}
	else{
		$('#'+containerId).children('h2').text(text);	
			
	}
	this.title = text;
}

//changes font color and border color (highlights)
pageLog.prototype.fontColorChange = function(color){
	var containerId = this.parentId;
	$('#'+containerId).css('color', color);
	$('#'+containerId).css('border-color', color);
	/*var style = this.getStyle();
	this.setStyle(style);*/
}

//sets the opacity of the background using rgba(r,g,b,a)
pageLog.prototype.setOpacity = function(opacity, ui) {
	var containerId = this.parentId;	
	opacity = opacity.toString();
	var newColor;
	var selectedModule = containerId;
	
	//checks to see if our background-color property is in rgba format
	if($('#'+selectedModule).css('background-color').indexOf("rgba") < 0){
		console.log(ui.value);
		newColor = $('#'+selectedModule).css('background-color').replace(')', ', '+(Math.round(ui.value)*.01).toFixed(2)+')').replace('rgb', 'rgba');
	}
	//if background-color not in rgba, we convert it
	else{
		var currentColor = $('#'+selectedModule).css('background-color');
		var splitColor = currentColor.split(',');
				console.log(ui.value);

		newColor = splitColor[0] + "," + splitColor[1] + "," + splitColor[2] + "," + (Math.round(ui.value)*.01).toFixed(2) + ')';
		$('#opacityPercent').text(' '+Math.round(ui.value)+'%');
	}
	$('#'+selectedModule).css('background-color', newColor);
	$('.backgroundColorChange').val(''+newColor);
	$('#opacitySlider .ui-slider-range').css('background', newColor );
	$('#opacitySlider .ui-slider-handle').css('border-color', newColor);
	
}

//sets the precision of the value properties
pageLog.prototype.setPrecision = function(value){
	//need "||" because javascript interperets an empty string as zero
	//discards non-number and non-integer properties and defaults to zero
	if(isNaN(value) || value == '' || parseInt(value) > 19){
		this.precision = 0;
	}
	else{
		this.precision = value;
	}
	console.log(this);
}

//sets the limit to how many nodes can reside in our list
pageLog.prototype.setLogLimit = function(limit){
	limit = parseInt(limit);
	//first use-case: new limit is larger than current limit
	if(limit >= this._length){
		this.logLimit = limit;	
	}
	
	//second use-case: new limit is smaller than current limit - we need to delete nodes
	else{
		var start = this.searchNodeAt(limit),
			currentNode = start.next,
			nextNode = start.next;
		
		this._length = limit;
		this.logLimit = limit;
		this.tail = start;
		
		//start deleting nodes
		while(currentNode !== null){
			nextNode = currentNode.next;
			$("#"+this.parentId+'_'+currentNode.timeStamp).remove();
			currentNode.next = null;
			currentNode.previous = null;
			currentNode = null;
			currentNode = nextNode;
		}
		
	}
}
/***********************************************************************************
* DATA CELL OBJECT
************************************************************************************/
var pageCell = function(){
	this.containerId;
	this.elementType;
	this.fullId;
	this.hidden;
	this.id;
	this.path;
	this.precision;
	this.title;
	this.label;
	this.toolTip;
	this.value;
	this.setType('pageCell');
	this.units = '';
	
}
extend(pageCell,pageElement);

//sets the precision property of the object - discards non-integer values
pageCell.prototype.setPrecision = function(value){
	//need "||" because javascript interperets an empty string as zero
	if(isNaN(value) || value == '' || parseInt(value) > 19){
		this.precision = 0;
	}
	//negative numbers will affect places to the left of the decimal point
	else{
		this.precision = value;
	}
	console.log(this);
}

pageCell.prototype.setTypeChange = function(type){
	this.typeChange = type;
}

//changes font color of element
pageCell.prototype.fontColorChange = function(color){
	var containerId = this.fullId;
	$('#'+containerId).closest('.tr').css('color', color+'');
	var style = this.getStyle();
	this.setStyle(style);
}

//changes background color of element
pageCell.prototype.backgroundColorChange = function(color){
	var containerId = this.fullId;
	$('#'+containerId).closest('.tr').css('background-color', color);
	$('#opacitySlider .ui-slider-range').css('background', color );
  	$('#opacitySlider .ui-slider-handle').css('border-color', color);
	var style = this.getStyle();
	this.setStyle(style);
}

//changes font size of element
pageCell.prototype.fontSizeChange = function(size){
	var containerId = this.fullId;
	size = size.trim();
	$('#'+containerId).closest('.tr').css('font-size', size+'px');
	var style = this.getStyle();
	this.setStyle(style);
}

//changes value of title in element html
// |``````````title```````````|
// |``````````````````````````| 
// |      value   label       |
// ````````````````````````````
pageCell.prototype.setTitle = function(text){
	var containerId = this.fullId;
	//removes title from element if text = ''
	if(text == ''){
		$('#'+containerId).siblings('.myTableTitle').children('p').text(text);	
		$('#'+containerId).siblings('.myTableTitle').css('background-color','rgba(0, 0, 0, 0)');	
	}
	else{
		$('#'+containerId).siblings('.myTableTitle').children('p').text(text);	
		$('#'+containerId).siblings('.myTableTitle').css('background-color','rgba(0, 0, 0, 0.35)');	
	}
	this.title = text;
} 

//changes value of label in element html
// |``````````title```````````|
// |``````````````````````````| 
// |      value   label       |
// ````````````````````````````
pageCell.prototype.setLabel = function(text){
	var containerId = this.fullId;	
	//if label override is on, label will not change
	if(this.hasOwnProperty('labelOverride') && this.labelOverride == true){
		$('#'+containerId).find('.label').text(text);
	}
	else{
		$('#'+containerId).find('.label').text(text);
		this.label = text;
	}
	//this.units = text;
}

//sets label override so that updating the value of this data cell does not replace it with the default label
pageCell.prototype.setLabelOverride = function(value, label){
		this.labelOverride = value;

	if(value){
		$('#'+this.fullId).find('.label').text(label);
		this.label = label;
	}
	else{
		var updatedLabel;
		if(typeof this.typeUnits === 'undefined' || typeof this.type ==='undefined' || typeof this.typeChange === 'undefined' || this.value === 'undefined'){
			updatedLabel = htmlEntities(this.units);	
		}
		else{
			var result = chooseConversion(this.type, this.typeUnits.toUpperCase(), this.value, this.typeChange.toUpperCase());	
			updatedLabel = htmlEntities(result.label);	
		}
		$('#'+this.fullId).find('.label').text(updatedLabel);
	}
}

//sets opacity using RGBA( r, g, b, a)
pageCell.prototype.setOpacity = function(opacity, selectedModule, ui) {
	var containerId = this.fullId;	
	opacity = opacity.toString();
	var newColor;
	//background color is in rgba format...
	if($('#'+selectedModule).css('background-color').indexOf("rgba") < 0){
		console.log(ui.value);
		newColor = $('#'+selectedModule).css('background-color').replace(')', ', '+(Math.round(ui.value)*.01).toFixed(2)+')').replace('rgb', 'rgba');
	}
	//if background color is not in rgba format, we must conver it.
	else{
		var currentColor = $('#'+selectedModule).css('background-color');
		var splitColor = currentColor.split(',');
				console.log(ui.value);

		newColor = splitColor[0] + "," + splitColor[1] + "," + splitColor[2] + "," + (Math.round(ui.value)*.01).toFixed(2) + ')';
		$('#opacityPercent').text(' '+Math.round(ui.value)+'%');
	}
	$('#'+selectedModule).css('background-color', newColor);
	$('.backgroundColorChange').val(''+newColor);
	$('#opacitySlider .ui-slider-range').css('background', newColor );
	$('#opacitySlider .ui-slider-handle').css('border-color', newColor);
	
	var style = this.getStyle();
	this.setStyle(style);
}

//This function defines how resizing works for data cells
//these resize functions could be refactores so that start, resize, and stop 
// all call functions instead of the code duplication that I have now
pageCell.prototype.setResize = function(){
	var handleTarget;
	var thisObj = this;		
	$('#'+thisObj.parentId).resizable({
		grid: [1,1], handles: 'all', disabled: false,
		//function that executes when resizing starts
		start: function(event, ui){
			$('#'+thisObj.parentId).off('mouseup');
				var title = thisObj.toolTip;
				$(this).removeAttr("title");			
				$('#'+thisObj.parentId).on('mouseup', function(e) {
					$('#'+thisObj.parentId).attr('title',title);	
				});
			var width = $('#'+thisObj.parentId).css('width');
			var height = $('#'+thisObj.parentId).css('height');
			var posSpan = document.createElement("SPAN"); 
			posSpan.id = 'resizeSpan';
			posSpan.textContent = "Width: "+width+"  Height: "+height+")";
			$('#resizeSpan').css({
				top: event.clientY+5,
				left: event.clientX+5
			});
			$('#'+thisObj.parentId).append(posSpan);
			handleTarget = $(event.originalEvent.target);
		},
		//function that executes during resizing
		resize: function(event, ui){
			var width = $('#'+thisObj.parentId).css('width');
			var height = $('#'+thisObj.parentId).css('height');
			var top = $('#positionDiv').css('top');
			var left = $('#positionDiv').css('left');
			var newWidth, newHeight;
			
			
			var direction = $(event.target).data('ui-resizable').axis;
			//we have to change the way resizing works when dragging from the e, se and s sides
			if(direction == 'e' || direction == 'se' || direction == 's'){
				newWidth = (Math.floor(ui.size.width / thisObj.gridProps.size) * thisObj.gridProps.size);
				newHeight = (Math.floor(ui.size.height / thisObj.gridProps.size) * thisObj.gridProps.size);
				$('#'+thisObj.parentId).width(newWidth);
				$('#'+thisObj.parentId).height(newHeight);
			}
			else{
				
				var posTop = (Math.floor(ui.position.top / thisObj.gridProps.size) * thisObj.gridProps.size);
				var posLeft = (Math.floor(ui.position.left / thisObj.gridProps.size) * thisObj.gridProps.size);
				newWidth = (Math.ceil(ui.size.width / thisObj.gridProps.size) * thisObj.gridProps.size);
				newHeight = (Math.ceil(ui.size.height / thisObj.gridProps.size) * thisObj.gridProps.size);
				
				ui.position.top = posTop;
				ui.position.left = posLeft;
				$('#'+thisObj.parentId).css('top',posTop);
				$('#'+thisObj.parentId).css('left',posLeft);
				$('#'+thisObj.parentId).width(newWidth);
				$('#'+thisObj.parentId).height(newHeight);
				
			}
			
			$('#resizeSpan').css({
				top: event.clientY+5,
				left: event.clientX+5
			}); 
			$('#resizeSpan').text("Width: "+newWidth+"  Height: "+newHeight+"");
			
		},
		//function that executes after resizing
		stop: function(event, ui){
			$('#resizeSpan').remove();
			thisObj.onChangeStyle();
			thisObj.heightToSave = $('#'+thisObj.parentId).height();
			thisObj.widthToSave = $('#'+thisObj.parentId).width();
		}
	});
}

//creates the html from the object properties
pageCell.prototype.createHtml = function(cellCount, currentData, pageX, pageY){
	
	$('.top-container').append('<div title="'+this.toolTip+'" class="tr draggable" id="' + this.parentId + '"><div class="td myTableID"> ID: <span>' + this.title + '</span> </div><div class="td myTableTitle"><p class="titleText">' + this.title + '</p></div><div class="td myTableValue" id="' + this.fullId + '"><p>'+currentData+'</p><span class="path">'+ this.path +'</span><span class="label"> '+ this.units +'</span></div></div>');
	var cellId = this.parentId;
	$('#'+cellId).css('top',pageY);
	$('#'+cellId).css('left',pageX);
	this.setDrag();
	this.setResize();
	this.timerAppend();
	
	this.top = pageY;
	this.left = pageX;
	this.heightToSave = $('#'+this.parentId).height();
	this.widthToSave = $('#'+this.parentId).width();
	this.count = cellCount;
	$('#'+this.parentId).css('z-index',this.count);

	
	var pageObjId = 'pageSettings';	
	var pageElementPos = cell_arr.map(function(x) {return x.id; }).indexOf(pageObjId);
	var pageObj= cell_arr[pageElementPos];
	var updatePath = this.path.split(".");
	
	updatePath.length = updatePath.length-1;
	updatePath = updatePath.join();
	updatePath = updatePath.replace(/\,/g,"/");
	if(SUBSCRIBE){
		pageObj.updateTable.push(updatePath);
		console.log(pageObj.updateTable);
		data_object.filters_set(pageObj.updateTable);

	}
}

//re-creates html from loaded object properties
pageCell.prototype.loadHtml = function(cellCount){
	var updatedPath = ref(dataOld, this.path);
	var result;
	var label = this.label;
	if(typeof label === 'undefined'){
		label = this.units	
	}
	//set datatype based on value in json
	if(typeof updatedPath == 'string'){
		this.dataType = 'string';	
	}
	else{
		this.dataType = 'number';	
	}
	console.log(this.path);
	console.log(updatedPath);
	console.log(this.dataType);
	
	//if the data type is a number, then it can be manipulated
	if(this.dataType !== 'string'){
 		if(updatedPath !== 'undefined'){
			console.log(this.typeUnits+" "+this.typeChange+" "+updatedPath+" "+this.precision);
			if(typeof this.typeUnits !== 'undefined' && typeof this.typeChange !== 'undefined' && (this.typeUnits.toUpperCase() !== this.typeChange.toUpperCase())){
				console.log(this.title);
				console.log(this.typeUnits+" "+this.typeChange);
				console.log(updatedPath);
				console.log(this.type);
				console.log(this.typeChange);
				result = chooseConversion(this.type, this.typeUnits.toUpperCase(), updatedPath, this.typeChange.toUpperCase()).value;	
				updatedPath = result;
				console.log(result.label);
			}
			console.log(updatedPath);
			updatedPath = round(updatedPath, this.precision);

		}

		else{
		updatedPath = 'Loading...'	
		}
	
			
	}	
	$('.top-container').append('<div style="'+this.style+'" title="'+this.toolTip+'" class="tr draggable" id="'+ this.parentId + '"><div class="td myTableID"> ID: <span>' + this.title + '</span> </div><div class="td myTableTitle"><p class="titleText">' + this.title + '</p></div><div class="td myTableValue" id="' + this.fullId + '"><p>'+updatedPath+'</p><span class="path">'+ this.path +'</span><span class="label"> '+ label +'</span></div></div>');
	this.setDrag();
	this.setResize();
	this.lastData = null;
	//this handles the time since the data has been updated for this element
	this.timerAppend();
	
	if(this.hidden){
		$('#'+this.parentId).addClass('hide');
		console.log($('#'+this.parentId).attr('class'));
		if(editMode == false){
			$('#'+this.parentId).css('visibility','hidden');
		}
	}	
	if(this.title == ''){
		$('#'+this.fullId).siblings('.myTableTitle').css('background-color','rgba(0,0,0,0)');
	}
	if(editMode == false){
		$('#'+this.parentId).draggable({disabled:true});
		$('#'+this.parentId).resizable({disabled:true});
	}
	else{
		$('#'+this.parentId).draggable({disabled:false});
		$('#'+this.parentId).resizable({disabled:false});
	}
	var pageObjId = 'pageSettings';	
	var pageElementPos = cell_arr.map(function(x) {return x.id; }).indexOf(pageObjId);
	var pageObj= cell_arr[pageElementPos];
	var updatePath = this.path.split(".");
	
	updatePath.length = updatePath.length-1;
	updatePath = updatePath.join();
	updatePath = updatePath.replace(/\,/g,"/");
	if(SUBSCRIBE){
		pageObj.updateTable.push(updatePath);
		console.log(pageObj.updateTable);
		data_object.filters_set(pageObj.updateTable);

	}

}

/***********************************************************************************
* CAMERA OBJECT
************************************************************************************/
var pageCam = function(){
	this.setType('pageCam');
	this.hoverable = false;
	this.clickable = false;
	this.suppressed;
	this.hoverDelay;
	this.cropped;	
	this.natWidth;
	this.natHeight;
	this.id;
	this.path;
	this.style;
	this.src;
	this.containerId;
	this.timeOut;
}
extend(pageCam,pageElement);
pageCam.prototype.setClickable = function(boolClick){
	//if we are setting clickable to false
	var camObj = this;
	if(!boolClick){
		this.clickable = false;
		$( "#"+camObj.parentId ).off("click", camObj.clickFunction);
	}
	//if we are setting clickable to true
	else{
		this.clickable = true;
		//click event bound to object property so that we can clear it later
		camObj.clickFunction = $('#'+camObj.parentId).on("click", function(e) {
			//if ctrl key is held during click 
			
			if(e.ctrlKey && !editMode && camObj.clickable && !camObj.clicked) {
			 	
				//Add elements to DOM for our hover image
				var hoverImg = document.createElement('img'),
				hoverImgLink = document.createElement('a');
				camObj.clicked = true;
				//get camera properties
			 	var camSrc = camObj.src,
				camWidth = parseInt(camObj.natWidth),
				camHeight = parseInt(camObj.natHeight);
				
				//are we using a webkit browser?
				var isWebkit = 'WebkitAppearance' in document.documentElement.style,
				hoverImgId = camObj.parentId+'hover1';
				$(hoverImgId).remove();
				//set the width and height of our hover image to the native width and height
				$(hoverImg).width(camWidth);
				$(hoverImg).height(camHeight);
				$(hoverImgLink).width(camWidth);
				$(hoverImgLink).height(camHeight);
				hoverImg.src = camSrc;
				
				if(typeof camObj.hoverTarget !== 'undefined' && camObj.hoverTarget !== ''){
					hoverImgLink.href = camObj.hoverTarget;
				}
				else{
					hoverImgLink.href = camSrc;
				}
				if(typeof camObj.hoverTargetBehavior !== 'undefined' && camObj.hoverTargetBehavior !== ''){
					hoverImgLink.target = camObj.hoverTargetBehavior;
				}
				else{
					hoverImgLink.target = '_blank';
				}
				hoverImgLink.appendChild(hoverImg);
				$('#'+camObj.parentId).append(hoverImgLink);
				$('#'+camObj.parentId).addClass('focusedCam');

				hoverImgLink.id = hoverImgId;
				hoverImgLink.className = 'expandedCam';
				var top = parseInt($('#'+camObj.parentId).css('top'),10)
				var height = parseInt(camObj.natHeight,10);
				var left = parseInt($('#'+camObj.parentId).css('left'),10)
				var width = parseInt(camObj.natWidth,10);
				
				if(isWebkit){
					$('#'+hoverImgId).css({
						"top": (((window.innerHeight-height)/2)-top)+"px",
						"left": (((window.innerWidth-width)/2)-left)+"px"	
					});
				}
				else{
					$('#'+hoverImgId).css({
						"top": (((window.innerHeight-height)/2))+"px",
						"left": (((window.innerWidth-width)/2))+"px"
					});
				}
				//seperate click events
				setTimeout(function(){
					//click event for closing out the hover image
					$(document.body).one("click", ":not(#"+hoverImgId+", #"+hoverImgId+" *,#"+camObj.parentId+", #"+camObj.parentId+" *)", function(e){ 
						camObj.clicked = false;
						$('#'+hoverImgId).remove();
						$('#'+camObj.parentId).removeClass('focusedCam');
					});
				 },100);

			 }
		});
	}
}	

//sets class for hover and sets delay time
pageCam.prototype.setHover = function(boolHover, hoverTime){

	var camObj, camId, radiobtn;
	camObj = this;
	clearTimeout(camObj.timeOut);	
	camId = camObj.containerId;
	
	/*if hovering is set to disabled, we remove the event handler and hide the 
	* options in the edit window responsible for configuring hover. 
	*/
	if(boolHover == false){
		console.log('BOOOOOOL HOVER '+ boolHover);
		camObj.hoverable = false;
		$( '#'+camId ).off("mouseenter mouseleave",camObj.hoverFunction);
		$('#hoverTimeRow, #suppressHoverable').hide();		
		return;	
	}
	//else, continue setting hover event handler
	else{
		var suppressed, camId, camWidth, divWidth, camHeight, isWebkit, hoverImgId, timeOut, hoverTimeOut, hoverImg, hoverImgLink;
		camObj.hoverable = true;
		timeOut = hoverTime*1000;
		hoverImg = document.createElement('img');
		hoverImgLink = document.createElement('a');
		
		/*if the src of the image changes while we are hovering, we don't want 
		* this function to set another hover event handler. Instead we just change
		* the src of the hover image and return
		*/
		if($( "#"+camId  ).hasClass('focusedCam')){
			$( "#"+camId  ).find('.expandedCam, .webKitCam').attr('src',camObj.src);	
			return;
		}
		$( "#"+camId  ).unbind("mouseenter", camObj.hoverFunction);
		$( "#"+camId  ).unbind("mouseleave",camObj.hoverFunction);
		camObj.hoverFunction = $( "#"+camId ).hover(function(){
			var camSrc = camObj.src;
			suppressed = false;
			camWidth = parseInt(camObj.natWidth);
			camHeight = parseInt(camObj.natHeight);
			divWidth = parseInt($('#'+camId).css('width').slice(0,-2));
			isWebkit = 'WebkitAppearance' in document.documentElement.style;
			hoverImgId = camId+'hover';
			
			if(camWidth <= divWidth && camObj.suppressed == true){
				suppressed = true;
			}
			if(editMode == false && suppressed == false){
				clearTimeout(camObj.timeOut);	
				//sets a user-configurable timeout so that the hover does not trigger right away
				camObj.timeOut = setTimeout(function() {
					console.log('time');
					$(hoverImg).width(camWidth);
					$(hoverImg).height(camHeight);
					$(hoverImgLink).width(camWidth);
					$(hoverImgLink).height(camHeight);
					hoverImg.src = camSrc;
				
					if(typeof camObj.hoverTarget !== 'undefined' && camObj.hoverTarget !== ''){
						hoverImgLink.href = camObj.hoverTarget;
						
					}
					else{
						hoverImgLink.href = camSrc;
					}
					if(typeof camObj.hoverTargetBehavior !== 'undefined' && camObj.hoverTargetBehavior !== ''){
						hoverImgLink.target = camObj.hoverTargetBehavior;
					}
					else{
						hoverImgLink.target = '_blank';
					}
					hoverImgLink.appendChild(hoverImg);
					console.log(hoverImg);
					$('#'+camId).append(hoverImgLink);
					$('#'+camId).addClass('focusedCam');
				
					hoverImgLink.id = hoverImgId;
					hoverImgLink.className = 'expandedCam';
					var top = parseInt($('#'+camId).css('top'),10)
					var height = parseInt(camObj.natHeight,10);
					var left = parseInt($('#'+camId).css('left'),10)
					var width = parseInt(camObj.natWidth,10);
					console.log(window);
					console.log(left+((window.innerWidth-width)/2));
					console.log(left);
					if(isWebkit){
						$('#'+hoverImgId).css({
							"top": (((window.innerHeight-height)/2)-top)+"px",
							"left": (((window.innerWidth-width)/2)-left)+"px"	
						});
					}
					else{
						$('#'+hoverImgId).css({
							"top": (((window.innerHeight-height)/2))+"px",
							"left": (((window.innerWidth-width)/2))+"px"
						});
					}
				}, timeOut); //end hoverTimeOut
			} //end if(editMode == false && suppressed == false)
		}, function () {
			clearInterval(camObj.timerInterval);
			$("#"+camObj.parentId).find('.timerBlock').remove();
			if(editMode === false && suppressed == false){	
				clearTimeout(camObj.timeOut);
				$('#'+hoverImgId).remove();
				$('#'+camId).removeClass('focusedCam');
				
			}
		}
	);} //end $('#'camId).hover(function()
} //end set hover

//sets the supression for hover
pageCam.prototype.setSuppression = function(boolSuppress){
	this.suppressed = boolSuppress;
}

//sets the crop area when image is cropped
pageCam.prototype.setCrop = function(boolCrop){
	if(boolCrop == true){
		var style = this.getStyle();
		this.setStyle(style);
		this.cropped = true;
	}
	else{
		var style = this.getStyle();
		this.setStyle(style);
		this.cropped = false;	
	}

}

//gets the natural height of the image
pageCam.prototype.getNatWidth = function(){
	return this.natWidth;
}

//gets the natural height of the image
pageCam.prototype.getNatHeight = function(){
	return this.natHeight;
}

//sets the natural width and height of an image
pageCam.prototype.setNaturalDimensions = function(height, width){
	console.log("width "+width+" height "+height);
	
	this.natHeight = height;
	this.natWidth = width;
	this.changedHeight = height;
	this.changedWidth = width;
}

//resizes image to original, native size - resets drag and resize with new information
pageCam.prototype.resize = function(){
	var camObj = this;
	var camId = this.containerId;
	$("#"+camId).removeClass("cropped");
	$("#"+camId).resizable({disabled: false});
	var width = camObj.natWidth;
	var height = camObj.natHeight;
	$("#"+camId).css('width', width);
	$("#"+camId).css('height',height);
	$("#"+camId).css("background-size","contain");
	$("#"+camId).css("background-position","50% 50%");
	var newStyle = $("#"+camId).attr('style');
	camObj.setStyle(newStyle);
	camObj.setResize();
	camObj.setDrag();
	
}

//gets current height of the camera
pageCam.prototype.getHeight = function(){
		return $("#"+this.fullId).height();
}

//gets current width of the camera
pageCam.prototype.getWidth = function(){
		return $("#"+this.fullId).width();
}

//applies width using the value in the width field in edit window
pageCam.prototype.applyWidth = function(){
	var obj = this;
	var width = $("#manualWidth").val();
	var natHeight = obj.natHeight;
	var natWidth = obj.natWidth;
	var aspectRatio = natWidth/natHeight;
	var adjustedHeight = width/aspectRatio;
	$("#"+this.fullId).css("width",width+"px");
	$("#"+this.fullId).css("height",adjustedHeight+"px");
	this.widthToSave = $('#'+this.parentId).width();
	this.heightToSave = $('#'+this.parentId).height();

}

//applies height using the value in the height field in the edit window
pageCam.prototype.applyHeight = function(){
	var obj = this;
	var height = $("#manualHeight").val();
	var natHeight = obj.natHeight;
	var natWidth = obj.natWidth;
	var aspectRatio = natHeight/natWidth;
	var adjustedWidth = height/aspectRatio;
	$("#"+this.fullId).css("height",height+"px");
	$("#"+this.fullId).css("width",adjustedWidth+"px");
	this.widthToSave = $('#'+this.parentId).width();
	this.heightToSave = $('#'+this.parentId).height();
}

//sets teh value of the width field in the edit window
pageCam.prototype.setWidthField = function(){
	var obj = this;
	var width = this.getWidth();
	$("#manualWidth").val(width);
}

//sets the value of the height field in the edit window
pageCam.prototype.setHeightField = function(){
	var obj = this;
	var height = this.getHeight();
	$("#manualHeight").val(height);

}

//sets both fields in the edit window
pageCam.prototype.setWidthHeightFields = function(){
	var obj = this;
	var width = this.getWidth();
	var height = this.getHeight();
	$("#manualWidth").val(width);
	$("#manualHeight").val(height);
}

//applies the width value of the previous element - resizing the camera in the process
pageCam.prototype.previousElementWidth = function(){
	var dims = this.elementDimensions[0];
	console.log(dims);
	$("#manualWidth").val(dims.getWidth());	
	this.widthToSave = $('#'+this.parentId).width();

}

//applie the height value of the previous element - resizing the camera to the hat height in the process
pageCam.prototype.previousElementHeight = function(){
	var dims = this.elementDimensions[0];
	console.log(dims);
	$("#manualHeight").val(dims.getHeight());	
	this.heightToSave = $('#'+this.parentId).height();

}

//method that handles cropping of camera
//may need to be refactored at some point
pageCam.prototype.camCrop = function(){
	var thisObj = this;
	var thisElement = $("#"+thisObj.parentId);
	thisElement.hide();
	var width, height, left, top, src, diffFromNatWidth, diffFromNatHeight, cropTop, cropLeft, cropWidth, cropHeight, originalWidth, originalHeight;
	//cropping situation if our camera has already been cropped
	if(thisObj.cropped == true){
		width = parseFloat(thisObj.changedWidth);
		height = parseFloat(thisObj.changedHeight);
		originalWidth = thisElement.css('width');
		originalHeight = thisElement.css('height');
		left = thisElement.css('left');
		top = thisElement.css('top');
		src = thisObj.src;		
		diffFromNatHeight = (height)/thisObj.natHeight;
		diffFromNatWidth = (width)/thisObj.natWidth;
		console.log(height+" "+thisObj.natHeight+" "+diffFromNatHeight);
		//disables controls
		$('.controlsOverlay').show();
		//creates a cropper window that is the size of the image that we are cropping
		$('#content').append('<div class="cropperWrapper"><img class="cropperWrapperImg" width="'+(width*diffFromNatWidth)+' " height="'+(height*diffFromNatHeight)+' "src="'+src+'"></div>');
		//sets the cropped postion to be maximum width and height and positioned in the top left corner
		$('.cropperWrapper').css({ "position":"absolute","top": top, "left": left, "width": width, "height": height });

		//set up the config for the croper object
		$('.cropperWrapperImg').cropper({
			dragCrop: true,
			scaleable: false,
			movable: false,
			modal: true,
			strict: false,
			zoomable: false,
			mouseWheelZoom: false,
			crop: function(e) {
					cropHeight =  Math.round(e.height);
					cropWidth =  Math.round(e.width);
					cropLeft =  Math.round(e.x);
					cropTop =  Math.round(e.y);
			},
			built: function () {
				var thisTop, thisLeft, thisWidth, thisHeight;
				var backgroundPos = thisElement.css('backgroundPosition').split(" ");
				thisTop = Math.abs(parseInt(backgroundPos[1]));
				thisLeft = Math.abs(parseInt(backgroundPos[0]));
				thisHeight = parseInt(originalHeight);
				thisWidth = parseInt(originalWidth);
				//case for when crop is not adjusted and finish is clicked
				cropWidth = thisWidth;
				cropHeight = thisHeight;
				cropLeft = thisLeft;
				cropTop = thisTop;
				$('.cropperwrapper > img').cropper("setCropBoxData", { width: thisWidth, height: thisHeight, left: thisLeft, top: thisTop });
			}
		});
	}
	//if cam has not been cropped yet
	else{
		//width = thisElement.css('width');
		//height = thisElement.css('height');
		width = parseFloat(thisObj.changedWidth);
		height = parseFloat(thisObj.changedHeight);
		left = thisElement.css('left');
		top = thisElement.css('top');
		src = thisObj.src;
		diffFromNatHeight = (height)/thisObj.natHeight;//(height.slice(0,-2))/thisObj.natHeight;
		diffFromNatWidth = (height)/thisObj.natHeight;//(width.slice(0,-2))/thisObj.natWidth;
		console.log(thisObj.natWidth+" "+width/*.slice(0,-2)*/+" "+width);
		//disables controls
		$('.controlsOverlay').show();
		//creates a cropper window that is the size of the image that we are cropping
		$('#content').append('<div class="cropperWrapper"><img class="cropperWrapperImg" width="'+(width)+' " height="'+(height)+' "src="'+src+'"></div>');
		//sets the cropped postion to be maximum width and height and positioned in the top left corner
		console.log(window);
		$('.cropperWrapper').css({ "position":"absolute","top": top, "left": left, "width": width, "height": height });

		$('.cropperWrapperImg').cropper({
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
				cropHeight = Math.round(e.height);
				cropWidth = Math.round(e.width);
				cropLeft = Math.round(e.x);
				cropTop = Math.round(e.y);
				console.log(cropHeight+ " "+cropWidth);
			}
		});
	}	
	//event for finalizing the cropping
	$( document ).off( "click", "#endCrop"); //unbind old events, and bind a new one
	$( document ).on( "click", "#endCrop" , function() {
		$('#cropModule, #hideDelRow, #resizeModule, #hoverRow, #zRow, #hoverTimeRow, .editWindow, .controls').show();
		$('#endCrop, #cancelCrop, #cropDialog').hide();
		
		width = parseInt((width));
		height = parseInt((height));
		$('.cropperWrapper').remove();
		if(cropTop == 0 || cropLeft == 0){
			if(cropTop == 0){
				thisElement.css("background-position", "-"+(cropLeft*diffFromNatWidth)+"px "+((cropTop*diffFromNatHeight))+"px");
			}
			else if(cropLeft == 0){
				thisElement.css("background-position", ""+(cropLeft*diffFromNatWidth)+"px -"+(cropTop*diffFromNatHeight)+"px");
			}
			else if(cropLeft == 0 && cropTop ==0){
				thisElement.css("background-position", "-"+(cropLeft*diffFromNatWidth)+"px -"+(cropTop*diffFromNatHeight)+"px");
			}
		}
		else{
			thisElement.css("background-position", "-"+(cropLeft*diffFromNatWidth)+"px -"+(cropTop*diffFromNatHeight)+"px");
		}
		top = parseInt(top, 10);
		left = parseInt(left, 10);
		cropTop = parseInt(cropTop, 10);
		cropLeft = parseInt(cropLeft, 10);
		var topcrop = top;
		var leftcrop = left;
		var widthcrop = cropWidth*diffFromNatWidth;
		var heightcrop = cropHeight*diffFromNatHeight;
		//console.log(top+(cropTop*diffFromNatHeight)+" "+left+(cropLeft*diffFromNatWidth)+" "+cropWidth*diffFromNatWidth+" "+cropHeight*diffFromNatHeight)
		console.log(thisElement.css("background-position"));
		console.log(width+" "+diffFromNatWidth+" "+cropWidth+" "+widthcrop);
		thisElement.css({
			"top": topcrop,
			"left": leftcrop,
			"width": widthcrop+"px",
			"height": heightcrop+"px",
			"background-size": width+"px "+height+"px "
		});
		$('.controlsOverlay').hide();				
		thisElement.resizable({disabled:true});
		thisObj.setCrop(true);
		thisElement.show();
		
	});
	//event for canceling the cropping
	$( document ).off( "click", "#cancelCrop"); //unbind old events, and bind a new one
	$( document ).on( "click", "#cancelCrop" , function() {
		thisElement.show();
		$('#cropModule, #hideDelRow, #resizeModule, #hoverRow, #zRow, #hoverTimeRow, .editWindow, .controls').show();
		$('#endCrop, #cancelCrop, #cropDialog').hide();
		$('.cropperWrapper').remove();
		$('.controlsOverlay').hide();
	});
	$('#masterEdit, .textBlockContainer, .imgBlockContainer, .imgCamContainer, .tr').one('click', function() {
		thisElement.show();
		$('#cropModule, #hideDelRow, #resizeModule, #hoverRow, #zRow, #hoverTimeRow, .editWindow, .controls').show();
		$('#endCrop, #cancelCrop, #cropDialog').hide();
		$('.cropperWrapper').remove();
		$('.controlsOverlay').hide();								
	});
}
//creates element
pageCam.prototype.createHtml = function(cellCount, value, pageX, pageY){
	var camId = this.fullId;
	var camObj = this; 
	$('#preload').append('<img alt="camimage" src="" id="preload_'+camId+'" >');
	$('.top-container').append('<div title="'+camObj.toolTip+'"class="imgCamContainer suppressHover hoverables" id='+camId+' style=""><img alt="1" style="visibility:hidden;" src="'+value+'"></div>');
	
	//set resize and drag
	camObj.setResize();
	camObj.setDrag();
	//set css properties
	$('#'+camId).css({
		"position":"absolute",
		"display":"inline-block",
		"top":pageY,
		"left":pageX
	});
	
	//The below code is responsible for pre-loading an image so that the whole image appears to load instantly
	//The '#preload_' element loads the image first, and then the jquery .load() function sets the source of the 
	//real image once it is completely loaded.
	$('#preload_'+camId).load(function() {
		var src = $(this).attr("src");
		$('#'+camId).css('background-image','url('+value+')');

		camObj.hoverable = false;
		camObj.suppressed = true;
		camObj.hoverDelay = 1;
		camObj.setHover(camObj.hoverable, camObj.hoverDelay);
		camObj.cropped = false;	
		camObj.count = cellCount; 
		camObj.src = value;
		
		var currentMode = editMode
		var width = $('#'+camId).children('img').width();
		var height = $('#'+camId).children('img').height();	
		var hov = true;
		var delay = 1;
		
		camObj.setNaturalDimensions(height, width);
		camObj.heightToSave = height;
		camObj.widthToSave = width;
			camObj.setClickable(true);

		cell_arr.push(camObj);
		//calcluate download
		$('#bytesReceived').html(calculateDownload());
		
		$('#'+camId).css('z-index',camObj.count);
		camObj.timerAppend();
	});	
	
	//update src after .load is called

	$('#preload_'+camId).attr('src', value);
	
	var pageObjId = 'pageSettings';	
	var pageElementPos = cell_arr.map(function(x) {return x.id; }).indexOf(pageObjId);
	var pageObj= cell_arr[pageElementPos];
	var updatePath = this.path.split(".");
	
	updatePath.length = updatePath.length-1;
	updatePath = updatePath.join();
	updatePath = updatePath.replace(/\,/g,"/");
	if(SUBSCRIBE){
		pageObj.updateTable.push(updatePath);
		console.log(pageObj.updateTable);
		data_object.filters_set(pageObj.updateTable);

	}
	
}

pageCam.prototype.loadHtml = function(widthRatio, heightRatio){
	
	var camId = this.fullId;
	var camObj = this;
	
	//get the image src value
	
	
	var updatedPath = ref(dataOld, this.path);
	if(typeof updatedPath === 'undefined'){
		updatedPath = 'images/unavailable.svg';
	}
	
	camObj.src = updatedPath;
	console.log(updatedPath);
	
	var img = document.createElement("IMG");
	img.alt = "camimage";
	img.id = 'preload_'+this.fullId
	$('#preload').append(img);
	
	//$('#preload').append('<img alt="camimage" src="" id="preload_'+this.fullId+'" >');
	console.log($('#'+camObj.parentId+''));
	
	//The below code is responsible for pre-loading an image so that the whole image appears to load instantly
	//The '#preload_' element loads the image first, and then the jquery .load() function sets the source of the 
	//real image once it is completely loaded.
	$(img).load( null, function() { 
		console.log(camObj);
		console.log(camObj.style);
			$('#content').append('<div title="'+camObj.toolTip+'"class="imgCamContainer suppressHover hoverables" id="'+camObj.parentId+'"><img alt="1" style="visibility:hidden;" src=""></div>');

		$('#'+camObj.parentId).attr('style', camObj.style);
		$('#'+camObj.parentId).find('img').attr('src', updatedPath);
		$('#'+camObj.parentId).css('background-image', 'url('+updatedPath+')');
		
		//Allow dragging and resizing as well as a pop-out hover image
		camObj.setDrag();
		camObj.setResize();
		camObj.lastData = null;
		camObj.timerAppend();
		
		//if we are not in edit mode when loading, we want dragging and resizing to be disabled until
		//we enter edit mode.
		if(editMode == false){
			$('#'+camObj.parentId).draggable({disabled:true});
			$('#'+camObj.parentId).resizable({disabled:true});
		}
		else{
			$('#'+camObj.parentId).draggable({disabled:false});
			$('#'+camObj.parentId).resizable({disabled:false});
		}
		
		//if the loaded object states that it is hidden, we grant the new element the 'hide' class.
		if(camObj.hidden){
			$('#'+camObj.parentId).addClass('hide');
			console.log($('#'+camObj.parentId).attr('class'));
			if(editMode == false){
				$('#'+camObj.parentId).css('visibility','hidden');
			}
		}	
		
		//we locate the pageSettings element in our object array so that we can update its hashtable with
		//the path to our camera.
		var pageObjId = 'pageSettings';	
		var pageElementPos = cell_arr.map(function(x) {return x.id; }).indexOf(pageObjId);
		var pageObj= cell_arr[pageElementPos];
		var updatePath = camObj.path.split(".");

		updatePath.length = updatePath.length-1;
		updatePath = updatePath.join();
		updatePath = updatePath.replace(/\,/g,"/");
		if(SUBSCRIBE){
			pageObj.updateTable.push(updatePath);
			console.log(pageObj.updateTable);
			data_object.filters_set(pageObj.updateTable);

		}
		if(!pageObj.tableHasItem(camObj.path) || !pageObj.isTableItemCurrent(camObj.path,camObj.src)){
			//get size of image
			var image_size = ref(dataOld, camObj.path.replace('image_url','image_size'));
			if(typeof image_size === 'number'){
				cameraDataSize = cameraDataSize + image_size;
				console.log(cameraDataSize);
				
				//calculate the image size and upate the byte counter
				$('#bytesReceived').html(calculateDownload());
			}
		}
		//add the path to the hash table
		pageObj.addToTable(camObj.path, updatedPath);
		
		//if table does not already have this image or the current image src is not up to date, add this image to the hash table.
		camObj.setClickable(true);
		camObj.setHover(camObj.hoverable, camObj.hoverDelay);
		adjustDimensions(widthRatio, heightRatio, camObj);

	});
	
	//update src after .load is called
	//$('#preload_'+camId).attr('src', updatedPath);
	img.src = updatedPath;

}

//removes the cam and deletes it from teh array of objects so that it is not saved
pageCam.prototype.removeSelf = function(){
	console.log('REMOVED');
	
		var obj = this;
		var objId = obj.fullId;
		var elementPos = cell_arr.map(function(x) {return x.id; }).indexOf(objId);
		var objectFound = cell_arr[elementPos];
		cell_arr.splice(elementPos, 1);
		console.log(objId);
		$('.timerBlock').remove();
		$('#'+objId).remove();
		$('#preload_'+objId).remove();
		console.log(cell_arr);
		
		
	}

/***********************************************************************************
* IMG BLOCK OBJECT
************************************************************************************/
function pageImg(){
	this.setType('pageImg');
	this.natWidth;
	this.natHeight;
	this.width;
	this.height;
	this.id;
	this.parentId;
	this.src;
	this.hoverable = false;
	this.suppressed = true;
	this.style;

}
extend(pageImg,pageElement);

//function in charge of setting popout image behavior
pageImg.prototype.setHover = function(boolHover, hoverTime){
	var imgObj, imgId, radiobtn;
	imgObj = this;
	console.log(this);
	
	//clear old timeout
	clearTimeout(imgObj.timeOut);	
	imgId = imgObj.parentId;
	console.log(imgId);
	
	//if hovering is not enabled, return out of the function
	if(boolHover == false){
		console.log('false');
		imgObj.hoverable = false;
		$( '#'+imgId ).off("mouseenter mouseleave");
		$('#hoverTimeRow, #suppressHoverable').hide();		
		return;	
	}
	else{
		var suppressed, imgId, imgWidth, divWidth, imgHeight, isWebkit, hoverImgId, timeOut, hoverTimeOut, hoverImg, hoverImgLink;
		imgObj.hoverable = true;
		timeOut = hoverTime*1000;
		if($( "#"+imgId  ).hasClass('focusedCam')){
			$( "#"+imgId  ).find('.expandedCam, .webKitCam').attr('src',camObj.src);	
			return;
		}
		hoverImg = document.createElement('img');
		hoverImgLink = document.createElement('a');
		$('#hoverTimeRow, #suppressHoverable').show();	
		$( "#"+imgId  ).unbind("mouseenter mouseleave");
		$( "#"+imgId ).hover(function(){

			var imgSrc = imgObj.src;
			suppressed = false;
			imgWidth = parseInt(imgObj.natWidth);
			imgHeight = parseInt(imgObj.natHeight);
			divWidth = parseInt($('#'+imgId).css('width').slice(0,-2));
			isWebkit = 'WebkitAppearance' in document.documentElement.style;
			hoverImgId = imgId+'hover';

			if(imgWidth <= divWidth && imgObj.suppressed == true){
				suppressed = true;
			}

			if(editMode == false && suppressed == false){
				clearTimeout(imgObj.timeOut);	
				console.log(imgObj.timeOut);
				imgObj.timeOut = setTimeout(function() {
					console.log('time');
										hoverImg.id = hoverImgId;

					$('#'+hoverImgId).width(imgWidth);
					$('#'+hoverImgId).height(imgHeight);
					hoverImg.src = imgSrc;
					hoverImgLink.href = imgSrc;
					hoverImgLink.target = '_blank';
					hoverImgLink.appendChild(hoverImg);
					console.log(hoverImg);
					$('#'+imgId).append(hoverImgLink);
					$('#'+imgId).addClass('focusedCam');
					console.log($('#'+imgId).css('z-index'));
					$('#'+hoverImgId).css('visibility','visible');
					console.log($('#'+hoverImgId).parent().css('visibility'));
					if (isWebkit) {
						hoverImg.className = 'webKitCam';
						hoverImgLink.id = hoverImgId;
						var top = ''+$('#'+imgId).css('top');
						var left = ''+$('#'+imgId).css('left');
						$('#'+hoverImgId).css('position','absolute');
						$('#'+hoverImgId).css('left','50% ');
						$('#'+hoverImgId).css('top','50%');
						top = '-'+$('#'+imgId).css('top');
						left= '-'+$('#'+imgId).css('left');
						$('#'+hoverImgId).css({'-webkit-transform':'translate(calc(0% + '+left+'), calc(0% + '+top+')'});
						console.log(top);

					}
					else{
						hoverImg.className = 'expandedCam';
					}	
				}, timeOut); //end hoverTimeOut

			} //end if(editMode == false && suppressed == false)
		}, function () {
			if(editMode == false){	
				clearTimeout(imgObj.timeOut);
				$(hoverImgLink).remove();
				$('#'+imgId).removeClass('focusedCam');
			}
		}
	);} //end $('#'camId).hover(function()
}

pageImg.prototype.setSuppression = function(boolSuppress){
	this.suppressed = boolSuppress;
}

/*This method grabs the url from Edit URL input field in the edit menu - 
 * it then changes the src to that value
*/
pageImg.prototype.setSrc = function(){
	
	//capture 'this' so that we can use it in the load event below
	var objectFound = this;
	
	//reset the image size so we are working a clean slate with no defined height and width
	objectFound.resize();
	
	//create a temporary image so that we can pre-load the incoming image
	var tempImg = document.createElement('img');
	var selectedChild = this.id;
	var selectedModule = this.parentId;
	console.log(selectedModule);
	var url = $("#"+selectedModule).find('img');
	
	//wait for temporary image to load so we can set the src among other things
	$(tempImg).one('load', function() {
		//grab natural width and height of image so we can pull the image in at native size
		var width = tempImg.naturalWidth;
		var height = tempImg.naturalHeight;
		var newSrc = $('.urlChange').val();
		console.log(width+' '+height);
		
		url.attr('width',width);
		url.attr('height',height);
		$("#"+selectedChild).width(width);
		$("#"+selectedChild).height(height);
		$("#"+selectedModule).children('.ui-wrapper').css('width', width);
		$("#"+selectedModule).children('.ui-wrapper').css('height',height);
		$("#"+selectedModule).css('width', 'auto');
		$("#"+selectedModule).css('height','auto');
		$("#"+selectedModule).css('background-image', 'url('+newSrc+')');
		$("#"+selectedModule).css('background-repeat','no-repeat');
		url.attr('src', $('.urlChange').val());
		
		//now that image is loaded we can adjust all of the object properties accurately
		objectFound.src = $('.urlChange').val();
		objectFound.natHeight = height;
		objectFound.natWidth = width;
		objectFound.heightToSave = objectFound.getHeight();
		objectFound.widthToSave = objectFound.getWidth();
		objectFound.top = objectFound.getTop();
		objectFound.left = objectFound.getLeft();
	});
	//wait split second for paste of new url
	setTimeout(function () {
		//reset image attributes
		url.attr('width','0');
		url.attr('height','0');
		tempImg.src = $('.urlChange').val();
	}, 100); 
}

//this sets our cropped value and refreshes the style
pageImg.prototype.setCrop = function(boolCrop){
	if(boolCrop == true){
		var style = this.getStyle();
		this.setStyle(style);
		this.cropped = true;
	}
	else{
		var style = this.getStyle();
		this.setStyle(style);
		this.cropped = false;	
	}

}

//Large, ridiculous function for cropping - may have to be refactored some day
pageImg.prototype.imgCrop = function(){
	
	//capture 'this' in a variable so it can be used within the scopes below
	var thisObj = this;
	var thisElement = $("#"+thisObj.parentId);
	
	//hide the DOM element while we work on croppying
	thisElement.hide();
	var width, height, left, top, src, diffFromNatWidth, diffFromNatHeight, cropTop, cropLeft, cropWidth, cropHeight, originalWidth, originalHeight;
	
	//cropping situation if our camera has already been cropped
	if(thisObj.cropped == true){
		width = parseInt(thisObj.changedWidth);
		height = parseInt(thisObj.changedHeight);
		originalWidth = thisElement.css('width');
		originalHeight = thisElement.css('height');
		left = thisElement.css('left');
		top = thisElement.css('top');
		src = thisObj.src;		
		diffFromNatHeight = (height)/thisObj.natHeight;
		diffFromNatWidth = (width)/thisObj.natWidth;
		console.log(width+" "+thisObj.natWidth+" "+diffFromNatHeight);
		//disables controls
		$('.controlsOverlay').show();
		//creates a cropper window that is the size of the image that we are cropping
		$('#content').append('<div class="cropperWrapper"><img class="cropperWrapperImg" width="'+(width*diffFromNatWidth)+' " height="'+(height*diffFromNatHeight)+' "src="'+src+'"></div>');
		//sets the cropped postion to be maximum width and height and positioned in the top left corner
		$('.cropperWrapper').css({ "position":"absolute","top": top, "left": left, "width": width, "height": height });

		//set up the cropper configuration
		$('.cropperwrapper > img').cropper({
			dragCrop: true,
			scaleable: false,
			movable: false,
			modal: true,
			strict: false,
			zoomable: false,
			mouseWheelZoom: false,
			crop: function(e) {
					cropHeight =  Math.round(e.height);
					cropWidth =  Math.round(e.width);
					cropLeft =  Math.round(e.x);
					cropTop =  Math.round(e.y);
			},
			built: function () {
				var thisTop, thisLeft, thisWidth, thisHeight;
				var backgroundPos = thisElement.css('backgroundPosition').split(" ");
				thisTop = Math.abs(parseInt(backgroundPos[1]));
				thisLeft = Math.abs(parseInt(backgroundPos[0]));
				thisHeight = parseInt(originalHeight);
				thisWidth = parseInt(originalWidth);
				//case for when crop is not adjusted and finish is clicked
				cropWidth = thisWidth;
				cropHeight = thisHeight;
				cropLeft = thisLeft;
				cropTop = thisTop;
				$('.cropperwrapper > img').cropper("setCropBoxData", { width: thisWidth, height: thisHeight, left: thisLeft, top: thisTop });
			}
		});
	}
	//if cam has not been cropped yet
	else{
		width = thisElement.css('width');
		height = thisElement.css('height');
		left = thisElement.css('left');
		top = thisElement.css('top');
		src = thisObj.src;
		diffFromNatHeight = (height.slice(0,-2))/thisObj.natHeight;
		diffFromNatWidth = (width.slice(0,-2))/thisObj.natWidth;
		//disables controls
		$('.controlsOverlay').show();
		//creates a cropper window that is the size of the image that we are cropping
		$('#content').append('<div class="cropperWrapper"><img class="cropperWrapperImg" width="'+(width*diffFromNatWidth)+' " height="'+(height*diffFromNatHeight)+' "src="'+src+'"></div>');
		//sets the cropped postion to be maximum width and height and positioned in the top left corner
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
				cropHeight = Math.round(e.height);
				cropWidth = Math.round(e.width);
				cropLeft = Math.round(e.x);
				cropTop = Math.round(e.y);
			}
		});
	}	
	//event for finalizing the cropping
	$( document ).off( "click", "#endCrop"); //unbind old events, and bind a new one
	$( document ).on( "click", "#endCrop" , function() {
		$('#cropModule, #hideDelRow, #resizeModule, #hoverRow, #zRow, #hoverTimeRow, .editWindow, .controls').show();
		$('#endCrop, #cancelCrop, #cropDialog').hide();
		
		width = parseInt((width));
		height = parseInt((height));
		$('.cropperWrapper').remove();
		if(cropTop == 0 || cropLeft == 0){
			if(cropTop == 0){
				thisElement.css("background-position", "-"+(cropLeft*diffFromNatWidth)+"px "+((cropTop*diffFromNatHeight))+"px");
			}
			else if(cropLeft == 0){
				thisElement.css("background-position", ""+(cropLeft*diffFromNatWidth)+"px -"+(cropTop*diffFromNatHeight)+"px");
			}
			else if(cropLeft == 0 && cropTop ==0){
				thisElement.css("background-position", "-"+(cropLeft*diffFromNatWidth)+"px -"+(cropTop*diffFromNatHeight)+"px");
			}
		}
		else{
			thisElement.css("background-position", "-"+(cropLeft*diffFromNatWidth)+"px -"+(cropTop*diffFromNatHeight)+"px");
		}
		top = parseInt(top, 10);
		left = parseInt(left, 10);
		cropTop = parseInt(cropTop, 10);
		cropLeft = parseInt(cropLeft, 10);
		var topcrop = top;
		var leftcrop = left;
		var widthcrop = cropWidth*diffFromNatWidth;
		var heightcrop = cropHeight*diffFromNatHeight;
		//console.log(top+(cropTop*diffFromNatHeight)+" "+left+(cropLeft*diffFromNatWidth)+" "+cropWidth*diffFromNatWidth+" "+cropHeight*diffFromNatHeight)
		console.log(thisElement.css("background-position"));
		console.log(width+" "+diffFromNatWidth+" "+cropWidth+" "+widthcrop);
		thisElement.css({
			"top": topcrop,
			"left": leftcrop,
			"width": widthcrop+"px",
			"height": heightcrop+"px",
			"background-size": width+"px "+height+"px ",
			"overflow": "hidden"
		});
		$('.controlsOverlay').hide();				
		thisElement.resizable({disabled:true});
		thisObj.setCrop(true);
		thisElement.show();
	});
	//event for canceling the cropping
	$( document ).off( "click", "#cancelCrop"); //unbind old events, and bind a new one
	$( document ).on( "click", "#cancelCrop" , function() {
		thisElement.show();
		$('#cropModule, #hideDelRow, #resizeModule, #hoverRow, #zRow, #hoverTimeRow, .editWindow, .controls').show();
		$('#endCrop, #cancelCrop, #cropDialog').hide();
		$('.cropperWrapper').remove();
		$('.controlsOverlay').hide();
	});
	$('#masterEdit, .textBlockContainer, .imgBlockContainer, .imgCamContainer, .tr').one('click', function() {
		thisElement.show();
		$('#cropModule, #hideDelRow, #resizeModule, #hoverRow, #zRow, #hoverTimeRow, .editWindow, .controls').show();
		$('#endCrop, #cancelCrop, #cropDialog').hide();
		$('.cropperWrapper').remove();
		$('.controlsOverlay').hide();								
	});
}

//This function gets the current height
pageImg.prototype.getHeight = function(){
		return $("#"+this.parentId).height();
}

//This function gets the current width
pageImg.prototype.getWidth = function(){
		return $("#"+this.parentId).width();
}

//this function is applies the width value in the input field 
//under sizing options in the edit menu
pageImg.prototype.applyWidth = function(){
	var obj = this;
	var width = $("#manualWidth").val();
	var natHeight = obj.natHeight;
	var natWidth = obj.natWidth;
	var aspectRatio = natWidth/natHeight;
	var adjustedHeight = width/aspectRatio;
	$("#"+this.parentId).css("width",width+"px");
	$("#"+this.parentId).css("height",adjustedHeight+"px");

}

//this function is applies the height value in the input field 
//under sizing options in the edit menu
pageImg.prototype.applyHeight = function(){
	var obj = this;
	var height = $("#manualHeight").val();
	var natHeight = obj.natHeight;
	var natWidth = obj.natWidth;
	var aspectRatio = natHeight/natWidth;
	var adjustedWidth = height/aspectRatio;
	$("#"+this.parentId).css("height",height+"px");
	$("#"+this.parentId).css("width",adjustedWidth+"px");
	this.widthToSave = $('#'+this.parentId).width();
	this.heightToSave = $('#'+this.parentId).height();
}

//this function uses our object's property to set the width field
//under sizing options in the edit menu
pageImg.prototype.setWidthField = function(){
	var obj = this;
	var width = this.getWidth();
	$("#manualWidth").val(width);
}

//this function uses our object's property to set the height field
//under sizing options in the edit menu
pageImg.prototype.setHeightField = function(){
	var obj = this;
	var height = this.getHeight();
	$("#manualHeight").val(height);

}

//this function uses our object's property to set the height and Width fields
//under sizing options in the edit menu
pageImg.prototype.setWidthHeightFields = function(){
	var obj = this;
	var width = this.getWidth();
	var height = this.getHeight();
	$("#manualWidth").val(width);
	$("#manualHeight").val(height);
}

//resizes image back to original
pageImg.prototype.resize = function(){
	var width = this.natWidth;
	var height = this.natHeight;
	$("#"+this.id).css('width', width);
	$("#"+this.id).css('height',height);
	$("#"+this.parentId).css('width', width);
	$("#"+this.parentId).css('height',height);
	$("#"+this.parentId).css('background', 'url('+this.src+')');
	this.setCrop(false);
	this.width = width;
	this.height = height;
	$("#"+this.parentId).css("background-size","contain");
	$("#"+this.parentId).css("background-position","50% 50%");
	this.setResize();
	this.setDrag();
}

//sets up the jqueryUI resizing function used to resize the element
pageImg.prototype.setResize = function(){
	var handleTarget;
	var thisObj = this;		
	$('#'+thisObj.parentId).resizable({
		grid: [1,1], handles: 'all', aspectRatio: true, disabled: false,
		//function that executes when user starts resizing
		start: function(event, ui){
			//this event is for removing the title property during resizing
			$('#'+thisObj.parentId).off('mouseup');
				var title = thisObj.toolTip;
				$(this).removeAttr("title");			
				$('#'+thisObj.parentId).on('mouseup', function(e) {
					$('#'+thisObj.parentId).attr('title',title);	
				});
			var width = $('#'+thisObj.parentId).css('width');
			var height = $('#'+thisObj.parentId).css('height');
			var posSpan = document.createElement("SPAN"); 
			posSpan.id = 'resizeSpan';
			posSpan.textContent = "Width: "+width+"  Height: "+height+")";
			//creates an info box near the user's cursor that shows the current height and width
			$('#resizeSpan').css({
				top: event.clientY+5,
				left: event.clientX+5
			});
			$('#'+thisObj.parentId).append(posSpan);
			handleTarget = $(event.originalEvent.target);
		},
		//function that executes while element is being resized
		resize: function(event, ui){
			var width = $('#'+thisObj.parentId).css('width');
			var height = $('#'+thisObj.parentId).css('height');
			var top = $('#positionDiv').css('top');
			var left = $('#positionDiv').css('left');
			$('#resizeSpan').css({
				top: event.clientY+5,
				left: event.clientX+5
			}); 
			$('#resizeSpan').text("Width: "+width+"  Height: "+height+"");
		},
		//function that executes after finishes resizing
		stop: function(event, ui){
			$('#resizeSpan').remove();
			thisObj.onChangeStyle();
			var width = $('#'+thisObj.parentId).css('width');
			var height = $('#'+thisObj.parentId).css('height');
			thisObj.width = width;
			thisObj.height = height;
			thisObj.changedWidth = thisObj.width;
			thisObj.changedHeight = thisObj.height;
			thisObj.heightToSave = $('#'+thisObj.parentId).height();
			thisObj.widthToSave = $('#'+thisObj.parentId).width();
		}
	});	
}
//creates the html associated with this object
pageImg.prototype.createHtml = function(cellCount){
	$('.top-container').append('<div id="'+this.parentId+'" title="'+this.parentId+'" style="background-image: url(images/insert_image.svg)" class="imgBlockContainer"><div class="cam-drag-handle"></div><img class="imageInsert" width="320" height="240" id="'+this.id+'" alt="'+this.id+'" src="images/insert_image.svg"></img></div>');
	this.src = "images/insert_image.svg";	
	this.setDrag();
	this.setResize();
	this.count = cellCount;
	this.toolTip = this.parentId;
	$('#'+this.parentId).css('z-index',this.count);

}
//loads html associated with this object
pageImg.prototype.loadHtml = function(widthRatio, heightRatio){
	console.log('loadedImage');
	var objectFound = this;
	$('#content').append('<div id="'+this.parentId+'" title="'+this.parentId+'" class="imgBlockContainer"><div class="cam-drag-handle"></div><img class="imageInsert" width="'+this.width+'" height="'+this.height+'" id='+this.id+' alt='+this.id+' src="'+this.src+'"></img></div>');
	$('#'+this.id).load(function() {
		
		$('#'+objectFound.parentId).attr('style',objectFound.style);
		$('#'+objectFound.parentId).css("background-repeat", "no-repeat");
		
		//set hovering event
		objectFound.setSuppression(objectFound.suppressed);
		objectFound.setHover(objectFound.hoverable, objectFound.hoverDelay);
		
		//if the hidden property is set to true, the element must be hidden when we load it (depending on if we are in edit
		//mode or not)
		if(objectFound.hidden){
			$('#'+objectFound.parentId).addClass('hide');
			console.log($('#'+objectFound.parentId).attr('class'));
			if(editMode == false){
				$('#'+objectFound.parentId).css('visibility','hidden');
			}

		}	
		//adjusts dimensions of object to fit our current screen resolution
		adjustDimensions(widthRatio, heightRatio, objectFound);

	});

	objectFound.setDrag();
	objectFound.setResize();
	
	//disable dragging and reszing if we are not in edit mode
	if(editMode == false){
		$('#'+objectFound.parentId).draggable({disabled:true});
		$('#'+objectFound.parentId).resizable({disabled:true});
	}
	else{
		$('#'+objectFound.parentId).draggable({disabled:false});
		$('#'+objectFound.parentId).resizable({disabled:false});
	}
	
}
/***********************************************************************************
* TEXT BLOCK OBJECT
************************************************************************************/
function pageText(){
	this.setType('pageText');
	this.id;
	this.parentId;
	this.text;
	this.style;
}
extend(pageText,pageElement);

pageText.prototype.createHtml = function(cellCount){
	var textBlock, textTitle, textContent, title;
	var rand = Date.now();
	//create a div to hold the text
	textBlock = document.createElement("div");
	textBlock.className = "textBlockContainer";
	textContent = "sample text";
	this.text = textContent;
	//incremental ID attribute
	textBlock.id = "block"+cellCount+rand;
	textBlock.title = textBlock.id;
	
	this.toolTip = textBlock.title;
	this.id = "block"+cellCount+rand;
	this.parentId = "block"+cellCount+rand;
	//appends a textblock to the div with our default text
	$(textBlock).append('<p>'+textContent+'</p>');
	//appends the textblock to the page
	$('.top-container').append(textBlock);
	this.count = cellCount;
	this.setDrag();
	this.setResize();
	console.log(this);
	$('#'+this.parentId).css('z-index',this.count);

}

pageText.prototype.loadHtml = function(){
	var textBlock, textTitle, textContent, title;
	//create a div to hold the text
	textBlock = document.createElement("div");
	textBlock.className = "textBlockContainer";
	textContent = this.text;
	this.text = textContent;
	//incremental ID attribute
	textBlock.id = this.parentId;
	this.id = this.parentId;
	this.parentId = this.parentId;
	textBlock.title = textBlock.id;
	
	this.toolTip = textBlock.title;
	//appends a textblock to the div with our default text
	$(textBlock).append('<p>'+textContent+'</p>');
	//appends the textblock to the page
	$('#content').append(textBlock);
	$('#'+this.parentId).attr('style', this.style);
	this.setDrag();
	this.setResize();
	if(this.hidden){
		$('#'+this.parentId).addClass('hide');
		console.log($('#'+this.parentId).attr('class'));
		if(editMode == false){
			$('#'+this.parentId).css('visibility','hidden');
		}
	}	
	if(editMode == false){
		$('#'+this.parentId).draggable({disabled:true});
		$('#'+this.parentId).resizable({disabled:true});
	}
	else{
		$('#'+this.parentId).draggable({disabled:false});
		$('#'+this.parentId).resizable({disabled:false});
	}
}
pageText.prototype.fontSizeChange = function(size){
	if(size == ''){
		size =  8;	
	}
	size = size.trim();

	var containerId = this.parentId;
	$('#'+containerId).css('font-size', size+'px');
	var style = this.getStyle();
	this.setStyle(style);
}

pageText.prototype.fontColorChange = function(color){
	var containerId = this.parentId;
	$('#'+containerId).css('color', color);
	var style = this.getStyle();
	this.setStyle(style);
}
pageText.prototype.setResize = function(){
	var handleTarget;
	var thisObj = this;		
	$('#'+thisObj.parentId).resizable({
		grid: [1,1], handles: 'all', disabled: false,
		start: function(event, ui){
			$('#'+thisObj.parentId).off('mouseup');
			var title = thisObj.toolTip;
			$(this).removeAttr("title");			
			$('#'+thisObj.parentId).on('mouseup', function(e) {
				$('#'+thisObj.parentId).attr('title',title);	
			});
			var width = $('#'+thisObj.parentId).css('width');
			var height = $('#'+thisObj.parentId).css('height');
			var posSpan = document.createElement("SPAN"); 
			posSpan.id = 'resizeSpan';
			posSpan.textContent = "Width: "+width+"  Height: "+height+")";
			$('#resizeSpan').css({
				top: event.clientY+5,
				left: event.clientX+5
			});
			$('#'+thisObj.parentId).append(posSpan);
			handleTarget = $(event.originalEvent.target);
		},
		resize: function(event, ui){
			var width = $('#'+thisObj.parentId).css('width');
			var height = $('#'+thisObj.parentId).css('height');
			var top = $('#positionDiv').css('top');
			var left = $('#positionDiv').css('left');
			var newWidth, newHeight;
			
			
			var direction = $(event.target).data('ui-resizable').axis;
			if(direction == 'e' || direction == 'se' || direction == 's'){
				newWidth = (Math.floor(ui.size.width / thisObj.gridProps.size) * thisObj.gridProps.size);
				newHeight = (Math.floor(ui.size.height / thisObj.gridProps.size) * thisObj.gridProps.size);
				$('#'+thisObj.parentId).width(newWidth);
				$('#'+thisObj.parentId).height(newHeight);
			}
			else{
				
				var posTop = (Math.floor(ui.position.top / thisObj.gridProps.size) * thisObj.gridProps.size);
				var posLeft = (Math.floor(ui.position.left / thisObj.gridProps.size) * thisObj.gridProps.size);
				newWidth = (Math.ceil(ui.size.width / thisObj.gridProps.size) * thisObj.gridProps.size);
				newHeight = (Math.ceil(ui.size.height / thisObj.gridProps.size) * thisObj.gridProps.size);
				
				ui.position.top = posTop;
				ui.position.left = posLeft;
				$('#'+thisObj.parentId).css('top',posTop);
				$('#'+thisObj.parentId).css('left',posLeft);
				$('#'+thisObj.parentId).width(newWidth);
				$('#'+thisObj.parentId).height(newHeight);
				
			}
			
			$('#resizeSpan').css({
				top: event.clientY+5,
				left: event.clientX+5
			}); 
			$('#resizeSpan').text("Width: "+newWidth+"  Height: "+newHeight+"");
		},
		stop: function(event, ui){
			$('#resizeSpan').remove();
			thisObj.onChangeStyle();
			thisObj.heightToSave = thisObj.getHeight();
			thisObj.widthToSave = thisObj.getWidth();
		}
	});
}
pageText.prototype.backgroundColorChange = function(color){
	var containerId = this.parentId;
	$('#'+containerId).css('background-color', color);
	$('#opacitySlider .ui-slider-range').css('background', color );
  	$('#opacitySlider .ui-slider-handle').css('border-color', color);
	var style = this.getStyle();
	this.setStyle(style);
}

pageText.prototype.setText = function(text){
	//allows line breaks and consecutive spaces but also replaces "<" with the entity to remove possibility of script injection
	text = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "").replace(/\n/g,  "<br>");
	$('#'+this.parentId).children('p').html(text);
	this.text = text;
}

pageText.prototype.setOpacity = function(opacity, selectedModule, ui){
	var thisObj = this;
	var containerId = this.parentId;	
	opacity = opacity.toString();
	var newColor;
	if($('#'+selectedModule).css('background-color').indexOf("rgba") < 0){
		newColor = $('#'+selectedModule).css('background-color').replace(')', ', '+(Math.round((ui.value))*.01).toFixed(2)+')').replace('rgb', 'rgba');
	}
	else{
		var currentColor = $('#'+selectedModule).css('background-color');
		var splitColor = currentColor.split(',');
		newColor = splitColor[0] + "," + splitColor[1] + "," + splitColor[2] + "," + (Math.round(ui.value)*.01).toFixed(2) + ')';
		$('#opacityPercent').text(' '+ui.value+'%');
	}
	$('#'+selectedModule).css('background-color', newColor);
	$('.backgroundColorChange').val(''+newColor);
	$('#opacitySlider .ui-slider-range').css('background', newColor );
	$('#opacitySlider .ui-slider-handle').css('border-color', newColor);
	
	var style = this.getStyle();
	this.setStyle(style);
}