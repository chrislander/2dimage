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
        totalDupesProcessed = 0;
    
    csv()
    .fromFile(filename)
    .on('json',(obj)=>{
        
        //Get the audaID
        var audaID = obj.audaID.substring(0,4);        
                
        //If we haven't processed this ID yet        
        if (!usedAudaIDs.includes(audaID)){
            
            // Get the colors
            var colors = obj.colors.split("|");
                colorlist = [];
                
            for ( var n = 0; n < colors.length; n+= 3 ){
                 colorlist.push({
                     name: colors[n+3],
                     hex: colors[n+1]
                 });
            }            
            
            // Get the doors & bodystyle
            
            
            // Create new object to hold the information.
            var objToAdd = {
                audaID : audaID,
                doors: 4,
                style : 'S',
                colors : JSON.stringify(colorlist)
            }            
            
            //Push the object to our json output array
            output.push(objToAdd);  
        
            //Make sure we update our list of used IDs
            usedAudaIDs.push(audaID);
            
            //Update the counter for clarity
            i++;
            
        } else {
            
          // If the ID has been used we need to add in the unique colors  
            for ( var n = 0; n < output.length; n++ ){
                 if (output[n].audaID == audaID){
                     console.log("yeah found duplicate to add colors to");
                 }
                 //console.log(n);
            }    
            totalDupesProcessed++;
            
        }
     

        
    })
    .on('done',(error)=>{
        //console.log(output);
        //console.log(usedAudaIDs);
        //console.log(i)
        //console.log(output[1])
        console.log(totalDupesProcessed);
        console.log("Original: " + i + " Duplicates: " + totalDupesProcessed + " Total overall: " + (i+totalDupesProcessed))
 
    })
    
  
   
})

app.listen(3000)
