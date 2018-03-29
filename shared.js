/**
 * Created by testuset on 1/26/2017.
 */

let processing = false;
let newsBlurRegExp = new RegExp("https?:\\/\\/newsblur\.com\\/(site\\/\\d+|folder)\\/(.+)", 'i');

let pixivSiteRegexp = new RegExp("https?://www\\.pixiv\\.net/", 'i');
let pixivImgRegexp = new RegExp("https?://i\\.pximg\\.net/.+", 'i');

let mixtapeRegexp = new RegExp("https?:\\/\\/my\.mixtape\.moe\\/([^\\/]+)$", 'i');
let webmVideoRegexp = new RegExp("https?:\\/\\/webm\.video\\/i\\/([^\\/]+)$", 'i');
let armariumRegexp = new RegExp("https?:\\/\\/webm\\.armarium\\.org\\/i\\/([^\\/]+)$", 'i');
let catboxRegexp = new RegExp("https?:\\/\\/files\.catbox\.moe\\/([^\\/]+)$", 'i');
let safeMoeRegexp = new RegExp("https?:\\/\\/.?\.safe\.moe\\/([^\\/]+)$", 'i');

let eroshareRegexp = new RegExp("https?:\\/\\/eroshare\.com\\/([^\\/]+)$", 'i');
let pimpandhostRegexp = new RegExp("https?:\\/\\/pimpandhost\\.com\\/image\\/(\\d+)$", 'i');
let imagebamRegexp = new RegExp("https?:\\/\\/www\\.imagebam\\.com\\/image\\/([\\da-f]+)$", 'i');
let uploaddirRegexp = new RegExp("https?:\\/\\/uploadir\\.com\\/u\\/(.+)$", 'i');
let dokoMoeRegexp = new RegExp("https?:\\/\\/b\\.doko\\.moe\\/(.+)$", 'i');
let userapiRegexp = new RegExp("https?:\\/\\/pp\\.userapi\\.com\\/(.+)$", 'i');
let uploadsRuRegexp = new RegExp("https?:\\/\\/[^\\.]+\\.uploads\\.ru\\/(.+)$", 'i');

let megaRegexp = new RegExp("https?:\\/\\/mega\\.nz\\/(.+)$", 'i');
let googleDriveRegexp = new RegExp("https?:\\/\\/drive\\.google\\.com\\/file\\/(.+)$", 'i');



let siteRegexp = new RegExp("https?://([^/]+)/.*", 'i');



let backgroundImageRegexp = new RegExp("url\\([\\'\\\"](.+)[\\'\\\"]\\)");

let sources = [tinyTinyRssSource,imgbbSource, tumblrSource, gfycatSource, webmshareSource, youtubeSource, imgurSource, eromeSource, artstationSource,
    deviantartSource, bloggerSource, alsscanSource,
    instagramSource, miniTokyoSource, redditSource, patreonSource, hegreSource, twitterSource, watch4beautySource];

