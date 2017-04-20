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
    
    var audaID      = req.params.audaID;
    var doors       = req.params.doors;
    var bodystyle   = req.params.bodystyle;
    
    var frames = [0,1,2,3,4,5,6,7,"home"];
    var colors = ["FFFFFF","000000","AAAAEE"];
   
    var urls = [];
    var urlbase = "http://tuning-solera.herokuapp.com/";
    
    for ( var i = 0; i < colors.length; i++ ){
        for ( var j = 0; j < frames.length; j++ ){            
            var url = urlbase + audaID + '/' + doors + '/' + bodystyle + '/' + colors[i] + "/" + frames[j];
            var saveDir = baseDir + '/' + audaID + '_' + doors + bodystyle;
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

app.listen(3000)
