var pageMedia = null;

var checkboxes = [];

function getDetectedMedia() {
    checkboxes = [];
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {greeting: "getPageMedia"}, function(response) {
            if(response==null) {
                setMessage("No media found");
                return;
            }

            var btnEle = document.getElementById("download-button");
            var txtEle = document.getElementById("download-path-input");
            var artistEle = document.getElementById("artist-name-div");

            btnEle.style.display = "none";
            txtEle.style.display = "none";
            artistEle.style.display = "none";

            if(response.error!=null) {
                setMessage(data.error);
            }else if(response.links.length==0) {
                setMessage("No media found");
            } else {
                getOutputElement().innerHTML = "";
                for (var i = 0, len = response.links.length; i < len; i++) {
                    var link = decodeURI( response.links[i]);
                    var item = document.createElement("div");
                    var img = document.createElement("img");
                    var span = document.createElement("span");
                    var check = document.createElement("input");
                    check.type = "checkbox";
                    check.value = i;
                    check.checked = true;
                    img.src = link;
                    span.innerText = getFileName(link);
                    item.appendChild(span);
                    item.appendChild(img);
                    item.appendChild(check);
                    getOutputElement().appendChild(item);
                    checkboxes.push(check);
                }
                btnEle.style.display = "block";
                txtEle.style.display = "block";
                artistEle.style.display = "block";

                document.getElementById("artist-name-span").innerText = response.artist;

                var storagePath = getArtistPath(response.artist);
                console.log(storagePath);
                chrome.storage.sync.get([storagePath], function(values) {
                    console.log(values);
                    if(values[storagePath]==undefined) {
                        txtEle.value = "";
                        console.log("No path found for artist " + response.artist);
                    } else {
                        console.log("Path found for artist " + response.artist + ": " + values[storagePath]);
                        txtEle.value = values[storagePath];
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

function getFileName(link) {
    return decodeURI(link.substring(link.lastIndexOf('/') + 1).split("?")[0])
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
        var fileName = "import" + "/" + downloadPath + "/" + getFileName(link);
        console.log("Downloading with path: " + fileName)

        chrome.downloads.download({
            url: link,
            filename:  fileName, // Optional
            conflictAction: "uniquify"

        });
    }


}

document.getElementById('download-button').onclick = downloadMedia;
document.addEventListener('DOMContentLoaded', function() {
    getDetectedMedia();
});