function isNullOrEmpty(input) {
    return input == null || input === "";
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function evaluateLink(link, output, filename, select) {
    let result = isSupportedPage(link);
    if (result.result) {
        let thumbnail = null;
        if(result.thumbnail!=null) {
            thumbnail = result.thumbnail;
        }
        if(result.directLink) {
            output.addLink(createLink({url: link, type: "image", filename: filename, select: select, thumbnail: thumbnail, autoDownload: result.autoDownload}));
        } else {
            output.addLink(createLink({url: link, type: "page", filename: filename, select: select, thumbnail: thumbnail, autoDownload: result.autoDownload}));
        }
    } else if (mixtapeRegexp.test(link)||webmVideoRegexp.test(link)||armariumRegexp.test(link)||catboxRegexp.test(link)
        ||safeMoeRegexp.test(link)||redditSource.imageRegexp.test(link)||uploaddirRegexp.test(link)||dokoMoeRegexp.test(link)
    ||userapiRegexp.test(link)) {
        output.addLink(createLink({url: link, type: "image", filename: filename, select: select}));
    }
}

function isSupportedPage(link) {
    let output = {};
    output.result = false;
    output.thumbnail = null;
    output.directLink = false;
    output.autoDownload = true;

    for (let i = 0; i < sources.length; i++) {
        let source = sources[i];
        if(source.isSupported!==undefined&&source.isSupported(link)) {
            output.result = true;
            if(source.getThumbnail!==undefined) {
                output.thumbnail = source.getThumbnail(link);
            }
            if(source.isDirectFileLink!==undefined) {
                output.directLink = source.isDirectFileLink(link);
            }
            break;
        }
    }

    if(output.result == false) {
        if (hfRegExp.test(link) ||
            flickrRegexp.test(link) ||
            eroshareRegexp.test(link) ||
            postimgPostRegexp.test(link) ||
            postimgAlbumRegexp.test(link) ||
            pimpandhostRegexp.test(link) ||
            uploadsRuRegexp.test(link)||
            imagebamRegexp.test(link)) {
            output.result = true;
        }
    }
    if(output.result == false) {
        if (megaRegexp.test(link)||
            googleDriveRegexp.test(link)) {
            output.result = true;
            output.autoDownload = false;
        }
    }

            return output;
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
            } else if (response.links.length === 0) {
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
    button.style.minWidth = "20pt";
    button.style.maxWidth = "32pt";
    button.style.height= "20pt";
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

function createTableCell(contents, width) {
    let output = document.createElement("td");
    output.appendChild(contents);
    if(width==null) {
        output.style.width = "auto";
    }
    return output;
}

function createTableRow() {
    return document.createElement("tr");
}

function addToTableRow(row, contents) {
    row.appendChild(createTableCell(contents));
}

let  minimized = false;

async function buildOutputScreen(rootElement, data, refreshCallback) {
    console.log("Building output screen");

    rootElement.style.whiteSpace = "nowrap";
    rootElement.style.fontSize = "12pt";
    rootElement.style.color = "black";

    let buttonTable = document.createElement("table");
    buttonTable.style.width="100%";
    let detailElement = document.createElement("details");

    let restoreButton = document.createElement("button");
    applyButtonStyle(restoreButton);
    restoreButton.innerHTML = "Rest";
    restoreButton.title = "Restore";
    restoreButton.onclick = function() {
        "use strict";
        minimized = false;
        rootElement.style.width = "auto";
        rootElement.style.height = "auto";
        detailElement.style.display = "block";
        buttonTable.style.display = "block";
        restoreButton.style.display = "none";
    };
    rootElement.appendChild(restoreButton);

    if(minimized) {
        detailElement.style.display = "none";
        buttonTable.style.display = "none";
        restoreButton.style.display = "block";
    } else {
        detailElement.style.display = "block";
        buttonTable.style.display = "block";
        restoreButton.style.display = "none";
    }

    rootElement.appendChild(buttonTable);

    let tableRow = document.createElement("tr");

    let refreshButton = document.createElement("button");
    applyButtonStyle(refreshButton);
    refreshButton.innerHTML = "↻";
    refreshButton.title = "Refresh";
    refreshButton.onclick = function() {
        "use strict";
        refreshCallback();
    };
    addToTableRow(tableRow, refreshButton);

    let artistText = document.createElement("span");
    addToTableRow(tableRow, artistText);

    let closeButton = document.createElement("button");
    applyButtonStyle(closeButton);
    closeButton.innerText = "×";
    closeButton.title = "Close Window";
    closeButton.onclick = async function () {
        rootElement.style.display = "none";
    };
    let tableCell = createTableCell(closeButton);
    tableCell.style.textAlign = "right";
    tableRow.appendChild(tableCell);


    let closeTabButton = document.createElement("button");
    applyButtonStyle(closeTabButton);
    closeTabButton.innerText = "✖";
    closeTabButton.title = "Close Tab";
    closeTabButton.onclick = async function () {
        closeTab();
    };
    tableCell = createTableCell(closeTabButton);
    tableCell.style.textAlign = "right";
    tableRow.appendChild(tableCell);


    let minimizeButton = document.createElement("button");
    applyButtonStyle(minimizeButton);
    minimizeButton.innerHTML = "Min";
    minimizeButton.title = "Minimize";

    minimizeButton.onclick = function() {
        "use strict";
        minimized = true;
        buttonTable.style.display = "none";
        detailElement.style.display = "none";
        rootElement.style.width = "32pt";
        rootElement.style.height = "32pt";
        restoreButton.style.display = "block";
    };

    tableCell = createTableCell(minimizeButton);
    tableCell.style.textAlign = "right";
    tableRow.appendChild(tableCell);

    buttonTable.appendChild((tableRow));

    if (data == null) {
        artistText.innerHTML = "No media found (null)";
        return;
    } else if (data.error != null) {
        artistText.innerHTML = "Error: " + data.error;
        return;
    } else if (data.links.length === 0) {
        artistText.innerHTML = "No media found";
        return;
    }
    artistText.innerHTML = "Artist: ";


    tableRow = document.createElement("tr");

    let openButton = document.createElement("button");
    applyButtonStyle(openButton);
    openButton.innerText = "➚";
    openButton.title = "Open In New Tab";
    openButton.onclick = async function () {
        "use strict";
        processing = true;
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
        processing = false;
    };
    addToTableRow(tableRow, openButton);

    let delayLabel = document.createElement("label");
    delayLabel.innerText = "Delay";
    let delayCheck = document.createElement("input");
    delayCheck.type = "checkbox";
    delayCheck.checked = false;
    delayLabel.appendChild(delayCheck);

    addToTableRow(tableRow, delayLabel);


    let downloadButton = document.createElement("button");
    applyButtonStyle(downloadButton);
    downloadButton.innerText = "↓";
    downloadButton.title = "Download";
    downloadButton.onclick = async function () {
        processing = true;
        await downloadMedia(data,pathInput.value, checkboxes, savePathCheck.checked, progressDiv);
        processing = false;
    };
    addToTableRow(tableRow, downloadButton);

    let downloadCloseButton = document.createElement("button");
    applyButtonStyle(downloadCloseButton);
    downloadCloseButton.innerText = "↓ & ✘";
    downloadCloseButton.title = "Download & Close";
    downloadCloseButton.onclick = async function () {
        processing = true;
        if(await downloadMedia(data,pathInput.value, checkboxes, savePathCheck.checked, progressDiv)) {
            closeTab();
        }
        processing = false;
    };
    addToTableRow(tableRow, downloadCloseButton);

    buttonTable.appendChild((tableRow));


    tableRow = document.createElement("tr");
    let autoButton = document.createElement("button");
    applyButtonStyle(autoButton);
    autoButton.innerText = "✈";
    autoButton.title = "Auto-Generate path";
    autoButton.onclick = function () {
        pathInput.value = "import/artist;/" + data.artist;
    };
    addToTableRow(tableRow, autoButton);


    let pathInput = document.createElement("input");
    pathInput.type = "text";
    pathInput.value = await getMapping(data.artist);
    addToTableRow(tableRow, pathInput);

    let lbl = document.createElement("label");
    lbl.innerText = "Save";
    lbl.style.userSelect = "none";
    let savePathCheck = document.createElement("input");
    savePathCheck.type = "checkbox";
    savePathCheck.checked = data.saveByDefault;
    lbl.appendChild(savePathCheck);
    addToTableRow(tableRow, lbl);

    buttonTable.appendChild((tableRow));





    let progressDiv = document.createElement("div");
    rootElement.appendChild(progressDiv);

    if (data.page_title != null) {
        artistText.innerHTML += data.page_title + " (" + data.artist + ") (" + data.links.length + ")";
    } else {
        artistText.innerHTML += data.artist + " (" + data.links.length + ")";
    }

    if (data.links.length === 0) {
        return;
    }


    let checkboxes = [];


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
    check.style.height = "8pt";
    check.style.width = "8pt";
    check.value = i;
    if(link["select"]===true) {
        check.checked = true;
    } else {
        check.checked = false;
    }
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
    btn.value = "☛";
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
    btn.value = "↑";
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


    let textLink = linkWrap(link["filename"], link["url"]);
    textLink.classList.add("downloadHelperLink");
    let textCell = tdWrap(textLink);
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
        let link = pageMedia.links[check.value];
        link.select = check.checked;

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
