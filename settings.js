var MAPPING_PREFIX = "mapping_";

function getMappings(callback) {
    chrome.storage.local.get(null, function (items) {
        var allKeys = Object.keys(items);
        var output = {};
        for (i = 0; i < allKeys.length; i++) {
            if(allKeys[i].indexOf(MAPPING_PREFIX)==0) {
                var key = allKeys[i].substring(MAPPING_PREFIX.length);
                var value = items[allKeys[i]];
                output[key] = value;
            }
        }
        if(callback!=null) {
            callback(output);
        }
    });
}


function getArtistPath(artist) {
    return MAPPING_PREFIX + artist;
}


function setMapping(name, path, callback) {
    path = path.replace("\\","/");
    set(MAPPING_PREFIX + name, path, function() {
        console.log("Mapping saved for " + name + ": " + path)
       callback();
    });
}

function saveMappings(mappings, callback) {
    var allKeys = Object.keys(mappings);
    var obj = {};
    for (i = 0; i < allKeys.length; i++) {
        var key = MAPPING_PREFIX + allKeys[i];
        var value = mappings[allKeys[i]];
        obj[key] = value;
    }
    chrome.storage.local.set(obj, function () {
        // Notify that we saved.
        console.log("Saved new paths for artists");
        callback();
    });

}

function removeMapping(name, callback) {
    var key = MAPPING_PREFIX + name;
    chrome.storage.local.remove(key,function() {
        console.log("Removed mapping for " + name)
        callback();
    })
}

function getMapping(name, callback) {
    var key = MAPPING_PREFIX + name;
    chrome.storage.local.get([key], function(values) {
        console.log(values);
        if(values[key]==undefined) {
            console.log("No path found for artist " + name);
            callback("");
        } else {
            console.log("Path found for artist " + name + ": " + values[key]);
            callback(values[key]);
        }
    });
}

var SETTING_PREFIX = "setting.prefix";

function getPrefixPath(callback) {
    get(SETTING_PREFIX, callback);
}

function setPrefixPath(path, callback) {
    set(SETTING_PREFIX, path, callback);
}

function get(key, callback) {
    chrome.storage.local.get([key], function(values) {
        if(values[key]===undefined) {
            return "";
        } else {
            callback(values[key]);
        }
    });
}

function set(key, value, callback) {
    var obj= {};
    obj[key] = value;
    chrome.storage.local.set(obj, callback);
}


