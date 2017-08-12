/**
 * Created by testuset on 1/26/2017.
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getPageContentsFromIframe(iframeUrl) {
    return new Promise(async function (resolve, reject) {
        chrome.runtime.sendMessage({url: iframeUrl, command: "getPageMedia"}, function (response) {
            if (response == null) {
                console.log("No media found in iframe (null)");
                resolve(null);
                return;
            }

            if (response.error != null) {
                console.log(response.error);
            } else if (response.links.length == 0) {
                console.log("No media found in iframe");
            } else {
                resolve(response.links);
                return;
            }
            resolve(null);
        });

    });
}