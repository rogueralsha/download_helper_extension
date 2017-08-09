let hfRegExp = new RegExp("https?://www\\.hentai-foundry\\.com/pictures/user/([^/]+)/.*", 'i');
let hfGalleryRegExp = new RegExp("^https?://www\\.hentai-foundry\\.com/pictures/user/([^/]+)(/page/\\d+)?$", 'i');

function isHentaiFoundrySite(url) {
    return hfRegExp.test(url)||hfGalleryRegExp.test(url);
}

function processHentaiFoundry(url, output) {
if (hfGalleryRegExp.test(url)) {
    console.log("Hentai Foundry gallery page detected");
    let matches = hfGalleryRegExp.exec(url);
    output.artist = matches[1];
    console.log("Artist: " + output.artist);

    let eles = document.querySelectorAll("a.thumbLink");
    if (eles != null) {
        for (i = 0; i < eles.length; i++) {
            let ele = eles[i];
            let link = ele.href;
            console.log("Found URL: " + link);
            output.addLink(createLink(link, "page"));
        }
    }
    let nextEle = document.querySelector("li.next a");
    if (nextEle != null) {
        let link = nextEle.href;
        if (link != url) {
            console.log("Found URL: " + link);
            output.addLink(createLink(link, "page"));
        }
    }

} else if (hfRegExp.test(url)) {
    console.log("Hentai Foundry image page detected");
    let matches = hfRegExp.exec(url);
    output.artist = matches[1];
    console.log("Artist: " + output.artist);

    let ele = document.querySelector("div.container div.boxbody img");
    if (ele != null) {
        let link = ele.src;
        if (link.indexOf("vote_happy.png") == -1) {
            console.log("Found URL: " + link);
            output.addLink(createLink(link, "image"));
        }
    }

    ele = document.querySelector("div.container div.boxbody embed");
    if (ele != null) {
        let link = ele.src;
        console.log("Found URL: " + link);
        output.addLink(createLink(link, "flash"));
    }
}
}