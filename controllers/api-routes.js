var db = require('../models');
var fs = require('fs')
var taggunKey = 'aa7e7df05fa111e89de28943ab9a8b4e'
var request = require('request')
var path = require("path");
const Op = db.sequelize.Op;
var logic = require('./logic.js')

module.exports = function(app){

    app.post('/api/receipt', function(req, res){
       var base64String = req.body.imgBase64
       var base64Image = base64String.split(';base64,').pop();
       fs.writeFile('receipt.png', base64Image, {encoding: 'base64'}, function(err){
           
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
            console.log('Upload successful!');
            var parsedBody = JSON.parse(body)
            if(!parsedBody.error){
                logic.processReceipt(parsedBody, (storeInfo, productRecords) => {
                    console.log(storeInfo, productRecords)
                    var data = {
                        store: storeInfo,
                        products: productRecords
                    }
                    res.json(data)
                })
            } else {
                res.json(parsedBody)
            }
            
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

    //get products by product name
    app.get("/api/products/:product_name", function(req, res) {
      db.Product.findAll({
        where: {
          product_name: req.params.product_name
        },
        include: [db.Store]
      }).then(function(results){
        console.log(results);
        res.json(results);
      });
    });

    //use for inserting records into list
    app.post("/api/list", function(req,req){
      db.List.create(req.body).then(function(dbList){
        res.json(dbList);
      })
    })

    // updates the database with receipt results
    app.post("/api/update", function(req, res){
        console.log(req.body.products)
        console.log(req.body.descriptions)
        var products = req.body.products;
        var descriptions = req.body.descriptions
        logic.updateProducts(products, descriptions)

        res.json('ok')
    })
}