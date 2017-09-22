let MAPPING_PREFIX = "mapping_";

function getMappings() {
    return new Promise(async function(resolve, reject) {
        chrome.storage.local.get(null, function (items) {
            let allKeys = Object.keys(items);
            let output = {};
            for (i = 0; i < allKeys.length; i++) {
                if (allKeys[i].indexOf(MAPPING_PREFIX) == 0) {
                    let key = allKeys[i].substring(MAPPING_PREFIX.length);
                    output[key] = items[allKeys[i]];
                }
            }
            resolve(output);
        });
    });
}


function getArtistPath(artist) {
    return MAPPING_PREFIX + artist.toLowerCase();
}


async function setMapping(name, path) {
    path = path.replace("\\","/");
    await set(getArtistPath(name), path);
    console.log("Mapping saved for " + name + ": " + path)
}

function saveMappings(mappings) {
    return new Promise(async function(resolve, reject) {
        let allKeys = Object.keys(mappings);
        let obj = {};
        for (i = 0; i < allKeys.length; i++) {
            let key = getArtistPath(allKeys[i]);
            obj[key] = mappings[allKeys[i]];
        }
        chrome.storage.local.set(obj, function () {
            // Notify that we saved.
            console.log("Saved new paths for artists");
            resolve();
        });
    });
}

function removeMapping(name) {
    return new Promise(async function(resolve, reject) {
        let key = getArtistPath(name);
        chrome.storage.local.remove(key, function () {
            console.log("Removed mapping for " + name);
            resolve();
        })
    });
}

function getMapping(name) {
    return new Promise(async function (resolve, reject) {
        let key = getArtistPath(name);
        console.log(key);
        chrome.storage.local.get([key], function(values) {
            console.log(values);
            if(values[key]==undefined) {
                console.log("No path found for artist " + name);
                resolve("");
            } else {
                console.log("Path found for artist " + name + ": " + values[key]);
                resolve(values[key]);
            }
        });
    });
}

let SETTING_PREFIX = "setting.prefix";

async function getPrefixPath() {
    return await get(SETTING_PREFIX);
}

async function setPrefixPath(path) {
    await set(SETTING_PREFIX, path);
}

let SETTING_DATE_CUTOFF = "setting.dateCutoff";

async function getDateCutoff() {
    return await get(SETTING_DATE_CUTOFF);
}

async function setDateCutoff(date) {
    await set(SETTING_DATE_CUTOFF, date);
}

function get(key) {
    return new Promise(async function(resolve, reject) {
        chrome.storage.local.get([key], function (values) {
            if (values[key] === undefined) {
                resolve("");
            } else {
                resolve(values[key]);
            }
        });
    });
}

function set(key, value) {
    return new Promise(async function(resolve, reject) {
        let obj = {};
        obj[key] = value;
        chrome.storage.local.set(obj, function() { resolve(); });
    });
}


