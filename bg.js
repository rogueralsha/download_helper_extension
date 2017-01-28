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
    }
});