// Don't need DOMContentLoaded because the manifest file takes care of script execution order for us
// replaceImages('https://media.glassdoor.com/sql/702495/pollinate-squarelogo-1432530572224.png');

say('ya');



var bigBro = {
    canvas: document.querySelector('#selfie-canvas'),
    context: canvas.getContext('2d'),
    webcam: null,
    dataURL: null
}


function takePic(stream) {
    context.drawImage(webcam, 0, 0);
    dataURL = canvas.toDataURL('image/png');
    postImage(dataURL, 'localhost:8000/saveImg');
}

function postImage(dataURL, apiEndpoint) {
    // do AJAX call here to send image to server
}

function initWebcam() {
    var p = navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    p.then(function(mediaStream) {
        webcam = document.querySelector('video#webcam'); // haven't made this yet
        webcam.src = window.URL.createObjectURL(mediaStream);
        webcam.onloadedmetadata = function(e) {
            // do something with video
            takePic(mediaStream);
        };
    });

    p.catch(function(err) {
        console.log(err.name);
    });
}


function say(whatToSay) {
    var utterance = new SpeechSynthesisUtterance();
    utterance.text = whatToSay;
    utterance.lang = 'en-GB'; // default is en-US
    utterance.volume = 0.6;
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
}

function replaceImages(newImageSrc) {
    var imgTags = document.getElementsByTagName('img');
    for (var i = 0; i < imgTags.length; i++) {
        imgTags[i].src = newImageSrc;
    }
}
