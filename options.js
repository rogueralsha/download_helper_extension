var inputs = [];
var delete_checks = [];

// Saves options to chrome.storage
function save_options() {
    var obj = {};
    for (i = 0; i < inputs.length; i++) {
        var input = inputs[i];

        obj[input.name] = input.value;
    }

    saveMappings(obj, function () {
        // Notify that we saved.
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        restore_options();
    });
}

function delete_option() {
    var key = this.name;
    removeMapping(key,function() {
        restore_options();
    })
}

function exportSettings() {
    getMappings(function(mappings) {
        var output = JSON.stringify(mappings);
        var link = document.createElement('a');
        link.download = 'data.json';
        var blob = new Blob([output], {type: 'text/plain'});
        link.href = window.URL.createObjectURL(blob);
        link.click();
    });
}

function importSettings() {
    if (window.FileReader) {
        var reader = new FileReader ();
        reader.onloadend = function (ev) {
            var contents = this.result;
            var data = JSON.parse(contents);
            saveMappings(data, function() {
                restore_options();
            });
        };
        reader.readAsText (document.getElementById("import-file").files[0]);
    } else {
        window.alert("No filereader, can't import");
    }
}

function deleteSettings() {
    if(window.confirm("Are you sure you want to wipe out ALL settings?")) {
        chrome.storage.local.clear(function (items) {
            restore_options();
        });
    }
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
    // Use default value color = 'red' and likesColor = true.
    getMappings(function (items) {
        var space = document.getElementById("mappings");
        input = [];
        delete_checks = [];
        space.innerHTML = "";
        var table = document.createElement("table");
        var headerRow = document.createElement("tr");
        var header = document.createElement("th");
        header.innerText = "Delete";
        headerRow.appendChild(header);
        header = document.createElement("th");
        header.innerText = "Key";
        headerRow.appendChild(header);
        table.appendChild(headerRow);
        header = document.createElement("th");
        header.innerText = "Value";
        headerRow.appendChild(header);
        var allKeys = Object.keys(items);
        for (i = 0; i < allKeys.length; i++) {
            var key = allKeys[i];
            var value = items[key];

            var row = document.createElement("tr");
            var cell = document.createElement("td");
            var input = document.createElement("input");
            input.type = "button";
            input.value = "Remove";
            input.name = key;
            input.addEventListener('click',
                delete_option);
            cell.appendChild(input);
            row.appendChild(cell);

            cell = document.createElement("td");
            cell.innerText = key;
            row.appendChild(cell);

            cell = document.createElement("td");
            var input = document.createElement("input");
            input.type = "text";
            input.name = key;
            input.value = value;
            cell.appendChild(input);
            row.appendChild(cell);
            table.appendChild(row);
            inputs.push(input);
        }
        space.appendChild(table);
    });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);
document.getElementById('export-button').addEventListener('click',
    exportSettings);
document.getElementById('reset-button').addEventListener('click',
    deleteSettings);
document.getElementById('import-button').addEventListener('click',
    importSettings);
