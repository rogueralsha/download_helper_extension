var deviantArtGalleryRegExp = new RegExp("https?://([^\\.]+)\\.deviantart\\.com/gallery/.*", 'i');
var deviantartGalleryItemSelector = "a.torpedo-thumb-link";


var deviantArtRegExp = new RegExp("https?://([^\\.]+)\\.deviantart\\.com/art/.*", 'i');

var artStationRegExp = new RegExp("https?://www\\.artstation\\.com/artwork/.*", 'i');
var tumblrRegExp = new RegExp("https?://([^\\.]+)\\.tumblr\\.com/post/.*", 'i');
var instagramRegExp = new RegExp("https?://([^\\.]+)\\.instagram\\.com/p/.*", 'i');
var hfRegExp = new RegExp("https?://www\\.hentai-foundry\\.com/pictures/user/([^/]+)/.*", 'i');
var patreonPostsRegExp = new RegExp("https?://www\\.patreon\\.com/[^/]+/posts", 'i');
var patreonPostRegExp = new RegExp("https?://www\\.patreon\\.com/posts/.*", 'i');

var twitterRegExp = new RegExp("https?://twitter\\.com/([^/]+)/?", 'i');
var twitterPostRegExp = new RegExp("https?://twitter\\.com/([^/]+)/status/.+", 'i');

var redditRegexp = new RegExp("https?://www\\.reddit\\.com/r/([^\\/]+)\\/.+", 'i');
var redditPostRegexp = new RegExp("https?://www\\.reddit\\.com/r/([^\\/]+)/comments/.+", 'i');

var imgurAlbumRegexp = new RegExp("https?:\\/\\/imgur\.com\\/a\\/([^\\/]+)", 'i');
var imgurPostRegexp = new RegExp("https?:\\/\\/imgur\.com\\/([^\\/]+)$", 'i');

function isSupportedPage(link) {
    if(imgurAlbumRegexp.test(link)||
        imgurPostRegexp.test(link)||
        twitterPostRegExp.test(link)||
        patreonPostRegExp.test(link)||
        hfRegExp.test(link)||
        instagramRegExp.test(link)||
        tumblrRegExp.test(link)||
        artStationRegExp.test(link)||
        deviantArtRegExp.test(link)) {
        return true;
    }
    return false;
}


var cachedLinks = [];

function downloadHelperPageInit() {
    console.log("DOM content loaded");
    var url = window.location.href;
    if(deviantArtGalleryRegExp.test(url)) {
        console.log("Deviantart gallery detected, attaching live link gathering");
        var eles = document.querySelectorAll(deviantartGalleryItemSelector);

        for(var i = 0; i<eles.length;i++) {
            console.log("Found URL: " + eles[i].href);
            cachedLinks.push(eles[i].href);
        }

        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if(mutation.type!="childList"||mutation.addedNodes.length==0) {
                    return;
                }
                for(var j = 0; j< mutation.addedNodes.length;j++) {
                    var node = mutation.addedNodes[j];
                    var eles = document.querySelectorAll(deviantartGalleryItemSelector);
                    for(var k = 0; k<eles.length;k++) {
                        var link = eles[k].href;
                        if(!cachedLinks.includes(link)) {
                            console.log("Found URL: " + link);
                            cachedLinks.push(link);
                        }
                    }
                }
            });
        });
        var config = { childList: true, subtree:true, };
        observer.observe(document, config);
    }
}


window.onload = downloadHelperPageInit;


