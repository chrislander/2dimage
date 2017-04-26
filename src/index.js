
var express  = require('express'),
    app      = express();
                       
app.get('/', function (req, res) {
    res.send("Home");
})

app.get('/parse/:filename', function (req, res){        
    var filename    = 'data/' + req.params.filename + '.csv';     
    var output      = require('./models/parse.js');    
    output.process(filename); 
})

app.get('/urls/:filename', function (req, res){
    var filename    = 'data/' + req.params.filename + '.json';     
    var output      = require('./models/generate_urls.js');    
    output.generate_urls(filename);        

})

app.get('/download/:filename', function (req, res){
    var filename    = 'data/' + req.params.filename + '.json';     
    var download      = require('./models/download.js');    
    download.download_all(filename);
    //download.download_single();
})

app.listen(3000);
