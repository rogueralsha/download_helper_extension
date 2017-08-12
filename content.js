let artStationRegExp = new RegExp("https?://www\\.artstation\\.com/artwork/.*", 'i');

let twitterRegExp = new RegExp("https?://twitter\\.com/([^/]+)/?", 'i');
let twitterPostRegExp = new RegExp("https?://twitter\\.com/([^/]+)/status/.+", 'i');

let redditRegexp = new RegExp("https?://www\\.reddit\\.com/r/([^\\/]+)\\/.+", 'i');
let redditPostRegexp = new RegExp("https?://www\\.reddit\\.com/r/([^\\/]+)/comments/.+", 'i');

let newsBlurRegExp = new RegExp("https?:\\/\\/newsblur\.com\\/(site\\/\\d+|folder)\\/(.+)", 'i');

let pixivSiteRegexp = new RegExp("https?://www\\.pixiv\\.net/", 'i');
let pixivImgRegexp = new RegExp("https?://i\\.pximg\\.net/.+", 'i');


let gfycatRegexp = new RegExp("https?:\\/\\/gfycat\.com\\/([^\\/]+)$", 'i');
let mixtapeRegexp = new RegExp("https?:\\/\\/my\.mixtape\.moe\\/([^\\/]+)$", 'i');
let eroshareRegexp = new RegExp("https?:\\/\\/eroshare\.com\\/([^\\/]+)$", 'i');
let pimpandhostRegexp = new RegExp("https?:\\/\\/pimpandhost\\.com\\/image\\/(\\d+)$", 'i');
let imagebamRegexp = new RegExp("https?:\\/\\/www\\.imagebam\\.com\\/image\\/([\\da-f]+)$", 'i');
let siteRegexp = new RegExp("https?://([^/]+)/.*", 'i');


//http://pimpandhost.com/image/15692563
//http://t.umblr.com/redirect?z=https%3A%2F%2Fmy.mixtape.moe%2Fjuiydn.png&t=YmMzMWMzNTQzOTNlMjkxZGFlZjE1MGIxZTQ2MzNmYmRjOGM0NjQ5ZixVUFFnUXI0SA%3D%3D&b=t%3AOq704QYOd310j2BA8Z3cQg&p=http%3A%2F%2Fcolonelyobo.tumblr.com%2Fpost%2F160042170354%2Fnom-full-size-hey-with-all-the-running-she-does&m=1


let backgroundImageRegexp = new RegExp("url\\([\\'\\\"](.+)[\\'\\\"]\\)")

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
        instagramSource.regExp.test(link) ||
        tumblrRegExp.test(link) ||
        artStationRegExp.test(link) ||
        deviantartSource.regExp.test(link) ||
        flickrRegexp.test(link) ||
        eroshareRegexp.test(link) ||
        gfycatRegexp.test(link) ||
        postimgPostRegexp.test(link)||
        postimgAlbumRegexp.test(link)||
        pimpandhostRegexp.test(link)||
        imagebamRegexp.test(link)) {
        return true;
    }
    return false;
}


let cachedLinks = [];
let imgEles = [];

async function downloadItem(link, callback) {
    let result = await getPageMedia();
        let src = event.srcElement.src;
        if (result.error == null) {
            result.links = [];
            result.addLink(createLink(link, "image"));
            chrome.runtime.sendMessage({command: "download", results: result}, function (response) {
                if (callback != null) {
                    callback();
                }
            });
        }
}

function downloadHelperPageInit() {
    let toolbarEle = document.createElement("div");
    toolbarEle.style.display = "none";
    toolbarEle.style.position = "absolute";
    toolbarEle.style.zIndex = "99999999999";
    let btnEle = document.createElement("input");
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
        for (let i = 0; i < imgEles.length; i++) {
            let imgEle = imgEles[i];
            imgEle.dataset["index"] = i;
            imgEle.addEventListener("dragend", function (event) {
                downloadItem(imgEle.src);
            });
            imgEle.addEventListener("mouseover", function (event) {
                let rect = event.srcElement.getBoundingClientRect();
                let y = rect.top;
                let x = rect.left;
                toolbarEle.dataset["link"] = event.srcElement.src;
                toolbarEle.style.left = x + "px";
                toolbarEle.style.top = y + "px";
                toolbarEle.style.display = "block";
            });
        }
    }

    let url = window.location.href;
    deviantartSource.monitor(url);
}


