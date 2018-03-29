let alsscanSource = {
    regexp: new RegExp("^https?://.+\\.alsscan\\.com/.*", 'i'),
    galleryRegexp: new RegExp("^https?://.+\\.alsscan\\.com/.*model/([^\\/]+)/gallery/\\d+/", 'i'),
    galleryImageRegexp: new RegExp("^https?://.+\\.alsscan\\.com/.*model/([^\\/]+)/gallery/\\d+/[^\\/]+/image/.+", 'i'),

    fileDownloadRegex: new RegExp("\\&n\\=([^&]+)&"),

    isSupported: function (url) {
        return this.regexp.test(url);
    },

    process: async function (url, output) {
        console.log("test");
        let result = false;
        if (this.galleryImageRegexp.test(url)) {
            result = true;
            let m = this.galleryImageRegexp.exec(url);
            output.artist = m[1];

            let ele = document.querySelector('a[title="Download"]');
            if (ele != null) {
                let link = ele.href;
                m = this.fileDownloadRegex.exec(link);
                output.addLink(createLinkLegacy(link, "image", m[1]));
            }

        } else if (this.galleryRegexp.test(url)) {
            result = true;
            let m = this.galleryRegexp.exec(url);
            output.artist = m[1];

            let eles = document.querySelectorAll("a.tokenable");

            for (let i = 0; i < eles.length; i++) {
                let ele = eles[i];
                let imgEle = ele.querySelector("img");
                let link = ele.href;
                if (imgEle != null) {
                    let thumb = imgEle.src;
                    output.addLink(createLinkLegacy(link, "page", null, thumb));
                }
            }
            let ele = document.querySelector("ul.pagination li:last-child a.tokenable");
            if (ele != null && ele.innerText === "Next") {
                let link = ele.href;
                output.addLink(createLinkLegacy(link, "page"));
            }
        }
        return result;
    }
};