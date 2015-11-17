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
		value: function(cellCount, value){
			$('#preload').append('<img alt="camimage" src="" id="preload_div_'+this.fullId+'" >');
			$('#preload_div_'+this.fullId).load(function() {
				var src = $(this).attr("src");
				$('#content').append('<div class="imgCamContainer suppressHover hoverables" id=div_'+this.fullId+' style="background-image:url('+value+')"><img style="visibility:hidden;" src="'+value+'"></div>');
			});	
			$('#preload_div_'+this.fullId).attr('src', value);
		},
		enumberable: false				
  	});	
}
extend(pageCam,pageElement);
function PageImg(){
	
}
function PageText(){
	
}