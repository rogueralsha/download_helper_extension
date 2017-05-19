var deviantArtGalleryRegExp = new RegExp("https?://([^\\.]+)\\.deviantart\\.com/gallery/.*", 'i');
var deviantartGalleryItemSelector = "a.torpedo-thumb-link";


var deviantArtRegExp = new RegExp("https?://([^\\.]+)\\.deviantart\\.com/art/.*", 'i');

var artStationRegExp = new RegExp("https?://www\\.artstation\\.com/artwork/.*", 'i');

var tumblrRegExp = new RegExp("https?://([^\\.]+)\\.tumblr\\.com/post/.*", 'i');
var tumblrRedirectRegExp = new RegExp("redirect\\?z=(.+)&t=", 'i');

var instagramRegExp = new RegExp("https?://([^\\.]+)\\.instagram\\.com/p/.*", 'i');

var hfRegExp = new RegExp("https?://www\\.hentai-foundry\\.com/pictures/user/([^/]+)/.*", 'i');
var hfGalleryRegExp = new RegExp("^https?://www\\.hentai-foundry\\.com/pictures/user/([^/]+)(/page/\\d+)?$", 'i');

var patreonPostsRegExp = new RegExp("https?://www\\.patreon\\.com/([^/]+)", 'i');
var patreonPostRegExp = new RegExp("https?://www\\.patreon\\.com/posts/.*", 'i');

var twitterRegExp = new RegExp("https?://twitter\\.com/([^/]+)/?", 'i');
var twitterPostRegExp = new RegExp("https?://twitter\\.com/([^/]+)/status/.+", 'i');

var redditRegexp = new RegExp("https?://www\\.reddit\\.com/r/([^\\/]+)\\/.+", 'i');
var redditPostRegexp = new RegExp("https?://www\\.reddit\\.com/r/([^\\/]+)/comments/.+", 'i');

var imgurAlbumRegexp = new RegExp("https?:\\/\\/imgur\.com\\/a\\/([^\\/]+)", 'i');
var imgurPostRegexp = new RegExp("https?:\\/\\/imgur\.com\\/([^\\/]+)$", 'i');

var eHentaiGalleryRegexp = new RegExp("https?:\\/\\/e\-hentai\.org\\/g\\/.+$", 'i');
var eHentaiImageRegexp = new RegExp("https?:\\/\\/e\-hentai\.org\\/s\\/.+$", 'i');
var eHentaiFilenameRegexp = new RegExp("^([^:]+)::[^:]+::[^:]+$", 'i');

var newsBlurRegExp = new RegExp("https?:\\/\\/newsblur\.com\\/(site\\/\\d+|folder)\\/(.+)", 'i');

var flickrRegexp = new RegExp("^https?:\\/\\/www\.flickr\.com\\/photos\\/([^\\/]+)\\/.*$", 'i');
var flickrImageRegexp = new RegExp("^https?:\\/\\/www\.flickr\.com\\/photos\\/([^\\/]+)\\/(\\d+)\\/.*$", 'i');
var flickrSizesRegexp = new RegExp("^https?:\\/\\/www\.flickr\.com\\/photos\\/([^\\/]+)\\/(\\d+)\\/sizes\\/([^\\/]+)\\/$", 'i');

var gfycatRegexp = new RegExp("https?:\\/\\/gfycat\.com\\/([^\\/]+)$", 'i');
var mixtapeRegexp = new RegExp("https?:\\/\\/my\.mixtape\.moe\\/([^\\/]+)$", 'i');
var eroshareRegexp = new RegExp("https?:\\/\\/eroshare\.com\\/([^\\/]+)$", 'i');
var siteRegexp = new RegExp("https?://([^/]+)/.*", 'i');

//http://t.umblr.com/redirect?z=https%3A%2F%2Fmy.mixtape.moe%2Fjuiydn.png&t=YmMzMWMzNTQzOTNlMjkxZGFlZjE1MGIxZTQ2MzNmYmRjOGM0NjQ5ZixVUFFnUXI0SA%3D%3D&b=t%3AOq704QYOd310j2BA8Z3cQg&p=http%3A%2F%2Fcolonelyobo.tumblr.com%2Fpost%2F160042170354%2Fnom-full-size-hey-with-all-the-running-she-does&m=1


