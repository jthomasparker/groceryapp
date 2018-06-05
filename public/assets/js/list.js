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

    if (listOfProducts.length == 0) {
        emptyListDisplay();
    }

    $('#btnSearch').on('click', function () {
        var productSearched = $("#productSearch").val();
        $('.badge').hide();
        $('#emptyMsg').hide();
        $("#btnSave").show();
        $('#optimizedTotal').show();
        //find the product from the db using search like
        $.get("/api/products/" + productSearched, function (data) {
            renderOptimizedList(data);
            if (displayingExistingList) {
                productsToAddFromSavedList.push(data[0].id);
            }
        });
        $(this).blur();
    });
    $('#btnSave').on('click', function () {
        $("#modalMsg").empty();
        var listName = $("#listNameLabel").text();
        if (!displayingExistingList) {
            $('#saveModal').modal('show');
        }
        else {
            //remove the products
            if (productsToDeleteFromSavedList.length > 0) {
                for (var i = 0; i < productsToDeleteFromSavedList.length; i++) {
                    $.ajax({
                        method: "DELETE",
                        url: "/api/list/2/" + listName + "/" + productsToDeleteFromSavedList[i]
                    }).then(console.log("DELETED " + productsToDeleteFromSavedList[i]));
                }
            }
            //add the products
            if (productsToAddFromSavedList.length > 0) {
                for (var i = 0; i < productsToAddFromSavedList.length; i++) {
                    $.post("/api/list/2/" + listName + "/" + productsToAddFromSavedList[i])
                        .then(console.log("ADDED " + productsToAddFromSavedList[i]));
                }
            }
            $(".list-save").text(listName + " has been updated!")
            $("#updatedModal").modal('show');
            productsToDeleteFromSavedList = [];
            productsToAddFromSavedList = [];
        }
        $(this).blur();
    });
    $('#btnPrint').on('click', function () {
        var prtContent = document.getElementById("#printThis");
        var WinPrint = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
        WinPrint.document.write(prtContent.innerHTML);
        WinPrint.document.close();
        WinPrint.focus();
        WinPrint.print();
        WinPrint.close();
        window.print();
    })
    $('#saveName').on('click', function () {
        var listName = getListNameFromUser();
        if (listName != "" || listName != undefined) {
            listOfProducts.forEach(product => {
                $.get("/api/product/" + product.id, function (data) {
                    product.id = data[0].id;
                })
                upsertList({
                    list_name: listName
                }, product.id, 2);
            });
            populateSavedLists(2);
            $('#saveModal').modal('hide');
            displayingExistingList = true;
            populateSavedListProduct(listName);
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

function productAlreadyInList(product) {
    var productAlreadyInList = false;
    for (var i = 0; i < listOfProducts.length; i++) {
        if (listOfProducts[i].id == product[0].id) {
            productAlreadyInList = true;
        }
    }
    return productAlreadyInList;
}

function renderOptimizedList(data) {
    if (!productAlreadyInList(data)) {
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
    if (data.Store === undefined) {
        data = data.Product;
    }
    var productResultDiv = $("<div>");
    productResultDiv.attr("id", "product-result-" + data.id);
    var productInfoDiv = $("<div>")
    productInfoDiv.attr("class", "panel-body row");
    var productRemoveHeading = $("<div class='col-xs-2'>");
    productRemoveHeading.append("<a id='" + data.id + "' class='removeProductBtn' onclick = remove(this)><span class='glyphicon glyphicon-remove'></span> Remove </a>");
    productInfoDiv.append(productRemoveHeading);
    var productNameHeading = $("<div class='productName col-xs-4'>");
    productNameHeading.append("<h4>" + data.product_name + "</h4>")
    productInfoDiv.append(productNameHeading);
    var productPriceHeading = $("<div class = 'price col-xs-4'>");
    productPriceHeading.append("<h4> $" + data.price.toFixed(2) + "</h4>");
    productInfoDiv.append(productPriceHeading);
    var spaceDiv = $("<div class='col-xs-2'>");
    productInfoDiv.append(spaceDiv);
    productResultDiv.append(productInfoDiv);
    var storeInfoRow = $("<div class='storeInfo panel-body row'>");
    var blankRemoveDiv = $("<div class='col-xs-2'>");
    storeInfoRow.append(blankRemoveDiv);
    var storeNameDiv = $("<div class='col-xs-4'>");

    storeNameDiv.append("<h5>" + data.Store.store_name + ", " + data.Store.city + "</h5>");
    storeInfoRow.append(storeNameDiv);
    productResultDiv.append(storeInfoRow);

    $(".list").append(productResultDiv);
    listOfProducts.push(data);
    getTotalsForEachStore();
}

function remove(thisBtn) {
    var prodId = thisBtn.getAttribute("id");
    var productDivToRemove = document.getElementById("product-result-" + prodId);
    productDivToRemove.remove();
    var indexToRemove;
    $.get("/api/product/" + prodId, function (data) {
        for (var i = 0; i < listOfProducts.length; i++) {
            if (listOfProducts[i].id == data.id) {
                indexToRemove = i;
            }
        }
        listOfProducts.splice(indexToRemove, 1);
        getTotalsForEachStore();
        if (listOfProducts.length == 0) {
            emptyListDisplay();
        }
    });

    //if product is not in the new list to Add then remove it from the database
    if (displayingExistingList && productsToAddFromSavedList.indexOf(prodId) == -1) {
        productsToDeleteFromSavedList.push(prodId);
    }
    //if product is in the new list to Add then remove it from the array to add
    else if (displayingExistingList) {
        var toRemoveIndex = productsToAddFromSavedList.indexOf(prodId);
        productsToAddFromSavedList.splice(toRemoveIndex, toRemoveIndex + 1);
    }

}

function populateSavedLists(userID) {
    var div = $("#savedLists");
    div.empty();
    $.get("/api/lists/" + userID, function (data) {
        if (data[0].length != 0) {
            for (var i = 0; i < data[0].length; i++) {
                div.append("<button type='button' onclick='populateSavedListProduct(this.id)' id= '" + data[0][i].list_Name + "' " + "class='getListBtn savedLists btn btn-default btn-large' id='btnSearch'>" + data[0][i].list_Name.toString() + "</button>");
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

function populateSavedListProduct(listName) {
    $('.badge').hide();
    $("#btnSave").show();
    $('#optimizedTotal').show();
    listOfProducts = [];
    displayingExistingList = true;
    $(".list").empty();
    $.get("/api/list/2/" + listName, function (data) {
        for (var i = 0; i < data.length; i++) {
            renderProductOnPage(data[i]);
        }
    });
    $("#listNameLabel").text(listName);
}

function getListNameFromUser() {
    if ($('#nameInput').val() != "") {
        return $('#nameInput').val().trim();
    }
    else {
        $("#modalMsg").text("Please enter a list name to save your list");
    }
}

function getTotalsForEachStore() {
    KrogerTotal = 0;
    PublixTotal = 0;
    WalmartTotal = 0;
    //this could totally be optimized by grabbing the stores and iterating thru them
    if (listOfProducts.length > 0) {
        listOfProducts.forEach(product => {
            $.get("/api/products/" + product.product_name + "/kroger", function (data) {
                KrogerTotal += data.price;
                //render in table
                $("#krogerTotal").text("$" + KrogerTotal.toFixed(2));

            });
            $.get("/api/products/" + product.product_name + "/publix", function (data) {
                PublixTotal += data.price;
                //render in table
                $("#publixTotal").text("$" + PublixTotal.toFixed(2));
            });
            $.get("/api/products/" + product.product_name + "/walmart", function (data) {
                WalmartTotal += data.price;
                //render in table
                $("#walmartTotal").text("$" + WalmartTotal.toFixed(2));
            });
        });
    }
    else {
        $("#krogerTotal").text("$-.--");
        $("#publixTotal").text("$-.--");
        $("#walmartTotal").text("$-.--");
    }
    getOptimizedTotal();
}

function getOptimizedTotal() {
    var total = 0;
    listOfProducts.forEach(product => {
        total += product.price;
    });
    $("#optimizedTotal").text("$" + total.toFixed(2));
}

function emptyListDisplay() {
    $("#btnSave").hide();
    $('#optimizedTotal').hide();
    var msgDiv = $("<div id='emptyMsg'>");
    msgDiv.html("<i>Start creating your list by adding products above!</i>")
    $(".list").append(msgDiv);
}