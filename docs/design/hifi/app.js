/* ── Eureka Game Mode · high-fi prototype · app.js ───────────────────── */

/* ---------- 球球 mascot (pixel art → crisp SVG) ---------- */
const MASCOT = [
  "......oooo......",
  "....oohhhhoo....",
  "...ohhhhhhhho...",
  "..ohhhhhhhhhho..",
  "..obbbbbbbbbbo..",
  ".obbwwbbbbwwbbo.",
  ".obbwpbbbbwpbbo.",
  ".obbbbbbbbbbbbo.",
  ".obccbbbbbbccbo.",
  ".obbbbmmmmbbbbo.",
  "..obbbbbbbbbbo..",
  "..osbbbbbbbbso..",
  "...osbbbbbbso...",
  "....osssssso....",
  "......oooo......",
];
const PAL = {
  o: "#141a24", b: "var(--brand)", h: "#8fb0f9", s: "#3f68c4",
  w: "#f4f8ff", p: "#141a24", c: "#f7768e", m: "#243049",
};
function mascotSVG(px) {
  const cols = MASCOT[0].length, rows = MASCOT.length;
  let r = "";
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const ch = MASCOT[y][x];
      if (ch === ".") continue;
      r += `<rect x="${x}" y="${y}" width="1.02" height="1.02" style="fill:${PAL[ch]}"/>`;
    }
  }
  return `<svg class="mascot" viewBox="0 0 ${cols} ${rows}" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg">${r}</svg>`;
}
function paintMascots() {
  document.querySelectorAll("[data-mascot]").forEach(el => { el.innerHTML = mascotSVG(); });
}

/* ---------- device scaling ---------- */
function fit() {
  const s = document.getElementById("scaler");
  const m = 24;
  const k = Math.min((innerWidth - m) / 390, (innerHeight - m) / 844);
  s.style.transform = `scale(${k})`;
}
addEventListener("resize", fit);

/* ---------- view swipe ---------- */
const track = document.getElementById("track");
const segs = document.querySelectorAll("#switcher .seg");
let view = parseInt(localStorage.getItem("eu_view") || "1", 10); // 0时间 1Session 2资产
let dragX = 0, startX = 0, startY = 0, dragging = false, locked = null;

function setView(i, animate = true) {
  view = Math.max(0, Math.min(2, i));
  localStorage.setItem("eu_view", view);
  track.classList.toggle("dragging", !animate);
  track.style.transform = `translateX(${-view * (100 / 3)}%)`;
  segs.forEach((s, k) => s.classList.toggle("on", k === view));
  // chat bar only on Session view
  document.getElementById("chatbar").classList.toggle("hidden", view !== 1);
}
function onDown(e) {
  if (e.target.closest("#pet,.pet-menu,.drawer,.scrim,.overlay,.detail,.listen,.headbar,.chatbar,.cbox,.tasks-head,.cal-cell,.cat,.card,.today-pill,.iconbtn,.subtab,.ymon,.ts-chip")) return;
  dragging = true; locked = null;
  const p = e.touches ? e.touches[0] : e;
  startX = p.clientX; startY = p.clientY;
  track.classList.add("dragging");
}
function onMove(e) {
  if (!dragging) return;
  const p = e.touches ? e.touches[0] : e;
  const dx = p.clientX - startX, dy = p.clientY - startY;
  if (locked === null) {
    if (Math.abs(dx) > 8 || Math.abs(dy) > 8) locked = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
  }
  if (locked === "x") {
    e.preventDefault();
    dragX = dx;
    const base = -view * (100 / 3);
    const pct = base + (dx / 390) * (100 / 3);
    track.style.transform = `translateX(${pct}%)`;
  }
}
function onUp() {
  if (!dragging) return;
  dragging = false;
  if (locked === "x") {
    if (dragX < -54 && view < 2) setView(view + 1);
    else if (dragX > 54 && view > 0) setView(view - 1);
    else setView(view);
  }
  dragX = 0;
}
track.addEventListener("mousedown", onDown);
addEventListener("mousemove", onMove, { passive: false });
addEventListener("mouseup", onUp);
track.addEventListener("touchstart", onDown, { passive: true });
addEventListener("touchmove", onMove, { passive: false });
addEventListener("touchend", onUp);
segs.forEach((s, k) => s.addEventListener("click", () => setView(k)));

