# Format of Stations

### In order for tree nodes (stations) to display correctly, they need to be in the correct format

####Currently, a station consists of the following properties:

1. sensors
2. cameras
3. title

##sensors

###in order for a sensor to show up with all of the default properties, it will need the following child properties:

1. title - which will be the text that displays in the tree for that sensor
2. units - the units that are associated with the value (ex: feet, degrees celsius, seconds, etc.)
3. value - the value for that sensor

##cameras

###Cameras will be represented by a number counting up from zero and will appear under the cameras node in the tree

####The only required property is the image_url which determines the source for the camera image - other properties can be optionally included

##title

### this optional property is used to set the title of the station, which is set to the serial number by default.