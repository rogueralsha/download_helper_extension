var metartRegexp = new RegExp("^https?://.+\\.metart\\.com/.*", 'i');
var metartGalleryRegexp = new RegExp("^https?://.+\\.metart\\.com/.*model/([^\\/]+)/gallery/\\d+/", 'i');
var metartGalleryImageRegexp = new RegExp("^https?://.+\\.metart\\.com/.*model/([^\\/]+)/gallery/\\d+/[^\\/]+/image/.+", 'i');

var metartFileDownloadRegex = new RegExp("\\&n\\=([^&]+)&")

function isMetArtSite(url) {
    return metartRegexp.test(url);
}

function processMetArt(url, output) {
    console.log("test");
    if(metartGalleryImageRegexp.test(url)) {
        var m = metartGalleryImageRegexp.exec(url);
        output.artist = m[1];

        var ele = document.querySelector('a.media_download');
        if(ele!=null) {
            var link = ele.href;
            m = metartFileDownloadRegex.exec(link);
            output.addLink(createLink(link, "image",m[1]));
        }

    } else if(metartGalleryRegexp.test(url)) {
        var m = metartGalleryRegexp.exec(url);
        output.artist = m[1];

        var eles = document.querySelectorAll("a.media_link");

        for(var i = 0; i < eles.length; i++) {
            var ele = eles[i];
            var imgEle = ele.querySelector("img");
            var link = ele.href;
            if(imgEle!=null) {
                var thumb = imgEle.src;
                output.addLink(createLink(link, "page", null, thumb));
            }
        }
        var ele = document.querySelector("div.paginate_right_arrow a");
        if(ele!=null&&ele.hreaf!="#") {
            var link = ele.href;
            output.addLink(createLink(link, "page"));
        }
    }
}