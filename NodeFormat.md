# Format of Stations

 In order for tree nodes (stations) to display correctly, they need to be in the correct format

Currently, a station consists of the following properties:
 
1. **title** 
2. **type**
3. **typeUnits**
4. **units**
5. **value**

###sensors

in order for a sensor to show up with all of the default properties, it will need the following child properties:

1. title (optional) - which will be the text that displays in the tree for that sensor - this overrides what is likely to be a bunch of random characters that serve as the sensor's id
2. type (optional, type: string) - type tells wsWebDisplay what type of unit it is dealing with. Currently, the types are: atmosphericPressure, time, length, speed, temperature 
3. typeUnits (optional, type: string) - typeUnits specifies the subtype. So if, for example, we have temperature as a type, we can specify celcius as "c" within the typeUnits property. This is used in various ways within wsWebDisplay such as setting up unit conversions between temperatures.
	Current valid types: 
	Temperature Units: 'C','F','K'
	Speed Units: 'KM/HR','MI/HR','M/S','KTS'
	Length Units: 'IN','FT','MI','MM','CM','M','KM'
	Time Units: 'UNIX','MYSQL'
	Atmospheric Pressure Units: 'Atmosphere','Pascal','Bar','millibar','hectopascal','mmHg','inHg','psi'
4. units (optional) - units is essentially a property that dictates the label for the value. So if we have typeUnits 'c', a label that might be passed with it would be '&deg;C'
5. value (required if title, units, type, typeUnits, or units are set) - the value for that sensor. This can be a String or Number type when it comes in via JSON. The type within the JSON String dictates how wsWebDisplay treats the value. If it is a string, the ui will display it in a literal way. If it is a number, it will manipulate the value based on the type, typeUnits and units properties.  

###cameras

Cameras will be represented by a number counting up from zero and will appear under the cameras node in the tree

The only required property is the image_url which determines the source for the camera image - other properties can be optionally included

###title

 this optional property is used to set the title of the station, which is set to the serial number by default.
 
# Example
This excludes the optional title property

Code:
```
{
    "A4606": {
        "sensors": {
            "81201b0a9e183615b885c82b81630a9a": {
                "value": 0,
                "title": "Wind Speed",
                "units": "m/s"
            },
            "2086bd024e633982ff78fb65f3e81e0b": {
                "value": 0,
                "title": "Wind Gust",
                "units": "m/s"
            },
            "ead13158c9ca36dfdcd647a1b7707e7c": {
                "value": 0,
                "title": "Turbine Current RPM",
                "units": ""
            },
            "174adade157e993b91d463943f0f1cb4": {
                "value": 0,
                "title": "Turbine Gust RPM",
                "units": ""
            },
            "cdce004777392faae7ac6fa7729f25ea": {
                "value": "23.88",
                "title": "Input Voltage",
                "units": "volts"
            },
            "688a7766da608ca2b2fe6a7d1c0d7ccb": {
                "value": 41172,
                "title": "Sequence Number",
                "units": ""
            },
            "7ad0bde3d601cd3c0eaa8eb5bf27cb1a": {
                "value": "2.440",
                "title": "Ticks",
                "units": "seconds"
            },
            "d0ecc25ff2849cf00734a91f2b32fc41": {
                "value": 56310,
                "title": "Uptime",
                "units": "minutes"
            },
            "cd836789f651b02071e05e045f9511b5": {
                "value": 0,
                "title": "Watchdog Timer",
				"type": "time",
				"typeUnits": "seconds",
                "units": "seconds"
            },
            "0ca41badb637f4b03936f6d0e59e390c": {
                "value": "2015-10-05 20:16:23",
                "title": "Packet Date",
                "units": "UTC"
            }
        },
		"title": "Custom Title",
        "cameras": [
            {
                "image_url": "http://cam.aprsworld.com/A4606/2015/10/05/20151005_202031.jpg",
                "image_size": 89114,
                "source_serial": "A4606",
                "source_ip_addr": "97.117.107.159",
                "source_ip_port": "48839"
            }
        ]
    }
}
```
