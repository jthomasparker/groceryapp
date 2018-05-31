var listOfProducts = [];

//TEST DATA
var TestStore1 = {
    store_name: "Store 1",
    street: "Peachtree Street",
    city: "Atlanta",
    state: "FL",
    zip: "30309"
};
var TestProduct1 = {
    product_name: "Bananas",
    price: .65,
    StoreId: 2
};
var TestProduct2 = {
    product_name: "Eggs",
    price: 3.62
};

// $.post("/api/stores", TestStore1).then(function(data){
//     console.log(data);
// });
// $.post("/api/products", TestProduct1).then(function(data){
//     console.log("ADDING PRODUCT?!");
//     console.log(data);
// })

// choose product click event that saves event to favorites
$('body').on('click', '#btnSearch', function(){
    var productSearched = $("#productSearch");
    //find the product from the db using search like
    $.get("/api/" + productSearched, function(data){
        console.log(data);
        renderList(data);
    });
    //add it to the array and display it
    $(this).blur();
});

function renderList(data){
    for (var i = 0; i < data.length; i++) {
        var div = $("<div>");  
        div.append(data[i]);        
        $("#list").append(div);  
      }
}