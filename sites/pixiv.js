var pixivWorksRegexp = new RegExp("https?://www\\.pixiv\\.net/member_illust\.php\\?id=\\d+", 'i');

var mangaBig = new RegExp("https?://www\\.pixiv\\.net/member_illust\.php\\?mode=manga_big&illust_id=\\d+&page=\\d+", 'i');
var imgRegexp = new RegExp("https?://i\\.pximg\\.net/.+", 'i');

function processPixiv(url, output) {
    console.log("Pixiv site detected");

    var ele = document.querySelector("h1.user, a.user");
    if(ele!=null) {
        output.artist = ele.innerText;
    }

    if(pixivWorksRegexp.test(url)) {
        eles = document.querySelectorAll("li.image-item a.work");
        if (eles.length > 0) {
            for (var i = 0; i < eles.length; i++) {
                var aEle = eles[i];
                var link = aEle.href;
                if (link == undefined) {
                    console.log("Undefined link!");
                    continue;
                }
                var imgEle = aEle.querySelector("img");
                var thumb = null;
                if (imgEle != null)
                    thumb = imgEle.src;
                output.addLink(createLink(link, "page", null, thumb));
            }

        }
    } else if(mangaBig.test(url)) {
        var ele = document.querySelector("body img");
        ele.crossOrigin = "Anonymous";
        var link = ele.src;
        link = createLink(link, "page");
        //link = createLink(getBase64Image(ele), "image", getFileName(link));
        link["referer"] = url;
        output.addLink(link);
    } else if(imgRegexp.test(url)) {

        // Pixiv has aggressive download prevention
        // To get around this we manually load the image data and then download it

        var ele = document.querySelector("img");
        if(ele.style.cursor=="zoom-in") {
            ele.click();
        }
        var link = ele.src;
        console.log("Image data: " + getBase64Image(ele));
        link = createLink(getBase64Image(ele), "image", getFileName(link));
        link["referer"] = url;
        output.addLink(link);
    } else {
        var showMoreEle = document.querySelector("a.read-more");
        if(showMoreEle!=null) {
            var link = showMoreEle.href;
            output.addLink(createLink(link, "page"));
        }

        var fullSizeEles = document.querySelectorAll("div.item-container a.full-size-container");
        for(var i = 0; i < fullSizeEles.length; i++) {
            var ele = fullSizeEles[i];
            var link = ele.href;
            output.addLink(createLink(link, "page"));
        }

        var originalImageele = document.querySelector("img.original-image");
        if(originalImageele!=null) {
            var link = originalImageele.dataset.src;
            output.addLink(createLink(link, "page"));
        }
    }
}