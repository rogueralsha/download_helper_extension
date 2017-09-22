chrome.runtime.onMessage.addListener(
function(request, sender, sendResponse) {
    processBackgroundMessage(request, sender, sendResponse);
    return true;
});

async function processBackgroundMessage(request, sender, sendResponse) {
    console.log(sender.tab ?
        "from a content script:" + sender.tab.url :
        "from the extension");
    if (request.command === "download") {
        await downloadPageMedia(request.results);
        sendResponse();
    } else if(request.command === "downloadLink") {
        chrome.downloads.download({
            url: request.url,
            filename: request.filename, // Optional
            conflictAction: "uniquify",
            method: "GET",
            headers: request.headers
        }, async function () {
            "use strict";
            sendResponse();
        });
    } else if(request.command === "closeTab") {
        if(request.tabId!=null) {
            chrome.tabs.remove(request.tabId);
            sendResponse();
        } else {
            chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                chrome.tabs.remove(tabs[0].id);
                sendResponse();
            });
        }
    } else if(request.command === "getTab") {
        chrome.tabs.query(
            {currentWindow: true},
            function (tabArray) {
                for(let i = 0; i < tabArray.length;i++) {
                    let tab = tabArray[i];
                    if(tab.id===request.tabId) {
                        sendResponse(tab);
                        return;
                    }
                }
                sendResponse();
            }
        );
    } else if(request.command==="openTab") {
        chrome.tabs.create({url: request.url, active: false, windowId: sender.tab.windowId}, function (tab) {
            console.log("Tab created: " + tab.id);
            chrome.tabs.onUpdated.addListener(function (tabId, info) {
                if (tabId === tab.id && info.status === "complete") {
                    console.log("New tab open complete: " + tabId);
                    console.log("Sending tab response");
                    console.log(tab);
                    sendResponse(tab);
                }
            });
        });
    } else if(request.command==="getPageMedia") {
        if(request.tabId!=null ){
            chrome.tabs.sendMessage(request.tabId, {url: request.url, command: "getPageMedia"}, async function (response) {
                console.log("Sending response back to tab");
                sendResponse(response);
            });
        } else {
            // This is the page requesting the media from an iframe, we just forward it right back to the tab
            chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, request, function (response) {
                    // Take the output and also send it right back to the tab
                    console.log("Sending response back to tab");
                    sendResponse(response);
                });
            });
            return true;
        }
    }
}