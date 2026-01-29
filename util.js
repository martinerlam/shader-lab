export function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }

export function showErrorBox(errEl, e){
  const msg = (e && (e.stack || e.message)) ? (e.stack || e.message) : String(e);
  errEl.style.display = "block";
  errEl.textContent = "⚠️ Runtime error:\n" + msg;
  console.error(e);
}

export function safeAddGlobalErrorHandler(errEl){
  addEventListener("error", (ev) => showErrorBox(errEl, ev.error || ev.message));
  addEventListener("unhandledrejection", (ev) => showErrorBox(errEl, ev.reason));
}