function getPageMedia() {
    var url = window.location.href;
    var output = {};
    output.links = [];
    output.action = "download";
    output.addLink = function (link) {
        for(var i = 0; i < this.links.length; i++) {
            if(this.links[i].url==link.url) {
                return;
            }
        }
        this.links.push(link);
    };



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
                console.log("Found URL: " + ele.src);
                output.addLink(createLink(ele.src, "image"));
            }
        } else {
            console.log("Found URL: " + ele.href);
            output.addLink(createLink(ele.href, "image"));
        }
    } else if(deviantArtGalleryRegExp.test(url)) {
        console.log("Deviantart gallery detected");
        var matches = deviantArtGalleryRegExp.exec(url);
        output.artist = matches[1];
        console.log("Artist: " + output.artist);

        var eles = document.querySelectorAll(deviantartGalleryItemSelector);

        for(var i = 0; i<eles.length;i++) {
            var link = eles[i].href;
            if(!cachedLinks.includes(link)) {
                console.log("Found URL: " + eles[i].href);
                cachedLinks.push(eles[i].href);
            }
        }


        if (cachedLinks == null || cachedLinks.length == 0) {
            output.error = "No media found";
        }
        for (i = 0; i < cachedLinks.length; i++) {
            link = cachedLinks[i];

            console.log("Found URL: " + link);
            output.addLink(createLink(link,"page"));
        }
    } else if (artStationRegExp.test(url)) {
        var ele = document.querySelector("div.artist-name-and-headline div.name a");
        output.artist = ele.href.substring(ele.href.lastIndexOf('/') + 1);
        console.log("Artist: " + output.artist);

        var elements = document.querySelectorAll("div.asset-actions a");
        if (elements == null || elements.length == 0) {
            output.error = "No media found";
        }
        for (var i = 0; i < elements.length; i++) {
            ele = elements[i];
            if (ele == null) {
                output.error = "No media found";
            } else {
                var link = ele.href;
                if (link.indexOf("&dl=1") > -1) {
                    console.log("Found URL: " + link);
                    output.addLink(createLink(link,"image"));
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
                output.addLink(link);
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
                output.addLink(createLink(link,"image"));
            }
        }
    } else if (hfRegExp.test(url)) {
        console.log("Hentai Foundry page detected");
        var matches = hfRegExp.exec(url);
        output.artist = matches[1];
        console.log("Artist: " + output.artist);

        var ele = document.querySelector("div.container div.boxbody img");
        if (ele != null) {
            var link = ele.src;
            if(link.indexOf("vote_happy.png")==-1) {
                console.log("Found URL: " + link);
                output.addLink(createLink(link, "image"));
            }
        }

        ele = document.querySelector("div.container div.boxbody embed");
        if (ele != null) {
            var link = ele.src;
            console.log("Found URL: " + link);
            output.addLink(createLink(link,"flash"));
        }
    } else if (patreonPostRegExp.test(url)) {
        console.log("Patreon post detected");

        var ele = document.querySelector(".patreon-patreon-creation-shim--creator--top--text a");
        var pieces = ele.href.split("/");
        output.artist = pieces[pieces.length-1];
        console.log("Artist: " + output.artist);

        ele = document.querySelector("img.patreon-creation-shim--post-file--image");
        var download_url;
        if (ele != null) {
            var link = ele.src;
            console.log("Found URL: " + link);
            output.addLink(createLink(link, "image"));
        }


        var elements = document.querySelectorAll(".patreon-creation-shim--attachments--item a")
        for (i = 0; i < elements.length; i++) {
            ele = elements[i];
            if (ele == null) {
                continue;
            } else {
                var link = ele.href;
                console.log("Found URL: " + link);
                output.addLink(createLink(link,"image",ele.innerText));
            }
        }

    } else if (patreonPostsRegExp.test(url)) {
        output.action = "open";

        console.log("Patreon artist posts detected");



        var ele = document.querySelector(".patreon-patreon-creation-shim--creator--top--text a");
        if(ele!=null) {
            var pieces = ele.href.split("/");
            output.artist = pieces[pieces.length - 1];
            console.log("Artist: " + output.artist);
        }

        var elements = document.querySelectorAll("a")
        for (i = 0; i < elements.length; i++) {
            ele = elements[i];
            if (ele == null) {
                continue;
            } else {
                var link = ele.href;
                if (!patreonPostRegExp.test(link)) {
                    continue;
                }
                console.log("Found URL: " + link);
                output.addLink(createLink(link,"page"));
            }
        }
    } else if (twitterRegExp.test(url)) {
        console.log("Twitter page detected");
        var matches = twitterRegExp.exec(url);
        output.artist = matches[1];
        console.log("Artist: " + output.artist);

        if (twitterPostRegExp.test(url)) {
            // This means we're viewing an individual post
            var elements = document.querySelectorAll(".permalink-container .js-adaptive-photo img");
            for (i = 0; i < elements.length; i++) {
                var ele = elements[i];
                var link = ele.src;
                console.log("Found URL: " + link);
                output.addLink(createLink(link + ":large","image", getFileName(link)));
            }
        } else {
            // This means it's a user's page
            var tweets = document.querySelectorAll("div.tweet");
            for (i = 0; i < tweets.length; i++) {
                var ele = tweets[i];
                var id = ele.dataset["tweetId"];
                if(id===undefined) {
                    continue;
                }
                var link = "https://twitter.com/" + output.artist + "/status/" + id;
                console.log("Found URL: " + link);
                output.addLink(createLink(link,"page", id));
            }
        }
    } else if (redditRegexp.test(url)) {
        console.log("Reddit page detected");
        var matches = redditRegexp.exec(url);
        output.artist = matches[1];
        console.log("Artist: " + output.artist);

        var links = document.querySelectorAll("a.title");
        if(links!=null&&links.length>0) {
            for(var i = 0; i < links.length; i++) {
                var link = links[i].href;
                console.log("Found URL: " + link);
                if(redditPostRegexp.test(link)) {
                    continue;
                } else if(isSupportedPage(link)) {
                    output.addLink(createLink(link,"page"));
                } else {
                    output.addLink(createLink(link,"image"));
                }
            }
        }
    } else if (imgurAlbumRegexp.test(url)) {
        console.log("Imgur album page detected");

        var titleEle = document.querySelector("h1.post-title");
        if (titleEle != null) {
            output.artist = titleEle.innerText;
        } else {
            var matches = imgurAlbumRegexp.exec(url);
            if (matches == null)
                matches = imgurPostRegexp.exec(url);
            output.artist = matches[1];
        }
        console.log("Artist: " + output.artist);


        var scriptEles = document.querySelectorAll("script");
        for (var i = 0; i < scriptEles.length; i++) {
            if (scriptEles[i].innerHTML.indexOf("window.runSlots = ") != -1) {
                // found it!
                var json = scriptEles[i].innerHTML;
                json = json.substr(json.indexOf("window.runSlots = ") + 17).split(";")[0].replace("_config:", "\"config\":").replace("_place:", "\"place\":").replace("_item:", "\"item\":");

                var images = JSON.parse(json);
                images = images.item.album_images.images;

                //var links = document.querySelectorAll("img.post-image-placeholder");
                if (images != null && images.length > 0) {
                    for (var j = 0; j < images.length; j++) {
                        var image = images[j];
                        var link = "http://i.imgur.com/" + image.hash + image.ext;
                        console.log("Found URL: " + link);
                        output.addLink(createLink(link, "image"));
                    }
                }

            }
        }
    } else if(imgurPostRegexp.test(url)) {
        console.log("Imgur post page detected");

        var titleEle = document.querySelector("h1.post-title");
        if (titleEle != null) {
            output.artist = titleEle.innerText;
        } else {
            var matches = imgurPostRegexp.exec(url);
            output.artist = matches[1];
        }
        console.log("Artist: " + output.artist);

        var links = document.querySelectorAll("img.post-image-placeholder");
        if (links != null && links.length > 0) {
            for (var j = 0; j < links.length; j++) {
                var link = links[j].src;
                console.log("Found URL: " + link);
                output.addLink(createLink(link, "image"));
            }
        }

    } else {
        // Check if we're on a shimmie site
        var ele = document.querySelector("img.shm-main-image");
        if (ele != null) {
            var siteRegexp = new RegExp("https?://([^/]+)/.*", 'i');
            output.artist = siteRegexp.exec(url)[1];
            console.log("Found URL: " + ele.src);
            output.addLink(createLink(ele.src,"image"));
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

function getFileName(link) {
    return decodeURI(link.substring(link.lastIndexOf('/') + 1).split("?")[0])
}

function createLink(url, type, filename) {
    var output = {};
    output["url"] = decodeURI(url);
    output["type"] = type;
    console.log("Provided filename: " + filename);
    if(filename===undefined) {
        output["filename"] = getFileName(url);
    } else {
        output["filename"] = filename;
    }
    return output;
}

function loadPage(request,sendResponse) {
    sendResponse(getPageMedia());
}

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");
        if (request.greeting == "getPageMedia")
            sendResponse(getPageMedia());
        if(request.greeting=="loadPage")
            loadPage(request,sendResponse);
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
                if (link.indexOf("_250.") > -1) {
                    link = link.replace("_250", "_1280");
                }
                if (link.indexOf("_400.") > -1) {
                    link = link.replace("_400", "_1280");
                }
                console.log("Found URL: " + link);
                output.push(createLink(link,"image"));
            }
        }
    } else {
        console.log("No img tags found");
    }
    return output;
}