//cUnit = current units, value = current value
var TemperatureConvert = {
	init: function(cUnit, fUnit, value){
		var result = {};
		value = parseFloat(value);
		if(fUnit == 'F'){
			result.value = this.toF(cUnit, value); 
			result.label = '&deg;F';
		}
		else if(fUnit == 'C'){
			result.value = this.toC(cUnit, value); 
			result.label = '&deg;C';
		}
		else if(fUnit == 'K'){
			result.value = this.toK(cUnit, value); 
			result.label = '&deg;K';
		}
		return result;
	},	
    toF: function(cUnit, value) {
        if(cUnit == 'C'){
			return (value*(9/5))+32;
		}
		else if(cUnit == 'K'){
			return (value*(9/5))-459.67;
		}
		else{
			return value;	
		}
    },
	toC: function(cUnit, value) {
        if(cUnit == 'F'){
			return (value - 32)*(5/9);

		}
		else if(cUnit == 'K'){
			return (value - 273.15)*1;
		}
		else{
			return value;	
		}
    },
	toK: function(cUnit, value) {
		if(cUnit == 'F'){
			return (value + 459.67) * 5/9;
		}
		else if(cUnit == 'C'){
			return (value + 273.15)*1;
		}
		else{
			return value;	
		}
	}
};
// {KM/HR, MI/HR, M/S, KTS}
var SpeedConvert = {
	toKMHR: function(cUnit, value) {
        if(cUnit == 'MI/HR'){
			return (value*1.61);
		}
		else if(cUnit == 'M/S'){
			return (value*3.6);
		}
		else if(cUnit == 'KTS'){
			return (value*1.852);
		}
		else{
			return value;
		}
	},
	toMIHR: function(cUnit, value) {
        alert("baz");
    },
	toMS: function(cUnit, value) {
		alert("baz");	
	},
	toKTS: function(cUnit, value) {
		alert("baz");	
	}
};
var LengthConvert = {
	toIN: function(cUnit, value) {
        alert("baz");
    },
	toFT: function(cUnit, value) {
        alert("baz");
    },
	toMI: function(cUnit, value) {
		alert("baz");	
	},
	toMM: function(cUnit, value) {
		alert("baz");	
	},
	toCM: function(cUnit, value) {
		alert("baz");	
	},
	toKM: function(cUnit, value) {
		alert("baz");	
	}	
};
var TimeConvert = {
	toUNIX: function(cUnit, value) {
        alert("baz");
    },
	toMYSQL: function(cUnit, value) {
        alert("baz");
    },
}

