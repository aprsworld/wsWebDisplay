/*													HOW THIS WORKS

There are objects for each type conversion such as 'LengthConvert', 'TemperatureConvert', etc. These objects each have an init function. This function
accepts 3 parameters: currentUnit, FutureUnit, and value

Current unit is the unit of measure that is being converted
Future unit is the unit of measure that will be the end conversion
Value is the current value that the unit applies to - the value changes based on the conversion

Each conversion object has a base unit of measurement. This is what everything will be converted to and converted from to get the final result. This means
that We dont need n^2 conversions.

Everytime one of the functions is called, it is actually called twice. Once to convert to the base unit, and another time to convert to the 'future unit.' 
The second (final) time that the funciton is called, it returns an object containing value and label properties. 

Here is an example:

Within the lengthConvert object, Our base unit is feet. Therefore, any conversion will convert first to feet, and then convert to the future unit. For instance, 
if we are going from 2 miles to inches we would first convert 2 miles into feet, which is 10560. Then we convert 10560 feet into inches, 
which turns out to be 126720 inches. When the function returns, it will return an object holding a value property equal to 126770 and a label property equal to ' in.'
*/
var LengthConvert = {
	init: function(currentUnit, futureUnit, value){
		if(currentUnit == 'IN'){
			//convert value from inches to feet
			value = value*.0833;
			//call function again with feet as current unit, the same future unit, and a new value.
			var result = LengthConvert.init('FT', futureUnit, value);
		}
		else if(currentUnit == 'MI'){
			value = value*5280;
			var result = LengthConvert.init('FT', futureUnit, value);
			return result;
		}
		else if(currentUnit == 'M'){
			value = value*3.28084;
			var result = LengthConvert.init('FT', futureUnit, value);
			return result;
		}
		else if(currentUnit == 'MM'){
			value = value*0.00328084;
			var result = LengthConvert.init('FT', futureUnit, value);
			return result;
		}
		else if(currentUnit == 'KM'){
			value = value*3280.84;
			var result = LengthConvert.init('FT', futureUnit, value);
			return result;
		}
		else if(currentUnit == 'CM'){
			value = value*0.0328084;
			var result = LengthConvert.init('FT', futureUnit, value);
			return result;
		}
		else if(currentUnit == 'FT'){
			var result = {};
			result.label = futureUnit;
			if(futureUnit == 'FT'){
				result.value = value;
				result.label = ' ft.';
				return result;
			}
			else if(futureUnit == 'IN'){
				result.value = value*12;
				result.label = ' in.';
				return result;
			}
			else if(futureUnit == 'MI'){
				result.value = value*.000189;
				result.label = ' mi.';
				return result;
			}
			else if(futureUnit == 'M'){
				result.value = value*.305
				result.label = ' m';
				return result;
			}
			else if(futureUnit == 'MM'){
				result.value = value*304.8;
				result.label = ' mm';
				return result;
			}
			else if(futureUnit == 'KM'){
				result.value = value*.000305;
				result.label = ' km';
				return result;
			}
			else if(futureUnit == 'CM'){
				result.value = value*30.48;
				result.label = ' cm';
				return result;        
			}
		}
	}
};
var SpeedConvert = {
	//base unit: mi/hr
	init: function(currentUnit, futureUnit, value){
		if(currentUnit == 'KM/HR'){
			//convert value from km/hr to the base unit, mi/hr
			value = value*0.6213712;
		  //call function again with mi/hr as current unit, the same future unit, and a new value.
		  var result = speedConvert.init('MI/HR', futureUnit, value);
			return result;
		}
		else if(currentUnit == 'M/S'){
			value = value*2.23694;
			var result = SpeedConvert.init('MI/HR', futureUnit, value);
			return result;
		}
		else if(currentUnit == 'KTS'){
			value = value*1.15078;
			var result = SpeedConvert.init('MI/HR', futureUnit, value);
			return result;
		}
		else if(currentUnit == 'MI/HR'){
			var result = {};
			result.label = futureUnit;
			if(futureUnit == 'MI/HR'){
				result.value = value;
				result.label = ' mph';
				return result;
			}
				else if(futureUnit == 'KM/HR'){
				result.value = value*1.61;
				result.label = ' km/h';
				return result;
			}
				else if(futureUnit == 'M/S'){
								console.log(value);

				value = value*0.44704;
								console.log(value);

				result.label = ' m/s';	
				return result;
			}
				else if(futureUnit == 'KTS'){
				result.value = value*0.868976;
				result.label = ' kn';
				return result;
			}
		}
	}	
};
var TemperatureConvert = {
	//base unit is F
	init: function(currentUnit, futureUnit, value){
		if(currentUnit == 'C'){
			value = (value*(9/5))+32;
			var result = TemperatureConvert.init('F', futureUnit, value);
			return result;
		}
		else if(currentUnit == 'K'){
			value = (value*(9/5))-459.67;
			var result = TemperatureConvert.init('F', futureUnit, value);
			return result;
		}
		else if(currentUnit == 'F'){
			var result = {};
			result.label = futureUnit;
			if(futureUnit == 'F'){
				result.value = value;
				result.label = '°F';
				return result;
			}
			else if(futureUnit == 'K'){
				result.value = (value + 459.67) * 5/9;
				result.label = '°K';				
				return result;
			}
			else if(futureUnit == 'C'){
				result.value = (value - 32)*(5/9);
				result.label = '°C';				
				return result;
			}
		}
	}
};
var AtmosphericPressureConvert = {
	//base unit is atmosphere (atm)
	init: function(currentUnit, futureUnit, value){
		if(currentUnit == 'PASCAL'){
			value = value * 0.00000986923;
			var result = AtmosphericPressureConvert.init('ATMOSPHERE', futureUnit, value);
			return result;
		}
		else if(currentUnit == 'MILLIBAR'){
			value = value * 0.000986923; 
			var result = AtmosphericPressureConvert.init('ATMOSPHERE', futureUnit, value);
			return result;
		}
		else if(currentUnit == 'HECTOPASCAL'){
			value = value*0.000986923;
			var result = AtmosphericPressureConvert.init('ATMOSPHERE', futureUnit, value);
			return result;
		}
		else if(currentUnit == 'MMHG'){
			value = value*0.00131578955679;
			var result = AtmosphericPressureConvert.init('ATMOSPHERE', futureUnit, value);      
			return result;
		}
		else if(currentUnit == 'INHG'){
			value = value*0.0334211;
			var result = AtmosphericPressureConvert.init('ATMOSPHERE', futureUnit, value);
			return result;
		}
		else if(currentUnit == 'PSI'){
			value = value*0.068046;
			var result = AtmosphericPressureConvert.init('ATMOSPHERE', futureUnit, value);
			return result;
		}
		else if(currentUnit == 'BAR' || currentUnit == 'BARS'){
			value = value*0.986923;
			var result = AtmosphericPressureConvert.init('ATMOSPHERE', futureUnit, value);
			return result;
		}
		else if(currentUnit == 'ATMOSPHERE'){
			var result = {};
			result.label = futureUnit;
			if(futureUnit == 'ATMOSPHERE'){
				result.value = value;
				result.label = ' atmosphere';
				return result;
			}
			else if(futureUnit == 'PASCAL'){
				result.value = value*101325;
				result.label = ' Pascal';
				return result;
			}
			else if(futureUnit == 'MILLIBAR'){
				result.value = value*1013.25;
				result.label = ' millibar';
				return result;
			}
			else if(futureUnit == 'BAR'){
				result.value = value*1.01325;
				result.label = ' Bar';
				return result;
			}
			else if(futureUnit == 'HECTOPASCAL'){
				result.value = value*1013.25;
				result.label = ' hectopascal';
				return result;
			}
			else if(futureUnit == 'MMHG'){
				result.value = value*760;
				result.label = ' mmHg';
				return result;
			}
			else if(futureUnit == 'INHG'){
				result.value = value*29.92;
				result.label = ' inHg';
				return result;
			}
			else if(futureUnit == 'PSI'){
				result.value = value*14.696;
				result.label = ' psi';
				return result;
			}
		}
	}
};
//
//time conversions are non-linear so it will work a bit differently
//
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
		return date;
    },
	toMYSQL: function(cUnit, value) {
       	var date = new Date(value*1000);
		var year = date.getUTCFullYear();
		var month = date.getUTCMonth()+1;
		var day = date.getUTCDate()+1;
		var hour = date.getUTCHours();
		var min = date.getUTCMinutes();
		var sec = date.getUTCSeconds();
		var sqlDate = year+"-"+month+"-"+day+" "+hour+":"+min+":"+sec+" UTC";
	  	return sqlDate;
    }
};
var directionConvert = {
	init: function(value){
		var result = {};
		if ( degrees >= 338 || degrees < 23 ){
			result.label = "N";
		}
		else if ( degrees < 68 ){
			result.label = "NE";
		}
		else if ( degrees < 113 ){
			result.label = "E";
		}
		else if ( degrees < 158 ){
			result.label = "SE";
		}
		else if ( degrees < 203 ){
			result.label = "S";
		}
		else if ( degrees < 248 ){
			result.label = "SW";
		}
		else if ( degrees < 293 ){
			result.label = "W";
		}
		else{
			result.label = "NW";
		}
		result.value = value;
		return result;
		
	}
}


