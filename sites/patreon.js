var patreonPostsRegExp = new RegExp("^https?://www\\.patreon\\.com/([^/^?]+)$", 'i');
var patreonPostRegExp = new RegExp("https?://www\\.patreon\\.com/posts/.*", 'i');

function isPatreonSite(url) {
    return patreonPostsRegExp.test(url)||patreonPostRegExp.test(url);
}

async function processPatreon(url, output) {
    if (patreonPostRegExp.test(url)) {
        console.log("Patreon post detected");

        var eles = document.querySelectorAll("div.mb-md a");
        for (i = 0; i < eles.length; i++) {
            var ele = eles[i];
            if(patreonPostsRegExp.test(ele.href)) {
                var pieces = ele.href.split("/");
                output.artist = pieces[pieces.length - 1];
                console.log("Artist: " + output.artist);
            }
        }
        if(output.artist==null) {
            throw Error("Unable to find artist");
        }

        var ele = document.querySelector("div[data-test-tag='post-card'] img");
        var download_url;
        if (ele != null) {
            var link = ele.src;
            console.log("Found URL: " + link);
            output.addLink(createLink(link, "image"));
        }


        var elements = document.querySelectorAll("div[data-test-tag='post-card'] div[class*='components-Post--cardBodyContainer'] div.stackable a[class*='components-TextButton--blue'], div[class*='components-Post--attachments'] a")
        for (i = 0; i < elements.length; i++) {
            ele = elements[i];
            if (ele == null) {
                continue;
            } else {
                var link = ele.href;
                console.log("Found URL: " + link);
                output.addLink(createLink(link, "image", ele.innerText));
            }
        }

    } else if (patreonPostsRegExp.test(url)) {
        output.action = "open";

        console.log("Patreon artist posts detected");

        var matches = patreonPostsRegExp.exec(url);
        output.artist = matches[1];
        console.log("Artist: " + output.artist);

        window.scrollTo(0, document.body.scrollHeight);
        var loadMoreButton = document.querySelector("button[data-reactid=\".0.1.0.0.2.0.0.0.1.0.0.2.0\"]");
        while (loadMoreButton != null) {
            loadMoreButton.click();
            await sleep(2000);
            window.scrollTo(0, document.body.scrollHeight);
            loadMoreButton = document.querySelector("button[data-reactid=\".0.1.0.0.2.0.0.0.1.0.0.2.0\"]");
        }
        window.scrollTo(0, document.body.scrollHeight);

        var elements = document.querySelectorAll("a")
        for (i = 0; i < elements.length; i++) {
            ele = elements[i];
            if (ele == null) {
                continue;
            } else {
                var link = ele.href;
                if (!patreonPostRegExp.test(link)) {
                    continue;
                }
                console.log("Found URL: " + link);
                output.addLink(createLink(link, "page"));
            }
        }
    }
}