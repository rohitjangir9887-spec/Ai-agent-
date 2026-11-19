/* nanoMuse NIM guest chat: BYOK only, no cloud account or bearer token.
 * This isolated chat has no access to files, shell, coding or computer control.
 * The NVIDIA key stays in this page's memory and is never stored in browser storage.
 */
(function () {
  "use strict";
  const el = document.getElementById("root");
  if (!el) return;
  document.title = "nanoMuse · NVIDIA NIM Chat";
  document.documentElement.dataset.theme = "dark";
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", "#0a1020");
  const css = document.createElement("style");
  css.textContent = [
    "*{box-sizing:border-box}",
    "html,body,#root{height:100%;min-height:100%;margin:0;background:#080d1a;color:#e9edfc}",
    "#root{font:14px/1.6 Inter,system-ui,-apple-system,Segoe UI,sans-serif}",
    ".ng-shell{display:grid;grid-template-columns:245px minmax(0,1fr);height:100dvh;overflow:hidden}",
    ".ng-sidebar{border-right:1px solid #222c43;background:#0c1427;padding:23px 16px;display:flex;flex-direction:column;gap:19px}",
    ".ng-brand{font-size:20px;font-weight:800;letter-spacing:-.6px}",
    ".ng-brand span{color:#a99bff}",
    ".ng-small{font-size:11px;color:#99aac9}",
    ".ng-chip{border-radius:999px;background:#172740;border:1px solid #2a4260;color:#bad5ff;padding:5px 9px;font-size:11px;display:inline-block}",
    ".ng-sidecard{background:#141f35;border:1px solid #273553;border-radius:15px;padding:15px;color:#bcc9e3;font-size:12px}",
    ".ng-sidecard strong{color:#e2e8ff;font-size:13px;display:block;margin-bottom:5px}",
    ".ng-actions{margin-top:auto;display:flex;flex-direction:column;gap:9px}",
    ".ng-main{min-width:0;display:flex;flex-direction:column;background:radial-gradient(ellipse at 50% 0%,#20244b 0%,#0b1020 50%,#080d19 95%)}",
    ".ng-top{padding:17px 24px;border-bottom:1px solid #222a40;display:flex;align-items:center;justify-content:space-between;gap:9px}",
    ".ng-title{font-size:16px;font-weight:750}.ng-status{color:#b8c6eb;font-size:11px}",
    ".ng-status:before{content:'●';color:#42d6a0;margin-right:5px}",
    ".ng-chat{flex:1;min-height:0;overflow-y:auto;display:flex;flex-direction:column;gap:17px;padding:30px max(20px,calc((100% - 780px)/2))}",
    ".ng-message{max-width:min(85%,700px);padding:13px 17px;border:1px solid #293956;border-radius:18px;background:#18223a;color:#e6eaf7;white-space:pre-wrap;overflow-wrap:anywhere;font-size:14px}",
    ".ng-message.user{align-self:flex-end;background:#473b89;border-color:#6f60c0}",
    ".ng-message.assistant{align-self:flex-start}",
    ".ng-note{font-size:11px;color:#8fa3c7;margin:4px 0 0}",
    ".ng-bottom{border-top:1px solid #202a43;padding:15px max(17px,calc((100% - 810px)/2)) 22px;display:flex;flex-direction:column;gap:9px}",
    ".ng-compose{display:flex;align-items:end;gap:10px;background:#161f33;border:1px solid #3b4765;border-radius:18px;padding:10px}",
    "textarea{font:inherit;color:#f3f5ff;background:none;border:0;resize:none;outline:0;flex:1;min-width:0;max-height:160px;min-height:48px;padding:10px}",
    "button{font:inherit;cursor:pointer;border-radius:11px;padding:10px 14px;border:1px solid #3c4b69;background:#202c45;color:#e2e9fd}",
    "button:hover{filter:brightness(1.15)}button:disabled{opacity:.6;cursor:wait}",
    ".ng-primary{background:#775eea;border-color:#856dff;color:white;font-weight:700}",
    ".ng-surface{background:#171e34;border:1px solid #354461;border-radius:22px;padding:24px;box-shadow:0 23px 80px #0008;width:min(94vw,455px)}",
    ".ng-shade{position:fixed;inset:0;z-index:100;display:flex;align-items:center;justify-content:center;background:#030710dc;padding:16px;backdrop-filter:blur(9px)}",
    ".ng-shade[hidden]{display:none}",
    ".ng-surface h2{margin:0 0 6px;font-size:21px}.ng-surface p{font-size:12px;color:#a9b7d4;line-height:1.7}",
    ".ng-surface label{display:block;margin:12px 0 5px;font-size:12px;color:#c6cef0;font-weight:700}",
    ".ng-surface input{width:100%;background:#0c1224;color:white;border:1px solid #43506d;border-radius:11px;padding:12px;font:13px system-ui;outline-color:#7562ec}",
    ".ng-formactions{display:flex;gap:8px;margin-top:20px}",
    ".ng-inline{display:flex;align-items:center;gap:9px}",
    ".ng-footer{font-size:11px;color:#8c9cbb;text-align:center}",
    "@media(max-width:720px){.ng-shell{grid-template-columns:1fr}.ng-sidebar{display:none}.ng-top{padding:12px 16px}.ng-chat{padding:22px 15px}.ng-message{max-width:93%}.ng-bottom{padding:11px 12px 16px}.ng-title{font-size:14px}}"
  ].join("");
  document.head.appendChild(css);
  el.innerHTML =
    '<div class="ng-shell">' +
      '<aside class="ng-sidebar">' +
        '<div><div class="ng-brand">✦ nano<span>Muse</span></div><div class="ng-small">Personal NVIDIA NIM workspace</div></div>' +
        '<span class="ng-chip">● No account needed</span>' +
        '<div class="ng-sidecard"><strong>✦ AI Chat</strong>Ask questions and write code using your own NVIDIA NIM model.</div>' +
        '<div class="ng-sidecard"><strong>🖥 Live Computer</strong>Private agent access is separate. This public chat cannot access your files or run commands.</div>' +
        '<div class="ng-actions"><button type="button" id="ng-new">＋ New chat</button><button type="button" id="ng-private">Private agent access</button></div>' +
      '</aside>' +
      '<main class="ng-main">' +
        '<header class="ng-top"><div><div class="ng-title">✦ nanoMuse AI Chat</div><div id="ng-modelname" class="ng-small">NVIDIA Nemotron 3 Ultra</div></div><div class="ng-inline"><span class="ng-status">NIM ready for setup</span><button id="ng-settings" type="button">⚙ API Key</button></div></header>' +
        '<div id="ng-messages" class="ng-chat" aria-live="polite"></div>' +
        '<div class="ng-bottom"><div class="ng-compose"><textarea id="ng-input" rows="2" aria-label="Message" placeholder="अपने AI से कुछ भी पूछें..."></textarea><button id="ng-send" type="button" class="ng-primary">Send ➤</button></div>' +
        '<div class="ng-footer">No account login · Your own NVIDIA NIM API key · Chat only, not live computer control</div></div>' +
      '</main>' +
    '</div>' +
    '<div id="ng-overlay" class="ng-shade" role="presentation"><div class="ng-surface" role="dialog" aria-modal="true" aria-label="NVIDIA NIM setup">' +
      '<h2>⚡ Connect NVIDIA NIM</h2><p>Use your own NVIDIA API key. No nanoMuse signup or server access token is needed for this chat. The key is not saved in local storage or on this server.</p>' +
      '<form id="ng-keyform"><label for="ng-key">NVIDIA API Key</label><input id="ng-key" type="password" required autocomplete="off" placeholder="nvapi-..." />' +
      '<label for="ng-model">Model ID</label><input id="ng-model" required spellcheck="false" value="nvidia/nemotron-3-ultra-550b-a55b" />' +
      '<p id="ng-formmsg" role="status">Your key will be sent via HTTPS to this server for NVIDIA requests.</p>' +
      '<div class="ng-formactions"><button type="button" id="ng-cancel">Close</button><button type="submit" class="ng-primary" style="flex:1">Start AI Chat</button></div></form></div></div>';
  const $ = id => document.getElementById(id);
  const overlay = $("ng-overlay");
  const messagesBox = $("ng-messages");
  const msgInput = $("ng-input");
  const submitButton = $("ng-send");
  const modelInput = $("ng-model");
  const keyInput = $("ng-key");
  let secretKey = "";
  let model = "nvidia/nemotron-3-ultra-550b-a55b";
  let busy = false;
  let messages = [];
  function showKey() { overlay.hidden = false; keyInput.focus(); }
  function hideKey() { if (secretKey) { overlay.hidden = true; keyInput.value = ""; msgInput.focus(); } }
  function bubble(role, content) {
    const div = document.createElement("div");
    div.className = "ng-message " + role;
    div.textContent = content;
    messagesBox.appendChild(div);
    messagesBox.scrollTop = messagesBox.scrollHeight;
    return div;
  }
  function welcome() {
    messagesBox.replaceChildren();
    bubble("assistant", "नमस्ते! 👋\nमैं nanoMuse NIM Chat हूँ। आप अपनी NVIDIA API key के साथ मुझसे हिंदी या English में बातचीत कर सकते हैं।\n\nकोड लिखने, सवाल पूछने और आइडिया बनाने के लिए संदेश भेजें।");
    messages = [];
  }
  $("ng-keyform").addEventListener("submit", e => {
    e.preventDefault();
    if (!keyInput.value.trim().startsWith("nvapi-")) {
      $("ng-formmsg").textContent = "Please enter a valid NVIDIA API key starting with nvapi-.";
      return;
    }
    secretKey = keyInput.value.trim();
    model = modelInput.value.trim();
    $("ng-modelname").textContent = model;
    document.querySelector(".ng-status").textContent = "NIM configured";
    $("ng-formmsg").textContent = "You can change your model or key any time.";
    hideKey();
  });
  $("ng-settings").addEventListener("click", showKey);
  $("ng-cancel").addEventListener("click", hideKey);
  $("ng-new").addEventListener("click", welcome);
  $("ng-private").addEventListener("click", () => {
    window.alert("Full computer control and private agent tools require a secure private pairing link from your nanoMuse server. In your Render logs, find the startup URL with #token= and open that private link only on your own device. Never share it.");
  });
  async function send() {
    if (busy) return;
    if (!secretKey) return showKey();
    const text = msgInput.value.trim();
    if (!text) return;
    busy = true;
    msgInput.value = "";
    submitButton.disabled = true;
    bubble("user", text);
    const replyBubble = bubble("assistant", "Thinking…");
    const next = messages.concat([{ role: "user", content: text }]).slice(-14);
    try {
      const res = await fetch("/api/guest/nim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: secretKey, model, messages: next }),
        credentials: "same-origin"
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(String(body.detail || "NVIDIA request failed (" + res.status + ")"));
      const reply = String(body.reply || "No text returned by the model.");
      replyBubble.textContent = reply;
      messages = next.concat([{ role: "assistant", content: reply }]).slice(-14);
    } catch (err) {
      replyBubble.textContent = "⚠ " + String(err && err.message ? err.message : err);
    } finally {
      submitButton.disabled = false;
      busy = false;
      messagesBox.scrollTop = messagesBox.scrollHeight;
      msgInput.focus();
    }
  }
  submitButton.addEventListener("click", send);
  msgInput.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  });
  welcome();
  showKey();
})();