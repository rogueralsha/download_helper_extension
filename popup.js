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
            var openBtnEle = document.getElementById("open-button");
            var txtEle = document.getElementById("download-path-input");
            var artistEle = document.getElementById("artist-name-div");

            btnEle.style.display = "none";
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

                    if(link["type"]=="image") {
                        var img = document.createElement("img");
                        img.src = link["url"];
                        row.appendChild(tdWrap(img));
                    } else {
                        row.appendChild(document.createElement("td"));
                    }

                    var check = document.createElement("input");
                    check.type = "checkbox";
                    check.value = i;
                    check.checked = true;
                    row.appendChild(tdWrap(check));

                    table.appendChild(row);
                    checkboxes.push(check);
                }
                getOutputElement().appendChild(table);
                btnEle.style.display = "inline-block";
                txtEle.style.display = "inline-block";
                artistEle.style.display = "inline-block";
                openBtnEle.style.display = "inline-block";

                document.getElementById("artist-name-span").innerText = response.artist;

                var storagePath = getArtistPath(response.artist);
                console.log(storagePath);
                chrome.storage.sync.get([storagePath], function(values) {
                    console.log(values);
                    if(values[storagePath]==undefined) {
                        txtEle.value = "";
                        console.log("No path found for artist " + response.artist);
                        txtEle.focus();
                    } else {
                        console.log("Path found for artist " + response.artist + ": " + values[storagePath]);
                        txtEle.value = values[storagePath];
                        txtEle.focus();
                    }
                });
            }
            pageMedia = response;
        });
    });
}

function getArtistPath(artist) {
    return "artist_path_" + artist;
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

function downloadMedia() {
    if(pageMedia==null||pageMedia.error!=null)
        return;

    var downloadPath = document.getElementById("download-path-input").value;

    if(downloadPath==null) {
        return;
    }
    var storagePath = getArtistPath(pageMedia.artist);
    console.log("Saving path for artist " + storagePath + ": " + downloadPath);

    var obj= {};
    obj[storagePath] = downloadPath;
    chrome.storage.sync.set(obj, function() {
        // Notify that we saved.
        console.log("Saved new path for artist");
    });

    for (var i = 0, len = checkboxes.length; i < len; i++) {
        var check = checkboxes[i];
        if(!check.checked) {
            continue;
        }
        var link = pageMedia.links[check.value];

            var fileName = "temp" + "/" + downloadPath + "/" + link["filename"];
            console.log("Downloading with path: " + fileName)

            chrome.downloads.download({
                url: link["url"],
                filename: fileName, // Optional
                conflictAction: "uniquify"
            });
    }

    //window.close();
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

document.getElementById('download-button').onclick = downloadMedia;
document.getElementById('open-button').onclick = openMedia;
document.getElementById('refresh-button').onclick = getDetectedMedia;
document.addEventListener('DOMContentLoaded', function() {
    getDetectedMedia();
});