let imgurAlbumRegexp = new RegExp("https?:\\/\\/(m\\.)?imgur\\.com\\/(a|gallery)\\/([^\\/]+)", 'i');
let imgurPostRegexp = new RegExp("https?:\\/\\/(m\\.)?imgur\\.com\\/([^\\/]+)$", 'i');

function isImgurSite(url) {
    return imgurAlbumRegexp.test(url)||imgurPostRegexp.test(url);
}

async function processImgur(url, output) {
    return new Promise(async function(resolve, reject) {
        if (imgurAlbumRegexp.test(url)) {
            console.log("Imgur album page detected");
            output.saveByDefault = false;

            let titleEle = document.querySelector("h1.post-title");
            let matches = imgurAlbumRegexp.exec(url);
            let albumHash = matches[3];
            if (titleEle != null) {
                output.artist = titleEle.innerText;
            } else {
                output.artist = albumHash;
            }
            console.log("Artist: " + output.artist);


            let xmlhttp = new XMLHttpRequest();

            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState === XMLHttpRequest.DONE) {
                    if (xmlhttp.status === 200) {
                        let json = xmlhttp.responseText;
                        let images = JSON.parse(json);
                        images = images.data.images;

                        //let links = document.querySelectorAll("img.post-image-placeholder");
                        if (images != null && images.length > 0) {
                            for (let j = 0; j < images.length; j++) {
                                let image = images[j];
                                let link = "http://i.imgur.com/" + image.hash + image.ext;
                                console.log("Found URL: " + link);
                                output.addLink(createLink(link, "image"));
                            }
                        }
                    } else {
                        output.error(xmlhttp.status);
                    }
                    resolve();
                }
            };

            xmlhttp.open("GET", "https://imgur.com/ajaxalbums/getimages/" + albumHash + "/hit.json", true);
            xmlhttp.send();
        } else if (imgurPostRegexp.test(url)) {
            console.log("Imgur post page detected");
            output.saveByDefault = false;

            let titleEle = document.querySelector("h1.post-title");
            if (titleEle != null) {
                output.artist = titleEle.innerText;
            } else {
                let matches = imgurPostRegexp.exec(url);
                output.artist = matches[2];
            }
            console.log("Artist: " + output.artist);


            let links = document.querySelectorAll("img.post-image-placeholder, div.post-image img");

            if (links != null && links.length > 0) {
                for (let j = 0; j < links.length; j++) {
                    let link = links[j].src;
                    console.log("Found URL: " + link);
                    output.addLink(createLink(link, "image"));
                }
            }
            resolve();
        }
    });
}