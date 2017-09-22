function isShimmieSite() {
    return document.querySelectorAll("div.shm-thumb").length>0||document.querySelector(".shm-main-image")!=null;
}

function processShimmie(url, output) {
    let eles = document.querySelectorAll("div.shm-thumb");
    if (eles.length > 0) {
        console.log("Shimmie site detected");
        output.artist = siteRegexp.exec(url)[1];
        for (let i = 0; i < eles.length; i++) {
            let ele = eles[i];
            let imgEle = ele.querySelector("img");
            let linkEle = ele.querySelector("a:nth-child(3)");
            let link = linkEle.href;

            output.addLink(createLink(link, "file", null, imgEle.src));
        }
        eles = document.querySelectorAll("section#paginator a");
        if (eles != null) {
            for (let i = 0; i < eles.length; i++) {
                let ele = eles[i];
                if (ele.innerText == "Next") {
                    output.addLink(createLink(ele.href, "page"));
                }
            }
        }


    } else {
        let ele = document.querySelector(".shm-main-image");
        if (ele != null) {
            output.artist = siteRegexp.exec(url)[1];
            let link = "";
            if (ele.tagName.toLowerCase() == "img") {
                link = ele.src;
                output.addLink(createLink(link, "image"));
            } else if (ele.tagName.toLowerCase() == "video") {
                ele = ele.querySelector("source");
                link = ele.src;
                output.addLink(createLink(link, "video"));
            }
            console.log("Found URL: " + link);
        }
    }
}