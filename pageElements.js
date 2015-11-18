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
	setType: function(elementType) {
		this.elementType = elementType;	
	},
	//gets the type
	getType: function(){
		return this.elementType;
	}
}

/***********************************************************************************
* DATA CELL OBJECT
************************************************************************************/
var pageCell = function(){
	this.units = '';
	this.hidden = false;
	this.setType('pageCell');
	
	//generates html using object properties
	Object.defineProperty(this, 'createHtml', {
		value: function(cellCount){
			$('.top-container').append('<div title="'+this.toolTip+'" class="tr draggable" id="' + cellCount + '"><div class="td myTableID"> ID: <span>' + this.title + '</span> </div><div class="td myTableTitle"><p class="titleText">' + this.title + '</p></div><div class="td myTableValue" id="' + this.fullId + '"><p>Loading...</p><span class="path">'+ this.path +'</span><span class="label"> '+ this.units +'</span></div></div>');
		},
		enumberable: false				
  	});					  
}
extend(pageCell,pageElement);

/***********************************************************************************
* CAMERA OBJECT
************************************************************************************/
var pageCam = function(){
	this.setType('pageCam');
	this.hoverable = true;
	this.suppressed = true;
	this.hoverDelay = 1;
	this.cropped = false;	
	this.hidden = false;
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
	var camObj = this;
	alert(camObj);
	console.log(camObj);
	if(boolHover == false){
		return;	
	}
	else{
		var suppressed, camId, camWidth, divWidth, camHeight, isWebkit, hoverImgId, timeOut, hoverTimeOut, hoverImg, hoverImgLink;
		
		hoverImg = document.createElement('img');
		hoverImgLink = document.createElement('a');
		camId = this.containerId;
		
		$('#'+camId).hover(function(){
			var camSrc = camObj.src;

			console.log(" got to hover ");
			suppressed = false;
			camWidth = parseInt(camObj.natWidth);
			camHeight = parseInt(camObj.natHeight);
			divWidth = parseInt($('#'+camId).css('width').slice(0,-2));
			console.log(divWidth);
			isWebkit = 'WebkitAppearance' in document.documentElement.style;
			hoverImgId = camId+'hover';
			timeOut = hoverTime*1000;
			if(camWidth <= divWidth && camObj.suppressed == true){

				suppressed = true;
			}

			if(editMode == false && suppressed == false){
							console.log(" got to if ");
			hoverTimeOut = setTimeout(function() {	
							console.log(camSrc);

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

pageCam.prototype.createHtml = function(cellCount, value, pageX, pageY){
	var camId = this.fullId;
	var camObj = this;
	console.log(camId);
	$('#preload').append('<img alt="camimage" src="" id="preload_'+this.fullId+'" >');
	$('#preload_'+camId).load(function() {
		var src = $(this).attr("src");
		$('#content').append('<div class="imgCamContainer suppressHover hoverables" id='+camId+' style="background-image:url('+value+')"><img alt="1" style="visibility:hidden;" src="'+value+'"></div>');
		$('#'+camId).css('position', 'absolute');
		$('#'+camId).css('display','inline-block');
		$('#'+camId).css('top',pageY);
		$('#'+camId).css('left',pageX);
		createCamFromTree();
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
	this.hidden = false;
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
