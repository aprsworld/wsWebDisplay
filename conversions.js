/*******************************************************************
// This is a file that contains four object: TemperatureConvert, LengthConvert, SpeedConvert, TimeConvert
// All four objects contain a function, init, that detects the future unit, "fUnit" and calls the correct function
// each object also has a set of functions used to convert values to values of other units.
// each of these functions returns "result" which is an object that contains two properties, label and value
// label is the the property which holds the type of units that are being converted to
// value is the newly converted value to be returned
********************************************************************/


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

//{IN, FT, MI, MM, CM, M, KM}
var LengthConvert = {
	init: function(cUnit, fUnit, value){
		var result = {};
		value = parseFloat(value);
		if(fUnit == 'IN'){
			result.value = this.toIN(cUnit, value); 
			result.label = 'IN';
		}
		else if(fUnit == 'FT'){
			result.value = this.toFT(cUnit, value); 
			result.label = 'FT';
		}
		else if(fUnit == 'MI'){
			result.value = this.toMI(cUnit, value); 
			result.label = 'MI';
		}
		else if(fUnit == 'MM'){
			result.value = this.toMM(cUnit, value); 
			result.label = 'MM';
		}
		else if(fUnit == 'CM'){
			result.value = this.toCM(cUnit, value); 
			result.label = 'CM';
		}
		else if(fUnit == 'M'){
			result.value = this.toM(cUnit, value); 
			result.label = 'M';
		}
		else if(fUnit == 'KM'){
			result.value = this.toKM(cUnit, value); 
			result.label = 'KM';
		}
		return result;
	},
	toIN: function(cUnit, value) {
		if(cUnit == 'FT'){
			return (value/12);
		}
		else if(cUnit == 'MI'){
			return (value*63360);
		}
		else if(cUnit == 'MM'){
			return (value*0.0393701);
		}
		else if(cUnit == 'CM'){
			return (value*0.393701);
		}
		else if(cUnit == 'M'){
			return (value*39.3701);
		}
		else if(cUnit == 'KM'){
			return (value*39370.1);
		}
		else{
			return value;	
		}
	},
	toFT: function(cUnit, value) {
        if(cUnit == 'IN'){
			return (value*12);
		}
		else if(cUnit == 'MI'){
			return value*5280;
		}
		else if(cUnit == 'MM'){
			return value*0.00328084;
		}
		else if(cUnit == 'CM'){
			return value*0.0328084;
		}
		else if(cUnit == 'M'){
			return value*3.28084;
		}
		else if(cUnit == 'KM'){
			return  value*3280.84;
		}
		else{
			return value;	
		}
    },
	toMI: function(cUnit, value) {
		if(cUnit == 'FT'){
			return (value/5280);
		}
		else if(cUnit == 'IN'){
			return (value*0.0000157828);
		}
		else if(cUnit == 'MM'){
			return (value*0.000000621371);
		}
		else if(cUnit == 'CM'){
			return (value*0.00000621371);
		}
		else if(cUnit == 'M'){
			return (value*0.000621371);
		}
		else if(cUnit == 'KM'){
			return (value*0.621371);
		}
		else{
			return value;	
		}	
	},
	toMM: function(cUnit, value) {
		if(cUnit == 'FT'){
			return (value*304.8);
		}
		else if(cUnit == 'M'){
			return (value*1000);
		}
		else if(cUnit == 'CM'){
			return (value*10);
		}
		else if(cUnit == 'KM'){
			return (value*1000000);
		}
		else if(cUnit == 'IN'){
			return (value*25.4);
		}
		else if(cUnit == 'MI'){
			return (value*1609000);
		}
		else{
			return value;	
		}
	},
	toCM: function(cUnit, value) {
		if(cUnit == 'FT'){
			return (value*30.48);
		}
		else if(cUnit == 'IN'){
			return (value*2.54);			
		}
		else if(cUnit == 'MI'){
			return (value*160934);
		}
		else if(cUnit == 'KM'){
			return (value*100000);
		}
		else if(cUnit == 'MM'){
			return (value*0.1);
		}
		else if(cUnit == 'M'){
			return (value*100);
		}
		else{
			return value;	
		}
	},
	toKM: function(cUnit, value) {
		if(cUnit == 'FT'){
			return (value*0.0003048);
		}
		else if(cUnit == 'IN'){
			return (value*0.0000254);
		}
		else if(cUnit == 'MM'){
			return (value*0.000001);
		}
		else if(cUnit == 'CM'){
			return (value*0.00001);
		}
		else if(cUnit == 'M'){
			return (value*0.001);
		}
		else if(cUnit == 'MI'){
			return (value*1.60934);
		}
		else{
			return value;	
		}
	}	
};
var TimeConvert = {
	init: function(cUnit, fUnit, value){
		var result = {};
		if(fUnit == 'UNIX'){
			result.value = this.toUNIX(cUnit, value); 
			result.label = '';
		}
		else if(fUnit == 'MYSQL'){
			result.value = this.toMYSQL(cUnit, value); 
			result.label = '';
		}
		return result;
	},	
	toUNIX: function(cUnit, value) {
       	var date = (new Date(value.replace(' ','T'))).getTime()/1000;
		console.log(date);
		return date;
    },
	toMYSQL: function(cUnit, value) {
		console.log(value);
       	var date = new Date(value*1000);
		console.log(date.toString());
		var year = date.getUTCFullYear();
		var month = date.getUTCMonth()+1;
		var day = date.getUTCDate()+1;
		var hour = date.getUTCHours();
		var min = date.getUTCMinutes();
		var sec = date.getUTCSeconds();
		var sqlDate = year+"-"+month+"-"+day+" "+hour+":"+min+":"+sec+" UTC";
	  	return sqlDate;
    },
}

