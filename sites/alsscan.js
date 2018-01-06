let alsscanRegexp = new RegExp("^https?://.+\\.alsscan\\.com/.*", 'i');
let alsscanGalleryRegexp = new RegExp("^https?://.+\\.alsscan\\.com/.*model/([^\\/]+)/gallery/\\d+/", 'i');
let alsscanGalleryImageRegexp = new RegExp("^https?://.+\\.alsscan\\.com/.*model/([^\\/]+)/gallery/\\d+/[^\\/]+/image/.+", 'i');

let alsscanFileDownloadRegex = new RegExp("\\&n\\=([^&]+)&");

function isAlsScanSite(url) {
    return alsscanRegexp.test(url);
}

function processAlsScan(url, output) {
    console.log("test");
    if(alsscanGalleryImageRegexp.test(url)) {
        let m = alsscanGalleryImageRegexp.exec(url);
        output.artist = m[1];

        let ele = document.querySelector('a[title="Download"]');
        if(ele!=null) {
            let link = ele.href;
            m = alsscanFileDownloadRegex.exec(link);
            output.addLink(createLinkLegacy(link, "image",m[1]));
        }

    } else if(alsscanGalleryRegexp.test(url)) {
        let m = alsscanGalleryRegexp.exec(url);
        output.artist = m[1];

        let eles = document.querySelectorAll("a.tokenable");

        for(let i = 0; i < eles.length; i++) {
            let ele = eles[i];
            let imgEle = ele.querySelector("img");
            let link = ele.href;
            if(imgEle!=null) {
                let thumb = imgEle.src;
                output.addLink(createLinkLegacy(link, "page", null, thumb));
            }
        }
        let ele = document.querySelector("ul.pagination li:last-child a.tokenable");
        if(ele!=null&&ele.innerText=="Next") {
            let link = ele.href;
            output.addLink(createLinkLegacy(link, "page"));
        }
    }
}