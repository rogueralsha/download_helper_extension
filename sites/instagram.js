let instagramSource = {
    name: "instagram",
    regExp: new RegExp("https?://www\\.instagram\\.com/p/.*", 'i'),
    userRegExp: new RegExp("https?://www\\.instagram\\.com/([^/]+)/", 'i'),

    process: async function (url, outputData) {
        let result = false;
        if (this.regExp.test(url)) {
            result = true;
            console.log("Instagram page detected")
            let ele = document.querySelector("header div a");
            outputData.artist = ele.innerText;
            console.log("Artist: " + outputData.artist);

            let elements = document.querySelectorAll("section main div article div div div div img, video");
            if (elements == null || elements.length == 0) {
                outputData.error = "No media found";
            }
            for (i = 0; i < elements.length; i++) {
                ele = elements[i];
                if (ele == null) {
                    outputData.error = "No media found";
                } else {
                    let link = ele.src;
                    console.log("Found URL: " + link);
                    if (ele.nodeName.toLowerCase() == "video") {
                        outputData.addLink(createLink(link, "video", null, ele.poster));
                    } else {
                        outputData.addLink(createLink(link, "image"));
                    }
                }
                break;
            }
        } else if (this.userRegExp.test(url)) {
            result = true;
            console.log("Instagram user page detected")

            let ele = document.querySelector("a._8imhp");
            if (ele != null) {
                ele.click();
                await triggerAutoLoad();
            }


            ele = document.querySelector("h1._i572c ");
            outputData.artist = ele.innerText;
            console.log("Artist: " + outputData.artist);

            let elements = document.querySelectorAll("div._myci9 div._8mlbc a");
            if (elements == null || elements.length == 0) {
                outputData.error = "No media found";
            }
            for (i = 0; i < elements.length; i++) {
                ele = elements[i];
                if (ele == null) {
                    outputData.error = "No media found";
                } else {
                    let link = ele.href;
                    link = link.split("?")[0];
                    console.log("Found URL: " + link);
                    let imgEle = ele.querySelector("img");
                    if (imgEle != null) {
                        outputData.addLink(createLink(link, "page", null, imgEle.src));
                    } else {
                        outputData.addLink(createLink(link, "page"));
                    }
                }
            }

        }
        return result;
    }
};