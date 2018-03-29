let tumblrSource = {
    name: "tumblr",

    regExp: new RegExp("https?://([^\\.]+)\\.tumblr\\.com/", 'i'),
    postRegExp: new RegExp("https?://[^\\/]+/post/.*", 'i'),
    mobilePostRegExp: new RegExp("https?://[^\\/]+/post/.*/mobile", 'i'),
    archiveRegExp: new RegExp("https?://[^\\/]+/archive", 'i'),
    redirectRegExp: new RegExp("redirect\\?z=(.+)&t=", 'i'),
    cachedLinks: [],

    addLinkToCache: function(link) {
        if (!this.cachedLinks.includes(link)) {
            console.log("Found URL: " + link);
            this.cachedLinks.push(link);
        }
    },

    isTumblrSite: function (url) {
        let metaAppName = document.querySelector('meta[property="al:android:app_name"]');

        return this.regExp.test(url) || (metaAppName != null && metaAppName.content.toLowerCase() === "tumblr") || document.querySelector("meta[name='tumblr-theme']") != null;
    },

    isSupported: function (url) {
        return this.regExp.test(url) || this.postRegExp.test(url) || this.mobilePostRegExp.test(url) || this.archiveRegExp.test(url);
    },

    getTumblrImages: function (documentRoot) {
        let tumblrMediaRegExp = new RegExp("https?://\\d+\\.media\\.tumblr\\.com/.*", 'i');

        //http://78.media.tumblr.com/c3afd1a91fd30f580d7b1cb531225d23/tumblr_p5vgrwws8B1vhcokzo1_500.jpg

        let output = [];
        let elements = documentRoot.querySelectorAll("img");
        if (elements != null && elements.length > 0) {
            console.log("Found " + elements.length + " img tags");
            for (let i = 0; i < elements.length; i++) {
                let ele = elements[i];
                if (ele == null) {
                    console.log("Null element in img list");
                } else {
                    let link = ele.src;
                    console.log("Checking image", link);
                    if (link.indexOf("avatar_") > -1) {
                        console.log("Tumblr avatar, skipping");
                        continue;
                    }
                    if (!tumblrMediaRegExp.test(link)) {
                        console.log("Does not match tumblr regexp, skipping");
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
                    output.push(createLinkLegacy(link, "image"));
                    if (link.indexOf("_1280.") > -1) {
                        link = link.replace("_1280", "_raw");
                        console.log("Found URL: " + link);
                        output.push(createLinkLegacy(link, "image"));
                    }
                }
            }
        } else {
            console.log("No img tags found");
        }
        return output;
    },

    process: function (url, outputData) {
        let result = false;
        let source = this;
        return new Promise(async function (resolve, reject) {
            if (!source.isTumblrSite(url)) {
                resolve(result);
            }

            console.log("Tumblr page detected");
            if (source.regExp.test(url)) {
                outputData.artist = source.regExp.exec(url)[1];
            } else {
                outputData.artist = siteRegexp.exec(url)[1];
            }

            console.log("Artist: " + outputData.artist);

            if (source.archiveRegExp.test(url)) {
                result = true;
                console.log("Tumblr archive page");

                // let oldHeight = 0;
                // window.scrollTo(0, document.body.scrollHeight);
                // while (oldHeight !== document.body.scrollHeight) {
                //     oldHeight = document.body.scrollHeight;
                //     await sleep(2000);
                //     window.scrollTo(0, document.body.scrollHeight);
                // }
                // window.scrollTo(0, document.body.scrollHeight);

                let links = document.querySelectorAll("div.post a.hover");
                for (let i = 0; i < links.length; i++) {
                    let link = links[i].href;// + "/mobile";
                    source.addLinkToCache(link);
                }


                if (source.cachedLinks == null || source.cachedLinks.length === 0) {
                    outputData.error = "No media found";
                }
                for (let i = 0; i < source.cachedLinks.length; i++) {
                    let link = source.cachedLinks[i];
                    console.log("Found URL: " + link);
                    outputData.addLink(createLinkLegacy(link, "page"));
                }

                resolve(result);
            } else if (source.postRegExp.test(url)) {
                result = true;
                if (source.mobilePostRegExp.test(url)) {
                    // Mobile page - Same code should work, but we can easily detect if it's a reblog so we can skip it
                    if (document.querySelector("a.tumblr_blog") != null) {
                        resolve(result);
                        return;
                    }
                }

                let selectors = ["div.main > article",
                    "div.post-content",
                    "div.post_content",

                    "article",
                    "div.init-posts article",
                    "div.window",
                    "div.post",

                    "div.content",
                    "div#post",
                    "div#postcontent",
                    "li.post",
                    "div.posts",
                    "div.grid_7",
                    "div.photoset",
                    "div#entry",
                    "div#Body"
                ];
                for (let i = 0; i < selectors.length; i++) {
                    let selector = selectors[i];
                    let articles = document.querySelectorAll(selector);
                    if (articles.length == 0) {
                        continue;
                    }
                    console.log("Articles found with selector " + selectors[i]);

                    for (let j = 0; j < articles.length; j++) {
                        let mainArticle = articles[j];
                        let links = source.getTumblrImages(mainArticle);
                        for (let i = 0, len = links.length; i < len; i++) {
                            outputData.addLink(links[i]);
                        }


                        let linkEles = mainArticle.querySelectorAll("a");
                        for (let i = 0; i < linkEles.length; i++) {
                            let linkEle = linkEles[i];
                            if (source.redirectRegExp.test(linkEle.href)) {
                                console.log("Decoding redirect URL", linkEle.href);
                                let link = source.redirectRegExp.exec(linkEle.href)[1];
                                link = decodeURIComponent(link);
                                console.log("Link decoded", link);
                                evaluateLink(link, outputData);
                            }

                        }


                        let iframes = mainArticle.querySelectorAll("iframe.photoset");
                        if (iframes != null && iframes.length > 0) {
                            console.log("Found photoset iframes");
                            try {
                                let iframe = iframes[0];
                                console.log("Getting media from iframe: " + iframe.src);

                                let results = await getPageContentsFromIframe(iframe.src);
                                if (results != null) {
                                    for (let i = 0, len = results.length; i < len; i++) {
                                        outputData.addLink(results[i]);
                                    }
                                }
                            } catch (err) {
                                console.log(err);
                                reject(err);
                            }
                        }

                        if (outputData.links.length > 0) {
                            break;
                        }

                    }
                    if (outputData.links.length > 0) {
                        break;
                    }


                }

            }
            resolve(result);

        });
    },


    monitor: function (url) {
        if(!this.archiveRegExp.test(url))
            return;

        let source = this;

        console.log("Tumblr archive detected, attaching live link gathering");

        let links = document.querySelectorAll("div.post a.hover");
        for (let i = 0; i < links.length; i++) {
            let link = links[i].href;// + "/mobile";
            this.addLinkToCache(link);
        }


        let observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.type != "childList" || mutation.addedNodes.length == 0) {
                    return;
                }
                for (let j = 0; j < mutation.addedNodes.length; j++) {
                    let node = mutation.addedNodes[j];
                    let links = document.querySelectorAll("div.post a.hover");
                    for (let i = 0; i < links.length; i++) {
                        let link = links[i].href;// + "/mobile";
                        source.addLinkToCache(link);
                    }
                }
            });
        });
        let config = {childList: true, subtree: true,};
        observer.observe(document, config);
    },
};



