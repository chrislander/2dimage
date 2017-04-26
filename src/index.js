var     express  = require('express'),
        app      = express(),
        path     = require('path'),
        fs       = require('fs'),
        request  = require('request'),     
        mkdirp   = require('mkdirp'),     
        baseDir  = 'saved';

        
     
//Define a function for downloading the image
var download = function(uri, filename, callback){
    request.head(uri, function(err, res, body){               
        console.log('content-type:', res.headers['content-type']);
        console.log('content-length:', res.headers['content-length']);
        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);               
    });
};

var createUrls = function (obj){
    var dlcounter = 0;
    var urlbase = "http://tuning-solera.herokuapp.com/",
        frames = [0,1,2,3,4,5,6,7,"home"];
        //We need just to off these frames
        
    for (var key in obj){
         
        var model = obj[key];        
            model.urls = []; 
              
        var saveDir = baseDir + '/' + model.audaID + '_' + model.doors + model.style;
        
        mkdirp(saveDir, function(err) { 
            if (err) console.error(err);            
        });
        
        for ( var i = 0; i < model.colors.length; i++ ){
            
            for ( var j = 0; j < frames.length; j++ ){   
                var getcolor = model.colors[i].split("_"),
                    color = getcolor[0], 
                    url = urlbase + model.audaID + '/' + model.doors + '/' + model.style + '/' + color + "/" + frames[j];
                                    
                model.urls.push(url);
                dlcounter++
                
                //download('https://www.google.com/images/srpr/logo3w.png', saveDir + '/google_' + model.colors[i] + '_' + frames[j] + '.png', function(){
                //     
                // });                                
            }                
        }
        console.log(model.urls);
        console.log(dlcounter);
   
    }  
    
    
}

app.get('/', function (req, res) {
    res.send("Home");
})


app.get('/csvtojson/:filename', function (req, res){
    //calling a file called 2d.csv from the url http://localhost:3000/csvtojson/2d
    //look at the file in the root of the project directory
    
    const filename      = 'data/' + req.params.filename + '.csv';   
    console.log(filename);
    const csv = require('csvtojson');
    
    var output = [],
        usedAudaIDs = [],
        i = 0,
        totalDupesProcessed = 0,
        checkedcounter = 0,
        addedcounter = 0;
    
    csv()
    .fromFile(filename)
    .on('json',(obj)=>{
        
        //Get the audaID
        var audaID = obj.audaID.substring(0,4);
        var colors = obj.colors.split("|");
        
        //If we haven't processed this ID yet        
        if (!usedAudaIDs.includes(audaID)){
                               
            // Get the doors & bodystyle find the position of the string "DR "; Note the space
            var desc = obj.description,            
                doorPos = desc.indexOf("DR "),
                doors   = desc.substring(doorPos -1 ,doorPos),
                style   = desc.substring(doorPos +3 ,doorPos + 4);
            
            // Get the colors
            
            var colorlist = [];            

            for ( var n = 0; n < colors.length; n+= 3 ){
                 
                var hex = colors[n+1],
                    name = colors[n+3];

                if (!colorlist.includes(hex + '_' + name)){
                    if (hex != null){
                        colorlist.push(hex + '_' + name);
                    }
                }
            }                   
            
            // Create new object to hold the information.
            var objToAdd = {
                audaID : audaID,
                doors: doors,
                style : style,
                colors : colorlist
            };            
            
            //Push the object to our json output array
            output.push(objToAdd);  
        
            //Make sure we update our list of used IDs
            usedAudaIDs.push(audaID);
            
            //Update the counter for clarity
            i++;
            
        } else {
            
          // If the ID has been used we need to find the key of the audaID in the array 
            for ( var n = 0; n < output.length; n++ ){
                 if (output[n].audaID === audaID){
                     console.log("yeah found duplicate to add colors to");
                            
                    for ( var j = 0; j < colors.length; j+= 3 ){

                        var hex = colors[j+1],
                            name = colors[j+3];
                        
                        checkedcounter++;
                        if (!output[n].colors.includes(hex + '_' + name)) {
                            if (hex != null){
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
    .on('done',(error)=>{                
        
        console.log("Original: " + i + " Duplicates: " + totalDupesProcessed + " Total overall: " + (i+totalDupesProcessed));
        console.log(addedcounter + ' out of ' + checkedcounter );        
        createUrls(output);
        res.send("Made it to the end");
    })

})



app.listen(3001);