var backgroundImageRegexp = new RegExp("url\\([\\'\\\"](.+)[\\'\\\"]\\)")

function evaluateLink(link, output, filename) {
    if (isSupportedPage(link)) {
        output.addLink(createLink(link, "page", filename));
    } else if (mixtapeRegexp.test(link)) {
        output.addLink(createLink(link, "image", filename));
    }
}

function isSupportedPage(link) {
    if (imgurAlbumRegexp.test(link) ||
        imgurPostRegexp.test(link) ||
        twitterPostRegExp.test(link) ||
        //patreonPostRegExp.test(link) ||
        hfRegExp.test(link) ||
        instagramRegExp.test(link) ||
        tumblrRegExp.test(link) ||
        artStationRegExp.test(link) ||
        deviantArtRegExp.test(link) ||
        flickrRegexp.test(link) ||
        eroshareRegexp.test(link) ||
        gfycatRegexp.test(link)) {
        return true;
    }
    return false;
}


var cachedLinks = [];
var imgEles = [];

function downloadItem(link, callback) {
    getPageMedia(function (result) {
        var src = event.srcElement.src;
        if (result.error == null) {
            result.links = [];
            result.addLink(createLink(link, "image"));
            chrome.runtime.sendMessage({command: "download", results: result}, function (response) {
                if (callback != null) {
                    callback();
                }
            });

        }
    });

}

function downloadHelperPageInit() {
    var toolbarEle = document.createElement("div");
    toolbarEle.style.display = "none";
    toolbarEle.style.position = "absolute";
    toolbarEle.style.zIndex = "99999999999";
    var btnEle = document.createElement("input");
    btnEle.type = "button";
    btnEle.value = "Download";
    btnEle.onclick = function (event) {
        downloadItem(toolbarEle.dataset["link"]);
    };
    toolbarEle.appendChild(btnEle);
    btnEle = document.createElement("input");
    btnEle.type = "button";
    btnEle.value = "Download & Close";
    btnEle.onclick = function (event) {
        downloadItem(toolbarEle.dataset["link"], function () {
            chrome.runtime.sendMessage({command: "closeTab"}, function () {
            });
        });
    };
    toolbarEle.appendChild(btnEle);

    document.body.appendChild(toolbarEle);

    console.log("DOM content loaded");
    imgEles = document.getElementsByTagName("img");
    if (imgEles != null) {
        for (var i = 0; i < imgEles.length; i++) {
            var imgEle = imgEles[i];
            imgEle.dataset["index"] = i;
            imgEle.addEventListener("dragend", function (event) {
                downloadItem(imgEle.src);
            });
            imgEle.addEventListener("mouseover", function (event) {
                var rect = event.srcElement.getBoundingClientRect();
                var y = rect.top;
                var x = rect.left;
                toolbarEle.dataset["link"] = event.srcElement.src;
                toolbarEle.style.left = x + "px";
                toolbarEle.style.top = y + "px";
                toolbarEle.style.display = "block";
            });
        }
    }

    var url = window.location.href;
    if (deviantArtGalleryRegExp.test(url)) {
        console.log("Deviantart gallery detected, attaching live link gathering");
        var eles = document.querySelectorAll(deviantartGalleryItemSelector);

        for (var i = 0; i < eles.length; i++) {
            console.log("Found URL: " + eles[i].href);
            cachedLinks.push(eles[i].href);
        }

        var observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.type != "childList" || mutation.addedNodes.length == 0) {
                    return;
                }
                for (var j = 0; j < mutation.addedNodes.length; j++) {
                    var node = mutation.addedNodes[j];
                    var eles = document.querySelectorAll(deviantartGalleryItemSelector);
                    for (var k = 0; k < eles.length; k++) {
                        var link = eles[k].href;
                        if (!cachedLinks.includes(link)) {
                            console.log("Found URL: " + link);
                            cachedLinks.push(link);
                        }
                    }
                }
            });
        });
        var config = {childList: true, subtree: true,};
        observer.observe(document, config);
    }
}


window.onload = downloadHelperPageInit;

