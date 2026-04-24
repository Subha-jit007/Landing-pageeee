// Editor runtime that is injected into the preview iframe. It wires up
// hover, click-to-edit, inline text editing, and section-level commands,
// and speaks to the parent via postMessage. Kept as a single string so
// we can inject it into the generated HTML and strip it before saving.

export const EDITOR_RUNTIME_MARKER_ID = "__pf_editor_runtime__";
export const EDITOR_STYLE_MARKER_ID = "__pf_editor_style__";

const RUNTIME_SOURCE = String.raw`
(function(){
  if (window.__pfEditorMounted) return;
  window.__pfEditorMounted = true;

  var PARENT_ORIGIN = "*";
  var TEXT_TAGS = {H1:1,H2:1,H3:1,H4:1,H5:1,H6:1,P:1,SPAN:1,A:1,BUTTON:1,LI:1,STRONG:1,EM:1,LABEL:1};

  var selected = null;
  var hovered = null;
  var dirtyTimer = null;
  var suppressClickUntil = 0;

  function send(type, payload){
    try { parent.postMessage(Object.assign({ __pf:"child", type: type }, payload||{}), PARENT_ORIGIN); } catch(e){}
  }

  function isTextEl(el){
    if (!el || !el.tagName) return false;
    if (!TEXT_TAGS[el.tagName]) return false;
    if (el.children && el.children.length > 0) return false;
    var txt = (el.textContent||"").trim();
    return txt.length > 0;
  }

  function findSection(el){
    var n = el;
    while (n && n !== document.body) {
      if (n.dataset && n.dataset.section) return n;
      n = n.parentElement;
    }
    return null;
  }

  function pathOf(el){
    var parts = [];
    var n = el;
    while (n && n.parentElement && n !== document.body && n !== document.documentElement) {
      var parent = n.parentElement;
      var idx = Array.prototype.indexOf.call(parent.children, n);
      parts.unshift(idx);
      n = parent;
    }
    return parts.join(",");
  }

  function elByPath(path){
    if (!path) return null;
    var ids = path.split(",").map(function(x){ return parseInt(x,10); });
    var n = document.body;
    for (var i=0; i<ids.length; i++) {
      if (!n || !n.children || !n.children[ids[i]]) return null;
      n = n.children[ids[i]];
    }
    return n;
  }

  function rectOf(el){
    var r = el.getBoundingClientRect();
    return { x:r.left, y:r.top, w:r.width, h:r.height };
  }

  function info(el){
    if (!el) return null;
    var section = findSection(el);
    return {
      path: pathOf(el),
      tag: el.tagName,
      isText: isTextEl(el),
      isSection: !!(el.dataset && el.dataset.section),
      sectionName: section ? section.dataset.section : null,
      sectionPath: section ? pathOf(section) : null,
      rect: rectOf(el),
      sectionRect: section ? rectOf(section) : null,
      href: el.tagName === "A" ? (el.getAttribute("href") || "") : null,
      src:  el.tagName === "IMG" ? (el.getAttribute("src") || "") : null,
    };
  }

  function clearHover(){
    if (hovered) { hovered.classList.remove("__pf-hover"); hovered = null; }
  }
  function clearSelected(){
    if (selected) {
      selected.classList.remove("__pf-selected");
      selected.removeAttribute("contenteditable");
      selected = null;
    }
  }

  function markDirty(){
    if (dirtyTimer) clearTimeout(dirtyTimer);
    dirtyTimer = setTimeout(function(){ send("dirty", {}); }, 180);
  }

  function pickTarget(el){
    if (isTextEl(el)) return el;
    if (el && el.tagName === "IMG") return el;
    var s = findSection(el);
    return s || el;
  }

  function selectEl(el){
    if (!el) return;
    clearSelected();
    selected = el;
    el.classList.add("__pf-selected");
    if (isTextEl(el)) {
      el.setAttribute("contenteditable", "true");
      // Put caret at end so typing continues naturally.
      try {
        var range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        el.focus();
      } catch(e){}
    }
    send("select", { info: info(el) });
  }

  function deselect(){
    if (selected) {
      clearSelected();
      send("deselect", {});
    }
  }

  document.addEventListener("mouseover", function(e){
    var host = pickTarget(e.target);
    if (!host) return;
    if (hovered === host) return;
    clearHover();
    if (host !== selected) host.classList.add("__pf-hover");
    hovered = host;
    send("hover", { info: info(host) });
  }, true);

  document.addEventListener("mouseout", function(e){
    if (!e.relatedTarget) { clearHover(); send("hoverEnd", {}); }
  }, true);

  document.addEventListener("mousedown", function(e){
    // Swallow left-click navigation while editing.
    if (e.button === 0) suppressClickUntil = Date.now() + 300;
  }, true);

  document.addEventListener("click", function(e){
    if (Date.now() < suppressClickUntil) { e.preventDefault(); }
    // Ignore clicks that come from our own contenteditable typing caret placement.
    var target = pickTarget(e.target);
    if (!target) return;
    e.preventDefault();
    e.stopPropagation();
    selectEl(target);
  }, true);

  document.addEventListener("input", function(e){
    if (selected && selected.contains(e.target)) markDirty();
  }, true);

  document.addEventListener("keydown", function(e){
    // Forward undo/redo to parent so we share one history stack.
    var meta = e.ctrlKey || e.metaKey;
    if (meta && (e.key === "z" || e.key === "Z")) {
      if (e.shiftKey) send("redoKey", {}); else send("undoKey", {});
      e.preventDefault(); return;
    }
    if (meta && (e.key === "y" || e.key === "Y")) { send("redoKey", {}); e.preventDefault(); return; }
    if (e.key === "Escape") {
      if (selected) { try { selected.blur(); } catch(_){ } deselect(); }
      return;
    }
    if (e.key === "Delete" || e.key === "Backspace") {
      // Only treat as section-delete when a non-text section is selected.
      if (selected && !isTextEl(selected) && selected.dataset && selected.dataset.section) {
        e.preventDefault();
        send("requestDelete", { path: pathOf(selected) });
      }
    }
  }, true);

  var repositionRaf = 0;
  function scheduleReposition(){
    if (repositionRaf) return;
    repositionRaf = requestAnimationFrame(function(){
      repositionRaf = 0;
      if (selected) send("reposition", { info: info(selected) });
      if (hovered)  send("hoverMove", { info: info(hovered) });
    });
  }
  window.addEventListener("scroll", scheduleReposition, true);
  window.addEventListener("resize", scheduleReposition, true);

  window.addEventListener("message", function(e){
    var m = e.data;
    if (!m || m.__pf !== "parent") return;

    switch (m.type) {
      case "deselect": deselect(); break;

      case "deleteSection": {
        var el = elByPath(m.path);
        if (el) { el.remove(); deselect(); markDirty(); }
        break;
      }
      case "moveSection": {
        var el2 = elByPath(m.path);
        if (!el2 || !el2.parentElement) break;
        if (m.dir === "up" && el2.previousElementSibling) {
          el2.parentElement.insertBefore(el2, el2.previousElementSibling);
        } else if (m.dir === "down" && el2.nextElementSibling) {
          el2.parentElement.insertBefore(el2.nextElementSibling, el2);
        }
        // Re-select to refresh rect.
        selectEl(el2);
        markDirty();
        break;
      }
      case "duplicateSection": {
        var el3 = elByPath(m.path);
        if (!el3 || !el3.parentElement) break;
        var clone = el3.cloneNode(true);
        el3.parentElement.insertBefore(clone, el3.nextElementSibling);
        selectEl(clone);
        markDirty();
        break;
      }
      case "formatText": {
        if (!selected || !isTextEl(selected)) break;
        try { document.execCommand(m.cmd, false, m.value || null); } catch(_){}
        markDirty();
        break;
      }
      case "setHref": {
        var el4 = elByPath(m.path);
        if (el4 && el4.tagName === "A") { el4.setAttribute("href", m.value||"#"); markDirty(); }
        break;
      }
      case "setSrc": {
        var el5 = elByPath(m.path);
        if (el5 && el5.tagName === "IMG") { el5.setAttribute("src", m.value||""); markDirty(); }
        break;
      }
      case "getHtml": {
        send("html", { requestId: m.requestId, html: serialize() });
        break;
      }
      case "reselect": {
        var rs = elByPath(m.path);
        if (rs) selectEl(rs);
        break;
      }
    }
  });

  function serialize(){
    clearHover();
    var clone = document.documentElement.cloneNode(true);
    // Strip editor artifacts
    var drop = clone.querySelectorAll("#` + EDITOR_STYLE_MARKER_ID + `, #` + EDITOR_RUNTIME_MARKER_ID + `");
    for (var i=0; i<drop.length; i++) drop[i].parentNode.removeChild(drop[i]);
    var ces = clone.querySelectorAll("[contenteditable]");
    for (var j=0; j<ces.length; j++) ces[j].removeAttribute("contenteditable");
    var hv = clone.querySelectorAll(".__pf-hover, .__pf-selected");
    for (var k=0; k<hv.length; k++) {
      hv[k].classList.remove("__pf-hover");
      hv[k].classList.remove("__pf-selected");
      if (hv[k].getAttribute("class") === "") hv[k].removeAttribute("class");
    }
    return "<!DOCTYPE html>\n" + clone.outerHTML;
  }

  // Install style sheet for editor chrome.
  var style = document.getElementById("` + EDITOR_STYLE_MARKER_ID + `");
  if (!style) {
    style = document.createElement("style");
    style.id = "` + EDITOR_STYLE_MARKER_ID + `";
    style.textContent = [
      "html, body { cursor: default; }",
      ".__pf-hover { outline: 2px solid rgba(99,102,241,.55) !important; outline-offset: 2px; cursor: pointer; }",
      ".__pf-selected { outline: 2px solid rgb(99,102,241) !important; outline-offset: 2px; }",
      "[contenteditable='true'] { cursor: text; }",
      "[contenteditable='true']:focus { outline: 2px solid rgb(99,102,241) !important; background: rgba(99,102,241,.06); }",
      "a { pointer-events: auto; }"
    ].join("\n");
    document.head.appendChild(style);
  }

  send("ready", {});
})();
`;

