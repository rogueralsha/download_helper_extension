let patreonPostsRegExp = new RegExp("^https?://www\\.patreon\\.com/([^/^?]+)$", 'i');
let patreonPostRegExp = new RegExp("https?://www\\.patreon\\.com/posts/.*", 'i');

function isPatreonSite(url) {
    return patreonPostsRegExp.test(url)||patreonPostRegExp.test(url);
}

async function processPatreon(url, output) {
    if (patreonPostRegExp.test(url)) {
        console.log("Patreon post detected");

        let eles = document.querySelectorAll("div.mb-md a");
        for (i = 0; i < eles.length; i++) {
            let ele = eles[i];
            if(patreonPostsRegExp.test(ele.href)) {
                let pieces = ele.href.split("/");
                output.artist = pieces[pieces.length - 1];
                console.log("Artist: " + output.artist);
            }
        }
        if(output.artist==null) {
            throw Error("Unable to find artist");
        }

        let ele = document.querySelector("div[data-test-tag='post-card'] img");
        let download_url;
        if (ele != null) {
            let link = ele.src;
            console.log("Found URL: " + link);
            output.addLink(createLink(link, "image"));
        }


        let elements = document.querySelectorAll("div.fTFZaD a.tkPNN");
        for (i = 0; i < elements.length; i++) {
            ele = elements[i];
            if (ele != null) {
                let link = ele.href;
                console.log("Found URL: " + link);
                output.addLink(createLink(link, "image", ele.innerText));
            }
        }

    } else if (patreonPostsRegExp.test(url)) {
        output.action = "open";

        console.log("Patreon artist posts detected");

        let matches = patreonPostsRegExp.exec(url);
        output.artist = matches[1];
        console.log("Artist: " + output.artist);

        window.scrollTo(0, document.body.scrollHeight);
        let loadMoreButton = document.querySelector("button[data-reactid=\".0.1.0.0.2.0.0.0.1.0.0.2.0\"]");
        while (loadMoreButton != null) {
            loadMoreButton.click();
            await sleep(2000);
            window.scrollTo(0, document.body.scrollHeight);
            loadMoreButton = document.querySelector("button[data-reactid=\".0.1.0.0.2.0.0.0.1.0.0.2.0\"]");
        }
        window.scrollTo(0, document.body.scrollHeight);

        let elements = document.querySelectorAll("a");
        for (i = 0; i < elements.length; i++) {
            ele = elements[i];
            if (ele != null) {
                let link = ele.href;
                if (!patreonPostRegExp.test(link)) {
                    continue;
                }
                console.log("Found URL: " + link);
                output.addLink(createLink(link, "page"));
            }
        }
    }
}