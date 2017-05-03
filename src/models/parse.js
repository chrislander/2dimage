var csv         = require('csvtojson'); 
var fs          = require('fs');
var beautify    = require("json-beautify");

const data_dir = 'data/'; 

var standard_palette = JSON.parse(fs.readFileSync('colors/standard.json', 'utf8'));


exports.process = function(filename){
                
    var output = [],
        usedAudaIDs = [],
        i = 0;

        var json_save_path = filename.replace('csv', 'json');

        csv()
            .fromFile(filename)
            .on('json', (obj) => {

                var audaID = obj.audaID.substring(0, 4),
                    colors = obj.colors.split("|"),
                    vin    = obj.vin
       
                if (!usedAudaIDs.includes(audaID)) {

                    var desc            = obj.description,
                        doorPos         = desc.indexOf("DR "),
                        doors           = desc.substring(doorPos - 1, doorPos),
                        style           = desc.substring(doorPos + 3, doorPos + 4),
                        usedColorList   = [],                        
                        vins            = [],
                        oem_palette     = [];
                    
                    vins.push(vin);

                    for (var n = 0; n < colors.length; n += 3) {
                        
                        var hex  = colors[n + 1],
                            name = colors[n + 3];
                        
                        if (hex != null) { 
                            hex = hex.toUpperCase();
                            
                            if (!usedColorList.includes(hex + '_' + name)) {                                                            
                                var oem_color = {
                                    name : name,
                                    hex  : hex
                                }
                                oem_palette.push(oem_color);
                                usedColorList.push(hex + '_' + name);                            
                            }
                        }
                    }

                    var objToAdd = {
                        audaID: audaID,
                        doors: doors,
                        style: style,
                        vins : vins,
                        colors_oem : oem_palette,                        
                        colors_standard: standard_palette,
                        used_color_list : usedColorList
                    };

                    output.push(objToAdd);
                    usedAudaIDs.push(audaID);                    

                } else {

                    for (var n = 0; n < output.length; n++) {
                        if (output[n].audaID === audaID) {
                            
                            output[n].vins.push(vin);

                            for (var j = 0; j < colors.length; j += 3) {
                                var hex  = colors[j + 1],
                                    name = colors[j + 3];
                                    
                                if (hex != null) {
                                    hex = hex.toUpperCase();
                                    if (!output[n].used_color_list.includes(hex + '_' + name)) {

                                        var oem_color = {
                                            name : name,
                                            hex  : hex
                                        }
                                        
                                        output[n].colors_oem.push(oem_color);                                        
                                        output[n].used_color_list.push(hex + '_' + name);
                                    }
                                }
                            }
                        }
                    }
                }
            })
            .on('done', (error) => { 
                //Just clean up the object by removing the used_color_list;
        
                for (var key in output ){
                    var obj = output[key];
                    delete obj.used_color_list;                    
                }
                
                fs.writeFile(json_save_path, beautify(output, null, 2, 100), function(err) {
                    if(err) return console.log(err);                                            
                });
                
            }) 
            
    }
                 

