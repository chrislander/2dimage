var csv         = require('csvtojson'); 
var fs          = require('fs');
var beautify    = require("json-beautify");

exports.process = function(filename){
                
    var output = [],
        usedAudaIDs = [],
        i = 0,
        totalDupesProcessed = 0,
        checkedcounter = 0,
        addedcounter = 0;

        csv()
            .fromFile(filename)
            .on('json', (obj) => {

                //Get the audaID
                var audaID = obj.audaID.substring(0, 4);
                var colors = obj.colors.split("|");

                //If we haven't processed this ID yet        
                if (!usedAudaIDs.includes(audaID)) {

                    // Get the doors & bodystyle find the position of the string "DR "; Note the space
                    var desc = obj.description,
                            doorPos = desc.indexOf("DR "),
                            doors = desc.substring(doorPos - 1, doorPos),
                            style = desc.substring(doorPos + 3, doorPos + 4);

                    // Get the colors

                    var colorlist = [];

                    for (var n = 0; n < colors.length; n += 3) {

                        var hex  = colors[n + 1],
                            name = colors[n + 3];


                        if (!colorlist.includes(hex + '_' + name)) {
                            if (hex != null) {
                                colorlist.push(hex + '_' + name);
                            }
                        }
                    }

                    // Create new object to hold the information.
                    var objToAdd = {
                        audaID: audaID,
                        doors: doors,
                        style: style,
                        colors: colorlist
                    };

                    //Push the object to our json output array
                    output.push(objToAdd);

                    //Make sure we update our list of used IDs
                    usedAudaIDs.push(audaID);

                    //Update the counter for clarity
                    i++;

                } else {

                    // If the ID has been used we need to find the key of the audaID in the array 
                    for (var n = 0; n < output.length; n++) {
                        if (output[n].audaID === audaID) {
                            //console.log("yeah found duplicate to add colors to");

                            for (var j = 0; j < colors.length; j += 3) {
                                var hex  = colors[j + 1],
                                    name = colors[j + 3];

                                checkedcounter++;
                                if (!output[n].colors.includes(hex + '_' + name)) {
                                    if (hex != null) {
                                        output[n].colors.push(hex + '_' + name);
                                        addedcounter++;
                                    }
                                }
                            }
                        }
                    }
                    totalDupesProcessed++;
                }
            })
            .on('done', (error) => { 
                fs.writeFile("data/2d.json", beautify(output, null, 2, 100), function(err) {
                    if(err) return console.log(err);                                            
                });
                
            }) 
            
    }
                 