/* ---------- theme toggle (day / night) ---------- */
const moonIco = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const sunIco = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.4 1.4M17.6 17.6 19 19M19 5l-1.4 1.4M6.4 17.6 5 19" stroke-linecap="round"/></svg>';
const notifIco = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const themeBtn = document.getElementById("themeBtn");
const notifBtn = document.getElementById("notifBtn");
notifBtn.insertAdjacentHTML("afterbegin", notifIco);
let theme = localStorage.getItem("eu_theme") || "dark";
function applyTheme() {
  document.documentElement.setAttribute("data-theme", theme === "light" ? "light" : "");
  themeBtn.innerHTML = theme === "light" ? sunIco : moonIco;
}
themeBtn.addEventListener("click", () => {
  theme = theme === "light" ? "dark" : "light";
  localStorage.setItem("eu_theme", theme);
  applyTheme();
});
applyTheme();

/* ---------- time sub-views (流 / 月 / 年) ---------- */
const timeTabs = document.querySelectorAll("#timeTabs .subtab");
const tPanels = { 0: "tp-stream", 1: "tp-month", 2: "tp-year" };
let tSub = parseInt(localStorage.getItem("eu_tsub") || "1", 10);
function setTimeSub(i) {
  tSub = i; localStorage.setItem("eu_tsub", i);
  timeTabs.forEach((t, k) => t.classList.toggle("on", k === i));
  Object.entries(tPanels).forEach(([k, id]) => document.getElementById(id).classList.toggle("on", +k === i));
}
timeTabs.forEach((t, k) => t.addEventListener("click", () => setTimeSub(k)));
setTimeSub(tSub);

/* year heatmap */
(function buildYear() {
  const grid = document.getElementById("yearGrid");
  if (!grid) return;
  const months = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];
  const cur = 5; // June (0-indexed)
  let seed = 7;
  const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  let html = "";
  for (let m = 0; m < 12; m++) {
    let cells = "";
    for (let d = 0; d < 35; d++) {
      let cls = "";
      if (m < cur || (m === cur && d <= 1)) {
        const r = rnd();
        if (r > 0.82) cls = "l3"; else if (r > 0.6) cls = "l2"; else if (r > 0.35) cls = "l1";
      }
      cells += `<i class="${cls}"></i>`;
    }
    html += `<div class="ymon ${m === cur ? "cur" : ""}"><div class="ym-t">${months[m]}</div><div class="ym-cells">${cells}</div></div>`;
  }
  grid.innerHTML = html;
  grid.querySelectorAll(".ymon").forEach(el => el.addEventListener("click", () => setTimeSub(1)));
})();

/* ---------- tasks collapse ---------- */
document.querySelectorAll(".tasks-head").forEach(h =>
  h.addEventListener("click", () => h.parentElement.classList.toggle("open")));
document.querySelectorAll(".cbox").forEach(b =>
  b.addEventListener("click", e => {
    e.stopPropagation();
    const t = b.closest(".task"); t.classList.toggle("done"); b.classList.toggle("on");
    updateProgress();
  }));
function updateProgress() {
  const tasks = document.querySelectorAll("#sessionTasks .task");
  const done = [...tasks].filter(t => t.classList.contains("done")).length;
  const frac = document.getElementById("taskFrac");
  const bar = document.getElementById("taskBar");
  if (frac) frac.textContent = `${done}/${tasks.length}`;
  if (bar) bar.style.width = (done / tasks.length * 100) + "%";
}

