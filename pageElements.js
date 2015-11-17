//function used for extending "sub-classes" from a "main class"
function extend(ChildClass, ParentClass) {
	ChildClass.prototype = new ParentClass();
	ChildClass.prototype.constructor = ChildClass;
}
//general object for element on the page
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
//functions to be used in all pageElement objects
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

//object representing the datacells on the page
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
//object representing the cameras on the page
var pageCam = function(){
	this.setType('pageCam');
	this.hoverable = true;
	this.suppressed = true;
	this.hoverDelay = 1;
	this.cropped = false;	
	this.hidden = false;
	this.naturalWidth;
	this.naturalHeight;
	this.id;
	this.path;
	this.containerId;
	Object.defineProperty(this, 'createHtml', {
		value: function(cellCount, value, pageX, pageY){
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
			});	
			$('#preload_'+camId).attr('src', value);
		},
		enumberable: false				
  	});	
}
extend(pageCam,pageElement);
function pageImg(){
	
}
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
