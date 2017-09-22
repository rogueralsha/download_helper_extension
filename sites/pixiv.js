let pixivWorksRegexp = new RegExp("https?://www\\.pixiv\\.net/member_illust\.php\\?id=\\d+", 'i');

let mangaBig = new RegExp("https?://www\\.pixiv\\.net/member_illust\.php\\?mode=manga_big&illust_id=\\d+&page=\\d+", 'i');
let imgRegexp = new RegExp("https?://i\\.pximg\\.net/.+", 'i');

function processPixiv(url, output) {
    console.log("Pixiv site detected");

    let ele = document.querySelector("h1.user, a.user");
    if(ele!=null) {
        output.artist = ele.innerText;
    }

    if(pixivWorksRegexp.test(url)) {
        eles = document.querySelectorAll("li.image-item a.work");
        if (eles.length > 0) {
            for (let i = 0; i < eles.length; i++) {
                let aEle = eles[i];
                let link = aEle.href;
                if (link == undefined) {
                    console.log("Undefined link!");
                    continue;
                }
                let imgEle = aEle.querySelector("img");
                let thumb = null;
                if (imgEle != null)
                    thumb = imgEle.src;
                output.addLink(createLink(link, "page", null, thumb));
            }

        }
    } else if(mangaBig.test(url)) {
        let ele = document.querySelector("body img");
        ele.crossOrigin = "Anonymous";
        let link = ele.src;
        link = createLink(link, "page");
        //link = createLink(getBase64Image(ele), "image", getFileName(link));
        link["referer"] = url;
        output.addLink(link);
    } else if(imgRegexp.test(url)) {

        // Pixiv has aggressive download prevention
        // To get around this we manually load the image data and then download it

        let ele = document.querySelector("img");
        if(ele.style.cursor=="zoom-in") {
            ele.click();
        }
        let link = ele.src;
        console.log("Image data: " + getBase64Image(ele));
        link = createLink(getBase64Image(ele), "image", getFileName(link));
        link["referer"] = url;
        output.addLink(link);
    } else {
        let showMoreEle = document.querySelector("a.read-more");
        if(showMoreEle!=null) {
            let link = showMoreEle.href;
            output.addLink(createLink(link, "page"));
        }

        let fullSizeEles = document.querySelectorAll("div.item-container a.full-size-container");
        for(let i = 0; i < fullSizeEles.length; i++) {
            let ele = fullSizeEles[i];
            let link = ele.href;
            output.addLink(createLink(link, "page"));
        }

        let originalImageele = document.querySelector("img.original-image");
        if(originalImageele!=null) {
            let link = originalImageele.dataset.src;
            output.addLink(createLink(link, "page"));
        }
    }
}