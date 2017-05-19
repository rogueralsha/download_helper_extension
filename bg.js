chrome.runtime.onMessage.addListener(
function(request, sender, sendResponse) {
    console.log(sender.tab ?
        "from a content script:" + sender.tab.url :
        "from the extension");
    if (request.command == "download") {
        downloadPageMedia(request.results, function() {
		    sendResponse();
            return;
        });
	} else if(request.command == "closeTab") {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.remove(tabs[0].id);
            sendResponse();
            return;
        });
    } else if(request.command=="getPageMedia") {
        // This is the page requesting the media from an iframe, we just forward it right back to the tab
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, request, function(response) {
                // Take the output and also send it right back to the tab
                console.log("Sending response back to tab");
                sendResponse(response);
            });
        });
        return true;
    }
});