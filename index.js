var  express  = require('express');
     app      = express();
     path     = require('path');
     fs       = require('fs');
     request  = require('request');     
     mkdirp   = require('mkdirp');
     
    baseDir  = 'saved';
     
var download = function(uri, filename, callback){
    request.head(uri, function(err, res, body){
      console.log('content-type:', res.headers['content-type']);
      console.log('content-length:', res.headers['content-length']);

      request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};

app.get('/', function (req, res) {
    res.send('<h1>Solera</h1>')
})

app.get('/generate/:audaID/:doors/:bodystyle/', function (req, res){
    
    var audaID      = req.params.audaID,
        doors       = req.params.doors,
        bodystyle   = req.params.bodystyle,
        frames = [0,1,2,3,4,5,6,7,"home"],
        colors = ["FFFFFF","000000","AAAAEE"],
        urls = [],
        urlbase = "http://tuning-solera.herokuapp.com/";
    
    for ( var i = 0; i < colors.length; i++ ){
        for ( var j = 0; j < frames.length; j++ ){            
            var url = urlbase + audaID + '/' + doors + '/' + bodystyle + '/' + colors[i] + "/" + frames[j],
                saveDir = baseDir + '/' + audaID + '_' + doors + bodystyle;
            urls.push(url);   
            
            mkdirp(saveDir, function(err) { 
                console.log('error creating directory')
            });
            
            
            download('https://www.google.com/images/srpr/logo3w.png', saveDir + '/google_' + colors[i] + frames[j] + '.png', function(){
                 console.log('done');
             });             
        }        
    }
    
   res.send(urls);


})


app.get('/csvtojson/:filename', function (req, res){
    
    const filename      = req.params.filename + '.csv';        
    const csv = require('csvtojson')
    
    var output = [],
        usedAudaIDs = [],
        i = 0;
        totalDupesProcessed = 0,
        checkedcounter =0,
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
                 
                 /*
                 colorlist.push({
                     name: colors[n+3],
                     hex: colors[n+1]
                 });
                 */
                var hex = colors[n+1],
                    name = colors[n+3]
                
                if (!colorlist.includes(hex + '_' + name) && hex != null){
                    colorlist.push(hex + '_' + name);
                }
                
            }                   
            
            // Create new object to hold the information.
            var objToAdd = {
                audaID : audaID,
                doors: doors,
                style : style,
                colors : colorlist
            }            
            
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
                            name = colors[j+3]
                        checkedcounter++;
                        if (!output[n].colors.includes(hex + '_' + name) && hex != null){
                            output[n].colors.push(hex + '_' + name);
                            addedcounter++;
                        }
                    }
            
                 }
                 //console.log(n);
            }    
            totalDupesProcessed++;
            
        }
        

        
    })
    .on('done',(error)=>{
        
        console.log(JSON.stringify(output));
        console.log("Original: " + i + " Duplicates: " + totalDupesProcessed + " Total overall: " + (i+totalDupesProcessed))
        console.log(addedcounter + ' out of ' + checkedcounter );
 
    })
    
  
   
})

app.listen(3000)