/* ---------- drawer ---------- */
const scrim = document.getElementById("scrim"), drawer = document.getElementById("drawer");
function openDrawer() { scrim.classList.add("show"); drawer.classList.add("show"); }
function closeDrawer() { scrim.classList.remove("show"); drawer.classList.remove("show"); }
document.querySelectorAll("[data-drawer]").forEach(b => b.addEventListener("click", openDrawer));
document.getElementById("drawerX").addEventListener("click", closeDrawer);
scrim.addEventListener("click", closeDrawer);

/* ---------- collection overlay ---------- */
const coll = document.getElementById("collection");
document.querySelectorAll("[data-cat]").forEach(c => c.addEventListener("click", () => {
  const name = c.getAttribute("data-cat"), n = c.getAttribute("data-count");
  document.getElementById("collTitle").textContent = name;
  document.getElementById("collSub").textContent = n + " 条";
  coll.classList.add("show");
}));
document.getElementById("collBack").addEventListener("click", () => coll.classList.remove("show"));

/* ---------- pet: drag / tap(menu) / long-press(listen) / detail ---------- */
const pet = document.getElementById("pet");
const petMenu = document.getElementById("petMenu");
const listen = document.getElementById("listen");
const detail = document.getElementById("detail");
let pPos = JSON.parse(localStorage.getItem("eu_pet") || "null") || { x: 300, y: 600 };
function placePet() { pet.style.left = pPos.x + "px"; pet.style.top = pPos.y + "px"; }
placePet();

let pDrag = false, pMoved = false, pOx = 0, pOy = 0, lpTimer = null;
function pdown(e) {
  const p = e.touches ? e.touches[0] : e;
  pDrag = true; pMoved = false;
  const r = pet.getBoundingClientRect(), dev = document.getElementById("scaler").getBoundingClientRect();
  const k = dev.width / 390;
  pOx = (p.clientX - r.left) / k; pOy = (p.clientY - r.top) / k;
  hideMenu();
  lpTimer = setTimeout(() => { if (!pMoved) { listen.classList.add("show"); pet.classList.remove("bobbing"); navigator.vibrate && navigator.vibrate(20); } }, 480);
  e.preventDefault();
}
function pmove(e) {
  if (!pDrag) return;
  const p = e.touches ? e.touches[0] : e;
  const dev = document.getElementById("scaler").getBoundingClientRect();
  const k = dev.width / 390;
  let x = (p.clientX - dev.left) / k - pOx;
  let y = (p.clientY - dev.top) / k - pOy;
  x = Math.max(6, Math.min(x, 390 - 70)); y = Math.max(50, Math.min(y, 844 - 110));
  if (Math.abs(x - pPos.x) > 3 || Math.abs(y - pPos.y) > 3) { pMoved = true; clearTimeout(lpTimer); }
  pPos = { x, y }; placePet();
}
function pup() {
  if (!pDrag) return;
  pDrag = false; clearTimeout(lpTimer);
  if (listen.classList.contains("show")) { setTimeout(() => listen.classList.remove("show"), 50); pet.classList.add("bobbing"); }
  else if (!pMoved) toggleMenu();
  else localStorage.setItem("eu_pet", JSON.stringify(pPos));
}
pet.addEventListener("mousedown", pdown);
addEventListener("mousemove", pmove, { passive: false });
addEventListener("mouseup", pup);
pet.addEventListener("touchstart", pdown, { passive: false });
addEventListener("touchmove", pmove, { passive: false });
addEventListener("touchend", pup);

