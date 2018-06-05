var db = require('../models');
var fs = require('fs')
var taggunKey = 'aa7e7df05fa111e89de28943ab9a8b4e'
var request = require('request')
var path = require("path");

module.exports = function (app) {

  app.post('/api/receipt', function (req, res) {
    var base64String = req.body.imgBase64
    var base64Image = base64String.split(';base64,').pop();
    fs.writeFile('receipt.png', base64Image, { encoding: 'base64' }, function (err) {

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
        var parsedBody = JSON.parse(body)
        if (!parsedBody.error) {
          processReceipt(parsedBody)
        }
        res.json(body)
      });
    })
  });

  //use for inserting PRODUCTS to db, presumably from scanner response
  app.post("/api/products", function (req, res) {
    db.Product.create(req.body).then(function (dbProduct) {
      res.json(dbProduct);
    })
  });

  //use for inserting STORES to db, presumably from scanner response
  app.post("/api/stores", function (req, res) {
    db.Store.create(req.body).then(function (dbStore) {
      res.json(dbStore);
    })
  });

  //use for inserting USERS to db
  app.post("/api/users", function (req, res) {
    db.User.create(req.body).then(function (dbUser) {
      res.json(dbUser);
    })
  });

  //use for inserting lists to db
  app.post("/api/lists/:product/:user", function (req, res) {
    req.body.ProductId = req.params.product;
    req.body.UserId = req.params.user;
    db.List.create(req.body).then(function (dbList) {
      res.json(dbList);
    });
  });

  //get cheapest top product by product name
  app.get("/api/products/:product_name", function (req, res) {
    db.Product.findAll({
      where: {
        product_name: req.params.product_name
      },
      limit: 1,
      order: [
        ['price', 'ASC']
      ],
      include: [db.Store]
    }).then(function (results) {
      console.log(results);
      res.json(results);
    });
  });

  //use for getting product names from product ID
  app.get("/api/product/:id", function (req, res) {
    db.Product.findOne({
      where: { id: req.params.id },
      include: [db.Store]
    }).then(function (results) {
      res.json(results);
    })
  });

  //use for inserting records into list
  app.post("/api/list", function (req, res) {
    db.List.create(req.body).then(function (dbList) {
      res.json(dbList);
    });
  });

  //use for getting saved list names from user; for side column
  app.get("/api/lists/:user", function (req, res) {
    db.sequelize.query('SELECT DISTINCT list_Name FROM lists WHERE UserId = ' + req.params.user)
      .then(function (data) {
        console.log(data);
        res.json(data);
      });
  });

  //use for getting saved lists for user for name
  app.get("/api/list/:user/:name", function (req, res) {
    db.List.findAll({
      where: {
        list_name: req.params.name,
        userId: req.params.user
      },
      include: [{
        model: db.Product,
        include: [{
          model: db.Store
        }]
      }]
    }).then(function (results) {
      console.log(results);
      res.json(results);
    });
  });
  //user for removing products from list
  app.delete("/api/list/:user/:listName/:product", function (req, res) {
    db.List.destroy({
      where: {
        UserId: req.params.user,
        list_name: req.params.listName,
        ProductId: req.params.product
      }
    }).then(function (dbList) {
      res.json(dbList);
    })
  });
  //use for adding products to an existing list
  app.post("/api/list/:user/:listName/:product", function (req, res) {
    req.body.ProductId = req.params.product;
    req.body.UserId = req.params.user;
    req.body.list_name = req.params.listName;
    db.List.create(req.body).then(function (dbList) {
      res.json(dbList);
    });
  });

  //use for getting total of product from certain store
  app.get("/api/products/:productName/:storeName", function (req, res){
    db.Product.findOne({
      where: { product_name: req.params.productName},
      order: [
        ['updatedAt', 'DESC'],
        ['price', 'ASC']
      ],
      include: [{ 
        model: db.Store, 
        where: {store_name: req.params.storeName}}]
    }).then(function (results) {
      console.log(results);
      res.json(results);
    })
  });

  function processReceipt(recData) {
    var store;
    var storeId;
    var storeAddress = function (street, city, state, zip) {
      street = this.street,
        city = this.city,
        state = this.state,
        zip = this.zip
    }
    if (recData.merchantName.confidenceLevel > 0) {
      store = recData.merchantName.data
      if (recData.merchantAddress.confidenceLevel > 0) {
        // fill in storeAddress
        // find store that matches store && storeAddress.street
      }
    } else {
      store = "unknown"
    }

    db.Store.findOrCreate({ where: { store_name: store }, defaults: {} })
      .spread((store, created) => {
        //  console.log(store.get({
        //      plain: true
        //  }))
        console.log(storeId = store.id)
      })

  }

}