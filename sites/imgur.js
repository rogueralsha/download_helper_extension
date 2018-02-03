let imgurSource = {
    name: "imgur",
    albumRegexp: new RegExp("https?:\\/\\/([mi]\\.)?imgur\\.com\\/(a|gallery)\\/([^\\/]+)", 'i'),
    postRegexp: new RegExp("https?:\\/\\/([mi]\\.)?imgur\\.com\\/([^\\/]+)$", 'i'),
    videoRegexp: new RegExp("https?:\\/\\/([mi]\\.)?imgur\\.com\\/([^\\/]+)\.gifv$", 'i'),
    directRegexp: new RegExp("https?:\\/\\/([mi]\\.)?imgur\\.com\\/([^\\/]+)\\.[a-z]{3,4}$", 'i'),

    isSupported: function(link) {
        return imgurSource.videoRegexp.test(link) ||
            imgurSource.albumRegexp.test(link) ||
            imgurSource.postRegexp.test(link);
    },

    isDirectFileLink: function(link) {
        return (!this.videoRegexp.test(link))&& imgurSource.directRegexp.test(link);
    },

    process: function (url, outputData) {
        let source = this;
        return new Promise(function(resolve, reject) {
            let result = false;

        if (source.videoRegexp.test(url)) {
            result = true;
            console.log("Imgur video page detected");
            outputData.saveByDefault = false;

            outputData.artist = "imgur";
            console.log("Artist: " + outputData.artist);


            let videoEle = document.querySelector("video source");

            if (videoEle != null) {
                let link = videoEle.src;
                console.log("Found URL: " + link);
                outputData.addLink(createLinkLegacy(link, "video"));
            }
        } else if(source.directRegexp.test(url)) {
                result = true;
                console.log("imgur direct link detected");
                outputData.saveByDefault = false;

                outputData.artist = "imgur";
                console.log("Artist: " + outputData.artist);
                console.log("Found URL: " + url);
                outputData.addLink(createLinkLegacy(url, "image"));
            } else if (source.albumRegexp.test(url)) {
                result = true;
                console.log("Imgur album page detected");
                outputData.saveByDefault = false;

                let titleEle = document.querySelector("h1.post-title");
                let matches = source.albumRegexp.exec(url);
                let albumHash = matches[3];
                if (titleEle != null) {
                    outputData.artist = titleEle.innerText;
                } else {
                    outputData.artist = albumHash;
                }
                console.log("Artist: " + outputData.artist);


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
                                    outputData.addLink(createLinkLegacy(link, "image"));
                                }
                            }
                        } else {
                            outputData.error(xmlhttp.status);
                        }
                        resolve(result);
                    }
                };

                xmlhttp.open("GET", "https://imgur.com/ajaxalbums/getimages/" + albumHash + "/hit.json", true);
                xmlhttp.send();
                return;
            } else if (source.postRegexp.test(url)) {
                result = true;
                console.log("Imgur post page detected");
                outputData.saveByDefault = false;

                let titleEle = document.querySelector("h1.post-title");
                if (titleEle != null) {
                    outputData.artist = titleEle.innerText;
                } else {
                    let matches = source.postRegexp.exec(url);
                    outputData.artist = matches[2];
                }
                console.log("Artist: " + outputData.artist);


                let links = document.querySelectorAll("img.post-image-placeholder, div.post-image img");

                if (links != null && links.length > 0) {
                    for (let j = 0; j < links.length; j++) {
                        let link = links[j].src;
                        console.log("Found URL: " + link);
                        outputData.addLink(createLinkLegacy(link, "image"));
                    }
                }
            }
            resolve(result);
        });
    }
};


async function processImgur(url, output) {

}