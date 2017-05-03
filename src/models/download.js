var path    = require('path'),
    fs      = require('fs'),
    request = require('request'),
    mkdirp  = require('mkdirp');     

exports.read_file = function (filename){
    return JSON.parse(fs.readFileSync(filename, 'utf8'));     
};

exports.download_all = function (filename) {    
    
    var models  = this.read_file(filename);

    for (var key in models){
        var model = models[key],
            dir = 'saved/'+model.audaID+'_'+model.doors+model.style;  
            this.makedir(dir);
            console.log('here');
        for (var i in model.urls){             
            console.log(model.urls[i].url);            
            this.download(model.urls[i].url, dir +'/'+ model.urls[i].imgfilename, function(){     
                console.log('downloaded ' + model.urls[i].imgfilename);
            });  
            return;
           
        }
        return console.log('processed a model');
    }
 
};

exports.download_single = function (obj, audaID) {
    return console.log('in download single');
};

exports.makedir = function (dir){    
    mkdirp(dir, function (err) {
        if (err)
            console.error(err);
    });    
};

exports.download = function (uri, filename, callback) {        
    
    request.head(uri, function (err, res, body) {
        console.log('content-type:', res.headers['content-type']);
        console.log('content-length:', res.headers['content-length']);
        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};  
