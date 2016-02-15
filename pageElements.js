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
			cell_arr.splice(elementPos, 1);	
			console.log(cell_arr);
		}	
	},
	setZindex: function(id, zIndex){
		$('#'+id).css('z-index', zIndex ); 
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
		
		$('#'+this.parentId).draggable({
			cursor: "move", disabled: false, delay: 50,
			start: function(event, ui){
				//collapses windows when dragging
				if(isExpanded){
					collapseWindows();
				}
				var posLeft = ui.position.left;
				var posTop = ui.position.top;
				var posSpan = document.createElement("SPAN"); 
				var posDiv = document.createElement("DIV");
				posDiv.id = 'positionDiv';
				$(this).append(posDiv);
				console.log($(this));
				posSpan.textContent = "("+posLeft+", "+posTop+")";
				posSpan.id = 'positionSpan';
				$('#positionDiv').append('<i class="fa fa-long-arrow-down fa-rotate-320"></i>');
				$('#positionDiv').append(posSpan);
				$('#rulerBox, #rulerBox2, #rulerBox3').show();
			},
			drag: function(event, ui){
				var posTop = (Math.floor(ui.position.top / thisObj.gridProps.size) * thisObj.gridProps.size);
				var posLeft = (Math.floor(ui.position.left / thisObj.gridProps.size) * thisObj.gridProps.size);
				ui.position.top = posTop;
				ui.position.left = posLeft;
				
				$('#positionSpan').text("("+posLeft+", "+posTop+")");
				var width = posLeft+'px';	
				var height = posTop+'px';
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
				$('#resizeSpan').css({
					top: event.clientY+5,
					left: event.clientX+5
				}); 
				$('#resizeSpan').text("Width: "+width+"  Height: "+height+"");
			},
			stop: function(event, ui){
				$('#resizeSpan').remove();
				thisObj.onChangeStyle();
				thisObj.changedWidth = $('#'+thisObj.parentId).css('width');
				thisObj.changedHeight = $('#'+thisObj.parentId).css('height');
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
		$('#'+objId).remove();
		console.log(cell_arr);
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
	setWidthHeightFields: function(){
		var obj = this;
		var width = this.getWidth();
		var height = this.getHeight();
		$("#manualWidth").val(width);
		$("#manualHeight").val(height);
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
}
extend(pageSettings, pageElement);

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

pageSettings.prototype.createGrid = function createGrid(size) {
    var i,
    sel = $('.top-container'),
        height = sel.height(),
        width = sel.width(),
        ratioW = Math.floor(width / size),
        ratioH = Math.floor(height / size);
	
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
	this.units;
	this.label;
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
	this.interval = 1; //in seconds
}
extend(pageLog, pageElement);

pageLog.prototype.createHtml = function(cellCount, currentData, pageX, pageY){
		var logId = this.parentId;

	$('.top-container').append('<div id="'+logId+'"class="dataLog"><h2> Log: </h2><div class="logContainer"><ol></ol></div></div>');
	console.log(logId);
	$('#'+logId).css('top',pageY);
	$('#'+logId).css('left',pageX);
	this.setDrag();
	this.setResize();
	this.count = cellCount;	
}
pageLog.prototype.loadHtml = function(){
	
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
pageLog.prototype.checkInterval = function(time){
	if(this.tail == null){
		return true;	
	}
	var oldTime = this.tail.timeStamp;
	var difference = time-oldTime;
	if(difference >= this.interval){
		return true;
	}
	else{
		return false;	
	}
};
//creates a logEntry object and inserts it into the queue
pageLog.prototype.push = function(time, currentData){
	//console.log(this.tail);
	if( this.tail == null || this.tail.timeStamp != time){
		var node = new logEntry();
		//case for a non-empty list
		if (this._length) {
			//removes first entry if the loglimit is reached
			if(this._length >= this.logLimit){
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
		node.timeStamp = time;
		this._length++;

	} else {
		console.log('duplicate');	
	}
};

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
			var id = currentNode.timeStamp;
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
pageLog.prototype.setResize = function(){
	var handleTarget;
	var thisObj = this;		
	$('#'+thisObj.parentId).resizable({
		grid: [1,1], handles: 'all', disabled: false,
		start: function(event, ui){
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
			$('#resizeSpan').css({
				top: event.clientY+5,
				left: event.clientX+5
			}); 
			$('#resizeSpan').text("Width: "+width+"  Height: "+height+"");
		},
		stop: function(event, ui){
			$('#resizeSpan').remove();
			thisObj.onChangeStyle();
		}
	});
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

pageCell.prototype.setPrecision = function(value){
	//need "||" because javascript interperets an empty string as zero
	if(isNaN(value) || value == '' || parseInt(value) > 19){
		this.precision = 0;
	}
	else{
		this.precision = value;
	}
	console.log(this);
}

pageCell.prototype.setTypeChange = function(type){
	this.typeChange = type;
}

pageCell.prototype.fontColorChange = function(color){
	var containerId = this.fullId;
	$('#'+containerId).closest('.tr').css('color', color+'');
	var style = this.getStyle();
	this.setStyle(style);
}

pageCell.prototype.backgroundColorChange = function(color){
	var containerId = this.fullId;
	$('#'+containerId).closest('.tr').css('background-color', color);
	$('#opacitySlider .ui-slider-range').css('background', color );
  	$('#opacitySlider .ui-slider-handle').css('border-color', color);
	var style = this.getStyle();
	this.setStyle(style);
}

pageCell.prototype.fontSizeChange = function(size){
	var containerId = this.fullId;
	size = size.trim();
	$('#'+containerId).closest('.tr').css('font-size', size+'px');
	var style = this.getStyle();
	this.setStyle(style);
}

pageCell.prototype.setTitle = function(text){
	var containerId = this.fullId;
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

pageCell.prototype.setLabel = function(text){
	var containerId = this.fullId;	
	console.log($('#'+containerId).find('.label').text());
	if(this.hasOwnProperty('labelOverride') && this.labelOverride == true){

	}
	else{
		$('#'+containerId).find('.label').text(text);
		this.label = text;
	}
	//this.units = text;
}
pageCell.prototype.setLabelOverride = function(value){
	this.labelOverride = value;
}
pageCell.prototype.setOpacity = function(opacity, selectedModule, ui) {
	var containerId = this.fullId;	
	opacity = opacity.toString();
	var newColor;
	if($('#'+selectedModule).css('background-color').indexOf("rgba") < 0){
		console.log(ui.value);
		newColor = $('#'+selectedModule).css('background-color').replace(')', ', '+(Math.round(ui.value)*.01).toFixed(2)+')').replace('rgb', 'rgba');
	}
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
pageCell.prototype.setResize = function(){
	var handleTarget;
	var thisObj = this;		
	$('#'+thisObj.parentId).resizable({
		grid: [1,1], handles: 'all', disabled: false,
		start: function(event, ui){
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
			$('#resizeSpan').css({
				top: event.clientY+5,
				left: event.clientX+5
			}); 
			$('#resizeSpan').text("Width: "+width+"  Height: "+height+"");
		},
		stop: function(event, ui){
			$('#resizeSpan').remove();
			thisObj.onChangeStyle();
		}
	});
}
pageCell.prototype.createHtml = function(cellCount, currentData, pageX, pageY){
	
	$('.top-container').append('<div title="'+this.toolTip+'" class="tr draggable" id="' + this.parentId + '"><div class="td myTableID"> ID: <span>' + this.title + '</span> </div><div class="td myTableTitle"><p class="titleText">' + this.title + '</p></div><div class="td myTableValue" id="' + this.fullId + '"><p>'+currentData+'</p><span class="path">'+ this.path +'</span><span class="label"> '+ this.units +'</span></div></div>');
	var cellId = this.parentId;
	$('#'+cellId).css('top',pageY);
	$('#'+cellId).css('left',pageX);
	this.setDrag();
	this.setResize();
	this.count = cellCount;
}

pageCell.prototype.loadHtml = function(cellCount){
	var updatedPath = ref(dataOld, this.path);
	var result;
	var label = this.label;
	if(typeof label === 'undefined'){
		label = this.units	
	}
	if(typeof updatedPath == 'string'){
		this.dataType = 'string';	
	}
	else{
		this.dataType = 'number';	
	}
	console.log(this.path);
	console.log(updatedPath);
	console.log(this.dataType);
	if(this.dataType !== 'string'){
		if(updatedPath !== 'undefined'){
			console.log(this.typeUnits+" "+this.typeChange+" "+updatedPath+" "+this.precision);
			if(typeof this.typeUnits !== 'undefined' && typeof this.typeChange !== 'undefined' && (this.typeUnits.toUpperCase() !== this.typeChange.toUpperCase())){
				console.log(this.title);
				console.log(this.typeUnits+" "+this.typeChange);
				console.log(updatedPath);
				console.log(this.type);
				console.log(this.typeChange);
				result = chooseConversion(this.type, this.typeUnits.toUpperCase(), updatedPath, this.typeChange.toUpperCase());	
				updatedPath = result.value;
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
	if(editMode == false){
		$('#'+this.parentId).draggable({disabled:true});
		$('#'+this.parentId).resizable({disabled:true});
	}
	else{
		$('#'+this.parentId).draggable({disabled:false});
		$('#'+this.parentId).resizable({disabled:false});
	}

}

/***********************************************************************************
* CAMERA OBJECT
************************************************************************************/
var pageCam = function(){
	this.setType('pageCam');
	this.hoverable;
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
		camObj.hoverable = false;
		$( '#'+camId ).off("mouseenter mouseleave");
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
		$( "#"+camId  ).unbind("mouseenter mouseleave");
		$( "#"+camId ).hover(function(){
			var camSrc = camObj.src;
			console.log(camObj.src);
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
					hoverImg.src = camSrc;
					
					hoverImgLink.href = camSrc;
					hoverImgLink.target = '_blank';
					hoverImgLink.appendChild(hoverImg);
					console.log(hoverImg);
					$('#'+camId).append(hoverImgLink);
					$('#'+camId).addClass('focusedCam');
					//Since Chrome and Safari like to mess things up, we need a separate class with extra math for those browsers
					if (isWebkit) {
						hoverImg.className = 'webKitCam';
						hoverImgLink.id = hoverImgId;
						var top = ''+$('#'+camId).css('top');
						var left = ''+$('#'+camId).css('left');
						$('#'+hoverImgId).css('position','fixed');
						$('#'+hoverImgId).css('left','5% ');
						$('#'+hoverImgId).css('top','5%');
						var widthoffset = 0;
						var heightoffset = 0;
						
						//calculate distance from original cam image to sides of viewport
						var scrollTop     = $(window).scrollTop(),
							elementOffsetTop = $('#'+camId).offset().top,
							distanceTop      = (elementOffsetTop - scrollTop);
						var scrollLeft     = $(window).scrollLeft(),
							elementOffsetLeft = $('#'+camId).offset().left,
							distanceLeft      = (elementOffsetLeft - scrollLeft);
						if(distanceLeft < 0){
							distanceLeft = Math.abs(distanceLeft);
						}
						else{
							distanceLeft = distanceLeft*-1;
						}
						if(distanceTop < 0 ){
							distanceTop = Math.abs(distanceTop);	
						}
						else{
							distanceTop = distanceTop*-1;
						}
						top = '-'+$('#'+camId).css('top');
						left= '-'+$('#'+camId).css('left');
						
						/*detects if camera is bigger than the viewport in either width or height
						* This changes where the cam is positioned so that the hover cam does not
						* go off-screen
						*/
						if(window.innerWidth-camWidth < 0 || window.innerHeight-camHeight < 0){
							
							$('#'+hoverImgId).css({'top':''+distanceTop+'','left':''+distanceLeft+''});
							console.log(scrollLeft+" "+elementOffsetLeft+" "+distanceLeft);

						}
						else{
							
							//$('#'+hoverImgId).css({'-webkit-transform':'translate(calc(0% + '+left+' + '+scrollLeft+'px - '+widthoffset+'px), calc(0% + '+top+' + '+scrollTop+'px - '+heightoffset+'px)'});
							$('#'+hoverImgId).css({'-webkit-transform':'translate(calc(0% + '+distanceLeft+'px), calc(0% + '+distanceTop+'px)'});
						}
						console.log(top);

					}
					else{
						hoverImg.className = 'expandedCam';
					}	
				}, timeOut); //end hoverTimeOut
			} //end if(editMode == false && suppressed == false)
		}, function () {
			if(editMode == false){	
				clearTimeout(camObj.timeOut);
				$(hoverImg).remove();
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
pageCam.prototype.getWidth = function(){
	return this.natWidth;
}

//gets the natural height of the image
pageCam.prototype.getHeight = function(){
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
pageCam.prototype.camCrop = function(){
	var thisObj = this;
	var thisElement = $("#"+thisObj.parentId);
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
		console.log(height+" "+thisObj.natHeight+" "+diffFromNatHeight);
		//disables controls
		$('.controlsOverlay').show();
		//creates a cropper window that is the size of the image that we are cropping
		$('#content').append('<div class="cropperWrapper"><img class="cropperWrapperImg" width="'+(width*diffFromNatWidth)+' " height="'+(height*diffFromNatHeight)+' "src="'+src+'"></div>');
		//sets the cropped postion to be maximum width and height and positioned in the top left corner
		$('.cropperWrapper').css({ "position":"absolute","top": top, "left": left, "width": width, "height": height });

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
		console.log(thisObj.natWidth+" "+width.slice(0,-2)+" "+width);
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
//creates element
pageCam.prototype.createHtml = function(cellCount, value, pageX, pageY){
	var camId = this.fullId;
	var camObj = this;
	console.log(camId);
	$('#preload').append('<img alt="camimage" src="" id="preload_'+camId+'" >');
	$('.top-container').append('<div title="'+camObj.toolTip+'"class="imgCamContainer suppressHover hoverables" id='+camId+' style=""><img alt="1" style="visibility:hidden;" src="'+value+'"></div>');
	camObj.setResize();
		camObj.setDrag();
	$('#'+camId).css('position', 'absolute');
	$('#'+camId).css('display','inline-block');	
	$('#'+camId).css('top',pageY);
	$('#'+camId).css('left',pageX);
	$('#preload_'+camId).load(function() {
				console.log('loaded - we should call setNatDimensions now');

		var src = $(this).attr("src");
		$('#'+camId).css('background-image','url('+value+')');
		console.log('test');
		camObj.hoverable = true;
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
		cell_arr.push(camObj);

	});	
	$('#preload_'+camId).attr('src', value);
}
pageCam.prototype.loadHtml = function(){
	console.log(this.style);
	var camId = this.fullId;
	var camObj = this;
	console.log(this.path);
	console.log(dataOld);
	var updatedPath = ref(dataOld, this.path);
	camObj.src = updatedPath;
	console.log(updatedPath);
	$('#preload').append('<img alt="camimage" src="" id="preload_'+this.fullId+'" >');
	$('#preload_'+camId).load(function() {
		$('#content').append('<div title="'+camObj.toolTip+'"class="imgCamContainer suppressHover hoverables" id="'+camObj.parentId+'"><img alt="1" style="visibility:hidden;" src="'+updatedPath+'"></div>');
		$('#'+camObj.parentId).attr('style', camObj.style);
		console.log(camObj.style);
		$('#'+camObj.parentId).css('background-image', 'url('+updatedPath+')');
		console.log($('#'+camObj.parentId).attr('src'));
		camObj.setDrag();
		camObj.setResize();
		camObj.setHover(camObj.hoverable, camObj.hoverDelay);
		if(editMode == false){
			$('#'+camObj.parentId).draggable({disabled:true});
			$('#'+camObj.parentId).resizable({disabled:true});
		}
		else{
			$('#'+camObj.parentId).draggable({disabled:false});
			$('#'+camObj.parentId).resizable({disabled:false});
		}
		//cell_arr.push(camObj);

	});
	$('#preload_'+camId).attr('src', updatedPath);

}

pageCam.prototype.removeSelf = function(){
	console.log('REMOVED');
		var obj = this;
		var objId = obj.parentId;
		var elementPos = cell_arr.map(function(x) {return x.id; }).indexOf(objId);
		var objectFound = cell_arr[elementPos];
		cell_arr.splice(elementPos, 1);
		console.log(objId);
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

pageImg.prototype.setHover = function(boolHover, hoverTime){
	var imgObj, imgId, radiobtn;
	imgObj = this;
	console.log(this);
	clearTimeout(imgObj.timeOut);	
	imgId = imgObj.parentId;
	console.log(imgId);
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

pageImg.prototype.setSrc = function(){
	var objectFound = this;
	objectFound.resize();
	var tempImg = document.createElement('img');
	var selectedChild = this.id;
	var selectedModule = this.parentId;
	console.log(selectedModule);
	var url = $("#"+selectedModule).find('img');
	$(tempImg).one('load', function() {
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
		url.attr('src', $('.urlChange').val());
		objectFound.src = $('.urlChange').val();
		objectFound.natHeight = height;
		objectFound.natWidth = width;
		objectFound.changedHeight = objectFound.natHeight;
		objectFound.changedWidth = objectFound.natWidth;
	});
	//wait split second for paste of new url
	setTimeout(function () {
		//reset image attributes
		url.attr('width','0');
		url.attr('height','0');
		tempImg.src = $('.urlChange').val();
	}, 100); 
}

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


pageImg.prototype.imgCrop = function(){
	var thisObj = this;
	var thisElement = $("#"+thisObj.parentId);
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

pageImg.prototype.setResize = function(){
	var handleTarget;
	var thisObj = this;		
	$('#'+thisObj.parentId).resizable({
		grid: [1,1], handles: 'all', aspectRatio: true, disabled: false,
		start: function(event, ui){
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
			$('#resizeSpan').css({
				top: event.clientY+5,
				left: event.clientX+5
			}); 
			$('#resizeSpan').text("Width: "+width+"  Height: "+height+"");
		},
		stop: function(event, ui){
			$('#resizeSpan').remove();
			thisObj.onChangeStyle();
			var width = $('#'+thisObj.parentId).css('width');
			var height = $('#'+thisObj.parentId).css('height');
			thisObj.width = width;
			thisObj.height = height;
			thisObj.changedWidth = thisObj.width;
			thisObj.changedHeight = thisObj.height;
		}
	});	
}
pageImg.prototype.createHtml = function(cellCount){
	$('.top-container').append('<div id="'+this.parentId+'" style="background-image: url(images/insert_image.svg)" class="imgBlockContainer"><div class="cam-drag-handle"></div><img class="imageInsert" width="320" height="240" id="'+this.id+'" alt="'+this.id+'" src="images/insert_image.svg"></img></div>');
	this.src = "images/insert_image.svg";	
	this.setDrag();
	this.setResize();
	this.count = cellCount;

}
pageImg.prototype.loadHtml = function(){
	console.log('loadedImage');
	var objectFound = this;
	$('#content').append('<div id="'+this.parentId+'" style="background-image: url('+objectFound.src+')" class="imgBlockContainer"><div class="cam-drag-handle"></div><img class="imageInsert" width="'+this.width+'" height="'+this.height+'" id='+this.id+' alt='+this.id+' src="'+this.src+'"></img></div>');
	$('#'+this.id).load(function() {
		$('#'+objectFound.parentId).attr('style',objectFound.style);
		objectFound.setSuppression(objectFound.suppressed);
		objectFound.setHover(objectFound.hoverable, objectFound.hoverDelay);
	});
	objectFound.setDrag();
	objectFound.setResize();
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
	this.id = "block"+cellCount+rand;
	this.parentId = "block"+cellCount+rand;
	//appends a textblock to the div with our default text
	$(textBlock).append('<p>'+textContent+'</p>');
	//appends the textblock to the page
	$('.top-container').append(textBlock);
	this.count = cellCount;
	this.setDrag();
	this.setResize();
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
	//appends a textblock to the div with our default text
	$(textBlock).append('<p>'+textContent+'</p>');
	//appends the textblock to the page
	$('#content').append(textBlock);
	$('#'+this.parentId).attr('style', this.style);
	this.setDrag();
	this.setResize();
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
			$('#resizeSpan').css({
				top: event.clientY+5,
				left: event.clientX+5
			}); 
			$('#resizeSpan').text("Width: "+width+"  Height: "+height+"");
		},
		stop: function(event, ui){
			$('#resizeSpan').remove();
			thisObj.onChangeStyle();
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