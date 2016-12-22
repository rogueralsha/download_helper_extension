function getPageMedia() {
    var url = window.location.href;
    var output = {};
    output.links = [];

    var deviantArtRegExp = new RegExp("https?://([^\\.]+)\\.deviantart\\.com/art/.*", 'i');
    var artStationRegExp = new RegExp("https?://www\\.artstation\\.com/artwork/.*", 'i');
    var tumblrRegExp = new RegExp("https?://([^\\.]+)\\.tumblr\\.com/post/.*", 'i');
    var instagramRegExp = new RegExp("https?://([^\\.]+)\\.instagram\\.com/p/.*", 'i');
    var hfRegExp = new RegExp("https?://www\\.hentai-foundry\\.com/pictures/user/([^/]+)/.*", 'i');


    if (deviantArtRegExp.test(url)) {
        console.log("Deviantart page detected");
        var matches = deviantArtRegExp.exec(url);
        output.artist = matches[1];
        console.log("Artist: " + output.artist);

        var ele = document.querySelector(".dev-page-download");
        var download_url;
        if (ele == null) {
            // This means the download button wasn't found
            ele = document.querySelector(".dev-content-full");
            if (ele == null) {
                output.error = "No media found";
            } else {
                var link = ele.src;
                console.log("Found URL: " + link);
                output.links.push(link);
            }
        } else {
            var link = ele.href;
            console.log("Found URL: " + link);
            output.links.push(link);
        }
    } else if (artStationRegExp.test(url)) {
        var ele = document.querySelector("div.artist-name-and-headline div.name a");
        output.artist = ele.href.substring(ele.href.lastIndexOf('/') + 1);
        console.log("Artist: " + output.artist);

        var elements = document.querySelectorAll("div.asset-actions a");
        if (elements == null || elements.length == 0) {
            output.error = "No media found";
        }
        for (i = 0; i < elements.length; i++) {
            ele = elements[i];
            if (ele == null) {
                output.error = "No media found";
            } else {
                var link = ele.href;
                if (link.indexOf("&dl=1") > -1) {
                    console.log("Found URL: " + link);
                    output.links.push(link);
                }
            }
        }
    } else if (tumblrRegExp.test(url)) {
        console.log("Tumblr page detected");
        var matches = tumblrRegExp.exec(url);
        output.artist = matches[1];
        console.log("Artist: " + output.artist);

        //http://68.media.tumblr.com/a3bc1e014074b7b333469b91adc04022/tumblr_oi6yomYX0X1rn062io1_500.jpg
        output.links = getTumblrImages(document);


        var iframe = document.querySelector("iframe.photoset");
        if (iframe != null) {
            console.log("Found photoset iframe");
            var iframeDocument = iframe.contentDocument || iframe.contentWindow.document;

            var iframeLinks = getTumblrImages(iframeDocument);

            iframeLinks.forEach(function(link) {
                output.links.push(link);
            });
        }

    } else if (instagramRegExp.test(url)) {
        var ele = document.querySelector("div._f95g7 a._4zhc5");
        output.artist = ele.innerText;
        console.log("Artist: " + output.artist);

        var elements = document.querySelectorAll("img._icyx7");
        if (elements == null || elements.length == 0) {
            output.error = "No media found";
        }
        for (i = 0; i < elements.length; i++) {
            ele = elements[i];
            if (ele == null) {
                output.error = "No media found";
            } else {
                var link = ele.src;
                console.log("Found URL: " + link);
                output.links.push(link);
            }
        }
    } else if (hfRegExp.test(url)) {
            console.log("Hentai Foundry page detected");
            var matches = hfRegExp.exec(url);
            output.artist = matches[1];
            console.log("Artist: " + output.artist);

            var ele = document.querySelector("div.container div.boxbody img");
            var download_url;
            if (ele != null) {
                var link = ele.src;
                console.log("Found URL: " + link);
                output.links.push(link);
            }
    } else {
        // Check if we're on a shimmie site
        var ele = document.querySelector("img.shm-main-image");
        if (ele != null) {
            var siteRegexp = new RegExp("https?://([^/]+)/.*", 'i');
            output.artist = siteRegexp.exec(url)[1];
            console.log("Found URL: " + ele.src);
            output.links.push(ele.src);
        } else {
            output.error = "Site not recognized";
        }
    }

    if(output.artist!=null) {
        output.artist = output.artist.toLowerCase();
    }

    console.log("Total media items found: " + output.links.length);
    return output;
}

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");
        if (request.greeting == "getPageMedia")
            sendResponse(getPageMedia());
    });


function getTumblrImages(documentRoot) {
    var tumblrMediaRegExp = new RegExp("https?://\\d+\\.media\\.tumblr\\.com/.*", 'i');
    var output = [];
    var elements = documentRoot.querySelectorAll("img");
    if (elements != null && elements.length > 0) {
        console.log("Found " + elements.length + " img tags");
        for (i = 0; i < elements.length; i++) {
            var ele = elements[i];
            if (ele == null) {
                console.log("Null element in img list");
                continue;
            } else {
                var link = ele.src;
                if (!tumblrMediaRegExp.test(link) || link.indexOf("avatar_") > -1) {
                    continue;
                }

                if (link.indexOf("_500.") > -1) {
                    link = link.replace("_500", "_1280");
                }
                if (link.indexOf("_540.") > -1) {
                    link = link.replace("_540", "_1280");
                }
                console.log("Found URL: " + link);
                output.push(link);
            }
        }
    } else {
        console.log("No img tags found");
    }
    return output;
}