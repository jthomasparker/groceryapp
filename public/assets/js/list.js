var listOfProducts = [];
var displayingExistingList = false;
var productsToDeleteFromSavedList = [];
var productsToAddFromSavedList = [];
var KrogerArray = [];
var PublixArray = [];
var WalmartArray = [];
var currentProdNames = []
var KrogerTotal;
var PublicTotal;
var WalmartTotal;

//TEST DATA
var TestStore1 = {
    store_name: "Store 1",
    street: "Peachtree Street",
    city: "Atlanta",
    state: "FL",
    zip: "30309"
};
var TestStore2 = {
    store_name: "Walmart",
    street: "835 Martin Luther King Junior Drive Northwest",
    city: "Atlanta",
    state: "GA",
    zip: "30314"
};
var TestProduct1 = {
    product_name: "Bread",
    price: 2.75,
    StoreId: 12
};
var TestProduct2 = {
    product_name: "Bread",
    price: 2.65,
    StoreId: 2
};
var TestProduct3 = {
    product_name: "Bread",
    price: 3.00,
    StoreId: 22
};
var TestUser = {
    username: "BananaLover338",
    hash: "hashtokenhere123456789",
    userFirstName: "Petunia",
    userLastName: "Higgins",
    userEmailAddress: "petty@ninja.com"
}


// $.post("/api/stores", TestStore2).then(function(data){
//     console.log(data);
// });
// $.post("/api/products", TestProduct1).then(function(data){
//     console.log("ADDING PRODUCT?!");
//     console.log(data);
// })
// $.post("/api/products", TestProduct2).then(function(data){
//     console.log("ADDING PRODUCT?!");
//     console.log(data);
// })
// $.post("/api/products", TestProduct3).then(function(data){
//     console.log("ADDING PRODUCT?!");
//     console.log(data);
// })
// $.post("/api/users", TestUser).then(function(data){
//     console.log(data);
// });

$(document).ready(function () {
    $('.badge').hide();
    populateSavedLists(2);

    if(listOfProducts.length == 0){
        $("#btnSave").hide();
       var msgDiv = $("<div id='emptyMsg'>");
       msgDiv.html("<i>Start creating your list by adding products above!</i>")
        $(".list").append(msgDiv);
    }

    $('#btnSearch').on('click', function () {        
        var productSearched = $("#productSearch").val();
        $('.badge').hide();
        $('#emptyMsg').hide();
        $("#btnSave").show();
        //find the product from the db using search like
        $.get("/api/products/" + productSearched, function (data) {
            renderOptimizedList(data);
            if(displayingExistingList){
                productsToAddFromSavedList.push(data[0].id);
            }
        });
        $(this).blur();
    });
    $('#btnSave').on('click', function () {
        $("#modalMsg").empty();
        var listName = $("#listNameLabel").text();
        if(!displayingExistingList){
            $('#saveModal').modal('show');            
        }
        else{
            //remove the products
            if(productsToDeleteFromSavedList.length > 0){
                for(var i = 0; i < productsToDeleteFromSavedList.length; i++){
                    $.ajax({
                        method: "DELETE",
                        url: "/api/list/2/" + listName + "/" + productsToDeleteFromSavedList[i]
                      }).then(console.log("DELETED " + productsToDeleteFromSavedList[i]));
                }         
            }
            //add the products
            if(productsToAddFromSavedList.length > 0){
                for(var i = 0; i < productsToAddFromSavedList.length; i++){
                    $.post("/api/list/2/" + listName + "/" + productsToAddFromSavedList[i])
                    .then(console.log("ADDED " + productsToAddFromSavedList[i]));
                }    
            } 
        }        
        $(this).blur();
    });
    $('#saveName').on('click', function(){
        var listName = getListNameFromUser();
        if(listName != "" || listName != undefined){
            listOfProducts.forEach(product => {
                upsertList({
                    list_name: listName
                }, product, 2);
            });
            populateSavedLists(2);
            $('#saveModal').modal('hide');
            displayingExistingList = true;
        }        
    });

    
})
function upsertList(listData, prod, user) {
    var productID = prod;
    var userID = user;
    $.post("/api/lists/" + productID + "/" + userID, listData)
        .then(function (data) {
            console.log(data);
        });
}