window.onload = downloadHelperPageInit;

let sources = [deviantartSource, instagramSource, miniTokyoSource];

async function getPageMedia() {
        let url = window.location.href;
        let outputData = {};
    try {
        outputData.links = [];
        outputData.action = "download";
        outputData.error = null;
        outputData.saveByDefault = true;
        outputData.addLink = function (link) {
            for (let i = 0; i < this.links.length; i++) {
                if (this.links[i].url == link.url) {
                    return;
                }
            }
            this.links.push(link);
        };

        let metaAppName = document.querySelector('meta[property="al:android:app_name"]');

        let result;
        for (let i = 0; i < sources.length; i++) {
            let source = sources[i];
            result = await source.process(url, outputData);
            if(result)
                break;
        }

        if (!result) {
            if (artStationRegExp.test(url)) {
                let ele = document.querySelector("div.artist-name-and-headline div.name a");
                outputData.artist = ele.href.substring(ele.href.lastIndexOf('/') + 1);
                console.log("Artist: " + outputData.artist);

                let elements = document.querySelectorAll("div.asset-actions a");
                if (elements == null || elements.length == 0) {
                    outputData.error = "No media found";
                }
                for (let i = 0; i < elements.length; i++) {
                    ele = elements[i];
                    if (ele == null) {
                        outputData.error = "No media found";
                    } else {
                        let link = ele.href;
                        if (link.indexOf("&dl=1") > -1) {
                            console.log("Found URL: " + link);
                            outputData.addLink(createLink(link, "image"));
                        }
                    }
                }
            } else if (isTumblrSite(url, metaAppName)) {
                await processTumblr(url, outputData);
            } else if (isHentaiFoundrySite(url)) {
                processHentaiFoundry(url, outputData);
            } else if (isPatreonSite(url)) {
                await processPatreon(url, outputData);
            } else if (twitterRegExp.test(url)) {
                console.log("Twitter page detected");
                let matches = twitterRegExp.exec(url);
                outputData.artist = matches[1];
                console.log("Artist: " + outputData.artist);

                if (twitterPostRegExp.test(url)) {
                    // This means we're viewing an individual post
                    let elements = document.querySelectorAll(".permalink-container .js-adaptive-photo img");
                    for (i = 0; i < elements.length; i++) {
                        let ele = elements[i];
                        let link = ele.src;
                        console.log("Found URL: " + link);
                        outputData.addLink(createLink(link + ":large", "image", getFileName(link)));
                    }
                } else {
                    // This means it's a user's page
                    let tweets = document.querySelectorAll("div.tweet");
                    for (i = 0; i < tweets.length; i++) {
                        let ele = tweets[i];
                        let id = ele.dataset["tweetId"];
                        if (id === undefined) {
                            continue;
                        }
                        let link = "https://twitter.com/" + outputData.artist + "/status/" + id;
                        console.log("Found URL: " + link);
                        outputData.addLink(createLink(link, "page", id));
                    }
                }
            } else if (redditRegexp.test(url)) {
                console.log("Reddit page detected");
                let matches = redditRegexp.exec(url);
                outputData.artist = matches[1];
                console.log("Artist: " + outputData.artist);

                let links = document.querySelectorAll("a.title");
                if (links != null && links.length > 0) {
                    for (let i = 0; i < links.length; i++) {
                        let link = links[i].href;
                        console.log("Found URL: " + link);
                        if (redditPostRegexp.test(link)) {
                            continue;
                        } else if (isSupportedPage(link)) {
                            outputData.addLink(createLink(link, "page"));
                        } else {
                            outputData.addLink(createLink(link, "image"));
                        }
                    }
                }
            } else if (isImgurSite(url)) {
                await processImgur(url, outputData);
            } else if (isPostimgSite(url)) {
                await processPostimg(url, outputData);
            } else if (isMetArtSite(url)) {
                processMetArt(url, outputData);
            } else if (isAlsScanSite(url)) {
                processAlsScan(url, outputData);
            } else if (document.querySelector("#cpg_main_block_outer") != null) {
                console.log("Coppermine site detected");
                outputData.artist = siteRegexp.exec(url)[1];

                let coppermineAlbumRegex = new RegExp(".+\\/index\\.php\\?cat\\=\\d+");
                let coppermineThumbnailsRegex = new RegExp(".+\\/thumbnails\\.php\\?album\\=\\d+");

                let thumbEles = [];
                if (coppermineAlbumRegex.test(url)) {
                    thumbEles = document.querySelectorAll("td.thumbnails a.albums");
                } else if (coppermineThumbnailsRegex.test(url)) {
                    thumbEles = document.querySelectorAll("td.thumbnails a");
                }


                let titleEle = document.querySelector("table.maintable h2");
                if (titleEle != null) {
                    outputData["page_title"] = titleEle.innerText;
                }

                for (let i = 0; i < thumbEles.length; i++) {
                    let thumbEle = thumbEles[i];
                    let imgEle = thumbEle.querySelector("img");
                    let link = thumbEle.href;
                    console.log("Found URL: " + link);
                    if (imgEle.title != null && imgEle.title.length > 0) {
                        outputData.addLink(createLink(link, "page", imgEle.title, imgEle.src));
                    } else {
                        let tableEle = thumbEle.parentNode;
                        while (tableEle.nodeName.toLowerCase() != "table") {
                            tableEle = tableEle.parentNode;
                        }
                        let titleEle = tableEle.querySelector("td.tableh2 a");
                        if (titleEle != null) {
                            outputData.addLink(createLink(link, "page", titleEle.innerText, imgEle.src));
                        } else {
                            outputData.addLink(createLink(link, "page", null, imgEle.src));
                        }

                    }
                }


                let itemEle = document.querySelector(".display_media");
                if (itemEle != null) {
                    let objEle = itemEle.querySelector("object param[name='src']")
                    let imgEle = itemEle.querySelector("img");
                    let downEle = document.querySelector("a.button");
                    if (downEle != null) {
                        let link = downEle.href;
                        console.log("Found URL: " + link);
                        outputData.addLink(createLink(link, "image"));
                    } else if (objEle != null) {
                        let link = objEle.value;
                        console.log("Found URL: " + link);
                        outputData.addLink(createLink(link, "video"));
                    } else if (imgEle != null) {
                        let link = imgEle.src;
                        console.log("Found URL: " + link);
                        outputData.addLink(createLink(link, "image"));
                    } else {
                        console.debug("No media element found!");
                    }
                } else {
                    let navEles = document.querySelectorAll("td.navmenu a");
                    let coppermineAlbumPageRegex = new RegExp(".+\\/thumbnails\\.php\\?album=\\d+\\&page=(\\d+)");
                    let coppermineCategoryPageRegex = new RegExp(".+\\/index\\.php\\?cat=\\d+\\&page=(\\d+)");
                    let currentPage = 1;
                    if (coppermineAlbumPageRegex.test(url)) {
                        currentPage = parseInt(coppermineAlbumPageRegex.exec(url)[1]);
                    } else if (coppermineCategoryPageRegex.test(url)) {
                        currentPage = parseInt(coppermineCategoryPageRegex.exec(url)[1]);
                    }
                    for (let i = 0; i < navEles.length; i++) {
                        let navEle = navEles[i];
                        let link = navEle.href;

                        let navPage = -1;
                        if (coppermineAlbumPageRegex.test(link)) {
                            navPage = parseInt(coppermineAlbumPageRegex.exec(link)[1]);
                        } else if (coppermineCategoryPageRegex.test(link)) {
                            navPage = parseInt(coppermineCategoryPageRegex.exec(link)[1]);
                        } else {
                            continue;
                        }

                        if (navPage == currentPage + 1) {
                            console.log("Found URL: " + link);
                            outputData.addLink(createLink(link, "page"));
                        }
                    }
                }
            } else if (newsBlurRegExp.test(url)) {
                console.log("Newsblur page detected");

                let matches = newsBlurRegExp.exec(url);
                outputData.artist = matches[2];
                console.log("Artist: " + outputData.artist);

                let stories = document.querySelectorAll(".NB-story-titles .NB-story-title-container");

                if (stories != null && stories.length > 0) {
                    for (let j = 0; j < stories.length; j++) {
                        let story = stories[j];

                        let link = story.querySelector(".NB-storytitles-content a");
                        if (link == null) {
                            continue;
                        }
                        link = link.href;
                        let imgEle = story.querySelector(".NB-storytitles-story-image");
                        let thumbnail = null;
                        if (imgEle != null && backgroundImageRegexp.test(imgEle.style.backgroundImage)) {
                            thumbnail = backgroundImageRegexp.exec(imgEle.style.backgroundImage)[1];
                        }
                        console.log("Found URL: " + link);
                        let dateEle = story.querySelector(".story_date ");
                        let date = null;
                        if (dateEle != null) {
                            date = Date.parse(dateEle.innerText);
                        }
                        outputData.addLink(createLink(link, "image", null, thumbnail, date));
                    }
                }
            } else if (gfycatRegexp.test(url)) {
                console.log("Gfycat page detected");
                outputData.saveByDefault = false;

                outputData.artist = "gfycat";
                console.log("Artist: " + outputData.artist);
                let videoEle = document.querySelector("video.share-video");
                let sourceEle = document.querySelector("source#webmSource");
                let link = sourceEle.src;
                console.log("Found URL: " + link);
                outputData.addLink(createLink(link, "video"));
            } else if (eroshareRegexp.test(url)) {
                console.log("Eroshare page detected");
                let ele = document.querySelector(".user-link");
                outputData.artist = ele.innerText;
                console.log("Artist: " + outputData.artist);
                let videoEles = document.querySelectorAll("video");
                for (let j = 0; j < videoEles.length; j++) {
                    let videoEle = videoEles[j]
                    let link = videoEle.src;
                    console.log("Found URL: " + link);
                    outputData.addLink(createLink(link, "video", null, videoEle.poster));
                }
            } else if (isFlickrSite(url)) {
                processFlickr(url, outputData);
            } else if (isEhentaiSite(url)) {
                processEhentai(url, outputData);
            } else if (pimpandhostRegexp.test(url)) {
                console.log("Pimp and host image detected");
                outputData.artist = "pimpandhost";
                outputData.saveByDefault = false;
                console.log("Artist: " + outputData.artist);

                let imgEle = document.querySelector("div#main-container img");
                if (imgEle != null) {
                    outputData.addLink(createLink(imgEle.src, "image"));
                }
            } else if (imagebamRegexp.test(url)) {
                console.log("Imagebam image detected");
                outputData.artist = "iamgebam";
                outputData.saveByDefault = false;
                console.log("Artist: " + outputData.artist);

                let imgEle = document.querySelector("div.container-full img");
                if (imgEle != null) {
                    outputData.addLink(createLink(imgEle.src, "image"));
                }
            } else if (pixivSiteRegexp.test(url) || pixivImgRegexp.test(url)) {
                processPixiv(url, outputData);
            }
            else {
                let otherSiteFound = false;
                // Check if we're on a shimmie site
                if (isShimmieSite()) {
                    otherSiteFound = true;
                    processShimmit(url, outputData);
                }

                // check for wp gallery types
                let eles = document.querySelectorAll(".ngg-galleryoverview  div.ngg-gallery-thumbnail-box");
                if (eles.length > 0) {
                    otherSiteFound = true;
                    outputData.artist = siteRegexp.exec(url)[1];
                    for (let i = 0; i < eles.length; i++) {
                        let ele = eles[i];
                        let imgEle = ele.querySelector("img");
                        let linkEle = ele.querySelector("a");
                        let link = linkEle.href;

                        outputData.addLink(createLink(link, "file", null, imgEle.src));
                    }
                    let ele = document.querySelector("div.ngg-navigation a.next");
                    if (ele != null) {
                        outputData.addLink(createLink(ele.href, "page"));
                    }

                }

                eles = document.querySelectorAll("div.tiled-gallery img");
                if (eles.length > 0) {
                    otherSiteFound = true;
                    outputData.artist = siteRegexp.exec(url)[1];
                    for (let i = 0; i < eles.length; i++) {
                        let imgEle = eles[i];
                        let link = imgEle.dataset.origFile;
                        if (link == undefined) {
                            console.log("Undefined link!");
                            continue;
                        }

                        outputData.addLink(createLink(link, "file", null, imgEle.src));
                    }

                }

                eles = document.querySelectorAll("article.format-gallery img, figure.gallery-item img");
                if (eles.length > 0) {
                    otherSiteFound = true;
                    outputData.artist = siteRegexp.exec(url)[1];
                    for (let i = 0; i < eles.length; i++) {
                        let imgEle = eles[i];
                        let link = imgEle.dataset.largeFile;
                        if (link == undefined) {
                            console.log("Undefined link!");
                            continue;
                        }

                        outputData.addLink(createLink(link.split("?")[0], "file", null, imgEle.src));
                    }

                }

                let ele = document.querySelector("body img:first-child");
                if (ele != null) {
                    // This should catch images that have been opened in chrome
                    outputData.artist = siteRegexp.exec(url)[1];
                    outputData.addLink(createLink(ele.src, "file"));
                    otherSiteFound = true;
                }


                if (!otherSiteFound) {
                    outputData.error = "Site not recognized";
                }
            }
        }
    } catch(err) {
        outputData.error = err.message;
        console.log(err);
    }
    return outputData;
}

