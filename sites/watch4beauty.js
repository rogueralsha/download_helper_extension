let watch4beautySource = {
    name: "watch4beauty",
    modelRegExp: new RegExp("https?://www\\.watch4beauty\\.com/model-(.+).html", 'i'),
    albumRegExp: new RegExp("https?://www\\.watch4beauty\\.com/members/(issue|magazine)\\-.+", 'i'),

    zipRegexp: new RegExp("ZIP (\\d+)\\+? px"),
    videoRegexp: new RegExp("\\d{8}\\-video\\-(.+).(mp4|wmv|mov|m4v)"),
    extensionPreference: ["mp4","m4v","mov","wmv"],

    process: async function (url, output) {
        let result = false;
        if (this.modelRegExp.test(url)) {
            console.log("watch4beauty model page");
            result = true;
            output.artist = this.modelRegExp.exec(url)[1];
            console.log("Artist: " + output.artist);

            let elements = document.querySelectorAll("div.issues a.cover");
            if (elements == null || elements.length === 0) {
                output.error = "No media found";
            }

            for (let i = 0; i < elements.length; i++) {
                let ele = elements[i];
                let imgEle = ele.querySelector("img");
                let link = ele.href;
                output.addLink(createLinkLegacy(link, "page", null, imgEle.src));
            }
        } else if (this.albumRegExp.test(url)) {
            console.log("watch4beauty model page");
            result = true;
            let modelEle = document.querySelector("div.crew p a");
            output.artist = modelEle.innerText;
            console.log("Artist: " + output.artist);

            let elements = document.querySelectorAll("div.download ul.zip li a");
            if (elements == null || elements.length === 0) {
                output.error = "No media found";
            }

            let maxRes = 0;
            let downloadCandidate = null;

            let videoCandidate = null;

            for (let i = 0; i < elements.length; i++) {
                let ele = elements[i];
                let title = ele.title;
                let link = ele.href;
                if (this.zipRegexp.test(title)) {
                    let size = parseInt(this.zipRegexp.exec(title)[1]);
                    if (size > maxRes) {
                        maxRes = size;
                        downloadCandidate = ele;
                    }
                } else if (this.videoRegexp.test(link)) {
                    let execResult = this.videoRegexp.exec(link);
                    let size = execResult[1];
                    let extension = execResult[2]
                    if (size === "full" || size === "backstage") {
                        if(videoCandidate==null) {
                            videoCandidate = ele;
                        } else {
                            let otherExtension = this.videoRegexp.exec(videoCandidate.href)[2];
                            if(this.extensionPreference.indexOf(extension)<this.extensionPreference.indexOf(otherExtension)) {
                                videoCandidate = ele;
                            }
                        }
                    }
                } else {
                    output.addLink(createLinkLegacy(link, "file"));
                }
            }
            if (downloadCandidate != null) {
                let link = downloadCandidate.href;
                output.addLink(createLinkLegacy(link, "file"));
            }
            if (videoCandidate != null) {
                let link = videoCandidate.href;
                output.addLink(createLinkLegacy(link, "file"));
            }
        }

        return result;
    }
};