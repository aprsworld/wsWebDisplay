/*Our base unit of choice is feet. Therefore, any conversion will convert first to feet, and then convert to the future unit. For instance, if we are going from 2 miles to inches we would first convert 2 miles into feet, which is 10560. Then we convert 10560 feet into inches, which turns out to be 126720 inches.
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
				return result;
			}
			else if(futureUnit == 'IN'){
				result.value = value*12;
				return result;
			}
			else if(futureUnit == 'MI'){
				result.value = value*.000189;
				return result;
			}
			else if(futureUnit == 'M'){
				result.value = value*.305
				return result;
			}
			else if(futureUnit == 'MM'){
				result.value = value*304.8;
				return result;
			}
			else if(futureUnit == 'KM'){
				result.value = value*.000305;
				return result;
			}
			else if(futureUnit == 'CM'){
				result.value = value*30.48;
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
				return result;
			}
				else if(futureUnit == 'KM/HR'){
				result.value = value*1.61;
				return result;
			}
				else if(futureUnit == 'M/S'){
				value = value*0.44704;
				return result;
			}
				else if(futureUnit == 'KTS'){
				result.value = value*0.868976;
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
				return result;
			}
			else if(futureUnit == 'K'){
				result.value = (value + 459.67) * 5/9;
				return result;
			}
			else if(futureUnit == 'C'){
				result.value = (value - 32)*(5/9);
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
			console.log('line 178: '+value);
			var result = AtmosphericPressureConvert.init('ATMOSPHERE', futureUnit, value);
			return result;
		}
		else if(currentUnit == 'ATMOSPHERE'){
			var result = {};
			result.label = futureUnit;
			if(futureUnit == 'ATMOSPHERE'){
				result.value = value;
				return result;
			}
			else if(futureUnit == 'PASCAL'){
				result.value = value*101325;
				return result;
			}
			else if(futureUnit == 'MILLIBAR'){
				result.value = value*1013.25;
				return result;
			}
			else if(futureUnit == 'BAR'){
				result.value = value*1.01325;
				return result;
			}
			else if(futureUnit == 'HECTOPASCAL'){
				result.value = value*1013.25;
				return result;
			}
			else if(futureUnit == 'MMHG'){
				result.value = value*760;
				return result;
			}
			else if(futureUnit == 'INHG'){
				result.value = value*29.92;
				return result;
			}
			else if(futureUnit == 'PSI'){
				result.value = value*14.696;
				return result;
			}
		}
	}
};
//time is non-linear so it will work a bit differently
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
    }
};

