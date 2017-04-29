var pageMedia = null;

var checkboxes = [];

function linkWrap(element, link) {
    var output = document.createElement("a");
    output.href = link;
    output.target = "_new";
    output.onclick = openLink;
    output.appendChild(element);
    return output;
}

function openLink(event) {
    event.preventDefault();
    var ele = event.srcElement;
    while(ele.nodeName.toLowerCase()!="a") {
        ele = ele.parentNode;
    }
    openNewBackgroundTab(ele.href,null);
}

function tdWrap(element) {
    var output = document.createElement("td");
    output.appendChild(element);
    return output;
}

function getDetectedMedia() {
    checkboxes = [];

    var cutoffDateEle = document.getElementById("date-cutoff-input");

    var cutoff;
    if(cutoffDateEle.value.length>0) {
        cutoff = new Date(cutoffDateEle.value);
    }
    setDateCutoff(cutoff);

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {command: "getPageMedia"}, function(response) {
            if(response==null) {
                setMessage("No media found (null)");
                return;
            }

            var btnEle = document.getElementById("download-button");
            var downCloseBtnEle = document.getElementById("download-close-button");

            var openBtnEle = document.getElementById("open-button");
            var txtEle = document.getElementById("download-path-input");
            var artistEle = document.getElementById("artist-name-div");

            cutoffDateEle.style.display = "none";
            btnEle.style.display = "none";
            downCloseBtnEle.style.display = "none";
            openBtnEle.display = "none";
            txtEle.style.display = "none";
            artistEle.style.display = "none";

            if(response.error!=null) {
                setMessage(response.error);
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
                    //
                    // if(link["date"]!=null) {
                    //     var date = new Date(link["date"]);
                    //     text.innerHTML += "<br/>" + date.toLocaleDateString();
                    //     if(cutoff!=null) {
                    //         check.checked = (date>=cutoff);
                    //     }
                    // } else if(cutoff==null) {
                    //     check.checked =false;
                    // }


                    if(link["thumbnail"]!=undefined) {
                        var img = document.createElement("img");
                        img.dataset["index"] = i;
                        img.src = link["thumbnail"];
                        img.onclick = function() {
                            var index = this.dataset["index"];
                            checkboxes[index].checked = !checkboxes[index].checked;
                        }

                        row.appendChild(tdWrap(img));
                    } else {
                        row.appendChild(document.createElement("td"));
                    }

                    var cell = tdWrap(check);

                    var btn = document.createElement("input");
                    btn.type = "button";
                    btn.value = "X";
                    btn.dataset["index"] = i;
                    btn.onclick = function () {
                        var index = this.dataset["index"];
                        checkboxes[index].checked = !checkboxes[index].checked;
                       for(var j = 0; j < checkboxes.length;j++) {
                           checkboxes[j].checked = (index==j);
                       }
                    }
                    cell.appendChild(btn);

                    var btn = document.createElement("input");
                    btn.type = "button";
                    btn.value = "^";
                    btn.dataset["index"] = i;
                    btn.onclick = function () {
                        var index = this.dataset["index"];
                        for(var j = 0; j < index;j++) {
                            checkboxes[j].checked = false;
                        }
                    }
                    cell.appendChild(btn);

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
                cutoffDateEle.style.display = "inline-block";

                if(response.page_title!=null) {
                    document.getElementById("artist-name-span").innerText = response.page_title + " (" + response.artist + ") (" + response.links.length + ")";
                } else {
                    document.getElementById("artist-name-span").innerText = response.artist + " (" + response.links.length + ")";
                }

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
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


async function openMedia() {
    if(pageMedia==null||pageMedia.error!=null)
        return;

    var openList = [];

    for (var i = 0, len = checkboxes.length; i < len; i++) {
        var check = checkboxes[i];
        if(!check.checked) {
            continue;
        }
        var link = pageMedia.links[check.value];

        openList.push(link["url"]);
    }
    progDiv.innerHTML = "";
    var progressStatus = new ProgressStatus();

    progressStatus.max = openList.length;

    openHelper(openList,progressStatus);
}

function openHelper(openList, progress) {
    if(openList.length==0) {
        return;
    }

    var delayCheck = document.getElementById("delay-check");

    var link = openList.shift();

    if(link===undefined) {
        window.alert("undefined link");
        return;
    }

    if(delayCheck.checked) {
        openNewBackgroundTab(link, function(tab) {
            if(progress!=null)
                progress.sendUpdate();

            openHelper(openList, progress);
        });
    } else {
        openNewBackgroundTab(link, function(tab) {
            if(progress!=null)
                progress.sendUpdate();
        });
        openHelper(openList, progress);
    }


  //  if(document.getElementById("delay-check").checked) {
//        await sleep(2000);
    //}

}

function downloadMedia(pageMedia, callback) {
    if(pageMedia==null||pageMedia.error!=null)
        return;

    var downloadPath = document.getElementById("download-path-input").value;

    if(downloadPath==null) {
        return;
    }

    if(downloadPath.length==0) {
        if(!window.confirm("Are you sure you want to download with no path?")) {
            return;
        }
    }

    var savePathCheck = document.getElementById("save-download-path-check");
    if(savePathCheck.checked) {
        console.log("Saving path: " + downloadPath + " for " + pageMedia.artist);
        setMapping(pageMedia.artist, downloadPath, function () {
        });
    }

    var toDownload = [];

    for (var i = 0, len = checkboxes.length; i < len; i++) {
        var check = checkboxes[i];
        if(!check.checked) {
            continue;
        }
        toDownload.push(pageMedia.links[check.value]);
    }

    if(toDownload.length==0) {
        return;
    }

    pageMedia.links = toDownload;

    progDiv.innerHTML = "";
    var progressStatus = new ProgressStatus();

    downloadPageMediaWithPath(pageMedia, downloadPath, function() {
        if(callback!=null) {
            callback();
        }
    }, progressStatus);
}

function ProgressStatus() {
    this.max = 0;
    this.value = 0;
    this.child = null;
    this.parent = null;
    this.bar = document.createElement("progress");
    this.bar.max = 1;
    this.bar.value = 0;

    progDiv.appendChild(this.bar);

    this.createChild = function() {
        this.child = new ProgressStatus();
        this.child.parent = this;
        return this.child;
    }
    this.sendUpdate = function() {
        this.value++;
        this.bar.max = this.max;
        this.bar.value = this.value;
    }
    this.complete = function() {
        progDiv.removeChild(this.bar);
    }
}


function autoPath() {
    var ele = document.getElementById("download-path-input");
    ele.value = "import/artwork/" + pageMedia.artist;
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
    getDateCutoff(function(cutoff) {
        document.getElementById("date-cutoff-input").value = cutoff;
        getDetectedMedia();
    });
});

var progDiv = document.getElementById("progress-div");
