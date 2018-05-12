
let patreonSource = {
    name: "deviantart",

    postsRegExp: new RegExp("^https?://www\\.patreon\\.com/([^/^?]+)/posts/?.*$", 'i'),
    postRegExp: new RegExp("https?://www\\.patreon\\.com/posts/.*", 'i'),
    userRegExp: new RegExp("^https?://www\\.patreon\\.com/([^/^?]+)$", 'i'),
    fileRegExp: new RegExp("^https?:\\/\\/www\\.patreon\\.com\\/file\\?[^\\/]+$", 'i'),

    process: async function (url, output) {
        let result =   false;
        if (this.postRegExp.test(url)) {
            result = true;
            console.log("Patreon post detected");

            let eles = document.querySelectorAll("div.mb-md a");
            for (let i = 0; i < eles.length; i++) {
                let ele = eles[i];
                if(this.userRegExp.test(ele.href)) {
                    output.artist = this.userRegExp.exec(ele.href)[1];
                    console.log("Artist: " + output.artist);
                }
            }
            if(output.artist==null) {
                throw Error("Unable to find artist");
            }

            eles = document.querySelectorAll("div[data-tag='post-card'] img");
            let download_url;
            for (let i = 0; i < eles.length; i++) {
                let ele = eles[i];
                let link = ele.src;
                console.log("Found URL: " + link);
                output.addLink(createLinkLegacy(link, "image"));
            }

            // Get post attachments
            let elements = document.querySelectorAll("a");
            for (let i = 0; i < elements.length; i++) {
                ele = elements[i];
                if (ele != null) {
                    let link = ele.href;
                    if(this.fileRegExp.test(link)) {
                        console.log("Found URL: " + link);
                        output.addLink(createLinkLegacy(link, "image", ele.innerText));
                    }
                }
            }

            // Get links to external media hosts
            elements = document.querySelectorAll("a");
            for (let i = 0; i < elements.length; i++) {
                ele = elements[i];
                let link = ele.href;
                evaluateLink(link, output);
            }
        } else if (this.postsRegExp.test(url)) {
            result = true;
            output.action = "open";

            console.log("Patreon artist posts detected");

            let matches = this.postsRegExp.exec(url);
            output.artist = matches[1];
            console.log("Artist: " + output.artist);

            window.scrollTo(0, document.body.scrollHeight);
            let loadMoreButton = document.querySelector("button.bXKbjO");
            while (loadMoreButton != null) {
                loadMoreButton.click();
                await sleep(2000);
                window.scrollTo(0, document.body.scrollHeight);
                loadMoreButton = document.querySelector("button.bXKbjO");
            }
            window.scrollTo(0, document.body.scrollHeight);

            let elements = document.querySelectorAll("a");
            for (i = 0; i < elements.length; i++) {
                ele = elements[i];
                if (ele != null) {
                    let link = ele.href;
                    if (!this.postRegExp.test(link)) {
                        continue;
                    }
                    console.log("Found URL: " + link);
                    output.addLink(createLinkLegacy(link, "page"));
                }
            }
        }

        return result;
    }
};
