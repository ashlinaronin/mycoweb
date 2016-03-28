// Don't need DOMContentLoaded because the manifest file takes care of script execution order for us
replaceImages('https://media.glassdoor.com/sql/702495/pollinate-squarelogo-1432530572224.png');


function replaceImages(newImageSrc) {
    var imgTags = document.getElementsByTagName('img');
    for (var i = 0; i < imgTags.length; i++) {
        imgTags[i].src = newImageSrc;
    }
}
