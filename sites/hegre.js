let hegreSource = {
    //http://www.hegre.com/models/luba
    name: "hegre",
    modelRegExp: new RegExp("https?://www\\.hegre\\.com/models/(.+)", 'i'),
    filmsRegExp: new RegExp("https?://www\\.hegre\\.com/films$", 'i'),
    filmRegExp: new RegExp("https?://www\\.hegre\\.com/films/(.+)", 'i'),
    photoRegExp: new RegExp("https?://www\\.hegre\\.com/photos/(.+)", 'i'),
    massageRegExp: new RegExp("https?://www\\.hegre\\.com/massage/(.+)", 'i'),
    process: async function (url, output) {
        let result =   false;
        if(this.modelRegExp.test(url)) {
            console.log("Hegre model page");
            result = true;
            output.artist = this.modelRegExp.exec(url)[1];
            console.log("Artist: " + output.artist);

            let elements = document.querySelectorAll("div#galleries-wrapper div.listing div.item, div#films-wrapper div.listing div.item, div#massages-wrapper div.listing div.item");
            if (elements == null || elements.length == 0) {
                output.error = "No media found";
            }

            for (let i = 0; i < elements.length; i++) {
                let ele = elements[i];
                let linkEle = ele.querySelector("a.artwork");
                let imgEle = ele.querySelector("img");
                if (linkEle == null) {
                    output.error = "No media found";
                } else {
                    let link = linkEle.href;
                    output.addLink(createLinkLegacy(link, "page", null, imgEle.src));
                }
            }

        } else if(this.filmsRegExp.test(url)) {
                console.log("Hegre films page");
                result = true;
                output.artist = "hegre";
                console.log("Artist: " + output.artist);

                let elements = document.querySelectorAll("div#films-wrapper div.listing div.item");
                if (elements == null || elements.length == 0) {
                    output.error = "No media found";
                }

                for (let i = 0; i < elements.length; i++) {
                    let ele = elements[i];
                    let linkEle = ele.querySelector("a.artwork");
                    let imgEle = ele.querySelector("img");
                    if (linkEle == null) {
                        output.error = "No media found";
                    } else {
                        let link = linkEle.href;
                        output.addLink(createLinkLegacy(link, "page", null, imgEle.src));
                    }
                }

        } else if(this.filmRegExp.test(url)||this.photoRegExp.test(url)||this.massageRegExp.test(url)) {
            console.log("Hegre media page");
            result = true;
            output.artist = "hegre";
            console.log("Artist: " + output.artist);

            let ele = document.querySelector("div.record-downloads div.resolution a, div.gallery-zips a");
            if (ele== null ) {
                output.error = "No media found";
            }

            if (ele == null) {
                output.error = "No media found";
            } else {
                let link = ele.href;
                output.addLink(createLinkLegacy(link, "file"));
            }

        }

            return result;
    }
};