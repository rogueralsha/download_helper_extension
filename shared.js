/**
 * Created by testuset on 1/26/2017.
 */
function isNullOrEmpty(input) {
    return input == null || input == "";
}

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

function applyButtonStyle(button) {
    "use strict";
    button.style.backgroundColor = "#2196F3";
    button.style.color = "black";
    button.style.borderWidth = "0";
    button.style.borderRadius = "4px";
    button.style.minWidth = "32pt";
    button.style.userSelect = "none";
    button.style.padding = "4pt";
    button.style.margin = "4pt";
    button.onmouseover = function() {
        button.style.backgroundColor = "#42A5F5";
    };
    button.onmouseout = function() {
        button.style.backgroundColor = "#2196F3";
    };
}

function inIframe () {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}

function closeTab(tabId) {
    "use strict";
    return new Promise(async function(resolve, reject) {
        chrome.runtime.sendMessage({command: "closeTab", tabId: tabId}, async function (response) {
            "use strict";'' +
            resolve(response);
        });
    });
}

async function buildOutputScreen(rootElement, data, refreshCallback) {
    let closeWindowButton = document.createElement("button");
    applyButtonStyle(closeWindowButton);
    closeWindowButton.innerHTML = "Min";
    closeWindowButton.title = "Minimize";
    closeWindowButton.style.position = "absolute";
    closeWindowButton.style.top = "0";
    closeWindowButton.style.right= "0";

    closeWindowButton.onclick = function() {
        "use strict";
        if(rootElement.style.width==="64pt") {
            rootElement.style.width = "auto";
            rootElement.style.height = "auto";

        } else {
            rootElement.style.width = "64pt";
            rootElement.style.height = "64pt";
        }
    };
    rootElement.appendChild(closeWindowButton);

    let closeButton = document.createElement("button");
    applyButtonStyle(closeButton);
    closeButton.innerText = "✘";
    closeButton.title = "Close";
    closeButton.style.position = "absolute";
    closeButton.style.top = "0";
    closeButton.style.right= "35pt";
    closeButton.onclick = async function () {
        closeTab();
    };
    rootElement.appendChild(closeButton);

    rootElement.style.whiteSpace = "nowrap";
    rootElement.style.fontSize = "12pt";
    rootElement.style.color = "black";
    let artistDiv = document.createElement("div");
    rootElement.appendChild(artistDiv);
    let artistText = document.createElement("span");

    if (data == null) {
        inPageOutputElement.innerHTML = "No media found (null)";
        return;
    } else if (data.error != null) {
        inPageOutputElement.innerHTML = data.error;
        return;
    }

    let refreshButton = document.createElement("button");
    applyButtonStyle(refreshButton);
    refreshButton.innerHTML = "↻";
    refreshButton.title = "Refresh";
    refreshButton.onclick = function() {
        "use strict";
        refreshCallback();
    };
    artistDiv.appendChild(refreshButton);
    artistDiv.appendChild(artistText);


    if (data.links.length === 0) {
        artistText.innerHTML += "No media found";
        return;
    }


    artistText.innerHTML += "Artist: ";

    let progressDiv = document.createElement("div");
    rootElement.appendChild(progressDiv);

    if (data.page_title != null) {
        artistText.innerHTML += data.page_title + " (" + data.artist + ") (" + data.links.length + ")";
    } else {
        artistText.innerHTML += data.artist + " (" + data.links.length + ")";
    }

    let buttonBarDiv = document.createElement("div");
    buttonBarDiv.style.userSelect = "none";
    buttonBarDiv.style.textAlign = "right";
    rootElement.appendChild(buttonBarDiv);

    if (data.links.length === 0) {
        return;
    }

    let pathDiv = document.createElement("div");
    rootElement.appendChild(pathDiv);

    let autoButton = document.createElement("button");
    applyButtonStyle(autoButton);
    autoButton.innerText = "✈";
    autoButton.title = "Auto-Generate path";
    autoButton.onclick = function () {
        pathInput.value = "import/artist;/" + data.artist;
    };
    pathDiv.appendChild(autoButton);

    let pathInput = document.createElement("input");
    pathInput.type = "text";
    pathDiv.appendChild(pathInput);
    pathInput.value = await getMapping(data.artist);


    let lbl = document.createElement("label");
    lbl.innerText = "Save";
    lbl.style.userSelect = "none";
    let savePathCheck = document.createElement("input");
    savePathCheck.type = "checkbox";
    savePathCheck.checked = data.saveByDefault;
    lbl.appendChild(savePathCheck);
    pathDiv.appendChild(lbl);

    let checkboxes = [];



    let delayLabel = document.createElement("label");
    delayLabel.innerText = "Delay";
    let delayCheck = document.createElement("input");
    delayCheck.type = "checkbox";
    delayCheck.checked = true;
    delayLabel.appendChild(delayCheck);

    let openButton = document.createElement("button");
    applyButtonStyle(openButton);
    openButton.innerText = "➚";
    openButton.title = "Open In New Tab";
    openButton.onclick = async function () {
        "use strict";
        let openList = [];
        for (let i = 0, len = checkboxes.length; i < len; i++) {
            let check = checkboxes[i];
            if (!check.checked) {
                continue;
            }
            let link = data.links[check.value];

            openList.push(link["url"]);
        }
        progressDiv.innerHTML = "";
        let progressStatus = new ProgressStatus(progressDiv);

        progressStatus.max = openList.length;

        await openHelper(openList, progressStatus,delayCheck.checked);
    };
    buttonBarDiv.appendChild(openButton);

    buttonBarDiv.appendChild(delayLabel);


    let downloadButton = document.createElement("button");
    applyButtonStyle(downloadButton);
    downloadButton.innerText = "↓";
    downloadButton.title = "Download";
    downloadButton.onclick = async function () {
        await downloadMedia(data,pathInput.value, checkboxes, savePathCheck.checked, progressDiv);
    };
    buttonBarDiv.appendChild(downloadButton);

    let downloadCloseButton = document.createElement("button");
    applyButtonStyle(downloadCloseButton);
    downloadCloseButton.innerText = "↓ & ✘";
    downloadCloseButton.title = "Download & Close";
    downloadCloseButton.onclick = async function () {
        if(await downloadMedia(data,pathInput.value, checkboxes, savePathCheck.checked, progressDiv)) {
            closeTab();
        }
    };
    buttonBarDiv.appendChild(downloadCloseButton);




    let detailElement = document.createElement("details");
    detailElement.maxHeight = (window.innerHeight - 200) + "px";
    let summaryElement = document.createElement("summary");
    summaryElement.innerText = data.links.length + " links found";
    detailElement.appendChild(summaryElement);
    let pElement = document.createElement("p");
    detailElement.appendChild(pElement);
    detailElement.open = true; //data.links.length>1;
    rootElement.appendChild(detailElement);
    detailElement.style.userSelect = "none";

//
// <details>
//     <summary>Click to open</summary>
//     <p>If your browser supports this element, it should allow you to expand and collapse these details.</p></details>

    let tableElement = document.createElement("table");
    tableElement.style.tableLayout = "fixed";

    pElement.appendChild(tableElement);
    pElement.style.overflowY = "auto";

    for (let i = 0, len = data.links.length; i < len; i++) {
        let link = data.links[i];
        createLinkRow(tableElement, link, i, checkboxes);
    }



    pathInput.focus();

}

