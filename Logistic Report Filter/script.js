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

// --- Filtering functions ---

function handleExcelFilter(type, rows) {
  const results = [];

  // Excluded statuses for the first two filters
  const excludedStatuses = new Set([
    'ready for inspection at tech repair',
    'inspected - waiting for customer feedback',
    'ready for repair'
  ]);
  const normalized = (s) => String(s || '').trim().toLowerCase();
  const prefiltered = rows.filter(r => !excludedStatuses.has(normalized(r.status)));

  if (type === "makeG5") {
    const working = prefiltered;
    descriptions.forEach(item => {
      if (Array.isArray(item)) {
        const matched = working.filter(row => item.some(d => ((typeof d === 'object' ? d.value : d) || '').toUpperCase() === (row.description || '').toUpperCase()));
        const locations = [...new Set(matched.map(r => r.location))];
        if (locations.length > 1) results.push(...matched);
      }
    });
  }

  if (type === "push") {
    const working = prefiltered;
    descriptions.forEach(item => {
      if (Array.isArray(item)) {
        const pushItems = item.filter(d => typeof d === 'object' && d.push);
        if (pushItems.length !== item.length) return; // all in group must be push
        const matched = working.filter(row =>
          pushItems.some(pi => pi.value.toUpperCase() === (row.description || '').toUpperCase())
        );
        const matchedValues = new Set(matched.map(r => (r.description || '').toUpperCase()));
        const allMatched = pushItems.every(pi => matchedValues.has(pi.value.toUpperCase()));
        if (allMatched) results.push(...matched);
      } else if (typeof item === 'object' && item.push) {
        const match = working.find(r => (r.description || '').toUpperCase() === item.value.toUpperCase());
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

// --- NEW: Stock Control ---

function stockControl() {
  const container = document.getElementById("resultContainer");
  container.innerHTML = `
    <form id="stockForm" class="stock-form">
      <div>
        <label>Name</label>
        <input id="sc-name" placeholder="Your name" />
      </div>
      <div>
        <label>Employee number</label>
        <input id="sc-emp" placeholder="e.g. NL 16054" />
      </div>
      <div>
        <label>Start location</label>
        <input id="sc-start" placeholder="run-d-13a" />
      </div>
      <div>
        <label>End location</label>
        <input id="sc-end" placeholder="run-e-01a" />
      </div>
      <button type="submit">Generate list</button>
    </form>
    <div id="stockResults"></div>
  `;

  const form = document.getElementById('stockForm');
  form.onsubmit = (ev) => {
    ev.preventDefault();
    runStockControl({
      name: document.getElementById('sc-name').value.trim(),
      emp: document.getElementById('sc-emp').value.trim(),
      start: document.getElementById('sc-start').value.trim(),
      end: document.getElementById('sc-end').value.trim()
    });
  };
}

function runStockControl(meta) {
  const file = document.getElementById("excel-file").files[0];
  if (!file) {
    alert('Please upload an Excel file first.');
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result);
    const wb = XLSX.read(data, { type: 'array' });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);
    buildStockControl(rows, meta);
  };
  reader.readAsArrayBuffer(file);
}

function normalizeLoc(s) {
  return String(s || '').trim().toUpperCase();
}

// Natural company ordering for locations like RUN-D-13A
function parseLocParts(s) {
  const L = normalizeLoc(s);
  // RUN-D-13A => [RUN][D][13][A]
  const m = L.match(/^([A-Z]+)-([A-Z]+)-(\d+)([A-Z]?)/);
  if (m) {
    return { p1: m[1], p2: m[2], num: parseInt(m[3], 10), suf: m[4] || '' };
  }
  // Fallback
  const parts = L.split('-');
  const numMatch = (parts[2] || '').match(/(\d+)([A-Z]?)/) || [];
  return { p1: parts[0] || L, p2: parts[1] || '', num: parseInt(numMatch[1] || '0', 10), suf: numMatch[2] || '' };
}
function locCompare(a, b) {
  const A = parseLocParts(a), B = parseLocParts(b);
  return A.p1.localeCompare(B.p1) || A.p2.localeCompare(B.p2) || (A.num - B.num) || A.suf.localeCompare(B.suf);
}

function formatDate(d = new Date()) {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth()+1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

function buildStockControl(rows, meta) {
  const start = normalizeLoc(meta.start);
  const end = normalizeLoc(meta.end);
  if (!start || !end) {
    alert('Please fill start and end locations.');
    return;
  }

  // Group rows by location
  const byLoc = new Map();
  rows.forEach(r => {
    const loc = normalizeLoc(r.location);
    if (!loc) return;
    if (!byLoc.has(loc)) byLoc.set(loc, []);
    byLoc.get(loc).push(r);
  });

  // Natural sort and inclusive range
  const allLocs = Array.from(byLoc.keys()).sort(locCompare);
  const iStart = allLocs.indexOf(start);
  const iEnd = allLocs.indexOf(end);
  if (iStart === -1 || iEnd === -1) {
    alert('Start or End location not found in the report.');
    return;
  }
  const [from, to] = iStart <= iEnd ? [iStart, iEnd] : [iEnd, iStart];
  const rangeLocs = allLocs.slice(from, to+1);

  // Sort items inside each location by description then object
  rangeLocs.forEach(loc => {
    byLoc.get(loc).sort((a,b)=>
      (a.description||'').localeCompare(b.description||'') || (a.object||'').localeCompare(b.object||'')
    );
  });

  renderStockControl(rangeLocs, byLoc, meta);
}

function renderStockControl(rangeLocs, byLoc, meta) {
  const wrap = document.getElementById('stockResults');
  wrap.innerHTML = '';

  // clickable list of locations
  const ul = document.createElement('ul');
  rangeLocs.forEach(loc => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.textContent = loc;
    btn.onclick = () => printLocationSheet(loc, byLoc.get(loc) || [], meta);
    li.appendChild(btn);
    ul.appendChild(li);
  });
  wrap.appendChild(ul);
}

function printLocationSheet(location, items, meta) {
  const name = meta.name || '';
  const emp = meta.emp || '';
  const dateStr = formatDate(new Date());

  let rowsHtml = '';
  items.forEach((r, idx) => {
    rowsHtml += `<tr>
      <td>${idx+1}</td>
      <td>${r.description || ''}</td>
      <td>${r.object || ''}</td>
      <td>${(r.location||'').toUpperCase()}</td>
      <td>${r.status || ''}</td>
      <td></td>
      <td></td>
      <td></td>
    </tr>`;
  });

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${location} — Stock control</title>
<style>
  body{font-family:sans-serif;margin:16px;}
  h1{margin:0 0 4px 0;font-size:18px}
  .meta{margin:4px 0 12px 0;font-size:12px}
  table{border-collapse:collapse;width:100%;}
  th,td{border:1px solid #333;padding:4px;font-size:12px}
  th{background:#eee}
  @media print{ button{display:none} }
</style>
</head>
<body>
  <button onclick="window.print()">Print</button>
  <h1>${location}</h1>
  <div class="meta"><strong>${name}</strong>&nbsp;&nbsp;${emp}&nbsp;&nbsp;${dateStr}</div>
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Description</th>
        <th>Object</th>
        <th>Location</th>
        <th>Status</th>
        <th>Location CH</th>
        <th>Status CH</th>
        <th>Not found</th>
      </tr>
    </thead>
    <tbody>${rowsHtml}</tbody>
  </table>
</body></html>`;

  const w = window.open('', '_blank');
  w.document.open();
  w.document.write(html);
  w.document.close();
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
