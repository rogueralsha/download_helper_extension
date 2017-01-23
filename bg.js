function downloadMedia(pageMedia, callback) {
    if(pageMedia==null||pageMedia.error!=null)
        return;

	getMapping(pageMedia.artist, function(downloadPath) {
    getPrefixPath(function(prefixPath) {
		if(prefixPath.length>0) {
        downloadPath = prefixPath + "/" + downloadPath;
		}

        downloadHelper(downloadPath, pageMedia.links, function() {
            if(callback!=null)
                callback();
        }, function() {
			// Send progress update
        });

    });
		
	});
	
}

function downloadHelper(downloadPath, linkList, callback, progressCallBack) {

    if(linkList.length>0) {
        var link = linkList[0];
        linkList.splice(0,1);

        if(link===undefined) {
            window.alert("undefined");
        }

        if(link["type"]=="page") {
            var tab = chrome.tabs.create({url:link["url"],active:false}, function (tab) {
                chrome.tabs.onUpdated.addListener(function(tabId , info) {
                    if (tabId==tab.id&&info.status == "complete") {
                        chrome.tabs.sendMessage(tab.id, {greeting: "getPageMedia"}, function(response) {
                            if (response == null||response.error!=null) {
                                return;
                            }
                            downloadHelper(downloadPath, response.links, function() {
                                chrome.tabs.remove(tab.id);
                                downloadHelper(downloadPath, linkList, callback, progressCallBack);
                            });
                        });
                    }
                });
            });
        } else {
        	var fileName =link["filename"];
        	if(downloadPath.length>0) {
	            var fileName = downloadPath + "/" + fileName;
    	}
		console.log("Downloading with path: " + fileName)

            chrome.downloads.download({
                url: link["url"],
                filename: fileName, // Optional
                conflictAction: "uniquify"
            }, function() {
                downloadHelper(downloadPath, linkList, callback, progressCallBack);
            });
        }
        if(progressCallBack!=null)
            progressCallBack();
    } else {
        callback();
    }
}

chrome.runtime.onMessage.addListener(
function(request, sender, sendResponse) {
    console.log(sender.tab ?
        "from a content script:" + sender.tab.url :
        "from the extension");
    if (request.command == "download") {
		downloadMedia(request.results, function() {
		});
	}
});