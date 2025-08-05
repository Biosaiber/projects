const LOCAL_STORAGE_KEY = "filterDescriptions";
let descriptions = [];
let tempGroup = new Set();

function loadInitialFilters() {
  fetch("data.json")
    .then(res => res.json())
    .then(data => {
      descriptions = data;
      saveToLocalStorage();
      renderFilterList();
    })
    .catch(err => {
      console.warn("Failed to load data.json", err);
      descriptions = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];
      renderFilterList();
    });
}

function importJsonFile() {
  const input = document.getElementById("json-upload");
  const file = input.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const data = JSON.parse(e.target.result);
      if (!Array.isArray(data)) throw new Error("Invalid JSON structure");
      descriptions = data;
      saveToLocalStorage();
      renderFilterList();
      alert("✅ JSON imported successfully.");
    } catch (err) {
      alert("❌ Failed to import JSON.");
      console.error(err);
    }
  };
  reader.readAsText(file);
}

function saveToLocalStorage() {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(descriptions));
}

function togglePushAttr(desc) {
  descriptions = descriptions.map(item => {
    if (typeof item === 'string') {
      return item === desc ? { value: desc, push: true } : item;
    } else if (typeof item === 'object' && item.value === desc) {
      return { ...item, push: !item.push };
    } else if (Array.isArray(item)) {
      return item.map(el => {
        if (typeof el === 'string') return el === desc ? { value: desc, push: true } : el;
        if (typeof el === 'object' && el.value === desc) return { ...el, push: !el.push };
        return el;
      });
    }
    return item;
  });
  renderFilterList();
  saveToLocalStorage();
}

function toggleGroupingAttr(desc) {
  if (tempGroup.has(desc)) {
    tempGroup.delete(desc);
  } else {
    tempGroup.add(desc);
  }
  renderFilterList();
}