function toggleMenu() { petMenu.classList.contains("show") ? hideMenu() : showMenu(); }
function showMenu() {
  // position menu above/right of pet, clamped
  let mx = pPos.x + 56, my = pPos.y - 40;
  if (mx + 188 > 384) mx = pPos.x - 188; if (mx < 6) mx = 6;
  if (my + 200 > 820) my = 820 - 200; if (my < 50) my = 50;
  petMenu.style.left = mx + "px"; petMenu.style.top = my + "px";
  petMenu.classList.add("show");
}
function hideMenu() { petMenu.classList.remove("show"); }
document.querySelector(".screen").addEventListener("click", e => {
  if (!e.target.closest("#pet,.pet-menu")) hideMenu();
});
document.querySelector('[data-act="detail"]').addEventListener("click", () => { hideMenu(); detail.classList.add("show"); });
document.querySelector('[data-act="newchat"]').addEventListener("click", () => { hideMenu(); openDrawer(); });
document.getElementById("detailClose").addEventListener("click", () => detail.classList.remove("show"));
document.querySelectorAll("[data-detail-open]").forEach(b => b.addEventListener("click", () => detail.classList.add("show")));

/* ---------- card detail overlay ---------- */
const cardDetail = document.getElementById("cardDetail");
const TYPE_FIELDS = {
  money:  c => [["金额 amount", "¥32.00", "amt"], ["商家 merchant", "Blue Bottle"], ["类别 category", "餐饮"], ["备注 description", c]],
  idea:   c => [["内容 content", c], ["日期 date", "2026-06-02"]],
  note:   c => [["内容 content", c], ["类型 note_type", "conversation_note"], ["日期 date", "2026-06-02"]],
  todo:   c => [["内容 content", c], ["状态 status", "pending"], ["截止 due_date", "2026-06-05"]],
  move:   c => [["内容 content", c], ["类型 note_type", "运动"], ["日期 date", "2026-06-02"]],
  people: c => [["姓名 name", c], ["公司 company", "Eureka"], ["电话 phone", "—"]],
};
const TYPE_NAME = { money: "expense", idea: "idea", note: "note", todo: "todo", move: "note", people: "contact" };
let lastCard = { cls: "money", icon: "¥", title: "咖啡 ¥32" };
function clsOf(el) {
  const m = (el.className.match(/bg-(\w+)/) || [])[1];
  return m || "money";
}
function openCardDetail(cls, icon, title) {
  lastCard = { cls, icon, title };
  const ico = document.getElementById("cdIco");
  ico.className = "cd-ico bg-" + cls; ico.textContent = icon;
  document.getElementById("cdTitle").textContent = title;
  document.getElementById("cdSub").textContent = (TYPE_NAME[cls] || "asset") + " · 6/2 14:20";
  const fields = (TYPE_FIELDS[cls] || TYPE_FIELDS.note)(title);
  document.getElementById("cdFields").innerHTML = fields.map(
    ([l, v, amt]) => `<div class="cd-field"><div class="fl">${l}</div><div class="fv ${amt ? "amt" : ""}">${v}</div></div>`
  ).join("");
  cardDetail.classList.add("show");
}
// delegate clicks on any card / chip / coll-card
document.querySelector(".screen").addEventListener("click", e => {
  const card = e.target.closest(".card");
  if (card && !e.target.closest(".thread")) {
    const ico = card.querySelector(".ctype");
    openCardDetail(clsOf(ico), ico.textContent.trim(), card.querySelector(".ctitle")?.textContent || card.querySelector(".ctag")?.textContent || "资产");
    return;
  }
  const chip = e.target.closest(".ts-chip");
  if (chip) { const i = chip.querySelector(".tc-i"); openCardDetail(clsOf(i), i.textContent.trim(), chip.querySelector(".tc-t").textContent); return; }
  const cc = e.target.closest(".coll-card");
  if (cc) { const d = cc.querySelector(".cc-dot"); openCardDetail(clsOf(d), d.textContent.trim(), cc.querySelector(".cc-text").textContent); return; }
});
document.getElementById("cdBack").addEventListener("click", () => cardDetail.classList.remove("show"));
document.getElementById("cdSource").addEventListener("click", () => { cardDetail.classList.remove("show"); setView(1); });

