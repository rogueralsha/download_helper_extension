let bloggerSource = {
    name: "blogger",
    regExp: new RegExp("https?://([^\\.]+)\\.blogspot\\.com/.*", 'i'),


    postRegExp: new RegExp("https?://([^\\.]+)\\.blogspot\\.com/\\d{4}\\/\\d{2}\\/.*", 'i'),

    isSupported: function(url) {
        return this.regExp.test(url);
    },

    process: async function (url, output) {
        let result =   false;
        if(this.postRegExp.test(url)) {
            result = true;
            console.log("Blogger page detected");

            output.artist = this.regExp.exec(url)[1];
            console.log("Artist: " + output.artist);


            let eles = document.querySelectorAll("div.post-body a");
            for(let i = 0; i < eles.length; i++) {
                let ele = eles[i];
                let link = ele.href;
                let imgEle = ele.querySelector("img");
                let imgUrl = null;
                if(imgEle!=null) {
                    imgUrl = imgEle.src;
                } else {
                    continue;
                }
                console.log("Found URL: " + link);
                output.addLink(createLink({url: link, type:"image",thumbnail: imgUrl}));
            }

        } else if (this.regExp.test(url)) {
            result = true;
            console.log("Blogger page detected");

            output.artist = this.regExp.exec(url)[1];
            console.log("Artist: " + output.artist);

            let eles = document.querySelectorAll("a.timestamp-link");
            for(let i = 0; i < eles.length; i++) {
                let ele = eles[i];
                let link = ele.href;
                console.log("Found URL: " + link);
                output.addLink(createLinkLegacy(link, "page"));
            }

            let prevPageele = document.querySelector("div.blog-pager a.blog-pager-older-link");
            if(prevPageele!=null) {
                let link = prevPageele.href;
                console.log("Found URL: " + link);
                output.addLink(createLinkLegacy(link, "page"));
            }
        }

        return result;
    }
};