function renderOptimizedList(data) {
    if (listOfProducts.indexOf(data[0].id) == -1) {
        for (var i = 0; i < data.length; i++) {
            renderProductOnPage(data[i]);
        }
    }
    else {
        //error message, you have already added this product to your list.
        $('.badge').show();
    }
}

function renderProductOnPage(data) {
    if(data.Store === undefined){
        data = data.Product;
    }
    var productResultDiv = $("<div>");
    productResultDiv.attr("id", "product-result-" + data.id);
    productResultDiv.attr("class", "panel-body row");
    var productPriceHeading = $("<div class='panel-heading'>");
    productPriceHeading.append("<p class='productName'>" + data.product_name + "</p>");
    productPriceHeading.append("<p class = 'price'>" + data.price + "</p>");
    var storeInfoDiv = $("<div class='storeInfo '>");
    storeInfoDiv.append("<p>" + data.Store.store_name + "</p>");
    storeInfoDiv.append("<p>" + data.Store.street + "</p>");
    storeInfoDiv.append("<p>" + data.Store.city + ", " + data.Store.state + " " + data.Store.zip + "</p>");
    productResultDiv.append(productPriceHeading, storeInfoDiv);
    productResultDiv.append(productPriceHeading, storeInfoDiv);
    productResultDiv.append("<a id='" + data.id + "' class='btn btn-info btn-lg removeProductBtn' onclick = remove(this)><span class='glyphicon glyphicon-remove'></span> Remove </a>'");
    $(".list").append(productResultDiv);
    listOfProducts.push(data.id);
}

function remove(thisBtn) {
    var prodId = thisBtn.getAttribute("id");
    var productDivToRemove = document.getElementById("product-result-" + prodId);
    productDivToRemove.remove();
    var indexToRemove = listOfProducts.indexOf(parseInt(prodId));
    listOfProducts.splice(indexToRemove, indexToRemove + 1);

    //if product is not in the new list to Add then remove it from the database
    if(displayingExistingList && productsToAddFromSavedList.indexOf(prodId) == -1){
        productsToDeleteFromSavedList.push(prodId);
    }
    //if product is in the new list to Add then remove it from the array to add
    else if(displayingExistingList){
        var toRemoveIndex = productsToAddFromSavedList.indexOf(prodId);
        productsToAddFromSavedList.splice(toRemoveIndex, toRemoveIndex + 1);
    }
    if(listOfProducts.length == 0){
        $("#btnSave").hide();
    }
}

function populateSavedLists(userID) {        
    var div = $("#savedLists");
    div.empty();
    $.get("/api/lists/" + userID, function (data) {
        if (data[0].length != 0) {
            for (var i = 0; i < data[0].length; i++) {
                div.append("<button type='button' onclick='populateSavedListProduct(this)' id= '" + data[0][i].list_Name + "' " + "class='getListBtn savedLists btn btn-default btn-large' id='btnSearch'>" + data[0][i].list_Name.toString() + "</button>");
            }
        }
        else {
            renderEmpty();
        }
        nameInput.val = "";        
    });
}

function renderEmpty() {
    var alertDiv = $("#savedLists");
    alertDiv.addClass("alert alert-warning");
    alertDiv.text("No lists saved.");
}

function populateSavedListProduct(btn) { 
    $('.badge').hide();
    $("#btnSave").show();
    listOfProducts = []; 
    displayingExistingList = true;  
    $(".list").empty();
    $.get("/api/list/2/" + btn.id, function (data) {
        for (var i = 0; i < data.length; i++) {
            renderProductOnPage(data[i]);
        }
    });
    $("#listNameLabel").text(btn.id);
}

function getListNameFromUser(){
    if($('#nameInput').val() != "") {
        return $('#nameInput').val().trim();
    }
    else{
        $("#modalMsg").text("Please enter a list name to save your list");        
    }
}

function getTotalsForEachStore(productArray){
    var productNames = [];
    
    if(listOfProducts.length > 0){
        listOfProducts.forEach(prodId => {
            
        });
    }
    //get product name for each Id in productArray and put them into an array
    //loop through that array to get each price per store and put them into respective arrays
    
}