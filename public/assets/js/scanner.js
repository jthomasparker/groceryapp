
$(document).ready(function(){
    const video = document.getElementById('video');
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
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        var image = canvas.toDataURL();
        $.ajax({
            type: "POST",
            url: '/api/receipt',
            data: { 
                imgBase64: image
             }
        }).done(function(result){
            console.log(result)
        })
    })
})

function userMediaSuccess(stream){
    video.srcObject = stream
}

function userMediaFail(){
    console.log("failed to get user media")
}