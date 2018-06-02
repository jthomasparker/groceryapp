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
    });

    //use for inserting PRODUCTS to db, presumably from scanner response
    app.post("/api/products", function(req, res) {
      db.Product.create(req.body).then(function(dbProduct) {
        res.json(dbProduct);
      })
    });

    //use for inserting STORES to db, presumably from scanner response
    app.post("/api/stores", function(req, res) {
      db.Store.create(req.body).then(function(dbStore) {
        res.json(dbStore);
      })
    });

    //get cheapest top product by product name
    app.get("/api/products/:product_name", function(req, res) {
      db.Product.findAll({
        where: {
          product_name: req.params.product_name
        },
        limit: 1,
        order: [
          ['price', 'ASC']
        ],
        include: [db.Store]
      }).then(function(results){
        console.log(results);
        res.json(results);
      });
    });




}