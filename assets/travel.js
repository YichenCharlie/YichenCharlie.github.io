"use strict";

const SVG_NS = "http://www.w3.org/2000/svg";
const mapTypes = ["china", "world", "usa"];
const editing = new URLSearchParams(location.search).get("edit") === "1";
const maps = {};
let saved;
let visited;
const provinceNames = ["Beijing", "Tianjin", "Hebei", "Shanxi", "Inner Mongolia", "Liaoning", "Jilin", "Heilongjiang", "Shanghai", "Jiangsu", "Zhejiang", "Anhui", "Fujian", "Jiangxi", "Shandong", "Henan", "Hubei", "Hunan", "Guangdong", "Guangxi", "Hainan", "Chongqing", "Sichuan", "Guizhou", "Yunnan", "Tibet", "Shaanxi", "Gansu", "Qinghai", "Ningxia", "Xinjiang", "Taiwan", "Hong Kong", "Macao"];
const provinceCodes = [110000,120000,130000,140000,150000,210000,220000,230000,310000,320000,330000,340000,350000,360000,370000,410000,420000,430000,440000,450000,460000,500000,510000,520000,530000,540000,610000,620000,630000,640000,650000,710000,810000,820000];
const englishNames = new Map(provinceCodes.map((code, i) => [String(code), provinceNames[i]]));
document.getElementById("year").textContent = new Date().getFullYear();
document.getElementById("editor").hidden = !editing;

function svgElement(tag, attributes = {}) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
  return node;
}

function regionInfo(feature, type) {
  const p = feature.properties;
  if (type === "usa") return { id: p.postal, name: p.name_en || p.name, local: p.name_zh };
  const id = String(type === "china" ? p.adcode : p.ADM0_A3);
  return { id, name: type === "china" ? englishNames.get(id) : p.NAME_EN, local: type === "china" ? p.name : p.NAME_ZH, center: p.center || p.centroid };
}

function polygons(geometry) {
  if (geometry.type === "Polygon") return [geometry.coordinates];
  if (geometry.type === "MultiPolygon") return geometry.coordinates;
  return [];
}

