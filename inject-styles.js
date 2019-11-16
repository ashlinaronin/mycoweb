// Don't need DOMContentLoaded because the manifest file takes care of script execution order for us
// replaceImages('https://media.glassdoor.com/sql/702495/pollinate-squarelogo-1432530572224.png');

// say('ya');

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
