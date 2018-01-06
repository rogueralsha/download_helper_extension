//https://www.erome.com/i/n9JAF4HS

let eromeSource = {
    name: "erome",
    regExp: new RegExp("https?://www\\.erome\\.com/[ia]/.*", 'i'),


    isSupported: function(url) {
        return this.regExp.test(url);
    },

    process: async function (url, output) {
        let result =   false;
        if (this.regExp.test(url)) {
            result = true;
            console.log("Erome page detected");

            let ele = document.querySelector("div.username a");
            output.artist = ele.innerText;
            console.log("Artist: " + output.artist);


            let eles = document.querySelectorAll("div.video video");
            for(let i = 0; i<eles.length; i++) {
                let videoEle = eles[i];
                console.log("Found URL: " + videoEle.src);
                output.addLink(createLinkLegacy(videoEle.src, "video"));

            }

            eles = document.querySelectorAll("div#album div.media-group div.img img");
            for(let i = 0; i<eles.length; i++) {
                let imgEle = eles[i];
                console.log("Found URL: " + imgEle.src);
                output.addLink(createLinkLegacy(imgEle.src, "image"));

            }

        }

        return result;
    }
};