function chooseConversion(type, typeUnits, value, typeChange){
	if(type == "temperature"){
		var x = TemperatureConvert.init(typeUnits, typeChange, value);
		return x;
	}
	else if(type == "speed"){
		return SpeedConvert.init(typeUnits, typeChange, value);
	}
	else if(type == "length"){
		return LengthConvert.init(typeUnits, typeChange, value);
	}
	else if(type == "time"){
		return TimeConvert.init(typeUnits, typeChange, value);
	}
	else if(type == "atmosphericPressure"){
		typeChange = typeChange.toUpperCase();
		return AtmosphericPressureConvert.init(typeUnits, typeChange, value);	
	}
	else if(type == "direction"){
		return directionConvert.init(value);
	}
}

//populates the conversion dropdown based on the id
function populateConversions(id){
	$('#unitRow').hide();
	var temperatureUnits = ['C','F','K'];
	var speedUnits = ['KM/HR','MI/HR','M/S','KTS'];
	var lengthUnits = ['IN','FT','MI','MM','CM','M','KM'];
	var timeUnits = ['UNIX','MYSQL'];
	var apUnits = ['Atmosphere','Pascal','Bar','millibar','hectopascal','mmHg','inHg','psi'];
	
	id = id.replace('div_', '');	
	var cellObj = $.grep(cell_arr, function(e){ return e.id === id});
	var type = cellObj[0].type;
	var label = cellObj[0].units;
	var currentUnits = cellObj[0].typeUnits;
	var newUnits = cellObj[0].typeChange;
	var dataType = cellObj[0].dataType;
	//empty selection list in case there was elements in it from the last click
	$("#unitSelect").empty();
	//leave function if either undefined
	if(currentUnits == 'undefined' || type == 'undefined' || dataType != 'number'){
		return;	
	}
	else{
		//
		//logic block that matches type with one of the arrays above. it will then populate the selection list in the edit window and unhide it.
		//
		if(type == 'temperature'){
			var i = 0;
			var length = temperatureUnits.length;
			for(i; i<length; i++){
				console.log(temperatureUnits[i]);
				$('#unitSelect').append($('<option>', {
					value: temperatureUnits[i],
					text: ''+temperatureUnits[i]+''
				}));	
			}
			$('#unitRow').show();
		}
		else if(type == 'speed'){
			var i = 0;
			var length = speedUnits.length;
			for(i; i<length; i++){
				console.log(speedUnits[i]);
				$('#unitSelect').append($('<option>', {
					value: speedUnits[i],
					text: ''+speedUnits[i]+''
				}));	
			}
			$('#unitRow').show();
		}
		else if(type == 'length'){
			var i = 0;
			var length = lengthUnits.length;
			for(i; i<length; i++){
				console.log(lengthUnits[i]);
				$('#unitSelect').append($('<option>', {
					value: lengthUnits[i],
					text: ''+lengthUnits[i]+''
				}));	
			}
			$('#unitRow').show();
		}
		else if(type == 'time'){
			var i = 0;
			var length = timeUnits.length;
			for(i; i<length; i++){
				console.log(timeUnits[i]);
				$('#unitSelect').append($('<option>', {
					value: timeUnits[i],
					text: ''+timeUnits[i]+''
				}));	
			}
			$('#unitRow').show();
		}
		else if(type == 'atmosphericPressure'){
			var i = 0;
			var length = apUnits.length;
			for(i; i<length; i++){
				console.log(apUnits[i]);
				$('#unitSelect').append($('<option>', {
					value: apUnits[i],
					text: ''+apUnits[i]+''
				}));	
			}
			$('#unitRow').show();
		}
		//leave function due to incorrect format of object.type
		else{
			return;	
		}
		if(newUnits){
			$("#unitSelect").val(newUnits.toUpperCase()).attr("selected","selected");
		}
		else{
			$("#unitSelect").val(currentUnits.toUpperCase()).attr("selected","selected");
		}
	}
}