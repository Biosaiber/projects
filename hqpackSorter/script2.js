
    const LOCAL_STORAGE_KEY = "filterDescriptions";
    let descriptions = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];
    let filterGroups = [];

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
      descriptions.sort((a, b) => a.localeCompare(b));
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

    function renderFilterList() {
      const ul = document.getElementById("filterList");
      ul.innerHTML = "";
      const sorted = [...descriptions].sort((a, b) => a.localeCompare(b));
      sorted.forEach((desc, i) => {
        const li = document.createElement("li");
        li.textContent = desc;
        li.onclick = () => li.classList.toggle("selected");
        const removeBtn = document.createElement("button");
        removeBtn.textContent = "x";
        removeBtn.onclick = (e) => {
          e.stopPropagation();
          removeDescription(descriptions.indexOf(desc));
        };
        li.appendChild(removeBtn);
        ul.appendChild(li);
      });
    }

    function addDescription() {
      const input = document.getElementById("descInput");
      const val = input.value.trim().toUpperCase();
      if (!val) return;
      if (descriptions.includes(val)) {
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
      const selected = [...document.querySelectorAll('#filterList li.selected')].map(li => li.firstChild.textContent);
      if (selected.length === 0) {
        alert("Please select some items to group.");
        return;
      }
      const id = prompt("Enter group ID (e.g. ID01):");
      if (!id) return;
      const group = [id.toUpperCase(), ...selected];
      filterGroups.push(group);
      renderGroupList();
      alert(`Group ${group[0]} created with ${group.length - 1} items.`);
    }

    function renderGroupList() {
      const groupList = document.getElementById("groupList");
      groupList.innerHTML = "";
      filterGroups.forEach((group, i) => {
        const li = document.createElement("li");
        li.innerHTML = `<strong>${group[0]}</strong>: ${group.slice(1).join(", ")} <button onclick="removeGroup(${i})">🗑️</button>`;
        groupList.appendChild(li);
      });
    }

    function removeGroup(index) {
      if (confirm(`Are you sure you want to delete group ${filterGroups[index][0]}?`)) {
        filterGroups.splice(index, 1);
        renderGroupList();
      }
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

        let results = [];
        if (filterGroups.length) {
          filterGroups.forEach(group => {
            const [groupId, ...items] = group;
            const found = rows.filter(row => items.includes((row.description || '').toUpperCase()));
            const allMatched = items.every(item => found.find(r => (r.description || '').toUpperCase() === item));
            if (allMatched) results.push(...found);
          });
        } else {
          results = rows.filter(row => descriptions.includes((row.description || '').toUpperCase()));
        }

        results.sort((a, b) => (a.description || '').localeCompare(b.description || ''));
        const resultContainer = document.getElementById("resultContainer");
        resultContainer.innerHTML = "";
        if (results.length === 0) {
          resultContainer.textContent = "No results found for the selected filters.";
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
      };
      reader.readAsArrayBuffer(excelFile);
    }

    if (!descriptions.length) loadInitialFilters();
    renderFilterList();
    renderGroupList();
  