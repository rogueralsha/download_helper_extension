let imgbbSource = {
    regexp: new RegExp("^https?:\\/\\/.*\\.?(ibb|imgbb)\\.com?\\/.*", 'i'),
    albumRegexp: new RegExp("^https?:\\/\\/.*\\.?(ibb|imgbb)\\.com?\\/album\\/.*", 'i'),

    isSupported: function (url) {
        return this.regexp.test(url);
    },

    process: async function (url, output) {
        console.log("test");
        let result = false;
        output.artist = "imgbb";
        if (this.albumRegexp.test(url)) {
            output.saveByDefault = false;
            result = true;
            let eles = document.querySelectorAll('a.image-container');
            for (let i = 0; i < eles.length; i++) {
                let ele = eles[i];
                let link = ele.href;
                let imgEle = ele.querySelector("img");
                output.addLink(createLink({url: link, type: "page", thumbnail: imgEle.src}));
            }

        } else if (this.regexp.test(url)) {
            output.saveByDefault = false;
            result = true;

            let ele = document.querySelector("a.btn-download");
            if (ele != null) {
                let link = ele.href;
                output.addLink(createLink({url: link, type: "image"}));
            }
        }
        return result;
    }
};