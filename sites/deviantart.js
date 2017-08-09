let deviantArtGalleryRegExp = new RegExp("https?://([^\\.]+)\\.deviantart\\.com/gallery/.*", 'i');
let deviantArtGalleryItemSelector = "a.torpedo-thumb-link";

let deviantArtRegExp = new RegExp("https?://([^\\.]+)\\.deviantart\\.com/art/.*", 'i');


function isDeviantArtSite(url) {
    return deviantArtGalleryRegExp.test(url)||deviantArtRegExp.test(url);
}

function monitorDeviantArt() {
    console.log("Deviantart gallery detected, attaching live link gathering");
    let eles = document.querySelectorAll(deviantartGalleryItemSelector);

    for (let i = 0; i < eles.length; i++) {
        console.log("Found URL: " + eles[i].href);
        cachedLinks.push(eles[i].href);
    }

    let observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.type != "childList" || mutation.addedNodes.length == 0) {
                return;
            }
            for (let j = 0; j < mutation.addedNodes.length; j++) {
                let node = mutation.addedNodes[j];
                eles = document.querySelectorAll(deviantArtGalleryItemSelector);
                for (let k = 0; k < eles.length; k++) {
                    let link = eles[k].href;
                    if (!cachedLinks.includes(link)) {
                        console.log("Found URL: " + link);
                        cachedLinks.push(link);
                    }
                }
            }
        });
    });
    let config = {childList: true, subtree: true,};
    observer.observe(document, config);
}

function processDeviantArt(url, output) {
    if (deviantArtRegExp.test(url)) {
        console.log("Deviantart page detected");
        let matches = deviantArtRegExp.exec(url);
        output.artist = matches[1];
        console.log("Artist: " + output.artist);

        let ele = document.querySelector(".dev-page-download");
        let download_url;
        if (ele == null) {
            // This means the download button wasn't found
            ele = document.querySelector(".dev-content-full");
            if (ele == null) {
                output.error = "No media found";
            } else {
                console.log("Found URL: " + ele.src);
                output.addLink(createLink(ele.src, "image"));
            }
        } else {
            console.log("Found URL: " + ele.href);
            output.addLink(createLink(ele.href, "image"));
        }
    } else if (deviantArtGalleryRegExp.test(url)) {
        console.log("Deviantart gallery detected");
        let matches = deviantArtGalleryRegExp.exec(url);
        output.artist = matches[1];
        console.log("Artist: " + output.artist);

        let eles = document.querySelectorAll(deviantArtGalleryItemSelector);

        for (let i = 0; i < eles.length; i++) {
            let link = eles[i].href;
            if (!cachedLinks.includes(link)) {
                console.log("Found URL: " + eles[i].href);
                cachedLinks.push(eles[i].href);
            }
        }


        if (cachedLinks == null || cachedLinks.length == 0) {
            output.error = "No media found";
        }
        for (i = 0; i < cachedLinks.length; i++) {
            link = cachedLinks[i];

            console.log("Found URL: " + link);
            output.addLink(createLink(link, "page"));
        }
    }
}