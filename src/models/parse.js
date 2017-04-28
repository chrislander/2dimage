var csv         = require('csvtojson'); 
var fs          = require('fs');
var beautify    = require("json-beautify");

exports.process = function(filename){
                
    var output = [],
        usedAudaIDs = [],
        i = 0;

        var json_save_path = filename.replace('csv', 'json');

        csv()
            .fromFile(filename)
            .on('json', (obj) => {

                var audaID = obj.audaID.substring(0, 4),
                    colors = obj.colors.split("|");
       
                if (!usedAudaIDs.includes(audaID)) {

                    var desc    = obj.description,
                        doorPos = desc.indexOf("DR "),
                        doors   = desc.substring(doorPos - 1, doorPos),
                        style   = desc.substring(doorPos + 3, doorPos + 4)

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

                    var objToAdd = {
                        audaID: audaID,
                        doors: doors,
                        style: style,
                        colors: colorlist
                    };

                    output.push(objToAdd);
                    usedAudaIDs.push(audaID);                    

                } else {

                    for (var n = 0; n < output.length; n++) {
                        if (output[n].audaID === audaID) {

                            for (var j = 0; j < colors.length; j += 3) {
                                var hex  = colors[j + 1],
                                    name = colors[j + 3];

                                if (!output[n].colors.includes(hex + '_' + name)) {
                                    if (hex != null) {
                                        output[n].colors.push(hex + '_' + name);
                                    }
                                }
                            }
                        }
                    }
                }
            })
            .on('done', (error) => { 
                fs.writeFile(json_save_path, beautify(output, null, 2, 100), function(err) {
                    if(err) return console.log(err);                                            
                });
                
            }) 
            
    }
                 

