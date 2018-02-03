let gfycatSource = {
    name: "gfycat",
    regExp: new RegExp("https?:\\/\\/gfycat\.com\\/([^\\/]+)$", 'i'),
    albumRegexp: new RegExp("https?:\\/\\/gfycat\.com\\/@([^\\/]+)\\/[^\\/]+$", 'i'),

    albumDetailRegexp: new RegExp("https?:\\/\\/gfycat\.com\\/(%40[^\\/]+)\\/[^\\/]+\\/detail\\/([^\\/]+)$", 'i'),


    //https://gfycat.com/@bayern/adasho5/detail/DarkPlayfulAfricanpiedkingfisher

    isSupported: function(url) {
        return (this.regExp.test(url) ||
            this.albumRegexp.test(url));
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
        if(this.albumRegexp.test(url)) {
            result = true;
            console.log("Gfycat page detected");

            outputData.artist = this.albumRegexp.exec(url)[1];
            console.log("Artist: " + outputData.artist);

            let eles = document.querySelectorAll("div.deckgrid  a");

            for(let i = 0; i<eles.length; i++) {
                let link = eles[i].href;
                let img = eles[i].querySelector("img").src;
                if(this.albumDetailRegexp.test(link)) {
                    link = "https://gfycat.com/" + (this.albumDetailRegexp.exec(link)[2]);
                }
                console.log("Found URL: " + link);
                outputData.addLink(createLink({url:link, type:"page", thumbnail: img}));
            }


        } else if (this.regExp.test(url)) {
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