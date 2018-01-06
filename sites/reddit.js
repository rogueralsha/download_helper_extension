let redditSource = {
    name: "reddit",
    regExp: new RegExp("https?://www\\.reddit\\.com/r/([^\\/]+)\\/.*", 'i'),
    postRegexp: new RegExp("https?://www\\.reddit\\.com/r/([^\\/]+)/comments/.*", 'i'),

    imageRegexp: new RegExp("https?://i\\.redd\\.it/.*", 'i'),

    process: async function (url, outputData) {
        let result = false;
        if (this.regExp.test(url)) {
            result = true;
            outputData.saveByDefault = false;
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
                    } else {
                        evaluateLink(link, outputData,null)
                    }
                }
            }

            links = document.querySelectorAll("div.commentarea  div[data-type=comment] div.usertext-body a");
            if (links != null && links.length > 0) {
                for (let i = 0; i < links.length; i++) {
                    let link = links[i].href;
                    console.log("Found URL: " + link);
                    if (this.postRegexp.test(link)) {
                        //continue;
                    } else {
                        evaluateLink(link, outputData,null, false)
                    }
                }
            }

        }
        return result;
    }
};