function downloadPageMedia(pageMedia, callback, progress) {
    getMapping(pageMedia.artist, function(downloadPath) {
       downloadPageMediaWithPath(pageMedia, downloadPath, callback, progress);
    });
}

function downloadPageMediaWithPath(pageMedia, downloadPath, callback, progress){
    if(pageMedia==null||pageMedia.error!=null)
        return;

    getPrefixPath(function(prefixPath) {
        if(prefixPath.length>0) {
            downloadPath = trimPath(prefixPath) + "/" + trimPath(downloadPath);
        }

        if(progress!=null)
            progress.max += pageMedia.links.length;

        downloadHelper(downloadPath, pageMedia.links, function() {
            if(callback!=null)
                callback();
        }, progress);

    });

}


function downloadHelper(downloadPath, linkList, callback, progress) {
    if(linkList.length>0) {

        var link = linkList.shift();

        if(link===undefined) {
            window.alert("undefined link");
            return;
        }

        if(link["type"]=="page") {
            openNewBackgroundTab(link["url"],function(tab) {
                chrome.tabs.sendMessage(tab.id, {url: link["url"],command: "getPageMedia"}, function(response) {
                    if (response == null||response.error!=null) {
                        return;
                    }
                    var childDownloadPath = downloadPath;
                    if(response.page_title!=null) {
                        var i = downloadPath.lastIndexOf(response.page_title);
                        if(i==-1||i!=downloadPath.length-response.page_title.length) {
                            childDownloadPath = trimPath(downloadPath) + "/" + trimPath(response.page_title);
                        }
                    }

                    if(progress!=null&&response.links.length>1) {
                        var childProgress = progress.createChild();
                        childProgress.max = response.links.length;
                    }
                    downloadHelper(childDownloadPath, response.links, function() {
                        if(childProgress!=null)
                            childProgress.complete();
                        if(progress!=null)
                            progress.sendUpdate();
                        chrome.tabs.remove(tab.id);
                        downloadHelper(downloadPath, linkList, callback, progress);
                    }, childProgress);
                });
            })
        } else {
            var fileName = link["filename"];
            if (downloadPath.length > 0) {
                fileName = trimPath(downloadPath) + "/" + trimPath(fileName);
            }

            console.log("Downloading with path: " + fileName)

            var headers = [];

            if(link["referer"]!=null) {
                headers["referer"] = link["referer"];
            }

            chrome.downloads.download({
                url: link["url"],
                filename: fileName, // Optional
                conflictAction: "uniquify",
                method: "GET",
                headers: headers
            }, function () {
                if (progress != null)
                    progress.sendUpdate();
                downloadHelper(downloadPath, linkList, callback, progress);
            });

        }
    } else {
        callback();
    }
}

function openNewBackgroundTab(link, callback){
    var tab = chrome.tabs.create({url:link,active:false}, function (tab) {
        chrome.tabs.onUpdated.addListener(function(tabId , info) {
            if (tabId==tab.id&&info.status == "complete") {
                if(callback!=null) {
                    callback(tab);
                }
            }
        });
    });
}

function trimPath(input) {
    var output = input;


    if(output.indexOf("/")==0||output.indexOf("\\")==0) {
        output = output.substr(1);
    }
    if(output.lastIndexOf("/")==output.length-1||
        output.lastIndexOf("\\")==output.length-1) {
        output = output.substr(0,output.length - 1);
    }
    return output;
}

function getBase64Image(img) {
    // Create an empty canvas element
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    // Copy the image contents to the canvas
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    // Get the data-URL formatted image
    // Firefox supports PNG and JPEG. You could check img.src to
    // guess the original format, but be aware the using "image/jpg"
    // will re-encode the image.
    var dataURL = canvas.toDataURL("image/png");

    return dataURL; //.replace(/^data:image\/(png|jpg);base64,/, "");
}