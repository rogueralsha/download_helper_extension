let comicArtCommunitySource = {
    galleryRegexp: new RegExp("^https?:\\/\\/.*\\.?comicartcommunity\\.com\\/gallery\\/categories.php\\?cat_id=(\\d+).*", 'i'),

    imageRegexp: new RegExp("^https?:\\/\\/.*\\.?comicartcommunity\\.com\\/gallery\\/details.php\\?image_id=(\\d+).*", 'i'),
    isSupported: function (url) {
        return this.galleryRegexp.test(url);
    },

    process: async function (url, output) {
        let result = false;
        if (this.imageRegexp.test(url)) {
            console.log("Comic art community image page detected");
            result = true;
            let m = this.imageRegexp.exec(url);
            output.artist = url;

            let ele = document.querySelector('div.wide center img');
            if (ele != null) {
                let link = ele.src;
                output.addLink(createLink({url: link, type: "image"}));
            }

        } else if (this.galleryRegexp.test(url)) {
            console.log("Comic art community gallery page detected");
            result = true;
            let m = this.galleryRegexp.exec(url);
            output.artist = "cac" + m[1];

            let eles = document.querySelectorAll("tr td span a");

            for (let i = 0; i < eles.length; i++) {
                let ele = eles[i];
                let imgEle = ele.querySelector("img");
                let link = ele.href;
                let thumb = imgEle.src;
                output.addLink(createLink({url: link, type: "page", thumbnail: thumb}));
            }
            eles = document.querySelectorAll("div.wide.column a.button.mini");
            for (let i = 0; i < eles.length; i++) {
                console.log("Paginator found");
                let ele = eles[i];
                if (ele.innerText.includes("»")) {
                    let link = ele.href;
                    output.addLink(createLink({url: link, type: "page"}));
                    break;
                }
            }
        }
        return result;
    }
};