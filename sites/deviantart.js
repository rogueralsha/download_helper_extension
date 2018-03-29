let deviantartSource = {
    name: "deviantart",
    galleryRegExp: new RegExp("https?://([^\\.]+)\\.deviantart\\.com/gallery/.*", 'i'),
    galleryItemSelector: "a.torpedo-thumb-link",
    regExp: new RegExp("https?://([^\\.]+)\\.deviantart\\.com/art/.*", 'i'),
    sandboxRegExp: new RegExp("https?://sandbox\\.deviantart\\.com.*", 'i'),

    cachedLinks: [],

    addLinkToCache: function(link) {
        if (!this.cachedLinks.includes(link)) {
            console.log("Found URL: " + link);
            this.cachedLinks.push(link);
        }
    },

    isSupported: function(url) {
        return this.regExp.test(url);
    },

    monitor: function (url) {
        if(!this.galleryRegExp.test(url))
            return;

        console.log("Deviantart gallery detected, attaching live link gathering");
        let eles = document.querySelectorAll(this.galleryItemSelector);

        for (let i = 0; i < eles.length; i++) {
            this.addLinkToCache(eles[i].href);
        }


        let source = this;


        let observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.type != "childList" || mutation.addedNodes.length == 0) {
                    return;
                }
                for (let j = 0; j < mutation.addedNodes.length; j++) {
                    let node = mutation.addedNodes[j];
                    eles = document.querySelectorAll(deviantartSource.galleryItemSelector);
                    for (let k = 0; k < eles.length; k++) {
                        let link = eles[k].href;
                        source.addLinkToCache(link);
                    }
                }
            });
        });
        let config = {childList: true, subtree: true,};
        observer.observe(document, config);
    },
    process: async function (url, output) {
        let result =   false;
        let source = this;
        if (this.regExp.test(url)) {
            result = true;
            console.log("Deviantart page detected");
            let matches = this.regExp.exec(url);
            output.artist = matches[1];
            console.log("Artist: " + output.artist);

            let ele = document.querySelector(".dev-page-download");
            let download_url;
            if (ele == null) {
                // This means the download button wasn't found
                ele = document.querySelector(".dev-content-full");
                if (ele == null) {
                    ele = document.querySelector("iframe.flashtime");
                    if (ele == null) {
                        output.error = "No media found";
                    } else {
                        // Embedded flash file without a download button
                        let response = await getPageContentsFromIframe(ele.src);
                        if (response != null) {
                            for (let i = 0, len = response.length; i < len; i++) {
                                output.addLink(response[i]);
                            }
                        }
                    }
                } else {
                    console.log("Found URL: " + ele.src);
                    output.addLink(createLinkLegacy(ele.src, "image"));
                }
            } else {
                console.log("Found URL: " + ele.href);
                output.addLink(createLinkLegacy(ele.href, "image"));
            }
        } else if (this.galleryRegExp.test(url)) {
            result = true;
            console.log("Deviantart gallery detected");
            let matches = this.galleryRegExp.exec(url);
            output.artist = matches[1];
            console.log("Artist: " + output.artist);

            let eles = document.querySelectorAll(this.galleryItemSelector);

            for (let i = 0; i < eles.length; i++) {
                let link = eles[i].href;
                source.addLinkToCache(link);
            }


            if (source.cachedLinks == null || source.cachedLinks.length === 0) {
                output.error = "No media found";
            }
            for (i = 0; i < source.cachedLinks.length; i++) {
                let link = source.cachedLinks[i];

                console.log("Found URL: " + link);
                output.addLink(createLinkLegacy(link, "page"));
            }
        } else if(this.sandboxRegExp.test(url)) {
            console.log("Deviantart sandbox");
            result  = true;
            let ele = document.querySelector("embed#sandboxembed");
            if(ele!=null) {
                let link = ele.src;
                output.addLink(createLinkLegacy(link));
            }
        }

        return result;
    }
};