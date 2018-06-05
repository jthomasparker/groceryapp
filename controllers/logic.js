const db = require('../models');
const Op = db.sequelize.Op;
    
    // parses out results from the receipt
    exports.processReceipt = function (recData, callback){
        var store;
        var storeId;
        var productRecords = [];
        // constructor for store name/address
        var StoreInfo = function(storeName, street, city, state, zip){
            this.storeName = storeName,
            this.street = street,
            this.city = city,
            this.state = state,
            this.zip = zip
        };
        // constructor for receipt record
        var Record = function(productName, price, storeId, desc){
            this.product_name = productName,
            this.price = price,
            this.StoreId = storeId,
            this.desc = desc
        };
    
        var newStore = new StoreInfo()
    
        // determine if the api returned the store and address
        if(recData.merchantName.confidenceLevel > 0){
            store = recData.merchantName.data;
            if(recData.merchantAddress.confidenceLevel > 0){
                // fill in storeAddress
                // find store that matches store && storeAddress.street
            };
        } else {
            store = "Unknown";
        };
    
        newStore.storeName = store;
        
    
        // find the store record else create it, return its id
        db.Store.findOrCreate({where: {store_name: store}, defaults: {store_name: store}})
            .spread((store, created) => {
              return storeId = store.id;
            })
        .then(function(storeId){
            var totalRecords = recData.lineAmounts.length;
            var recordCount = 0;
            // go through the results
           recData.lineAmounts.forEach(lineItem => {
            var productName = "Unknown";
            var price = lineItem.data;
            var desc = lineItem.text;
            var priceStr = price.toString();
            var tempArr = desc.split(" ");
    
            // exclude the tax line and any line that didn't get a price
            if(tempArr.indexOf('%') === -1 && typeof(price) === 'number'){
                // create a new product record
                var newProduct = new Record(productName, price, storeId, desc)
                var priceIdx = tempArr.indexOf(priceStr);
                // remove the price from the description
                if(priceIdx > -1){
                    tempArr.splice(priceIdx, 1);
                    desc = tempArr.join("");
                    newProduct.desc = desc;
                };
                // find the product name that matches the description in the ref table
                db.Reference.findOne({
                    where: {
                        [Op.or]: [
                            { 
                                description: {
                                [Op.like]: '%' + desc + '%'
                                }
                            },
                            {
                                desc_walmart: {
                                    [Op.like]: '%' + desc + '%'
                                }
                            },
                            {
                                desc_kroger: {
                                    [Op.like]: '%' + desc + '%'
                                }
                            },
                            {
                                desc_publix: {
                                    [Op.like]: '%' + desc + '%'
                                }
    
                            }
                        ]
                    },
                    include: [db.Productname]
                }).then(result => {
                    // update the product record if a match is found
                    if(result){
                     //   productName = result.dataValues.product_name;
                            productName = result.dataValues.Productname.dataValues.name

                        
                        newProduct.product_name = productName;
                    };
                    // add the product record to the array
                    productRecords.push(newProduct);
                    recordCount++
                    // call callback only after all promises are resolved
                    if(recordCount === totalRecords){
                        callback(newStore, productRecords)
                    };
                });
            } else {
                recordCount++
            }
        });
    });
    }

    exports.updateProducts = function(products, descriptions){
        // updates the products table
        db.Product.bulkCreate(products).then(() => {
            return db.Product.findAll();
          }).then(result => {
            console.log(result)
          }) 

          // loops through the descriptions/names to update those tables
        descriptions.forEach(item => {
            var productName = item.name
            var desc = item.description
            
            db.Reference.findOne({
                where: {
                    description: {
                        [Op.like]: '%' + desc + '%'
                        }
                },
                include: [db.Productname]
            }).then(result => {
                // if the description exists
                if(result){
                    console.log("result:",result)
                    var prodId = result.dataValues.ProductnameId
                    // update productname table with productName
                    return db.Productname.update(
                        {
                        name: productName
                        },
                        {
                        where: {id: prodId}
                        }
                    )
                    
                } else {
                    // check to see if the productname already exists, create it if it doesn't
                        db.Productname.findOrCreate({
                        where: {
                            name: {
                                [Op.like]: '%' + productName + '%'
                            }
                        },
                        defaults: {
                            name: productName,
                        }
                    }).spread((product, created) => {
                       // create the description reference with the new productnameId
                        var prodId = product.dataValues.id
                            db.Reference.create({
                            product_name: productName,
                            description: desc,
                            ProductnameId: prodId
                        }).then(result => {
                            console.log("Created:",result)
                            return {item: result, created: true}
                        })
                    }) 
                }
            }).spread((data, message)=>{
                console.log(data, message)
            })

        })
        
    }