function getPageMedia(callback) {
    var url = window.location.href;
    var output = {};
    output.links = [];
    output.action = "download";
    output.error = null;
    output.addLink = function (link) {
        for (var i = 0; i < this.links.length; i++) {
            if (this.links[i].url == link.url) {
                return;
            }
        }
        this.links.push(link);
    };

    var async = false;

    var metaAppName = document.querySelector('meta[property="al:android:app_name"]');

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
    } else if (deviantArtGalleryRegExp.test(url)) {
        console.log("Deviantart gallery detected");
        var matches = deviantArtGalleryRegExp.exec(url);
        output.artist = matches[1];
        console.log("Artist: " + output.artist);

        var eles = document.querySelectorAll(deviantartGalleryItemSelector);

        for (var i = 0; i < eles.length; i++) {
            var link = eles[i].href;
            if (!cachedLinks.includes(link)) {
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
            output.addLink(createLink(link, "page"));
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
                    output.addLink(createLink(link, "image"));
                }
            }
        }
    } else if (tumblrRegExp.test(url) || (metaAppName != null && metaAppName.content.toLowerCase() == "tumblr") || document.querySelector("meta[name='tumblr-theme']") != null) {
        console.log("Tumblr page detected");
        if (tumblrRegExp.test(url)) {
            output.artist = tumblrRegExp.exec(url)[1];
        } else {
            output.artist = siteRegexp.exec(url)[1];
        }

        // var body = document.querySelector("body");
        // if(body!=null&&body.dataset["urlencodedName"]!=null) {
        //     output.artist = body.dataset["urlencodedName"];
        // } else {
        //     var metaTitle = document.querySelector('meta[property="og:title"]');
        //     if(metaTitle!=null&&metaTitle.content.length>0) {
        //         output.artist = metaTitle.content;
        //     } else {
        //         metaTitle = document.querySelector('meta[name="twitter:title"]');
        //         output.artist = metaTitle.content;
        //     }
        // }

        console.log("Artist: " + output.artist);

        //http://68.media.tumblr.com/a3bc1e014074b7b333469b91adc04022/tumblr_oi6yomYX0X1rn062io1_500.jpg


        var iframes = document.querySelectorAll("iframe.photoset");
        if (iframes != null && iframes.length > 0) {
            console.log("Found photoset iframes");
            for (var i = 0; i < 1; i++) {
                try {
                    iframe = iframes[i];
                    async = true;
                    chrome.runtime.sendMessage({url:iframe.src,command: "getPageMedia"}, function(response) {
                        if (response == null) {
                            console.log("No media found in iframe (null)");
                            return;
                        }

                        if (response.error != null) {
                            console.log(response.error);
                        } else if (response.links.length == 0) {
                            console.log("No media found in iframe");
                        } else {
                            for (var i = 0, len = response.links.length; i < len; i++) {
                                output.addLink(response.links[i]);
                            }
                        }
                        callback(output);
                    });
                } catch (err) {
                    console.log(err);
                }
            }
        }

        output.links = getTumblrImages(document);


        var linkEles = document.querySelectorAll("a");
        for (var i = 0; i < linkEles.length; i++) {
            var linkEle = linkEles[i];
            if (tumblrRedirectRegExp.test(linkEle.href)) {
                var link = tumblrRedirectRegExp.exec(linkEle.href)[1];
                link = decodeURIComponent(link);
                evaluateLink(link, output);
            }

        }


    } else if (instagramRegExp.test(url)) {
        var ele = document.querySelector("header a._4zhc5");
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
                output.addLink(createLink(link, "image"));
            }
        }
    } else if (hfGalleryRegExp.test(url)) {
        console.log("Hentai Foundry gallery page detected");
        var matches = hfGalleryRegExp.exec(url);
        output.artist = matches[1];
        console.log("Artist: " + output.artist);

        var eles = document.querySelectorAll("a.thumbLink");
        if (eles != null) {
            for (i = 0; i < eles.length; i++) {
                var ele = eles[i];
                var link = ele.href;
                console.log("Found URL: " + link);
                output.addLink(createLink(link, "page"));
            }
        }
        var nextEle = document.querySelector("li.next a");
        if (nextEle != null) {
            var link = nextEle.href;
            if (link != url) {
                console.log("Found URL: " + link);
                output.addLink(createLink(link, "page"));
            }
        }

    } else if (hfRegExp.test(url)) {
        console.log("Hentai Foundry image page detected");
        var matches = hfRegExp.exec(url);
        output.artist = matches[1];
        console.log("Artist: " + output.artist);

        var ele = document.querySelector("div.container div.boxbody img");
        if (ele != null) {
            var link = ele.src;
            if (link.indexOf("vote_happy.png") == -1) {
                console.log("Found URL: " + link);
                output.addLink(createLink(link, "image"));
            }
        }

        ele = document.querySelector("div.container div.boxbody embed");
        if (ele != null) {
            var link = ele.src;
            console.log("Found URL: " + link);
            output.addLink(createLink(link, "flash"));
        }
    } else if (patreonPostRegExp.test(url)) {
        console.log("Patreon post detected");

        var ele = document.querySelector("a[class*='components-CreatorCard--creatorCard']");
        var pieces = ele.href.split("/");
        output.artist = pieces[pieces.length - 1];
        console.log("Artist: " + output.artist);

        ele = document.querySelector("div[data-test-tag='post-card'] img");
        var download_url;
        if (ele != null) {
            var link = ele.src;
            console.log("Found URL: " + link);
            output.addLink(createLink(link, "image"));
        }


        var elements = document.querySelectorAll("div[data-test-tag='post-card'] div[class*='components-Post--cardBodyContainer'] div.stackable a[class*='components-TextButton--blue'], div[class*='components-Post--attachments'] a")
        for (i = 0; i < elements.length; i++) {
            ele = elements[i];
            if (ele == null) {
                continue;
            } else {
                var link = ele.href;
                console.log("Found URL: " + link);
                output.addLink(createLink(link, "image", ele.innerText));
            }
        }

    } else if (patreonPostsRegExp.test(url)) {
        output.action = "open";

        console.log("Patreon artist posts detected");

        var matches = patreonPostsRegExp.exec(url);
        output.artist = matches[1];
        console.log("Artist: " + output.artist);

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
                output.addLink(createLink(link, "page"));
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
                output.addLink(createLink(link + ":large", "image", getFileName(link)));
            }
        } else {
            // This means it's a user's page
            var tweets = document.querySelectorAll("div.tweet");
            for (i = 0; i < tweets.length; i++) {
                var ele = tweets[i];
                var id = ele.dataset["tweetId"];
                if (id === undefined) {
                    continue;
                }
                var link = "https://twitter.com/" + output.artist + "/status/" + id;
                console.log("Found URL: " + link);
                output.addLink(createLink(link, "page", id));
            }
        }
    } else if (redditRegexp.test(url)) {
        console.log("Reddit page detected");
        var matches = redditRegexp.exec(url);
        output.artist = matches[1];
        console.log("Artist: " + output.artist);

        var links = document.querySelectorAll("a.title");
        if (links != null && links.length > 0) {
            for (var i = 0; i < links.length; i++) {
                var link = links[i].href;
                console.log("Found URL: " + link);
                if (redditPostRegexp.test(link)) {
                    continue;
                } else if (isSupportedPage(link)) {
                    output.addLink(createLink(link, "page"));
                } else {
                    output.addLink(createLink(link, "image"));
                }
            }
        }
    } else if (imgurAlbumRegexp.test(url)) {
        console.log("Imgur album page detected");

        var titleEle = document.querySelector("h1.post-title");
        var matches = imgurAlbumRegexp.exec(url);
        var albumHash = matches[1];
        if (titleEle != null) {
            output.artist = titleEle.innerText;
        } else {
            output.artist = albumHash;
        }
        console.log("Artist: " + output.artist);


        var xmlhttp = new XMLHttpRequest();

        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == XMLHttpRequest.DONE) {
                if (xmlhttp.status == 200) {
                    var json = xmlhttp.responseText;
                    var images = JSON.parse(json);
                    images = images.data.images;

                    //var links = document.querySelectorAll("img.post-image-placeholder");
                    if (images != null && images.length > 0) {
                        for (var j = 0; j < images.length; j++) {
                            var image = images[j];
                            var link = "http://i.imgur.com/" + image.hash + image.ext;
                            console.log("Found URL: " + link);
                            output.addLink(createLink(link, "image"));
                        }
                    }
                } else {
                    output.error(xmlhttp.status);
                }
                callback(output);
            }
        };

        async = true;

        xmlhttp.open("GET", "http://imgur.com/ajaxalbums/getimages/" + albumHash + "/hit.json", true);
        xmlhttp.send();
    } else if (imgurPostRegexp.test(url)) {
        console.log("Imgur post page detected");

        var titleEle = document.querySelector("h1.post-title");
        if (titleEle != null) {
            output.artist = titleEle.innerText;
        } else {
            var matches = imgurPostRegexp.exec(url);
            output.artist = matches[1];
        }
        console.log("Artist: " + output.artist);


        var links = document.querySelectorAll("img.post-image-placeholder, div.post-image img");

        if (links != null && links.length > 0) {
            for (var j = 0; j < links.length; j++) {
                var link = links[j].src;
                console.log("Found URL: " + link);
                output.addLink(createLink(link, "image"));
            }
        }
    } else if (document.querySelector("#cpg_main_block_outer") != null) {
        console.log("Coppermine site detected");
        output.artist = siteRegexp.exec(url)[1];

        var coppermineAlbumRegex = new RegExp(".+\\/index\\.php\\?cat\\=\\d+");
        var coppermineThumbnailsRegex = new RegExp(".+\\/thumbnails\\.php\\?album\\=\\d+");

        var thumbEles = [];
        if (coppermineAlbumRegex.test(url)) {
            thumbEles = document.querySelectorAll("td.thumbnails a.albums");
        } else if (coppermineThumbnailsRegex.test(url)) {
            thumbEles = document.querySelectorAll("td.thumbnails a");
        }


        var titleEle = document.querySelector("table.maintable h2");
        if (titleEle != null) {
            output["page_title"] = titleEle.innerText;
        }

        for (var i = 0; i < thumbEles.length; i++) {
            var thumbEle = thumbEles[i];
            var imgEle = thumbEle.querySelector("img");
            var link = thumbEle.href;
            console.log("Found URL: " + link);
            if (imgEle.title != null && imgEle.title.length > 0) {
                output.addLink(createLink(link, "page", imgEle.title, imgEle.src));
            } else {
                var tableEle = thumbEle.parentNode;
                while (tableEle.nodeName.toLowerCase() != "table") {
                    tableEle = tableEle.parentNode;
                }
                var titleEle = tableEle.querySelector("td.tableh2 a");
                if (titleEle != null) {
                    output.addLink(createLink(link, "page", titleEle.innerText, imgEle.src));
                } else {
                    output.addLink(createLink(link, "page", null, imgEle.src));
                }

            }
        }


        var itemEle = document.querySelector(".display_media");
        if (itemEle != null) {
            var objEle = itemEle.querySelector("object param[name='src']")
            var imgEle = itemEle.querySelector("img");
            var downEle = document.querySelector("a.button");
            if (downEle != null) {
                var link = downEle.href;
                console.log("Found URL: " + link);
                output.addLink(createLink(link, "image"));
            } else if (objEle != null) {
                var link = objEle.value;
                console.log("Found URL: " + link);
                output.addLink(createLink(link, "video"));
            } else if (imgEle != null) {
                var link = imgEle.src;
                console.log("Found URL: " + link);
                output.addLink(createLink(link, "image"));
            } else {
                console.debug("No media element found!");
            }
        } else {
            var navEles = document.querySelectorAll("td.navmenu a");
            var coppermineAlbumPageRegex = new RegExp(".+\\/thumbnails\\.php\\?album=\\d+\\&page=(\\d+)");
            var coppermineCategoryPageRegex = new RegExp(".+\\/index\\.php\\?cat=\\d+\\&page=(\\d+)");
            var currentPage = 1;
            if (coppermineAlbumPageRegex.test(url)) {
                currentPage = parseInt(coppermineAlbumPageRegex.exec(url)[1]);
            } else if (coppermineCategoryPageRegex.test(url)) {
                currentPage = parseInt(coppermineCategoryPageRegex.exec(url)[1]);
            }
            for (var i = 0; i < navEles.length; i++) {
                var navEle = navEles[i];
                var link = navEle.href;

                var navPage = -1;
                if (coppermineAlbumPageRegex.test(link)) {
                    navPage = parseInt(coppermineAlbumPageRegex.exec(link)[1]);
                } else if (coppermineCategoryPageRegex.test(link)) {
                    navPage = parseInt(coppermineCategoryPageRegex.exec(link)[1]);
                } else {
                    continue;
                }

                if (navPage == currentPage + 1) {
                    console.log("Found URL: " + link);
                    output.addLink(createLink(link, "page"));
                }
            }
        }
    } else if (newsBlurRegExp.test(url)) {
        console.log("Newsblur page detected");

        var matches = newsBlurRegExp.exec(url);
        output.artist = matches[2];
        console.log("Artist: " + output.artist);

        var stories = document.querySelectorAll(".NB-story-titles .NB-story-title-container");

        if (stories != null && stories.length > 0) {
            for (var j = 0; j < stories.length; j++) {
                var story = stories[j];

                var link = story.querySelector(".NB-storytitles-content a");
                if (link == null) {
                    continue;
                }
                link = link.href;
                var imgEle = story.querySelector(".NB-storytitles-story-image");
                var thumbnail = null;
                if (imgEle != null && backgroundImageRegexp.test(imgEle.style.backgroundImage)) {
                    thumbnail = backgroundImageRegexp.exec(imgEle.style.backgroundImage)[1];
                }
                console.log("Found URL: " + link);
                var dateEle = story.querySelector(".story_date ");
                var date = null;
                if (dateEle != null) {
                    date = Date.parse(dateEle.innerText);
                }
                output.addLink(createLink(link, "image", null, thumbnail, date));
            }
        }
    } else if (gfycatRegexp.test(url)) {
        console.log("Gfycat page detected");

        output.artist = "gfycat";
        console.log("Artist: " + output.artist);
        var videoEle = document.querySelector("video.share-video");
        var sourceEle = document.querySelector("source#webmSource");
        var link = sourceEle.src;
        console.log("Found URL: " + link);
        output.addLink(createLink(link, "video", null, videoEle.poster));
    } else if (eroshareRegexp.test(url)) {
        console.log("Eroshare page detected");
        var ele = document.querySelector(".user-link");
        output.artist = ele.innerText;
        console.log("Artist: " + output.artist);
        var videoEles = document.querySelectorAll("video");
        for (var j = 0; j < videoEles.length; j++) {
            var videoEle = videoEles[j]
            var link = videoEle.src;
            console.log("Found URL: " + link);
            output.addLink(createLink(link, "video", null, videoEle.poster));
        }
    } else if (flickrRegexp.test(url)) {
        console.log("Flickr page detected");
        var matches = flickrRegexp.exec(url);
        output.artist = matches[1];
        console.log("Artist: " + output.artist);

        // Check if we're on a gallery page
        var eles = document.querySelectorAll("div.photo-list-photo-view");
        if (eles != null) {
            for (var i = 0; i < eles.length; i++) {
                var ele = eles[i];
                var linkEle = ele.querySelector("a");
                var link = linkEle.href;

                // We COULD go to the image page, but why waste time?!?!
                if (flickrImageRegexp.test(link)) {
                    var imageId = flickrImageRegexp.exec(link)[2];
                    link = "https://www.flickr.com/photos/" + output.artist + "/" + imageId + "/sizes/";
                    output.addLink(createLink(link, "page", null, ele.style.backgroundImage));
                }
            }
            var nextEle = document.querySelector("div.pagination-view a[rel=next]");
            if (nextEle != null) {
                output.addLink(createLink(nextEle.href, "page"));
            }

        }

        // We check if we're on the sizes page
        if (flickrSizesRegexp.test(url)) {
            var sizePriorities = ["sq",
                "q",
                "t",
                "s",
                "n",
                "m",
                "z",
                "c",
                "l",
                "h",
                "k",
                "o"];
            var matches = flickrSizesRegexp.exec(url);
            var currentSize = matches[3];
            var sizesEle = document.querySelectorAll("ol.sizes-list li:last-child a");
            if (sizesEle.length > 0) {
                var ele = sizesEle[sizesEle.length - 1];
                var link = ele.href;
                var linkSize = flickrSizesRegexp.exec(link)[3];
                if (sizePriorities.indexOf(currentSize) < sizePriorities.indexOf(linkSize)) {
                    output.addLink(createLink(link, "page"));
                } else {
                    var imgEle = document.querySelector("div#allsizes-photo img");
                    output.addLink(createLink(imgEle.src, "image"));
                }
            } else {
                var imgEle = document.querySelector("div#allsizes-photo img");
                output.addLink(createLink(imgEle.src, "image"));
            }
        }
    } else if (eHentaiGalleryRegexp.test(url)) {
        console.log("e-Hentai gallery detected");
        output.artist = "e-Hentai";
        console.log("Artist: " + output.artist);
        var eles = document.querySelectorAll("div.gdtm a, div.gdtl a");
        for (var i = 0; i < eles.length; i++) {
            var ele = eles[i];
            var imgEle = ele.querySelector("img");
            output.addLink(createLink(ele.href, "page", null, imgEle.src));
        }
        var nextEle = document.querySelector("div.gtb table.ptb td:last-child a");
        if (nextEle != null) {
            output.addLink(createLink(nextEle.href, "page"));
        }
    } else if (eHentaiImageRegexp.test(url)) {
        console.log("e-Hentai image detected");
        output.artist = "e-Hentai";
        console.log("Artist: " + output.artist);

        // Have to grab the file's name
        //<div>10_0030.jpg :: 1280 x 1920 :: 246.8 KB</div>
        var divEle = document.querySelector("div#i2 div:last-child");
        var filename = null;
        if (divEle != null && eHentaiFilenameRegexp.test(divEle.innerText)) {
            filename = eHentaiFilenameRegexp.exec(divEle.innerText)[1].trim();
        }

        var ele = document.querySelector("div#i7 a");
        if (ele != null) {
            output.addLink(createLink(ele.href, "image", filename));
        }
    }

    else {
        // Check if we're on a shimmie site
        var eles = document.querySelectorAll("div.shm-thumb");
        if (eles.length > 0) {
            output.artist = siteRegexp.exec(url)[1];
            for (var i = 0; i < eles.length; i++) {
                var ele = eles[i];
                var imgEle = ele.querySelector("img");
                var linkEle = ele.querySelector("a:nth-child(3)");
                var link = linkEle.href;

                output.addLink(createLink(link, "file", null, imgEle.src));
            }
            eles = document.querySelectorAll("section#paginator a");
            if (eles != null) {
                for (var i = 0; i < eles.length; i++) {
                    var ele = eles[i];
                    if (ele.innerText == "Next") {
                        output.addLink(createLink(ele.href, "page"));
                    }
                }
            }


        } else {
            var ele = document.querySelector(".shm-main-image");
            if (ele != null) {
                output.artist = siteRegexp.exec(url)[1];
                var link = "";
                if (ele.tagName.toLowerCase() == "img") {
                    link = ele.src;
                    output.addLink(createLink(link, "image"));
                } else if (ele.tagName.toLowerCase() == "video") {
                    ele = ele.querySelector("source");
                    link = ele.src;
                    output.addLink(createLink(link, "video"));
                }
                console.log("Found URL: " + link);
            } else {
                output.error = "Site not recognized";
            }
        }
    }

    if (!async) {
        callback(output);
    }
    return async;
}

