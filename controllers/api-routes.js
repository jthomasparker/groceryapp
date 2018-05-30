var db = require('../models');
var fs = require('fs')
var taggunKey = 'aa7e7df05fa111e89de28943ab9a8b4e'
var request = require('request')

module.exports = function(app){
    app.post('/api/receipt', function(req, res){
        // get the img data and convert it to an img file
       var base64String = req.body.imgBase64
       var base64Image = base64String.split(';base64,').pop();
       fs.writeFile('receipt.jpeg', base64Image, {encoding: 'base64'}, function(err){
           
        // use the img data and img file, send it to taggun api
           request.post({
            "url": 'https://api.taggun.io/api/receipt/v1/verbose/encoded',
            "headers": { "apikey": taggunKey },
            "body": JSON.stringify({
                "image": base64Image,
                "filename": "receipt.png",
                "contentType": "image/png",
                "language": "en"
            })
          }, (err, httpResponse, body) => {
            if (err) {
              return console.error('upload failed:', err);
            }
            console.log('Upload successful! Server responded with:', body);
            res.json(body)
          });
       })
       

        
    })


}