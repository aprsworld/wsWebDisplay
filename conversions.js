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
	init: function(cUnit, fUnit, value){
		var result = {};
		value = parseFloat(value);
		if(fUnit == 'KM/HR'){
			result.value = this.toKMHR(cUnit, value); 
			result.label = 'KM/HR';
		}
		else if(fUnit == 'MI/HR'){
			result.value = this.toMIHR(cUnit, value); 
			result.label = 'MI/HR';
		}
		else if(fUnit == 'M/S'){
			result.value = this.toK(cUnit, value); 
			result.label = 'M/S';
		}
		else if(fUnit == 'KTS'){
			result.value = this.toKTS(cUnit, value); 
			result.label = 'KTS';
		}
		return result;
	},	
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
        if(cUnit == 'KM/HR'){
			return (value*0.6213712);
		}
		else if(cUnit == 'M/S'){
			return (value*2.23694);
		}
		else if(cUnit == 'KTS'){
			return (value*1.15078);
		}
		else{
			return value;
		}
    },
	toMS: function(cUnit, value) {
		if(cUnit == 'MI/HR'){
			return (value*0.44704);
		}
		else if(cUnit == 'KM/HR'){
			return (value*0.277778);
		}
		else if(cUnit == 'KTS'){
			return (value*0.514444);
		}
		else{
			return value;
		}
	},
	toKTS: function(cUnit, value) {
		if(cUnit == 'MI/HR'){
			return (value*0.868976);
		}
		else if(cUnit == 'M/S'){
			return (value*1.94384);
		}
		else if(cUnit == 'KM/HR'){
			return (value*0.539957);
		}
		else{
			return value;
		}
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

