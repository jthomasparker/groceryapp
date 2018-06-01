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
    store_name: "Piggly Wiggly",
    street: "Georgia Street",
    city: "Atlanta",
    state: "GA",
    zip: "33146"
};
var TestProduct1 = {
    product_name: "Bananas",
    price: .65,
    StoreId: 2
};
var TestProduct2 = {
    product_name: "Eggs",
    price: 3.62,
    StoreId: 12
};

// $.post("/api/stores", TestStore2).then(function(data){
//     console.log(data);
// });
// $.post("/api/products", TestProduct2).then(function(data){
//     console.log("ADDING PRODUCT?!");
//     console.log(data);
// })
$(document).ready(function() {
    $('#btnSearch').on('click', function(){
        console.log("button clicked");
        var productSearched = $("#productSearch").val();
        //find the product from the db using search like
        $.get("/api/products/" + productSearched, function(data){
            console.log(data);
            renderResultsList(data);
        });
        //add it to the array and display it
        $(this).blur();
    });
})
    
    

// choose product click event that saves event to favorites

function renderResultsList(data){
    console.log("renderList working?");
    for (var i = 0; i < data.length; i++) {
        var productResultDiv = $("<div>");
        productResultDiv.attr("id", "product-result-" + i);  
        productResultDiv.append("<h3>" + data[i].product_name + "</h3>");
        productResultDiv.append("<h3>" + data[i].price + "</h3>");
        productResultDiv.append("<h3>" + data[i].Store.store_name + "</h3>");
        productResultDiv.append("<h3>" + data[i].Store.street + "</h3>");
        productResultDiv.append("<h3>" + data[i].Store.city + ", " + data[i].Store.state + " " + data[i].Store.zip + "</h3>");        
        // productResultDiv.onclick = addToList();        
        $("#list").append(productResultDiv);  
      }
}