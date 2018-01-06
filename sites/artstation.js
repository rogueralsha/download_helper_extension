let artstationSource = {
    name: "artstation",
    regExp: new RegExp("https?://www\\.artstation\\.com/artwork/.*", 'i'),
    newRegExp: new RegExp("https?://([^\\.]+)\\.artstation\\.com/projects/.*", 'i'),
    userRegExp: new RegExp("https?://www\\.artstation\\.com/(.*)", 'i'),


    isSupported: function(url) {
        return this.regExp.test(url);
    },

    process: async function (url, output) {
        let result =   false;
        if(this.newRegExp.test(url)) {
            console.log("Artstation project page");
            result = true;
            output.artist = this.newRegExp.exec(url)[1];
            console.log("Artist: " + output.artist);

            let elements = document.querySelectorAll("div.block-image a, div.project-assets-item a");
            if (elements == null || elements.length == 0) {
                output.error = "No media found";
            }

            for (let i = 0; i < elements.length; i++) {
                let ele = elements[i];
                if (ele == null) {
                    output.error = "No media found";
                } else {
                    let link = ele.href;
                    output.addLink(createLinkLegacy(link, "image"));
                }
            }
        } else if (this.regExp.test(url)) {
            console.log("Artstation image page");
            result = true;
            let ele = document.querySelector("div.artist-name-and-headline div.name a");
            output.artist = ele.href.substring(ele.href.lastIndexOf('/') + 1);
            console.log("Artist: " + output.artist);

            let elements = document.querySelectorAll("div.asset-actions a");
            if (elements == null || elements.length == 0) {
                output.error = "No media found";
            }

            for (let i = 0; i < elements.length; i++) {
                ele = elements[i];
                if (ele == null) {
                    output.error = "No media found";
                } else {
                    let link = ele.href;
                    output.addLink(createLinkLegacy(link, "image"));
                }
            }

        } else if(this.userRegExp.test(url)) {
            result = true;
            output.artist = this.userRegExp.exec(url)[1];
            console.log("Artstation user page");
            let eles = document.querySelectorAll("div.gallery a.project-image");
            for (let i = 0; i < eles.length; i++) {
                let ele = eles[i];
                let link = ele.href;
                let imgEle = ele.querySelector("img.image");
                output.addLink(createLinkLegacy(link, "page",null, imgEle.src));
            }


        }
            return result;
    }
};