let flickrRegexp = new RegExp("^https?:\\/\\/www\.flickr\.com\\/photos\\/([^\\/]+)\\/.*$", 'i');
let flickrImageRegexp = new RegExp("^https?:\\/\\/www\.flickr\.com\\/photos\\/([^\\/]+)\\/(\\d+)\\/.*$", 'i');
let flickrSizesRegexp = new RegExp("^https?:\\/\\/www\.flickr\.com\\/photos\\/([^\\/]+)\\/(\\d+)\\/sizes\\/([^\\/]+)\\/$", 'i');
let flickrSizePriorities = ["sq",
    "q",
    "t",
    "s",
    "n",
    "m",
    "z",
    "c",
    "l",
    "h",
    "k",
    "o"];

function isFlickrSite(url) {
    return flickrRegexp.test(url);
}

function processFlickr(url, output) {
    console.log("Flickr page detected");
    let matches = flickrRegexp.exec(url);
    output.artist = matches[1];
    console.log("Artist: " + output.artist);

    // Check if we're on a gallery page
    let eles = document.querySelectorAll("div.photo-list-photo-view");
    if (eles != null) {
        for (let i = 0; i < eles.length; i++) {
            let ele = eles[i];
            let linkEle = ele.querySelector("a");
            let link = linkEle.href;

            // We COULD go to the image page, but why waste time?!?!
            if (flickrImageRegexp.test(link)) {
                let imageId = flickrImageRegexp.exec(link)[2];
                link = "https://www.flickr.com/photos/" + output.artist + "/" + imageId + "/sizes/";
                output.addLink(createLink(link, "page", null, ele.style.backgroundImage));
            }
        }
        let nextEle = document.querySelector("div.pagination-view a[rel=next]");
        if (nextEle != null) {
            output.addLink(createLink(nextEle.href, "page"));
        }

    }

    // We check if we're on the sizes page
    if (flickrSizesRegexp.test(url)) {

        let matches = flickrSizesRegexp.exec(url);
        let currentSize = matches[3];
        let sizesEle = document.querySelectorAll("ol.sizes-list li:last-child a");
        if (sizesEle.length > 0) {
            let ele = sizesEle[sizesEle.length - 1];
            let link = ele.href;
            let linkSize = flickrSizesRegexp.exec(link)[3];
            if (flickrSizePriorities.indexOf(currentSize) < flickrSizePriorities.indexOf(linkSize)) {
                output.addLink(createLink(link, "page"));
            } else {
                let imgEle = document.querySelector("div#allsizes-photo img");
                output.addLink(createLink(imgEle.src, "image"));
            }
        } else {
            let imgEle = document.querySelector("div#allsizes-photo img");
            output.addLink(createLink(imgEle.src, "image"));
        }
    }
}