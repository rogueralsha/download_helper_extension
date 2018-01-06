let twitterSource = {
    name: "twitter",

    regExp: new RegExp("https?://twitter\\.com/([^/]+)/?", 'i'),
    postRegexp: new RegExp("https?://twitter\\.com/([^/]+)/status/.+", 'i'),

    isSupported: function(url) {
        return this.postRegexp.test(url);
    },

    process: async function (url, outputData) {
        let result = false;
        if (this.regExp.test(url)) {
            result = true;
            console.log("Twitter page detected");
            let matches = this.regExp.exec(url);
            outputData.artist = matches[1];
            console.log("Artist: " + outputData.artist);

            if (this.postRegexp.test(url)) {
                // This means we're viewing an individual post
                let elements = document.querySelectorAll(".permalink-container .js-adaptive-photo img");
                for (let i = 0; i < elements.length; i++) {
                    let ele = elements[i];
                    let link = ele.src;
                    console.log("Found URL: " + link);
                    outputData.addLink(createLink({url:link + ":large",
                                                   type: "image",
                                                    filename: getFileName(link)}
                                                ));
                }
                elements = document.querySelectorAll(".permalink-container .AdaptiveMedia video");
                for (let i = 0; i < elements.length; i++) {
                    let ele = elements[i];
                    let link = ele.src;
                    console.log("Found URL: " + link);
                    outputData.addLink(createLink({url:link,
                        type: "video",
                        filename: getFileName(link)}
                    ));
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
                    outputData.addLink(createLinkLegacy(link, "page", id));
                }
            }
        }
        return result;
    }
};