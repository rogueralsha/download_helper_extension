var pageMedia = null;

var checkboxes = [];

function linkWrap(element, link) {
    var output = document.createElement("a");
    output.href = link;
    output.target = "_new";
    output.appendChild(element);
    return output;
}

function tdWrap(element) {
    var output = document.createElement("td");
    output.appendChild(element);
    return output;
}

function getDetectedMedia() {
    checkboxes = [];
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {greeting: "getPageMedia"}, function(response) {
            if(response==null) {
                setMessage("No media found");
                return;
            }

            var btnEle = document.getElementById("download-button");
            var downCloseBtnEle = document.getElementById("download-close-button");

            var openBtnEle = document.getElementById("open-button");
            var txtEle = document.getElementById("download-path-input");
            var artistEle = document.getElementById("artist-name-div");

            btnEle.style.display = "none";
            downCloseBtnEle.style.display = "none";
            openBtnEle.display = "none";
            txtEle.style.display = "none";
            artistEle.style.display = "none";

            if(response.error!=null) {
                setMessage(data.error);
            }else if(response.links.length==0) {
                setMessage("No media found");
            } else {
                getOutputElement().innerHTML = "";
                var table = document.createElement("table");
                for (var i = 0, len = response.links.length; i < len; i++) {
                    var link = response.links[i];
                    var row = document.createElement("tr");
                    var text = document.createElement("span");
                    text.innerText = link["filename"];
                    row.appendChild(tdWrap(linkWrap(text, link["url"])));

                    var check = document.createElement("input");
                    check.type = "checkbox";
                    check.value = i;
                    check.checked = true;

                    if(link["type"]=="image") {
                        var img = document.createElement("img");
                        img.dataset["index"] = i;
                        img.src = link["url"];
                        img.onclick = function() {
                            var index = this.dataset["index"];
                            checkboxes[index].checked = !checkboxes[index].checked;
                        }

                        row.appendChild(tdWrap(img));
                    } else {
                        row.appendChild(document.createElement("td"));
                    }

                    var span = document.createElement("span");
                    span.innerText = "X";
                    span.dataset["index"] = i;
                    span.onclick = function () {
                        var index = this.dataset["index"];
                        checkboxes[index].checked = !checkboxes[index].checked;
                       for(var j = 0; j <= checkboxes.length;j++) {
                           checkboxes[j].checked = (index==j);
                       }
                    }

                    var cell = tdWrap(check);
                    cell.appendChild(span);
                    row.appendChild(cell);

                    table.appendChild(row);
                    checkboxes.push(check);
                }
                getOutputElement().appendChild(table);
                btnEle.style.display = "inline-block";
                downCloseBtnEle.style.display = "inline-block";
                txtEle.style.display = "inline-block";
                artistEle.style.display = "inline-block";
                openBtnEle.style.display = "inline-block";

                document.getElementById("artist-name-span").innerText = response.artist + " (" + response.links.length + ")";

                getMapping(response.artist, function(value) {
                    txtEle.value = value;
                    txtEle.focus();
                });
            }
            pageMedia = response;
        });
    });
}


function getOutputElement() {
    return document.getElementById("output");
}

function setMessage(message) {
    getOutputElement().innerHTML = message;
}



function openMedia() {
    if(pageMedia==null||pageMedia.error!=null)
        return;

    for (var i = 0, len = checkboxes.length; i < len; i++) {
        var check = checkboxes[i];
        if(!check.checked) {
            continue;
        }
        var link = pageMedia.links[check.value];

        openNewBackgroundTab(link["url"]);
    }
}

function downloadMedia(pageMedia, callback) {
    if(pageMedia==null||pageMedia.error!=null)
        return;

    var downloadPath = document.getElementById("download-path-input").value;

    if(downloadPath==null) {
        return;
    }

    setMapping(pageMedia.artist, downloadPath, function() {})

    getPrefixPath(function(prefixPath) {
        downloadPath = prefixPath + "/" + downloadPath;

        var toDownload = [];

        for (var i = 0, len = checkboxes.length; i < len; i++) {
            var check = checkboxes[i];
            if(!check.checked) {
                continue;
            }
            toDownload.push(pageMedia.links[check.value]);
        }

        var prog = document.getElementById("multi-download-progress");
        if(toDownload.length>1) {
            prog.style.display = "block";
        }
        prog.max = toDownload.length;
        prog.value = 0;
        downloadHelper(downloadPath, toDownload, function() {
            if(callback!=null)
                callback();
        }, function() {
            prog.value = prog.value+1;
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
            var fileName = downloadPath + "/" + link["filename"];
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



function openNewBackgroundTab(link){
    var a = document.createElement("a");
    a.href = link;
    var evt = document.createEvent("MouseEvents");
    //the tenth parameter of initMouseEvent sets ctrl key
    evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0,
        true, false, false, false, 0, null);
    a.dispatchEvent(evt);
}

function autoPath() {
    var ele = document.getElementById("download-path-input");
    ele.value = "artwork/" + pageMedia.artist;
}

document.getElementById('auto-button').onclick = autoPath;
document.getElementById('download-button').onclick = function() { downloadMedia(pageMedia, function() {
    window.close();
}); };
document.getElementById('download-close-button').onclick = function() { downloadMedia(pageMedia, function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.remove(tabs[0].id);
        //window.close();
    });
}); };

document.getElementById('open-button').onclick = openMedia;
document.getElementById('refresh-button').onclick = getDetectedMedia;
document.addEventListener('DOMContentLoaded', function() {
    getDetectedMedia();
});