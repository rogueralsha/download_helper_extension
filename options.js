var inputs = [];
var delete_checks = [];

// Saves options to chrome.storage
function save_options() {
    var obj = {};
    for (i = 0; i < inputs.length; i++) {
        var input = inputs[i];

        obj[input.name] = input.value;
    }
    chrome.storage.sync.set(obj, function () {
        // Notify that we saved.
        console.log("Saved new path for artists");
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        restore_options();
    });
}

function delete_option() {
    var key = this.name;
    chrome.storage.sync.remove(key,function() {
        restore_options();
    })
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
    // Use default value color = 'red' and likesColor = true.
    chrome.storage.sync.get(null, function (items) {
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