export function injectEditorRuntime(html: string): string {
  if (!html) return html;
  const marker = `<script id="${EDITOR_RUNTIME_MARKER_ID}">${RUNTIME_SOURCE}</script>`;
  if (html.includes(`id="${EDITOR_RUNTIME_MARKER_ID}"`)) return html;
  if (/<\/body>/i.test(html)) return html.replace(/<\/body>/i, `${marker}</body>`);
  return html + marker;
}

export function stripEditorRuntime(html: string): string {
  if (!html) return html;
  return html
    .replace(new RegExp(`<script id="${EDITOR_RUNTIME_MARKER_ID}"[\\s\\S]*?<\\/script>`, "i"), "")
    .replace(new RegExp(`<style id="${EDITOR_STYLE_MARKER_ID}"[\\s\\S]*?<\\/style>`, "i"), "")
    .replace(/ contenteditable="(?:true|false)"/gi, "")
    .replace(/ class="__pf-(?:hover|selected)"/gi, "")
    .replace(/(class="[^"]*)\s?__pf-(?:hover|selected)/gi, "$1")
    .replace(/class=""/gi, "");
}

export type EditorChildMessage =
  | { __pf: "child"; type: "ready" }
  | { __pf: "child"; type: "select"; info: SelectionInfo }
  | { __pf: "child"; type: "deselect" }
  | { __pf: "child"; type: "hover"; info: SelectionInfo }
  | { __pf: "child"; type: "hoverEnd" }
  | { __pf: "child"; type: "hoverMove"; info: SelectionInfo }
  | { __pf: "child"; type: "reposition"; info: SelectionInfo }
  | { __pf: "child"; type: "dirty" }
  | { __pf: "child"; type: "undoKey" }
  | { __pf: "child"; type: "redoKey" }
  | { __pf: "child"; type: "requestDelete"; path: string }
  | { __pf: "child"; type: "html"; requestId: number; html: string };

export type EditorParentMessage =
  | { __pf: "parent"; type: "deselect" }
  | { __pf: "parent"; type: "deleteSection"; path: string }
  | { __pf: "parent"; type: "moveSection"; path: string; dir: "up" | "down" }
  | { __pf: "parent"; type: "duplicateSection"; path: string }
  | { __pf: "parent"; type: "formatText"; cmd: string; value?: string }
  | { __pf: "parent"; type: "setHref"; path: string; value: string }
  | { __pf: "parent"; type: "setSrc"; path: string; value: string }
  | { __pf: "parent"; type: "getHtml"; requestId: number }
  | { __pf: "parent"; type: "reselect"; path: string };

export interface SelectionInfo {
  path: string;
  tag: string;
  isText: boolean;
  isSection: boolean;
  sectionName: string | null;
  sectionPath: string | null;
  rect: { x: number; y: number; w: number; h: number };
  sectionRect: { x: number; y: number; w: number; h: number } | null;
  href: string | null;
  src: string | null;
}