function resolvePartialUrl(url) {
    var ele = document.createElement("a");
    ele.href = url;
    return ele.href;
}

function getFileName(link) {
    return decodeURI(link.substring(link.lastIndexOf('/') + 1).split("?")[0])
}

function createLink(url, type, filename, thumbnail, date) {
    console.log("Creating " + type + " link: " + url)
    var output = {};
    output["url"] = resolvePartialUrl(decodeURI(url));
    output["type"] = type;
    output["date"] = date;

    if (filename == null) {
        output["filename"] = getFileName(url);
        if (output["filename"].length == 0) {
            output["filename"] = url;
        }
    } else {
        console.log("Provided filename: " + filename);
        output["filename"] = filename;
    }

    if (thumbnail != null) {
        output["thumbnail"] = thumbnail;
    } else if (type == "image") {
        output["thumbnail"] = url;
    }
    return output;
}

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");
        if (request.command == "getPageMedia"
            &&request.url==window.location.href) {
            return getPageMedia(function (result) {
                if (result.artist != null) {
                    result.artist = result.artist.toLowerCase();
                }
                console.log("Total media items found: " + result.links.length);
                sendResponse(result);
            });
        }

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
                output.push(createLink(link, "image"));
            }
        }
    } else {
        console.log("No img tags found");
    }
    return output;
}