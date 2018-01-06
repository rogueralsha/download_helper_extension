let gfycatSource = {
    name: "gfycat",
    regExp: new RegExp("https?:\\/\\/gfycat\.com\\/([^\\/]+)$", 'i'),

    isSupported: function(url) {
        return this.regExp.test(url);
    },

    getThumbnail: function(url) {
        if (this.regExp.test(url)) {
            var result = this.regExp.exec(url);
            return "https://thumbs.gfycat.com/" + result[1] + "-thumb100.jpg";
        }
     return null;
    },

    process: async function (url, outputData) {
        let result = false;
        if (this.regExp.test(url)) {
            result = true;
            console.log("Gfycat page detected");
            outputData.saveByDefault = false;

            outputData.artist = "gfycat";
            console.log("Artist: " + outputData.artist);
            let sourceEle = document.querySelector("source#webmSource");
            let link = sourceEle.src;
            console.log("Found URL: " + link);
            outputData.addLink(createLinkLegacy(link, "video"));

        }
        return result;
    }
};