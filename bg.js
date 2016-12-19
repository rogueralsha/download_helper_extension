var detectedMedia = null;

chrome.runtime.onMessage.addListener(
function(request, sender, sendResponse) {
    console.log(sender.tab ?
        "from a content script:" + sender.tab.url :
        "from the extension");
    detectedMedia = request.message;
    if (request.greeting == "hello")
        sendResponse({farewell: "goodbye"});
});

