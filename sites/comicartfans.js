let comicartfansSource = {
    artistRegexp: new RegExp("^https?://.+\\.comicartfans\\.com/comic\\-artists/([^\\.]+)\\.asp.*", 'i'),

    pieceRegexp: new RegExp("^https?://.+\\.comicartfans\\.com/GalleryPiece.asp\\?Piece=([^&]+).+", 'i'),
    //http://www.comicartfans.com/GalleryPiece.asp?Piece=1464383&GSub=158110
    isSupported: function (url) {
        return this.artistRegexp.test(url);
    },

    process: async function (url, output) {
        let result = false;
        if (this.pieceRegexp.test(url)) {
            console.log("Comic art fans gallery piece page detected");
            result = true;
            let m = this.pieceRegexp.exec(url);
            output.artist = url;

            let ele = document.querySelector('div#sharewrap img');
            if (ele != null) {
                let link = ele.src;
                output.addLink(createLink({url: link, type: "image"}));
            }

        } else if (this.artistRegexp.test(url)) {
            console.log("Comic art fans artist page detected");
            result = true;
            let m = this.artistRegexp.exec(url);
            output.artist = m[1];

            let eles = document.querySelectorAll("div#content-left div.padding div div a");

            for (let i = 0; i < eles.length; i++) {
                let ele = eles[i];
                let imgEle = ele.querySelector("img");
                let link = ele.href;
                if(this.pieceRegexp.test(link)&&imgEle != null) {
                    m = this.pieceRegexp.exec(link);
                    let thumb = imgEle.src;
                    output.addLink(createLink({url: link, type: "page", filename: m[1], thumbnail: thumb}));
                }
            }
            eles = document.querySelectorAll("div.grey-rounded table td a");
            for (let i = 0; i < eles.length; i++) {
                console.log("Paginator found");
                let ele = eles[i];
                if (ele.innerText.includes("Next")) {
                    let link = ele.href;
                    output.addLink(createLink({url: link, type: "page"}));
                }
            }
        }
        return result;
    }
};