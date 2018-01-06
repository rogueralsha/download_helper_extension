let miniTokyoSource = {
    name : "minitokyo",
    galleryRegexp: new RegExp("https?:\\/\\/[^\\.]+\\.minitokyo\\.net\\/gallery\\?.+", 'i'),
    downloadRegexp: new RegExp("https?:\\/\\/gallery\\.minitokyo\\.net\\/download\\/\\d+", 'i'),
    viewRegexp: new RegExp("https?:\\/\\/gallery\\.minitokyo\\.net\\/view\\/(\\d+)", 'i'),
    process : async function (url, output){
        let result = false;
        if(this.galleryRegexp.test(url)) {
            let linkElements = document.querySelectorAll("ul.scans li a");
            for(let i = 0; i < linkElements.length; i++) {
                let linkElement = linkElements[i];
                let imageElement = linkElement.querySelector("img");
                if(imageElement==null)
                    continue;

                let link = linkElement.href;
                output.artist = url;
                if(this.viewRegexp.test(link)) {
                    console.log("Redirecting view link to download link");
                    let m = this.viewRegexp.exec(link);
                    link = "http://gallery.minitokyo.net/download/" + m[1];
                }
                output.addLink(createLinkLegacy(link, "page", null, imageElement.src));
            }

            let paginationLinks = document.querySelectorAll("p.pagination a");
            for(let i = 0; i < paginationLinks.length;i++) {
                let linkElement  = paginationLinks[i];
                if(linkElement.innerText=="Next »") {
                    let link = linkElement.href;
                    output.addLink(createLinkLegacy(link, "page"));
                }
            }
            result = true;
        } else if(this.viewRegexp.test(url)) {
            let m = this.viewRegexp.exec(url);
            let link = "http://gallery.minitokyo.net/download/" + m[1];
            output.addLink(createLinkLegacy(link, "page"));
            result = true;
        } else if(this.downloadRegexp.test(url)) {
            let imageElement = document.querySelector("div#image img");
            if(imageElement!=null) {
                let link = imageElement.src;
                output.addLink(createLinkLegacy(link, "image"));
            }
            result = true;
        }
        if(result) {
            output.saveByDefault = false;
        }

    return result;
    }
};

