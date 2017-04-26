var path    = require('path'),
    fs      = require('fs'),
    request = require('request'),
    mkdirp  = require('mkdirp');



// Example call
// download('https://www.google.com/images/srpr/logo3w.png', saveDir + '/google_' + model.colors[i] + '_' + frames[j] + '.png', function(){     
// });          
//

exports.download_all = function (filename) {    
    
    var models  = JSON.parse(fs.readFileSync(filename, 'utf8')); 

    for (var key in models){
        var model = models[key],
            dir = 'saved/'+model.audaID+'_'+model.doors+model.style,
            filename = /google_' + model.colors[i] + '_' + frames[j] + '.png'
            return console.log(dir);
        for (var i in obj.urls){
            
        }
    }
    
    this.makedir();
    this.download();
 
}

exports.download_single = function (obj, audaID) {
    return console.log('in download single');
}

exports.makedir = function (){
    return console.log('in makedir');
    mkdirp(saveDir, function (err) {
        if (err)
            console.error(err);
    });    
}

exports.download = function (uri, filename, callback) {        
    return console.log('in download');
    request.head(uri, function (err, res, body) {
        console.log('content-type:', res.headers['content-type']);
        console.log('content-length:', res.headers['content-length']);
        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};  
