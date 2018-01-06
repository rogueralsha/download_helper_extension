let maappingInputs = [];
let delete_checks = [];

// Saves options to chrome.storage
async function save_options() {
    let obj = {};


    for (i = 0; i < maappingInputs.length; i++) {
        let input = maappingInputs[i];

        obj[input.name] = input.value;
    }

    await saveMappings(obj);
    // Notify that we saved.
    let status = document.getElementById('status');

    await setPrefixPath(document.getElementById("prefix-path").value);

    status.textContent = 'Options saved.';
    await restore_options();

}

async function delete_option() {
    let key = this.name;
    await removeMapping(key);
    await restore_options();
}

async function exportSettings() {
    let mappings = await getMappings();
    let output = JSON.stringify(mappings);
    let link = document.createElement('a');
    link.download = 'data.json';
    let blob = new Blob([output], {type: 'text/plain'});
    link.href = window.URL.createObjectURL(blob);
    link.click();
}

function importSettings() {
    if (window.FileReader) {
        let reader = new FileReader ();
        reader.onloadend = async function (ev) {
            let contents = this.result;
            let data = JSON.parse(contents);
            await saveMappings(data);
            await restore_options();
        };
        reader.readAsText (document.getElementById("import-file").files[0]);
    } else {
        window.alert("No filereader, can't import");
    }
}

function deleteSettings() {
    if(window.confirm("Are you sure you want to wipe out ALL settings?")) {
        chrome.storage.local.clear(async function (items) {
            await restore_options();
        });
    }
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
async function restore_options() {
    // Use default value color = 'red' and likesColor = true.
    document.getElementById("prefix-path").value = await getPrefixPath();

    let items = await getMappings();
    let space = document.getElementById("mappings");
    input = [];
    delete_checks = [];
    space.innerHTML = "";
    let table = document.createElement("table");
    let headerRow = document.createElement("tr");
    let header = document.createElement("th");
    header.innerText = "Delete";
    headerRow.appendChild(header);
    header = document.createElement("th");
    header.innerText = "Key";
    headerRow.appendChild(header);
    table.appendChild(headerRow);
    header = document.createElement("th");
    header.innerText = "Value";
    headerRow.appendChild(header);
    let allKeys = Object.keys(items);
    for (i = 0; i < allKeys.length; i++) {
        let key = allKeys[i];
        let value = items[key];

        let row = document.createElement("tr");
        let cell = document.createElement("td");
        let input = document.createElement("input");
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
        input = document.createElement("input");
        input.type = "text";
        input.name = key;
        input.value = value;
        cell.appendChild(input);
        row.appendChild(cell);
        table.appendChild(row);
        maappingInputs.push(input);
    }
    space.appendChild(table);
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