function fitUSGroup(features, box, factor) {
  const raw = ([lon, lat]) => [(lon > 0 ? lon - 360 : lon) * factor, -lat];
  const points = features.flatMap(f => polygons(f.geometry).flat(2)).map(raw);
  const xs = points.map(p => p[0]), ys = points.map(p => p[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const [left, top, width, height] = box;
  const scale = Math.min(width / (maxX - minX), height / (maxY - minY));
  return coordinate => {
    const [x, y] = raw(coordinate);
    return [left + width / 2 + (x - (minX + maxX) / 2) * scale, top + height / 2 + (y - (minY + maxY) / 2) * scale];
  };
}

function buildMap(type, data) {
  const svg = document.getElementById(`${type}-map`);
  const features = data.features.filter(f => f.geometry && (type !== "world" || f.properties.ADM0_A3 !== "ATA"));
  const width = type === "china" ? 900 : 960;
  const height = type === "china" ? 540 : 450;
  const coordinates = features.flatMap(f => polygons(f.geometry).flat(2));
  const factor = type === "china" ? Math.cos(35 * Math.PI / 180) : 1;
  const raw = ([lon, lat]) => [lon * factor, -lat];
  const points = coordinates.map(raw);
  const xs = points.map(p => p[0]);
  const ys = points.map(p => p[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const padding = type === "china" ? 30 : 18;
  const scale = Math.min((width - padding * 2) / (maxX - minX), (height - padding * 2) / (maxY - minY));
  const project = coordinate => {
    const [x, y] = raw(coordinate);
    return [(x - (minX + maxX) / 2) * scale + width / 2, (y - (minY + maxY) / 2) * scale + height / 2];
  };
  const regions = new Map();
  const pins = svgElement("g", { "aria-hidden": "true" });
  let usProjects;
  if (type === "usa") {
    usProjects = {
      mainland: fitUSGroup(features.filter(f => !["AK", "HI"].includes(f.properties.postal)), [50, 20, 860, 350], .8),
      AK: fitUSGroup(features.filter(f => f.properties.postal === "AK"), [65, 397, 225, 135], .55),
      HI: fitUSGroup(features.filter(f => f.properties.postal === "HI"), [360, 433, 150, 75], .94),
    };
    for (const [x, y, w, h, label] of [[35, 378, 285, 170, "ALASKA"], [335, 405, 200, 135, "HAWAII"]]) {
      svg.append(svgElement("rect", { x, y, width: w, height: h, class: "map-inset", "aria-hidden": "true" }));
      const text = svgElement("text", { x: x + 10, y: y + 18, class: "map-inset-label", "aria-hidden": "true" });
      text.textContent = label;
      svg.append(text);
    }
  }
  for (const feature of features) {
    const info = regionInfo(feature, type);
    const regionProject = type === "usa" ? (usProjects[info.id] || usProjects.mainland) : project;
    const d = polygons(feature.geometry).map(polygon => polygon.map(ring => ring.map((coordinate, i) => {
      const [x, y] = regionProject(coordinate);
      return `${i ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`;
    }).join(" ") + "Z").join(" ")).join(" ");
    const path = svgElement("path", { d, class: info.name ? "map-region" : "map-decoration", "fill-rule": "evenodd" });
    if (info.name) {
      path.dataset.id = info.id;
      path.setAttribute("tabindex", "0");
      path.setAttribute("role", "button");
      const title = svgElement("title");
      path.append(title);
      const select = () => selectRegion(type, info.id);
      path.addEventListener("click", select);
      path.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") { event.preventDefault(); select(); }
      });
      regions.set(info.id, { ...info, path, title });
    } else path.setAttribute("aria-hidden", "true");
    svg.append(path);
  }
  svg.append(pins);
  maps[type] = { regions, pins, project };
}

function selectRegion(type, id) {
  const region = maps[type].regions.get(id);
  if (editing) {
    const selected = new Set(visited[type]);
    if (selected.has(id)) selected.delete(id); else selected.add(id);
    visited[type] = [...selected];
    refresh();
    document.getElementById("editor-status").textContent = "Preview changed. Download travel.json to keep your changes.";
  }
  for (const item of maps[type].regions.values()) item.path.classList.toggle("selected", item.id === id);
  document.getElementById(`${type}-selection`).textContent = `${region.name}${region.local ? ` / ${region.local}` : ""} — ${visited[type].includes(id) ? "Visited" : "Not marked"}`;
}

function refresh() {
  for (const type of mapTypes) {
    const { regions, pins, project } = maps[type];
    const selected = new Set(visited[type]);
    pins.replaceChildren();
    for (const region of regions.values()) {
      const active = selected.has(region.id);
      region.path.classList.toggle("visited", active);
      region.path.setAttribute("aria-label", `${region.name}: ${active ? "visited" : "not marked"}`);
      if (editing) region.path.setAttribute("aria-pressed", String(active));
      region.title.textContent = `${region.name} — ${active ? "Visited" : "Not marked"}`;
      // Pins make small province-level regions such as Shanghai easier to find.
      if (type === "china" && active && region.center && ["310000", "810000", "820000"].includes(region.id)) {
        const [x, y] = project(region.center);
        pins.append(svgElement("circle", { cx: x, cy: y, r: 4, class: "map-pin" }));
        const label = svgElement("text", { x: x + 9, y: y - 9, class: "map-pin-label" });
        label.textContent = region.name;
        pins.append(label);
      }
    }
    const count = selected.size;
    document.getElementById(`${type}-count`).textContent = type === "usa" ? `${count} states / districts visited` : type === "china" ? `${count} ${count === 1 ? "region" : "regions"} visited` : `${count} ${count === 1 ? "country / region" : "countries / regions"} visited`;
    const list = document.getElementById(`${type}-places`);
    list.replaceChildren();
    for (const id of selected) {
      const region = regions.get(id);
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "place-chip";
      chip.textContent = `${region.name}${type === "china" ? ` · ${region.local}` : ""}`;
      chip.addEventListener("click", () => { selectRegion(type, id); region.path.focus({ preventScroll: true }); });
      list.append(chip);
    }
    if (!count) {
      const empty = document.createElement("p");
      empty.className = "places-empty";
      empty.textContent = "No places marked yet. More adventures to come.";
      list.append(empty);
    }
  }
  document.querySelectorAll(".place-option input").forEach(input => {
    input.checked = visited[input.dataset.map].includes(input.value);
  });
}

function validate(value) {
  if (!value || typeof value !== "object") throw new Error("Choose a valid travel.json file.");
  const clean = {};
  value = { usa: [], ...value }; // Older exported files have only China and world lists.
  for (const type of mapTypes) {
    if (!Array.isArray(value[type])) throw new Error(`Missing ${type} list.`);
    if (value[type].some(id => typeof id !== "string" || !maps[type].regions.has(id))) throw new Error(`Unknown place in the ${type} list.`);
    clean[type] = [...new Set(value[type])];
  }
  return clean;
}

function setupEditor() {
  const options = document.getElementById("place-options");
  for (const type of mapTypes) {
    for (const region of maps[type].regions.values()) {
      const label = document.createElement("label");
      label.className = "place-option";
      const input = document.createElement("input");
      input.type = "checkbox";
      input.value = region.id;
      input.dataset.map = type;
      const text = document.createElement("span");
      text.textContent = `${region.name}${region.local ? ` / ${region.local}` : ""} (${type === "usa" ? "USA" : type === "china" ? "China" : "World"})`;
      label.dataset.search = `${text.textContent} ${region.id}`.toLowerCase();
      input.addEventListener("change", () => selectRegion(type, region.id));
      label.append(input, text);
      options.append(label);
    }
  }
  document.getElementById("place-search").addEventListener("input", event => {
    const query = event.target.value.trim().toLowerCase();
    options.querySelectorAll("label").forEach(label => { label.hidden = !label.dataset.search.includes(query); });
  });
  document.getElementById("download-travel").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(visited, null, 2) + "\n"], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "travel.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    document.getElementById("editor-status").textContent = "File downloaded. Replace data/travel.json in your project, then publish your changes to update the live site.";
  });
  document.getElementById("reset-travel").addEventListener("click", () => {
    visited = structuredClone(saved);
    refresh();
    for (const type of mapTypes) {
      maps[type].regions.forEach(region => region.path.classList.remove("selected"));
      document.getElementById(`${type}-selection`).textContent = "Saved places restored.";
    }
    document.getElementById("editor-status").textContent = "Preview reset to the saved file.";
  });
  document.getElementById("import-travel").addEventListener("change", async event => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      visited = validate(JSON.parse(await file.text()));
      refresh();
      document.getElementById("editor-status").textContent = "Imported for preview. Download the file when you are done editing.";
    } catch (error) {
      document.getElementById("editor-status").textContent = `Import failed: ${error.message}`;
    }
    event.target.value = "";
  });
  document.querySelectorAll(".editor-actions button, #import-travel").forEach(control => { control.disabled = false; });
  document.getElementById("editor-status").textContent = "Saved places loaded. Ready to edit.";
  for (const type of mapTypes) document.getElementById(`${type}-map-help`).textContent = "Click a region to add or remove it from your travel map.";
}

async function loadJSON(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Unable to load ${path}`);
  return response.json();
}

Promise.all([loadJSON("data/maps/china.json"), loadJSON("data/maps/world.json"), loadJSON("data/maps/usa.json"), loadJSON("data/travel.json")])
  .then(([china, world, usa, config]) => {
    buildMap("china", china);
    buildMap("world", world);
    buildMap("usa", usa);
    saved = validate(config);
    visited = structuredClone(saved);
    if (editing) setupEditor();
    refresh();
  })
  .catch(error => {
    const message = document.getElementById("travel-error");
    message.hidden = false;
    message.textContent = "The travel maps could not be loaded. Please refresh to try again.";
    for (const type of mapTypes) document.getElementById(`${type}-count`).textContent = "Unavailable";
    if (editing) document.getElementById("editor-status").textContent = `Unable to edit: ${error.message}`;
    console.error(error);
  });
