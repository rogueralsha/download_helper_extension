let eHentaiGalleryRegexp = new RegExp("https?:\\/\\/e\-hentai\.org\\/g\\/.+$", 'i');
let eHentaiImageRegexp = new RegExp("https?:\\/\\/e\-hentai\.org\\/s\\/.+$", 'i');
let eHentaiFilenameRegexp = new RegExp("^([^:]+)::[^:]+::[^:]+$", 'i');

function isEhentaiSite(url) {
    return eHentaiGalleryRegexp.test(url) || eHentaiImageRegexp.test(url);
}

function processEhentai(url, output) {
    if (eHentaiGalleryRegexp.test(url)) {
        console.log("e-Hentai gallery detected");
        output.artist = "e-Hentai";
        output.saveByDefault = false;
        console.log("Artist: " + output.artist);
        let eles = document.querySelectorAll("div.gdtm a, div.gdtl a");
        for (let i = 0; i < eles.length; i++) {
            let ele = eles[i];
            let imgEle = ele.querySelector("img");
            output.addLink(createLinkLegacy(ele.href, "page", null, imgEle.src));
        }
        let nextEle = document.querySelector("div.gtb table.ptb td:last-child a");
        if (nextEle != null) {
            output.addLink(createLinkLegacy(nextEle.href, "page"));
        }
    } else if (eHentaiImageRegexp.test(url)) {
        console.log("e-Hentai image detected");
        output.artist = "e-Hentai";
        output.saveByDefault = false;
        console.log("Artist: " + output.artist);

        // Have to grab the file's name
        //<div>10_0030.jpg :: 1280 x 1920 :: 246.8 KB</div>
        let divEle = document.querySelector("div#i2 div:last-child");
        let filename = null;
        if (divEle != null && eHentaiFilenameRegexp.test(divEle.innerText)) {
            filename = eHentaiFilenameRegexp.exec(divEle.innerText)[1].trim();
        }

        let ele = document.querySelector("div#i7 a");
        if (ele != null) {
            output.addLink(createLinkLegacy(ele.href, "image", filename));
        } else {
            ele = document.querySelector("img#img");
            if (ele != null) {
                output.addLink(createLinkLegacy(ele.src, "image", filename));
            }
        }
    }
}