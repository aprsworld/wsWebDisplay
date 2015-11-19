/***********************************************************************************
* Extends parent object prototype to a child object
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
	//gets style
	Object.defineProperty(this, 'getStyle', {
		value: function(){
			var thisElement = $('#'+this.containerId+'');
			var style =  $('#'+this.containerId).parent().attr('style');
			return style;		
		},
		enumerable: false
	});
	//sets the style
	Object.defineProperty(this, 'setStyle', {
		value: function(stylelist){
			this.style = stylelist;
			console.log(this.style);
		},
		enumerable: false
	});
}

/***********************************************************************************
* General object prototype
************************************************************************************/
pageElement.prototype = {
	//sets type of element to be a data cell, image block, textblock, camera, etc.
	hidden: false,
	setType: function(elementType) {
		this.elementType = elementType;	
	},
	//gets the type
	getType: function(){
		return this.elementType;
	},
	deleteElement: function(){
		var elementPos = cell_arr.map(function(x) {return x.id; }).indexOf(this.id);
		if (elementPos > -1) {
			$('#'+this.containerId).remove();
			cell_arr.splice(elementPos, 1);	
			console.log(cell_arr);
		}	
	}
	//need a hide function
}

/***********************************************************************************
* DATA CELL OBJECT
************************************************************************************/
var pageCell = function(){
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
	$('#'+containerId).closest('.tr').css('color', color+' !important');
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
		size = size+"px";
		$('#'+containerId).closest('.tr').css('font-size', size);
	}
	else{
		size = size.replace("px",'');
		size = (parseInt(size)-1).toString();
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
pageCell.prototype.setOpacity = function(opacity, selectedModule, ui) {
	console.log(selectedModule);
	var containerId = this.fullId;	
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
	
	var style = this.getStyle();
	this.setStyle(style);
}
pageCell.prototype.createHtml = function(cellCount){
	$('.top-container').append('<div title="'+this.toolTip+'" class="tr draggable" id="' + cellCount + '"><div class="td myTableID"> ID: <span>' + this.title + '</span> </div><div class="td myTableTitle"><p class="titleText">' + this.title + '</p></div><div class="td myTableValue" id="' + this.fullId + '"><p>Loading...</p><span class="path">'+ this.path +'</span><span class="label"> '+ this.units +'</span></div></div>');
}

/***********************************************************************************
* CAMERA OBJECT
************************************************************************************/
var pageCam = function(){
	this.setType('pageCam');
	this.hoverable = true;
	this.suppressed = true;
	this.hoverDelay = 1;
	this.cropped = false;	
	this.natWidth;
	this.natHeight;
	this.id;
	this.path;
	this.style;
	this.src;
	this.containerId;
}
extend(pageCam,pageElement);

//sets class for hover and sets delay time
pageCam.prototype.setHover = function(boolHover, hoverTime){
	var camObj, camId, radiobtn ;
	camObj = this;
	camId = this.containerId;
	console.log(camObj);
	if(boolHover == false){
		camObj.hoverable = false;
		$( '#'+camId ).off("mouseenter mouseleave");
		$('#hoverTimeRow, #suppressHoverable').hide();		
		return;	
	}
	else{
		var suppressed, camId, camWidth, divWidth, camHeight, isWebkit, hoverImgId, timeOut, hoverTimeOut, hoverImg, hoverImgLink;
		camObj.hoverable = true;
		hoverImg = document.createElement('img');
		hoverImgLink = document.createElement('a');
		$('#hoverTimeRow, #suppressHoverable').show();		
		$('#'+camId).hover(function(){
			var camSrc = camObj.src;
			console.log(camObj);
			suppressed = false;
			camWidth = parseInt(camObj.natWidth);
			camHeight = parseInt(camObj.natHeight);
			divWidth = parseInt($('#'+camId).css('width').slice(0,-2));
			isWebkit = 'WebkitAppearance' in document.documentElement.style;
			hoverImgId = camId+'hover';
			timeOut = hoverTime*1000;
			
			if(camWidth <= divWidth && camObj.suppressed == true){

				suppressed = true;
			}

			if(editMode == false && suppressed == false){
			
				hoverTimeOut = setTimeout(function() {	

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
				clearTimeout(hoverTimeOut);
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
	createCamFromTree(camObj);
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
		createCamFromTree(camObj);
		var currentMode = editMode
		var width = $('#'+camId).children('img').width();
		var height = $('#'+camId).children('img').height();	
		var hov = true;
		var delay = 1;
		camObj.setNaturalDimensions(height, width);

	});	
	$('#preload_'+camId).attr('src', value);
}
/***********************************************************************************
* IMG BLOCK OBJECT
************************************************************************************/
function pageImg(){
	this.setType('pageImg');
	
	Object.defineProperty(this, 'createHtml', {
		value: function(cellCount){
			$('#content').append('<div id=img'+cellCount+'container class="imgBlockContainer"><div class="cam-drag-handle"></div><img class="imageInsert" width="320" height="240" onerror="brokenImg(img'+cellCount+')" id=img'+cellCount+' alt=img'+cellCount+' src="images/insert_image.svg"></img></div>');
		},
		enumberable: false				
  	});	
}
extend(pageImg,pageElement);

/***********************************************************************************
* TEXT BLOCK OBJECT
************************************************************************************/
function pageText(){
	this.setType('pageText');
	this.id;
	this.text;
	this.style;
	Object.defineProperty(this, 'createHtml', {
		value: function(cellCount){
			var textBlock, textTitle, textContent, title;
			//create a div to hold the text
			textBlock = document.createElement("div");
			textBlock.className = "textBlockContainer";
			textContent = "Click to change text";
			this.text = textContent;
			//incremental ID attribute
			textBlock.id = "block"+cellCount;
			this.id = "block"+cellCount;
			//appends a textblock to the div with our default text
			$(textBlock).append('<p>'+textContent+'</p>');
			//appends the textblock to the page
			$('#content').append(textBlock);
		},
		enumberable: false				
  	});	
}
extend(pageText,pageElement);
