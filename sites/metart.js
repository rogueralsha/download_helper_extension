let metartRegexp = new RegExp("^https?://.+\\.metart\\.com/.*", 'i');
let metartGalleryRegexp = new RegExp("^https?://.+\\.metart\\.com/.*model/([^\\/]+)/gallery/\\d+/", 'i');
let metartGalleryImageRegexp = new RegExp("^https?://.+\\.metart\\.com/.*model/([^\\/]+)/gallery/\\d+/[^\\/]+/image/.+", 'i');

let metartFileDownloadRegex = new RegExp("\\&n\\=([^&]+)&");

function isMetArtSite(url) {
    return metartRegexp.test(url);
}

function processMetArt(url, output) {
    console.log("test");
    if(metartGalleryImageRegexp.test(url)) {
        let m = metartGalleryImageRegexp.exec(url);
        output.artist = m[1];

        let ele = document.querySelector('a.media_download');
        if(ele!=null) {
            let link = ele.href;
            m = metartFileDownloadRegex.exec(link);
            output.addLink(createLink(link, "image",m[1]));
        }

    } else if(metartGalleryRegexp.test(url)) {
        let m = metartGalleryRegexp.exec(url);
        output.artist = m[1];

        let eles = document.querySelectorAll("a.media_link");

        for(let i = 0; i < eles.length; i++) {
            let ele = eles[i];
            let imgEle = ele.querySelector("img");
            let link = ele.href;
            if(imgEle!=null) {
                let thumb = imgEle.src;
                output.addLink(createLink(link, "page", null, thumb));
            }
        }
        let ele = document.querySelector("div.paginate_right_arrow a");
        if(ele!=null&&ele.href!="#") {
            let link = ele.href;
            output.addLink(createLink(link, "page"));
        }
    }
}