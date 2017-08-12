let deviantartSource = {
    name: "deviantart",
    galleryRegExp: new RegExp("https?://([^\\.]+)\\.deviantart\\.com/gallery/.*", 'i'),
    galleryItemSelector: "a.torpedo-thumb-link",
    regExp: new RegExp("https?://([^\\.]+)\\.deviantart\\.com/art/.*", 'i'),
    sandboxRegExp: new RegExp("https?://sandbox\\.deviantart\\.com.*", 'i'),

    monitor: function (url) {
        if(!this.galleryRegExp.test(url))
            return;

        console.log("Deviantart gallery detected, attaching live link gathering");
        let eles = document.querySelectorAll(this.galleryItemSelector);

        for (let i = 0; i < eles.length; i++) {
            console.log("Found URL: " + eles[i].href);
            cachedLinks.push(eles[i].href);
        }

        let observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.type != "childList" || mutation.addedNodes.length == 0) {
                    return;
                }
                for (let j = 0; j < mutation.addedNodes.length; j++) {
                    let node = mutation.addedNodes[j];
                    eles = document.querySelectorAll(this.galleryItemSelector);
                    for (let k = 0; k < eles.length; k++) {
                        let link = eles[k].href;
                        if (!cachedLinks.includes(link)) {
                            console.log("Found URL: " + link);
                            cachedLinks.push(link);
                        }
                    }
                }
            });
        });
        let config = {childList: true, subtree: true,};
        observer.observe(document, config);
    },
    process: async function (url, output) {
        let result =   false;
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
                    output.addLink(createLink(ele.src, "image"));
                }
            } else {
                console.log("Found URL: " + ele.href);
                output.addLink(createLink(ele.href, "image"));
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
        } else if(this.sandboxRegExp.test(url)) {
            console.log("Deviantart sandbox")
            result  = true;
            let ele = document.querySelector("embed#sandboxembed");
            if(ele!=null) {
                let link = ele.src;
                output.addLink(createLink(link));
            }
        }

        return result;
    }
};