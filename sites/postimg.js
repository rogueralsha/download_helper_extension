let postimgAlbumRegexp = new RegExp("https?:\\/\\/postimg\\.org\\/gallery\\/([^\\/]+)/", 'i');
let postimgPostRegexp = new RegExp("https?:\\/\\/postimg\\.org\\/image\\/([^\\/]+)/", 'i');

function isPostimgSite(url) {
    return postimgAlbumRegexp.test(url)||postimgPostRegexp.test(url);
}

async function processPostimg(url, output) {
if (postimgAlbumRegexp.test(url)) {
    console.log("postimg album page detected");
    output.saveByDefault = false;

    let matches = postimgAlbumRegexp.exec(url);
    output.artist = matches[1];
    console.log("Artist: " + output.artist);

    await triggerAutoLoad();

    let eles = document.querySelectorAll("div.thumb a");
    for (let i = 0; i < eles.length; i++) {
        let link = eles[i].href;
        if(postimgPostRegexp.test(link)) {
            output.addLink(createLinkLegacy(link, "page"));
        }
    }
} else if (postimgPostRegexp.test(url)) {
    console.log("postimg post page detected");
    output.saveByDefault = false;

    let matches = postimgPostRegexp.exec(url);
    output.artist = matches[1];
    console.log("Artist: " + output.artist);

    let ele = document.querySelector("img#main-image");
    if (ele != null) {
        let link = ele.src;
        output.addLink(createLinkLegacy(link, "image"));
    }
}
}