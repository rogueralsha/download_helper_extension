let webmshareSource = {
    name: "webmshare",
    regExp: new RegExp("https?:\\/\\/webmshare\.com\\/(play\/)?([^\\/]+)$", 'i'),

    isSupported: function(url) {
        return this.regExp.test(url);
    },


    process: async function (url, outputData) {
        let result = false;
        if (this.regExp.test(url)) {
            result = true;
            console.log("webmshare page detected");
            outputData.saveByDefault = false;

            outputData.artist = "webmshare";
            console.log("Artist: " + outputData.artist);
            let videoEle = document.querySelector("video#player");
            let sourceEle = videoEle.querySelector("source[type='video/webm']");
            let link = sourceEle.src;
            console.log("Found URL: " + link);
            outputData.addLink(createLinkLegacy(link, "video"));

        }
        return result;
    }
};