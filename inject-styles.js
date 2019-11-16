// image By The original uploader was Lex vB at Dutch Wikipedia. - Originally from nl.wikipedia; description page is/was here., CC BY-SA 3.0, https://commons.wikimedia.org/w/index.php?curid=2499669
// replaceImages('https://upload.wikimedia.org/wikipedia/commons/f/f6/Mushroom%27s_roots_%28myc%C3%A9lium%29.jpg');

function replaceImages(newImageSrc) {
    var imgTags = document.getElementsByTagName('img');
    for (var i = 0; i < imgTags.length; i++) {
        imgTags[i].src = newImageSrc;
    }
}