function exportFiltersToJson() {
  const exportable = descriptions.map(d => d);
  const jsonStr = JSON.stringify(exportable, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "data.json";
  a.click();
  URL.revokeObjectURL(url);
}

function renderFilterList() {
  const ul = document.getElementById("filterList");
  ul.innerHTML = "";

  descriptions.forEach(groupOrItem => {
    const li = document.createElement("li");
    if (Array.isArray(groupOrItem)) {
      li.setAttribute("data-group", "full-set");
      li.setAttribute("data-count", groupOrItem.length);
      const innerUl = document.createElement("ul");
      groupOrItem.forEach(desc => {
        const value = typeof desc === 'object' ? desc.value : desc;
        const push = typeof desc === 'object' ? desc.push : false;
        const innerLi = document.createElement("li");
        innerLi.textContent = value;
        if (push) innerLi.setAttribute("data-flow", "push-item");
        if (tempGroup.has(value)) innerLi.setAttribute("data-grouping", "on");

        const pushBtn = document.createElement("button");
        pushBtn.className = "pushitem_button";
        pushBtn.textContent = "P";
        pushBtn.onclick = (e) => {
          e.stopPropagation();
          togglePushAttr(value);
        };

        const groupBtn = document.createElement("button");
        groupBtn.className = "makeGroup_button";
        groupBtn.textContent = "G";
        groupBtn.onclick = (e) => {
          e.stopPropagation();
          toggleGroupingAttr(value);
        };

        const removeBtn = document.createElement("button");
        removeBtn.className = "delete_button";
        removeBtn.textContent = "X";
        removeBtn.onclick = (e) => {
          e.stopPropagation();
          const idx = descriptions.indexOf(groupOrItem);
          if (idx !== -1) {
            groupOrItem.splice(groupOrItem.indexOf(desc), 1);
            if (groupOrItem.length === 0) descriptions.splice(idx, 1);
            renderFilterList();
            saveToLocalStorage();
          }
        };

        innerLi.appendChild(pushBtn);
        innerLi.appendChild(groupBtn);
        innerLi.appendChild(removeBtn);
        innerUl.appendChild(innerLi);
      });

      const ungroupBtn = document.createElement("button");
      ungroupBtn.className = "ungroup_button";
      ungroupBtn.textContent = "U";
      ungroupBtn.onclick = () => {
        const idx = descriptions.indexOf(groupOrItem);
        if (idx !== -1) {
          descriptions.splice(idx, 1, ...groupOrItem);
          renderFilterList();
          saveToLocalStorage();
        }
      };

      li.appendChild(innerUl);
      li.appendChild(ungroupBtn);
    } else {
      const value = typeof groupOrItem === 'object' ? groupOrItem.value : groupOrItem;
      const push = typeof groupOrItem === 'object' && groupOrItem.push;
      li.textContent = value;
      if (push) li.setAttribute("data-flow", "push-item");
      if (tempGroup.has(value)) li.setAttribute("data-grouping", "on");

      const pushBtn = document.createElement("button");
      pushBtn.className = "pushitem_button";
      pushBtn.textContent = "P";
      pushBtn.onclick = (e) => {
        e.stopPropagation();
        togglePushAttr(value);
      };

      const groupBtn = document.createElement("button");
      groupBtn.className = "makeGroup_button";
      groupBtn.textContent = "G";
      groupBtn.onclick = (e) => {
        e.stopPropagation();
        toggleGroupingAttr(value);
      };

      const removeBtn = document.createElement("button");
      removeBtn.className = "delete_button";
      removeBtn.textContent = "X";
      removeBtn.onclick = (e) => {
        e.stopPropagation();
        descriptions.splice(descriptions.indexOf(groupOrItem), 1);
        renderFilterList();
        saveToLocalStorage();
      };

      li.appendChild(pushBtn);
      li.appendChild(groupBtn);
      li.appendChild(removeBtn);
    }
    ul.appendChild(li);
  });
}

function groupSelectedItems() {
  const selected = Array.from(tempGroup);
  if (!selected.length) return;
  descriptions = descriptions.filter(item => {
    const val = typeof item === 'object' ? item.value : item;
    return !selected.includes(val);
  });
  descriptions.push(selected);
  tempGroup.clear();
  renderFilterList();
  saveToLocalStorage();
}

// Filtering functions

function handleExcelFilter(type, rows) {
  const results = [];

  if (type === "makeG5") {
    descriptions.forEach(item => {
      if (Array.isArray(item)) {
        const matched = rows.filter(row => item.some(d => ((typeof d === 'object' ? d.value : d) || '').toUpperCase() === (row.description || '').toUpperCase()));
        const locations = [...new Set(matched.map(r => r.location))];
        if (locations.length > 1) results.push(...matched);
      }
    });
  }

  if (type === "push") {
    descriptions.forEach(item => {
      if (Array.isArray(item)) {
        const pushItems = item.filter(d => typeof d === 'object' && d.push);
        if (pushItems.length !== item.length) return; // all must have push

        const matched = rows.filter(row =>
          pushItems.some(pi => pi.value.toUpperCase() === (row.description || '').toUpperCase())
        );

        const matchedValues = new Set(matched.map(r => (r.description || '').toUpperCase()));
        const allMatched = pushItems.every(pi => matchedValues.has(pi.value.toUpperCase()));

        if (allMatched) results.push(...matched);
      } else if (typeof item === 'object' && item.push) {
        const match = rows.find(r => (r.description || '').toUpperCase() === item.value.toUpperCase());
        if (match) results.push(match);
      }
    });
  }

  if (type === "dropzone") {
    results.push(...rows.filter(row => (row.location || '').toLowerCase() === 'run-c-30a'));
  }

  if (type === "dock") {
    results.push(...rows.filter(row => (row.location || '').toLowerCase() === 'run-c-11a'));
  }

  renderResults(results);
}

function renderResults(results) {
  const resultContainer = document.getElementById("resultContainer");
  resultContainer.innerHTML = "";
  if (!results.length) {
    resultContainer.textContent = "No results found.";
    return;
  }
  const table = document.createElement("table");
  const thead = document.createElement("thead");
  thead.innerHTML = "<tr><th>Description</th><th>Object</th><th>Location</th><th>Status</th></tr>";
  table.appendChild(thead);
  const tbody = document.createElement("tbody");
  results.forEach(r => {
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
}

function filterBy(type) {
  const inputFile = document.getElementById("excel-file");
  const file = inputFile.files[0];
  if (!file) {
    alert("Please upload an Excel file first.");
    return;
  }
  const reader = new FileReader();
  reader.onload = function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);
    handleExcelFilter(type, rows);
  };
  reader.readAsArrayBuffer(file);
}

// Click-to-upload Excel drop zone
const dropZone = document.getElementById("excel-drop");
dropZone.addEventListener("click", () => {
  document.getElementById("excel-file").click();
});

document.getElementById("excel-file").addEventListener("change", (e) => {
  const file = e.target.files[0];
  const status = document.getElementById("fileStatus");
  if (file) {
    status.textContent = `✅ File loaded: ${file.name}`;
  } else {
    status.textContent = "No file uploaded yet.";
  }
});

function addDescription() {
  const input = document.getElementById("descInput");
  const val = input.value.trim().toUpperCase();
  if (!val) return;

  const alreadyExists = descriptions.some(item => {
    if (typeof item === 'string') return item === val;
    if (typeof item === 'object') return item.value === val;
    if (Array.isArray(item)) return item.some(el => (typeof el === 'object' ? el.value : el) === val);
  });

  if (alreadyExists) {
    alert("This item already exists in the filter list.");
    return;
  }

  descriptions.push(val);
  saveToLocalStorage();
  input.value = "";
  renderFilterList();
}

loadInitialFilters();
