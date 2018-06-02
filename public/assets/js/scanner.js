
$(document).ready(function(){
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



    $('#capture').on('click',function(){
        if($(this).hasClass('disabled')){
            return;
        }
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        var image = canvas.toDataURL();

        apiCall("POST", "/api/receipt", {imgBase64: image})

    })

    $('#upload').on('change', function(e){
        
         var file = $(this).get(0).files[0]
         var reader = new FileReader();
         reader.readAsDataURL(file)
         reader.onload = function(){
            var image = reader.result
            apiCall("POST", "/api/receipt", {imgBase64: image})
         }
         reader.onerror = function (error) {
            console.log('Error: ', error);
          };
    }) 

    $('#reset').on('click', function(){
        toggleOverlay()
        img.src = ""
        navigator.getUserMedia(constraints, userMediaSuccess, userMediaFail)
        video.style.display = 'block'
    })
})

function apiCall(type, url, data){
    if(video.srcObject){
    video.srcObject.getVideoTracks().forEach(track => track.stop());
    video.style.display = 'none'
    }
    $('#result-image').attr("src", data.imgBase64) 

    toggleOverlay()
    $.ajax({
        type: type,
        url: url,
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
    
    if(display === "none"){
        overlay.css("display","block")
        progressBar.css("display", "block")
        moveProgress()
    } else {
        resetBtn.css("display", "none")
        overlay.css("display","none")
        $('#progressbar').css("width", "1%")
    }
}