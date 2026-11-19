/* Personal nanoMuse setup: NVIDIA NIM credentials go only to the authenticated local API. */
(function () {
  "use strict";
  function ready() {
    const style = document.createElement("style");
    style.textContent = [
      "#nim-quick{position:fixed;top:calc(12px + env(safe-area-inset-top));right:12px;z-index:900;border:1px solid #5954a9;border-radius:999px;background:#242045;color:#e8e6ff;padding:8px 13px;font:600 12px system-ui,sans-serif;box-shadow:0 8px 25px #0007;cursor:pointer}",
      "#nim-cover{position:fixed;inset:0;z-index:1000;display:none;align-items:center;justify-content:center;padding:18px;background:rgba(3,6,18,.8);backdrop-filter:blur(8px)}",
      "#nim-cover[data-open='true']{display:flex}",
      "#nim-card{width:min(100%,440px);max-height:92vh;overflow-y:auto;border:1px solid #414370;border-radius:22px;background:linear-gradient(165deg,#191d38,#101423);color:#f0efff;padding:25px;box-shadow:0 24px 100px #000b;font:14px/1.6 system-ui,sans-serif}",
      "#nim-card h2{font-size:22px;margin:0 0 5px;font-weight:750}",
      "#nim-card p{color:#a9b3d4;margin:0 0 15px;font-size:13px}",
      "#nim-card label{display:block;margin:14px 0 5px;font-size:12px;color:#c5cbed;font-weight:600}",
      "#nim-card input{display:block;width:100%;border:1px solid #465174;border-radius:11px;background:#0d1326;color:#fff;padding:12px 13px;font:13px system-ui;outline-color:#9288ff}",
      "#nim-card button{border:0;border-radius:11px;padding:11px 15px;font:700 13px system-ui;cursor:pointer}",
      "#nim-save{background:#7665ff;color:white;flex:1}",
      "#nim-close{background:#2b3351;color:#d6dcff}",
      "#nim-msg{margin-top:13px;min-height:22px;color:#acb7dd;white-space:pre-wrap;overflow-wrap:anywhere;font-size:12px}",
      "#nim-card .nim-row{display:flex;gap:9px;margin-top:18px}",
      "#nim-card small{display:block;margin-top:12px;color:#9eaacc;font-size:11px}"
    ].join("\n");
    document.head.appendChild(style);
    const trigger = document.createElement("button");
    trigger.id = "nim-quick";
    trigger.type = "button";
    trigger.textContent = "⚡ NVIDIA NIM";
    trigger.setAttribute("aria-label", "NVIDIA NIM API setup");
    const cover = document.createElement("div");
    cover.id = "nim-cover";
    cover.setAttribute("data-open", "false");
    cover.innerHTML = '<section id="nim-card" role="dialog" aria-modal="true" aria-label="NVIDIA NIM model setup"><h2>⚡ NVIDIA NIM</h2><p>अपना AI मॉडल जोड़ें और Chat चलाएँ। nanoMuse Cloud signup जरूरी नहीं है।</p><form id="nim-form"><label for="nim-model">Model ID</label><input id="nim-model" required spellcheck="false" value="nvidia/nemotron-3-ultra-550b-a55b" /><label for="nim-key">NVIDIA NIM API Key</label><input id="nim-key" type="password" required autocomplete="off" spellcheck="false" placeholder="nvapi-..." /><small>Key सिर्फ इस साइट के authenticated backend पर HTTPS से भेजी जाती है। Browser storage में नहीं रखी जाती। Server की सुरक्षा के लिए access token जरूरी है।</small><div class="nim-row"><button id="nim-close" type="button">Cancel</button><button id="nim-save" type="submit">Save & Test</button></div><div id="nim-msg" role="status" aria-live="polite"></div></form></section>';
    document.body.appendChild(trigger);
    document.body.appendChild(cover);
    const form = document.getElementById("nim-form");
    const status = document.getElementById("nim-msg");
    const model = document.getElementById("nim-model");
    const key = document.getElementById("nim-key");
    const save = document.getElementById("nim-save");
    const open = () => { cover.dataset.open = "true"; key.focus(); };
    const close = () => { cover.dataset.open = "false"; key.value = ""; };
    trigger.addEventListener("click", open);
    document.getElementById("nim-close").addEventListener("click", close);
    cover.addEventListener("click", e => { if (e.target === cover) close(); });
    document.addEventListener("keydown", e => { if (e.key === "Escape" && cover.dataset.open === "true") close(); });
    async function call(path, options, token) {
      const res = await fetch(path, {
        ...options,
        headers: { "Authorization": "Bearer " + token, "Content-Type": "application/json" },
        credentials: "same-origin"
      });
      let body = {};
      try { body = await res.json(); } catch (_) {}
      if (!res.ok) {
        if (res.status === 401) throw Error("पहले nanoMuse server का access token जोड़ें। यह Cloud login नहीं है।");
        throw Error(typeof body.detail === "string" ? body.detail : "Server error: " + res.status);
      }
      return body;
    }
    form.addEventListener("submit", async e => {
      e.preventDefault();
      const token = localStorage.getItem("nanomuse_token") || "";
      if (!token) { status.textContent = "पहले मुख्य ऐप में server access token डालें, फिर यहाँ NVIDIA key लगाएँ।"; return; }
      if (!model.value.trim() || !key.value.trim()) return;
      save.disabled = true;
      status.textContent = "Model और key सुरक्षित रूप से सेव हो रही है…";
      try {
        await call("/api/connections/llm", {
          method: "PUT",
          body: JSON.stringify({ provider: "openai", model: model.value.trim(), base_url: "https://integrate.api.nvidia.com/v1", tool_mode: "auto", api_key: key.value.trim() })
        }, token);
        key.value = "";
        status.textContent = "Model सेव हो गया। NVIDIA API से कनेक्शन टेस्ट हो रहा है…";
        const result = await call("/api/connections/llm/test", { method: "POST", body: "{}" }, token);
        if (!result.ok) throw Error("Key सेव हुई है, लेकिन NVIDIA API test fail हुआ: " + (result.error || result.message || "model access जाँचें"));
        status.textContent = "✓ NVIDIA NIM चल रहा है! Chat खुल रही है…";
        try { await call("/api/onboarded", { method: "POST", body: '{"done":true}' }, token); } catch (_) {}
        window.setTimeout(() => window.location.reload(), 700);
      } catch (err) {
        status.textContent = String(err && err.message ? err.message : err);
      } finally { save.disabled = false; }
    });
    // Show the one-time setup automatically on an authenticated, unconfigured runtime.
    window.setTimeout(async () => {
      const token = localStorage.getItem("nanomuse_token") || "";
      if (!token) return;
      try {
        const c = await call("/api/connections", { method: "GET" }, token);
        if (c && c.llm && (c.llm.key_source === "none" || c.llm.key_source === "missing") &&
            !sessionStorage.getItem("nim_setup_dismissed")) open();
      } catch (_) { /* the main app handles connection errors */ }
    }, 1400);
    document.getElementById("nim-close").addEventListener("click", () => { try { sessionStorage.setItem("nim_setup_dismissed", "1"); } catch (_) {} });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready, { once: true });
  else ready();
})();
