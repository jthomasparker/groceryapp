var listOfProducts = [];
var displayingExistingList = false;

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
    product_name: "Bananas",
    price: .25,
    StoreId: 12
};
var TestProduct2 = {
    product_name: "Eggs",
    price: 3.62,
    StoreId: 12
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
// $.post("/api/users", TestUser).then(function(data){
//     console.log(data);
// });


function upsertList(listData, prod, user) {
    var productID = prod;
    var userID = user;
    $.post("/api/lists/" + productID + "/" + userID, listData)
        .then(function (data) {
            console.log(data);
        });
}
$(document).ready(function () {

    populateSavedLists(2);

    $('#btnSearch').on('click', function () {
        var productSearched = $("#productSearch").val();
        //find the product from the db using search like
        $.get("/api/products/" + productSearched, function (data) {
            renderOptimizedList(data);
        });
        $(this).blur();
    });
    $('#btnSave').on('click', function () {
        $("#modalMsg").empty();
        if(!displayingExistingList){
            $('#saveModal').modal('show');            
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
            $('#saveModal').modal('hide');
        }        
    })

    $('a').on('click', '.removeProductBtn', function () {
        var thisBtn = $(this);
        var prodId = $(this).attr("id");
        var productDivToRemove = document.getElementById("product-result-" + prodId);
        productDivToRemove.remove();
        var indexToRemove = listOfProducts.indexOf(prodId);
        listOfProducts.splice(indexToRemove, indexToRemove + 1);
    });
})

function renderOptimizedList(data) {
    if (listOfProducts.indexOf(data.id) == -1) {
        for (var i = 0; i < data.length; i++) {
            renderProductOnPage(data[i]);
        }
    }
    else {
        //error message, you have already added this product to your list.
        console.log("this product already in list");
    }
}

function renderProductOnPage(data) {
    if(data.Store === undefined){
        data = data.Product;
    }
    var productResultDiv = $("<div>");
    productResultDiv.attr("id", "product-result-" + data.id);
    productResultDiv.attr("class", "panel-body");
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
}

function populateSavedLists(userID) {
    var div = $("#savedLists");
    div.empty();
    $.get("/api/lists/" + userID, function (data) {
        if (data[0].length != 0) {
            for (var i = 0; i < data[0].length; i++) {
                div.append("<button type='button' onclick='populateSavedListProduct(this)' id= '" + data[0][i].list_Name + "' " + "class='getListBtn savedLists btn btn-success btn-large' id='btnSearch'>" + data[0][i].list_Name.toString() + "</button>");
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
    displayingExistingList = true;  
    $(".list").empty();
    $.get("/api/list/2/" + btn.id, function (data) {
        for (var i = 0; i < data.length; i++) {
            renderProductOnPage(data[i]);
        }
    })
}

function getListNameFromUser(){
    if($('#nameInput').val() != "") {
        return $('#nameInput').val().trim();
    }
    else{
        $("#modalMsg").text("Please enter a list name to save your list");        
    }
}