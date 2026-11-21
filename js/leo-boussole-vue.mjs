import { projects as D, parents, route } from "./leo-boussole-projets.mjs";
const GOLD = "#e8bf83",
  BLUE = "#77bafa",
  GREEN = "#a8c77a";
const esc = (s) => s.replaceAll("&", "&amp;").replaceAll("<", "&lt;");
function emblem(id, x, y, s) {
  return D[id].icon.replace(
    "<svg ",
    '<svg x="' + x + '" y="' + y + '" width="' + s + '" height="' + s + '" ',
  );
}
function scene(path) {
  const roots = D.racine.kids,
    sector = 360 / Math.max(1, roots.length);
  const bearing = (i) => (i * sector - sector / 2 + 360) % 360;
  const branch = path[0],
    index = roots.indexOf(branch),
    direction = index < 0 ? 0 : bearing(index);
  const sign = Math.sin((direction * Math.PI) / 180) < 0 ? -1 : 1;
  const colors = { alpha: GOLD, omega: BLUE, althea: GREEN };
  const radius = Math.max(
    216,
    roots.length > 1 ? 145 / (2 * Math.sin(Math.PI / roots.length)) : 0,
  );
  let width = Math.max(1322, 2 * (radius + 100 + path.length * 172)),
    height = Math.max(550, 2 * (radius + 45)),
    c = width / 2,
    cy = height / 2,
    lines = "",
    nodes = "",
    anchors = {};
  function edge(x, y, u, v, color) {
    let m = (x + u) / 2;
    lines +=
      '<path d="M' +
      x +
      " " +
      y +
      " C" +
      m +
      " " +
      y +
      " " +
      m +
      " " +
      v +
      " " +
      u +
      " " +
      v +
      '" fill="none" stroke="' +
      color +
      '" stroke-opacity=".65" stroke-width="1.5"/>';
  }
  function node(id, x, y, color, root = false) {
    let n = D[id],
      active = path.includes(id),
      w = root ? 122 : 154;
    anchors[id] = [x, y];
    nodes +=
      '<g data-id="' +
      id +
      '" role="button" tabindex="0" aria-label="' +
      esc(n.name) +
      '" ' +
      (n.kids.length ? 'aria-expanded="' + active + '"' : "") +
      ' transform="translate(' +
      x +
      " " +
      y +
      ')"><rect x="' +
      -w / 2 +
      '" y="-22" width="' +
      w +
      '" height="44" rx="10" fill="' +
      (active ? "#263341" : "#111c27") +
      '" stroke="' +
      (active ? color : "#384858") +
      '"/>' +
      emblem(id, -w / 2 + 9, -12, 24) +
      '<text x="' +
      (-w / 2 + 40) +
      '" y="4.5" font-size="' +
      (n.name.length > 17 ? 9 : n.name.length > 12 ? 11 : 13) +
      '" fill="#eaeef4">' +
      esc(n.name) +
      "</text></g>";
  }
  let disc = '<circle cx="0" cy="0" r="131" fill="#101c28" stroke="#536173"/>';
  for (let r of [123, 105, 78, 42])
    disc += '<circle r="' + r + '" fill="none" stroke="#374a5c"/>';
  for (let i = 0; i < 120; i++)
    disc +=
      '<path transform="rotate(' +
      i * 3 +
      ')" d="M0 -128v' +
      (i % 10 === 0 ? 11 : i % 2 === 0 ? 6 : 3) +
      '" stroke="' +
      (i % 10 === 0 ? GOLD : "#526071") +
      '"/>';
  for (let i = 0; i < 8; i++) {
    let l = i % 2 ? 65 : 91;
    disc +=
      '<g transform="rotate(' +
      i * 45 +
      ')"><path d="M0 -' +
      l +
      'L14 -14L0 0Z" fill="#546476"/><path d="M0 -' +
      l +
      'L0 0L-14 -14Z" fill="#293a49"/></g>';
  }
  for (let [s, x, y] of [
    ["N", 0, -105],
    ["S", 0, 112],
    ["O", -109, 4],
    ["E", 109, 4],
  ])
    disc +=
      '<text x="' +
      x +
      '" y="' +
      y +
      '" fill="#a1aec0" font-size="10" text-anchor="middle">' +
      s +
      "</text>";
  disc +=
    '<g transform="rotate(' +
    direction +
    ')"><path d="M0 -98L8 0H0Z" fill="' +
    GOLD +
    '"/><path d="M0 -98L-8 0H0Z" fill="#ae8553"/></g><circle r="31" fill="#101a25" stroke="' +
    GOLD +
    '"/><text text-anchor="middle" y="8" font-family="Georgia,serif" font-size="25" fill="' +
    GOLD +
    '">Léo</text>';
  roots.forEach((id, i) => {
    const rad = (bearing(i) * Math.PI) / 180,
      x = c + radius * Math.sin(rad),
      y = cy - radius * Math.cos(rad),
      color = colors[id] || GOLD;
    lines +=
      '<path d="M' +
      c +
      " " +
      cy +
      " L" +
      x +
      " " +
      y +
      '" stroke="' +
      color +
      '" stroke-opacity=".65" stroke-width="1.5"/>';
    node(id, x, y, color, true);
  });
  for (let i = 0; i < path.length; i++) {
    let p = path[i];
    if (!anchors[p]) break;
    let [x, y] = anchors[p],
      kids = D[p].kids,
      col = colors[branch] || GOLD;
    let step = Math.min(68, 428 / Math.max(1, kids.length - 1));
    let top = Math.min(
      Math.max(48, y - (step * (kids.length - 1)) / 2),
      height - 48 - step * (kids.length - 1),
    );
    kids.forEach((k, j) => {
      let u = x + sign * 172,
        v = top + j * step;
      edge(x, y, u, v, col);
      node(k, u, v, col);
    });
  }
  return {
    width,
    height,
    c,
    anchors,
    svg:
      '<svg xmlns="http://www.w3.org/2000/svg" width="' +
      width +
      '" height="' +
      height +
      '" viewBox="0 0 ' +
      width +
      " " +
      height +
      '" style="font-family:Arial,sans-serif"><rect width="100%" height="100%" fill="#0d1620"/>' +
      lines +
      '<g transform="translate(' +
      c +
      " " +
      cy +
      ')">' +
      disc +
      "</g>" +
      nodes +
      "</svg>",
  };
}

