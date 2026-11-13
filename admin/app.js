(() => {
  const OWNER = "lcd10415";
  const REPO = "linghai-feature-config";
  const PATH = "features.json";
  const API = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`;
  const TOKEN_KEY = "linghai_gh_token";

  const FLAG_META = [
    { key: "payout", title: "提现账户", desc: "PayoutsActivity · 提现账户管理" },
    { key: "add_payout", title: "添加提现账户", desc: "AddPayoutsActivity · 绑定提现方式" },
    { key: "cream_off", title: "提现记录", desc: "CreamOffRecordActivity · 提现流水" },
    { key: "apply_agent", title: "申请代理", desc: "ApplyAgentActivity" },
    { key: "bind_invite", title: "绑定邀请", desc: "BindInviteActivity · 邀请码绑定" },
    { key: "my_team", title: "我的团队", desc: "MyTeamActivity · 团队/拉新" },
    { key: "recharge", title: "充值", desc: "RechargeActivity · 充值入口" },
  ];

  const els = {
    token: document.getElementById("token"),
    btnConnect: document.getElementById("btnConnect"),
    btnClearToken: document.getElementById("btnClearToken"),
    btnReload: document.getElementById("btnReload"),
    btnSave: document.getElementById("btnSave"),
    authStatus: document.getElementById("authStatus"),
    flags: document.getElementById("flags"),
    version: document.getElementById("version"),
    note: document.getElementById("note"),
    updatedAt: document.getElementById("updatedAt"),
    sha: document.getElementById("sha"),
    preview: document.getElementById("preview"),
    dirtyBadge: document.getElementById("dirtyBadge"),
    toast: document.getElementById("toast"),
  };

  let sha = null;
  let state = emptyState();
  let dirty = false;
  let toastTimer = null;

  function emptyState() {
    const features = {};
    FLAG_META.forEach((f) => (features[f.key] = false));
    return {
      version: 1,
      updated_at: today(),
      note: "同一配置对所有用户生效（含审核）。",
      features,
    };
  }

  function today() {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${m}-${day}`;
  }

  function toast(msg) {
    els.toast.hidden = false;
    els.toast.textContent = msg;
    els.toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      els.toast.classList.remove("show");
    }, 2600);
  }

  function setAuthStatus(text, type) {
    els.authStatus.textContent = text || "";
    els.authStatus.className = "status" + (type ? " " + type : "");
  }

  function setConnected(ok) {
    els.btnReload.disabled = !ok;
    els.btnSave.disabled = !ok;
  }

  function setDirty(v) {
    dirty = v;
    els.dirtyBadge.hidden = !v;
  }

  function getToken() {
    return (els.token.value || localStorage.getItem(TOKEN_KEY) || "").trim();
  }

  function headers(token) {
    return {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    };
  }

  function decodeContent(b64) {
    const bin = atob(b64.replace(/\n/g, ""));
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    return new TextDecoder("utf-8").decode(bytes);
  }

  function encodeContent(text) {
    const bytes = new TextEncoder().encode(text);
    let bin = "";
    bytes.forEach((b) => (bin += String.fromCharCode(b)));
    return btoa(bin);
  }

  function normalize(raw) {
    const next = emptyState();
    if (!raw || typeof raw !== "object") return next;
    next.version = Number(raw.version) || 1;
    next.updated_at = raw.updated_at || today();
    next.note = typeof raw.note === "string" ? raw.note : next.note;
    const f = raw.features || {};
    FLAG_META.forEach(({ key }) => {
      next.features[key] = Boolean(f[key]);
    });
    return next;
  }

  function buildPayload() {
    return {
      version: Number(els.version.value) || state.version || 1,
      updated_at: today(),
      note: els.note.value.trim(),
      features: { ...state.features },
    };
  }

  function renderFlags() {
    els.flags.innerHTML = "";
    FLAG_META.forEach(({ key, title, desc }) => {
      const on = Boolean(state.features[key]);
      const row = document.createElement("div");
      row.className = "flag" + (on ? " on" : "");
      row.innerHTML = `
        <div>
          <h3>${title}</h3>
          <p>${desc} · <code>${key}</code></p>
        </div>
      `;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "switch";
      btn.setAttribute("role", "switch");
      btn.setAttribute("aria-checked", on ? "true" : "false");
      btn.setAttribute("aria-label", title);
      btn.addEventListener("click", () => {
        state.features[key] = !state.features[key];
        setDirty(true);
        renderFlags();
        renderPreview();
      });
      row.appendChild(btn);
      els.flags.appendChild(row);
    });
  }

  function renderMeta() {
    els.version.value = state.version;
    els.note.value = state.note || "";
    els.updatedAt.textContent = state.updated_at || "—";
    els.sha.textContent = sha || "—";
  }

  function renderPreview() {
    const payload = buildPayload();
    els.preview.textContent = JSON.stringify(payload, null, 2);
  }

  function applyState(data, fileSha) {
    state = normalize(data);
    sha = fileSha;
    setDirty(false);
    renderFlags();
    renderMeta();
    renderPreview();
  }

  async function loadConfig() {
    const token = getToken();
    if (!token) {
      setAuthStatus("请先填写 Token", "err");
      setConnected(false);
      return;
    }
    setAuthStatus("加载中…");
    try {
      const res = await fetch(`${API}?ref=main`, { headers: headers(token) });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `HTTP ${res.status}`);
      }
      const body = await res.json();
      const json = JSON.parse(decodeContent(body.content));
      applyState(json, body.sha);
      localStorage.setItem(TOKEN_KEY, token);
      setConnected(true);
      setAuthStatus("已连接 · 配置已加载", "ok");
      toast("配置已加载");
    } catch (e) {
      setConnected(false);
      setAuthStatus(`加载失败：${e.message}`, "err");
      toast("加载失败");
    }
  }

  async function saveConfig() {
    const token = getToken();
    if (!token) {
      setAuthStatus("请先填写 Token", "err");
      return;
    }
    if (!sha) {
      setAuthStatus("缺少文件 SHA，请先刷新加载", "err");
      return;
    }
    const payload = buildPayload();
    const content = JSON.stringify(payload, null, 2) + "\n";
    els.btnSave.disabled = true;
    setAuthStatus("保存中…");
    try {
      const res = await fetch(API, {
        method: "PUT",
        headers: {
          ...headers(token),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `chore: update feature flags (${payload.updated_at})`,
          content: encodeContent(content),
          sha,
          branch: "main",
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || `HTTP ${res.status}`);
      applyState(payload, body.content.sha);
      setAuthStatus("已保存到 GitHub main", "ok");
      toast("已保存，客户端下次启动生效");
    } catch (e) {
      setAuthStatus(`保存失败：${e.message}`, "err");
      toast("保存失败");
    } finally {
      els.btnSave.disabled = false;
    }
  }

  els.btnConnect.addEventListener("click", loadConfig);
  els.btnReload.addEventListener("click", loadConfig);
  els.btnSave.addEventListener("click", saveConfig);
  els.btnClearToken.addEventListener("click", () => {
    localStorage.removeItem(TOKEN_KEY);
    els.token.value = "";
    setConnected(false);
    setAuthStatus("已清除本地 Token");
  });
  els.version.addEventListener("input", () => {
    setDirty(true);
    renderPreview();
  });
  els.note.addEventListener("input", () => {
    setDirty(true);
    renderPreview();
  });

  // init UI
  const saved = localStorage.getItem(TOKEN_KEY);
  if (saved) els.token.value = saved;
  applyState(emptyState(), null);
  setConnected(false);
})();
