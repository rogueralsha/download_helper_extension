async function downloadPageMedia(pageMedia, progress) {
    let downloadPath = await getMapping(pageMedia.artist);
    await downloadPageMediaWithPath(pageMedia, downloadPath, progress);
}

async function downloadPageMediaWithPath(pageMedia, downloadPath, progress) {
    if (pageMedia == null || pageMedia.error != null)
        return;

    let prefixPath = await getPrefixPath();
    if (prefixPath.length > 0) {
        downloadPath = trimPath(prefixPath) + "/" + trimPath(downloadPath);
    }

    if (progress != null)
        progress.max += pageMedia.links.length;

    await downloadHelper(downloadPath, pageMedia.links, progress);
}

function getTab(tabId) {
    return new Promise(async function(resolve, reject) {
        "use strict";
        chrome.runtime.sendMessage({tabId: tabId, command: "getTab"}, function (response) {
            "use strict";
            resolve(response);
        });

    });
}

function downloadHelper(downloadPath, linkList, progress) {
    return new Promise(async function(resolve, reject) {
        if (linkList.length > 0) {

            let link = linkList.shift();

            if (link === undefined) {
                window.alert("undefined link");
                resolve();
                return;
            }

            if(!link.select) {
                await downloadHelper(downloadPath, linkList, progress);
                resolve();
            }

            console.log("Downloading link");
            console.log(link)

            if (link["type"] === "page") {
                let tab = await openNewBackgroundTab(link["url"]);
                if(link["autoDownload"]===false) {
                    await downloadHelper(downloadPath, linkList, progress);
                    if (progress != null)
                        progress.sendUpdate();
                    resolve();
                    return;
                }

                tab = await getTab(tab.id);
                console.log("Sending getPageMedia message to tab: " + tab.url);
                chrome.runtime.sendMessage({tabId: tab.id, url: tab.url, command: "getPageMedia"}, async function (response) {
                    if (response == null || response.error != null) {
                        resolve();
                        return;
                    }
                    let childDownloadPath = downloadPath;
                    if (response.page_title != null) {
                        let i = downloadPath.lastIndexOf(response.page_title);
                        if (i === -1 || i !== downloadPath.length - response.page_title.length) {
                            childDownloadPath = trimPath(downloadPath) + "/" + trimPath(response.page_title);
                        }
                    }

                    let childProgress = null;
                    if (progress != null && response.links.length > 1) {
                        childProgress = progress.createChild();
                        childProgress.max = response.links.length;
                    }
                    await downloadHelper(childDownloadPath, response.links, childProgress);

                    if (childProgress != null)
                        childProgress.complete();
                    if (progress != null)
                        progress.sendUpdate();
                    console.log("Closing tab: " + tab.id);

                    await closeTab(tab.id);
                    await downloadHelper(downloadPath, linkList, progress);
                    resolve();
                });

            } else {
                let fileName = link["filename"];
                if (downloadPath.length > 0) {
                    fileName = trimPath(downloadPath) + "/" + trimPath(fileName);
                }

                console.log("Downloading with path: " + fileName);

                let headers = [];

                if (link["referer"] != null) {
                    console.log("Link referer found, setting header: " + link["referer"]);
                    headers["referer"] = link["referer"];
                }

                console.log("Beginning download of file: " + link["url"]);


                chrome.runtime.sendMessage({url: link["url"], filename: fileName, headers: headers, command: "downloadLink"}, async function (response) {
                    "use strict";
                    if (progress != null)
                        progress.sendUpdate();
                    await downloadHelper(downloadPath, linkList, progress);
                    resolve(response);
                });
            }
        } else {
            resolve();
        }
    });
}

function openNewBackgroundTab(link, windowId) {
    if(windowId==null) {

    }
    console.log("Opening background tab: " + link);
    return new Promise(async function(resolve, reject) {
        chrome.runtime.sendMessage({url: link, windowId: windowId, command: "openTab"}, function (response) {
            "use strict";
            console.log("Response received from background script opening tab");
            console.log(response);
            resolve(response);
        });
    });
}

function trimPath(input) {
    let output = input;


    if (output.indexOf("/") === 0 || output.indexOf("\\") === 0) {
        output = output.substr(1);
    }
    if (output.lastIndexOf("/") === output.length - 1 ||
        output.lastIndexOf("\\") === output.length - 1) {
        output = output.substr(0, output.length - 1);
    }
    return output;
}

function getBase64Image(img) {
    // Create an empty canvas element
    let canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    // Copy the image contents to the canvas
    let ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    // Get the data-URL formatted image
    // Firefox supports PNG and JPEG. You could check img.src to
    // guess the original format, but be aware the using "image/jpg"
    // will re-encode the image.
    return canvas.toDataURL("image/png");
}