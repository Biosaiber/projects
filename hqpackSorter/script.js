const LOCAL_STORAGE_KEY = "filterDescriptions";
let descriptions = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];
let filterGroups = [];
let tempGroup = new Set();

async function loadInitialFilters() {
  try {
    const response = await fetch("data.json");
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) {
        if (Array.isArray(data[0])) {
          filterGroups = data.map(group => group.map(x => x.toUpperCase()));
        } else {
          descriptions = data.map(d => d.toUpperCase());
        }
        saveToLocalStorage();
      }
    }
  } catch (err) {
    console.log("Could not load data.json — it may not exist yet.");
  }
  renderFilterList();
}

function saveToLocalStorage() {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(descriptions));
}

function exportFiltersToJson() {
  const jsonStr = JSON.stringify(filterGroups.length ? filterGroups : descriptions, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "data.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importJsonFile() {
  const input = document.getElementById("json-upload");
  const file = input.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (Array.isArray(data)) {
        descriptions = data;
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(descriptions));
        renderFilterList();
      } else {
        alert("Invalid JSON format.");
      }
    } catch (err) {
      alert("Failed to parse JSON.");
    }
  };
  reader.readAsText(file);
}

function renderFilterList() {
  const ul = document.getElementById("filterList");
  ul.innerHTML = "";
  const flatList = descriptions.flat();

  descriptions.forEach(groupOrItem => {
    const li = document.createElement("li");
    if (Array.isArray(groupOrItem)) {
      const innerUl = document.createElement("ul");
      groupOrItem.forEach(desc => {
        const innerLi = document.createElement("li");
        innerLi.textContent = desc;
        if (tempGroup.has(desc)) innerLi.classList.add("selected");

        const groupBtn = document.createElement("button");
        groupBtn.textContent = "G";
        groupBtn.onclick = (e) => {
          e.stopPropagation();
          tempGroup.has(desc) ? tempGroup.delete(desc) : tempGroup.add(desc);
          renderFilterList();
        };

        const removeBtn = document.createElement("button");
        removeBtn.textContent = "x";
        removeBtn.onclick = (e) => {
          e.stopPropagation();
          groupOrItem.splice(groupOrItem.indexOf(desc), 1);
          if (groupOrItem.length === 0) descriptions.splice(descriptions.indexOf(groupOrItem), 1);
          renderFilterList();
        };

        innerLi.appendChild(groupBtn);
        innerLi.appendChild(removeBtn);
        innerUl.appendChild(innerLi);
      });

      const ungroupBtn = document.createElement("button");
      ungroupBtn.textContent = "Ungroup";
      ungroupBtn.onclick = () => {
        const idx = descriptions.indexOf(groupOrItem);
        if (idx !== -1) {
          descriptions.splice(idx, 1, ...groupOrItem);
          renderFilterList();
        }
      };

      li.appendChild(innerUl);
      li.appendChild(ungroupBtn);
    } else {
      const desc = groupOrItem;
      li.textContent = desc;
      if (tempGroup.has(desc)) li.classList.add("selected");

      const groupBtn = document.createElement("button");
      groupBtn.textContent = "G";
      groupBtn.onclick = (e) => {
        e.stopPropagation();
        tempGroup.has(desc) ? tempGroup.delete(desc) : tempGroup.add(desc);
        renderFilterList();
      };

      const removeBtn = document.createElement("button");
      removeBtn.textContent = "x";
      removeBtn.onclick = (e) => {
        e.stopPropagation();
        descriptions.splice(descriptions.indexOf(desc), 1);
        renderFilterList();
      };

      li.appendChild(groupBtn);
      li.appendChild(removeBtn);
    }
    ul.appendChild(li);
  });
}

function addDescription() {
  const input = document.getElementById("descInput");
  const val = input.value.trim().toUpperCase();
  if (!val) return;
  if (descriptions.flat().includes(val)) {
    alert("This value already exists in the filter list.");
    return;
  }
  descriptions.push(val);
  saveToLocalStorage();
  input.value = "";
  renderFilterList();
}

function removeDescription(index) {
  descriptions.splice(index, 1);
  saveToLocalStorage();
  renderFilterList();
}

function groupSelectedItems() {
  const selected = Array.from(tempGroup);
  if (selected.length === 0) {
    alert("Please select some items to group using the G button.");
    return;
  }
  descriptions = descriptions.filter(d => !selected.includes(d));
  descriptions.push(selected); // as a group
  tempGroup.clear();
  renderFilterList();
}

let excelFile;

const dropZone = document.getElementById("excel-drop");
const inputFile = document.getElementById("excel-file");
const fileStatus = document.getElementById("fileStatus");

dropZone.addEventListener("click", () => inputFile.click());
inputFile.addEventListener("click", () => { inputFile.value = ""; });
inputFile.addEventListener("change", () => {
  excelFile = inputFile.files[0];
  fileStatus.textContent = `✅ File loaded: ${excelFile.name}`;
});
dropZone.addEventListener("dragover", (e) => { e.preventDefault(); dropZone.style.background = "#e0ffe0"; });
dropZone.addEventListener("dragleave", () => { dropZone.style.background = "#fff"; });
dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.style.background = "#fff";
  excelFile = e.dataTransfer.files[0];
  fileStatus.textContent = `✅ File loaded: ${excelFile.name}`;
});

async function filterReport() {
  if (!excelFile || (!descriptions.length && !filterGroups.length)) {
    alert("Please upload an Excel file and add at least one filter.");
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    const usedGroupItems = new Set();
    const matchedRows = [];

    // groups
    descriptions.forEach(item => {
      if (Array.isArray(item)) {
        const found = rows.filter(row => item.includes((row.description || '').toUpperCase()));
        const allMatched = item.every(val => found.find(r => (r.description || '').toUpperCase() === val));
        if (allMatched) {
          matchedRows.push(...found);
          item.forEach(i => usedGroupItems.add(i));
        }
      }
    });

    // single items
    const ungrouped = descriptions.filter(d => !Array.isArray(d) && !usedGroupItems.has(d));
    matchedRows.push(...rows.filter(row => ungrouped.includes((row.description || '').toUpperCase())));

    matchedRows.sort((a, b) => (a.description || '').localeCompare(b.description || ''));
    const resultContainer = document.getElementById("resultContainer");
    resultContainer.innerHTML = "";
    if (matchedRows.length === 0) {
      resultContainer.textContent = "No results found for the selected filters.";
      return;
    }
    const table = document.createElement("table");
    const thead = document.createElement("thead");
    thead.innerHTML = "<tr><th>Description</th><th>Object</th><th>Location</th><th>Status</th></tr>";
    table.appendChild(thead);
    const tbody = document.createElement("tbody");
    matchedRows.forEach(r => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${r.description || ""}</td>
        <td>${r.object || ""}</td>
        <td>${r.location || ""}</td>
        <td>${r.status || ""}</td>
      `;
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    resultContainer.appendChild(table);
  };
  reader.readAsArrayBuffer(excelFile);
}

// Load
if (!descriptions.length) loadInitialFilters();
renderFilterList();