function resolvePartialUrl(url) {
    let ele = document.createElement("a");
    ele.href = url;
    return ele.href;
}

function getFileName(link) {
    return decodeURI(link.substring(link.lastIndexOf('/') + 1).split("?")[0])
}

function createLink(url, type, filename, thumbnail, date) {
    if (imgurPostRegexp.test(url)) {
        // Mobile imgur links redirect, sow e need to filter them a bit
        let m = imgurPostRegexp.exec(url);
        if (m[1] == "m.") {
            url = url.replace("//m.imgur.", "//imgur.")
        }
    }

    console.log("Creating " + type + " link: " + url)
    let outputData = {};
    outputData["url"] = resolvePartialUrl(decodeURI(url));
    outputData["type"] = type;
    outputData["date"] = date;

    if (filename == null) {
        outputData["filename"] = getFileName(url);
        if (outputData["filename"].length == 0) {
            outputData["filename"] = url;
        }
    } else {
        console.log("Provided filename: " + filename);
        outputData["filename"] = filename;
    }

    if (thumbnail != null) {
        outputData["thumbnail"] = thumbnail;
    } else if (type == "image") {
        outputData["thumbnail"] = url;
    }
    return outputData;
}

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");
        if (request.command == "getPageMedia"
            && request.url == window.location.href) {

            getPageMediaMessageListener(sendResponse);
            return true;
        }

    });

async function getPageMediaMessageListener(sendResponse) {
    let result = await getPageMedia();

    if (result.artist != null) {
        result.artist = result.artist.toLowerCase();
    }
    console.log("Total media items found: " + result.links.length);
    sendResponse(result);
}



async function triggerAutoLoad() {
    let prevHeight = 0;
    await sleep(500);
    while (prevHeight != document.body.scrollHeight) {
        window.scrollTo(0, document.body.scrollHeight);
        prevHeight = document.body.scrollHeight;
        await sleep(750);
    }
    window.scrollTo(0, document.body.scrollHeight);
}


function waitToLoad() {
    let output = new Promise(function (resolve, reject) {
        document.addEventListener('DOMContentLoaded', function (e) {
            e.target.removeEventListener(e.type, arguments.callee);
            resolve();
        });
    });
    return output;
}
