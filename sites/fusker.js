var fuskerRegexp = new RegExp("^https?://.+\\.fusker\\.xxx/.*", 'i');

function isFuskerSite(url) {
    return fuskerRegexp.test(url);
}

function processAlsScan(url, output) {
    console.log("test");
    if(alsscanGalleryImageRegexp.test(url)) {
        var m = alsscanGalleryImageRegexp.exec(url);
        output.artist = m[1];

        var ele = document.querySelector('a[title="Download"]');
        if(ele!=null) {
            var link = ele.href;
            m = alsscanFileDownloadRegex.exec(link);
            output.addLink(createLink(link, "image",m[1]));
        }

    } else if(alsscanGalleryRegexp.test(url)) {
        var m = alsscanGalleryRegexp.exec(url);
        output.artist = m[1];

        var eles = document.querySelectorAll("a.tokenable");

        for(var i = 0; i < eles.length; i++) {
            var ele = eles[i];
            var imgEle = ele.querySelector("img");
            var link = ele.href;
            if(imgEle!=null) {
                var thumb = imgEle.src;
                output.addLink(createLink(link, "page", null, thumb));
            }
        }
        var ele = document.querySelector("ul.pagination li:last-child a.tokenable");
        if(ele!=null&&ele.innerText=="Next") {
            var link = ele.href;
            output.addLink(createLink(link, "page"));
        }
    }
}