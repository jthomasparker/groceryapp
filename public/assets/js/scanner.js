
$(document).ready(function(){
    $.fn.editable.defaults.mode = 'inline';
    const video = document.getElementById('video');
    const img = document.getElementById('result-image')
    const constraints = {
        video: true
    };
    const canvas = document.createElement('canvas');
    // check to make sure browser is compatible with getUserMedia
    AdapterJS.webRTCReady(function(isUsingPlugin){
        if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
            userMediaFail();
          } else {
            navigator.getUserMedia(constraints, userMediaSuccess, userMediaFail)
          }
    })

    $(document).ajaxStart(function(){
        toggleOverlay();
    });
    $(document).ajaxComplete(function(){
        toggleOverlay()
    }); 

    $('#submitResults').on('click', function(){
       var prodArr = [];
       var prodDescArr = [];
       var prodPriceArr = [];
       var storeId = $('#resultsTable').attr('storeId')
       var error = $(this).attr("results-error")
       
       if(error === "false"){

       $('#resultsTable tr').each(function(rowIdx){
           if(rowIdx === 0){
               return;
           }
            var product = {};
            var prodDesc = {};
            var prodPrice = {};
            product.StoreId = storeId
            prodPrice.StoreId = storeId
                $(this).find('td').each(function(idx){
                    var cellContent = $(this).text();
                        if(idx === 0){
                            product.name = cellContent
                            prodDesc.name = cellContent
                            prodPrice.product_name = cellContent
                        } else if(idx === 1){
                            product.desc = cellContent
                            prodDesc.description = cellContent
                        } else if(idx === 2){
                            product.price = cellContent
                            prodPrice.price = cellContent
                        } else {
                            return;
                        }
                })
            prodArr.push(product)
            prodPriceArr.push(prodPrice)
            prodDescArr.push(prodDesc)
       }) 
       console.log(prodArr)
       updateDb({products: prodPriceArr, descriptions: prodDescArr})
    }
    reset()
    })



    $('#capture').on('click',function(){
        if($(this).hasClass('disabled')){
            return;
        }
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        var image = canvas.toDataURL();

        getReceipt("POST", "/api/receipt", {imgBase64: image})

    })

    $('#upload').on('change', function(e){
        
         var file = $(this).get(0).files[0]
         var reader = new FileReader();
         reader.readAsDataURL(file)
         reader.onload = function(){
            var image = reader.result
            getReceipt("POST", "/api/receipt", {imgBase64: image})
         }
         reader.onerror = function (error) {
            console.log('Error: ', error);
          };
    }) 

    function reset(){
        img.src = ""
        navigator.getUserMedia(constraints, userMediaSuccess, userMediaFail)
        video.style.display = 'block'
    }

})



function getReceipt(type, url, data){

    if(video.srcObject){
    video.srcObject.getVideoTracks().forEach(track => track.stop());
    video.style.display = 'none'
    }
    $('#result-image').attr("src", data.imgBase64).css({"max-height": "420px", "width": "auto"}) 
   
    $.ajax({
        type: type,
        url: url,
        data: data
    }).done(function(result){
        
        processResult(result)
        
    })
}

function updateDb(data){
   // var jsonData = JSON.stringify(data)
    $.ajax({
        type: 'POST',
        url: '/api/update',
        data: data
    }).done(function(result){
        console.log(result)
    })
}

function userMediaSuccess(stream){
    video.srcObject = stream
}

function userMediaFail(){
    console.log("failed to get user media")
    video.style.display = "none"
    $('#capture').addClass('disabled')
    var errorMsg = $('<h2>').html("Failed to Load Camera Stream, Please Upload Receipt Instead")
    $('#main').prepend(errorMsg)

}

function moveProgress() {
    var bar = document.getElementById("progressbar")
    var width = 1;
    var id = setInterval(frame, 50);
    function frame() {
        if (width >= 110) {
            clearInterval(id);
            $('#reset').css("display", "block")
            bar.style.display = 'none'
        } else {
            width++; 
            bar.style.width = width + '%'; 
        }
    }
}

function toggleOverlay(){
    var overlay = $('#overlay')
    var resetBtn = $('#reset')
    var progressBar = $('#progressbar')
    var display = overlay.css("display")
    var spinner = $('#spinner')
    
    if(display === "none"){
        overlay.css("display","block")
        spinner.css("display", "block")
      //  moveProgress()
    } else {
      //  resetBtn.css("display", "none")
        spinner.css("display", "none")
        overlay.css("display","none")
      //  $('#progressbar').css("width", "1%")
    }
}


function processResult(data){
    
    if(!data.error){
    var message = $('<h4>').html("Here's what we got from your receipt - Help the community by editing any incorrect information!")
    // create the table
    var tableDiv = $('<div class="table-responsive">')
    var table = $('<table class="table table-hover" id="resultsTable">')
        .attr("storeId", data.products[0].StoreId)
        .appendTo(tableDiv)
    var thead = $('<thead>').html('<tr>').appendTo(table)
    var prodTitle = $('<th>').html("Product Name").appendTo(thead)
    var descTitle = $('<th>').html("Description").appendTo(thead)
    var priceTitle = $('<th>').html("Price").appendTo(thead)
    var tbody = $('<tbody>').appendTo(table)
    for(i in data.products){
        var productName = $('<td>').html('<a href="#" class="editable" style="text-decoration:none; color:black;">' + data.products[i].product_name + '</a>').editable({
            type: 'text',
            title: 'Update Product Name',
            success: function(response, newValue) {
               // userModel.set('username', newValue); //update backbone model
               $(this).text(newValue)
            }
        })
        var description = $('<td>').html(data.products[i].desc)
        
        var price = $('<td>').html('<a href="#" class="editable" style="text-decoration:none; color:black;">' + data.products[i].price + '</a>').editable({
            type: 'text',
            title: 'Update Price',
            success: function(response, newValue) {
               // userModel.set('username', newValue); //update backbone model
               $(this).text(newValue)
            }
        })
        var newRow = $('<tr>').append(productName, description, price)
        table.append(newRow)
        $('#submitResults').html("Looks Good!").attr("results-error", "false")
    }
   
    } else {
        message = "We had problems with your receipt, please try again"
        $('#submitResults').html("Ok").attr("results-error", "true")
    }
    $('.modal-body').html(message).append(tableDiv)
    
    $('#resultsModal').modal('show')

}