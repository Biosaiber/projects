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

loadInitialFilters();
