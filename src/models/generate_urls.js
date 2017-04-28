var fs          = require('fs'),
    beautify    = require("json-beautify");

exports.generate_urls = function (filename){
    
    var obj         = JSON.parse(fs.readFileSync(filename, 'utf8'));    
        urlbase     = "http://tuning-solera.herokuapp.com/",
        //frames      = [0,1,2,3,4,5,6,7,"home"];
        frames      = [0,1];
        
    for (var key in obj){

        var model       = obj[key];        
            model.urls = []; 
                      
        for ( var i = 0; i < model.colors.length; i++ ){
            
            for ( var j = 0; j < frames.length; j++ ){   
                var getcolor = model.colors[i].split("_"),
                    color = getcolor[0], 
                    url = urlbase + model.audaID + '/' + model.doors + '/' + model.style + '/' + color + "/" + frames[j] + "/solid_glossy",
                    imgfilename = model.audaID + "_" + model.colors[i] + '_' + frames[j] + '.png';
                                    
                model.urls.push({
                    url : url,
                    imgfilename : imgfilename
                });                
            }                
        }                   
    }  
    
    fs.writeFile("data/urls.json", beautify(obj, null, 2, 100), function(err) {
        if(err) return console.log(err);
    }); 
}