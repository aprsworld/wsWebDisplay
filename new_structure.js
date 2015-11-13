var cellElement = function cellElement() {
	this.divId;
	this.title;
	this.original;
	this.label;
	this.id;
	this.path;
	this.style;
	this.classList = {};
	this.units;
	this.typeUnits;
	this.type;
	this.htmlStruct = '<div title="'+this.title+'" class="tr draggable" id="' + this.divId + '"><div class="td myTableID"> ID: <span>' + this.title + '</span> </div><div class="td myTableTitle"><p class="titleText">' + this.title + '</p></div><div class="td myTableValue" id="' + new_id + '"><p>Loading...</p><span class="path">'+ this.path +'</span><span class="label"> '+ this.units +'</span></div></div>'
}