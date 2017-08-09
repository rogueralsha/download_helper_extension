let tumblrRegExp = new RegExp("https?://([^\\.]+)\\.tumblr\\.com/", 'i');
let tumblrPostRegExp = new RegExp("https?://[^\\/]+/post/.*", 'i');
let tumblrMobilePostRegExp = new RegExp("https?://[^\\/]+/post/.*/mobile", 'i');
let tumblrArchiveRegExp = new RegExp("https?://[^\\/]+/archive", 'i');
let tumblrRedirectRegExp = new RegExp("redirect\\?z=(.+)&t=", 'i');

function isTumblrSite(url, metaAppName) {
    return tumblrRegExp.test(url)|| (metaAppName != null && metaAppName.content.toLowerCase() === "tumblr") || document.querySelector("meta[name='tumblr-theme']") != null;
}

function processTumblr(url, output) {
    return new Promise(async function(resolve, reject) {
        var async = false;
        console.log("Tumblr page detected");
        if (tumblrRegExp.test(url)) {
            output.artist = tumblrRegExp.exec(url)[1];
        } else {
            output.artist = siteRegexp.exec(url)[1];
        }

        console.log("Artist: " + output.artist);

        if(tumblrArchiveRegExp.test(url)) {
            console.log("Tumblr archive page");

            let oldHeight = 0;
            window.scrollTo(0, document.body.scrollHeight);
            while (oldHeight !== document.body.scrollHeight) {
                oldHeight = document.body.scrollHeight;
                await sleep(2000);
                window.scrollTo(0, document.body.scrollHeight);
            }
            window.scrollTo(0, document.body.scrollHeight);


            let links = document.querySelectorAll("div.post a.hover");
            for (let i = 0; i < links.length; i++) {
                let link = links[i].href + "/mobile";
                output.addLink(createLink(link, "page"));
            }
        } else if(tumblrPostRegExp.test(url)) {
            if(tumblrMobilePostRegExp.test(url)) {
                // Mobile page - Same code should work, but we can easily detect if it's a reblog so we can skip it
                if(document.querySelector("a.tumblr_blog")!=null) {
                    resolve();
                    return;
                }
            }

            let iframes = document.querySelectorAll("iframe.photoset");
            if (iframes != null && iframes.length > 0) {

                console.log("Found photoset iframes");
                try {
                    let iframe = iframes[0];
                    chrome.runtime.sendMessage({url: iframe.src, command: "getPageMedia"}, function (response) {
                        if (response == null) {
                            console.log("No media found in iframe (null)");
                            resolve();
                            return;
                        }

                        if (response.error != null) {
                            console.log(response.error);
                        } else if (response.links.length == 0) {
                            console.log("No media found in iframe");
                        } else {
                            for (let i = 0, len = response.links.length; i < len; i++) {
                                output.addLink(response.links[i]);
                            }
                        }
                        resolve();
                    });
                    async = true;
                } catch (err) {
                    console.log(err);

                }
            }

            output.links = getTumblrImages(document);


            let linkEles = document.querySelectorAll("a");
            for (let i = 0; i < linkEles.length; i++) {
                let linkEle = linkEles[i];
                if (tumblrRedirectRegExp.test(linkEle.href)) {
                    let link = tumblrRedirectRegExp.exec(linkEle.href)[1];
                    link = decodeURIComponent(link);
                    evaluateLink(link, output);
                }

            }
        }
        if(!async) {
            resolve();
        }
    });
}


function getTumblrImages(documentRoot) {
    let tumblrMediaRegExp = new RegExp("https?://\\d+\\.media\\.tumblr\\.com/.*", 'i');
    let output = [];
    let elements = documentRoot.querySelectorAll("img");
    if (elements != null && elements.length > 0) {
        console.log("Found " + elements.length + " img tags");
        for (i = 0; i < elements.length; i++) {
            let ele = elements[i];
            if (ele == null) {
                console.log("Null element in img list");
                continue;
            } else {
                let link = ele.src;
                if (!tumblrMediaRegExp.test(link) || link.indexOf("avatar_") > -1) {
                    continue;
                }

                if (link.indexOf("_100.") > -1) {
                    link = link.replace("_100", "_1280");
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
                if (link.indexOf("_1280.") > -1) {
                    link = link.replace("_1280", "_raw");
                    console.log("Found URL: " + link);
                    output.push(createLink(link, "image"));
                }
            }
        }
    } else {
        console.log("No img tags found");
    }
    return output;
}