const map = document.querySelector(".map"),
  mobile = document.querySelector(".mobile"),
  out = document.querySelector("output");
let path = ["alpha", "renoboost-ia"];
function fiche(id) {
  const n = D[id || "racine"];
  const put = (k, v) => (document.getElementById(k).textContent = v || "");
  put("title", n.name);
  put("summary", n.summary);
  put(
    "state",
    n.date
      ? n.state + " · Finubar du " + n.date.split("-").reverse().join("/")
      : n.state,
  );
  put("milestone", n.milestone);
  const a = document.getElementById("source");
  a.href = n.url;
  a.textContent = n.source + " ↗";
}
function render(id, focus = false) {
  fiche(id);
  let dir = route(id),
    next = D[id]?.kids.length ? dir : dir.slice(0, -1);
  let s = scene(next);
  let same = String(next) === String(path);
  path = next;
  if (!same || !map.firstChild?.style.width) {
    let old = map.querySelector("svg"),
      oldW = parseFloat(old?.style.width) || map.clientWidth,
      sc = map.scrollLeft;
    map.innerHTML = s.svg;
    let svg = map.firstChild,
      scale = Math.min(map.clientWidth / 1322, 1.25);
    svg.style.width = s.width * scale + "px";
    svg.style.height = "auto";
    svg.style.margin = "auto";
    map.scrollLeft = sc + (s.width * scale - oldW) / 2;
  }
  let el = id && map.querySelector('[data-id="' + id + '"]');
  if (el) {
    if (focus) el.focus({ preventScroll: true });
    let b = el.getBoundingClientRect(),
      r = map.getBoundingClientRect();
    if (b.left < r.left + 70 || b.right > r.right - 70)
      map.scrollLeft += b.left - r.left + (b.width - r.width) / 2;
  }
  out.textContent = ["Ultima", ...dir.map((k) => D[k].name)].join("  ›  ");
}
map.onpointerover = (e) => {
  let g = e.target.closest("[data-id]");
  if (g && e.pointerType === "mouse" && !g.contains(e.relatedTarget))
    render(g.dataset.id);
};
map.onclick = (e) => {
  let g = e.target.closest("[data-id]");
  if (g) openProject(g.dataset.id);
};
map.onkeydown = (e) => {
  let g = e.target.closest("[data-id]");
  if (!g) return;
  if (["Enter", " "].includes(e.key)) {
    e.preventDefault();
    openProject(g.dataset.id);
    return;
  }
  let id = g.dataset.id,
    p = parents[id],
    siblings = D[p].kids,
    i = siblings.indexOf(id),
    dest = {
      ArrowDown: siblings[(i + 1) % siblings.length],
      ArrowUp: siblings[(i + siblings.length - 1) % siblings.length],
      ArrowLeft: p,
      Escape: p,
      ArrowRight: D[id].kids[0],
      Enter: D[id].kids[0] || id,
      " ": id,
    }[e.key];
  if (dest) {
    e.preventDefault();
    render(dest === "racine" ? "alpha" : dest, true);
  }
};
function mobileNode(id) {
  let n = D[id],
    label = n.icon + esc(n.name);
  return n.kids.length
    ? '<details data-key="' +
        id +
        '" ' +
        (path.includes(id) ? "open" : "") +
        "><summary>" +
        label +
        '</summary><div class="nest">' +
        n.kids.map(mobileNode).join("") +
        "</div></details>"
    : '<button class="leaf" data-key="' + id + '">' + label + "</button>";
}
function drawMobile() {
  const base = scene([]),
    half = base.height / 2 + 12;
  const ring = base.svg.replace(
    /width="[^"]+" height="[^"]+" viewBox="[^"]+"/,
    'width="100%" height="100%" viewBox="' +
      (base.c - half) +
      " -12 " +
      2 * half +
      " " +
      2 * half +
      '"',
  );
  mobile.innerHTML =
    '<div class="mini">' +
    ring +
    "</div>" +
    D.racine.kids.map(mobileNode).join("");
  mobile.querySelectorAll(".mini [data-id]").forEach((g) => {
    const open = () => {
      let id = g.dataset.id,
        entry = mobile.querySelector('[data-key="' + id + '"]');
      if (entry.tagName === "DETAILS") entry.open = true;
      fiche(id);
      out.textContent = "Ultima › " + D[id].name;
      entry.querySelector("summary")?.focus();
    };
    g.onclick = open;
    g.onkeydown = (e) => {
      if (["Enter", " "].includes(e.key)) {
        e.preventDefault();
        open();
      }
    };
  });
}
mobile.onclick = (e) => {
  const n = e.target.closest("[data-key]");
  if (n) {
    e.preventDefault();
    openProject(n.dataset.key);
  }
};
function childrenOf(id) {
  return D[id].kids;
}
function orbit(id, compact = false) {
  const project = D[id],
    children = childrenOf(id),
    cx = compact ? 185 : 500,
    cy = compact ? 190 : 255,
    r = compact ? 116 : 163;
  const width = 2 * cx,
    height = 2 * cy,
    cardWidth = compact ? 94 : 156;
  const tone =
    route(id)[0] === "omega" ? BLUE : route(id)[0] === "althea" ? GREEN : GOLD;
  const widgets = children.map((child, i) => {
    const a = (i * 2 * Math.PI) / children.length - Math.PI / 2;
    return { child, x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  });
  let svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' +
    width +
    " " +
    height +
    '" style="font-family:Arial,sans-serif"><rect width="100%" height="100%" fill="#0d1620"/>';
  if (children.length)
    svg +=
      '<circle cx="' +
      cx +
      '" cy="' +
      cy +
      '" r="' +
      r +
      '" fill="none" stroke="#344352" stroke-dasharray="2 7"/>';
  for (const { x, y } of widgets)
    svg +=
      '<path d="M' + cx + " " + cy + "L" + x + " " + y + '" stroke="#526173"/>';
  const med = compact ? 52 : 76;
  svg +=
    '<circle cx="' +
    cx +
    '" cy="' +
    cy +
    '" r="' +
    (med + 7) +
    '" fill="none" stroke="#394957"/><circle cx="' +
    cx +
    '" cy="' +
    cy +
    '" r="' +
    med +
    '" fill="#192735" stroke="' +
    tone +
    '"/>' +
    emblem(id, cx - 19, cy - 29, 38) +
    '<text text-anchor="middle" x="' +
    cx +
    '" y="' +
    (cy + 27) +
    '" fill="#f0dfc7" font-size="' +
    Math.min(compact ? 15 : 22, (med * 2) / (project.name.length * 0.68)) +
    '" font-family="Georgia,serif">' +
    esc(project.name) +
    "</text>";
  for (const { child, x, y } of widgets) {
    const n = D[child],
      w = cardWidth,
      size = Math.min(compact ? 12 : 15, (w - 12) / (n.name.length * 0.63));
    svg +=
      '<g data-open="' +
      child +
      '" tabindex="0" role="button" aria-label="' +
      esc(n.name) +
      '" transform="translate(' +
      x +
      " " +
      y +
      ')"><rect x="' +
      -w / 2 +
      '" y="-25" width="' +
      w +
      '" height="50" rx="10" fill="#162330" stroke="#566371"/>' +
      emblem(child, -9, -21, 18) +
      '<text text-anchor="middle" y="15" font-size="' +
      size +
      '" fill="#eaeef4">' +
      esc(n.name) +
      "</text></g>";
  }
  return svg + "</svg>";
}

const zoom = document.querySelector("#zoom"),
  frame = document.querySelector(".frame"),
  ret = document.querySelector("#ret"),
  hint = document.querySelector("#hint");
let historyIds = [],
  overviewBranch = null;
function fit() {
  if (historyIds.length) {
    showProject(historyIds.at(-1));
    return;
  }
  if (map.firstChild) map.firstChild.style.width = "";
  render(path.at(-1) || null);
  drawMobile();
  hint.textContent = matchMedia("(max-width:700px)").matches
    ? "Touche un projet pour le placer au centre."
    : "Survole une branche pour la déployer. Clique sur un projet pour le placer au centre.";
}
function showProject(id) {
  document.getElementById("select-cap").hidden = false;
  frame.classList.add("focused");
  zoom.hidden = false;
  ret.hidden = false;
  zoom.innerHTML = orbit(id, matchMedia("(max-width:700px)").matches);
  fiche(id);
  out.textContent = ["Ultima", ...route(id).map((k) => D[k].name)].join(
    "  ›  ",
  );
  hint.textContent = childrenOf(id).length
    ? "Choisis une branche pour explorer son écosystème."
    : "Ce projet est le dernier niveau documenté. Sa fiche figure sous la carte.";
}
function openProject(id) {
  if (!historyIds.length) overviewBranch = id;
  historyIds.push(id);
  showProject(id);
  zoom.tabIndex = -1;
  zoom.focus({ preventScroll: true });
}
function overview(id) {
  document.getElementById("select-cap").hidden = true;
  historyIds = [];
  frame.classList.remove("focused");
  zoom.hidden = true;
  ret.hidden = true;
  render(id);
  fit();
  if (id) render(id, true);
}
ret.onclick = () => {
  historyIds.pop();
  if (historyIds.length) {
    showProject(historyIds.at(-1));
    ret.focus();
  } else overview(overviewBranch);
};
document.querySelector("#home").onclick = () => overview(null);
zoom.onclick = (e) => {
  const node = e.target.closest("[data-open]");
  if (node) openProject(node.dataset.open);
};
document.addEventListener("keydown", (e) => {
  if (!historyIds.length) return;
  if (e.key === "Escape") {
    e.preventDefault();
    ret.click();
  } else if (
    ["Enter", " "].includes(e.key) &&
    e.target.closest("[data-open]")
  ) {
    e.preventDefault();
    openProject(e.target.closest("[data-open]").dataset.open);
  }
});
document.getElementById("select-cap").onclick = () => {
  const id = historyIds.at(-1);
  if (id && window.parent !== window)
    window.parent.postMessage({ type: "leo-select-cap", id }, location.origin);
};
fit();
window.addEventListener("resize", fit);
