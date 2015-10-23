//cUnit = current units, value = current value
var TemperatureConvert = {
    toF: function(cUnit, value) {
        if(cUnit == 'C'){
			return (value*(9/5))+32;
		}
		else if(cUnit == 'K'){
			return (value*(9/5))-459.67;
		}
		else{
			return;	
		}
    },
	toC: function(cUnit, value) {
        if(cUnit == 'F'){
			return (value - 32)*(5/9);

		}
		else if(cUnit == 'K'){
			return value - 273.15;
		}
		else{
			return;	
		}
    },
	toK: function(cUnit, value) {
		if(cUnit == 'F'){
			return (value + 459.67) * 5/9;
		}
		else if(cUnit == 'C'){
			return value + 273.15;
		}
		else{
			return;	
		}
	}
};
var SpeedConvert = {
	toKMHR: function(cUnit, value) {
        alert("baz");
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