/* ---------- thread (context session) ---------- */
const thread = document.getElementById("thread");
function openThread(name, sub) {
  if (name) document.getElementById("thName").textContent = name;
  if (sub) document.getElementById("thSub").textContent = sub;
  thread.classList.add("show");
}
document.getElementById("cdChat").addEventListener("click", () => {
  // seed the first context chip with the current asset
  openThread(lastCard.title + " · 追问", "chat · 以资产为 context");
  const first = document.querySelector("#ctxChips .ctx-chip");
  if (first) { first.querySelector(".cc-i").className = "cc-i bg-" + lastCard.cls; first.querySelector(".cc-i").textContent = lastCard.icon; first.querySelector(".cc-t").textContent = lastCard.title; }
});
document.getElementById("thBack").addEventListener("click", () => thread.classList.remove("show"));

/* context chip remove + count */
function refreshCtxCount() {
  const n = document.querySelectorAll("#ctxChips .ctx-chip:not(.add)").length;
  document.getElementById("ctxCount").textContent = n + " 项";
}
document.getElementById("ctxChips").addEventListener("click", e => {
  if (e.target.classList.contains("cc-x")) { e.target.closest(".ctx-chip").remove(); refreshCtxCount(); }
});

/* ---------- asset picker (add context) ---------- */
const picker = document.getElementById("picker"), pickerScrim = document.getElementById("pickerScrim");
function openPicker() { picker.classList.add("show"); pickerScrim.classList.add("show"); }
function closePicker() { picker.classList.remove("show"); pickerScrim.classList.remove("show"); }
document.getElementById("ctxAdd").addEventListener("click", openPicker);
document.getElementById("pickerX").addEventListener("click", closePicker);
pickerScrim.addEventListener("click", closePicker);
document.querySelectorAll("#picker .pk-row").forEach(r => r.addEventListener("click", () => r.classList.toggle("sel")));
document.getElementById("pickerDone").addEventListener("click", () => {
  const add = document.getElementById("ctxAdd");
  document.querySelectorAll("#picker .pk-row.sel").forEach(r => {
    const i = r.querySelector(".pk-i"), t = r.querySelector(".pk-mt").textContent;
    const chip = document.createElement("span");
    chip.className = "ctx-chip";
    chip.innerHTML = `<span class="${i.className}">${i.textContent}</span><span class="cc-t">${t.length > 8 ? t.slice(0, 8) + "…" : t}</span><span class="cc-x">✕</span>`;
    document.getElementById("ctxChips").insertBefore(chip, add);
    r.classList.remove("sel");
  });
  refreshCtxCount();
  closePicker();
});

/* ---------- 回到今天 / drawer session switching ---------- */
const sessionVbar = document.getElementById("sessionVbar");
const sessionCtx = document.getElementById("sessionCtx");
function viewPastDaily(label) {
  sessionVbar.classList.add("past");
  sessionCtx.textContent = label + " · 历史回放 · daily";
  closeDrawer();
}
function backToToday() {
  sessionVbar.classList.remove("past");
  sessionCtx.textContent = "今日闪念 · 周二 6/2 · daily";
}
document.getElementById("backToday").addEventListener("click", backToToday);
// wire drawer rows: daily-history → past mode; thread rows → open thread overlay
document.querySelectorAll("#drawer .srow").forEach(row => {
  row.addEventListener("click", () => {
    const title = row.querySelector(".st").textContent;
    const sub = row.querySelector(".ss").textContent;
    document.querySelectorAll("#drawer .srow").forEach(r => r.classList.remove("active"));
    row.classList.add("active");
    if (sub.startsWith("daily")) {
      if (title.includes("今日")) { backToToday(); closeDrawer(); }
      else viewPastDaily(title);
    } else {
      closeDrawer();
      openThread(title, sub.includes("锚定") ? "chat · 锚定资产" : "chat · 自由线程");
    }
  });
});
document.querySelector("#drawer .new-sess").addEventListener("click", () => { closeDrawer(); openThread("新对话", "chat · 自由线程"); });

/* ---------- boot ---------- */
paintMascots();
fit();
setView(view, false);
updateProgress();
setTimeout(() => track.classList.remove("dragging"), 60);