function createLinkRow(table, link, i, checkboxes) {
    "use strict";
    let row = document.createElement("tr");

    let check = document.createElement("input");
    check.type = "checkbox";
    check.value = i;
    check.checked = true;
    //
    // if(link["date"]!=null) {
    //     let date = new Date(link["date"]);
    //     text.innerHTML += "<br/>" + date.toLocaleDateString();
    //     if(cutoff!=null) {
    //         check.checked = (date>=cutoff);
    //     }
    // } else if(cutoff==null) {
    //     check.checked =false;
    // }



    let cell = tdWrap(check);

    let btn = document.createElement("input");
    applyButtonStyle(btn);
    btn.type = "button";
    btn.value = "✘";
    btn.dataset["index"] = i;
    btn.title = "Select only this item";
    btn.onclick = function () {
        let index = this.dataset["index"];
        checkboxes[index].checked = !checkboxes[index].checked;
        for (let j = 0; j < checkboxes.length; j++) {
            checkboxes[j].checked = (index == j);
        }
    };
    cell.appendChild(btn);

    btn = document.createElement("input");
    applyButtonStyle(btn);
    btn.type = "button";
    btn.value = "^";
    btn.title = "Select this and all items above";
    btn.dataset["index"] = i;
    btn.onclick = function () {
        let index = this.dataset["index"];
        for (let j = 0; j < checkboxes.length; j++) {
            checkboxes[j].checked = j<=index;
        }
    };
    cell.appendChild(btn);

    btn = document.createElement("input");
    applyButtonStyle(btn);
    btn.type = "button";
    btn.value = "↓";
    btn.title = "Select this and all items below";
    btn.dataset["index"] = i;
    btn.onclick = function () {
        let index = this.dataset["index"];
        for (let j = 0; j < checkboxes.length; j++) {
            checkboxes[j].checked = j>=index;
        }
    };
    cell.appendChild(btn);


    row.appendChild(cell);

    if (link["thumbnail"] != undefined) {
        let img = document.createElement("img");
        img.dataset["index"] = i;
        img.src = link["thumbnail"];
        img.style.height = "50px;";
        img.style.width = "50px";
        img.onclick = function () {
            let index = this.dataset["index"];
            checkboxes[index].checked = !checkboxes[index].checked;
        };

        row.appendChild(tdWrap(img));
    } else {
        row.appendChild(document.createElement("td"));
    }


    let textCell = tdWrap(linkWrap(link["filename"], link["url"]));
    textCell.style.width = "120px";
    textCell.style.overflow = "hidden";
    textCell.style.textOverflow = "ellipsis";
    textCell.title = link["filename"];

    row.appendChild(textCell);

    table.appendChild(row);

    checkboxes.push(check);
}

