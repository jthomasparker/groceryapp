var listOfProducts = [];

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

// $.post("/api/stores", TestStore2).then(function(data){
//     console.log(data);
// });
// $.post("/api/products", TestProduct1).then(function(data){
//     console.log("ADDING PRODUCT?!");
//     console.log(data);
// })
$(document).ready(function () {
    $('#btnSearch').on('click', function () {
        var productSearched = $("#productSearch").val();
        //find the product from the db using search like
        $.get("/api/products/" + productSearched, function (data) {
            console.log(data);
            renderOptimizedList(data);
        });
        //add it to the array and display it
        $(this).blur();
    });

    $('a').on('click', '.removeProductBtn', function(){
        console.log("dis clicked")
        var thisBtn = $(this);
        var prodId = $(this).attr("id");
    
        var productDivToRemove = document.getElementById("product-result-" + prodId);
        productDivToRemove.remove();
        
        var indexToRemove = listOfProducts.indexOf(prodId);
        listOfProducts.splice(indexToRemove, indexToRemove + 1);
    });
})

function renderOptimizedList(data) {
    console.log(data);

    if(listOfProducts.indexOf(data.id) == -1){
        for (var i = 0; i < data.length; i++) {
            var productResultDiv = $("<div>");
            productResultDiv.attr("id", "product-result-" + data[i].id);
            productResultDiv.attr("class", "panel-body");             
            var productPriceHeading = $("<div class='panel-heading'>");         
            productPriceHeading.append("<p class='productName'>" + data[i].product_name + "</p>");
            productPriceHeading.append("<p class = 'price'>" + data[i].price + "</p>");
            var storeInfoDiv = $("<div class='storeInfo '>");
            storeInfoDiv.append("<p>" + data[i].Store.store_name + "</p>");
            storeInfoDiv.append("<p>" + data[i].Store.street + "</p>");
            storeInfoDiv.append("<p>" + data[i].Store.city + ", " + data[i].Store.state + " " + data[i].Store.zip + "</p>");
            productResultDiv.append(productPriceHeading, storeInfoDiv);
            
            productResultDiv.append(productPriceHeading, storeInfoDiv);
            productResultDiv.append("<a id='" + data[i].id + "' class='btn btn-info btn-lg removeProductBtn' onclick = remove(this)><span class='glyphicon glyphicon-remove'></span> Remove </a>'");
            $(".list").append(productResultDiv);  
            listOfProducts.push(data[i].id);
          }
        
    }
    else{
        //error message, you have already added this product to your list.
        console.log("this product already in list");
    }
}

function remove(thisBtn){
    console.log(thisBtn)
    var prodId = thisBtn.getAttribute("id");

    var productDivToRemove = document.getElementById("product-result-" + prodId);
    productDivToRemove.remove();
    
    var indexToRemove = listOfProducts.indexOf(parseInt(prodId));
    listOfProducts.splice(indexToRemove, indexToRemove + 1);
}

