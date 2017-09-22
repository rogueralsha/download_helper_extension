let instagramSource = {
    name: "instagram",
    regExp: new RegExp("https?://www\\.instagram\\.com/p/.*", 'i'),
    userRegExp: new RegExp("https?://www\\.instagram\\.com/([^/]+)/", 'i'),

    metaUserRegexp: new RegExp("\\(@([^\\)]+)\\)"),

    handleLoadMoreButton: function() {
        let eles = document.querySelectorAll("main article div a");
        for(let i = 0; i< eles.length; i++) {
            let ele = eles[i];
            if(ele.innerText==="Load more") {
                ele.click();
                return true;
            }
        }
        return false;
    },
    process: async function (url, outputData) {
        let result = false;
        if (this.regExp.test(url)) {
            result = true;
            console.log("Instagram page detected");

            let ele = document.querySelector("meta[name=\"description\"]");
            let description = ele.getAttribute("content");
            outputData.artist =  this.metaUserRegexp.exec(description)[1];

            console.log("Artist: " + outputData.artist);

            let elements = document.querySelectorAll("section main div article div div div div img, video");
            if (elements == null || elements.length === 0) {
                outputData.error = "No media found";
            }
            //for (let i = 0; i < elements.length; i++) {
                ele = elements[0];
                if (ele == null) {
                    outputData.error = "No media found";
                } else {
                    let link = ele.src;
                    console.log("Found URL: " + link);
                    if (ele.nodeName.toLowerCase() === "video") {
                        outputData.addLink(createLink(link, "video", null, ele.poster));
                    } else {
                        outputData.addLink(createLink(link, "image"));
                    }
                }
                //break;
            //}
        } else if (this.userRegExp.test(url)) {
            result = true;
            console.log("Instagram user page detected");

            if (this.handleLoadMoreButton()) {
                await triggerAutoLoad();
            }

            let ele = document.querySelector("meta[property=\"og:title\"]");
            let description = ele.getAttribute("content");
            outputData.artist =  this.metaUserRegexp.exec(description)[1];
            console.log("Artist: " + outputData.artist);

            let elements = document.querySelectorAll("span section main article div div div div a");
            if (elements == null || elements.length === 0) {
                outputData.error = "No media found";
            }
            for (i = 0; i < elements.length; i++) {
                ele = elements[i];
                let link = ele.href;
                link = link.split("?")[0];
                if(!this.regExp.test(link))
                    continue;
                console.log("Found URL: " + link);
                let imgEle = ele.querySelector("img");
                if (imgEle != null) {
                    outputData.addLink(createLink(link, "page", null, imgEle.src));
                } else {
                    outputData.addLink(createLink(link, "page"));
                }
            }

        }
        return result;
    }
};