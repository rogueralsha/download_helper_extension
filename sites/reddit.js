let redditSource = {
    name: "reddit",
    regExp: new RegExp("https?://www\\.reddit\\.com/r/([^\\/]+)\\/.*", 'i'),
    postRegexp: new RegExp("https?://www\\.reddit\\.com/r/([^\\/]+)/comments/.*", 'i'),


    process: async function (url, outputData) {
        let result = false;
        if (this.regExp.test(url)) {
            result = true;
            console.log("Reddit page detected");
            let matches = this.regExp.exec(url);
            outputData.artist = matches[1];
            console.log("Artist: " + outputData.artist);

            let links = document.querySelectorAll("a.title");
            if (links != null && links.length > 0) {
                for (let i = 0; i < links.length; i++) {
                    let link = links[i].href;
                    console.log("Found URL: " + link);
                    if (this.postRegexp.test(link)) {
                        //continue;
                    } else if (isSupportedPage(link)) {
                        outputData.addLink(createLink(link, "page"));
                    } else {
                        outputData.addLink(createLink(link, "image"));
                    }
                }
            }
        }
        return result;
    }
};