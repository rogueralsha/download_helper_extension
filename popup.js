//let pageMedia = null;

//let checkboxes = [];




function getDetectedMedia()  {
    return new Promise(async function(resolve, reject) {
        //let cutoffDateEle = document.getElementById("date-cutoff-input");

        // let cutoff;
        // if (cutoffDateEle.value.length > 0) {
        //     cutoff = new Date(cutoffDateEle.value);
        // }
        // await setDateCutoff(cutoff);

        let outputElement = document.body;
        outputElement.innerHTML = "";


        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {url: tabs[0].url, command: "getPageMedia"}, async function (response) {
                await buildOutputScreen(outputElement, response, getDetectedMedia);
                resolve();
            });
        });
    });
}

document.addEventListener('DOMContentLoaded', async function() {
    //document.getElementById("date-cutoff-input").value = await getDateCutoff();
    getDetectedMedia();
});
