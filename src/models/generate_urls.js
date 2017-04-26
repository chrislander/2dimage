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