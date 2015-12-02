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
	//sets type of element to be a data cell, image block, textblock, camera, etc.
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
	setDrag: function() {
		console.log(this.parentId);
		var thisObj = this;
		
		$('#'+this.parentId).draggable({
			cursor: "move", disabled: false,
			start: function(event, ui){
				$('.controls').animate({width: '10px'},100);
				$('.editWindow').animate({width: '0px', margin:'0', padding: '0'},50);
				$('.controlRow, .controls h2').hide();
				
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
					width: "-moz-calc(100% - "+width+")", /* Firefox */
					width: "-webkit-calc(100% - "+width+")", /* Chrome, Safari */
					width: "calc(100% - "+width+")", /* IE9+ and future browsers */
				});
				$('#rulerBox3').css({
					top: height,
					width: width,
					height: "-moz-calc(100% - "+height+")", /* Firefox */
					height: "-webkit-calc(100% - "+height+")", /* Chrome, Safari */
					height: "calc(100% - "+height+")", /* IE9+ and future browsers */
				});

			},
			stop: function(event, ui){
				$('.controls').animate({width: '250px'},200);
				$('.editWindow').animate({width: '280px',padding: '20px'},200);
				$('.controlRow, .controls h2').show();
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
			}
		});
	}
}
/***********************************************************************************
* PAGE SETTINGS OBJECT
************************************************************************************/
var pageSettings = function() {
	this.setType('pageSettings');
	this.backgroundColor;
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
            'width': 1,
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
            'height': 1
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
	if(isNaN(value) || value == ''){
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
	$('#'+containerId).closest('.tr').css('font-size', size);
	var style = this.getStyle();
	this.setStyle(style);
}
pageCell.prototype.fontPlusMinus = function(direction){
	var containerId = this.fullId;
	var size = $('#'+containerId).closest('.tr').css('font-size');
	if(direction == 'plus'){
		size = size.replace("px",'');
		size = (parseInt(size)+1).toString();
		$('#fontSize').val(size);
		size = size+"px";
		$('#'+containerId).closest('.tr').css('font-size', size+"px");
	}
	else{
		size = size.replace("px",'');
		size = (parseInt(size)-1).toString();
		$('#fontSize').val(size);
		size = size+"px";
		$('#'+containerId).closest('.tr').css('font-size', size);
	}	
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
	$('#'+containerId).children('.label').text(text);
	this.label = text;
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
	$('.top-container').append('<div title="'+this.toolTip+'" class="tr draggable" id="cell' + cellCount + '"><div class="td myTableID"> ID: <span>' + this.title + '</span> </div><div class="td myTableTitle"><p class="titleText">' + this.title + '</p></div><div class="td myTableValue" id="' + this.fullId + '"><p>'+currentData+'</p><span class="path">'+ this.path +'</span><span class="label"> '+ this.units +'</span></div></div>');
	var cellId = this.parentId;
	console.log(pageX+", "+ pageY +" HAHAHAHHAHAHAA" +cellId );
	$('#'+cellId).css('top',pageY);
	$('#'+cellId).css('left',pageX);
	this.setDrag();
	this.setResize();
	this.count = cellCount;
}

pageCell.prototype.loadHtml = function(cellCount){
	$('.top-container').append('<div style="'+this.style+'" title="'+this.toolTip+'" class="tr draggable" id="'+ this.parentId + '"><div class="td myTableID"> ID: <span>' + this.title + '</span> </div><div class="td myTableTitle"><p class="titleText">' + this.title + '</p></div><div class="td myTableValue" id="' + this.fullId + '"><p>Loading...</p><span class="path">'+ this.path +'</span><span class="label"> '+ this.units +'</span></div></div>');
	this.setDrag();
	this.setResize();
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
	console.log(this);
	clearTimeout(camObj.timeOut);	
	camId = camObj.containerId;
	console.log(camId);
	if(boolHover == false){
		console.log('false');
		camObj.hoverable = false;
		$( '#'+camId ).off("mouseenter mouseleave");
		$('#hoverTimeRow, #suppressHoverable').hide();		
		return;	
	}
	else{
		var suppressed, camId, camWidth, divWidth, camHeight, isWebkit, hoverImgId, timeOut, hoverTimeOut, hoverImg, hoverImgLink;
		camObj.hoverable = true;
		timeOut = hoverTime*1000;
		hoverImg = document.createElement('img');
		hoverImgLink = document.createElement('a');
		$('#hoverTimeRow, #suppressHoverable').show();	
		$( "#"+camId  ).unbind("mouseenter mouseleave");
		$( "#"+camId ).hover(function(){

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
				console.log(camObj.timeOut);
			camObj.timeOut = setTimeout(function() {
				camObj.test = 'test';
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
				if (isWebkit) {
					hoverImg.className = 'webKitCam';
					hoverImgLink.id = hoverImgId;
					var top = ''+$('#'+camId).css('top');
					var left = ''+$('#'+camId).css('left');
					$('#'+hoverImgId).css('position','absolute');
					$('#'+hoverImgId).css('left','50% ');
					$('#'+hoverImgId).css('top','50%');
					top = '-'+$('#'+camId).css('top');
					left= '-'+$('#'+camId).css('left');
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
				clearTimeout(camObj.timeOut);
				$(hoverImg).remove();
				$('.imgCamContainer').removeClass('focusedCam');
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
	this.natHeight = height;
	this.natWidth = width;
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
//creates element
pageCam.prototype.createHtml = function(cellCount, value, pageX, pageY){
	var camId = this.fullId;
	var camObj = this;
	console.log(camId);
	$('#preload').append('<img alt="camimage" src="" id="preload_'+this.fullId+'" >');
	$('#preload_'+camId).load(function() {
		var src = $(this).attr("src");
		$('#content').append('<div title="'+camObj.toolTip+'"class="imgCamContainer suppressHover hoverables" id='+camId+' style="background-image:url('+value+')"><img alt="1" style="visibility:hidden;" src="'+value+'"></div>');
		$('#'+camId).css('position', 'absolute');
		$('#'+camId).css('display','inline-block');
		$('#'+camId).css('top',pageY);
		$('#'+camId).css('left',pageX);
		camObj.setResize();
		camObj.setDrag();
		camObj.hoverable = true;
		camObj.suppressed = true;
		camObj.hoverDelay = 1;
		camObj.setHover(camObj.hoverable, camObj.hoverDelay);
		camObj.cropped = false;	
		camObj.count = cellCount;
		var currentMode = editMode
		var width = $('#'+camId).children('img').width();
		var height = $('#'+camId).children('img').height();	
		var hov = true;
		var delay = 1;
		camObj.setNaturalDimensions(height, width);
		
	});	
	$('#preload_'+camId).attr('src', value);
}

pageCam.prototype.loadHtml = function(){
	console.log(this.style);
	var camId = this.fullId;
	var camObj = this;
	$('#preload').append('<img alt="camimage" src="" id="preload_'+this.fullId+'" >');
	$('#preload_'+camId).load(function() {
		$('#content').append('<div title="'+camObj.toolTip+'"class="imgCamContainer suppressHover hoverables" id="'+camObj.parentId+'"><img alt="1" style="visibility:hidden;" src="'+camObj.src+'"></div>');
		$('#'+camObj.parentId).attr('style', camObj.style);
		camObj.setDrag();
		camObj.setResize();
		camObj.setHover(camObj.hoverable, camObj.hoverDelay);
		$('#'+camObj.parentId).draggable({disabled:true});
		$('#'+camObj.parentId).resizable({disabled:true});
	});
	$('#preload_'+camId).attr('src', this.src);

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

pageImg.prototype.setHover = function(){
 //stub for hover function	
}

pageImg.prototype.setHoverTime = function(){
 //stub for hover function	
}

pageImg.prototype.setSrc = function(){
	var tempImg = document.createElement('img');
	var selectedModule = this.parentId;
	var url = $("#"+selectedModule).find('img');
	$(tempImg).load(function() {
		var width = tempImg.naturalWidth;
		console.log(width);
		var height = tempImg.naturalHeight;
		url.attr('width',width);
		url.attr('height',height);
		$("#"+selectedModule).css('width', width);
		$("#"+selectedModule).css('height',height);
		$("#"+selectedModule).parent().css('width', width);
		$("#"+selectedModule).parent().css('height',height);
		url.attr('src', src);
		this.src = src;
	});
	//wait split second for paste of new url
	setTimeout(function () {
		//reset image attributes
		url.attr('width','0');
		url.attr('height','0');
		tempImg.src = urlChange.val();
	}, 100); 
}

pageImg.prototype.resize = function(){
	var width = this.natWidth;
	var height = this.natHeight;
	$("#"+this.id).css('width', width);
	$("#"+this.id).css('height',height);
	$("#"+this.parentId).css('width', width);
	$("#"+this.parentId).css('height',height);
	
	this.width = width;
	this.height = height;
}

pageImg.prototype.setResize = function(){
	var handleTarget;
	var thisObj = this;		
	$('#'+thisObj.id).resizable({
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
		}
	});	
}
pageImg.prototype.createHtml = function(cellCount){
	$('#content').append('<div id=img'+cellCount+'container class="imgBlockContainer"><div class="cam-drag-handle"></div><img class="imageInsert" width="320" height="240" onerror="brokenImg(img'+cellCount+')" id=img'+cellCount+' alt=img'+cellCount+' src="images/insert_image.svg"></img></div>');
	this.src = "images/insert_image.svg";	
	console.log('eh');
	this.setDrag();
	this.setResize();
}
pageImg.prototype.loadHtml = function(){
	$('#content').append('<div id=img'+this.parentId+'container class="imgBlockContainer"><div class="cam-drag-handle"></div><img class="imageInsert" width="320" height="240" onerror="brokenImg(img'+this.parentId+')" id=img'+this.parentId+' alt=img'+this.parentId+' src="images/insert_image.svg"></img></div>');
	this.src = "images/insert_image.svg";	
	this.setDrag();
	this.setResize();
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
	
	//create a div to hold the text
	textBlock = document.createElement("div");
	textBlock.className = "textBlockContainer";
	textContent = "Click to change text";
	this.text = textContent;
	//incremental ID attribute
	textBlock.id = "block"+cellCount;
	this.id = "block"+cellCount;
	this.parentId = "block"+cellCount;
	//appends a textblock to the div with our default text
	$(textBlock).append('<p>'+textContent+'</p>');
	//appends the textblock to the page
	$('#content').append(textBlock);
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
}
pageText.prototype.fontSizeChange = function(size){
	if(size == ''){
		size =  12;	
	}
	var containerId = this.parentId;
	$('#'+containerId).css('font-size', size+"px");
	var style = this.getStyle();
	this.setStyle(style);
}

pageText.prototype.fontPlusMinus = function(direction){
	var containerId = this.parentId;
	var size = $('#'+containerId).css('font-size');
	if(direction == 'plus'){
		size = size.replace("px",'');
		size = (parseInt(size)+1).toString();
		$('#fontSize').val(size);
		size = size+"px";
		$('#'+containerId).css('font-size', size);
	}
	else{
		size = size.replace("px",'');
		size = (parseInt(size)-1).toString();
		$('#fontSize').val(size);
		size = size+"px";
		$('#'+containerId).css('font-size', size);
	}	
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