async function downloadMedia(pageMedia, downloadPath, checkboxes, savePath, progDiv) {
    if(downloadPath==null) {
        return false;
    }

    if(downloadPath.length===0) {
        if(!window.confirm("Are you sure you want to download with no path?")) {
            return false;
        }
    }

    if(savePath) {
        console.log("Saving path: " + downloadPath + " for " + pageMedia.artist);
        await setMapping(pageMedia.artist, downloadPath);
    }

    let toDownload = [];

    for (let i = 0, len = checkboxes.length; i < len; i++) {
        let check = checkboxes[i];
        if(!check.checked) {
            continue;
        }
        toDownload.push(pageMedia.links[check.value]);
    }

    if(toDownload.length===0) {
        return false;
    }

    pageMedia.links = toDownload;

    progDiv.innerHTML = "";
    let progressStatus = new ProgressStatus(progDiv);

    await  downloadPageMediaWithPath(pageMedia, downloadPath, progressStatus);
    return true;
}

function ProgressStatus(progDiv) {
    this.max = 0;
    this.value = 0;
    this.child = null;
    this.parent = null;
    this.bar = document.createElement("progress");
    this.bar.max = 1;
    this.bar.value = 0;

    progDiv.appendChild(this.bar);

    this.createChild = function () {
        this.child = new ProgressStatus(progDiv);
        this.child.parent = this;
        return this.child;
    };
    this.sendUpdate = function () {
        this.value++;
        this.bar.max = this.max;
        this.bar.value = this.value;
    };
    this.complete = function () {
        progDiv.removeChild(this.bar);
    };
}

async function openHelper(openList, progress, delay) {
    if (openList.length === 0) {
        return;
    }

    let link = openList.shift();

    if (link === undefined) {
        window.alert("undefined link");
        return;
    }

    if (delay) {
        if (link.includes("paheal")) {
            await sleep(1000);
        }


        await openNewBackgroundTab(link);
        if (progress != null)
            progress.sendUpdate();

        await openHelper(openList, progress, delay);
    } else {

        openNewBackgroundTab(link);
        if (progress != null)
            progress.sendUpdate();

        openHelper(openList, progress, delay);
    }


    //  if(document.getElementById("delay-check").checked) {
//        await sleep(2000);
    //}

}

function tdWrap(element) {
    let output = document.createElement("td");
    output.appendChild(element);
    return output;
}
function linkWrap(element, link) {
    let output = document.createElement("a");
    if(typeof element === 'string' ) {
        output.innerText = element;
    } else {
        output.appendChild(element);
    }
    output.href = link;
    output.target = "_new";
    output.onclick = function(event) {
        "use strict";
        event.preventDefault();
        let ele = event.srcElement;
        while(ele.nodeName.toLowerCase()!="a") {
            ele = ele.parentNode;
        }
        openNewBackgroundTab(ele.href);
    };
    return output;
}
