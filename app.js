// ══════════════════════════════════════════════════════════════
// تطبيق شخصي: مصروفات، أهداف مالية، عربية، فرد من العائلة، وزن وتخسيس
// كل مستخدم بحسابه (إيميل + باسورد)، وبياناته محمية في السحابة بسياسات RLS.
// ══════════════════════════════════════════════════════════════
const SUPABASE_URL = "https://nkcfosifswvaoqlfliww.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rY2Zvc2lmc3d2YW9xbGZsaXd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2NjY3ODksImV4cCI6MjA5NzI0Mjc4OX0.mKg8mXOrfDayAKuGGm9GzU-F2jnONp8hb0tJ9XmsMCI"; // مفتاح anon العام (مش سر) — الحماية الحقيقية من سياسات RLS
const AI_URL = "https://allinone.mohamedhossamomara01.workers.dev/ai"; // الـ Worker بتاع الذكاء الاصطناعي (شوف README)
const CLD_CLOUD = "tpzkvsa6";
const CLD_PRESET = "Mohamed";
const APP_NAME = "AllinOne";        // ← اسم التطبيق (غيّره هنا + في index.html و manifest.json)

const { useState, useEffect, useRef, useMemo, useCallback, useContext, createContext } = React;
const h = React.createElement;

(function boot() {
  const fail = e => { const r = document.getElementById("root"); if (r) r.innerHTML = "<div style='padding:20px;color:#fff;font-family:monospace;direction:ltr;white-space:pre-wrap'>⚠️ " + String((e && e.message) || e) + "</div>"; };
  window.addEventListener("error", ev => { if (!window.__ready) fail(ev.error || ev.message); });
  let tries = 0;
  const wait = () => {
    if (window.React && window.ReactDOM && window.supabase) return start();
    if (++tries > 200) return fail("تعذّر تحميل المكتبات. اتأكد من النت.");
    setTimeout(wait, 50);
  };
  wait();
})();

function start() {
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
const APP_VERSION = "v2026.10.10-e";
if ("serviceWorker" in navigator && navigator.serviceWorker.controller) { let rl = false; navigator.serviceWorker.addEventListener("controllerchange", () => { if (rl) return; rl = true; location.reload(); }); }
if ("serviceWorker" in navigator) { const reg = () => navigator.serviceWorker.register("./sw.js").catch(() => {}); if (document.readyState === "complete") reg(); else window.addEventListener("load", reg); }

// ── أدوات صغيرة ─────────────────────────────────────────────
const uid8 = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
const pad = n => String(n).padStart(2, "0");
const todayStr = () => { const d = new Date(); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); };
let START_DAY = 1; // يوم بداية الشهر المالي (1 = الشهر العادي). بيتظبط من الإعدادات.
const monthOf = ds => { const m = ds.slice(0, 7); if (START_DAY > 1 && +ds.slice(8, 10) >= START_DAY) { const y = +m.slice(0, 4), mo = +m.slice(5, 7); return mo === 12 ? (y + 1) + "-01" : y + "-" + String(mo + 1).padStart(2, "0"); } return m; };
const addMonths = (m, k) => { const [y, mo] = m.split("-").map(Number); const d = new Date(y, mo - 1 + k, 1); return d.getFullYear() + "-" + pad(d.getMonth() + 1); };
const MONTHS_AR = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
const monthLabel = m => { const [y, mo] = m.split("-").map(Number); return MONTHS_AR[mo - 1] + " " + y; };
const dayLabel = ds => { const [y, m, d] = ds.split("-").map(Number); const dt = new Date(y, m - 1, d); const names = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]; return names[dt.getDay()] + " " + d + " " + MONTHS_AR[m - 1]; };
const fmt = (n, dec) => { const v = Number(n) || 0; return v.toLocaleString("en-US", { maximumFractionDigits: dec == null ? 2 : dec }); };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const num = v => { const n = parseFloat(String(v).replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d)).replace(",", ".")); return isFinite(n) ? n : NaN; };
const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

// ── ثيم (ألوان بمتغيرات CSS، داكن/فاتح) ─────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&family=Amiri+Quran&display=swap');
:root{--bg:#fef7e5;--surface:#fffdf6;--card:#ffffff;--card2:#f7eed6;--line:#e8dcb8;--text:#17323a;--muted:#6a7f80;--accent:#1f7a80;--accent-ink:#ffffff;--accent2:#d9a441;--danger:#c8433a;--ok:#23966a;--warn:#b27a14;--shadow:0 6px 20px rgba(60,80,60,.10)}
[data-theme="dark"]{--bg:#0d2326;--surface:#12303a;--card:#153a40;--card2:#1c4a51;--line:#2b5b62;--text:#f6eed8;--muted:#9fbab7;--accent:#e2b351;--accent-ink:#1a2a26;--accent2:#3fb3b3;--danger:#ff7b72;--ok:#4cd6a0;--warn:#ffc15e;--shadow:0 8px 28px rgba(0,0,0,.38)}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html,body{margin:0;overscroll-behavior-y:contain;background:var(--bg);color:var(--text);font-family:'Cairo',system-ui,sans-serif}
button,input,select,textarea{font-family:inherit;font-size:15px;color:var(--text)}
input,select,textarea{background:var(--card2);border:1px solid var(--line);border-radius:12px;padding:11px 13px;width:100%;outline:none}
input:focus,select:focus,textarea:focus{border-color:var(--accent)}
input[type=number]{-moz-appearance:textfield}input::-webkit-outer-spin-button,input::-webkit-inner-spin-button{-webkit-appearance:none}
.btn{border:none;border-radius:12px;padding:12px 16px;font-weight:800;cursor:pointer;transition:transform .08s,opacity .15s}
.btn:active{transform:scale(.97)}.btn[disabled]{opacity:.5;cursor:default}
.btn-primary{background:linear-gradient(135deg,var(--accent),var(--accent2));color:var(--accent-ink)}
.btn-ghost{background:var(--card2);color:var(--text);border:1px solid var(--line)}
.btn-danger{background:transparent;color:var(--danger);border:1px solid var(--danger)}
.card{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:14px;box-shadow:var(--shadow)}
.chip{border:1px solid var(--line);background:var(--card2);color:var(--text);border-radius:999px;padding:7px 13px;font-weight:700;font-size:13px;cursor:pointer;white-space:nowrap}
.chip.on{background:var(--accent);color:var(--accent-ink);border-color:var(--accent)}
.fade{animation:fade .25s ease}@keyframes fade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
.spin{width:22px;height:22px;border:3px solid var(--line);border-top-color:var(--accent);border-radius:50%;animation:sp .8s linear infinite;display:inline-block}@keyframes sp{to{transform:rotate(360deg)}}
::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-thumb{background:var(--line);border-radius:9px}
`;

// ── الداتا: مخزن بيانات المستخدم (محلي فوري + مزامنة سحابية) ────
const DataCtx = createContext(null);
const useData = () => useContext(DataCtx);

function DataProvider({ user, children }) {
  const lsKey = k => "allinone:" + user.id + ":" + k;
  const [docs, setDocs] = useState(null);       // null = لسه بيحمّل
  const [sync, setSync] = useState("idle");     // idle | saving | error | offline
  const docsRef = useRef({});
  const timers = useRef({});
  const dirtyKey = "allinone:" + user.id + ":__dirty";

  const flush = useCallback(async () => {
    const dirty = lsGet(dirtyKey, []);
    if (!dirty.length) return;
    setSync("saving");
    const left = [];
    for (const k of dirty) {
      const v = docsRef.current[k];
      if (v === undefined) continue;
      const { error } = await sb.from("allinone_data").upsert({ user_id: user.id, key: k, value: v, updated_at: new Date().toISOString() }, { onConflict: "user_id,key" });
      if (error) left.push(k);
    }
    lsSet(dirtyKey, left);
    setSync(left.length ? (navigator.onLine ? "error" : "offline") : "idle");
  }, [user.id]);

  useEffect(() => {
    let dead = false;
    // 1) من الكاش المحلي فورًا
    const cached = lsGet("allinone:" + user.id + ":__all", null);
    if (cached) { docsRef.current = cached; setDocs(cached); }
    // 2) من السحابة
    (async () => {
      const { data, error } = await sb.from("allinone_data").select("key,value").eq("user_id", user.id).not("key", "like", "snap:%");
      if (dead) return;
      if (error) { if (!cached) { docsRef.current = {}; setDocs({}); } setSync(navigator.onLine ? "error" : "offline"); return; }
      const dirty = lsGet(dirtyKey, []);
      const merged = {};
      (data || []).forEach(r => { merged[r.key] = r.value; });
      dirty.forEach(k => { if (docsRef.current[k] !== undefined) merged[k] = docsRef.current[k]; }); // التعديلات اللي لسه ماتبعتتش بتفضل
      docsRef.current = merged; setDocs(merged); lsSet("allinone:" + user.id + ":__all", merged);
      flush();
    })();
    const on = () => flush();
    window.addEventListener("online", on);
    return () => { dead = true; window.removeEventListener("online", on); };
  }, [user.id]);

  const get = useCallback((k, d) => (docs && docs[k] !== undefined ? docs[k] : d), [docs]);
  const set = useCallback((k, updater) => {
    const prev = docsRef.current[k];
    const next = typeof updater === "function" ? updater(prev) : updater;
    docsRef.current = { ...docsRef.current, [k]: next };
    setDocs(docsRef.current);
    lsSet("allinone:" + user.id + ":__all", docsRef.current);
    const dirty = new Set(lsGet(dirtyKey, [])); dirty.add(k); lsSet(dirtyKey, [...dirty]);
    clearTimeout(timers.current[k]);
    timers.current[k] = setTimeout(flush, 700);
  }, [user.id, flush]);
  const wipe = useCallback(async () => {
    await sb.from("allinone_data").delete().eq("user_id", user.id);
    docsRef.current = {}; setDocs({}); lsSet("allinone:" + user.id + ":__all", {}); lsSet(dirtyKey, []);
  }, [user.id]);

  if (docs === null) return h(Splash, { text: "بنجهّز بياناتك…" });
  return h(DataCtx.Provider, { value: { get, set, wipe, sync, flush, user, all: () => docsRef.current } }, children);
}

// ── مكوّنات واجهة مشتركة ────────────────────────────────────
function Splash({ text }) {
  return h("div", { style: { minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "var(--muted)" } }, h("span", { className: "spin" }), h("div", { style: { fontSize: 13 } }, text || "…"));
}
function Field({ label, children, hint }) {
  return h("label", { style: { display: "block", marginBottom: 12 } },
    label && h("div", { style: { fontSize: 12, color: "var(--muted)", fontWeight: 700, marginBottom: 6 } }, label),
    children,
    hint && h("div", { style: { fontSize: 11, color: "var(--muted)", marginTop: 5, lineHeight: 1.7 } }, hint));
}
function Sheet({ title, onClose, children }) {
  useEffect(() => { const k = e => { if (e.key === "Escape") onClose(); }; document.addEventListener("keydown", k); return () => document.removeEventListener("keydown", k); }, []);
  return h("div", { onClick: onClose, style: { position: "fixed", inset: 0, background: "rgba(3,6,16,.62)", zIndex: 60, display: "flex", alignItems: "flex-end", justifyContent: "center" } },
    h("div", { onClick: e => e.stopPropagation(), className: "fade", style: { width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto", background: "var(--surface)", borderRadius: "22px 22px 0 0", padding: "18px 16px calc(22px + env(safe-area-inset-bottom))", borderTop: "1px solid var(--line)" } },
      h("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 } },
        h("div", { style: { fontSize: 17, fontWeight: 900 } }, title),
        h("button", { onClick: onClose, className: "btn btn-ghost", style: { padding: "6px 12px" }, "aria-label": "إغلاق" }, "✕")),
      children));
}
function Stat({ label, value, sub, color }) {
  return h("div", { className: "card", style: { flex: 1, minWidth: 0, padding: "12px 12px" } },
    h("div", { style: { fontSize: 11, color: "var(--muted)", fontWeight: 700 } }, label),
    h("div", { style: { fontSize: 20, fontWeight: 900, color: color || "var(--text)", marginTop: 4, wordBreak: "break-word" } }, value),
    sub && h("div", { style: { fontSize: 11, color: "var(--muted)", marginTop: 3 } }, sub));
}
function Bar({ pct, color }) {
  return h("div", { style: { height: 8, background: "var(--card2)", borderRadius: 99, overflow: "hidden", border: "1px solid var(--line)" } },
    h("div", { style: { width: clamp(pct, 0, 100) + "%", height: "100%", background: color || "linear-gradient(90deg,var(--accent),var(--accent2))", borderRadius: 99, transition: "width .4s" } }));
}
function Empty({ icon, text }) {
  return h("div", { style: { textAlign: "center", color: "var(--muted)", padding: "34px 10px", fontSize: 13, lineHeight: 1.9 } }, h("div", { style: { fontSize: 34, marginBottom: 6 } }, icon || "🗒️"), text);
}
function MonthNav({ m, setM }) {
  return h("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", margin: "4px 0 12px" } },
    h("button", { className: "btn btn-ghost", style: { padding: "8px 14px" }, onClick: () => setM(addMonths(m, -1)), "aria-label": "الشهر اللي فات" }, "›"),
    h("div", { style: { fontWeight: 900, fontSize: 15 } }, monthLabel(m)),
    h("button", { className: "btn btn-ghost", style: { padding: "8px 14px" }, onClick: () => setM(addMonths(m, 1)), "aria-label": "الشهر الجاي" }, "‹"));
}
function useToast() {
  const [msg, setMsg] = useState("");
  const t = useRef(null);
  const show = m => { setMsg(m); clearTimeout(t.current); t.current = setTimeout(() => setMsg(""), 2600); };
  const node = msg ? h("div", { className: "fade", style: { position: "fixed", bottom: "calc(24px + env(safe-area-inset-bottom))", left: "50%", transform: "translateX(-50%)", background: "var(--text)", color: "var(--bg)", padding: "10px 18px", borderRadius: 99, fontWeight: 800, fontSize: 13, zIndex: 90, maxWidth: "90vw", textAlign: "center" } }, msg) : null;
  return [show, node];
}
function confirmDo(msg) { return window.confirm(msg); }

// ══════════════════════════════════════════════════════════════
// الدخول والتسجيل
// ══════════════════════════════════════════════════════════════
function PwInput(props) {
  const [show, setShow] = useState(false);
  return h("div", { style: { position: "relative" } },
    h("input", { ...props, type: show ? "text" : "password", dir: "ltr", style: { paddingRight: 46 } }),
    h("button", { type: "button", onClick: () => setShow(v => !v), "aria-label": show ? "إخفاء كلمة السر" : "إظهار كلمة السر", "aria-pressed": show, style: { position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 18, padding: "6px 8px", lineHeight: 1, opacity: show ? 1 : .65 } }, show ? "🙈" : "👁️"));
}
const authErr = m => {
  m = String(m || "");
  if (/Invalid login credentials/i.test(m)) return "الإيميل أو كلمة السر غلط.";
  if (/already registered|already been registered/i.test(m)) return "الإيميل ده مسجّل قبل كده. جرّب تسجّل دخول.";
  if (/Password should be at least/i.test(m)) return "كلمة السر لازم تكون ٨ حروف على الأقل.";
  if (/Email not confirmed/i.test(m)) return "فعّل الإيميل الأول من الرسالة اللي وصلتك.";
  if (/rate limit|too many/i.test(m)) return "محاولات كتير. استنى شوية وجرّب تاني.";
  if (/valid email|invalid format/i.test(m)) return "الإيميل مش مكتوب صح.";
  if (/network|fetch/i.test(m)) return "مفيش اتصال بالنت.";
  return "حصلت مشكلة: " + m;
};
function usePullReload() {
  useEffect(() => {
    let y0 = null;
    const ok = t => !(t && t.closest && t.closest("input,textarea,select,[role=dialog]"));
    const ts = e => { y0 = (window.scrollY <= 0 && e.touches.length === 1 && ok(e.target)) ? e.touches[0].clientY : null; };
    const tm = e => { if (y0 != null && window.scrollY > 0) y0 = null; };
    const te = e => { if (y0 == null) return; const dy = (e.changedTouches[0] || {}).clientY - y0; y0 = null; if (dy >= 100) location.reload(); };
    document.addEventListener("touchstart", ts, { passive: true }); document.addEventListener("touchmove", tm, { passive: true }); document.addEventListener("touchend", te, { passive: true });
    return () => { document.removeEventListener("touchstart", ts); document.removeEventListener("touchmove", tm); document.removeEventListener("touchend", te); };
  }, []);
}
function AuthScreen() {
  usePullReload();
  const [mode, setMode] = useState("in"); // in | up | reset
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const go = async e => {
    e.preventDefault(); setErr(""); setInfo("");
    if (!email.trim()) return setErr("اكتب الإيميل.");
    if (mode !== "reset" && pw.length < 8) return setErr("كلمة السر لازم تكون ٨ حروف على الأقل.");
    setBusy(true);
    try {
      if (mode === "in") {
        const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password: pw });
        if (error) throw error;
      } else if (mode === "up") {
        const { data, error } = await sb.auth.signUp({ email: email.trim(), password: pw, options: { data: { name: name.trim() }, emailRedirectTo: location.origin + location.pathname } });
        if (error) throw error;
        if (!data.session) setInfo("✅ اتبعتلك رسالة تفعيل على الإيميل. دوس على اللينك اللي فيها وبعدين سجّل دخول.");
      } else {
        const { error } = await sb.auth.resetPasswordForEmail(email.trim(), { redirectTo: location.origin + location.pathname });
        if (error) throw error;
        setInfo("✅ لو الإيميل مسجّل هيوصلك لينك لتغيير كلمة السر.");
      }
    } catch (ex) { setErr(authErr(ex.message)); }
    setBusy(false);
  };
  const tab = (k, l) => h("button", { type: "button", onClick: () => { setMode(k); setErr(""); setInfo(""); }, className: "chip" + (mode === k ? " on" : ""), style: { flex: 1, padding: "10px" } }, l);
  return h("div", { className: "fade", style: { minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: "24px 18px", maxWidth: 440, margin: "0 auto" } },
    h("div", { style: { textAlign: "center", marginBottom: 26 } },
      h("img", { src: "icon-192.png", alt: "", width: 84, height: 84, style: { borderRadius: 22, boxShadow: "var(--shadow)" } }),
      h("div", { style: { fontSize: 30, fontWeight: 900, marginTop: 12 } }, APP_NAME),
      h("div", { style: { color: "var(--muted)", fontSize: 13, marginTop: 4, lineHeight: 1.8 } }, "فلوسك وأهدافك ووزنك وعربيتك في مكان واحد، وكل حاجة خاصة بيك بس.")),
    h("form", { onSubmit: go, className: "card", style: { padding: 18 } },
      mode !== "reset" && h("div", { style: { display: "flex", gap: 8, marginBottom: 16 } }, tab("in", "تسجيل دخول"), tab("up", "حساب جديد")),
      mode === "reset" && h("div", { style: { fontWeight: 900, marginBottom: 12 } }, "استرجاع كلمة السر"),
      mode === "up" && h(Field, { label: "اسمك" }, h("input", { value: name, onChange: e => setName(e.target.value), placeholder: "مثلاً: أحمد", autoComplete: "name", maxLength: 40 })),
      h(Field, { label: "الإيميل" }, h("input", { type: "email", dir: "ltr", value: email, onChange: e => setEmail(e.target.value), placeholder: "you@example.com", autoComplete: "email", inputMode: "email" })),
      mode !== "reset" && h(Field, { label: "كلمة السر", hint: mode === "up" ? "٨ حروف على الأقل." : null }, h(PwInput, { value: pw, onChange: e => setPw(e.target.value), autoComplete: mode === "in" ? "current-password" : "new-password" })),
      err && h("div", { role: "alert", style: { color: "var(--danger)", fontSize: 13, fontWeight: 700, marginBottom: 10, lineHeight: 1.7 } }, err),
      info && h("div", { style: { color: "var(--ok)", fontSize: 13, fontWeight: 700, marginBottom: 10, lineHeight: 1.7 } }, info),
      h("button", { className: "btn btn-primary", style: { width: "100%" }, disabled: busy }, busy ? "لحظة…" : mode === "in" ? "دخول" : mode === "up" ? "إنشاء الحساب" : "ابعتلي اللينك"),
      mode === "in" && h("button", { type: "button", onClick: () => { setMode("reset"); setErr(""); setInfo(""); }, style: { background: "none", border: "none", color: "var(--accent2)", fontWeight: 700, marginTop: 12, width: "100%", cursor: "pointer", fontSize: 13 } }, "نسيت كلمة السر؟"),
      mode === "reset" && h("button", { type: "button", onClick: () => setMode("in"), style: { background: "none", border: "none", color: "var(--accent2)", fontWeight: 700, marginTop: 12, width: "100%", cursor: "pointer", fontSize: 13 } }, "رجوع لتسجيل الدخول")),
    h("div", { style: { textAlign: "center", color: "var(--muted)", fontSize: 11, marginTop: 16, lineHeight: 1.9 } }, "بياناتك مرتبطة بحسابك."));
}

// ══════════════════════════════════════════════════════════════
// الوحدات (الأقسام) المتاحة
// ══════════════════════════════════════════════════════════════
const MODULES = [
  { id: "expenses", icon: "💳", title: "مصروفاتي", desc: "سجّل دخلك ومصاريفك وشوف الشهر ماشي إزاي وفاضل كام." },
  { id: "family", icon: "👨‍👩‍👧", title: "ميزانية فرد من العائلة", desc: "مصاريف شخص بعينه (زوجة، ابن…) في ميزانية منفصلة، وتظهر باسمه." },
  { id: "goals", icon: "🎯", title: "أهداف السنة", desc: "قائمة أهداف السنة (بتتجدد كل سنة) + أهداف مالية بتحوّش ليها وتتابع التقدّم." },
  { id: "car", icon: "🚗", title: "عربيتي", desc: "سجل الصيانة، عداد ومواعيد بالكيلومتر، احتياجات، النقل الذكي، وتقرير شامل." },
  { id: "fit", icon: "🏋️", title: "مدرّبي", desc: "مدرّب تمارين وأكل ذكي: خطة كاملة على قدّك، مرتبط بالميزان والأهداف اليومية." },
  { id: "weight", icon: "⚖️", title: "وزني وتخسيسي", desc: "تابع وزنك وصورك، وحلّل تقدّمك بالذكاء الاصطناعي." },
  { id: "meals", icon: "🍽️", title: "تنظيم الوجبات", desc: "جدول أسبوعي لأكلك، مع حساب سعرات تقريبي وخطة أكل بالذكاء الاصطناعي." },
  { id: "athkar", icon: "📿", title: "الأذكار والمصحف", desc: "أذكار الصباح والمساء، المصحف بالصوت والتفسير، السبحة، والأدعية." },
  { id: "daily", icon: "✅", title: "الأهداف اليومية", desc: "محاسبة نفسك كل يوم: تتأشّر تلقائيًا من الأذكار وقراءة السور، وتقرير للشهر." },
  { id: "period", icon: "🩸", title: "متابعة الدورة", desc: "سجّلي بداية ونهاية الدورة وتابعي المسافة بينها.", only: "f" }
];
const modsFor = p => MODULES.filter(m => !m.only || m.only === (p && p.gender));
const SOON = [];
const modTitle = (id, prof) => id === "family" ? (prof.familyName || "ميزانية العائلة") : id === "goals" ? "أهداف " + new Date().getFullYear() : (MODULES.find(m => m.id === id) || {}).title;

// ══════════════════════════════════════════════════════════════
// أسئلة البداية (Onboarding)
// ══════════════════════════════════════════════════════════════
function Onboarding({ onDone, defaultName, email, onLogout }) {
  usePullReload();
  const [step, setStep] = useState(0);
  const [gender, setGender] = useState("");
  const [name, setName] = useState(defaultName || "");
  const [mods, setMods] = useState(["expenses"]);
  const [family, setFamily] = useState("");
  const [famGender, setFamGender] = useState("m");
  const [car, setCar] = useState("");
  const [ride, setRide] = useState(false);
  const [height, setHeight] = useState("");
  const [goalKg, setGoalKg] = useState("");
  const toggle = id => setMods(m => m.includes(id) ? m.filter(x => x !== id) : [...m, id]);
  const needs = [mods.includes("family"), mods.includes("car"), mods.includes("weight")].some(Boolean);
  const finish = () => onDone({ name: name.trim(), gender, modules: mods, familyName: family.trim(), familyGender: famGender, carName: car.trim(), ride: mods.includes("car") && ride, heightCm: num(height) || null, goalKg: num(goalKg) || null, onboarded: true, createdAt: Date.now() });
  const total = needs ? 4 : 3;
  const dots = h("div", { style: { display: "flex", gap: 6, justifyContent: "center", marginBottom: 18 } }, Array.from({ length: total }).map((_, i) => h("div", { key: i, style: { width: i === step ? 26 : 8, height: 8, borderRadius: 9, background: i <= step ? "var(--accent)" : "var(--line)", transition: "all .25s" } })));
  const pick = (val, cur, set, label) => h("button", { type: "button", className: "chip" + (cur === val ? " on" : ""), style: { flex: 1, padding: 11, fontSize: 14 }, onClick: () => set(val) }, label);
  const avail = modsFor({ gender }).filter(m => m.id !== "fit");
  let body;
  if (step === 0) body = h("div", { className: "fade" },
    h("div", { style: { fontSize: 24, fontWeight: 900, marginBottom: 6 } }, "أهلاً بيك 👋"),
    h("div", { style: { color: "var(--muted)", fontSize: 13, lineHeight: 1.9, marginBottom: 18 } }, "هنسألك كام سؤال سريع عشان نجهّز AllinOne على مقاسك. تقدر تغيّر أي حاجة بعدين."),
    h("div", { style: { fontSize: 15, fontWeight: 900, marginBottom: 10 } }, "إنت ولد ولا بنت؟"),
    h("div", { style: { display: "flex", gap: 10, marginBottom: 16 } }, pick("m", gender, setGender, "👨 ولد"), pick("f", gender, setGender, "👩 بنت")),
    h("button", { className: "btn btn-primary", style: { width: "100%" }, disabled: !gender, onClick: () => { if (gender === "f") setMods(m => m.includes("period") ? m : [...m, "period"]); else setMods(m => m.filter(x => x !== "period")); setStep(1); } }, "التالي"));
  else if (step === 1) body = h("div", { className: "fade" },
    h(Field, { label: "اسمك إيه؟" }, h("input", { value: name, onChange: e => setName(e.target.value), placeholder: "اسمك", maxLength: 40, autoFocus: true })),
    h("div", { style: { display: "flex", gap: 8 } },
      h("button", { className: "btn btn-ghost", onClick: () => setStep(0) }, "رجوع"),
      h("button", { className: "btn btn-primary", style: { flex: 1 }, disabled: !name.trim(), onClick: () => setStep(2) }, "التالي")));
  else if (step === 2) body = h("div", { className: "fade" },
    h("div", { style: { fontSize: 20, fontWeight: 900, marginBottom: 6 } }, "إيه اللي محتاجه؟"),
    h("div", { style: { color: "var(--muted)", fontSize: 13, marginBottom: 14 } }, "اختار الأقسام اللي تهمّك (واحد على الأقل)."),
    h("div", { style: { display: "grid", gap: 9, marginBottom: 12 } }, avail.map(m => {
      const on = mods.includes(m.id);
      return h("button", { key: m.id, onClick: () => toggle(m.id), "aria-pressed": on, style: { display: "flex", alignItems: "center", gap: 12, textAlign: "right", background: on ? "var(--card2)" : "var(--card)", border: "1.5px solid " + (on ? "var(--accent)" : "var(--line)"), borderRadius: 16, padding: "12px 13px", cursor: "pointer", color: "var(--text)" } },
        h("span", { style: { fontSize: 26 } }, m.icon),
        h("span", { style: { flex: 1 } }, h("div", { style: { fontWeight: 900, fontSize: 14 } }, m.title), h("div", { style: { fontSize: 12, color: "var(--muted)", marginTop: 2, lineHeight: 1.7 } }, m.desc)),
        h("span", { style: { width: 22, height: 22, borderRadius: 7, border: "2px solid " + (on ? "var(--accent)" : "var(--line)"), background: on ? "var(--accent)" : "transparent", color: "var(--accent-ink)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900 } }, on ? "✓" : ""));
    })),
    h("div", { style: { display: "flex", gap: 8 } },
      h("button", { className: "btn btn-ghost", onClick: () => setStep(1) }, "رجوع"),
      h("button", { className: "btn btn-primary", style: { flex: 1 }, disabled: !mods.length, onClick: () => needs ? setStep(3) : finish() }, needs ? "التالي" : "يلا نبدأ")));
  else body = h("div", { className: "fade" },
    h("div", { style: { fontSize: 20, fontWeight: 900, marginBottom: 14 } }, "كام تفصيلة كمان"),
    mods.includes("family") && h(Field, { label: "اسم الفرد (للميزانية المنفصلة)" }, h("input", { value: family, onChange: e => setFamily(e.target.value), placeholder: "مثلاً: ضحي", maxLength: 30 })),
    mods.includes("family") && h(Field, { label: "الفرد ده ولد ولا بنت؟" }, h("div", { style: { display: "flex", gap: 8 } }, pick("m", famGender, setFamGender, "👦 ولد"), pick("f", famGender, setFamGender, "👧 بنت"))),
    mods.includes("car") && h(Field, { label: "اسم/نوع عربيتك (اختياري)" }, h("input", { value: car, onChange: e => setCar(e.target.value), placeholder: "مثلاً: هيونداي النترا", maxLength: 40 })),
    mods.includes("car") && h(Field, { label: "بتشتغل بالعربية في النقل الذكي (إندرايف / أوبر)؟", hint: "لو لأ، قسم النقل الذكي مش هيظهر في العربية." }, h("div", { style: { display: "flex", gap: 8 } }, pick(true, ride, setRide, "أيوه"), pick(false, ride, setRide, "لأ"))),
    mods.includes("weight") && h("div", { style: { display: "flex", gap: 10 } },
      h("div", { style: { flex: 1 } }, h(Field, { label: "طولك (سم)" }, h("input", { type: "number", inputMode: "decimal", value: height, onChange: e => setHeight(e.target.value), placeholder: "175" }))),
      h("div", { style: { flex: 1 } }, h(Field, { label: "وزنك المستهدف (كجم)" }, h("input", { type: "number", inputMode: "decimal", value: goalKg, onChange: e => setGoalKg(e.target.value), placeholder: "80" })))),
    h("div", { style: { display: "flex", gap: 8, marginTop: 6 } },
      h("button", { className: "btn btn-ghost", onClick: () => setStep(2) }, "رجوع"),
      h("button", { className: "btn btn-primary", style: { flex: 1 }, onClick: finish }, "يلا نبدأ")));
  return h("div", { style: { minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: "24px 18px", maxWidth: 480, margin: "0 auto" } }, dots, h("div", { className: "card", style: { padding: 18 } }, body),
    h("div", { style: { textAlign: "center", marginTop: 16, fontSize: 12, color: "var(--muted)", lineHeight: 2 } },
      email && h("div", { dir: "ltr" }, email),
      onLogout && h("button", { type: "button", className: "btn btn-ghost", style: { marginTop: 6 }, onClick: onLogout }, "🔄 مش حسابي؟ تسجيل خروج / دخول بحساب تاني")));
}

// ══════════════════════════════════════════════════════════════
// المصروفات (بتتستخدم كمان لميزانية فرد من العائلة بمفتاح بيانات مختلف)
// ══════════════════════════════════════════════════════════════
const EXP_CATS = [["🛒", "أكل وسوبر ماركت"], ["🏠", "البيت والفواتير"], ["🚗", "مواصلات"], ["💊", "صحة"], ["👕", "ملابس"], ["🎓", "تعليم"], ["🎉", "ترفيه"], ["🎁", "هدايا"], ["📱", "اتصالات ونت"], ["🧾", "أخرى"]];
const INC_CATS = [["💼", "مرتب"], ["➕", "دخل إضافي"], ["🎁", "هدية"], ["💵", "أخرى"]];
const catIcon = (cat, type, ic) => ic || ((type === "inc" ? INC_CATS : EXP_CATS).find(c => c[1] === cat) || ["🧾"])[0];

const carInst = mk => { const y = +mk.slice(0, 4); return y <= 2026 ? 7000 : Math.min(10000, 7000 + (y - 2026) * 1000); };
const aptInst = mk => { const [y, mo] = mk.split("-").map(Number); const idx = y * 12 + mo, ref = 2026 * 12 + 11; const inc = idx < ref ? 0 : Math.floor((idx - ref) / 12) + 1; let v = 1030; for (let i = 0; i < inc; i++) v = Math.round(v * 1.07); return v; };
const loanInst = (l, mk) => l.sched === "car" ? carInst(mk) : l.sched === "apt" ? aptInst(mk) : (Number(l.amount) || 0);
const loanRemAt = (l, upTo) => { let rem = Number(l.remaining0) || 0, mk = l.asOf, n = 0; while (mk < upTo && rem > 0 && n++ < 700) { mk = addMonths(mk, 1); rem -= Math.min(rem, loanInst(l, mk)); } return Math.max(0, Math.round(rem * 100) / 100); };
const loanEnd = l => { let rem = Number(l.remaining0) || 0, mk = l.asOf, n = 0; if (!(loanInst(l, addMonths(mk, 1)) > 0)) return null; while (rem > 0 && n++ < 700) { mk = addMonths(mk, 1); rem -= loanInst(l, mk); } return rem <= 0 ? mk : null; };
const payDate = m => START_DAY > 1 ? addMonths(m, -1) + "-" + pad(START_DAY) : m + "-01";

function LoansTab() {
  const { get, set } = useData();
  const items = (get("loans", { items: [] }).items) || [];
  const cur = monthOf(todayStr());
  const [sheet, setSheet] = useState(false);
  const [f, setF] = useState({ name: "", original: "", remaining: "", amount: "" });
  const upd = fn => set("loans", d => ({ ...(d || {}), items: fn((d && d.items) || []) }));
  const add = () => {
    const o = num(f.original), r = num(f.remaining), a = num(f.amount);
    if (!f.name.trim() || !(a > 0) || !(r >= 0)) return alert("اكتب الاسم والمتبقي والقسط الشهري.");
    upd(l => [...l, { id: uid8(), name: f.name.trim(), cat: f.name.trim(), icon: "💳", original: o > 0 ? o : r, remaining0: r, asOf: cur, sched: "fixed", amount: a }]);
    setSheet(false); setF({ name: "", original: "", remaining: "", amount: "" });
  };
  const rows = items.map(l => ({ l, rem: loanRemAt(l, cur), inst: loanInst(l, cur), end: loanEnd(l) }));
  const totRem = rows.reduce((t, r) => t + r.rem, 0);
  const nextM = addMonths(cur, 1);
  const dueNext = rows.reduce((t, r) => t + Math.min(r.rem, loanInst(r.l, nextM)), 0);
  return h("div", { className: "fade" },
    rows.length > 0 && h("div", { style: { display: "flex", gap: 8, marginBottom: 10 } },
      h(Stat, { label: "إجمالي المتبقي", value: fmt(totRem, 0), color: "var(--danger)" }),
      h(Stat, { label: "أقساط الشهر الجاي", value: fmt(dueNext, 0) })),
    rows.length === 0 && h(Empty, { icon: "🏦", text: "مفيش قروض أو أقساط لسه.\nضيف قسط وهيتخصم تلقائي من المرتب كل شهر." }),
    rows.map(({ l, rem, inst, end }) => { const paid = Math.max(0, (Number(l.original) || 0) - rem), pct = l.original ? paid / l.original * 100 : 0; return h("div", { key: l.id, className: "card", style: { marginBottom: 10 } },
      h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 } },
        h("div", null, h("div", { style: { fontWeight: 900 } }, (l.icon || "💳") + " " + l.name), h("div", { style: { fontSize: 11, color: "var(--muted)", marginTop: 2 } }, l.sched === "car" ? "7,000 → +1,000 كل يناير لحد 10,000" : l.sched === "apt" ? "+7% كل نوفمبر (بيتقرّب لأقرب جنيه)" : "قسط ثابت شهريًا")),
        h("div", { style: { textAlign: "left" } }, h("div", { style: { fontSize: 11, color: "var(--muted)" } }, "تم السداد"), h("div", { style: { fontWeight: 900, color: "var(--ok)" } }, fmt(paid, 0)))),
      h(Bar, { pct }),
      h("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, textAlign: "center", marginTop: 10 } },
        [["الأصل", fmt(l.original, 0), "var(--muted)"], ["المتبقي", fmt(rem, 0), "var(--danger)"], ["القسط", fmt(inst, 0), "var(--accent)"]].map(([k, v, c]) => h("div", { key: k, style: { background: "var(--bg)", borderRadius: 10, padding: "8px 4px" } }, h("div", { style: { fontSize: 11, color: "var(--muted)" } }, k), h("div", { style: { fontWeight: 900, fontSize: 14, color: c } }, v)))),
      h("div", { style: { fontSize: 12, color: "var(--muted)", marginTop: 8, lineHeight: 1.8 } }, "بيتخصم تلقائي يوم " + (START_DAY > 1 ? START_DAY : 1) + " من كل شهر في «مصروفاتي».", end ? " • آخر قسط متوقع: " + monthLabel(end) : ""),
      h("button", { className: "btn btn-danger", style: { marginTop: 8, padding: "7px 12px", fontSize: 12 }, onClick: () => { if (confirmDo("تمسح القرض ده؟")) upd(a => a.filter(x => x.id !== l.id)); } }, "🗑 مسح")); }),
    h("button", { className: "btn btn-primary", style: { width: "100%" }, onClick: () => setSheet(true) }, "+ قرض / قسط جديد"),
    sheet && h(Sheet, { title: "قرض / قسط جديد", onClose: () => setSheet(false) },
      h(Field, { label: "الاسم" }, h("input", { value: f.name, onChange: e => setF({ ...f, name: e.target.value }), maxLength: 40, autoFocus: true })),
      h(Field, { label: "المبلغ الأصلي" }, h("input", { type: "number", inputMode: "decimal", value: f.original, onChange: e => setF({ ...f, original: e.target.value }) })),
      h(Field, { label: "المتبقي حاليًا" }, h("input", { type: "number", inputMode: "decimal", value: f.remaining, onChange: e => setF({ ...f, remaining: e.target.value }) })),
      h(Field, { label: "القسط الشهري" }, h("input", { type: "number", inputMode: "decimal", value: f.amount, onChange: e => setF({ ...f, amount: e.target.value }) })),
      h("button", { className: "btn btn-primary", style: { width: "100%" }, onClick: add }, "إضافة")));
}

function Fold({ title, badge, open0, children }) {
  const [open, setOpen] = useState(!!open0);
  return h("div", { className: "card", style: { marginBottom: 9, padding: 0, overflow: "hidden" } },
    h("div", { onClick: () => setOpen(!open), style: { display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", padding: "13px 14px" } },
      h("span", { style: { fontWeight: 800, fontSize: 14 } }, title),
      h("span", { style: { display: "flex", gap: 9, alignItems: "center" } }, badge != null && h("span", { style: { fontWeight: 900, color: "#8b5cf6", fontSize: 13 } }, badge), h("span", { style: { fontSize: 11, color: "var(--muted)" } }, open ? "▲" : "▼"))),
    open && h("div", { style: { padding: "0 14px 14px", borderTop: "1px solid var(--line)" } }, children));
}
function SavingsTab({ docKey }) {
  const { get, set } = useData();
  const doc = get(docKey, { log: [], needs: [] });
  const log = doc.log || [], needs = doc.needs || [];
  const [sheet, setSheet] = useState(null); // "in" | "out" | "need"
  const [f, setF] = useState({ amount: "", note: "", date: todayStr(), name: "", target: "" });
  const upd = fn => set(docKey, d => fn({ log: [], needs: [], ...(d || {}) }));
  const ins = log.filter(x => x.type === "in"), outs = log.filter(x => x.type === "out");
  const grand = sumBy(ins), spent = sumBy(outs), avail = grand - spent;
  const months = useMemo(() => { const o = {}; ins.forEach(x => { const k = monthOf(x.date); o[k] = (o[k] || 0) + x.amount; }); return Object.entries(o).sort((a, b) => a[0].localeCompare(b[0])); }, [log]);
  const manualSum = needs.reduce((t, n) => t + (n.manual != null ? +n.manual : 0), 0);
  const autoN = needs.filter(n => n.manual == null);
  const share = autoN.length ? Math.max(0, avail - manualSum) / autoN.length : 0;
  const allocOf = n => n.manual != null ? +n.manual : share;
  const open = t => { setF({ amount: "", note: "", date: todayStr(), name: "", target: "" }); setSheet(t); };
  const save = () => {
    if (sheet === "need") { const t = num(f.target); if (!f.name.trim() || !(t > 0)) return alert("اكتب الاسم والمبلغ المطلوب."); upd(d => ({ ...d, needs: [...d.needs, { id: uid8(), name: f.name.trim(), target: t, manual: null }] })); }
    else { const a = num(f.amount); if (!(a > 0)) return alert("اكتب مبلغ صحيح."); upd(d => ({ ...d, log: [{ id: uid8(), date: f.date, amount: a, type: sheet, note: f.note.trim(), src: "" }, ...d.log] })); }
    setSheet(null);
  };
  const delLog = id => { if (confirmDo("تمسح العملية دي؟")) upd(d => ({ ...d, log: d.log.filter(x => x.id !== id) })); };
  const logRow = x => h("div", { key: x.id, style: { display: "flex", alignItems: "center", gap: 8, padding: "9px 0", borderTop: "1px solid var(--line)", fontSize: 13 } },
    h("div", { style: { flex: 1, minWidth: 0 } }, h("div", { style: { fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, x.note || (x.type === "in" ? "تحويش" : "صرف")), h("div", { style: { fontSize: 11, color: "var(--muted)" } }, x.date)),
    h("div", { style: { fontWeight: 900, color: x.type === "in" ? "var(--ok)" : "var(--danger)" } }, (x.type === "in" ? "+" : "−") + fmt(x.amount)),
    h("button", { onClick: () => delLog(x.id), style: { background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 15 } }, "✕"));
  return h("div", { className: "fade" },
    h("div", { className: "card", style: { textAlign: "center", border: "2px solid #8b5cf6", marginBottom: 10 } },
      h("div", { style: { fontSize: 12, color: "#8b5cf6", fontWeight: 700 } }, "الباقي المتاح من التحويش"),
      h("div", { style: { fontSize: 34, fontWeight: 900, color: "#8b5cf6", margin: "6px 0" } }, fmt(avail, 0) + " ج"),
      h("div", { style: { fontSize: 12, color: "var(--muted)" } }, "إجمالي التحويش " + fmt(grand, 0) + " ج" + (spent > 0 ? " − اتصرف " + fmt(spent, 0) + " ج" : ""))),
    h("div", { style: { display: "flex", gap: 8, marginBottom: 12 } },
      h("button", { className: "btn btn-primary", style: { flex: 1 }, onClick: () => open("in") }, "+ تحويش"),
      h("button", { className: "btn btn-ghost", style: { flex: 1 }, onClick: () => open("out") }, "− صرف من التحويش")),
    h(Fold, { title: "📅 التحويش شهر بشهر", badge: fmt(grand, 0) + " ج" },
      months.length === 0 ? h("div", { style: { fontSize: 12, color: "var(--muted)", textAlign: "center", padding: 12 } }, "مفيش تحويش لسه") : months.map(([k, v]) => h("div", { key: k, style: { display: "flex", justifyContent: "space-between", padding: "9px 0", borderTop: "1px solid var(--line)", fontSize: 13 } }, h("span", { style: { fontWeight: k === monthOf(todayStr()) ? 900 : 700 } }, monthLabel(k)), h("span", { style: { fontWeight: 900, color: "#8b5cf6" } }, fmt(v, 0) + " ج"))),
      ins.length > 0 && h("div", { style: { marginTop: 8 } }, ins.slice().sort((a, b) => b.date.localeCompare(a.date)).map(logRow))),
    h(Fold, { title: "💸 المصروف من التحويش", badge: spent > 0 ? fmt(spent, 0) + " ج" : null },
      outs.length === 0 ? h("div", { style: { fontSize: 12, color: "var(--muted)", textAlign: "center", padding: 12 } }, "لسه معتصرفش حاجة من التحويش") : outs.slice().sort((a, b) => b.date.localeCompare(a.date)).map(logRow)),
    h(Fold, { title: "🎯 التحويش لهدف معين", badge: needs.length ? fmt(needs.reduce((t, n) => t + allocOf(n), 0), 0) + " ج" : null },
      needs.map(n => { const al = allocOf(n), pc = n.target ? al / n.target * 100 : 0; return h("div", { key: n.id, style: { padding: "10px 0", borderTop: "1px solid var(--line)" } },
        h("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 800, marginBottom: 5 } }, h("span", null, n.name), h("span", { style: { color: "#8b5cf6" } }, fmt(al, 0) + " / " + fmt(n.target, 0))),
        h(Bar, { pct: pc }),
        h("div", { style: { display: "flex", gap: 8, marginTop: 6 } },
          h("button", { className: "btn btn-ghost", style: { padding: "5px 10px", fontSize: 12 }, onClick: () => { const v = window.prompt("المبلغ المخصص يدويًا (سيبه فاضي = توزيع تلقائي):", n.manual != null ? String(n.manual) : ""); if (v === null) return; const a = num(v); upd(d => ({ ...d, needs: d.needs.map(z => z.id === n.id ? { ...z, manual: v.trim() === "" || !isFinite(a) ? null : a } : z) })); } }, "✏️ تخصيص"),
          h("button", { className: "btn btn-danger", style: { padding: "5px 10px", fontSize: 12 }, onClick: () => { if (confirmDo("تمسح الهدف؟")) upd(d => ({ ...d, needs: d.needs.filter(z => z.id !== n.id) })); } }, "🗑"))); }),
      h("button", { className: "btn btn-ghost", style: { width: "100%", marginTop: 10 }, onClick: () => open("need") }, "+ هدف للتحويش")),
    sheet && h(Sheet, { title: sheet === "in" ? "تحويش جديد" : sheet === "out" ? "صرف من التحويش" : "هدف للتحويش", onClose: () => setSheet(null) },
      sheet === "need"
        ? h(React.Fragment, null, h(Field, { label: "الاسم" }, h("input", { value: f.name, autoFocus: true, onChange: e => setF({ ...f, name: e.target.value }), maxLength: 40 })), h(Field, { label: "المبلغ المطلوب" }, h("input", { type: "number", inputMode: "decimal", value: f.target, onChange: e => setF({ ...f, target: e.target.value }) })))
        : h(React.Fragment, null, h(Field, { label: "المبلغ" }, h("input", { type: "number", inputMode: "decimal", value: f.amount, autoFocus: true, onChange: e => setF({ ...f, amount: e.target.value }), style: { fontSize: 22, fontWeight: 900 } })), h(Field, { label: "ملاحظة (اختياري)" }, h("input", { value: f.note, onChange: e => setF({ ...f, note: e.target.value }), maxLength: 80 })), h(Field, { label: "التاريخ" }, h("input", { type: "date", value: f.date, onChange: e => setF({ ...f, date: e.target.value }) }))),
      h("button", { className: "btn btn-primary", style: { width: "100%" }, onClick: save }, "حفظ")));
}

const FIXED_NAMES = new Set(["قسط العربية", "قسط الشقة / الإيجار", "الإنترنت", "الصدقات", "أمي", "ضحي — مصروف البيت"]);
function autoItemsFor(m, ctx, base) {
  const out = [], dt = payDate(m);
  if (ctx.ride) {
    const ind = ((ctx.car.ind) || []).filter(e => monthOf(e.date) === m);
    const sm = t => sumBy(ind.filter(e => e.type === t));
    const rev = sm("order"); if (rev > 0) out.push({ id: "auto_rev", auto: true, sec: "ride", type: "inc", amount: rev, cat: "دخل النقل الذكي (أوردرات)", ic: "🚕", note: "تلقائي من قسم العربية", date: dt });
    [["petrol", "بنزين النقل الذكي", "⛽"], ["tax", "ضريبة / عمولة التطبيق", "🧾"], ["tire", "نفخ كاوتش", "🛞"]].forEach(([t, c, ic]) => { const v = sm(t); if (v > 0) out.push({ id: "auto_" + t, auto: true, sec: "ride", type: "exp", amount: v, cat: c, ic, note: "تلقائي من قسم العربية", date: dt }); });
  }
  ((ctx.loans.items) || []).forEach(l => {
    if (!(m > l.asOf)) return;
    if (base.some(i => i.cat === l.cat && i.type !== "inc")) return;
    const before = loanRemAt(l, addMonths(m, -1)), pay = Math.min(before, loanInst(l, m));
    if (pay > 0) out.push({ id: "auto_loan_" + l.id, auto: true, sec: "fix", type: "exp", amount: pay, cat: l.cat || l.name, ic: l.icon || "💳", note: "قسط تلقائي — المتبقي بعده " + fmt(Math.max(0, before - pay), 0), date: dt });
  });
  ((ctx.fixed.items) || []).forEach(f => {
    if (!(m > (f.from || "9999-99"))) return;
    if (base.some(i => i.cat === f.cat && i.type !== "inc")) return;
    out.push({ id: "auto_fx_" + f.id, auto: true, sec: "fix", type: "exp", amount: Number(f.amount) || 0, cat: f.cat, ic: f.icon || "📌", note: "التزام ثابت — بيتخصم تلقائي", date: dt });
  });
  ((ctx.car.entries) || []).filter(e => monthOf(e.date) === m && e.amount > 0).forEach(e => {
    const c = carCat(e.cat), ext = e.paidBy === "tahwish" ? "tahwish" : e.paidBy === "doha" ? "doha" : null;
    out.push({ id: "auto_car_" + e.id, auto: true, sec: "car", type: "exp", amount: e.amount, cat: c.l + (e.name ? " — " + e.name : ""), ic: c.ic, note: (e.note || "") + (e.km ? " · " + fmt(e.km, 0) + " كم" : ""), date: e.date, ...(ext ? { ext } : {}) });
  });
  return out;
}
const itemsOfMonth = (m, ctx) => { const base = ctx.items.filter(i => monthOf(i.date) === m); return { base, all: base.concat(ctx.main ? autoItemsFor(m, ctx, base) : []) }; };
const totalsOf = list => { const c = list.filter(i => !i.ext); return { inc: sumBy(c.filter(i => i.type === "inc")), exp: sumBy(c.filter(i => i.type !== "inc")) }; };

function MonthsSummary({ ctx, history }) {
  const cur = monthOf(todayStr());
  const hist = (history && history.months) || {};
  const upTo = history && history.upTo;
  const keys = [];
  Object.keys(hist).sort().forEach(k => keys.push(k));
  let start = upTo ? addMonths(upTo, 1) : (ctx.items.length ? ctx.items.map(i => monthOf(i.date)).sort()[0] : cur);
  for (let k = start, n = 0; k <= cur && n < 240; k = addMonths(k, 1), n++) keys.push(k);
  const rows = keys.map(k => { const t = hist[k] && k <= (upTo || "") ? hist[k] : totalsOf(itemsOfMonth(k, ctx).all); return { k, inc: t.inc, exp: t.exp }; });
  const adjI = (history && history.adjInc) || 0, adjE = (history && history.adjExp) || 0;
  const totI = sumBy(rows, r => r.inc) + adjI, totE = sumBy(rows, r => r.exp) + adjE;
  return h("div", { style: { marginTop: 14 } },
    h("div", { style: { fontWeight: 900, fontSize: 14, margin: "0 2px 8px" } }, "📅 ملخص الشهور"),
    h("div", { className: "card", style: { padding: "4px 14px" } }, rows.map((r, i) => { const net = r.inc - r.exp; return h("div", { key: r.k, style: { padding: "11px 0", borderTop: i ? "1px solid var(--line)" : "none" } },
      h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline" } }, h("span", { style: { fontWeight: 900, fontSize: 13, color: r.k === cur ? "var(--accent)" : "var(--text)" } }, (r.k === cur ? "▶ " : "") + monthLabel(r.k)), h("span", { style: { fontWeight: 900, direction: "ltr", color: net >= 0 ? "var(--ok)" : "var(--danger)" } }, (net >= 0 ? "+" : "−") + fmt(Math.abs(net), 1))),
      h("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted)", margin: "4px 0 6px" } }, h("span", null, "دخل: " + fmt(r.inc, 1)), h("span", null, "مصاريف: " + fmt(r.exp, 1))),
      h(Bar, { pct: r.inc > 0 ? Math.min(100, r.exp / r.inc * 100) : 100, color: r.exp > r.inc ? "var(--danger)" : "var(--warn)" })); })),
    h("div", { className: "card", style: { marginTop: 10 } },
      h("div", { style: { display: "flex", justifyContent: "space-between", padding: "4px 0" } }, h("span", { style: { color: "var(--muted)", fontSize: 13 } }, "إجمالي الدخل كل الشهور"), h("span", { style: { fontWeight: 900, color: "var(--ok)" } }, fmt(totI, 0) + " ج")),
      h("div", { style: { display: "flex", justifyContent: "space-between", padding: "4px 0", borderTop: "1px solid var(--line)", marginTop: 6, paddingTop: 10 } }, h("span", { style: { color: "var(--muted)", fontSize: 13 } }, "إجمالي المصاريف كل الشهور"), h("span", { style: { fontWeight: 900, color: "var(--danger)" } }, fmt(totE, 0) + " ج"))));
}

function FixedSheet({ onClose }) {
  const { get, set } = useData();
  const items = (get("fixed", { items: [] }).items) || [];
  const [n, setN] = useState(""); const [a, setA] = useState("");
  const upd = fn => set("fixed", d => ({ ...(d || {}), items: fn((d && d.items) || []) }));
  return h(Sheet, { title: "الالتزامات الثابتة (بتتخصم يوم " + (START_DAY > 1 ? START_DAY : 1) + ")", onClose },
    items.length === 0 && h("div", { style: { fontSize: 13, color: "var(--muted)", marginBottom: 10 } }, "مفيش التزامات ثابتة لسه."),
    items.map(f => h("div", { key: f.id, style: { display: "flex", gap: 8, alignItems: "center", marginBottom: 8 } },
      h("input", { value: f.cat, onChange: e => upd(l => l.map(x => x.id === f.id ? { ...x, cat: e.target.value, name: e.target.value } : x)), style: { flex: 2, marginBottom: 0 } }),
      h("input", { type: "number", inputMode: "decimal", value: f.amount, onChange: e => upd(l => l.map(x => x.id === f.id ? { ...x, amount: e.target.value === "" ? "" : Number(e.target.value) } : x)), style: { flex: 1, marginBottom: 0 } }),
      h("button", { onClick: () => { if (confirmDo("تمسح الالتزام ده؟")) upd(l => l.filter(x => x.id !== f.id)); }, style: { background: "none", border: "none", color: "var(--danger)", fontSize: 16, cursor: "pointer" } }, "🗑"))),
    h("div", { style: { fontWeight: 800, fontSize: 13, margin: "12px 0 6px" } }, "التزام جديد"),
    h("div", { style: { display: "flex", gap: 8 } }, h("input", { value: n, onChange: e => setN(e.target.value), placeholder: "الاسم", style: { flex: 2, marginBottom: 0 } }), h("input", { type: "number", inputMode: "decimal", value: a, onChange: e => setA(e.target.value), placeholder: "المبلغ", style: { flex: 1, marginBottom: 0 } })),
    h("button", { className: "btn btn-primary", style: { width: "100%", marginTop: 10 }, onClick: () => { const v = num(a); if (!n.trim() || !(v > 0)) return alert("اكتب الاسم والمبلغ."); upd(l => [...l, { id: uid8(), cat: n.trim(), name: n.trim(), icon: "📌", amount: v, from: monthOf(todayStr()) }]); setN(""); setA(""); } }, "إضافة"),
    h("div", { style: { fontSize: 11, color: "var(--muted)", marginTop: 8, lineHeight: 1.7 } }, "التغيير بيسري من الشهر الجاي. الشهور اللي فاتت ما بتتغيّرش."));
}

function ExpensesModule({ docKey, who, ride }) {
  const { get, set } = useData();
  const doc = get(docKey, { items: [], budget: 0 });
  const items = doc.items || [];
  const [m, setM] = useState(monthOf(todayStr()));
  const [sheet, setSheet] = useState(null); // null | "add" | "budget"
  const [type, setType] = useState("exp");
  const [amount, setAmount] = useState("");
  const [cat, setCat] = useState(EXP_CATS[0][1]);
  const [note, setNote] = useState("");
  const [date, setDate] = useState(todayStr());
  const [bud, setBud] = useState("");
  const [toast, toastNode] = useToast();
  const [tab, setTab] = useState("exp");
  const main = docKey === "expenses";
  const profE = get("profile", {}); const famDoc = get("family", { items: [] });
  const famHasSal = !!profE.familyName && ((famDoc.items) || []).some(i => i.type === "inc");
  const [payer, setPayer] = useState("me");
  const carDoc = get("car", { ind: [], entries: [] }), loansDoc = get("loans", { items: [] }), fixedDoc = get("fixed", { items: [] }), histDoc = get("history", null);
  const ctx = { main, ride, items, car: carDoc, loans: loansDoc, fixed: fixedDoc };
  const baseItems = useMemo(() => items.filter(i => monthOf(i.date) === m), [items, m]);
  const autoItems = main ? autoItemsFor(m, ctx, baseItems) : [];
  const [fixSheet, setFixSheet] = useState(false);
  const mItems = baseItems.concat(autoItems);
  const cnt = mItems.filter(i => !i.ext);
  const inc = cnt.filter(i => i.type === "inc").reduce((s, i) => s + i.amount, 0);
  const exp = cnt.filter(i => i.type !== "inc").reduce((s, i) => s + i.amount, 0);
  const byCat = useMemo(() => { const o = {}; mItems.filter(i => i.type !== "inc" && !i.ext).forEach(i => { o[i.cat] = (o[i.cat] || 0) + i.amount; }); return Object.entries(o).sort((a, b) => b[1] - a[1]); }, [mItems]);
  const byDay = useMemo(() => { const o = {}; mItems.forEach(i => { (o[i.date] = o[i.date] || []).push(i); }); return Object.entries(o).sort((a, b) => b[0].localeCompare(a[0])); }, [mItems]);
  const budget = Number(doc.budget) || 0;
  const icons = useMemo(() => { const o = {}; items.forEach(i => { if (i.ic && !o[i.cat]) o[i.cat] = i.ic; }); return o; }, [items]);
  const extraCats = useMemo(() => { const base = new Set(EXP_CATS.concat(INC_CATS).map(c => c[1])); const cnt = {}; items.forEach(i => { if (!base.has(i.cat)) { const k = (i.type === "inc" ? "i|" : "e|") + i.cat; cnt[k] = (cnt[k] || 0) + 1; } }); return Object.entries(cnt).sort((x, y) => y[1] - x[1]).slice(0, 40).map(([k]) => [k.slice(0, 1) === "i" ? "inc" : "exp", k.slice(2)]); }, [items]);
  const addCat = () => { const n = (window.prompt("اسم التصنيف الجديد؟") || "").trim().slice(0, 30); if (n) setCat(n); };
  const openAdd = t => { setPayer("me"); setType(t); setAmount(""); setNote(""); setDate(todayStr()); setCat((t === "inc" ? INC_CATS : EXP_CATS)[0][1]); setSheet("add"); };
  const save = () => {
    const a = num(amount);
    if (!(a > 0)) return toast("اكتب مبلغ صحيح.");
    const pay = main && type === "exp" ? payer : "me"; const nid = uid8();
    set(docKey, d => ({ ...(d || { budget: 0 }), items: [{ id: nid, type, amount: a, cat, note: note.trim(), date, ...(pay === "save" ? { ext: "tahwish" } : pay === "fam" ? { ext: "fam" } : {}), ...(icons[cat] ? { ic: icons[cat] } : {}) }, ...((d && d.items) || [])] }));
    if (pay === "fam") set("family", d => ({ ...(d || { budget: 0 }), items: [{ id: "lk_" + nid, type: "exp", amount: a, cat, note: note.trim(), date, link: nid }, ...((d && d.items) || [])] }));
    if (pay === "save") set("savings", d => ({ log: [], needs: [], ...(d || {}), log: [{ id: "lk_" + nid, date, amount: a, type: "out", note: (cat + (note.trim() ? " - " + note.trim() : "")), src: nid }, ...(((d || {}).log) || [])] }));
    setSheet(null); setM(monthOf(date)); toast("اتسجّل ✓");
  };
  const del = id => { if (String(id).startsWith("auto_")) return toast("دي عملية تلقائية، بتتعدّل من مصدرها."); if (confirmDo("تمسح العملية دي؟")) { const it = items.find(i => i.id === id) || {}; set(docKey, d => ({ ...d, items: d.items.filter(i => i.id !== id) })); if (main && it.ext === "fam") set("family", d => ({ ...(d || {}), items: ((d && d.items) || []).filter(i => i.link !== id) })); if (main && it.ext === "tahwish") set("savings", d => ({ ...(d || {}), log: (((d || {}).log) || []).filter(x => x.src !== id) })); } };
  const saveBudget = () => { const b = num(bud); set(docKey, d => ({ ...(d || { items: [] }), budget: b > 0 ? b : 0 })); setSheet(null); };
  const left = inc - exp;
  const tabsBar = main && h("div", { style: { display: "flex", gap: 8, marginBottom: 12 } }, [["exp", "💳 المصروفات"], ["loans", "🏦 القروض"], ["sav", "💰 التحويش"]].map(([k, l]) => h("button", { key: k, className: "chip" + (tab === k ? " on" : ""), style: { flex: 1, padding: 9 }, onClick: () => setTab(k) }, l)));
  if (main && tab === "loans") return h("div", { className: "fade" }, tabsBar, h(LoansTab));
  if (main && tab === "sav") return h("div", { className: "fade" }, tabsBar, h(SavingsTab, { docKey: "savings" }));
  return h("div", { className: "fade" },
    tabsBar,
    h(MonthNav, { m, setM }),
    h("div", { style: { display: "flex", gap: 8, marginBottom: 10 } },
      h(Stat, { label: "دخل", value: fmt(inc, 0), color: "var(--ok)" }),
      h(Stat, { label: "مصروف", value: fmt(exp, 0), color: "var(--danger)" }),
      h(Stat, { label: "الصافي", value: fmt(left, 0), color: left >= 0 ? "var(--text)" : "var(--danger)" })),
    h("div", { className: "card", style: { marginBottom: 10 } },
      budget > 0
        ? h("div", null,
            h("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 800, marginBottom: 8 } }, h("span", null, "ميزانية الشهر"), h("span", { style: { color: exp > budget ? "var(--danger)" : "var(--muted)" } }, fmt(exp, 0) + " / " + fmt(budget, 0))),
            h(Bar, { pct: exp / budget * 100, color: exp > budget ? "var(--danger)" : exp > budget * .8 ? "var(--warn)" : null }),
            h("div", { style: { fontSize: 12, color: "var(--muted)", marginTop: 8 } }, exp > budget ? "تعدّيت الميزانية بـ " + fmt(exp - budget, 0) : "فاضل " + fmt(budget - exp, 0) + " من الميزانية"))
        : h("div", { style: { fontSize: 13, color: "var(--muted)" } }, "لسه ماحدّدتش ميزانية للشهر."),
      h("button", { className: "btn btn-ghost", style: { width: "100%", marginTop: 10, padding: "9px" }, onClick: () => { setBud(budget ? String(budget) : ""); setSheet("budget"); } }, budget ? "تعديل الميزانية" : "حدّد ميزانية")),
    h("div", { style: { display: "flex", gap: 8, marginBottom: 10 } },
      h("button", { className: "btn btn-primary", style: { flex: 1 }, onClick: () => openAdd("exp") }, "− مصروف"),
      h("button", { className: "btn btn-ghost", style: { flex: 1 }, onClick: () => openAdd("inc") }, "+ دخل")),
    byCat.length > 0 && h("div", { className: "card", style: { marginBottom: 10 } },
      h("div", { style: { fontWeight: 900, fontSize: 14, marginBottom: 10 } }, "المصروف حسب النوع"),
      byCat.map(([c, v]) => h("div", { key: c, style: { marginBottom: 9 } },
        h("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 } }, h("span", null, (icons[c] || catIcon(c, "exp")) + " " + c), h("span", { style: { color: "var(--muted)" } }, fmt(v, 0) + " • " + Math.round(v / exp * 100) + "%")),
        h(Bar, { pct: v / exp * 100 })))),
    (() => {
      const fixedCats = new Set(((fixedDoc.items) || []).map(f => f.cat));
      const secOf = i => i.sec || (i.type === "inc" ? "sal" : (FIXED_NAMES.has(i.cat) || fixedCats.has(i.cat)) ? "fix" : "gen");
      const row = (i, idx) => h("div", { key: i.id, style: { display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 0", borderTop: idx ? "1px solid var(--line)" : "none" } },
        h("span", { style: { fontSize: 20, marginTop: 2 } }, catIcon(i.cat, i.type, i.ic || icons[i.cat])),
        h("div", { style: { flex: 1, minWidth: 0 } }, h("div", { style: { fontWeight: 800, fontSize: 13, wordBreak: "break-word" } }, i.cat),
          h("div", { style: { fontSize: 12, color: "var(--muted)", whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.7 } }, i.date.slice(5).replace("-", "/") + ((i.ext || i.note) ? " · " : "") + (i.ext === "tahwish" ? "💰 من التحويش · " : i.ext === "doha" ? "👩 من مرتب ضحي · " : i.ext === "fam" ? "👥 من مرتب " + (profE.familyName || "الشريك") + " · " : "") + (i.note || ""))),
        h("div", { style: { fontWeight: 900, color: i.type === "inc" ? "var(--ok)" : "var(--text)", opacity: i.ext ? .45 : 1, marginTop: 2 } }, (i.type === "inc" ? "+" : "−") + fmt(i.amount)),
        i.auto ? h("span", { title: "تلقائي", style: { fontSize: 13, padding: 4, opacity: .6 } }, "⚡") : h("button", { onClick: () => del(i.id), "aria-label": "مسح", style: { background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 16, padding: 4 } }, "✕"));
      const sorted = mItems.slice().sort((a, b) => b.date.localeCompare(a.date));
      const SECS = main ? [["sal", "💼 المرتب والدخل", true], ["fix", "📌 الالتزامات (قروض وثوابت)", true], ["ride", "🚕 النقل الذكي", !!ride], ["car", "🚗 العربية (صيانة ومصروفات)", true], ["gen", "🛒 المصروفات", true]] : [["sal", "💼 الدخل", true], ["gen", "🧾 المصروفات", true]];
      if (mItems.length === 0 && !main) return h(Empty, { icon: "💳", text: "مفيش عمليات في الشهر ده لسه.\nدوس على «مصروف» وابدأ." });
      return SECS.filter(([k, , show]) => show).map(([k, title]) => {
        const list = sorted.filter(i => (main ? secOf(i) : (i.type === "inc" ? "sal" : "gen")) === k);
        const t = totalsOf(list), net = t.inc - t.exp;
        const badge = list.length === 0 ? "—" : k === "sal" ? "+" + fmt(t.inc, 0) : k === "ride" ? (net >= 0 ? "+" : "−") + fmt(Math.abs(net), 0) : "−" + fmt(t.exp, 0);
        return h(Fold, { key: k + m, title, badge, open0: k === "gen" || (!main) },
          list.length === 0 ? h("div", { style: { fontSize: 12, color: "var(--muted)", textAlign: "center", padding: 12 } }, "مفيش حاجة هنا الشهر ده") : h("div", null, list.map(row)),
          k === "fix" && h("button", { className: "btn btn-ghost", style: { width: "100%", marginTop: 8, fontSize: 13 }, onClick: () => setFixSheet(true) }, "⚙️ إدارة الالتزامات الثابتة"));
      });
    })(),
    main && h(MonthsSummary, { ctx, history: histDoc }),
    fixSheet && h(FixedSheet, { onClose: () => setFixSheet(false) }),
    sheet === "add" && h(Sheet, { title: type === "inc" ? "إضافة دخل" : "إضافة مصروف", onClose: () => setSheet(null) },
      h("div", { style: { display: "flex", gap: 8, marginBottom: 12 } }, [["exp", "مصروف"], ["inc", "دخل"]].map(([k, l]) => h("button", { key: k, className: "chip" + (type === k ? " on" : ""), style: { flex: 1, padding: 9 }, onClick: () => { setType(k); setCat((k === "inc" ? INC_CATS : EXP_CATS)[0][1]); } }, l))),
      h(Field, { label: "المبلغ" }, h("input", { type: "number", inputMode: "decimal", value: amount, onChange: e => setAmount(e.target.value), placeholder: "0", autoFocus: true, style: { fontSize: 22, fontWeight: 900 } })),
      h(Field, { label: "النوع" }, h("div", { style: { display: "flex", flexWrap: "wrap", gap: 7 } }, (type === "inc" ? INC_CATS : EXP_CATS).concat(extraCats.filter(x => x[0] === type).map(x => [icons[x[1]] || "🧾", x[1]])).concat(cat && ![...EXP_CATS, ...INC_CATS].some(c => c[1] === cat) && !extraCats.some(x => x[1] === cat) ? [["🧾", cat]] : []).map(([ic, n]) => h("button", { key: n, type: "button", className: "chip" + (cat === n ? " on" : ""), onClick: () => setCat(n) }, ic + " " + n)).concat([h("button", { key: "__new", type: "button", className: "chip", onClick: addCat }, "➕ تصنيف جديد")]))),
      main && type === "exp" && h(Field, { label: "هيتخصم من إيه؟", hint: payer === "me" ? null : payer === "fam" ? "هيتسجّل في ميزانية " + (profE.familyName || "الشريك") + " وما يتحسبش من مرتبك." : "هيتسجّل كسحب من التحويش وما يتحسبش من مرتبك." }, h("div", { style: { display: "flex", gap: 7 } }, [["me", "👤 مرتبي"]].concat(famHasSal ? [["fam", "👥 مرتب " + profE.familyName]] : []).concat([["save", "💰 التحويش"]]).map(([k, l]) => h("button", { key: k, type: "button", className: "chip" + (payer === k ? " on" : ""), style: { flex: 1, padding: 9 }, onClick: () => setPayer(k) }, l)))),
      h(Field, { label: "ملاحظة (اختياري)" }, h("input", { value: note, onChange: e => setNote(e.target.value), maxLength: 80 })),
      h(Field, { label: "التاريخ" }, h("input", { type: "date", value: date, onChange: e => setDate(e.target.value), max: "2100-01-01" })),
      h("button", { className: "btn btn-primary", style: { width: "100%" }, onClick: save }, "حفظ")),
    sheet === "budget" && h(Sheet, { title: "ميزانية الشهر", onClose: () => setSheet(null) },
      h(Field, { label: "الحد الأقصى للمصروف شهريًا", hint: "هتشوف شريط تقدّم وتنبيه لما تقرّب منها." }, h("input", { type: "number", inputMode: "decimal", value: bud, onChange: e => setBud(e.target.value), autoFocus: true })),
      h("button", { className: "btn btn-primary", style: { width: "100%" }, onClick: saveBudget }, "حفظ")),
    toastNode);
}

// ══════════════════════════════════════════════════════════════
// الأهداف المالية
// ══════════════════════════════════════════════════════════════
const GOAL_ICONS = ["🎯", "🚗", "🏠", "✈️", "💍", "🎓", "💻", "📱", "🛟", "🕋"];
function GoalsModule() {
  const { get, set } = useData();
  const doc = get("goals", { goals: [] });
  const goals = doc.goals || [];
  const [sheet, setSheet] = useState(null); // "new" | {add: id}
  const [title, setTitle] = useState(""); const [target, setTarget] = useState(""); const [icon, setIcon] = useState("🎯"); const [deadline, setDeadline] = useState("");
  const [amt, setAmt] = useState("");
  const [toast, toastNode] = useToast();
  const update = fn => set("goals", d => ({ ...(d || {}), goals: fn(((d && d.goals) || [])) }));
  const create = () => {
    const t = num(target);
    if (!title.trim() || !(t > 0)) return toast("اكتب اسم الهدف والمبلغ المطلوب.");
    update(g => [{ id: uid8(), title: title.trim(), icon, target: t, saved: 0, deadline: deadline || "", log: [], created: todayStr() }, ...g]);
    setSheet(null);
  };
  const addAmt = id => {
    const a = num(amt); if (!isFinite(a) || a === 0) return toast("اكتب مبلغ.");
    update(g => g.map(x => x.id === id ? { ...x, saved: Math.max(0, x.saved + a), log: [{ id: uid8(), date: todayStr(), amount: a }, ...x.log].slice(0, 200) } : x));
    setSheet(null); setAmt(""); toast(a > 0 ? "اتحوّش ✓" : "اتسحب ✓");
  };
  const del = id => { if (confirmDo("تمسح الهدف ده؟")) update(g => g.filter(x => x.id !== id)); };
  const monthsLeft = dl => { if (!dl) return null; const d = new Date(dl + "T00:00:00"); const n = new Date(); const mo = (d.getFullYear() - n.getFullYear()) * 12 + d.getMonth() - n.getMonth(); return mo; };
  const addTarget = sheet && sheet.add ? goals.find(g => g.id === sheet.add) : null;
  return h("div", { className: "fade" },
    h("button", { className: "btn btn-primary", style: { width: "100%", marginBottom: 14 }, onClick: () => { setTitle(""); setTarget(""); setIcon("🎯"); setDeadline(""); setSheet("new"); } }, "+ هدف جديد"),
    goals.length === 0 ? h(Empty, { icon: "🎯", text: "مفيش أهداف لسه.\nحدّد هدف وابدأ تحوّش ليه." }) :
      goals.map(g => {
        const pct = g.target ? g.saved / g.target * 100 : 0;
        const ml = monthsLeft(g.deadline);
        const rest = Math.max(0, g.target - g.saved);
        return h("div", { key: g.id, className: "card", style: { marginBottom: 10 } },
          h("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 10 } },
            h("span", { style: { fontSize: 26 } }, g.icon),
            h("div", { style: { flex: 1 } }, h("div", { style: { fontWeight: 900 } }, g.title), h("div", { style: { fontSize: 12, color: "var(--muted)" } }, fmt(g.saved, 0) + " من " + fmt(g.target, 0))),
            h("div", { style: { fontWeight: 900, color: pct >= 100 ? "var(--ok)" : "var(--accent)" } }, Math.round(pct) + "%")),
          h(Bar, { pct }),
          h("div", { style: { fontSize: 12, color: "var(--muted)", marginTop: 8, lineHeight: 1.8 } },
            pct >= 100 ? "🎉 حقّقت الهدف!" : "فاضل " + fmt(rest, 0) + (g.deadline ? (ml != null && ml > 0 ? " • محتاج تحوّش حوالي " + fmt(rest / ml, 0) + " في الشهر (لحد " + g.deadline + ")" : " • الموعد (" + g.deadline + ") قرّب/عدّى") : "")),
          h("div", { style: { display: "flex", gap: 8, marginTop: 10 } },
            h("button", { className: "btn btn-ghost", style: { flex: 1, padding: 9 }, onClick: () => { setAmt(""); setSheet({ add: g.id }); } }, "+ تحويش / سحب"),
            h("button", { className: "btn btn-danger", style: { padding: "9px 14px" }, onClick: () => del(g.id), "aria-label": "مسح الهدف" }, "🗑")));
      }),
    sheet === "new" && h(Sheet, { title: "هدف جديد", onClose: () => setSheet(null) },
      h(Field, { label: "اسم الهدف" }, h("input", { value: title, onChange: e => setTitle(e.target.value), placeholder: "مثلاً: سفرية الصيف", maxLength: 40, autoFocus: true })),
      h(Field, { label: "المبلغ المطلوب" }, h("input", { type: "number", inputMode: "decimal", value: target, onChange: e => setTarget(e.target.value) })),
      h(Field, { label: "أيقونة" }, h("div", { style: { display: "flex", flexWrap: "wrap", gap: 7 } }, GOAL_ICONS.map(i => h("button", { key: i, type: "button", className: "chip" + (icon === i ? " on" : ""), onClick: () => setIcon(i), style: { fontSize: 18 } }, i)))),
      h(Field, { label: "الموعد المستهدف (اختياري)" }, h("input", { type: "date", value: deadline, onChange: e => setDeadline(e.target.value) })),
      h("button", { className: "btn btn-primary", style: { width: "100%" }, onClick: create }, "إضافة الهدف")),
    addTarget && h(Sheet, { title: "تحويش — " + addTarget.title, onClose: () => setSheet(null) },
      h(Field, { label: "المبلغ", hint: "اكتب رقم سالب (مثلاً -200) لو سحبت من الهدف." }, h("input", { type: "number", inputMode: "decimal", value: amt, onChange: e => setAmt(e.target.value), autoFocus: true, style: { fontSize: 22, fontWeight: 900 } })),
      h("button", { className: "btn btn-primary", style: { width: "100%" }, onClick: () => addAmt(addTarget.id) }, "تأكيد")),
    toastNode);
}

function YearGoals() {
  const { get, set } = useData();
  const thisYear = new Date().getFullYear();
  const [yr, setYr] = useState(thisYear);
  const doc = get("goals", { goals: [] });
  const list = ((doc.yearly || {})[yr]) || [];
  const [ng, setNg] = useState(""); const [noteId, setNoteId] = useState(null); const [noteV, setNoteV] = useState("");
  const upd = fn => set("goals", d => ({ ...(d || {}), yearly: { ...((d && d.yearly) || {}), [yr]: fn(((d && d.yearly && d.yearly[yr]) || [])) } }));
  const done = list.filter(x => x.done).length, pct = list.length ? Math.round(done / list.length * 100) : 0;
  const add = () => { const t = ng.trim(); if (!t) return; upd(a => [...a, { id: uid8(), t, done: false }]); setNg(""); };
  const row = g => h(React.Fragment, { key: g.id },
    h("div", { style: { display: "flex", gap: 9, alignItems: "center", padding: "9px 0", borderTop: "1px solid var(--line)" } },
      h("button", { onClick: () => upd(a => a.map(x => x.id === g.id ? { ...x, done: !x.done } : x)), "aria-label": "تأشير", style: { width: 24, height: 24, borderRadius: 99, border: "2px solid " + (g.done ? "var(--ok)" : "var(--line)"), background: g.done ? "var(--ok)" : "transparent", color: "#fff", cursor: "pointer", fontSize: 13, flexShrink: 0 } }, g.done ? "✓" : ""),
      h("div", { style: { flex: 1, fontSize: 14, fontWeight: 700, textDecoration: g.done ? "line-through" : "none", color: g.done ? "var(--muted)" : "var(--text)" } }, g.t, g.note && h("div", { style: { fontSize: 11, color: "var(--accent)", fontWeight: 600, textDecoration: "none" } }, "📝 " + g.note)),
      h("button", { onClick: () => { setNoteId(noteId === g.id ? null : g.id); setNoteV(g.note || ""); }, style: { background: "none", border: "none", cursor: "pointer", fontSize: 15, opacity: g.note ? 1 : .5 } }, "📝"),
      h("button", { onClick: () => { if (confirmDo("تمسح الهدف؟")) upd(a => a.filter(x => x.id !== g.id)); }, style: { background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 16 } }, "✕")),
    noteId === g.id && h("div", { style: { display: "flex", gap: 6, paddingBottom: 8 } }, h("input", { value: noteV, autoFocus: true, onChange: e => setNoteV(e.target.value), placeholder: "ملاحظة…", style: { flex: 1, marginBottom: 0 } }), h("button", { className: "btn btn-primary", style: { padding: "0 14px" }, onClick: () => { upd(a => a.map(x => x.id === g.id ? { ...x, note: noteV.trim() } : x)); setNoteId(null); } }, "حفظ")));
  return h("div", { className: "fade" },
    h("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 } },
      h("button", { className: "btn btn-ghost", style: { padding: "8px 14px" }, onClick: () => setYr(yr - 1) }, "›"), h("div", { style: { fontWeight: 900 } }, "أهداف " + yr), h("button", { className: "btn btn-ghost", style: { padding: "8px 14px" }, onClick: () => setYr(yr + 1) }, "‹")),
    h("div", { className: "card", style: { marginBottom: 10 } },
      h("div", { style: { display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 13, marginBottom: 8 } }, h("span", null, "نسبة التحقيق"), h("span", { style: { color: pct >= 70 ? "var(--ok)" : "var(--accent)" } }, done + "/" + list.length + " (" + pct + "%)")),
      h(Bar, { pct })),
    h("div", { className: "card", style: { padding: "4px 12px", marginBottom: 10 } },
      list.length === 0 && h("div", { style: { fontSize: 13, color: "var(--muted)", textAlign: "center", padding: 16 } }, "مفيش أهداف للسنة دي لسه."),
      list.filter(x => !x.done).map(row), list.filter(x => x.done).map(row)),
    h("div", { style: { display: "flex", gap: 8 } }, h("input", { value: ng, onChange: e => setNg(e.target.value), onKeyDown: e => { if (e.key === "Enter") add(); }, placeholder: "أضف هدف جديد…", style: { flex: 1, marginBottom: 0 } }), h("button", { className: "btn btn-primary", onClick: add, style: { padding: "0 18px" } }, "+")));
}
function GoalsHub() {
  const [tab, setTab] = useState("year");
  return h("div", null,
    h("div", { style: { display: "flex", gap: 8, marginBottom: 12 } }, [["year", "📋 قائمة " + new Date().getFullYear()], ["money", "💰 أهداف مالية"]].map(([k, l]) => h("button", { key: k, className: "chip" + (tab === k ? " on" : ""), style: { flex: 1, padding: 9 }, onClick: () => setTab(k) }, l))),
    tab === "year" ? h(YearGoals) : h(GoalsModule));
}

// ══════════════════════════════════════════════════════════════
// الأهداف اليومية — بتتأشّر تلقائي من الأذكار وقراءة السور
// ══════════════════════════════════════════════════════════════
const DAILY_DEFAULT = [["d1", "أذكار الصباح"], ["d2", "أذكار المساء"], ["d3", "الصلاة في ميعادها"], ["d4", "ورد القرآن"], ["d5", "تمرين"]].map(([id, t]) => ({ id, t }));
const nzAr = s => String(s || "").replace(/[ً-ٰٟـ]/g, "").replace(/[أإآٱ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").replace(/[^ء-يa-z0-9 ]/gi, " ").replace(/\s+/g, " ").trim();
const dailyAuto = t => { const n = nzAr(t); if (n.includes("اذكار الصباح")) return { k: "morning" }; if (n.includes("اذكار المساء")) return { k: "evening" }; if (n.includes("تمرين")) return { k: "workout" }; const mm = /(^| )سوره (.+)$/.exec(n); if (mm && !/ربع|جزء|صفحه|اول|نصف|اخر|ايه|اية/.test(n)) return { k: "surah", name: mm[2] }; return null; };
const dailyDoc = d => { d = d || {}; return { ...d, defs: d.defs && d.defs.length ? d.defs : DAILY_DEFAULT, days: d.days || {} }; };
function dailyTick(set, date, match) {
  set("daily", d => { const o = dailyDoc(d); const ids = o.defs.filter(x => match(x)).map(x => x.id); if (!ids.length) return d || o; const cur = new Set(o.days[date] || []); let ch = false; ids.forEach(i => { if (!cur.has(i)) { cur.add(i); ch = true; } }); return ch ? { ...o, days: { ...o.days, [date]: [...cur] } } : (d || o); });
}
function DailyModule() {
  const { get, set } = useData();
  const o = dailyDoc(get("daily", {}));
  const [date, setDate] = useState(todayStr());
  const [ng, setNg] = useState(""); const [rep, setRep] = useState(false);
  const doneSet = new Set(o.days[date] || []);
  const pct = o.defs.length ? Math.round(o.defs.filter(x => doneSet.has(x.id)).length / o.defs.length * 100) : 0;
  const shift = k => { const dt = new Date(date + "T00:00:00"); dt.setDate(dt.getDate() + k); const n = dt.getFullYear() + "-" + pad(dt.getMonth() + 1) + "-" + pad(dt.getDate()); if (n <= todayStr()) setDate(n); };
  const toggle = id => set("daily", d => { const x = dailyDoc(d); const cur = new Set(x.days[date] || []); cur.has(id) ? cur.delete(id) : cur.add(id); return { ...x, days: { ...x.days, [date]: [...cur] } }; });
  const addDef = () => { const t = ng.trim(); if (!t) return; set("daily", d => { const x = dailyDoc(d); return { ...x, defs: [...x.defs, { id: uid8(), t }] }; }); setNg(""); };
  const delDef = id => { if (confirmDo("تمسح الهدف ده من القائمة؟")) set("daily", d => { const x = dailyDoc(d); return { ...x, defs: x.defs.filter(z => z.id !== id) }; }); };
  const mon = date.slice(0, 7);
  const report = useMemo(() => { const dates = Object.keys(o.days).filter(k => k.startsWith(mon)); if (!dates.includes(date) && date.startsWith(mon)) dates.push(date); return o.defs.map(df => ({ t: df.t, days: dates.filter(k => (o.days[k] || []).includes(df.id)).length, total: dates.length })); }, [o, mon, date]);
  const msg = pct >= 90 ? "ما شاء الله، يوم ممتاز 🌟" : pct >= 60 ? "كويس جدًا، كمّل 💪" : pct >= 30 ? "بداية حلوة، لسه فاضل شوية 🌱" : "يلا ابدأ بأول واحدة، ربنا يعينك 🤍";
  return h("div", { className: "fade" },
    h("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 } },
      h("button", { className: "btn btn-ghost", style: { padding: "8px 14px" }, onClick: () => shift(-1) }, "›"), h("div", { style: { fontWeight: 900 } }, date === todayStr() ? "النهارده" : dayLabel(date)), h("button", { className: "btn btn-ghost", style: { padding: "8px 14px", opacity: date >= todayStr() ? .4 : 1 }, onClick: () => shift(1) }, "‹")),
    h("div", { className: "card", style: { marginBottom: 10 } },
      h("div", { style: { display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 13, marginBottom: 8 } }, h("span", null, "إنجازك"), h("span", { style: { fontSize: 18, color: pct >= 70 ? "var(--ok)" : "var(--accent)" } }, pct + "%")),
      h(Bar, { pct }),
      h("div", { style: { marginTop: 10 } }, o.defs.map(df => { const on = doneSet.has(df.id), au = dailyAuto(df.t); return h("div", { key: df.id, onClick: () => toggle(df.id), style: { display: "flex", gap: 10, alignItems: "center", padding: "10px 0", borderTop: "1px solid var(--line)", cursor: "pointer" } },
        h("span", { style: { width: 22, height: 22, borderRadius: 6, border: "2px solid " + (on ? "var(--ok)" : "var(--line)"), background: on ? "var(--ok)" : "transparent", color: "#fff", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 } }, on ? "✓" : ""),
        h("span", { style: { flex: 1, fontSize: 14, fontWeight: 700, textDecoration: on ? "line-through" : "none", color: on ? "var(--muted)" : "var(--text)" } }, df.t, au && h("span", { title: "بيتأشّر تلقائي", style: { marginRight: 6, fontSize: 11 } }, " ⚡")),
        h("button", { onClick: e => { e.stopPropagation(); delDef(df.id); }, style: { background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 15 } }, "✕")); })),
      h("div", { style: { display: "flex", gap: 8, marginTop: 10 } }, h("input", { value: ng, onChange: e => setNg(e.target.value), onKeyDown: e => { if (e.key === "Enter") addDef(); }, placeholder: "هدف يومي جديد… (مثال: قراءة سورة الكهف)", style: { flex: 1, marginBottom: 0 } }), h("button", { className: "btn btn-primary", onClick: addDef, style: { padding: "0 18px" } }, "+")),
      h("div", { style: { fontSize: 11, color: "var(--muted)", marginTop: 8, lineHeight: 1.7 } }, "⚡ = بيتأشّر لوحده: أذكار الصباح/المساء لما تخلّصها، و«قراءة سورة …» لما توصل لآخر السورة في المصحف.")),
    h("div", { className: "card", style: { textAlign: "center", fontSize: 13, marginBottom: 10 } }, msg),
    h("button", { className: "btn btn-ghost", style: { width: "100%", marginBottom: 10 }, onClick: () => setRep(!rep) }, rep ? "▲ إخفاء تقرير الشهر" : "📊 تقرير الشهر"),
    rep && h("div", { className: "card" }, h("div", { style: { fontWeight: 900, marginBottom: 10 } }, "تقرير " + monthLabel(mon)),
      report.map((r, i) => { const pc = r.total ? Math.round(r.days / r.total * 100) : 0; return h("div", { key: i, style: { marginBottom: 10 } }, h("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 } }, h("span", null, r.t), h("span", { style: { color: pc >= 70 ? "var(--ok)" : "var(--muted)", fontWeight: 800 } }, r.days + "/" + r.total + " (" + pc + "%)")), h(Bar, { pct: pc })); })));
}

// ══════════════════════════════════════════════════════════════
// العربية: سجل صيانة + عداد ومواعيد بالكيلومتر + احتياجات + النقل الذكي + تقرير
// ══════════════════════════════════════════════════════════════
const CAR_CATS = [["oil", "زيت وفلاتر", "🛢️", "#d99a1d"], ["brakes", "فرامل", "⚙️", "#d6453d"], ["engine", "موتور وميكانيكا", "🔩", "#7c5cd6"], ["elec", "كهرباء", "⚡", "#2f7fd1"], ["tires", "كاوتش وعجل", "🔘", "#7b8794"], ["suspension", "تعليق وميزان", "🔧", "#23966a"], ["other", "تاني", "🔨", "#6b7280"]];
const carCat = id => { const c = CAR_CATS.find(x => x[0] === id) || CAR_CATS[6]; return { id: c[0], l: c[1], ic: c[2], c: c[3] }; };
const IND_TYPES = { order: ["📦", "أوردر"], petrol: ["⛽", "بنزين"], tax: ["🧾", "ضريبة / عمولة التطبيق"], tire: ["🛞", "نفخ كاوتش"] };
const sumBy = (a, f) => a.reduce((s, x) => s + (Number(f ? f(x) : x.amount) || 0), 0);

function CarModule({ prof }) {
  const { get, set } = useData();
  const doc = get("car", {});
  const entries = doc.entries || [], odo = doc.odo || {}, needs = doc.needs || [], ind = doc.ind || [];
  const petrolPrice = doc.petrolPrice || 24;
  const upd = fn => set("car", d => fn({ entries: [], odo: {}, needs: [], ind: [], petrolPrice: 24, ...(d || {}) }));
  const [view, setView] = useState("list");
  const [m, setM] = useState(monthOf(todayStr()));
  const [scope, setScope] = useState("month");
  const [flt, setFlt] = useState("all");
  const [form, setForm] = useState({ amount: "", cat: "oil", note: "", date: todayStr(), paidBy: "me", dueKm: "" });
  const [odoIn, setOdoIn] = useState("");
  const [editDue, setEditDue] = useState(null); const [editVal, setEditVal] = useState("");
  const [newNeed, setNewNeed] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [toast, toastNode] = useToast();
  const all = useMemo(() => entries.slice().sort((a, b) => b.date.localeCompare(a.date)), [entries]);
  const curOdo = Math.max(0, ...Object.values(odo).map(Number).filter(v => v > 0));
  const thisM = monthOf(todayStr());
  const needsOdo = !odo[thisM];
  const dueList = all.filter(e => e.dueKm > 0).map(e => ({ id: e.id, label: e.note || e.name || "صيانة", ic: carCat(e.cat).ic, dueKm: e.dueKm, left: curOdo ? e.dueKm - curOdo : null })).sort((a, b) => (a.left == null ? 1e9 : a.left) - (b.left == null ? 1e9 : b.left));
  const mCar = all.filter(e => monthOf(e.date) === m);
  const base = scope === "all" ? all : mCar;
  const shown = flt === "all" ? base : base.filter(e => e.cat === flt);
  const tAll = sumBy(all), tMon = sumBy(mCar);
  const firstDate = all.length ? all[all.length - 1].date : null;
  const saveOdo = () => { const v = num(odoIn); if (!(v > 0)) return toast("اكتب قراءة صحيحة."); upd(d => ({ ...d, odo: { ...d.odo, [thisM]: v } })); setOdoIn(""); toast("اتحفظ ✓"); };
  const saveDue = id => { const v = num(editVal); upd(d => ({ ...d, entries: d.entries.map(e => e.id === id ? { ...e, dueKm: v > 0 ? v : 0 } : e) })); setEditDue(null); setEditVal(""); };
  const doAdd = () => {
    const a = num(form.amount); if (!(a > 0)) return toast("اكتب المبلغ.");
    upd(d => ({ ...d, entries: [{ id: uid8(), date: form.date, cat: form.cat, name: "", note: form.note.trim(), amount: a, km: 0, dueKm: num(form.dueKm) > 0 ? num(form.dueKm) : 0, paidBy: form.paidBy }, ...d.entries] }));
    setForm(f => ({ ...f, amount: "", note: "", dueKm: "", paidBy: "me" })); setM(monthOf(form.date)); setView("list"); toast("اتضاف ✓");
  };
  const delEntry = id => { if (confirmDo("تحذف الصيانة دي؟")) upd(d => ({ ...d, entries: d.entries.filter(e => e.id !== id) })); };
  const setNeeds = fn => upd(d => ({ ...d, needs: fn(d.needs || []) }));
  const addNeed = () => { if (!newNeed.trim()) return; setNeeds(n => [...n, { name: newNeed.trim(), done: false }]); setNewNeed(""); };
  const tabs = [["list", "السجل"], ["add", "➕"], ["needs", "احتياجات"]].concat(prof.ride ? [["ind", "🛺 النقل الذكي"]] : []).concat([["stats", "تقرير"]]);
  const paidLbl = p => p === "fam" ? " · 👥 " + (prof.familyName || "الفرد") : p === "save" ? " · 💰 من التحويش" : "";
  const box = (children, st) => h("div", { className: "card", style: { marginBottom: 10, ...(st || {}) } }, children);
  const lbl = t => h("div", { style: { fontSize: 12, color: "var(--muted)", fontWeight: 800, margin: "4px 2px 7px" } }, t);
  const analyze = async () => {
    if (!all.length) return toast("مفيش بيانات للتحليل.");
    setAiBusy(true);
    try {
      const lines = CAR_CATS.map(c => { const it = all.filter(e => e.cat === c[0]); return it.length ? c[1] + ": " + sumBy(it) + " ج (" + it.length + " عملية)" : null; }).filter(Boolean);
      const t = await askAI("أنا بتابع مصاريف عربيتي. اتكلم بالعامية المصرية باختصار ووضوح. حلّل المصاريف دي وقولي أكتر بند بياخد فلوس وإيه اللي ممكن أوفره وإيه الصيانة اللي لازم أنتبه لها.\nإجمالي كل الفترة: " + tAll + " ج، الشهر ده: " + tMon + " ج\nحسب البند:\n" + lines.join("\n") + (curOdo ? "\nالعداد الحالي: " + curOdo + " كم" : ""));
      upd(d => ({ ...d, ai: { text: t, at: Date.now() } }));
    } catch (e) { toast(e.message); }
    setAiBusy(false);
  };

  const tabBar = h("div", { style: { display: "flex", gap: 7, marginBottom: 12, overflowX: "auto", paddingBottom: 2 } }, tabs.map(([k, l]) => h("button", { key: k, className: "chip" + (view === k ? " on" : ""), style: { flex: k === "add" ? "0 0 auto" : 1 }, onClick: () => setView(k) }, l)));
  const topCards = view !== "ind" && h("div", { style: { display: "flex", gap: 8, marginBottom: 10 } },
    h(Stat, { label: "هذا الشهر", value: fmt(tMon, 0) + " ج", color: "var(--accent)" }),
    h(Stat, { label: "كل الفترة" + (firstDate ? " (" + MONTHS_AR[+firstDate.slice(5, 7) - 1] + " " + firstDate.slice(0, 4) + "→)" : ""), value: fmt(tAll, 0) + " ج" }));

  let body = null;
  if (view === "list") body = h("div", null,
    box([
      h("div", { key: "t", style: { fontSize: 13, fontWeight: 800, marginBottom: 4 } }, needsOdo ? "🔔 دخلنا شهر جديد! سجّل عداد العربية" : "📟 عداد العربية"),
      h("div", { key: "s", style: { fontSize: 12, color: "var(--muted)", marginBottom: 9 } }, curOdo > 0 ? "آخر قراءة معروفة: " + fmt(curOdo, 0) + " كم" : "لسه معندناش أي قراءة"),
      h("div", { key: "i", style: { display: "flex", gap: 8 } },
        h("input", { type: "number", inputMode: "numeric", placeholder: needsOdo ? "اكتب عداد الشهر ده..." : "تحديث العداد", value: odoIn, onChange: e => setOdoIn(e.target.value) }),
        h("button", { className: "btn btn-primary", style: { padding: "0 20px" }, onClick: saveOdo }, "حفظ"))]),
    lbl("🔔 المواعيد الجاية"),
    dueList.length === 0 ? box(h("div", { style: { fontSize: 12, color: "var(--muted)", lineHeight: 1.9 } }, "مفيش أي بند محدد له ميعاد جاي. لما تضيف صيانة، املا خانة «🎯 الميعاد الجاي عند (كم)» وهيظهر هنا تنبيه أوتوماتيك.")) :
      box(dueList.map((it, i) => {
        const color = it.left == null ? "var(--muted)" : it.left <= 0 ? "var(--danger)" : it.left <= 1000 ? "var(--warn)" : "var(--ok)";
        const ed = editDue === it.id;
        return h("div", { key: it.id, style: { paddingBottom: 10, marginBottom: i < dueList.length - 1 ? 10 : 0, borderBottom: i < dueList.length - 1 ? "1px solid var(--line)" : "none" } },
          h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6 } },
            h("span", { style: { fontSize: 13, fontWeight: 800, flex: 1 } }, it.ic + " " + it.label),
            it.left != null && h("span", { style: { fontSize: 12, fontWeight: 800, color, whiteSpace: "nowrap" } }, it.left <= 0 ? "⚠️ متأخر " + fmt(Math.abs(it.left), 0) + " كم" : "باقي " + fmt(it.left, 0) + " كم"),
            h("button", { onClick: () => { setEditDue(ed ? null : it.id); setEditVal(ed ? "" : String(it.dueKm)); }, style: { background: "none", border: "none", cursor: "pointer", fontSize: 14, padding: "0 2px" }, "aria-label": "تعديل" }, "✏️")),
          ed && h("div", { style: { display: "flex", gap: 7, marginTop: 8 } }, h("input", { type: "number", inputMode: "numeric", value: editVal, onChange: e => setEditVal(e.target.value) }), h("button", { className: "btn btn-primary", style: { padding: "0 16px" }, onClick: () => saveDue(it.id) }, "حفظ")),
          it.left != null && !ed && h("div", { style: { marginTop: 8 } }, h(Bar, { pct: curOdo ? (curOdo - (it.dueKm - 7000)) / 7000 * 100 : 0, color })));
      })),
    h(MonthNav, { m, setM }),
    h("div", { style: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 } },
      h("button", { className: "chip" + (scope === "month" && flt === "all" ? " on" : ""), onClick: () => { setScope("month"); setFlt("all"); } }, "الشهر ده (" + mCar.length + ")"),
      h("button", { className: "chip" + (scope === "all" && flt === "all" ? " on" : ""), onClick: () => { setScope("all"); setFlt("all"); } }, "كل الفترة (" + all.length + ")"),
      CAR_CATS.map(c => { const n = base.filter(e => e.cat === c[0]).length; return n ? h("button", { key: c[0], className: "chip" + (flt === c[0] ? " on" : ""), onClick: () => setFlt(c[0]) }, c[2] + " " + c[1] + " (" + n + ")") : null; })),
    shown.length === 0 ? h(Empty, { icon: "🚗", text: scope === "all" ? "مفيش عمليات في التصنيف ده." : "مفيش عمليات في الشهر ده." }) :
      h("div", { className: "card", style: { padding: "4px 12px" } }, shown.map((e, idx) => {
        const c = carCat(e.cat); const ed = editDue === "r" + e.id;
        const title = e.name || e.note;
        const sub = [e.date, e.km ? fmt(e.km, 0) + " كم" : "", e.name && e.note ? e.note : ""].filter(Boolean).join(" · ") + paidLbl(e.paidBy) + (e.dueKm ? " · 🎯 الميعاد عند " + fmt(e.dueKm, 0) : "");
        return h("div", { key: e.id, style: { borderTop: idx ? "1px solid var(--line)" : "none", padding: "10px 0" } },
          h("div", { style: { display: "flex", alignItems: "center", gap: 10 } },
            h("span", { style: { fontSize: 20 } }, c.ic),
            h("div", { style: { flex: 1, minWidth: 0 } }, h("div", { style: { fontWeight: 800, fontSize: 13 } }, title || c.l), h("div", { style: { fontSize: 11, color: "var(--muted)", marginTop: 2 } }, sub)),
            h("span", { style: { fontWeight: 900, fontSize: 13, color: c.c, whiteSpace: "nowrap" } }, fmt(e.amount, 0) + " ج"),
            h("button", { onClick: () => { setEditDue(ed ? null : "r" + e.id); setEditVal(ed ? "" : String(e.dueKm || "")); }, style: { background: "none", border: "none", cursor: "pointer", fontSize: 14, opacity: e.dueKm ? 1 : .5 }, "aria-label": "الميعاد الجاي" }, "🎯"),
            h("button", { onClick: () => delEntry(e.id), style: { background: "none", border: "none", cursor: "pointer", fontSize: 14, opacity: .6 }, "aria-label": "مسح" }, "🗑️")),
          ed && h("div", { style: { display: "flex", gap: 7, marginTop: 8 } }, h("input", { type: "number", inputMode: "numeric", placeholder: "الميعاد الجاي عند (كم)", value: editVal, onChange: ev => setEditVal(ev.target.value) }), h("button", { className: "btn btn-primary", style: { padding: "0 16px" }, onClick: () => saveDue(e.id) }, "حفظ")));
      })));
  else if (view === "add") body = box([
    h("div", { key: "h", style: { fontWeight: 900, fontSize: 14, marginBottom: 10 } }, "إضافة صيانة"),
    h(Field, { key: "a", label: "المبلغ" }, h("input", { type: "number", inputMode: "decimal", value: form.amount, onChange: e => setForm(f => ({ ...f, amount: e.target.value })), placeholder: "0", style: { fontSize: 22, fontWeight: 900 } })),
    h("div", { key: "c", style: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 7, marginBottom: 12 } }, CAR_CATS.map(c => h("button", { key: c[0], type: "button", className: "chip" + (form.cat === c[0] ? " on" : ""), style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "9px 4px", borderRadius: 14, whiteSpace: "normal", textAlign: "center", fontSize: 12 }, onClick: () => setForm(f => ({ ...f, cat: c[0] })) }, h("span", { style: { fontSize: 20 } }, c[2]), c[1]))),
    h(Field, { key: "d", label: "التاريخ" }, h("input", { type: "date", value: form.date, onChange: e => setForm(f => ({ ...f, date: e.target.value })) })),
    h(Field, { key: "n", label: "التفاصيل" }, h("input", { value: form.note, onChange: e => setForm(f => ({ ...f, note: e.target.value })), placeholder: "مثلاً: تغيير زيت 10 آلاف", maxLength: 120 })),
    h(Field, { key: "k", label: "🎯 الميعاد الجاي عند (كم) — اختياري", hint: "هيتحط عليه تنبيه لوحده في «المواعيد الجاية»." }, h("input", { type: "number", inputMode: "numeric", value: form.dueKm, onChange: e => setForm(f => ({ ...f, dueKm: e.target.value })), placeholder: "مثلاً 233130" })),
    h(Field, { key: "p", label: "هتتخصم من مرتب مين؟" }, h("div", { style: { display: "flex", gap: 7 } }, [["me", "👤 مرتبي"]].concat(prof.familyName ? [["fam", "👥 " + prof.familyName]] : []).concat([["save", "💰 من التحويش"]]).map(([k, l]) => h("button", { key: k, type: "button", className: "chip" + (form.paidBy === k ? " on" : ""), style: { flex: 1, padding: 9 }, onClick: () => setForm(f => ({ ...f, paidBy: k })) }, l)))),
    h("button", { key: "s", className: "btn btn-primary", style: { width: "100%" }, onClick: doAdd }, "إضافة ✓")]);
  else if (view === "needs") body = box([
    h("div", { key: "i", style: { display: "flex", gap: 8, marginBottom: 10 } },
      h("input", { value: newNeed, onChange: e => setNewNeed(e.target.value), onKeyDown: e => { if (e.key === "Enter") addNeed(); }, placeholder: "أضف احتياج جديد...", maxLength: 80 }),
      h("button", { className: "btn btn-primary", style: { padding: "0 18px", fontSize: 18 }, onClick: addNeed, "aria-label": "إضافة" }, "+")),
    h("div", { key: "c", style: { fontSize: 12, color: "var(--muted)", marginBottom: 4 } }, needs.filter(x => x.done).length + " / " + needs.length + " تم"),
    needs.length === 0 && h("div", { key: "e", style: { fontSize: 12, color: "var(--muted)", padding: "10px 0" } }, "لسه مفيش احتياجات. ضيف اللي ناقص في العربية."),
    needs.map((it, i) => h("div", { key: i, style: { display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderTop: "1px solid var(--line)" } },
      h("div", { onClick: () => setNeeds(n => n.map((x, k) => k === i ? { ...x, done: !x.done } : x)), style: { width: 26, height: 26, borderRadius: 99, flexShrink: 0, cursor: "pointer", background: it.done ? "var(--ok)" : "transparent", border: "2.5px solid " + (it.done ? "var(--ok)" : "var(--danger)"), display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 900 } }, it.done ? "✓" : ""),
      h("span", { onClick: () => setNeeds(n => n.map((x, k) => k === i ? { ...x, done: !x.done } : x)), style: { fontSize: 13, flex: 1, cursor: "pointer", color: it.done ? "var(--muted)" : "var(--text)", textDecoration: it.done ? "line-through" : "none" } }, it.name),
      h("button", { onClick: () => setNeeds(n => n.filter((_, k) => k !== i)), style: { background: "none", border: "none", cursor: "pointer", fontSize: 15, opacity: .6 }, "aria-label": "مسح" }, "🗑")))]);
  else if (view === "ind") body = h(RideSection, { ind, petrolPrice, upd, m, setM, toast });
  else if (view === "stats") {
    const byMon = {}; all.forEach(e => { const k = monthOf(e.date); (byMon[k] = byMon[k] || { total: 0, cnt: 0 }); byMon[k].total += e.amount; byMon[k].cnt++; });
    const byY = {}; all.forEach(e => { const y = e.date.slice(0, 4); byY[y] = (byY[y] || 0) + e.amount; });
    const mKeys = Object.keys(byMon).sort().reverse(); const maxM = Math.max(1, ...mKeys.map(k => byMon[k].total));
    const top = mKeys.slice().sort((a, b) => byMon[b].total - byMon[a].total)[0];
    body = h("div", null,
      h("div", { style: { display: "flex", gap: 8, marginBottom: 8 } },
        h(Stat, { label: "📊 متوسط الشهر", value: fmt(tAll / Math.max(1, mKeys.length), 0) + " ج", color: "var(--ok)" }),
        top && h(Stat, { label: "🔥 أعلى شهر", value: fmt(byMon[top].total, 0) + " ج", sub: monthLabel(top), color: "var(--danger)" })),
      lbl("🔧 حسب التصنيف"),
      box(CAR_CATS.map(c => { const it = all.filter(e => e.cat === c[0]); if (!it.length) return null; const t = sumBy(it); return h("div", { key: c[0], onClick: () => { setFlt(c[0]); setScope("all"); setView("list"); }, style: { marginBottom: 11, cursor: "pointer" } },
        h("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 12 } }, h("span", null, c[2] + " " + c[1] + " (" + it.length + ")"), h("span", { style: { textAlign: "left" } }, h("b", { style: { color: c[3] } }, fmt(t, 0) + " ج"), h("span", { style: { color: "var(--muted)", fontSize: 10 } }, "  متوسط " + fmt(t / it.length, 0)))),
        h(Bar, { pct: tAll ? t / tAll * 100 : 0, color: c[3] })); })),
      lbl("📅 حسب الشهر"),
      box(mKeys.map(k => h("div", { key: k, style: { padding: "7px 0", borderBottom: "1px solid var(--line)" } },
        h("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 12 } }, h("span", { style: { fontWeight: k === m ? 900 : 600 } }, monthLabel(k)), h("span", null, h("b", null, fmt(byMon[k].total, 0) + " ج"), h("span", { style: { color: "var(--muted)", fontSize: 10 } }, " (" + byMon[k].cnt + " عملية)"))),
        h(Bar, { pct: byMon[k].total / maxM * 100 })))),
      lbl("📆 ملخص السنوات"),
      box(Object.entries(byY).sort().map(([y, v]) => h("div", { key: y, style: { display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid var(--line)" } }, h("span", { style: { fontWeight: 800 } }, "📅 " + y), h("b", null, fmt(v, 0) + " ج")))),
      box([h("div", { key: "t", style: { fontWeight: 900, fontSize: 14, marginBottom: 8 } }, "🤖 تحليل بالذكاء الاصطناعي"),
        doc.ai && h("div", { key: "x", style: { fontSize: 13, lineHeight: 2, whiteSpace: "pre-wrap", marginBottom: 10 } }, doc.ai.text),
        h("button", { key: "b", className: "btn btn-ghost", style: { width: "100%" }, disabled: aiBusy, onClick: analyze }, aiBusy ? "بيحلّل…" : doc.ai ? "حلّل تاني" : "حلّل مصاريف العربية")]));
  }
  return h("div", { className: "fade" },
    prof.carName && h("div", { style: { fontSize: 13, color: "var(--muted)", marginBottom: 8, fontWeight: 700 } }, "🚘 " + prof.carName),
    tabBar, topCards, body, toastNode);
}

// ── النقل الذكي (إندرايف / أوبر): أوردرات وبنزين وضريبة ونفخ كاوتش ──
function RideSection({ ind, petrolPrice, upd, m, setM, toast }) {
  const [view, setView] = useState("month");
  const [f, setF] = useState({ type: "order", amount: "", date: todayStr(), note: "", liters: "", km: "" });
  const summarize = list => { const o = { orders: 0, rev: 0, petrol: 0, fills: 0, tax: 0, tire: 0, liters: 0, km: 0, entries: list }; list.forEach(e => { if (e.type === "order") { o.orders += e.count || 1; o.rev += e.amount; } else if (e.type === "tax") o.tax += e.amount; else if (e.type === "tire") o.tire += e.amount; else { o.petrol += e.amount; o.fills++; if (e.liters && e.km) { o.liters += e.liters; o.km += e.km; } } }); o.net = o.rev - o.petrol - o.tax - o.tire; return o; };
  const byM = useMemo(() => { const g = {}; ind.forEach(e => { (g[monthOf(e.date)] = g[monthOf(e.date)] || []).push(e); }); return g; }, [ind]);
  const months = Object.keys(byM).sort().reverse();
  const cur = summarize(byM[m] || []);
  const grand = summarize(ind);
  const doAdd = () => {
    const a = num(f.amount); if (!(a > 0)) return toast("اكتب المبلغ.");
    const e = { id: uid8(), type: f.type, amount: a, date: f.date, note: f.note.trim() };
    if (f.type === "petrol") { e.liters = num(f.liters) > 0 ? num(f.liters) : 0; e.km = num(f.km) > 0 ? num(f.km) : 0; e.price = Number(petrolPrice) || 0; }
    upd(d => ({ ...d, ind: [e, ...d.ind] })); setF(x => ({ ...x, amount: "", note: "", liters: "", km: "" })); setM(monthOf(f.date)); setView("month");
    toast("اتضاف ✓");
  };
  const del = id => { if (confirmDo("تحذف العملية دي؟")) upd(d => ({ ...d, ind: d.ind.filter(e => e.id !== id) })); };
  const rate = (l, k) => l > 0 ? (k / l).toFixed(1) : "0.0";
  const sc = (l, v, c) => h("div", { className: "card", style: { padding: 12, background: "color-mix(in srgb," + c + " 12%, var(--card))" } }, h("div", { style: { fontSize: 11, color: "var(--muted)", fontWeight: 700 } }, l), h("div", { style: { fontSize: 18, fontWeight: 900, marginTop: 4 } }, v));
  const tabsRow = h("div", { style: { display: "flex", gap: 7, marginBottom: 12 } }, [["month", "الشهر الحالي"], ["add", "➕ أضف"], ["all", "كل الشهور"]].map(([k, l]) => h("button", { key: k, className: "chip" + (view === k ? " on" : ""), style: { flex: 1 }, onClick: () => setView(k) }, l)));
  let body;
  if (view === "month") {
    const pe = cur.entries.filter(e => e.type === "petrol" && e.liters && e.km);
    body = h("div", null, h(MonthNav, { m, setM }),
      h("div", { style: { fontWeight: 900, fontSize: 15, margin: "2px 2px 9px" } }, "🛺 النقل الذكي — " + MONTHS_AR[+m.slice(5, 7) - 1]),
      h("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 } }, sc("الأوردرات (" + cur.orders + ")", fmt(cur.rev, 0) + " ج", "#d99a1d"), sc("البنزين (" + cur.fills + ")", fmt(cur.petrol, 0) + " ج", "#d6453d"), sc("ضريبة / عمولة", fmt(cur.tax, 0) + " ج", "#7c5cd6"), sc("نفخ كاوتش", fmt(cur.tire, 0) + " ج", "#2f7fd1")),
      h("div", { className: "card", style: { marginBottom: 10, textAlign: "center" } }, h("div", { style: { fontSize: 11, color: "var(--muted)", fontWeight: 700 } }, "الصافي"), h("div", { style: { fontSize: 24, fontWeight: 900, color: cur.net >= 0 ? "var(--ok)" : "var(--danger)" } }, fmt(cur.net, 0) + " ج")),
      pe.length > 0 && h("div", { className: "card", style: { marginBottom: 10 } }, h("div", { style: { fontWeight: 900, fontSize: 13, marginBottom: 8 } }, "⚡ معدل استهلاك البنزين — الشهر ده"),
        h("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 } }, h("span", { style: { color: "var(--muted)" } }, "المتوسط"), h("b", null, rate(cur.liters, cur.km) + " كم/لتر")),
        pe.slice().reverse().map((e, i) => h("div", { key: e.id || i, style: { display: "flex", justifyContent: "space-between", fontSize: 11, padding: "4px 0", borderTop: "1px solid var(--line)" } }, h("span", { style: { color: "var(--muted)" } }, e.date + " · " + e.km + " كم · " + e.liters + " لتر"), h("b", null, rate(e.liters, e.km) + " كم/لتر")))),
      h("div", { style: { fontSize: 12, color: "var(--muted)", fontWeight: 800, margin: "4px 2px 7px" } }, "عمليات الشهر (" + cur.entries.length + ")"),
      cur.entries.length === 0 ? h(Empty, { icon: "🛺", text: "مفيش عمليات هذا الشهر" }) : h("div", { className: "card", style: { padding: "4px 12px" } }, cur.entries.slice().sort((a, b) => b.date.localeCompare(a.date)).map((e, i) => h("div", { key: e.id || i, style: { display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderTop: i ? "1px solid var(--line)" : "none" } },
        h("span", { style: { fontSize: 19 } }, (IND_TYPES[e.type] || ["💰"])[0]),
        h("div", { style: { flex: 1 } }, h("div", { style: { fontWeight: 800, fontSize: 13 } }, (IND_TYPES[e.type] || [0, e.type])[1] + (e.count > 1 ? " (" + e.count + ")" : "")), h("div", { style: { fontSize: 11, color: "var(--muted)" } }, e.date + (e.note ? " · " + e.note : ""))),
        h("b", { style: { color: e.type === "order" ? "var(--ok)" : "var(--text)" } }, fmt(e.amount, 0) + " ج"),
        h("button", { onClick: () => del(e.id), style: { background: "none", border: "none", cursor: "pointer", opacity: .6 }, "aria-label": "مسح" }, "🗑️")))));
  } else if (view === "add") {
    const t = f.type;
    body = h("div", { className: "card" },
      h("div", { style: { fontWeight: 900, fontSize: 14, marginBottom: 10 } }, "إضافة عملية جديدة"),
      h("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginBottom: 12 } }, Object.entries(IND_TYPES).map(([k, mt]) => h("button", { key: k, type: "button", className: "chip" + (t === k ? " on" : ""), style: { padding: 10 }, onClick: () => setF(x => ({ ...x, type: k })) }, mt[0] + " " + mt[1]))),
      t === "petrol" && h(Field, { label: "سعر اللتر (ج)" }, h("input", { type: "number", inputMode: "decimal", value: petrolPrice, onChange: e => upd(d => ({ ...d, petrolPrice: e.target.value })), placeholder: "مثلاً: 24" })),
      t === "petrol" && h(Field, { label: "عدد اللترات" }, h("input", { type: "number", inputMode: "decimal", value: f.liters, onChange: e => { const l = e.target.value; setF(x => ({ ...x, liters: l, amount: num(l) > 0 && num(petrolPrice) > 0 ? String(Math.round(num(l) * num(petrolPrice) * 100) / 100) : x.amount })); }, placeholder: "مثلاً: 10" })),
      t === "petrol" && h(Field, { label: "كيلومترات التفويلة دي" }, h("input", { type: "number", inputMode: "decimal", value: f.km, onChange: e => setF(x => ({ ...x, km: e.target.value })), placeholder: "مثلاً: 100" })),
      t === "petrol" && num(f.liters) > 0 && num(f.km) > 0 && h("div", { style: { fontSize: 13, fontWeight: 800, color: "var(--ok)", margin: "-4px 0 12px" } }, "⚡ معدل الاستهلاك: " + (num(f.km) / num(f.liters)).toFixed(1) + " كم/لتر"),
      h(Field, { label: t === "petrol" ? "المبلغ الإجمالي (ج)" : "المبلغ (ج)" }, h("input", { type: "number", inputMode: "decimal", value: f.amount, onChange: e => setF(x => ({ ...x, amount: e.target.value })), placeholder: t === "order" ? "مثلاً: 150" : "مثلاً: 305", style: { fontSize: 20, fontWeight: 900 } })),
      h(Field, { label: "التاريخ" }, h("input", { type: "date", value: f.date, onChange: e => setF(x => ({ ...x, date: e.target.value })) })),
      h(Field, { label: "ملاحظة (اختياري)" }, h("input", { value: f.note, onChange: e => setF(x => ({ ...x, note: e.target.value })), placeholder: "مثلاً: رحلة مدينة نصر", maxLength: 80 })),
      h("button", { className: "btn btn-primary", style: { width: "100%" }, onClick: doAdd }, IND_TYPES[t][0] + " إضافة " + IND_TYPES[t][1]));
  } else {
    const pm = {}; ind.filter(e => e.type === "petrol" && e.liters && e.km).forEach(e => { const k = monthOf(e.date); (pm[k] = pm[k] || { l: 0, k: 0 }); pm[k].l += e.liters; pm[k].k += e.km; });
    const pk = Object.keys(pm).sort().reverse();
    body = h("div", null,
      h("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10 } }, sc("إجمالي الإيرادات", fmt(grand.rev, 0), "#d99a1d"), sc("إجمالي البنزين", fmt(grand.petrol, 0), "#d6453d"), sc("عدد الأوردرات", grand.orders, "#7c5cd6")),
      pk.length > 0 && h("div", { className: "card", style: { marginBottom: 10 } }, h("div", { style: { fontWeight: 900, fontSize: 13, marginBottom: 8 } }, "⚡ معدل استهلاك البنزين لكل شهر"), pk.map(k => h("div", { key: k, style: { display: "flex", justifyContent: "space-between", fontSize: 12, padding: "5px 0", borderTop: "1px solid var(--line)" } }, h("span", { style: { color: "var(--muted)" } }, monthLabel(k)), h("b", null, rate(pm[k].l, pm[k].k) + " كم/لتر")))),
      months.map(k => { const d = summarize(byM[k]); return h("div", { key: k, className: "card", style: { marginBottom: 9 } },
        h("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 } }, h("b", null, monthLabel(k)), h("span", { style: { color: "var(--muted)", fontSize: 11 } }, d.orders + " أوردر · " + d.fills + " بنزين")),
        h("div", { style: { display: "flex", gap: 8, textAlign: "center" } }, [["إيرادات", d.rev, "var(--text)"], ["بنزين", d.petrol, "var(--text)"], ["الصافي", d.net, d.net >= 0 ? "var(--ok)" : "var(--danger)"]].map(([l, v, c]) => h("div", { key: l, style: { flex: 1 } }, h("div", { style: { fontSize: 10, color: "var(--muted)" } }, l), h("div", { style: { fontWeight: 900, color: c } }, fmt(v, 0))))),
        (d.tax > 0 || d.tire > 0) && h("div", { style: { fontSize: 11, color: "var(--muted)", marginTop: 7 } }, (d.tax > 0 ? "🧾 ضريبة: " + fmt(d.tax, 0) + " ج   " : "") + (d.tire > 0 ? "🛞 نفخ: " + fmt(d.tire, 0) + " ج" : ""))); }));
  }
  return h("div", null, tabsRow, body);
}

// ══════════════════════════════════════════════════════════════
// وزني وتخسيسي
// ══════════════════════════════════════════════════════════════
function compressImage(file, maxSide, q) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const r = Math.min(1, maxSide / Math.max(img.width, img.height));
      const c = document.createElement("canvas"); c.width = Math.round(img.width * r); c.height = Math.round(img.height * r);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      c.toBlob(b => b ? res(b) : rej(new Error("تعذّر معالجة الصورة")), "image/jpeg", q);
    };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error("الصورة دي مش مدعومة")); };
    img.src = url;
  });
}
async function uploadPhoto(blob) {
  const fd = new FormData(); fd.append("file", blob); fd.append("upload_preset", CLD_PRESET); fd.append("folder", "allinone");
  const r = await fetch("https://api.cloudinary.com/v1_1/" + CLD_CLOUD + "/image/upload", { method: "POST", body: fd });
  const j = await r.json();
  if (!r.ok || !j.secure_url) throw new Error((j.error && j.error.message) || "فشل رفع الصورة");
  return j.secure_url;
}
const blobToB64 = b => new Promise((res, rej) => { const f = new FileReader(); f.onload = () => res(String(f.result).split(",")[1]); f.onerror = rej; f.readAsDataURL(b); });
async function askAI(prompt, imageBlob) {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) throw new Error("سجّل دخولك الأول");
  const body = { prompt };
  if (imageBlob) body.image = { mime: "image/jpeg", data: await blobToB64(imageBlob) };
  const r = await fetch(AI_URL, { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + session.access_token }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || "حصلت مشكلة في التحليل");
  return j.text || j.answer || "";
}
const bmiOf = (kg, cm) => (kg && cm ? kg / Math.pow(cm / 100, 2) : null);
const bmiLabel = b => b < 18.5 ? "أقل من الطبيعي" : b < 25 ? "طبيعي" : b < 30 ? "زيادة وزن" : "سمنة";

const INB_FIELDS = [["weight", "الوزن", "كجم", 0], ["bmi", "مؤشر كتلة الجسم", "", -1], ["fatPct", "دهون الجسم", "%", -1], ["waterPct", "كمية الماء", "%", 0], ["skeletalPct", "الهيكل العظمي والعضلات", "%", 1], ["bonePct", "العظم", "%", 0], ["proteinPct", "البروتين", "%", 1], ["musclePct", "العضلات", "%", 1], ["visceral", "مؤشر الدهون الحشوية", "", -1], ["leanKg", "كتلة الجسم النحيل", "كجم", 1], ["bmr", "معدل الحرق BMR", "كيلوكالوري", 0], ["amr", "AMR", "كيلوكالوري", 0], ["score", "نتيجة الجسم", "", 1], ["bodyAge", "عمر الجسم", "سنة", -1]];
function parseInbodyJson(t) {
  const m = /\{[\s\S]*\}/.exec(t || ""); if (!m) return null;
  try { const o = JSON.parse(m[0]); const v = {}; INB_FIELDS.forEach(([k]) => { const n = parseFloat(String(o[k] == null ? "" : o[k]).replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d)).replace(/[^\d.\-]/g, "")); if (isFinite(n)) v[k] = n; }); return v; } catch (e) { return null; }
}
async function sideBySide(urlA, urlB, labA, labB) {
  const load = u => new Promise((res, rej) => { const i = new Image(); i.crossOrigin = "anonymous"; i.onload = () => res(i); i.onerror = () => rej(new Error("معرفتش أحمّل الصورة")); i.src = u; });
  const [a, b] = await Promise.all([load(urlA), load(urlB)]);
  const H = 800, wa = Math.round(a.width * H / a.height), wb = Math.round(b.width * H / b.height);
  const c = document.createElement("canvas"); c.width = wa + wb + 12; c.height = H + 44;
  const x = c.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, c.height);
  x.drawImage(a, 0, 44, wa, H); x.drawImage(b, wa + 12, 44, wb, H);
  x.fillStyle = "#000"; x.font = "bold 26px sans-serif"; x.textAlign = "center"; x.fillText(labA, wa / 2, 31); x.fillText(labB, wa + 12 + wb / 2, 31);
  return new Promise(r => c.toBlob(r, "image/jpeg", 0.8));
}
function AnalysisList({ items, onDel }) {
  const [open, setOpen] = useState({});
  if (!items.length) return null;
  const ic = { trend: "📈", photo: "📸", compare: "🔀", inbody: "📊" };
  return h("div", { style: { marginBottom: 12 } },
    h("div", { style: { fontWeight: 900, fontSize: 14, marginBottom: 8 } }, "🗂️ تحليلاتي المحفوظة"),
    items.map(a => h("div", { key: a.id, className: "card", style: { padding: 0, marginBottom: 7, overflow: "hidden" } },
      h("div", { onClick: () => setOpen({ ...open, [a.id]: !open[a.id] }), style: { display: "flex", alignItems: "center", gap: 8, padding: "11px 13px", cursor: "pointer" } },
        h("span", null, ic[a.kind] || "✨"), h("div", { style: { flex: 1, minWidth: 0 } }, h("div", { style: { fontWeight: 800, fontSize: 13 } }, a.title), h("div", { style: { fontSize: 11, color: "var(--muted)" } }, new Date(a.at).toLocaleDateString("ar-EG", { day: "numeric", month: "long" }))),
        h("span", { style: { fontSize: 11, color: "var(--muted)" } }, open[a.id] ? "▲" : "▼")),
      open[a.id] && h("div", { style: { padding: "0 13px 13px", borderTop: "1px solid var(--line)" } },
        h("div", { style: { fontSize: 13, lineHeight: 2, whiteSpace: "pre-wrap", marginTop: 8 } }, a.text),
        a.id !== "legacy" && h("button", { className: "btn btn-danger", style: { marginTop: 8, padding: "6px 12px", fontSize: 12 }, onClick: () => onDel(a.id) }, "🗑 مسح")))));
}

function WeightChart({ pts, goal }) {
  if (pts.length < 2) return null;
  const W = 320, H = 130, P = 14;
  const vals = pts.map(p => p.kg).concat(goal ? [goal] : []);
  const lo = Math.min(...vals) - 1, hi = Math.max(...vals) + 1;
  const x = i => P + (i * (W - 2 * P)) / (pts.length - 1);
  const y = v => H - P - ((v - lo) / (hi - lo)) * (H - 2 * P);
  const path = pts.map((p, i) => (i ? "L" : "M") + x(i).toFixed(1) + " " + y(p.kg).toFixed(1)).join(" ");
  return h("svg", { viewBox: "0 0 " + W + " " + H, style: { width: "100%", height: "auto", direction: "ltr" }, role: "img", "aria-label": "رسم الوزن" },
    h("defs", null, h("linearGradient", { id: "wg", x1: 0, x2: 1 }, h("stop", { offset: "0", stopColor: "var(--accent2)" }), h("stop", { offset: "1", stopColor: "var(--accent)" }))),
    goal ? h("g", null, h("line", { x1: P, x2: W - P, y1: y(goal), y2: y(goal), stroke: "var(--warn)", strokeDasharray: "4 4", strokeWidth: 1.2 }), h("text", { x: W - P, y: y(goal) - 4, fontSize: 9, fill: "var(--warn)", textAnchor: "end" }, "الهدف " + goal)) : null,
    h("path", { d: path, fill: "none", stroke: "url(#wg)", strokeWidth: 2.6, strokeLinecap: "round", strokeLinejoin: "round" }),
    pts.map((p, i) => h("circle", { key: i, cx: x(i), cy: y(p.kg), r: 3.2, fill: "var(--accent)" })),
    h("text", { x: P, y: 10, fontSize: 9, fill: "var(--muted)" }, fmt(hi - 1, 1)), h("text", { x: P, y: H - 2, fontSize: 9, fill: "var(--muted)" }, fmt(lo + 1, 1)));
}

function WeightModule({ prof }) {
  const { get, set } = useData();
  const doc = get("weight", { entries: [] });
  const entries = (doc.entries || []).slice().sort((a, b) => a.date.localeCompare(b.date));
  const [sheet, setSheet] = useState(false);
  const [kg, setKg] = useState(""); const [date, setDate] = useState(todayStr()); const [note, setNote] = useState("");
  const [file, setFile] = useState(null); const [busy, setBusy] = useState(false);
  const [view, setView] = useState(null);       // entry للعرض
  const [aiBusy, setAiBusy] = useState(false);
  const [cmpMode, setCmpMode] = useState(false); const [cmpSel, setCmpSel] = useState([]);
  const [ib, setIb] = useState(null); // { date, file, vals, photo, step }
  const [ibCmp, setIbCmp] = useState({ a: "", b: "" });
  const [toast, toastNode] = useToast();
  const inbody = (doc.inbody || []).slice().sort((a, b) => a.date.localeCompare(b.date));
  const addAn = (kind, title, text) => set("weight", d => ({ ...(d || {}), analyses: [{ id: uid8(), kind, title, text, at: Date.now() }, ...((d && d.analyses) || [])].slice(0, 60) }));
  const delAn = id => set("weight", d => ({ ...d, analyses: (d.analyses || []).filter(x => x.id !== id) }));
  const anItems = (doc.analyses && doc.analyses.length) ? doc.analyses : (doc.trendAi ? [{ id: "legacy", kind: "trend", title: "تحليل التقدّم", text: doc.trendAi.text, at: doc.trendAi.at }] : []);
  const last = entries[entries.length - 1], first = entries[0];
  const diff = last && first && last !== first ? last.kg - first.kg : 0;
  const bmi = last ? bmiOf(last.kg, prof.heightCm) : null;
  const goal = prof.goalKg;
  const toGo = goal && last ? last.kg - goal : null;
  const open = () => { setKg(last ? String(last.kg) : ""); setDate(todayStr()); setNote(""); setFile(null); setSheet(true); };
  const save = async () => {
    const k = num(kg);
    if (!(k > 20 && k < 400)) return toast("اكتب وزن صحيح.");
    setBusy(true);
    let photo = null;
    try { if (file) { const b = await compressImage(file, 1000, 0.8); photo = await uploadPhoto(b); } }
    catch (e) { setBusy(false); return toast("الصورة: " + e.message); }
    set("weight", d => ({ ...(d || {}), entries: [...((d && d.entries) || []), { id: uid8(), date, kg: Math.round(k * 10) / 10, note: note.trim(), photo }] }));
    setBusy(false); setSheet(false); toast("اتسجّل ✓");
  };
  const del = id => { if (confirmDo("تمسح القياس ده؟ (الصورة هتفضل مخزّنة عندنا لكن مش هتظهر)")) { set("weight", d => ({ ...d, entries: d.entries.filter(e => e.id !== id) })); setView(null); } };
  const trendText = () => entries.slice(-12).map(e => e.date + ": " + e.kg + " كجم").join("\n");
  const baseRules = "اتكلم بالعامية المصرية بأسلوب لطيف ومشجّع من غير جلد للذات. ده مش تشخيص طبي ومتدّيش أرقام سعرات أو أدوية. خلّي الرد في حدود 6 أسطر ومقسّم لنقط قصيرة. في الآخر جملة قصيرة إن استشارة دكتور/أخصائي تغذية أهم لو في حالة صحية.";
  const analyzeTrend = async () => {
    if (entries.length < 2) return toast("سجّل قياسين على الأقل.");
    setAiBusy(true);
    try {
      const t = await askAI("أنا بتابع وزني. الطول: " + (prof.heightCm || "غير معروف") + " سم، الهدف: " + (goal || "غير محدد") + " كجم. القياسات:\n" + trendText() + "\nحلّل التقدّم، ووضّح الاتجاه، ونصيحة عملية بسيطة للأسبوع الجاي.\n" + baseRules);
      addAn("trend", "تحليل التقدّم • " + dayLabel(todayStr()), t);
    } catch (e) { toast(e.message); }
    setAiBusy(false);
  };
  const analyzePhoto = async e => {
    setAiBusy(true);
    try {
      const r = await fetch(e.photo.replace("/upload/", "/upload/w_900,q_auto/"));
      const blob = await r.blob();
      const prev = entries.filter(x => x.date < e.date).slice(-1)[0];
      const t = await askAI("دي صورة تقدّمي في رحلة التخسيس بتاريخ " + e.date + " ووزني وقتها " + e.kg + " كجم" + (prev ? "، وآخر قياس قبلها كان " + prev.kg + " كجم" : "") + ". علّق على اللي باين من وضعية الجسم والتقدّم العام بشكل إيجابي وواقعي، ومتحاولش تحدد نسب دهون أو أمراض.\n" + baseRules, blob);
      set("weight", d => ({ ...d, entries: d.entries.map(x => x.id === e.id ? { ...x, ai: t } : x) })); addAn("photo", "تحليل صورة " + e.date + " (" + e.kg + " كجم)", t);
      setView(v => v && v.id === e.id ? { ...v, ai: t } : v);
    } catch (er) { toast(er.message); }
    setAiBusy(false);
  };
  const comparePhotos = async () => {
    const [a, b] = cmpSel.map(id => entries.find(e => e.id === id)).sort((x, y) => x.date.localeCompare(y.date));
    setAiBusy(true);
    try {
      const blob = await sideBySide(a.photo.replace("/upload/", "/upload/w_600,q_auto/"), b.photo.replace("/upload/", "/upload/w_600,q_auto/"), a.date + " • " + a.kg + " كجم", b.date + " • " + b.kg + " كجم");
      const t = await askAI("دي صورتين جنب بعض لنفس الشخص في رحلة التخسيس. الشمال أقدم (" + a.date + "، " + a.kg + " كجم) واليمين أحدث (" + b.date + "، " + b.kg + " كجم). قارن بينهم بدقة: التغيّر في الكرش والوسط والصدر والكتف والوش والوضعية، وإيه اللي اتحسّن وإيه اللي محتاج شغل. " + baseRules, blob);
      addAn("compare", "مقارنة صور: " + a.date + " ↔ " + b.date, t); toast("اتحفظ التحليل ✓"); setCmpMode(false); setCmpSel([]);
    } catch (er) { toast(er.message); }
    setAiBusy(false);
  };
  const ibExtract = async () => {
    if (!ib.file) return toast("اختار صورة التقرير الأول.");
    setAiBusy(true);
    try {
      const blob = await compressImage(ib.file, 1400, 0.85);
      const t = await askAI("دي صورة تقرير تحليل جسم (InBody / ميزان ذكي). استخرج الأرقام وارجع JSON فقط من غير أي شرح ولا علامات ```، بالمفاتيح دي بالظبط والأرقام بالإنجليزية (null لو مش ظاهر): {\"weight\":الوزن كجم,\"bmi\":مؤشر كتلة الجسم,\"fatPct\":دهون الجسم %,\"waterPct\":كمية الماء %,\"skeletalPct\":الهيكل العظمي والعضلات %,\"bonePct\":العظم %,\"proteinPct\":البروتين %,\"musclePct\":العضلات %,\"visceral\":مؤشر الدهون,\"leanKg\":كتلة الجسم النحيل كجم,\"bmr\":نسبة كتلة الجسم/BMR كيلوكالوري,\"amr\":AMR كيلوكالوري,\"score\":نتيجة الجسم,\"bodyAge\":عمر الجسم}", blob);
      const v = parseInbodyJson(t);
      if (!v || !Object.keys(v).length) throw new Error("معرفتش أقرأ الأرقام، جرّب صورة أوضح أو دخّلها يدوي.");
      setIb(x => ({ ...x, vals: Object.fromEntries(Object.entries(v).map(([k, n]) => [k, String(n)])), blob }));
    } catch (er) { toast(er.message); }
    setAiBusy(false);
  };
  const ibSave = async () => {
    const v = {}; INB_FIELDS.forEach(([k]) => { const n = num(ib.vals[k] == null ? "" : ib.vals[k]); if (isFinite(n)) v[k] = n; });
    if (!Object.keys(v).length) return toast("اكتب رقم واحد على الأقل.");
    setBusy(true);
    let photo = null; try { if (ib.blob) photo = await uploadPhoto(ib.blob); } catch (e) {}
    set("weight", d => ({ ...(d || {}), inbody: [...((d && d.inbody) || []), { id: uid8(), date: ib.date, photo, v }] }));
    setBusy(false); setIb(null); toast("اتحفظ التقرير ✓");
  };
  const ibRows = (A, B) => INB_FIELDS.filter(([k]) => A.v[k] != null || B.v[k] != null).map(([k, l, u, dir]) => { const x = A.v[k], y = B.v[k], d = x != null && y != null ? Math.round((y - x) * 10) / 10 : null; return { k, l, u, dir, x, y, d }; });
  const ibA = inbody.find(r => r.id === ibCmp.a) || inbody[inbody.length - 2], ibB = inbody.find(r => r.id === ibCmp.b) || inbody[inbody.length - 1];
  const ibAnalyze = async () => {
    setAiBusy(true);
    try {
      const rows = ibRows(ibA, ibB);
      const t = await askAI("عندي تقريرين تحليل جسم (InBody) لنفس الشخص. الأول بتاريخ " + ibA.date + " والتاني بتاريخ " + ibB.date + ". الأرقام (الأول → التاني):\n" + rows.map(r => r.l + ": " + (r.x != null ? r.x : "؟") + " → " + (r.y != null ? r.y : "؟") + " " + r.u).join("\n") + "\nحلّل: إيه اللي اتحسّن وإيه اللي اتدهور (الدهون والعضلات والماء والدهون الحشوية)، وهل النزول دهون ولا عضلات، وإيه الأولوية الجاية. " + baseRules);
      addAn("inbody", "مقارنة InBody: " + ibA.date + " ↔ " + ibB.date, t); toast("اتحفظ التحليل ✓");
    } catch (er) { toast(er.message); }
    setAiBusy(false);
  };
  const photos = entries.filter(e => e.photo).reverse();
  return h("div", { className: "fade" },
    h("div", { style: { display: "flex", gap: 8, marginBottom: 10 } },
      h(Stat, { label: "آخر وزن", value: last ? fmt(last.kg, 1) + " كجم" : "—", sub: last ? dayLabel(last.date) : "سجّل أول قياس" }),
      h(Stat, { label: "التغيّر الكلي", value: entries.length > 1 ? (diff > 0 ? "+" : "") + fmt(diff, 1) : "—", color: diff < 0 ? "var(--ok)" : diff > 0 ? "var(--warn)" : undefined, sub: "كجم من أول قياس" })),
    h("div", { style: { display: "flex", gap: 8, marginBottom: 10 } },
      h(Stat, { label: "مؤشر كتلة الجسم", value: bmi ? fmt(bmi, 1) : "—", sub: bmi ? bmiLabel(bmi) : "ضيف طولك من الإعدادات" }),
      h(Stat, { label: "فاضل للهدف", value: toGo == null ? "—" : toGo <= 0 ? "وصلت 🎉" : fmt(toGo, 1) + " كجم", sub: goal ? "الهدف " + goal + " كجم" : "حدّد هدفك من الإعدادات" })),
    h("button", { className: "btn btn-primary", style: { width: "100%", marginBottom: 12 }, onClick: open }, "+ قياس جديد"),
    entries.length >= 2 && h("div", { className: "card", style: { marginBottom: 12 } }, h(WeightChart, { pts: entries.slice(-30), goal })),
    entries.length >= 2 && h("div", { className: "card", style: { marginBottom: 12 } },
      h("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 } },
        h("div", { style: { fontWeight: 900 } }, "✨ تحليل تقدّمك"),
        h("button", { className: "btn btn-ghost", disabled: aiBusy, onClick: analyzeTrend, style: { padding: "7px 12px", fontSize: 13 } }, aiBusy ? "بيحلّل…" : anItems.length ? "حلّل تاني" : "حلّل")),
      h("div", { style: { fontSize: 11, color: "var(--muted)", marginTop: 6 } }, "التحليل بيتحفظ تحت في «تحليلاتي المحفوظة».")),
    photos.length > 0 && h("div", { style: { marginBottom: 12 } },
      h("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 } },
        h("div", { style: { fontWeight: 900, fontSize: 14 } }, "📸 صور التقدّم"),
        photos.length >= 2 && (cmpMode
          ? h("div", { style: { display: "flex", gap: 6 } }, h("button", { className: "btn btn-primary", disabled: aiBusy || cmpSel.length !== 2, onClick: comparePhotos, style: { padding: "6px 12px", fontSize: 12 } }, aiBusy ? "بيحلّل…" : "حلّل (" + cmpSel.length + "/2)"), h("button", { className: "btn btn-ghost", onClick: () => { setCmpMode(false); setCmpSel([]); }, style: { padding: "6px 10px", fontSize: 12 } }, "إلغاء"))
          : h("button", { className: "btn btn-ghost", onClick: () => setCmpMode(true), style: { padding: "6px 12px", fontSize: 12 } }, "🔀 قارن صورتين"))),
      cmpMode && h("div", { style: { fontSize: 12, color: "var(--muted)", marginBottom: 8 } }, "اختار صورتين من تحت."),
      h("div", { style: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 } }, photos.map(e => h("button", { key: e.id, onClick: () => cmpMode ? setCmpSel(s => s.includes(e.id) ? s.filter(x => x !== e.id) : s.length < 2 ? [...s, e.id] : [s[1], e.id]) : setView(e), style: { position: "relative", padding: 0, border: cmpSel.includes(e.id) ? "3px solid var(--accent)" : "1px solid var(--line)", borderRadius: 14, overflow: "hidden", background: "var(--card2)", aspectRatio: "3/4", cursor: "pointer" } },
        h("img", { src: e.photo.replace("/upload/", "/upload/w_300,q_auto/"), alt: "صورة " + e.date, loading: "lazy", style: { width: "100%", height: "100%", objectFit: "cover", display: "block", padding: 0, border: "none", borderRadius: 0 } }),
        h("span", { style: { position: "absolute", bottom: 0, insetInline: 0, background: "rgba(0,0,0,.55)", color: "#fff", fontSize: 11, fontWeight: 800, padding: "3px 0" } }, fmt(e.kg, 1) + " كجم"))))),
    h("div", { className: "card", style: { marginBottom: 12 } },
      h("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: inbody.length ? 10 : 0 } },
        h("div", { style: { fontWeight: 900 } }, "📊 تقارير InBody"),
        h("button", { className: "btn btn-ghost", onClick: () => setIb({ date: todayStr(), file: null, vals: null }), style: { padding: "7px 12px", fontSize: 13 } }, "+ تقرير جديد")),
      inbody.length === 0 && h("div", { style: { fontSize: 12, color: "var(--muted)", marginTop: 6 } }, "ارفع صورة تقرير الـ InBody وهستخرج الأرقام تلقائي، وتقدر تقارن أي تقريرين."),
      inbody.length >= 2 && ibA && ibB && h("div", null,
        h("div", { style: { display: "flex", gap: 8, marginBottom: 8 } }, [["a", ibA], ["b", ibB]].map(([k, cur]) => h("select", { key: k, value: cur.id, onChange: e => setIbCmp({ a: ibA.id, b: ibB.id, [k]: e.target.value }), style: { flex: 1, marginBottom: 0 } }, inbody.map(r => h("option", { key: r.id, value: r.id }, r.date))))),
        ibRows(ibA, ibB).map(r => { const good = r.d == null || r.d === 0 || r.dir === 0 ? null : (r.d * r.dir > 0); return h("div", { key: r.k, style: { display: "flex", alignItems: "center", gap: 6, padding: "7px 0", borderTop: "1px solid var(--line)", fontSize: 13 } },
          h("span", { style: { flex: 1 } }, r.l), h("span", { style: { color: "var(--muted)", width: 52, textAlign: "center" } }, r.x != null ? r.x : "—"), h("span", { style: { fontWeight: 800, width: 52, textAlign: "center" } }, r.y != null ? r.y : "—"),
          h("span", { style: { width: 52, textAlign: "left", fontWeight: 900, direction: "ltr", color: good == null ? "var(--muted)" : good ? "var(--ok)" : "var(--danger)" } }, r.d == null ? "" : (r.d > 0 ? "+" : "") + r.d)); }),
        h("button", { className: "btn btn-primary", disabled: aiBusy, onClick: ibAnalyze, style: { width: "100%", marginTop: 10 } }, aiBusy ? "بيحلّل…" : "✨ حلّل المقارنة")),
      inbody.length === 1 && h("div", { style: { fontSize: 12, color: "var(--muted)" } }, "اتحفظ تقرير " + inbody[0].date + ". ضيف تقرير تاني عشان تتعمل مقارنة."),
      inbody.length > 0 && h("div", { style: { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 } }, inbody.map(r => h("span", { key: r.id, className: "chip", style: { fontSize: 11 }, onClick: () => { if (confirmDo("تمسح تقرير " + r.date + "؟")) set("weight", d => ({ ...d, inbody: (d.inbody || []).filter(x => x.id !== r.id) })); } }, r.date + " ✕")))),
    h(AnalysisList, { items: anItems, onDel: delAn }),
    h("div", { style: { fontWeight: 900, fontSize: 14, marginBottom: 8 } }, "السجل"),
    entries.length === 0 ? h(Empty, { icon: "⚖️", text: "لسه مسجّلتش أي قياس." }) :
      h("div", { className: "card", style: { padding: "4px 12px" } }, entries.slice().reverse().map((e, i, arr) => {
        const prev = arr[i + 1]; const d = prev ? e.kg - prev.kg : null;
        return h("div", { key: e.id, onClick: () => setView(e), style: { display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderTop: i ? "1px solid var(--line)" : "none", cursor: "pointer" } },
          h("span", { style: { fontSize: 18 } }, e.photo ? "📸" : "⚖️"),
          h("div", { style: { flex: 1, minWidth: 0 } }, h("div", { style: { fontWeight: 800, fontSize: 13 } }, dayLabel(e.date)), e.note && h("div", { style: { fontSize: 12, color: "var(--muted)" } }, e.note)),
          d != null && d !== 0 && h("span", { style: { fontSize: 12, fontWeight: 800, color: d < 0 ? "var(--ok)" : "var(--warn)", direction: "ltr" } }, (d > 0 ? "+" : "") + fmt(d, 1)),
          h("div", { style: { fontWeight: 900 } }, fmt(e.kg, 1)));
      })),
    ib && h(Sheet, { title: "تقرير InBody جديد", onClose: () => !busy && !aiBusy && setIb(null) },
      h(Field, { label: "التاريخ" }, h("input", { type: "date", value: ib.date, onChange: e => setIb({ ...ib, date: e.target.value }) })),
      !ib.vals && h(React.Fragment, null,
        h(Field, { label: "صورة التقرير (سكرين شوت)", hint: "هقرأ الأرقام منها وتراجعها قبل الحفظ." }, h("input", { type: "file", accept: "image/*", onChange: e => setIb({ ...ib, file: e.target.files && e.target.files[0] || null }) })),
        h("button", { className: "btn btn-primary", style: { width: "100%", marginBottom: 8 }, disabled: aiBusy, onClick: ibExtract }, aiBusy ? "بيقرأ الأرقام…" : "✨ استخرج الأرقام"),
        h("button", { className: "btn btn-ghost", style: { width: "100%" }, onClick: () => setIb({ ...ib, vals: {} }) }, "أدخلها يدوي")),
      ib.vals && h(React.Fragment, null,
        h("div", { style: { fontSize: 12, color: "var(--muted)", marginBottom: 8 } }, "راجع الأرقام وصحّح لو في غلط:"),
        h("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 } }, INB_FIELDS.map(([k, l, u]) => h(Field, { key: k, label: l + (u ? " (" + u + ")" : "") }, h("input", { type: "number", inputMode: "decimal", value: ib.vals[k] == null ? "" : ib.vals[k], onChange: e => setIb({ ...ib, vals: { ...ib.vals, [k]: e.target.value } }) })))),
        h("button", { className: "btn btn-primary", style: { width: "100%" }, disabled: busy, onClick: ibSave }, busy ? "بيحفظ…" : "حفظ التقرير"))),
    sheet && h(Sheet, { title: "قياس جديد", onClose: () => !busy && setSheet(false) },
      h(Field, { label: "الوزن (كجم)" }, h("input", { type: "number", inputMode: "decimal", value: kg, onChange: e => setKg(e.target.value), autoFocus: true, style: { fontSize: 24, fontWeight: 900 } })),
      h(Field, { label: "التاريخ" }, h("input", { type: "date", value: date, onChange: e => setDate(e.target.value) })),
      h(Field, { label: "ملاحظة (اختياري)" }, h("input", { value: note, onChange: e => setNote(e.target.value), maxLength: 80 })),
      h(Field, { label: "صورة تقدّم (اختياري)", hint: "الصورة بتتصغّر وبتتخزّن على حسابك. ماتتشاركش مع حد." },
        h("input", { type: "file", accept: "image/*", onChange: e => setFile(e.target.files && e.target.files[0] || null) })),
      h("button", { className: "btn btn-primary", style: { width: "100%" }, disabled: busy, onClick: save }, busy ? "بيحفظ…" : "حفظ")),
    view && h(Sheet, { title: dayLabel(view.date) + " • " + fmt(view.kg, 1) + " كجم", onClose: () => setView(null) },
      view.photo && h("img", { src: view.photo.replace("/upload/", "/upload/w_900,q_auto/"), alt: "", style: { width: "100%", borderRadius: 16, marginBottom: 12, padding: 0, border: "none" } }),
      view.note && h("div", { style: { fontSize: 13, color: "var(--muted)", marginBottom: 10 } }, view.note),
      view.photo && h("button", { className: "btn btn-ghost", style: { width: "100%", marginBottom: 10 }, disabled: aiBusy, onClick: () => analyzePhoto(view) }, aiBusy ? "بيحلّل…" : view.ai ? "✨ حلّل الصورة تاني" : "✨ حلّل الصورة بالذكاء الاصطناعي"),
      view.ai && h("div", { className: "card", style: { fontSize: 13, lineHeight: 2, whiteSpace: "pre-wrap", marginBottom: 10 } }, view.ai),
      h("button", { className: "btn btn-danger", style: { width: "100%" }, onClick: () => del(view.id) }, "مسح القياس")),
    toastNode);
}

// ══════════════════════════════════════════════════════════════
// الإعدادات
// ══════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════
// متابعة الدورة (للبنات، أو لفرد بنت في ميزانية العائلة)
// ══════════════════════════════════════════════════════════════
function PeriodTracker({ docKey }) {
  const { get, set } = useData();
  const log = ((get(docKey, { log: [] }) || {}).log || []).slice().sort((a, b) => a.start.localeCompare(b.start));
  const setLog = fn => set(docKey, d => ({ log: fn(((d && d.log) || []).slice().sort((a, b) => a.start.localeCompare(b.start))) }));
  const today = todayStr();
  const [backdate, setBackdate] = useState(today);
  const openCycle = log.length > 0 && !log[log.length - 1].end ? log[log.length - 1] : null;
  const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);
  const startOn = ds => { if (!openCycle && ds) setLog(l => [...l, { id: uid8(), start: ds, end: null }].sort((a, b) => a.start.localeCompare(b.start))); };
  const endCurrent = () => { if (openCycle) setLog(l => l.map((c, i) => i === l.length - 1 ? { ...c, end: today } : c)); };
  const delCycle = id => { if (confirmDo("تمسح الدورة دي من السجل؟")) setLog(l => l.filter(c => c.id !== id)); };
  const lens = log.map((c, i) => i > 0 ? daysBetween(log[i - 1].start, c.start) : null).filter(x => x);
  const avg = lens.length ? Math.round(lens.reduce((s, x) => s + x, 0) / lens.length) : null;
  const next = avg && log.length ? (() => { const d = new Date(log[log.length - 1].start + "T00:00:00"); d.setDate(d.getDate() + avg); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); })() : null;
  return h("div", { className: "fade" },
    h("div", { style: { fontWeight: 900, fontSize: 15, marginBottom: 10 } }, "🩸 متابعة الدورة"),
    avg && h("div", { style: { display: "flex", gap: 8, marginBottom: 10 } }, h(Stat, { label: "متوسط المسافة بين الدورات", value: avg + " يوم" }), h(Stat, { label: "الدورة الجاية تقريبًا", value: next ? dayLabel(next).split(" ").slice(0, 3).join(" ") : "—", sub: next })),
    h("div", { className: "card" },
      openCycle
        ? h("div", null, h("div", { style: { fontSize: 13, marginBottom: 10 } }, "بدأت يوم ", h("b", null, openCycle.start), " (النهاردة اليوم رقم " + (daysBetween(openCycle.start, today) + 1) + ")"),
            h("button", { className: "btn btn-primary", style: { width: "100%" }, onClick: endCurrent }, "✅ خلصت النهاردة"))
        : h("div", null,
            h("button", { className: "btn btn-primary", style: { width: "100%" }, onClick: () => startOn(today) }, "🔴 بدأت النهاردة"),
            h("div", { style: { fontSize: 12, color: "var(--muted)", margin: "12px 0 6px" } }, "أو نسيتي تسجليها؟ اختاري اليوم اللي بدأت فيه:"),
            h("div", { style: { display: "flex", gap: 8 } }, h("input", { type: "date", value: backdate, max: today, onChange: e => setBackdate(e.target.value) }), h("button", { className: "btn btn-ghost", style: { padding: "0 18px" }, onClick: () => startOn(backdate) }, "تسجيل")))),
    log.length > 0 && h("div", { className: "card", style: { marginTop: 10 } },
      h("div", { style: { fontSize: 12, color: "var(--muted)", fontWeight: 800, marginBottom: 8 } }, "السجل"),
      log.slice().reverse().map((c, i) => {
        const oi = log.length - 1 - i; const prev = oi > 0 ? log[oi - 1] : null;
        const cl = prev ? daysBetween(prev.start, c.start) : null; const dur = c.end ? daysBetween(c.start, c.end) + 1 : null;
        return h("div", { key: c.id, style: { display: "flex", alignItems: "flex-start", gap: 8, padding: "9px 0", borderTop: i ? "1px solid var(--line)" : "none" } },
          h("div", { style: { flex: 1, fontSize: 12, lineHeight: 1.8 } }, "بدأت " + c.start + (c.end ? " — انتهت " + c.end + " (" + dur + " يوم)" : " (مستمرة)"), cl != null && h("div", { style: { color: "var(--muted)", fontSize: 11 } }, "المسافة من الدورة اللي فاتت: " + cl + " يوم")),
          h("button", { onClick: () => delCycle(c.id), style: { background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 16 }, "aria-label": "مسح" }, "×"));
      })));
}

// ميزانية فرد من العائلة (+ متابعة الدورة لو الفرد بنت)
function FamilyModule({ prof }) {
  const girl = prof.familyGender === "f";
  const [tab, setTab] = useState("exp");
  const tabs = [["exp", "💳 المصروفات"], ["sav", "💰 التحويش"]].concat(girl ? [["period", "🩸 متابعة الدورة"]] : []);
  return h("div", null,
    h("div", { style: { display: "flex", gap: 8, marginBottom: 12 } }, tabs.map(([k, l]) => h("button", { key: k, className: "chip" + (tab === k ? " on" : ""), style: { flex: 1, padding: 9 }, onClick: () => setTab(k) }, l))),
    tab === "period" && girl ? h(PeriodTracker, { docKey: "period_family" }) : tab === "sav" ? h(SavingsTab, { docKey: "savings_family" }) : h(ExpensesModule, { docKey: "family", who: prof.familyName || "" }));
}

// ══════════════════════════════════════════════════════════════
// النسخ الاحتياطي: تنزيل / استعادة من ملف / نسخ تلقائية يومية (آخر 14 يوم) في السحابة
// ══════════════════════════════════════════════════════════════
const SNAP_DAYS = 14;
const b64FromBuf = buf => { let bin = ""; const u = new Uint8Array(buf); for (let i = 0; i < u.length; i += 0x8000) bin += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(bin); };
async function packSnap(data) {
  const str = JSON.stringify(data);
  try {
    if (window.CompressionStream) {
      const cs = new CompressionStream("gzip"); const w = cs.writable.getWriter(); w.write(new TextEncoder().encode(str)); w.close();
      return { z: 1, b: b64FromBuf(await new Response(cs.readable).arrayBuffer()) };
    }
  } catch (e) {}
  return { j: data };
}
async function unpackSnap(v) {
  if (v && v.j) return v.j;
  if (v && v.z && v.b) {
    const bin = atob(v.b); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    const ds = new DecompressionStream("gzip"); const w = ds.writable.getWriter(); w.write(u); w.close();
    return JSON.parse(await new Response(ds.readable).text());
  }
  return null;
}
const dataKeys = all => Object.keys(all || {}).filter(k => !k.startsWith("snap:") && !k.startsWith("__"));
function makeBackup(all, user) { const data = {}; dataKeys(all).forEach(k => { data[k] = all[k]; }); return { app: "AllinOne", version: 1, exportedAt: new Date().toISOString(), owner: user.email, data }; }
async function writeSnap(user, all, suffix) {
  if (!dataKeys(all).filter(k => k !== "profile").length) return false; // مانسجّلش نسخة فاضية
  const key = "snap:" + todayStr() + (suffix || "");
  const { error } = await sb.from("allinone_data").upsert({ user_id: user.id, key, value: await packSnap(makeBackup(all, user).data), updated_at: new Date().toISOString() }, { onConflict: "user_id,key" });
  return !error;
}
async function pruneSnaps(user) {
  try {
    const { data } = await sb.from("allinone_data").select("key").eq("user_id", user.id).like("key", "snap:%");
    const keys = (data || []).map(r => r.key);
    const daily = keys.filter(k => !k.endsWith("-pre")).sort().reverse().slice(SNAP_DAYS);
    const pre = keys.filter(k => k.endsWith("-pre")).sort().reverse().slice(3);
    const del = daily.concat(pre);
    if (del.length) await sb.from("allinone_data").delete().eq("user_id", user.id).in("key", del);
  } catch (e) {}
}

function BackupPanel() {
  const { user, all, set, flush } = useData();
  const [snaps, setSnaps] = useState(null);
  const [busy, setBusy] = useState(false);
  const [toast, toastNode] = useToast();
  const fileRef = useRef(null);
  const load = async () => { const { data } = await sb.from("allinone_data").select("key").eq("user_id", user.id).like("key", "snap:%"); setSnaps((data || []).map(r => r.key.slice(5)).sort().reverse()); };
  useEffect(() => { load(); }, []);
  const download = () => {
    const bk = makeBackup(all(), user);
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([JSON.stringify(bk)], { type: "application/json" })); a.download = "allinone-backup-" + todayStr() + ".json"; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  };
  const isObj = v => v && typeof v === "object" && !Array.isArray(v);
  const mergeDoc = (a, b) => {
    if (a === undefined || a === null) return b;
    if (b === undefined || b === null) return a;
    if (Array.isArray(a) && Array.isArray(b)) {
      const key = x => isObj(x) && x.id != null ? "id:" + x.id : "j:" + JSON.stringify(x);
      const bm = new Map(b.map(x => [key(x), x])); const seen = new Set(a.map(key)); return a.map(x => { const y = bm.get(key(x)); return isObj(x) && isObj(y) ? { ...y, ...x } : x; }).concat(b.filter(x => !seen.has(key(x))));
    }
    if (isObj(a) && isObj(b)) { const o = { ...a }; Object.keys(b).forEach(k => { o[k] = k in a ? mergeDoc(a[k], b[k]) : b[k]; }); return o; }
    return a;
  };
  const applyData = async (data, patch, label, merge) => {
    const keys = Object.keys(data || {}).filter(k => /^[a-z][a-z0-9_]{0,40}$/.test(k));
    if (!keys.length) return toast("النسخة دي فاضية.");
    if (!confirmDo((merge ? "هندمج (" + keys.length + " قسم) مع بياناتك الحالية: بيتضاف الناقص بس، وأي حاجة موجودة عندك مش هتتغيّر. " : "هتتبدّل بيانات (" + keys.length + " قسم) ببيانات " + label + ". ") + "هنعمل نسخة أمان قبلها تقدر ترجع لها. تكمل؟")) return;
    setBusy(true);
    try {
      await writeSnap(user, all(), "-pre");
      const cur = all();
      keys.forEach(k => set(k, merge ? mergeDoc(cur[k], data[k]) : data[k]));
      if (patch) set("profile", p => merge ? { ...patch, ...(p || {}) } : { ...(p || {}), ...patch });
      await flush(); await pruneSnaps(user);
      toast("اتستعادت ✓ — بنعيد التحميل…");
      setTimeout(() => location.reload(), 900);
    } catch (e) { toast("حصلت مشكلة: " + e.message); setBusy(false); }
  };
  const onFile = async e => {
    const f = e.target.files && e.target.files[0]; e.target.value = "";
    if (!f) return;
    let bk; try { bk = JSON.parse(await f.text()); } catch (er) { return toast("الملف مش سليم."); }
    if (!bk || bk.app !== "AllinOne" || !bk.data) return toast("ده مش ملف نسخة من AllinOne.");
    if (bk.owner && String(bk.owner).toLowerCase() !== String(user.email || "").toLowerCase()) return toast("النسخة دي لحساب تاني (" + bk.owner + "). سجّل دخول بحسابها الأول.");
    await applyData(bk.data, bk.profile_patch, "الملف", bk.mode === "merge");
  };
  const restoreSnap = async d => {
    setBusy(true);
    try {
      const { data, error } = await sb.from("allinone_data").select("value").eq("user_id", user.id).eq("key", "snap:" + d).single();
      if (error) throw error;
      const data2 = await unpackSnap(data.value);
      setBusy(false);
      if (!data2) return toast("النسخة دي تالفة.");
      await applyData(data2, null, "نسخة " + d);
    } catch (e) { setBusy(false); toast("معرفتش أفتح النسخة."); }
  };
  return h("div", { className: "card" },
    h("div", { style: { fontWeight: 900, fontSize: 15, marginBottom: 12 } }, "💾 النسخ الاحتياطية"),
    h("button", { className: "btn btn-primary", style: { width: "100%", marginBottom: 8 }, onClick: download }, "⬇️ تنزيل نسخة احتياطية دلوقتي"),
    h("button", { className: "btn btn-ghost", style: { width: "100%" }, disabled: busy, onClick: () => fileRef.current && fileRef.current.click() }, "⬆️ استعادة من ملف"),
    h("input", { ref: fileRef, type: "file", accept: "application/json,.json", style: { display: "none" }, onChange: onFile }),
    h("div", { style: { fontSize: 12, color: "var(--muted)", margin: "14px 0 6px" } }, "نسخ تلقائية يومية (سحابة) — آخر " + SNAP_DAYS + " يوم:"),
    snaps === null ? h("div", { style: { padding: 10, textAlign: "center" } }, h("span", { className: "spin" })) :
      snaps.length === 0 ? h("div", { style: { fontSize: 12, color: "var(--muted)", padding: "6px 0" } }, "لسه مفيش نسخ. أول نسخة هتتعمل أول ما تفتح التطبيق بعد أي تعديل.") :
        snaps.map((d, i) => h("div", { key: d, style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0", borderTop: i ? "1px solid var(--line)" : "none" } },
          h("span", { style: { fontWeight: 700, fontSize: 14 } }, d.endsWith("-pre") ? d.slice(0, 10) + " (قبل استعادة)" : d),
          h("button", { className: "btn btn-ghost", style: { padding: "6px 14px", fontSize: 13 }, disabled: busy, onClick: () => restoreSnap(d) }, "استرجاع"))),
    toastNode);
}

function SettingsScreen({ prof, setProf, theme, setTheme, onLogout }) {
  const { user, wipe } = useData();
  const [toast, toastNode] = useToast();
  const [name, setName] = useState(prof.name || ""); const [family, setFamily] = useState(prof.familyName || ""); const [car, setCar] = useState(prof.carName || "");
  const [height, setHeight] = useState(prof.heightCm || ""); const [goal, setGoal] = useState(prof.goalKg || "");
  const [startDay, setStartDay] = useState(prof.monthStartDay || 1); const [gender, setGender] = useState(prof.gender || ""); const [famG, setFamG] = useState(prof.familyGender || "m"); const [ride, setRide] = useState(!!prof.ride);
  const mods = prof.modules || [];
  const [openG, setOpenG] = useState(window.__scrollBackup ? "backup" : "");
  useEffect(() => { const f = () => setOpenG("backup"); window.addEventListener("allinone:open-backup", f); return () => window.removeEventListener("allinone:open-backup", f); }, []);
  const grp = (id, title, body) => h("div", { className: "card", style: { marginBottom: 10, padding: 0, overflow: "hidden" } },
    h("button", { type: "button", onClick: () => setOpenG(g => g === id ? "" : id), "aria-expanded": openG === id, style: { width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", background: "none", border: "none", color: "var(--text)", fontWeight: 900, fontSize: 15, padding: "14px 16px", cursor: "pointer", fontFamily: "inherit" } }, h("span", null, title), h("span", { style: { fontSize: 12, color: "var(--muted)" } }, openG === id ? "▲" : "▼")),
    openG === id && h("div", { style: { padding: "0 14px 14px" } }, body));
  useEffect(() => { if (window.__scrollBackup) { window.__scrollBackup = false; setTimeout(() => { const el = document.getElementById("backup-panel"); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); }, 150); } }, []);
  const toggle = id => { if (id === "daily") return setProf({ ...prof, hideDaily: !prof.hideDaily }); if (id === "fit") return setProf({ ...prof, hideFit: !prof.hideFit }); const n = mods.includes(id) ? mods.filter(x => x !== id) : [...mods, id]; if (!n.length) return toast("لازم قسم واحد على الأقل."); setProf({ ...prof, modules: n }); };
  const saveInfo = () => {
    let nm = mods;
    if (gender === "f" && !nm.includes("period")) nm = [...nm, "period"];
    if (gender !== "f") nm = nm.filter(x => x !== "period");
    if (!nm.length) nm = ["expenses"];
    setProf({ ...prof, name: name.trim() || prof.name, gender, modules: nm, familyName: family.trim(), familyGender: famG, carName: car.trim(), ride, monthStartDay: clamp(parseInt(startDay) || 1, 1, 28), heightCm: num(height) || null, goalKg: num(goal) || null }); toast("اتحفظ ✓");
  };
  const wipeAll = async () => { if (confirmDo("هتمسح كل بياناتك من الجهاز والسحابة نهائيًا (وكل النسخ الاحتياطية كمان). متأكد؟") && confirmDo("آخر تأكيد: مفيش رجوع.")) { await wipe(); try { Object.keys(localStorage).filter(k => k.indexOf("allinone:" + user.id) === 0).forEach(k => localStorage.removeItem(k)); } catch (e) {} try { await sb.auth.signOut(); } catch (e) {} location.reload(); } };
  const sec = t => h("div", { style: { fontWeight: 900, fontSize: 14, margin: "16px 0 8px" } }, t);
  const pick = (val, cur, set, label) => h("button", { type: "button", className: "chip" + (cur === val ? " on" : ""), style: { flex: 1, padding: 10 }, onClick: () => set(val) }, label);
  return h("div", { className: "fade" },
    h("div", { className: "card", style: { marginBottom: 4 } },
      h("div", { style: { fontSize: 12, color: "var(--muted)" } }, "الحساب"), h("div", { style: { fontWeight: 800, direction: "ltr", textAlign: "right" } }, user.email)),
    grp("info", "👤 بياناتك",
      h("div", null,
      h(Field, { label: "الاسم" }, h("input", { value: name, onChange: e => setName(e.target.value), maxLength: 40 })),
      h(Field, { label: "أنا" }, h("div", { style: { display: "flex", gap: 8 } }, pick("m", gender, setGender, "👨 ولد"), pick("f", gender, setGender, "👩 بنت"))),
      h(Field, { label: "اسم الفرد (ميزانية العائلة)" }, h("input", { value: family, onChange: e => setFamily(e.target.value), maxLength: 30 })),
      h(Field, { label: "الفرد ده" }, h("div", { style: { display: "flex", gap: 8 } }, pick("m", famG, setFamG, "👦 ولد"), pick("f", famG, setFamG, "👧 بنت"))),
      h(Field, { label: "العربية" }, h("input", { value: car, onChange: e => setCar(e.target.value), maxLength: 40 })),
      h(Field, { label: "بشتغل بالعربية في النقل الذكي (إندرايف / أوبر)" }, h("div", { style: { display: "flex", gap: 8 } }, pick(true, ride, setRide, "أيوه"), pick(false, ride, setRide, "لأ"))),
      h(Field, { label: "الشهر المالي بيبدأ يوم", hint: "1 = الشهر العادي. لو مرتبك بينزل يوم 25 مثلاً اكتب 25، وكل شهر هيتحسب من 25 لـ 24 (في المصروفات والعربية). الالتزامات الثابتة بتتخصم أوتوماتيك في اليوم ده." }, h("input", { type: "number", inputMode: "numeric", min: 1, max: 28, value: startDay, onChange: e => setStartDay(e.target.value) })),
      h("div", { style: { display: "flex", gap: 10 } },
        h("div", { style: { flex: 1 } }, h(Field, { label: "الطول (سم)" }, h("input", { type: "number", inputMode: "decimal", value: height, onChange: e => setHeight(e.target.value) }))),
        h("div", { style: { flex: 1 } }, h(Field, { label: "الوزن المستهدف" }, h("input", { type: "number", inputMode: "decimal", value: goal, onChange: e => setGoal(e.target.value) })))),
      h("button", { className: "btn btn-primary", style: { width: "100%" }, onClick: saveInfo }, "حفظ"))),
    grp("mods", "🧩 الأقسام",
      h("div", { style: { display: "flex", flexWrap: "wrap", gap: 8 } }, modsFor(prof).map(m => h("button", { key: m.id, className: "chip" + ((m.id === "daily" ? !prof.hideDaily : m.id === "fit" ? !prof.hideFit : mods.includes(m.id)) ? " on" : ""), onClick: () => toggle(m.id) }, m.icon + " " + modTitle(m.id, prof))),
        h("div", { style: { fontSize: 11, color: "var(--muted)", width: "100%" } }, "إخفاء قسم مابيمسحش بياناته."))),
    grp("theme", "🎨 المظهر",
      h("div", { style: { display: "flex", gap: 8 } }, [["dark", "🌙 داكن"], ["light", "☀️ فاتح"]].map(([k, l]) => h("button", { key: k, className: "chip" + (theme === k ? " on" : ""), onClick: () => setTheme(k) }, l)))),
    grp("backup", "☁️ نسخك الاحتياطية", h("div", { id: "backup-panel" }, h(BackupPanel, {}))),
    h("div", { style: { textAlign: "center", fontSize: 11, color: "var(--muted)", margin: "14px 0 4px" } }, "نسخة التطبيق: " + APP_VERSION),
    sec("الحساب"),
    h("div", { style: { display: "grid", gap: 8 } },
      h("button", { className: "btn btn-ghost", onClick: onLogout }, "تسجيل الخروج"),
      h("button", { className: "btn btn-danger", onClick: wipeAll }, "مسح كل بياناتي")),
    toastNode);
}

// ══════════════════════════════════════════════════════════════
// الهيكل الرئيسي
// ══════════════════════════════════════════════════════════════
function Shell({ user }) {
  const { get, set, sync, flush, all } = useData();
  const prof = get("profile", {});
  START_DAY = clamp(parseInt(prof.monthStartDay) || 1, 1, 28);
  const setProf = p => set("profile", p);
  const [theme, setThemeS] = useState(lsGet("allinone:theme", "light"));
  const setTheme = t => { setThemeS(t); lsSet("allinone:theme", t); };
  useEffect(() => { document.documentElement.setAttribute("data-theme", theme); const m = document.querySelector('meta[name="theme-color"]'); if (m) m.content = theme === "dark" ? "#0d2326" : "#fef7e5"; }, [theme]);
  const [screen, setScreen] = useState(history.state && history.state.s || "home");
  useEffect(() => { const p = e => setScreen((e.state && e.state.s) || "home"); window.addEventListener("popstate", p); if (screen !== "home") { history.replaceState({ s: "home" }, ""); history.pushState({ s: screen }, ""); } else history.replaceState({ s: "home" }, ""); return () => window.removeEventListener("popstate", p); }, []);
  const go = s => { history.pushState({ s }, ""); setScreen(s); window.scrollTo(0, 0); };
  const back = () => history.back();
  window.__shellScreen = screen;
  useEffect(() => {
    const AP = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App;
    if (!AP || !AP.addListener) return;
    let hd; const r = AP.addListener("backButton", () => { if (window.__shellScreen && window.__shellScreen !== "home") history.back(); else if (AP.exitApp) AP.exitApp(); });
    Promise.resolve(r).then(x => { hd = x; });
    return () => { try { hd && hd.remove && hd.remove(); } catch (e) {} };
  }, []);
  const goHome = () => { if (screen === "home") { window.scrollTo(0, 0); return; } history.pushState({ s: "home" }, ""); setScreen("home"); window.scrollTo(0, 0); };
  const goBackup = () => { flush(); window.__scrollBackup = true; if (screen === "settings") { window.dispatchEvent(new Event("allinone:open-backup")); setTimeout(() => { const el = document.getElementById("backup-panel"); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); }, 200); window.__scrollBackup = false; } else go("settings"); };
  const [pull, setPull] = useState(0);
  const pullRef = useRef({ y: null });
  useEffect(() => {
    const ok = t => !(t && t.closest && t.closest("input,textarea,select,[role=dialog],.no-pull")) ;
    const ts = e => { pullRef.current.y = (window.scrollY <= 0 && e.touches.length === 1 && ok(e.target)) ? e.touches[0].clientY : null; };
    const tm = e => { const y0 = pullRef.current.y; if (y0 == null) return; const dy = e.touches[0].clientY - y0; if (window.scrollY > 0 || dy < 0) { setPull(0); return; } setPull(Math.min(dy, 140)); };
    const te = () => { const d = pullRef.current.y != null; pullRef.current.y = null; setPull(p => { if (d && p >= 100) setTimeout(() => window.__goHome && window.__goHome(), 0); return 0; }); };
    document.addEventListener("touchstart", ts, { passive: true }); document.addEventListener("touchmove", tm, { passive: true }); document.addEventListener("touchend", te, { passive: true });
    return () => { document.removeEventListener("touchstart", ts); document.removeEventListener("touchmove", tm); document.removeEventListener("touchend", te); };
  }, []);
  window.__goHome = () => { if (!prof.onboarded) { location.reload(); return; } if (screen !== "home" && screen !== "athkar") goHome(); };
  useEffect(() => {
    if (!prof.onboarded) return;
    const k = "allinone:" + user.id + ":lastSnap";
    if (lsGet(k, "") === todayStr()) return;
    (async () => { if (await writeSnap(user, all())) { lsSet(k, todayStr()); pruneSnaps(user); } })();
  }, [prof.onboarded]);
  useEffect(() => {
    const MA = window.AllInOneAthkar;
    if (MA && prof.onboarded) { MA.init(user.id, { all: () => get("athkar_prefs", {}), set: (k, v) => set("athkar_prefs", d => ({ ...(d || {}), [k]: v })) }, { sb }); MA.boot(); }
  }, [prof.onboarded]);
  useEffect(() => {
    if (!prof.onboarded) return;
    const onA = e => { const k = e.detail && e.detail.key; if (k === "athkar_morning" || k === "athkar_evening") dailyTick(set, todayStr(), x => { const a = dailyAuto(x.t); return a && a.k === (k === "athkar_morning" ? "morning" : "evening"); }); };
    const onS = e => { const nm = nzAr(e.detail && e.detail.name); if (nm) dailyTick(set, todayStr(), x => { const a = dailyAuto(x.t); return a && a.k === "surah" && (a.name === nm || a.name === nzAr("ال" + nm)); }); };
    window.addEventListener("allinone:athkar-done", onA); window.addEventListener("allinone:surah-read", onS);
    return () => { window.removeEventListener("allinone:athkar-done", onA); window.removeEventListener("allinone:surah-read", onS); };
  }, [prof.onboarded]);
  const [adhanTap, setAdhanTap] = useState("");
  useEffect(() => {
    const applyGo = g => {
      if (!g || g === "none") return;
      if (g === "adhan") { const MA = window.AllInOneAthkar; if (MA && MA.playAdhan) MA.playAdhan().then(ok => setAdhanTap(ok ? "playing" : "tap")); return; }
      if (g === "quran" || g === "athkar" || g === "tasbih" || g.indexOf("athkar_") === 0) { window.__pendingGo = g; go("athkar"); window.dispatchEvent(new Event("rafiqi-go")); }
      else if (g === "tahwish" || g === "finance_add") go("expenses");
      else if (g === "car" || g === "goals" || g === "meals") go(g);
      else goHome();
    };
    const onMsg = e => { if (e.data && e.data.type === "go") applyGo(e.data.go); };
    const onNat = e => applyGo(e.detail);
    window.addEventListener("allinone:go", onNat);
    if (window.__nativeGo) { const g0 = window.__nativeGo; window.__nativeGo = null; setTimeout(() => applyGo(g0), 600); }
    if ("serviceWorker" in navigator) navigator.serviceWorker.addEventListener("message", onMsg);
    try { const u = new URL(location.href); const g = u.searchParams.get("go"); if (g) { u.searchParams.delete("go"); history.replaceState(history.state, "", u.pathname + u.search + u.hash); setTimeout(() => applyGo(g), 400); } } catch (e) {}
    return () => { window.removeEventListener("allinone:go", onNat); if ("serviceWorker" in navigator) navigator.serviceWorker.removeEventListener("message", onMsg); };
  }, [prof.onboarded]);
  if (!prof.onboarded) return h(Onboarding, { defaultName: (user.user_metadata && user.user_metadata.name) || "", email: user.email, onLogout: async () => { await flush(); await sb.auth.signOut(); }, onDone: p => setProf(p) });
  const mods = (prof.modules || []).filter(id => id !== "daily" && id !== "fit").concat(prof.hideFit ? [] : ["fit"]).concat(prof.hideDaily ? [] : ["daily"]).filter(id => modsFor(prof).some(m => m.id === id));
  const valid = screen === "home" || screen === "settings" || mods.includes(screen);
  const cur = valid ? screen : "home";
  let body;
  if (cur === "home") {
    const hr = new Date().getHours();
    const greet = hr < 5 ? "سهران؟" : hr < 12 ? "صباح الخير" : hr < 18 ? "نهارك سعيد" : "مساء الخير";
    body = h("div", { className: "fade" },
      h("div", { style: { margin: "6px 2px 18px" } }, h("div", { style: { fontSize: 13, color: "var(--muted)", fontWeight: 700 } }, greet), h("div", { style: { fontSize: 26, fontWeight: 900 } }, prof.name || "")),
      h(HomeMotivation, null),
      h("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 } }, mods.map(id => {
        const m = MODULES.find(x => x.id === id);
        return h("button", { key: id, onClick: () => go(id), className: "card", style: { textAlign: "right", cursor: "pointer", padding: 16, minHeight: 120, display: "flex", flexDirection: "column", justifyContent: "space-between", color: "var(--text)" } },
          h("span", { style: { fontSize: 32 } }, m.icon), h("span", { style: { fontWeight: 900, fontSize: 15, lineHeight: 1.5 } }, modTitle(id, prof)));
      })),
      SOON.length > 0 && h("div", { style: { marginTop: 18, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", color: "var(--muted)", fontSize: 12 } }, h("span", null, "قريبًا:"), SOON.map(s => h("span", { key: s.title, className: "chip", style: { opacity: .6, cursor: "default" } }, s.icon + " " + s.title))));
  } else if (cur === "settings") body = h(SettingsScreen, { prof, setProf, theme, setTheme, onLogout: async () => { await flush(); await sb.auth.signOut(); } });
  else if (cur === "expenses") body = h(ExpensesModule, { docKey: "expenses", who: "", ride: !!prof.ride });
  else if (cur === "family") body = h(FamilyModule, { prof });
  else if (cur === "period") body = h(PeriodTracker, { docKey: "period" });
  else if (cur === "goals") body = h(GoalsHub, {});
  else if (cur === "daily") body = h(DailyModule, {});
  else if (cur === "car") body = h(CarModule, { prof });
  else if (cur === "weight") body = h(WeightModule, { prof });
  else if (cur === "fit") body = h(FitModule, { prof, go });
  else if (cur === "meals") body = h(MealsModule, {});
  else if (cur === "athkar") body = h(AthkarModule, { user });
  const title = cur === "home" ? APP_NAME : cur === "settings" ? "الإعدادات" : modTitle(cur, prof);
  const syncTxt = sync === "saving" ? "⏳" : sync === "error" ? "⚠️" : sync === "offline" ? "📴" : "☁️";
  return h("div", { style: { maxWidth: 520, margin: "0 auto", padding: "0 14px calc(40px + env(safe-area-inset-bottom))" } },
    pull > 20 && cur !== "home" && cur !== "athkar" && h("div", { style: { position: "fixed", top: "calc(8px + env(safe-area-inset-top))", left: 0, right: 0, textAlign: "center", zIndex: 50, pointerEvents: "none", transform: "translateY(" + Math.min(pull / 3, 40) + "px)" } }, h("span", { className: "chip on", style: { fontSize: 12 } }, pull >= 100 ? "↓ سيب للرجوع للرئيسية" : "↓ كمّل السحب للرئيسية")),
    h("header", { id: "app-top-header", style: { position: "sticky", top: 0, zIndex: 20, background: "var(--bg)", display: "flex", alignItems: "center", gap: 10, padding: "calc(12px + env(safe-area-inset-top)) 0 10px" } },
      cur !== "home" && h("button", { className: "btn btn-ghost", onClick: back, "aria-label": "رجوع", style: { padding: "6px 13px" } }, "→"),
      h("img", { src: "icon-192.png", alt: "الرئيسية", title: "الرئيسية", onClick: goHome, width: 34, height: 34, style: { borderRadius: 10, cursor: "pointer" } }),
      h("div", { style: { flex: 1, fontWeight: 900, fontSize: 18 } }, title),
      h("span", { title: sync === "error" ? "في تعديلات لسه ماتحفظتش على السحابة" : "النسخ الاحتياطية", onClick: goBackup, role: "button", "aria-label": "النسخ الاحتياطية", style: { fontSize: 17, cursor: "pointer", padding: 4 } }, syncTxt),
      cur !== "settings" && h("button", { className: "btn btn-ghost", onClick: () => go("settings"), "aria-label": "الإعدادات", style: { padding: "6px 11px" } }, "⚙️")),
    adhanTap && h("div", { style: { position: "fixed", bottom: "calc(20px + env(safe-area-inset-bottom))", left: 0, right: 0, display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: 8, zIndex: 60, padding: "0 12px" } },
      window.__adhanInfo && h("div", { style: { flexBasis: "100%", textAlign: "center", fontSize: 11, color: "var(--muted)", background: "var(--card)", borderRadius: 10, padding: "4px 8px" } }, window.__adhanInfo),
      adhanTap === "tap" && h("button", { className: "btn btn-primary", onClick: () => { const MA = window.AllInOneAthkar; MA.playAdhan().then(ok => setAdhanTap(ok ? "playing" : "")); } }, "▶ شغّل الأذان"),
      h("button", { className: "btn btn-ghost", style: { background: "var(--card)" }, onClick: () => { const MA = window.AllInOneAthkar; if (MA && MA.stopAdhan) MA.stopAdhan(); setAdhanTap(""); } }, adhanTap === "tap" ? "✕" : "⏹ إيقاف الأذان")),
    body);
}

function App() {
  const [session, setSession] = useState(undefined);
  const [recovery, setRecovery] = useState(false);
  useEffect(() => {
    sb.auth.getSession().then(({ data }) => setSession(data.session || null));
    const { data: sub } = sb.auth.onAuthStateChange((ev, s) => { if (ev === "PASSWORD_RECOVERY") setRecovery(true); setSession(s || null); });
    return () => sub.subscription.unsubscribe();
  }, []);
  useEffect(() => { document.documentElement.setAttribute("data-theme", lsGet("allinone:theme", "light")); }, []);
  if (session === undefined) return h(Splash, { text: "…" });
  if (!session) return h(AuthScreen, {});
  if (recovery) return h(NewPassword, { onDone: () => setRecovery(false) });
  return h(DataProvider, { user: session.user, key: session.user.id }, h(Shell, { user: session.user }));
}
function NewPassword({ onDone }) {
  const [pw, setPw] = useState(""); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const go = async () => { if (pw.length < 6) return setErr("الباسورد 6 حروف على الأقل."); setBusy(true); const { error } = await sb.auth.updateUser({ password: pw }); setBusy(false); if (error) setErr(authErr(error.message)); else onDone(); };
  return h("div", { style: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 18 } }, h("div", { className: "card", style: { width: "100%", maxWidth: 400 } },
    h("div", { style: { fontWeight: 900, fontSize: 18, marginBottom: 12 } }, "باسورد جديد"),
    h(Field, { label: "الباسورد الجديد" }, h(PwInput, { value: pw, onChange: e => setPw(e.target.value), autoFocus: true })),
    err && h("div", { style: { color: "var(--danger)", fontSize: 13, marginBottom: 8 } }, err),
    h("button", { className: "btn btn-primary", style: { width: "100%" }, disabled: busy, onClick: go }, "حفظ")));
}

// ══════════════════════════════════════════════════════════════
// تنظيم الوجبات
// ══════════════════════════════════════════════════════════════
const MEAL_DAYS = ["السبت", "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];
const MEAL_COLS = [["breakfast", "🍳 فطار"], ["lunch", "🍛 غداء"], ["dinner", "🍽️ عشاء"], ["drinks", "🥤 مشروبات"], ["notes", "📝 ملاحظات"]];
const addDaysStr = (ds, k) => { const [y, m, d] = ds.split("-").map(Number); const dt = new Date(y, m - 1, d + k); return dt.getFullYear() + "-" + pad(dt.getMonth() + 1) + "-" + pad(dt.getDate()); };
const weekDatesFor = off => { const t = new Date(); const diff = (t.getDay() + 1) % 7; const sat = new Date(t.getFullYear(), t.getMonth(), t.getDate() - diff + off * 7); const base = sat.getFullYear() + "-" + pad(sat.getMonth() + 1) + "-" + pad(sat.getDate()); return MEAL_DAYS.map((_, i) => addDaysStr(base, i)); };

// ══════════════════════════════════════════════════════════════
// مدرّبي — مدرّب تمارين وأكل ذكي (أسئلة بالترتيب + خطة كاملة + ربط بالميزان والأهداف اليومية)
// ══════════════════════════════════════════════════════════════
const FIT_DAYS = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"]; // 0 = السبت
const fitDayIdx = (d) => ((d || new Date()).getDay() + 1) % 7;
const FIT_MUSCLES = [["chest", "الصدر"], ["triceps", "الترايسبس"], ["back", "الضهر (Lats)"], ["biceps", "الباي"], ["shoulders", "الكتف"], ["abs", "البطن"], ["forearms", "الساعد"], ["traps", "الترابس"], ["glutes", "الجلوتس"], ["quads", "الفخذ الأمامي"], ["hams", "الفخذ الخلفي"], ["calves", "السمانة"]];
const FIT_MN = Object.fromEntries(FIT_MUSCLES);
const FIT_EQ = { none: { t: "جسمي بس (من غير أدوات)", i: "🤸", a: ["bw"] }, db: { t: "دمبل بس", i: "🏋️", a: ["bw", "db"] }, garage: { t: "جيم بيت (بار وأثقال)", i: "🏠", a: ["bw", "db", "bb", "pu"] }, full: { t: "جيم كامل (أجهزة وبارات)", i: "🏟️", a: ["bw", "db", "bb", "pu", "mc"] }, custom: { t: "مخصّص", i: "⚙️", a: [] } };
const FIT_EQ_PARTS = [["db", "دمبلز"], ["bb", "بار وأثقال"], ["pu", "بار عقلة"], ["mc", "أجهزة وكابل"]];
// [id, الاسم, العضلة, الأداة, مركّب؟, نصيحة, علامة إصابة]
const FIT_EX = [
  ["pushup", "ضغط (Push-ups)", "chest", "bw", 1, "الجسم خط مستقيم، انزل لحد ما صدرك يقرّب من الأرض.", "shoulder"],
  ["pushup_wide", "ضغط واسع", "chest", "bw", 0, "إيدك أوسع من كتفك شوية، حس بالشدّ في الصدر."],
  ["dbpress", "ضغط دمبل (على الأرض)", "chest", "db", 1, "انزل بتحكّم ٢ ثانية واضغط لفوق بقوة."],
  ["dbfly", "فتح دمبل (Fly)", "chest", "db", 0, "ديّق كوعك شوية وافتح لحد مستوى الصدر."],
  ["bench", "بنش بريس بالبار", "chest", "bb", 1, "كتفك لورا ولزق، والبار ينزل لنص الصدر.", "shoulder"],
  ["cablefly", "كابل كروس أوفر", "chest", "mc", 0, "اضغط الصدر في آخر الحركة ثانية."],
  ["pikepush", "ضغط كتف (Pike)", "shoulders", "bw", 1, "الوِرك لفوق على شكل V وانزل براسك لقدّام.", "shoulder"],
  ["dbohp", "ضغط كتف بالدمبل", "shoulders", "db", 1, "اضغط لفوق من غير ما تقوّس ضهرك.", "shoulder"],
  ["lateral", "رفرفة جانبي دمبل", "shoulders", "db", 0, "ارفع لحد مستوى الكتف وانزل ببطء."],
  ["ohp", "ضغط كتف بالبار", "shoulders", "bb", 1, "شدّ بطنك وماتميّلش لورا.", "shoulder"],
  ["machshoulder", "ضغط كتف على الجهاز", "shoulders", "mc", 1, "ضهرك لزق في المسند."],
  ["bwrow", "سحب مقلوب تحت ترابيزة ثابتة", "back", "bw", 1, "اسحب صدرك للبار وشد لوحَي الكتف.", "back"],
  ["superman", "سوبرمان", "back", "bw", 0, "ارفع إيدك ورجلك مع بعض وثبّت ثانيتين."],
  ["dbrow", "سحب دمبل بإيد واحدة", "back", "db", 1, "ظهرك مستقيم واسحب الكوع لورا ناحية الوِرك.", "back"],
  ["pullup", "عقلة (Pull-ups)", "back", "pu", 1, "انزل كامل واطلع بصدرك للبار."],
  ["bbrow", "سحب بالبار (Row)", "back", "bb", 1, "نص جسمك مايل وضهرك مفرود.", "back"],
  ["latpull", "سحب أمامي على الجهاز", "back", "mc", 1, "اسحب البار لأعلى صدرك مش ورا الرقبة."],
  ["bwcurl", "باي بالمنشفة (مقاومة)", "biceps", "bw", 0, "قاوم بإيدك التانية طول الحركة."],
  ["dbcurl", "باي دمبل", "biceps", "db", 0, "الكوع ثابت جنب جسمك."],
  ["hammer", "هامر كيرل", "biceps", "db", 0, "كفّك في وضع المطرقة، حركة بطيئة."],
  ["bbcurl", "باي بالبار", "biceps", "bb", 0, "من غير تأرجح بجسمك."],
  ["cablecurl", "باي كابل", "biceps", "mc", 0, "اضغط في الأعلى ثانية."],
  ["diamond", "ضغط ضيّق (Diamond)", "triceps", "bw", 1, "إيديك تحت صدرك على شكل ألماظة."],
  ["benchdip", "ديبس على كرسي", "triceps", "bw", 0, "انزل لحد ٩٠° وماتبعدش عن الكرسي.", "shoulder"],
  ["dbext", "ترايسبس خلف الراس دمبل", "triceps", "db", 0, "الكوع لفوق وثابت."],
  ["skull", "سكول كراشر بالبار", "triceps", "bb", 0, "انزل ناحية الجبهة بتحكّم."],
  ["pushdown", "ترايسبس كابل لتحت", "triceps", "mc", 0, "الكوع لزق في جنبك."],
  ["crunch", "كرنش بطن", "abs", "bw", 0, "ارفع كتفك بس ومتشدّش رقبتك."],
  ["plank", "بلانك (ثبات)", "abs", "bw", 1, "جسم مستقيم وبطن مشدودة."],
  ["legraise", "رفع الرجلين", "abs", "bw", 0, "ضهرك لزق في الأرض."],
  ["bicycle", "دراجة هوائية", "abs", "bw", 0, "لفّة بطيئة ومتحكّم فيها."],
  ["cablecrunch", "كرنش كابل", "abs", "mc", 0, "اطوي بطنك مش وسطك."],
  ["squat", "سكوات (وزن الجسم)", "quads", "bw", 1, "ركبتك في اتجاه صوابعك وضهرك مفرود.", "knee"],
  ["lunge", "لانجز (طعنات)", "quads", "bw", 1, "اخطي خطوة كبيرة وانزل بتحكّم.", "knee"],
  ["goblet", "جوبلت سكوات بدمبل", "quads", "db", 1, "الدمبل قدام صدرك والنزول عميق.", "knee"],
  ["bbsquat", "سكوات بالبار", "quads", "bb", 1, "البار على الكتف الخلفي والبطن مشدودة.", "knee"],
  ["legpress", "ليج بريس", "quads", "mc", 1, "ماتقفلش ركبتك آخر الحركة.", "knee"],
  ["legext", "رفع الرجل المفرودة وانت قاعد", "quads", "bw", 0, "ارفع الرجل لحد ما تتفرد وثبّت ثانية، حركة لطيفة على الركبة."],
  ["bridge1", "جسر برجل واحدة", "hams", "bw", 1, "ارفع وِركك لفوق واضغط الخلفية."],
  ["dbrdl", "رومانيان ديدلفت دمبل", "hams", "db", 1, "ضهرك مستقيم وانزل الدمبل جنب رجلك.", "back"],
  ["bbrdl", "رومانيان ديدلفت بار", "hams", "bb", 1, "ادفع وِركك لورا وانت ماسك البار.", "back"],
  ["legcurl", "ليج كيرل", "hams", "mc", 0, "اسحب بتحكّم وارجع ببطء."],
  ["glutebridge", "جسر الجلوتس", "glutes", "bw", 1, "اضغط الجلوتس فوق ثانيتين."],
  ["donkey", "ركلة الحمار", "glutes", "bw", 0, "ارفع رجلك لفوق من غير ما تقوّس ضهرك."],
  ["dbthrust", "هيب ثراست بدمبل", "glutes", "db", 1, "ضهرك على كرسي والدمبل على وِركك."],
  ["hipthrust", "هيب ثراست بالبار", "glutes", "bb", 1, "اضغط الجلوتس بقوة في القمة."],
  ["calfraise", "سمانة وقوف", "calves", "bw", 0, "اطلع على مشط رجلك وانزل ببطء."],
  ["dbcalf", "سمانة بالدمبل", "calves", "db", 0, "امسك دمبل بإيد وثبّت بالتانية."],
  ["machcalf", "سمانة على الجهاز", "calves", "mc", 0, "مدّ كامل ثم شدّ كامل."],
  ["shrug", "رفع الكتف بالدمبل (Shrug)", "traps", "db", 0, "ارفع كتفك لودنك وثبّت ثانية."],
  ["bbshrug", "شراج بالبار", "traps", "bb", 0, "من غير لف بالكتف."],
  ["ytraise", "رفع Y مستلقي", "traps", "bw", 0, "مستلقي على بطنك وارفع دراعاتك على شكل Y."],
  ["wristcurl", "رسغ بالدمبل", "forearms", "db", 0, "الساعد على الفخذ والحركة بالرسغ بس."],
  ["handwalk", "مشي بالإيد (Inchworm)", "forearms", "bw", 0, "ادّي إيديك قدّام واحدة واحدة."],
  ["hang", "تعلّق بالبار", "forearms", "pu", 0, "اتعلّق أطول وقت ممكن."]
];
const FIT_EXB = Object.fromEntries(FIT_EX.map(e => [e[0], e]));
const FIT_SPLIT = {
  1: [["full"]], 2: [["full"], ["full"]], 3: [["full"], ["full"], ["full"]],
  4: [["upper"], ["lower"], ["upper"], ["lower"]], 5: [["push"], ["pull"], ["legs"], ["upper"], ["lower"]],
  6: [["push"], ["pull"], ["legs"], ["push"], ["pull"], ["legs"]], 7: [["push"], ["pull"], ["legs"], ["upper"], ["lower"], ["abs"], ["push"]]
};
const FIT_DAYM = { full: ["chest", "back", "quads", "shoulders", "hams", "abs"], upper: ["chest", "back", "shoulders", "biceps", "triceps"], lower: ["quads", "hams", "glutes", "calves", "abs"], push: ["chest", "shoulders", "triceps", "abs"], pull: ["back", "traps", "biceps", "forearms"], legs: ["quads", "hams", "glutes", "calves"], abs: ["abs", "glutes", "calves"] };
const FIT_DAYN = { full: "جسم كامل", upper: "جزء علوي", lower: "جزء سفلي", push: "دفع (صدر/كتف/ترايسبس)", pull: "سحب (ضهر/باي)", legs: "رجل", abs: "بطن وثبات" };
const fitAllowed = pf => pf.equip === "custom" ? ["bw"].concat(pf.eqParts || []) : FIT_EQ[pf.equip || "none"].a;
const fitBlocked = pf => { const t = String(pf.extra || ""); const s = []; if (/ركب|knee/i.test(t)) s.push("knee"); if (/ضهر|ظهر|فقر|back|disc/i.test(t)) s.push("back"); if (/كتف|shoulder/i.test(t)) s.push("shoulder"); return s; };
const fitNum = (n, d) => { const v = Number(n); return isFinite(v) && v > 0 ? v : d; };
const fitBmi = (kg, cm) => kg && cm ? kg / Math.pow(cm / 100, 2) : null;
const fitBmiInfo = b => b == null ? ["—", "var(--muted)"] : b < 18.5 ? ["نحافة", "#3b82f6"] : b < 25 ? ["وزن طبيعي", "#22c55e"] : b < 30 ? ["وزن زائد", "#eab308"] : b < 35 ? ["سمنة", "#f97316"] : ["سمنة مفرطة", "#ef4444"];
function fitNutrition(pf, kg, adj) {
  const w = fitNum(kg, 70), hh = fitNum(pf.height, 170), a = fitNum(pf.age, 30);
  const bmr = 10 * w + 6.25 * hh - 5 * a + (pf.gender === "f" ? -161 : 5);
  const act = [1.2, 1.3, 1.38, 1.45, 1.52, 1.6, 1.68, 1.75][clamp(pf.perWeek || 3, 0, 7)];
  const tdee = Math.round(bmr * act);
  let kcal = tdee + (pf.goal === "lose" ? -Math.max(350, Math.round(tdee * 0.2)) : pf.goal === "build" ? 300 : 0) + (adj || 0);
  kcal = Math.round(Math.max(kcal, pf.gender === "f" ? 1200 : 1500) / 10) * 10;
  const protein = Math.round(w * (pf.goal === "fit" ? 1.6 : 2));
  const fat = Math.round(kcal * 0.27 / 9);
  const carb = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4));
  return { bmr: Math.round(bmr), tdee, kcal, protein, fat, carb, water: Math.round(w * 0.035 * 10) / 10 };
}
// بنك الوجبات (سعرات أساسية تقريبية للحصة الواحدة) — أكل مصري بسيط
const FIT_MEALS = {
  b: [["فول بزيت زيتون + ٢ بيض مسلوق + عيش أسمر", 520], ["أومليت ٣ بيضات بالخضار + عيش توست أسمر", 480], ["جبنة قريش + خيار وطماطم + عيش أسمر + زيتون", 400], ["شوفان بلبن + موز + ملعقة زبدة فول سوداني", 520], ["بيض مسلوق + جبنة رومي + عيش بلدي + خضار", 470], ["زبادي يوناني + شوفان + فواكه + مكسرات", 450], ["فطير مشلتت صغير + بيضة + جبنة قريش", 560]],
  l: [["صدور فراخ مشوية + أرز + سلطة + خضار سوتيه", 650], ["كفتة مشوية + أرز بسمتي + سلطة خضراء", 700], ["سمك مشوي + بطاطس مسلوقة + سلطة", 600], ["لحمة بالخضار + أرز + سلطة", 720], ["فراخ بالفرن + مكرونة + سلطة", 680], ["عدس بالخضار + ٢ بيض + أرز + سلطة", 640], ["تونة + مكرونة + خضار + زيت زيتون", 620]],
  s: [["موزة + حفنة لوز", 230], ["زبادي + خيار", 160], ["تفاحة + ملعقة زبدة فول سوداني", 230], ["علبة تونة صغيرة + عيش توست", 250], ["جبنة قريش + طماطم", 170], ["سموذي بروتين (لبن + موز + شوفان)", 300], ["بيضتين مسلوقتين + ثمرة فاكهة", 240]],
  d: [["سلطة + تونة + بيضتين + عيش", 450], ["شوربة خضار + ١٥٠ جم فراخ مشوية", 400], ["جبنة قريش + خضار + رغيف صغير", 380], ["أومليت + سلطة + عيش أسمر", 430], ["زبادي + شوفان + فاكهة", 380], ["سمك مشوي + سلطة", 420], ["كبدة مشوية + سلطة + عيش", 440]]
};
function fitMealPlan(nut) {
  const shr = [["فطار", "b", 0.25], ["غدا", "l", 0.35], ["سناك", "s", 0.15], ["عشا", "d", 0.25]];
  return FIT_DAYS.map((dn, i) => ({ day: dn, meals: shr.map(([t, k, p]) => { const o = FIT_MEALS[k][i % 7]; const target = Math.round(nut.kcal * p); const sc = clamp(Math.round(target / o[1] * 10) / 10, 0.5, 2); return { t, txt: o[0], kcal: target, sc }; }) }));
}
function fitPick(m, allowed, n, used, blocked, seed) {
  let pool = FIT_EX.filter(e => e[2] === m && allowed.includes(e[3]) && !blocked.includes(e[6]) && !used.has(e[0]));
  if (!pool.length && !FIT_EX.some(e => e[2] === m && blocked.includes(e[6]))) pool = FIT_EX.filter(e => e[2] === m && e[3] === "bw" && !used.has(e[0]));
  const rank = e => (allowed.indexOf(e[3]) + 1) * 2 + (e[4] ? 3 : 0);
  pool.sort((a, b) => rank(b) - rank(a));
  const out = []; for (let i = 0; i < pool.length && out.length < n; i++) { const e = pool[(i + seed) % pool.length]; if (!out.includes(e)) out.push(e); }
  out.forEach(e => used.add(e[0])); return out;
}
// يبني الخطة: أيام الأسبوع × تمارين
function fitBuildPlan(pf, cardio) {
  const allowed = fitAllowed(pf), blocked = fitBlocked(pf);
  const days = (pf.days || []).filter(d => d.on).map(d => d.i); const n = clamp(days.length || pf.perWeek || 3, 1, 7);
  const tpl = FIT_SPLIT[n]; const focus = pf.focus || [];
  const total = pf.exp === "pro" ? 7 : pf.exp === "mid" ? 6 : 5;
  const sets0 = pf.exp === "zero" ? 2 : pf.exp === "pro" ? 4 : 3;
  const reps = pf.goal === "lose" ? "12-15" : pf.goal === "build" ? "8-12" : "10-12";
  const rest = pf.goal === "lose" ? 45 : pf.goal === "build" ? 75 : 60;
  const sess = tpl.map(([t], si) => {
    const used = new Set(); let ms = FIT_DAYM[t].slice();
    focus.forEach(f => { if (!ms.includes(f) && (si % 2 === 0)) ms.push(f); });
    let exs = [];
    ms.forEach(m => fitPick(m, allowed, 1, used, blocked, si).forEach(e => exs.push({ m, e })));
    let guard = 0;
    while (exs.length < total && guard++ < 20) { const pri = ms.filter(m => focus.includes(m)).concat(ms); const m = pri[(guard - 1) % pri.length]; const x = fitPick(m, allowed, 1, used, blocked, si + guard); if (x.length) exs.push({ m, e: x[0] }); }
    exs = exs.slice(0, total + (focus.some(f => ms.includes(f)) ? 1 : 0));
    const list = exs.map(({ m, e }) => ({ id: e[0], sets: sets0 + (focus.includes(m) && pf.exp !== "zero" && e[4] ? 1 : 0), reps: e[0] === "plank" || e[0] === "hang" ? "30-45 ث" : reps, rest }));
    if (cardio || pf.goal === "lose") list.push({ id: allowed.includes("rope") ? "rope" : "cardio", sets: 1, reps: pf.goal === "lose" || cardio ? "10-15 د" : "8 د", rest: 0 });
    return { type: t, name: FIT_DAYN[t], ex: list };
  });
  return { sessions: sess, start: todayStr(), refKg: fitNum(pf.weight, 70), cardio: !!cardio, ver: 1 };
}
const FIT_CARDIO = ["cardio", "كارديو خفيف (جري في المكان/نط حبل/مشي سريع)", "abs", "bw", 0, "خلّي نفَسك منتظم وسرعة متوسطة."];
const fitEx = id => id === "cardio" ? FIT_CARDIO : FIT_EXB[id];
// أسبوع التمرين الحالي (١–١٢) ونوع المرحلة
const fitWeekNo = plan => Math.max(1, Math.floor((new Date(todayStr()) - new Date(plan.start)) / 864e5 / 7) + 1);
const fitPhase = w => w <= 4 ? ["تأسيس", "ركّز على الأداء الصح والتحكّم"] : w <= 8 ? ["بناء", "زوّد الأوزان تدريجيًا"] : ["تكثيف", "أقوى مرحلة — ادفع نفسك"];
function fitSets(item, idx, week) { if (item.id === "cardio" || /د/.test(String(item.reps))) return 1; const b = item.sets; return week <= 4 ? b : week <= 8 ? (idx < 2 ? b + 1 : b) : Math.min(5, b + 1); }
// تكييف الخطة مع تغيّر الوزن (من الميزان)
function fitAdapt(pf, plan, kgNow) {
  const d = Math.round((kgNow - plan.refKg) * 10) / 10; if (Math.abs(d) < 1.5) return null;
  let adj = 0, cardio = plan.cardio, note = "";
  if (pf.goal === "lose") { if (d <= -1.5) { adj = 0; note = "نزلت " + Math.abs(d) + " كجم — عظمة! حسبنا سعراتك من الوزن الجديد وكملنا بنفس الخطة."; } else { adj = -150; cardio = true; note = "وزنك زاد " + d + " كجم — قلّلنا ١٥٠ سعر وزوّدنا كارديو في كل تمرين."; } }
  else if (pf.goal === "build") { if (d >= 1.5) { note = "زيادة " + d + " كجم — تمام لبناء العضل. حسبنا سعراتك من جديد."; } else { adj = 250; note = "وزنك نزل " + Math.abs(d) + " كجم — زوّدنا ٢٥٠ سعر عشان العضل يكبر."; } cardio = false; }
  else { adj = 0; note = "وزنك اتغيّر " + (d > 0 ? "+" : "") + d + " كجم — حدّثنا سعراتك للمحافظة على الشكل."; }
  return { adj, cardio, note, d, kg: kgNow, at: todayStr() };
}
// إشعارات تذكير (في تطبيق الأندرويد فقط)
async function fitSchedule(pf) {
  try {
    const LN = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications; if (!LN) return;
    const ids = []; for (let i = 0; i < 40; i++) ids.push({ id: 9100 + i });
    try { await LN.cancel({ notifications: ids }); } catch (e) {}
    const on = (pf.days || []).filter(d => d.on); if (!on.length) return;
    const list = []; const now = new Date();
    for (let k = 0; k < 14 && list.length < 40; k++) {
      const dt = new Date(now); dt.setDate(now.getDate() + k); const di = fitDayIdx(dt); const cfg = on.find(d => d.i === di); if (!cfg) continue;
      for (const tm of [cfg.time || "18:00"].concat(cfg.times || [])) { const [hh, mm] = String(tm).split(":").map(Number); const d2 = new Date(dt); d2.setHours(hh, mm, 0, 0); if (d2 <= now || list.length >= 40) continue;
        list.push({ id: 9100 + list.length, title: "وقت التمرين 💪", body: (pf.name ? pf.name + "، " : "") + "تمرين النهارده مستنّيك — ٣٠ دقيقة وبتخلّص.", schedule: { at: d2, allowWhileIdle: true }, channelId: "reminders", largeIcon: "ic_large", smallIcon: "ic_stat_icon" }); }
    }
    if (list.length) await LN.schedule({ notifications: list });
  } catch (e) {}
}
const FW = { bg: "#0a1128", card: "#141d3a", card2: "#1b2650", line: "#26335f", blue: "#2f6bff", blue2: "#5b8cff", text: "#fff", mut: "#8c98b8", ok: "#22c55e" };
const FIGR = {
  front: [["traps", "ellipse", { cx: 49, cy: 41, rx: 9, ry: 4.5 }], ["shoulders", "ellipse", { cx: 33, cy: 51, rx: 8, ry: 9.5 }], ["chest", "ellipse", { cx: 47, cy: 62, rx: 12.5, ry: 9.5 }], ["biceps", "ellipse", { cx: 24, cy: 77, rx: 5.5, ry: 13 }], ["forearms", "ellipse", { cx: 20, cy: 106, rx: 5, ry: 16 }], ["abs", "rect", { x: 52, y: 74, width: 7.5, height: 38, rx: 4 }], ["quads", "ellipse", { cx: 47, cy: 152, rx: 10.5, ry: 30 }], ["calves", "ellipse", { cx: 45, cy: 214, rx: 7, ry: 23 }]],
  back: [["traps", "ellipse", { cx: 49, cy: 45, rx: 10, ry: 8 }], ["shoulders", "ellipse", { cx: 33, cy: 51, rx: 8, ry: 9.5 }], ["back", "ellipse", { cx: 47, cy: 80, rx: 12, ry: 17 }], ["triceps", "ellipse", { cx: 24, cy: 77, rx: 5.5, ry: 13 }], ["forearms", "ellipse", { cx: 20, cy: 106, rx: 5, ry: 16 }], ["glutes", "ellipse", { cx: 48, cy: 126, rx: 11.5, ry: 10 }], ["hams", "ellipse", { cx: 47, cy: 168, rx: 10, ry: 26 }], ["calves", "ellipse", { cx: 45, cy: 214, rx: 7, ry: 23 }]]
};
function BodyFig({ hl, side, h: ht, fem, all }) {
  const hs = hl || [];
  const bk = ["back", "triceps", "hams", "glutes"], fr = ["chest", "abs", "biceps", "quads"];
  const sd = side || (hs.some(m => bk.includes(m)) && !hs.some(m => fr.includes(m)) ? "back" : "front");
  const col = m => hs.includes(m) ? FW.blue : all ? "#3a4a86" : "#2a355f";
  const part = (k, mirror) => FIGR[sd].map(([m, t, p]) => h(t, Object.assign({ key: k + m, fill: col(m), stroke: hs.includes(m) ? FW.blue2 : "#0a1128", strokeWidth: .8, style: hs.includes(m) ? { filter: "drop-shadow(0 0 4px rgba(47,107,255,.9))" } : null }, p)));
  const base = "#17204a";
  return h("svg", { viewBox: "0 0 120 252", height: ht || 200, style: { display: "block", margin: "0 auto" } },
    h("g", { transform: fem ? "translate(6,0) scale(.9,1)" : null },
      h("circle", { cx: 60, cy: 17, r: 12, fill: base }), h("rect", { x: 54, y: 27, width: 12, height: 12, fill: base }),
      h("rect", { x: 34, y: 36, width: 52, height: 86, rx: 16, fill: base }),
      h("rect", { x: 12, y: 44, width: 15, height: 80, rx: 7, fill: base }), h("rect", { x: 93, y: 44, width: 15, height: 80, rx: 7, fill: base }),
      h("rect", { x: 35, y: 118, width: 24, height: 130, rx: 11, fill: base }), h("rect", { x: 61, y: 118, width: 24, height: 130, rx: 11, fill: base }),
      part("l", false), h("g", { transform: "translate(120,0) scale(-1,1)" }, part("r", true))));
}
function Wheel({ min, max, value, onChange, unit }) {
  const ref = useRef(null), IT = 44, t = useRef(0);
  const items = []; for (let i = min; i <= max; i++) items.push(i);
  useEffect(() => { if (ref.current) ref.current.scrollTop = (value - min) * IT; }, []);
  const onSc = e => { const el = e.currentTarget; clearTimeout(t.current); t.current = setTimeout(() => { const v = clamp(min + Math.round(el.scrollTop / IT), min, max); if (v !== value) onChange(v); }, 60); };
  return h("div", { style: { position: "relative", height: IT * 5, margin: "10px auto", width: 200 } },
    h("div", { style: { position: "absolute", top: IT * 2, height: IT, left: 0, right: 0, borderTop: "1px solid " + FW.blue, borderBottom: "1px solid " + FW.blue, background: "rgba(47,107,255,.12)", borderRadius: 12, pointerEvents: "none" } }),
    h("div", { ref, onScroll: onSc, style: { height: "100%", overflowY: "scroll", scrollSnapType: "y mandatory", scrollbarWidth: "none", paddingTop: IT * 2, paddingBottom: IT * 2, boxSizing: "border-box" } },
      items.map(i => h("div", { key: i, style: { height: IT, lineHeight: IT + "px", textAlign: "center", scrollSnapAlign: "center", fontSize: i === value ? 30 : 20, fontWeight: 900, color: i === value ? "#fff" : FW.mut, transition: "font-size .1s" } }, i, i === value && unit && h("span", { style: { fontSize: 13, color: FW.mut, marginRight: 6 } }, unit)))));
}
function Ruler({ min, max, value, onChange }) {
  const ref = useRef(null), t = useRef(0), U = 12, ticks = [];
  for (let v = min; v <= max + 1e-6; v += 0.5) ticks.push(v);
  useEffect(() => { if (ref.current) ref.current.scrollLeft = (value - min) / 0.5 * U; }, []);
  const onSc = e => { const el = e.currentTarget; clearTimeout(t.current); t.current = setTimeout(() => { const v = clamp(min + Math.round(el.scrollLeft / U) * 0.5, min, max); if (v !== value) onChange(v); }, 50); };
  return h("div", { dir: "ltr", style: { position: "relative", height: 70, margin: "10px 0" } },
    h("div", { style: { position: "absolute", left: "50%", top: 0, bottom: 0, width: 3, marginLeft: -1.5, background: FW.blue, zIndex: 2, borderRadius: 3 } }),
    h("div", { ref, onScroll: onSc, style: { height: "100%", overflowX: "scroll", scrollbarWidth: "none", display: "flex", alignItems: "flex-end" } },
      h("div", { style: { flex: "0 0 50%" } }),
      ticks.map((v, i) => { const big = Math.abs(v % 5) < 1e-6; return h("div", { key: i, style: { flex: "0 0 " + U + "px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" } }, big && h("div", { style: { fontSize: 10, color: FW.mut, marginBottom: 2 } }, Math.round(v)), h("div", { style: { width: 1.5, height: big ? 30 : Math.abs(v % 1) < 1e-6 ? 20 : 12, background: big ? "#8c98b8" : FW.line } })); }),
      h("div", { style: { flex: "0 0 50%" } })));
}
function BmiBar({ bmi }) {
  const seg = [["#3b82f6", 18.5], ["#22c55e", 25], ["#eab308", 30], ["#f97316", 35], ["#ef4444", 45]]; const pos = clamp((bmi - 12) / (45 - 12) * 100, 1, 99); const [lb, c] = fitBmiInfo(bmi);
  return h("div", { style: { background: FW.card, borderRadius: 16, padding: 14, border: "1px solid " + FW.line } },
    h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 } }, h("span", { style: { color: FW.mut, fontWeight: 700 } }, "مؤشر كتلة الجسم"), h("span", { style: { fontWeight: 900, color: c } }, bmi.toFixed(1) + " • " + lb)),
    h("div", { dir: "ltr", style: { position: "relative", display: "flex", height: 10, borderRadius: 9, overflow: "hidden" } }, seg.map((s, i) => h("div", { key: i, style: { flex: i === 0 ? (18.5 - 12) : i === 4 ? 10 : (s[1] - seg[i - 1][1]), background: s[0] } })),
      h("div", { style: { position: "absolute", top: -3, bottom: -3, left: pos + "%", width: 4, marginLeft: -2, background: "#fff", borderRadius: 3, boxShadow: "0 0 6px #000" } })));
}
const FIT_COACH = {
  gender: "هنظبط خطتك على جسمك، فاختار الأنسب.", age: "العمر بيحدد حرق جسمك وسرعة التعافي بين التمارين.", height: "طولك بيدخل في حساب احتياجك من السعرات ومؤشر الجسم.", weight: "هنربط وزنك بالميزان — ولو اتغيّر هنعدّل خطتك لوحدنا.",
  goal: "هدفك هو اللي بيحدد نوع التمارين والأكل.", focus: "اختار العضلات اللي عايز تركّز عليها وهنزوّد لها حجم التمرين.", exp: "مستواك بيحدد عدد المجموعات وشدّة التمرين، وهنتدرّج معاك.",
  perweek: "الثبات أهم من الكمية. ابدأ بعدد تقدر تلتزم بيه.", remind: "هنفكّرك في ميعاد تمرينك بإشعار — الالتزام نص النجاح.", analysis: "ده تحليل أولي بناءً على إجاباتك. الخطة الكاملة جاية.",
  equip: "هنختار لك تمارين على قد الأدوات اللي معاك.", intro: "جهّز مكان فاضي، وموبايلك قدّامك — وإحنا هنوجّهك خطوة بخطوة.", extra: "أي إصابة أو ملاحظة بتخلّينا نستبعد التمارين الغلط.", name: "هنناديك باسمك في التذكير وخطتك."
};
const FIT_STEPS = ["gender", "age", "height", "weight", "goal", "focus", "exp", "perweek", "remind", "analysis", "equip", "intro", "extra", "name", "loading"];
const FIT_PAT = { 1: [0], 2: [0, 3], 3: [0, 2, 4], 4: [0, 1, 3, 4], 5: [0, 1, 2, 4, 5], 6: [0, 1, 2, 3, 4, 5], 7: [0, 1, 2, 3, 4, 5, 6] };
const fitDefDays = n => FIT_DAYS.map((_, i) => ({ i, on: (FIT_PAT[n] || FIT_PAT[3]).includes(i), time: "18:00" }));

function FitWizard({ initial, defaultName, onExit, onFinish }) {
  const [d, setD] = useState(() => Object.assign({ gender: "m", age: 30, height: 170, weight: 70, unit: "kg", goal: "build", focus: [], exp: "zero", perWeek: 3, days: fitDefDays(3), equip: "none", eqParts: [], extra: "", name: defaultName || "" }, lsGet("allinone:fitdraft", {}), initial || {}));
  const [st, setSt] = useState(0); const [pc, setPc] = useState(0); const [more, setMore] = useState(false);
  const step = FIT_STEPS[st];
  const up = o => setD(x => { const n = Object.assign({}, x, o); lsSet("allinone:fitdraft", n); return n; });
  const kg = d.unit === "lb" ? Math.round(d.weight / 2.2046 * 10) / 10 : d.weight;
  useEffect(() => { document.body.style.overflow = "hidden"; return () => { document.body.style.overflow = ""; }; }, []);
  useEffect(() => {
    if (step !== "loading") return; let p = 0;
    const t = setInterval(() => { p += 2 + Math.random() * 3; if (p >= 100) { p = 100; clearInterval(t); setTimeout(() => { lsSet("allinone:fitdraft", {}); onFinish(Object.assign({}, d, { weight: kg, unit: "kg", perWeek: Math.max(1, d.days.filter(x => x.on).length) })); }, 500); } setPc(Math.round(p)); }, 90);
    return () => clearInterval(t);
  }, [step]);
  const next = () => setSt(s => Math.min(s + 1, FIT_STEPS.length - 1));
  const prev = () => st === 0 ? onExit() : setSt(s => s - 1);
  const bmi = fitBmi(kg, d.height);
  const nut = fitNutrition(Object.assign({}, d, { perWeek: d.days.filter(x => x.on).length }), kg, 0);
  const card = (on, onClick, children, extra) => h("div", { onClick, style: Object.assign({ background: on ? "rgba(47,107,255,.18)" : FW.card, border: "2px solid " + (on ? FW.blue : FW.line), borderRadius: 18, padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, fontWeight: 800, fontSize: 16, color: "#fff" }, extra || {}) }, children);
  const title = (ic, q) => h("div", { style: { textAlign: "center", margin: "6px 0 14px" } }, h("div", { style: { fontSize: 30, marginBottom: 6 } }, ic), h("div", { style: { fontSize: 24, fontWeight: 900, lineHeight: 1.4 } }, q));
  const coach = txt => h("div", { style: { display: "flex", gap: 10, alignItems: "flex-start", background: FW.card, border: "1px solid " + FW.line, borderRadius: 16, padding: "12px 14px", marginTop: 16, fontSize: 13.5, lineHeight: 1.8, color: "#cdd6f4" } }, h("span", { style: { fontSize: 18, color: FW.blue2 } }, "✨"), h("span", null, txt));
  const goalMap = { build: ["🏋️", "بناء عضل"], fit: ["🧘", "محافظة على اللياقة"], lose: ["🔥", "خسارة وزن"] };
  const hlAll = FIT_MUSCLES.map(x => x[0]);
  let body = null, canNext = true;
  if (step === "gender") body = h("div", null, title("🧬", "إنت ولد ولا بنت؟"), h("div", { style: { display: "flex", gap: 12 } }, [["m", "ذكر"], ["f", "أنثى"]].map(([k, t]) => h("div", { key: k, onClick: () => up({ gender: k }), style: { flex: 1, background: d.gender === k ? "rgba(47,107,255,.18)" : FW.card, border: "2px solid " + (d.gender === k ? FW.blue : FW.line), borderRadius: 20, padding: "14px 6px 12px", textAlign: "center", cursor: "pointer" } }, h(BodyFig, { hl: d.gender === k ? hlAll : [], all: true, h: 170, fem: k === "f" }), h("div", { style: { fontWeight: 900, marginTop: 8 } }, t)))), coach(FIT_COACH.gender));
  else if (step === "age") body = h("div", null, title("🎂", "عندك كام سنة؟"), h(Wheel, { min: 14, max: 80, value: d.age, onChange: v => up({ age: v }), unit: "سنة" }), coach(FIT_COACH.age));
  else if (step === "height") body = h("div", null, title("📏", "طولك كام؟"), h(Wheel, { min: 120, max: 220, value: d.height, onChange: v => up({ height: v }), unit: "سم" }), coach(FIT_COACH.height));
  else if (step === "weight") body = h("div", null, title("⚖️", "وزنك كام؟"),
    h("div", { style: { display: "flex", justifyContent: "center", margin: "6px 0" } }, h("div", { style: { display: "inline-flex", background: FW.card, borderRadius: 99, padding: 3, border: "1px solid " + FW.line } }, ["kg", "lb"].map(u => h("button", { key: u, onClick: () => { if (u !== d.unit) up({ unit: u, weight: u === "lb" ? Math.round(d.weight * 2.2046) : Math.round(d.weight / 2.2046 * 2) / 2 }); }, style: { border: "none", borderRadius: 99, padding: "6px 22px", fontWeight: 900, background: d.unit === u ? FW.blue : "transparent", color: "#fff", cursor: "pointer" } }, u)))),
    h("div", { style: { textAlign: "center", fontSize: 54, fontWeight: 900, direction: "ltr" } }, d.weight, h("span", { style: { fontSize: 18, color: FW.mut, marginLeft: 6 } }, d.unit)),
    h(Ruler, { key: d.unit, min: d.unit === "kg" ? 30 : 66, max: d.unit === "kg" ? 200 : 440, value: d.weight, onChange: v => up({ weight: v }) }),
    bmi && h(BmiBar, { bmi }), coach(FIT_COACH.weight));
  else if (step === "goal") body = h("div", null, title("🎯", "إيه هدفك الأساسي؟"), h("div", { style: { display: "grid", gap: 10 } }, [["build", "بناء عضل", "حجم وقوة أكتر"], ["fit", "محافظة على اللياقة", "جسم نشيط ومتوازن"], ["lose", "خسارة وزن", "حرق دهون وتنشيف"]].map(([k, t, s]) => card(d.goal === k, () => up({ goal: k }), [h("span", { key: "i", style: { fontSize: 28 } }, goalMap[k][0]), h("div", { key: "t", style: { flex: 1 } }, h("div", null, t), h("div", { style: { fontSize: 12, color: FW.mut, fontWeight: 600 } }, s))]))), coach(FIT_COACH.goal));
  else if (step === "focus") { const sel = d.focus; const tg = k => up({ focus: sel.includes(k) ? sel.filter(x => x !== k) : sel.concat(k) }); body = h("div", null, title("💪", "عايز تركّز على أنهي عضلات؟"),
    h("div", { style: { display: "flex", gap: 4, alignItems: "flex-start" } },
      h("div", { style: { flex: "0 0 38%" } }, h(BodyFig, { hl: sel, side: "front", h: 150 }), h(BodyFig, { hl: sel, side: "back", h: 150 })),
      h("div", { style: { flex: 1, display: "grid", gap: 6 } }, FIT_MUSCLES.map(([k, t]) => h("div", { key: k, onClick: () => tg(k), style: { display: "flex", alignItems: "center", gap: 8, background: sel.includes(k) ? "rgba(47,107,255,.2)" : FW.card, border: "1.5px solid " + (sel.includes(k) ? FW.blue : FW.line), borderRadius: 12, padding: "8px 10px", fontSize: 13.5, fontWeight: 800, cursor: "pointer" } }, h("span", { style: { width: 18, height: 18, borderRadius: 5, background: sel.includes(k) ? FW.blue : "transparent", border: "1.5px solid " + (sel.includes(k) ? FW.blue : FW.mut), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 } }, sel.includes(k) ? "✓" : ""), t)))),
    h("button", { onClick: () => up({ focus: sel.length === 12 ? [] : hlAll }), style: { marginTop: 10, background: "none", border: "none", color: FW.blue2, fontWeight: 900, cursor: "pointer", width: "100%" } }, sel.length === 12 ? "إلغاء الكل" : "اختار الكل"), coach(FIT_COACH.focus)); }
  else if (step === "exp") body = h("div", null, title("📈", "خبرتك في التمارين؟"), h("div", { style: { display: "grid", gap: 10 } }, [["zero", "مبتدئ تمامًا", "أول مرة أتمرّن"], ["beg", "مبتدئ", "تمرّنت قبل كده بشكل متقطّع"], ["mid", "متوسط", "بتمرّن بانتظام من فترة"], ["pro", "متقدّم", "خبرة طويلة وبتمرّن بجدّية"]].map(([k, t, s]) => card(d.exp === k, () => up({ exp: k }), h("div", { style: { flex: 1 } }, h("div", null, t), h("div", { style: { fontSize: 12, color: FW.mut, fontWeight: 600 } }, s))))), coach(FIT_COACH.exp));
  else if (step === "perweek") body = h("div", null, title("📅", "كام تمرين في الأسبوع؟"),
    h("div", { style: { textAlign: "center", fontSize: 64, fontWeight: 900, color: FW.blue2 } }, d.perWeek), h("div", { style: { textAlign: "center", color: FW.mut, marginTop: -6 } }, "أيام في الأسبوع"),
    h("input", { type: "range", min: 1, max: 7, value: d.perWeek, onChange: e => { const n = +e.target.value; up({ perWeek: n, days: fitDefDays(n) }); }, style: { width: "100%", margin: "22px 0 4px", accentColor: FW.blue, direction: "ltr" } }),
    h("div", { dir: "ltr", style: { display: "flex", justifyContent: "space-between", color: FW.mut, fontSize: 12, padding: "0 4px" } }, [1, 2, 3, 4, 5, 6, 7].map(n => h("span", { key: n }, n))),
    coach(d.perWeek <= 2 ? "بداية هادية وممتازة — الراحة مهمة زي التمرين." : d.perWeek <= 4 ? "٣–٤ أيام توازن ممتاز بين التمرين والتعافي." : d.perWeek <= 6 ? "التزام عالي! هنقسّم العضلات عشان كل عضلة تاخد راحتها." : "٧ أيام: هنخلّي أحدهم خفيف عشان جسمك يتعافى."));
  else if (step === "remind") { const cnt = d.days.filter(x => x.on).length; body = h("div", null, title("🔔", "أيام التمرين وميعاد التذكير"),
    h("div", { style: { display: "grid", gap: 8 } }, d.days.map((x, k) => h("div", { key: k, style: { display: "flex", alignItems: "center", gap: 10, background: FW.card, border: "1.5px solid " + (x.on ? FW.blue : FW.line), borderRadius: 14, padding: "10px 12px" } },
      h("span", { onClick: () => up({ days: d.days.map((y, j) => j === k ? Object.assign({}, y, { on: !y.on }) : y) }), style: { width: 22, height: 22, borderRadius: 6, background: x.on ? FW.blue : "transparent", border: "2px solid " + (x.on ? FW.blue : FW.mut), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, cursor: "pointer" } }, x.on ? "✓" : ""),
      h("span", { style: { flex: 1, fontWeight: 800, opacity: x.on ? 1 : .55 } }, FIT_DAYS[k]),
      h("input", { type: "time", value: x.time, disabled: !x.on, onChange: e => up({ days: d.days.map((y, j) => j === k ? Object.assign({}, y, { time: e.target.value || "18:00" }) : y) }), style: { background: FW.card2, color: "#fff", border: "1px solid " + FW.line, borderRadius: 10, padding: "6px 8px", opacity: x.on ? 1 : .4 } })))),
    cnt === 0 && h("div", { style: { color: "#f87171", fontSize: 12, textAlign: "center", marginTop: 8 } }, "اختار يوم واحد على الأقل."), coach(FIT_COACH.remind)); canNext = cnt > 0; }
  else if (step === "analysis") { const cnt = d.days.filter(x => x.on).length; const gain = d.goal === "build" ? 38 : d.goal === "lose" ? 25 : 30; const pts = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(w => [20 + w * 25, 110 - (1 - Math.exp(-(w + 1) / 5)) * 85 * (0.8 + gain / 200)]); const path = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(0) + " " + p[1].toFixed(0)).join(" ");
    body = h("div", null, h("div", { style: { textAlign: "center", color: FW.ok, fontWeight: 900, letterSpacing: 1, margin: "4px 0 12px" } }, "✓ اكتمل التحليل"),
      h("div", { style: { display: "flex", gap: 10 } }, h("div", { style: { flex: 1, background: FW.card, borderRadius: 16, padding: 14, border: "1px solid " + FW.line } }, h("div", { style: { color: FW.mut, fontSize: 12, fontWeight: 700 } }, "BMI"), h("div", { style: { fontSize: 26, fontWeight: 900, color: fitBmiInfo(bmi)[1] } }, bmi ? bmi.toFixed(1) : "—"), h("div", { style: { fontSize: 12, color: FW.mut } }, fitBmiInfo(bmi)[0])),
        h("div", { style: { flex: 1, background: FW.card, borderRadius: 16, padding: 14, border: "1px solid " + FW.line } }, h("div", { style: { color: FW.mut, fontSize: 12, fontWeight: 700 } }, "سعراتك اليومية"), h("div", { style: { fontSize: 26, fontWeight: 900, color: FW.blue2 } }, nut.kcal), h("div", { style: { fontSize: 12, color: FW.mut } }, "سعر/يوم • بروتين " + nut.protein + " جم"))),
      h("div", { style: { background: FW.card, borderRadius: 16, padding: 14, border: "1px solid " + FW.line, marginTop: 10 } }, h("div", { style: { fontWeight: 800, marginBottom: 6 } }, "منحنى قوّتك المتوقّع — ١٢ أسبوع"),
        h("svg", { viewBox: "0 0 320 130", width: "100%", style: { display: "block" } }, h("defs", null, h("linearGradient", { id: "fg1", x1: 0, y1: 0, x2: 0, y2: 1 }, h("stop", { offset: "0", stopColor: FW.blue, stopOpacity: .5 }), h("stop", { offset: "1", stopColor: FW.blue, stopOpacity: 0 }))),
          h("path", { d: path + " L295 120 L20 120 Z", fill: "url(#fg1)" }), h("path", { d: path, fill: "none", stroke: FW.blue2, strokeWidth: 3, strokeLinecap: "round" }),
          [0, 3, 7, 11].map(i => h("g", { key: i }, h("circle", { cx: pts[i][0], cy: pts[i][1], r: 4, fill: "#fff" }), h("text", { x: pts[i][0], y: 126, fontSize: 9, fill: FW.mut, textAnchor: "middle" }, (i + 1)))))),
      h("div", { style: { background: FW.card, borderRadius: 16, padding: 14, border: "1px solid " + FW.line, marginTop: 10 } }, h("div", { style: { fontWeight: 800, marginBottom: 10 } }, "إيقاعك الأسبوعي • " + cnt + " أيام"), h("div", { style: { display: "flex", justifyContent: "space-between" } }, d.days.map((x, k) => h("div", { key: k, style: { textAlign: "center" } }, h("div", { style: { width: 34, height: 34, borderRadius: 99, background: x.on ? FW.blue : FW.card2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, boxShadow: x.on ? "0 0 10px rgba(47,107,255,.6)" : "none" } }, x.on ? "💪" : ""), h("div", { style: { fontSize: 10, color: FW.mut, marginTop: 4 } }, FIT_DAYS[k].slice(0, 3)))))), coach(FIT_COACH.analysis)); }
  else if (step === "equip") body = h("div", null, title("🏋️", "معاك أدوات إيه؟"), h("div", { style: { display: "grid", gap: 10 } }, Object.entries(FIT_EQ).map(([k, v]) => card(d.equip === k, () => up({ equip: k }), [h("span", { key: "i", style: { fontSize: 26 } }, v.i), h("span", { key: "t" }, v.t)]))),
    d.equip === "custom" && h("div", { style: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 } }, FIT_EQ_PARTS.map(([k, t]) => h("button", { key: k, onClick: () => up({ eqParts: d.eqParts.includes(k) ? d.eqParts.filter(x => x !== k) : d.eqParts.concat(k) }), style: { border: "1.5px solid " + (d.eqParts.includes(k) ? FW.blue : FW.line), background: d.eqParts.includes(k) ? "rgba(47,107,255,.25)" : FW.card, color: "#fff", borderRadius: 99, padding: "8px 14px", fontWeight: 800, cursor: "pointer" } }, t))), coach(FIT_COACH.equip));
  else if (step === "intro") body = h("div", { style: { textAlign: "center", paddingTop: 10 } }, h("div", { style: { fontSize: 70 } }, "📱⌚"), h("div", { style: { fontSize: 24, fontWeight: 900, margin: "10px 0" } }, "جهّز نفسك للتمرين"), h("div", { style: { color: FW.mut, lineHeight: 2, fontSize: 14 } }, "هتتابع كل تمرين خطوة بخطوة على موبايلك: الاسم، عدد المجموعات والتكرار، ومؤقّت الراحة. وبعد ما تخلّص بيتأشّر في «الأهداف اليومية» لوحده."), coach(FIT_COACH.intro));
  else if (step === "extra") body = h("div", null, title("📝", "في تفاصيل تانية؟"), !more ? h("div", { style: { display: "grid", gap: 10 } }, card(false, next, [h("span", { key: "i", style: { fontSize: 24 } }, "✅"), h("span", { key: "t" }, "تمام، أنا جاهز")]), card(false, () => setMore(true), [h("span", { key: "i", style: { fontSize: 24 } }, "➕"), h("span", { key: "t" }, "أضيف تفاصيل (إصابة/ملاحظة)")])) :
    h("div", null, h("textarea", { value: d.extra, onChange: e => up({ extra: e.target.value }), rows: 5, placeholder: "مثلًا: عندي ألم في الركبة / ضهري بيوجعني / كتفي متعب…", style: { width: "100%", background: FW.card, border: "1.5px solid " + FW.line, color: "#fff", borderRadius: 14, padding: 12, fontSize: 14, fontFamily: "inherit", boxSizing: "border-box" } }), h("div", { style: { fontSize: 12, color: FW.mut, marginTop: 6 } }, "هنستبعد التمارين اللي ممكن تضايق (ركبة / ضهر / كتف) تلقائي.")), coach(FIT_COACH.extra));
  else if (step === "name") { body = h("div", null, title("🙋", "اسمك إيه؟"), h("input", { value: d.name, onChange: e => up({ name: e.target.value }), placeholder: "اكتب اسمك", style: { width: "100%", background: FW.card, border: "1.5px solid " + FW.line, color: "#fff", borderRadius: 14, padding: 14, fontSize: 18, textAlign: "center", boxSizing: "border-box", fontFamily: "inherit" } }), coach(FIT_COACH.name)); canNext = d.name.trim().length > 0; }
  else if (step === "loading") body = h("div", { style: { textAlign: "center", paddingTop: 6 } }, h("div", { style: { fontSize: 20, fontWeight: 900, marginBottom: 14 } }, "بنجهّز خطتك الشخصية…"),
    h("div", { style: { position: "relative", width: 150, height: 150, margin: "0 auto" } }, h("svg", { viewBox: "0 0 100 100", width: 150, height: 150 }, h("circle", { cx: 50, cy: 50, r: 44, fill: "none", stroke: FW.card2, strokeWidth: 8 }), h("circle", { cx: 50, cy: 50, r: 44, fill: "none", stroke: FW.blue, strokeWidth: 8, strokeLinecap: "round", strokeDasharray: 276.5, strokeDashoffset: 276.5 * (1 - pc / 100), transform: "rotate(-90 50 50)" })), h("div", { style: { position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, fontWeight: 900 } }, pc + "%")),
    h("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 20, textAlign: "right" } }, [["العمر", d.age], ["النوع", d.gender === "f" ? "أنثى" : "ذكر"], ["الطول", d.height + " سم"], ["الوزن", kg + " كجم"], ["الأدوات", FIT_EQ[d.equip].t], ["الخبرة", { zero: "مبتدئ تمامًا", beg: "مبتدئ", mid: "متوسط", pro: "متقدّم" }[d.exp]]].map(([a, b]) => h("div", { key: a, style: { background: FW.card, borderRadius: 12, padding: "10px 12px", border: "1px solid " + FW.line } }, h("div", { style: { fontSize: 11, color: FW.mut } }, a), h("div", { style: { fontWeight: 800 } }, b)))));
  const fig = ["goal", "exp", "perweek", "equip", "name", "extra"].includes(step) ? h(BodyFig, { hl: step === "goal" ? (d.goal === "lose" ? ["abs", "quads"] : d.goal === "build" ? ["chest", "shoulders", "biceps", "quads"] : []) : [], all: true, h: 130 }) : null;
  return h("div", { dir: "rtl", style: { position: "fixed", inset: 0, zIndex: 80, background: FW.bg, color: "#fff", display: "flex", flexDirection: "column", fontFamily: "inherit" } },
    h("div", { style: { padding: "calc(12px + env(safe-area-inset-top)) 16px 8px", display: "flex", alignItems: "center", gap: 12, maxWidth: 520, width: "100%", margin: "0 auto", boxSizing: "border-box" } },
      step !== "loading" && h("button", { onClick: prev, "aria-label": "رجوع", style: { background: FW.card, border: "1px solid " + FW.line, color: "#fff", borderRadius: 12, width: 38, height: 38, fontSize: 18, cursor: "pointer" } }, "→"),
      h("div", { style: { fontWeight: 900, fontSize: 18, color: FW.blue2 } }, "مدرّبي"),
      h("div", { style: { flex: 1, height: 6, background: FW.card2, borderRadius: 9, overflow: "hidden" } }, h("div", { style: { width: (st / (FIT_STEPS.length - 1) * 100) + "%", height: "100%", background: FW.blue, borderRadius: 9, transition: "width .3s" } }))),
    h("div", { key: step, className: "fade", style: { flex: 1, overflowY: "auto", padding: "6px 16px 14px", maxWidth: 520, width: "100%", margin: "0 auto", boxSizing: "border-box" } }, fig, body),
    step !== "loading" && !(step === "extra" && !more) && h("div", { style: { padding: "10px 16px calc(14px + env(safe-area-inset-bottom))", maxWidth: 520, width: "100%", margin: "0 auto", boxSizing: "border-box" } },
      h("button", { disabled: !canNext, onClick: next, style: { width: "100%", background: FW.blue, color: "#fff", border: "none", borderRadius: 16, padding: "16px", fontSize: 17, fontWeight: 900, cursor: "pointer", opacity: canNext ? 1 : .5, boxShadow: "0 6px 22px rgba(47,107,255,.45)" } }, step === "name" ? "إنهاء وبناء الخطة" : "متابعة")));
}
// ── شرح التمارين: رسوم متحركة + خطوات + فيديو ──
const FIT_NEWEX = [
  ["dblunge", "لانجز بالدمبل", "quads", "db", 1, "امسك دمبل في كل إيد، اخطي خطوة كبيرة وانزل بتحكّم.", "knee"],
  ["dbsumo", "سومو سكوات بدمبل", "glutes", "db", 1, "رجليك أوسع من كتفك والدمبل بين رجليك.", "knee"],
  ["dbswing", "دمبل سوينج", "glutes", "db", 1, "ادفع وِركك لقدّام بقوة والدمبل يطلع لمستوى الصدر.", "back"],
  ["dbfront", "رفرفة أمامي دمبل", "shoulders", "db", 0, "ارفع الدمبل قدّامك لمستوى الكتف وانزل ببطء."],
  ["dbkick", "ترايسبس كيك باك بالدمبل", "triceps", "db", 0, "الكوع ثابت جنب جسمك ومدّ دراعك لورا."],
  ["dbpull", "بولأوفر بالدمبل", "chest", "db", 0, "نزّل الدمبل ورا راسك بدراعات شبه مفرودة وارجع."],
  ["rope", "نط الحبل", "abs", "rope", 0, "نطّات صغيرة على مشط الرجل ومعصمك هو اللي بيلف الحبل."]
];
FIT_NEWEX.forEach(e => { FIT_EX.push(e); FIT_EXB[e[0]] = e; });
FIT_EQ_PARTS.push(["rope", "حبل نط"]);
const FIT_TPL = {
  stand: [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0]],
  pushup: [[70, 0, 0, -70, -70], [78, -70, 45, -78, -78]],
  pike: [[150, 15, 15, -25, -15], [130, -25, 40, -25, -15]],
  ohp: [[0, 20, 170, 0, 0], [0, 170, 178, 0, 0]],
  lateral: [[0, 0, 0, 0, 0], [0, 88, 88, 0, 0]],
  curl: [[0, 0, 0, 0, 0], [0, 5, 155, 0, 0]],
  wrist: [[0, 90, 60, 0, 0], [0, 90, 125, 0, 0]],
  triext: [[0, 175, -40, 0, 0], [0, 175, 175, 0, 0]],
  pushdown: [[0, 5, 100, 0, 0], [0, 3, 3, 0, 0]],
  squat: [[0, 90, 90, 0, 0], [38, 90, 90, 95, -12]],
  goblet: [[0, 25, 150, 0, 0], [38, 25, 150, 95, -12]],
  lunge: [[0, 0, 0, 15, -5, -15, -10], [0, 0, 0, 85, -5, -30, -100]],
  bridge: [[88, -90, -90, -125, 8], [112, -90, -90, -98, 0]],
  crunch: [[88, 125, -35, -125, 8], [55, 125, -35, -125, 8]],
  plank: [[80, 0, 90, -80, -80], [82, 0, 90, -82, -82]],
  legraise: [[90, -95, -95, -85, -85], [90, -95, -95, -175, -175]],
  calf: [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 9]],
  row: [[70, 0, 0, 15, -8], [70, -115, -15, 15, -8]],
  hinge: [[0, 0, 0, 0, 0], [75, 0, 0, 8, -6]],
  press: [[88, -100, -180, -125, 8], [88, -180, -180, -125, 8]],
  fly: [[88, -180, -180, -125, 8], [88, -95, -95, -125, 8]],
  pullup: [[0, 175, 178, -3, -6], [0, 15, 170, -15, -30], "bar"],
  hang: [[0, 175, 178, -3, -6], [0, 175, 178, -3, -6], "bar"],
  shrug: [[0, 0, 0, 0, 0, 0, 0, 0, 1], [0, 0, 0, 0, 0, 0, 0, 0, 1.15]],
  superman: [[90, 90, 90, -90, -90], [80, 115, 115, -105, -105]],
  legext: [[0, 0, 0, 90, 0], [0, 0, 0, 90, 90]],
  donkey: [[80, 0, 0, 0, -90, 0, -90], [80, 0, 0, 0, -90, -110, -110]],
  hamcurl: [[90, 95, 95, -90, -90], [90, 95, 95, -90, -180]],
  skull: [[88, -180, -180, -125, 8], [88, -180, 60, -125, 8]],
  dip: [[10, -10, -5, 60, 0], [10, -60, 10, 60, 0]],
  cardio: [[0, 25, 90, 0, 0, 90, 0], [0, 25, 90, 90, 0, 0, 0], "pel"],
  rope: [[0, 35, 95, 0, 0, 0, 0, 0], [0, 35, 95, 0, 0, 0, 0, 12], "pel"],
  swing: [[65, 15, 15, 10, -5], [0, 90, 90, 0, 0]],
  pullover: [[88, -180, -180, -125, 8], [88, 100, 100, -125, 8]],
  kick: [[70, -95, 0, 15, -8], [70, -95, -95, 15, -8]]
};
const FIT_MAP = { pushup: "pushup", pushup_wide: "pushup", diamond: "pushup", pikepush: "pike", handwalk: "pike", dbohp: "ohp", ohp: "ohp", machshoulder: "ohp", lateral: "lateral", dbfront: "lateral", dbcurl: "curl", hammer: "curl", bbcurl: "curl", cablecurl: "curl", bwcurl: "curl", wristcurl: "wrist", dbext: "triext", pushdown: "pushdown", skull: "skull", benchdip: "dip", dbkick: "kick", squat: "squat", bbsquat: "squat", legpress: "squat", goblet: "goblet", dbsumo: "goblet", lunge: "lunge", dblunge: "lunge", bridge1: "bridge", glutebridge: "bridge", hipthrust: "bridge", dbthrust: "bridge", crunch: "crunch", bicycle: "crunch", cablecrunch: "crunch", plank: "plank", legraise: "legraise", calfraise: "calf", dbcalf: "calf", machcalf: "calf", dbrow: "row", bbrow: "row", bwrow: "row", dbrdl: "hinge", bbrdl: "hinge", dbpress: "press", bench: "press", dbfly: "fly", cablefly: "fly", dbpull: "pullover", pullup: "pullup", latpull: "pullup", hang: "hang", shrug: "shrug", bbshrug: "shrug", superman: "superman", ytraise: "superman", legext: "legext", donkey: "donkey", legcurl: "hamcurl", dbswing: "swing", cardio: "cardio", rope: "rope" };
const FIT_STEPS_AR = {
  pushup: ["ضع إيديك على الأرض أوسع من كتفك شوية وجسمك خط مستقيم من الراس للكعب.", "انزل بصدرك لحد ما يقرّب من الأرض والكوعين بزاوية ٤٥° من جسمك.", "ادفع الأرض لفوق لحد ما دراعك تتفرد (لو صعب: ركبتك على الأرض)."],
  pike: ["ابدأ بوضع V مقلوب: إيديك ورجليك على الأرض والوِرك لفوق.", "ثني كوعك وانزل براسك ناحية الأرض بين إيديك.", "ادفع لفوق ورجّع الوضع الأول."],
  ohp: ["قف ورجليك بعرض الكتف وشدّ بطنك، والأوزان عند الكتف.", "اضغط الأوزان لفوق فوق راسك لحد ما دراعك تتفرد.", "نزّل ببطء لمستوى الكتف من غير ما تقوّس ضهرك."],
  lateral: ["قف مستقيم والدمبل جنب جسمك.", "ارفع دراعاتك لمستوى الكتف (للجنب أو للأمام) بكوع مثني شوية.", "نزّل ببطء ٢–٣ ثواني من غير تأرجح."],
  curl: ["قف والدمبل في إيدك وكوعك لزق في جنبك.", "اثني كوعك وارفع الدمبل لحد الكتف من غير ما تحرّك كتفك.", "نزّل ببطء لحد ما دراعك تتفرد."],
  wrist: ["اقعد وساعدك على فخذك وكفك لفوق والدمبل في إيدك.", "ارفع الدمبل بحركة الرسغ بس.", "نزّل ببطء وكرّر."],
  triext: ["امسك دمبل بإيديك الاتنين فوق راسك والكوع لفوق.", "نزّل الدمبل ورا راسك بثني الكوع بس.", "مدّ دراعك لفوق وارجع للوضع الأول."],
  pushdown: ["الكوع لزق في جنبك وإيدك ماسكة الكابل/المقاومة.", "اضغط لتحت لحد ما دراعك تتفرد.", "ارجع ببطء من غير ما الكوع يتحرك."],
  squat: ["قف ورجليك بعرض الكتف ومشط الرجل بيبصّ شوية للخارج.", "انزل كأنك هتقعد على كرسي: الوِرك لورا والركبة في اتجاه صوابعك.", "ادفع بكعبك واطلع لفوق وشدّ الجلوتس."],
  goblet: ["امسك دمبل قدّام صدرك بالإيدين.", "انزل بالسكوات والضهر مفرود والركبة في اتجاه الصوابع.", "اطلع بدفع الأرض بكعبك."],
  lunge: ["قف وخطّي خطوة كبيرة لقدّام (ممكن دمبل في كل إيد).", "انزل لحد ما الركبتين بزاوية ٩٠° وضهرك مستقيم.", "ادفع بالرجل الأمامية ورجّع، وبدّل الرجل."],
  bridge: ["نام على ضهرك، الركبة مثنية والقدم على الأرض.", "ارفع وِركك لفوق واضغط الجلوتس ٢ ثانية.", "نزّل ببطء من غير ما تلمس الأرض تمامًا وكرّر."],
  crunch: ["نام على ضهرك والركبة مثنية وإيديك ورا راسك (من غير شدّ رقبتك).", "ارفع كتفك بس عن الأرض وشدّ البطن.", "نزّل ببطء."],
  plank: ["اسند على ساعديك والكوع تحت الكتف.", "جسمك خط مستقيم من الراس للكعب، شدّ البطن والجلوتس.", "ثبّت وتنفّس بانتظام للوقت المطلوب."],
  legraise: ["نام على ضهرك وإيديك جنبك أو تحت وِركك.", "ارفع رجليك مفرودتين لحد ٩٠°.", "نزّلهم ببطء من غير ما ضهرك يتقوّس."],
  calf: ["قف على حرف سلمة أو على الأرض (وممكن دمبل في إيدك).", "اطلع على مشط رجلك لأعلى حد.", "نزّل ببطء وكرّر."],
  row: ["ميّل جسمك لقدّام والضهر مفرود وامسك الدمبل بإيد.", "اسحب الكوع لورا ناحية الوِرك وشدّ لوح الكتف.", "نزّل ببطء لحد ما دراعك تتفرد."],
  hinge: ["قف والدمبل قدام فخذك وركبتك مثنية شوية.", "ادفع الوِرك لورا وانزل بجسمك والضهر مفرود.", "ارجع بدفع الوِرك لقدّام وشدّ الجلوتس."],
  press: ["نام على ضهرك (أرض/بنش) والدمبل عند الصدر والكوع مفتوح ٤٥°.", "اضغط الدمبل لفوق لحد ما دراعك تتفرد.", "نزّل ببطء لحد ما الكوع يلمس الأرض."],
  fly: ["نام على ضهرك والدمبل فوق صدرك والدراع شبه مفرودة.", "افتح دراعاتك للجنب بقوس واسع لحد مستوى الصدر.", "ارجع ضم الدمبل فوق صدرك."],
  pullup: ["اتعلّق بالبار بإيديك أوسع من كتفك.", "اسحب جسمك لحد ما دقنك تعدّي البار.", "نزّل ببطء لحد ما دراعك تتفرد."],
  hang: ["امسك البار واتعلّق ودراعك مفرودة.", "كتفك بعيد عن ودنك وشدّ البطن.", "ثبّت أطول وقت ممكن."],
  shrug: ["قف والدمبل جنب جسمك.", "ارفع كتفك لناحية ودنك.", "ثبّت ثانية ونزّل ببطء."],
  superman: ["نام على بطنك ودراعك قدّامك.", "ارفع الدراعات والرجلين مع بعض عن الأرض.", "ثبّت ٢ ثانية ونزّل."],
  legext: ["اقعد على كرسي والضهر مسنود.", "مدّ رجلك لحد ما تتفرد وشدّ الفخذ.", "نزّل ببطء."],
  donkey: ["ابدأ على إيديك وركبتك والضهر مستقيم.", "ارفع رجل لورا وفوق والركبة مثنية ٩٠°.", "اضغط الجلوتس فوق ونزّل ببطء."],
  hamcurl: ["نام على بطنك والرجلين مفرودة.", "اثني ركبتك واسحب كعبك ناحية الجلوتس.", "نزّل ببطء."],
  skull: ["نام على ضهرك والدمبل/البار فوق صدرك والكوع لفوق.", "ثني كوعك ونزّل ناحية جبهتك.", "مدّ دراعك لفوق من غير ما الكوع يتحرك."],
  dip: ["اسند إيديك على كرسي وراك ورجليك قدّامك.", "انزل بثني الكوع لحد ٩٠° والجسم قريب من الكرسي.", "ادفع لفوق لحد ما دراعك تتفرد."],
  cardio: ["قف وابدأ جري في المكان بخفة.", "ارفع ركبتك لمستوى الوِرك بالتبادل.", "حافظ على نفَس منتظم وسرعة متوسطة."],
  rope: ["امسك الحبل وإيدك قريبة من وِركك.", "لفّ الحبل بالرسغ وانط نطّات صغيرة على المشط.", "نفَس منتظم، ولو اتلخبط ابدأ تاني."],
  swing: ["قف رجليك أوسع من كتفك والدمبل بإيديك بين رجليك.", "ادفع وِركك لقدّام بقوة وخلّي الدمبل يطلع لمستوى الصدر.", "سيبه ينزل ورجّع الوِرك لورا وكرّر."],
  pullover: ["نام على ضهرك وامسك دمبل فوق صدرك بالإيدين.", "نزّله ورا راسك بدراعات شبه مفرودة.", "ارجع للوضع الأول بشدّ الصدر."],
  kick: ["ميّل جسمك لقدّام والكوع لزق في جنبك.", "مدّ دراعك لورا لحد ما تتفرد.", "ارجع ببطء من غير ما الكوع يتحرك."],
  stand: ["قف مستقيم.", "نفّذ الحركة بتحكّم.", "كرّر."]
};
const FIT_MIST = { pushup: "ماتنزّلش بوِركك ولا ترفعه.", squat: "ماتخلّيش ركبتك تدخل لجوّه.", row: "ماتقوّسش ضهرك.", hinge: "ماتقوّسش ضهرك — الوِرك هو اللي بيرجع لورا.", plank: "ماتخلّيش وِركك ينزل.", curl: "ماتتأرجحش بجسمك.", ohp: "ماتميّلش لورا.", bridge: "ماتقوّسش أسفل ضهرك — الجلوتس هو اللي يرفع.", crunch: "ماتشدّش رقبتك بإيدك.", lunge: "الركبة الأمامية ماتعدّيش صوابع رجلك أوي." };
const FIT_EN = { pushup: "push up", pushup_wide: "wide push up", dbpress: "dumbbell floor press", dbfly: "dumbbell chest fly", bench: "barbell bench press", cablefly: "cable fly", pikepush: "pike push up", dbohp: "dumbbell shoulder press", lateral: "dumbbell lateral raise", ohp: "overhead press", machshoulder: "machine shoulder press", bwrow: "inverted row", superman: "superman exercise", dbrow: "one arm dumbbell row", pullup: "pull up", bbrow: "barbell row", latpull: "lat pulldown", bwcurl: "towel isometric curl", dbcurl: "dumbbell curl", hammer: "hammer curl", bbcurl: "barbell curl", cablecurl: "cable curl", diamond: "diamond push up", benchdip: "bench dip", dbext: "overhead dumbbell triceps extension", skull: "skull crusher", pushdown: "triceps pushdown", crunch: "crunch", plank: "plank", legraise: "lying leg raise", bicycle: "bicycle crunch", cablecrunch: "cable crunch", squat: "bodyweight squat", lunge: "lunge", goblet: "goblet squat", bbsquat: "barbell squat", legpress: "leg press", bridge1: "single leg glute bridge", dbrdl: "dumbbell romanian deadlift", bbrdl: "romanian deadlift", legcurl: "leg curl", glutebridge: "glute bridge", donkey: "donkey kick", dbthrust: "dumbbell hip thrust", hipthrust: "barbell hip thrust", calfraise: "standing calf raise", dbcalf: "dumbbell calf raise", machcalf: "calf raise machine", shrug: "dumbbell shrug", bbshrug: "barbell shrug", ytraise: "prone y raise", wristcurl: "dumbbell wrist curl", handwalk: "inchworm exercise", hang: "dead hang", legext: "seated leg extension", dblunge: "dumbbell lunge", dbsumo: "dumbbell sumo squat", dbswing: "dumbbell swing", dbfront: "dumbbell front raise", dbkick: "dumbbell triceps kickback", dbpull: "dumbbell pullover", rope: "jump rope", cardio: "high knees" };
const FIT_IMG = {"pushup": "Pushups", "pushup_wide": "Push-Ups_-_Close_Triceps_Position", "dbpress": "Dumbbell_Bench_Press", "dbfly": "Dumbbell_Flyes", "bench": "Barbell_Bench_Press_-_Medium_Grip", "cablefly": "Cable_Crossover", "pikepush": "Handstand_Push-Ups", "dbohp": "Dumbbell_Shoulder_Press", "lateral": "Side_Lateral_Raise", "ohp": "Standing_Military_Press", "bwrow": "Inverted_Row", "superman": "Superman", "dbrow": "One-Arm_Dumbbell_Row", "pullup": "Pullups", "bbrow": "Bent_Over_Barbell_Row", "latpull": "Wide-Grip_Lat_Pulldown", "dbcurl": "Dumbbell_Bicep_Curl", "hammer": "Hammer_Curls", "bbcurl": "Barbell_Curl", "cablecurl": "Standing_Biceps_Cable_Curl", "diamond": "Close-Grip_Push-Up_off_of_a_Dumbbell", "benchdip": "Bench_Dips", "dbext": "Standing_Dumbbell_Triceps_Extension", "skull": "EZ-Bar_Skullcrusher", "pushdown": "Triceps_Pushdown", "crunch": "Crunches", "plank": "Plank", "legraise": "Flat_Bench_Lying_Leg_Raise", "bicycle": "Air_Bike", "cablecrunch": "Cable_Crunch", "squat": "Bodyweight_Squat", "lunge": "Bodyweight_Walking_Lunge", "goblet": "Goblet_Squat", "bbsquat": "Barbell_Squat", "legpress": "Leg_Press", "bridge1": "Single_Leg_Glute_Bridge", "legcurl": "Lying_Leg_Curls", "glutebridge": "Barbell_Glute_Bridge", "donkey": "Donkey_Calf_Raises", "hipthrust": "Barbell_Hip_Thrust", "calfraise": "Standing_Calf_Raises", "dbcalf": "Standing_Dumbbell_Calf_Raise", "machcalf": "Standing_Calf_Raises", "shrug": "Dumbbell_Shrug", "bbshrug": "Barbell_Shrug", "wristcurl": "Palms-Up_Dumbbell_Wrist_Curl_Over_A_Bench", "handwalk": "Inchworm", "hang": "Pullups", "legext": "Leg_Extensions", "dblunge": "Dumbbell_Lunges", "dbsumo": "Plie_Dumbbell_Squat", "dbswing": "One-Arm_Kettlebell_Swings", "dbfront": "Front_Dumbbell_Raise", "dbkick": "Tricep_Dumbbell_Kickback", "dbpull": "Bent-Arm_Dumbbell_Pullover", "rope": "Rope_Jumping", "cardio": "Mountain_Climbers", "machshoulder": "Cable_Shoulder_Press"};
const fitImgUrl = (id, n) => "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/" + FIT_IMG[id] + "/" + n + ".jpg";
function FitPic({ id, h: ht }) {
  const [n, setN] = useState(0); const [bad, setBad] = useState(false);
  useEffect(() => { setBad(false); const t = setInterval(() => setN(x => 1 - x), 1000); return () => clearInterval(t); }, [id]);
  if (!FIT_IMG[id] || bad) return h(FitAnim, { id, h: ht });
  return h("div", { style: { position: "relative", background: "#fff", borderRadius: 16, overflow: "hidden", maxWidth: 300, margin: "0 auto" } }, h("img", { src: fitImgUrl(id, n), alt: "", onError: () => setBad(true), style: { width: "100%", height: ht || 190, objectFit: "contain", display: "block" } }), h("img", { src: fitImgUrl(id, 1 - n), alt: "", style: { display: "none" } }), h("div", { style: { position: "absolute", bottom: 4, left: 6, fontSize: 10, color: "#667" } }, n ? "النهاية" : "البداية"));
}
const fitVideo = id => "https://www.youtube.com/results?search_query=" + encodeURIComponent((FIT_EN[id] || "home workout") + " exercise proper form");
function fitSolve(p, mode, ref) {
  const r = a => a * Math.PI / 180, sn = a => Math.sin(r(a)), cs = a => Math.cos(r(a));
  const [t, u, f, th, sh, th2, sh2, lift, ts] = [p[0], p[1], p[2], p[3], p[4], p[5] == null ? p[3] : p[5], p[6] == null ? p[4] : p[6], p[7] || 0, p[8] || 1];
  const LT = 38 * ts, P = [0, 0], S = [LT * sn(t), -LT * cs(t)], Hd = [S[0] + 15 * sn(t), S[1] - 15 * cs(t)];
  const E = [S[0] + 22 * sn(u), S[1] + 22 * cs(u)], W = [E[0] + 22 * sn(f), E[1] + 22 * cs(f)];
  const K = [30 * sn(th), 30 * cs(th)], A = [K[0] + 30 * sn(sh), K[1] + 30 * cs(sh)];
  const K2 = [30 * sn(th2), 30 * cs(th2)], A2 = [K2[0] + 30 * sn(sh2), K2[1] + 30 * cs(sh2)];
  const o = { P, S, Hd, E, W, K, A, K2, A2, fa: f };
  let dy, dx;
  if (mode === "bar") { dy = 14 - W[1]; dx = 100 - W[0]; }
  else { const low = Math.max(A[1] + 4, A2[1] + 4, K[1], K2[1], P[1], S[1], E[1], W[1], Hd[1] + 8); dy = 138 - low; if (mode === "pel") dx = 100; else { if (ref == null) { const xs = [S[0], Hd[0], A[0], A2[0], W[0], P[0]]; dx = 100 - (Math.min.apply(null, xs) + Math.max.apply(null, xs)) / 2; o.anchor = A[0] + dx; } else dx = ref - A[0]; } }
  const mv = q => [q[0] + dx, q[1] + dy - (mode === "bar" ? 0 : lift)];
  ["P", "S", "Hd", "E", "W", "K", "A", "K2", "A2"].forEach(k => { o[k] = mv(o[k]); });
  o.toe = [o.A[0] + 10, 138]; o.toe2 = [o.A2[0] + 10, 138]; o.mode = mode; return o;
}
function fitFit(T, mode) {
  const A = T[0], B = T[1]; const ref = fitSolve(A, mode).anchor; let xs = [], ys = [140];
  [0, .25, .5, .75, 1].forEach(q => { const p = A.map((v, i) => v + ((B[i] == null ? v : B[i]) - v) * q); for (let i = A.length; i < B.length; i++) p[i] = (B[i] || 0) * q; const o = fitSolve(p, mode, ref); [o.P, o.S, o.E, o.W, o.K, o.A, o.K2, o.A2, o.toe, o.toe2].forEach(pt => { xs.push(pt[0]); ys.push(pt[1]); }); xs.push(o.Hd[0] - 10, o.Hd[0] + 10); ys.push(o.Hd[1] - 11, o.Hd[1] + 9); });
  const x0 = Math.min.apply(null, xs) - 10, x1 = Math.max.apply(null, xs) + 10, y0 = Math.min.apply(null, ys) - 6, y1 = Math.max.apply(null, ys) + 6;
  const sc = Math.min(184 / (x1 - x0), 140 / (y1 - y0), 1.9);
  return { sc, tx: 100 - sc * (x0 + x1) / 2, ty: 82 - sc * (y0 + y1) / 2, ref };
}
function fitScene(id, T, ft, e, ht) {
  const mode = T[2] || "floor"; const A = T[0], B = T[1];
  const pose = A.map((v, i) => v + ((B[i] == null ? v : B[i]) - v) * e); for (let i = A.length; i < B.length; i++) pose[i] = (B[i] || 0) * e;
  const o = fitSolve(pose, mode, ft.ref); const ex = FIT_EXB[id]; const hasDb = ex && ex[3] === "db", hasBb = ex && ex[3] === "bb";
  const SK = "#e9b891", SK2 = "#c9967a", SH = "#3fa0dc", SH2 = "#2b7fb5", DK = "#262a36", DK2 = "#1b1e28", HR = "#3a2a20";
  const L = (a, b, w, c, k) => { const q = k == null ? 1 : k; return h("line", { x1: a[0], y1: a[1], x2: a[0] + (b[0] - a[0]) * q, y2: a[1] + (b[1] - a[1]) * q, stroke: c, strokeWidth: w, strokeLinecap: "round" }); };
  const leg = (K, Af, toe, far) => [L(o.P, K, 12, far ? SK2 : SK), L(o.P, K, 14, far ? DK2 : DK, .6), L(K, Af, 9.5, far ? SK2 : SK), L(Af, toe, 7, far ? "#333" : "#4a4f5c")];
  const arm = (far) => [L(o.S, o.E, 9.5, far ? SH2 : SH, .6), L(o.S, o.E, 7.5, far ? SK2 : SK), L(o.S, o.E, 10, far ? SH2 : SH, .55), L(o.E, o.W, 7, far ? SK2 : SK), h("circle", { cx: o.W[0], cy: o.W[1], r: 4.2, fill: far ? SK2 : SK })];
  const plate = hasDb || hasBb ? h("g", null, hasBb ? h("line", { x1: o.W[0] - 40, y1: o.W[1], x2: o.W[0] + 40, y2: o.W[1], stroke: "#555", strokeWidth: 3.5, strokeLinecap: "round" }) : null, h("circle", { cx: o.W[0], cy: o.W[1], r: hasBb ? 8 : 7, fill: "#2c303c" }), h("circle", { cx: o.W[0], cy: o.W[1], r: 3, fill: "#8c93a6" })) : null;
  const dir = o.Hd[0] >= o.S[0] ? 1 : 1;
  return h("svg", { viewBox: "0 0 200 160", height: ht || 150, style: { display: "block", margin: "0 auto", background: "linear-gradient(#f4f7fc,#e6edf8)", borderRadius: 16, width: "100%", maxWidth: 320 } },
    h("g", { transform: "translate(" + ft.tx + " " + ft.ty + ") scale(" + ft.sc + ")" },
      h("ellipse", { cx: 100, cy: 141, rx: 78, ry: 3.5, fill: "#cdd7e8" }),
      mode === "bar" && h("line", { x1: 55, y1: 14, x2: 145, y2: 14, stroke: "#7b8497", strokeWidth: 4, strokeLinecap: "round" }),
      arm(true), leg(o.K2, o.A2, o.toe2, true),
      L(o.P, o.S, 19, SH), h("circle", { cx: o.P[0], cy: o.P[1], r: 10, fill: DK }), L(o.P, o.S, 20, SH, .08),
      leg(o.K, o.A, o.toe, false), arm(false),
      L(o.S, o.Hd, 7, SK), h("circle", { cx: o.Hd[0] - 2, cy: o.Hd[1] - 1.5, r: 9.6, fill: HR }), h("circle", { cx: o.Hd[0] + 1.2, cy: o.Hd[1] + .8, r: 8.4, fill: SK }),
      plate));
}
function FitAnim({ id, h: ht }) {
  const key = FIT_MAP[id] || "stand"; const T = FIT_TPL[key]; const mode = T[2] || "floor";
  const ft = useMemo(() => fitFit(T, mode), [id]);
  const [ph, setPh] = useState(0);
  useEffect(() => { const t0 = Date.now(); const iv = setInterval(() => { const x = ((Date.now() - t0) / 2800) % 1; setPh(x < .12 ? 0 : x < .5 ? (x - .12) / .38 : x < .62 ? 1 : 1 - (x - .62) / .38); }, 40); return () => clearInterval(iv); }, [id]);
  return fitScene(id, T, ft, ph * ph * (3 - 2 * ph), ht);
}
function FitInfo({ id }) {
  const key = FIT_MAP[id] || "stand"; const st = FIT_STEPS_AR[key] || FIT_STEPS_AR.stand; const e = FIT_EXB[id];
  return h("div", { style: { textAlign: "right" } },
    h(FitAnim, { id, h: 190 }),
    h("div", { style: { marginTop: 10 } }, st.map((s, i) => h("div", { key: i, style: { display: "flex", gap: 8, margin: "6px 0", fontSize: 13.5, lineHeight: 1.8 } }, h("span", { style: { width: 22, height: 22, borderRadius: 99, background: "#2f6bff", color: "#fff", fontSize: 12, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 3 } }, i + 1), h("span", null, s)))),
    FIT_MIST[key] && h("div", { style: { fontSize: 12.5, color: "#fbbf24", margin: "6px 0" } }, "⚠️ غلطة شائعة: " + FIT_MIST[key]),
    e && e[5] && h("div", { style: { fontSize: 12.5, color: "#9db7ff", margin: "4px 0" } }, "✨ " + e[5]),
    FIT_IMG[id] && h("details", { style: { marginTop: 8 } }, h("summary", { style: { cursor: "pointer", color: "#9db7ff", fontSize: 12.5 } }, "📷 صورة حقيقية للتمرين (للمرجع)"), h(FitPic, { id, h: 170 })),
    id !== "cardio" && h("a", { href: fitVideo(id), target: "_blank", rel: "noopener", style: { display: "inline-block", marginTop: 8, background: "#ff0033", color: "#fff", padding: "8px 14px", borderRadius: 12, fontWeight: 800, fontSize: 13, textDecoration: "none" } }, "▶ شوف فيديو حقيقي للتمرين"));
}

function FitPlayer({ sess, week, pf, hist, onClose, onDone }) {
  const [i, setI] = useState(0); const [s, setS] = useState(1); const [rest, setRest] = useState(0); const [t0] = useState(Date.now()); const [fin, setFin] = useState(false); const [guide, setGuide] = useState(false);
  const recRef = useRef({}); const list = sess.ex; const it = list[i]; const ex = it && fitEx(it.id);
  const usesW = ex && (ex[3] === "db" || ex[3] === "bb" || ex[3] === "mc");
  const hs = it && hist && hist[it.id];
  const lo = it ? (parseInt(String(it.reps)) || 10) : 10; const hi = it ? (parseInt(String(it.reps).split("-")[1]) || lo) : 10;
  const [kg, setKg] = useState(0); const [rp, setRp] = useState(0);
  useEffect(() => { if (!it) return; setKg(hs ? hs.kg : (usesW ? (pf.dbMax || 10) : 0)); setRp(hs && hs.reps && hs.reps.length ? hs.reps[hs.reps.length - 1] : lo); setGuide(false); }, [i]);
  useEffect(() => { document.body.style.overflow = "hidden"; return () => { document.body.style.overflow = ""; }; }, []);
  useEffect(() => { if (rest <= 0) return; const t = setTimeout(() => { setRest(r => { if (r <= 1) { try { navigator.vibrate && navigator.vibrate([200, 100, 200]); } catch (e) {} } return r - 1; }); }, 1000); return () => clearTimeout(t); }, [rest]);
  const sets = it ? fitSets(it, i, week) : 0; const isT = it && /[د]|ث/.test(String(it.reps));
  const nextEx = () => { if (i + 1 >= list.length) setFin(true); else { setI(i + 1); setS(1); setRest(0); } };
  const doneSet = () => { if (isT) { if (s >= sets) nextEx(); else { setS(s + 1); setRest(it.rest || 45); } return; } const r = recRef.current[it.id] || (recRef.current[it.id] = { kg: usesW ? kg : 0, reps: [] }); r.kg = usesW ? kg : 0; r.reps.push(rp); if (s >= sets) nextEx(); else { setS(s + 1); setRest(it.rest || 45); } };
  const mins = Math.max(1, Math.round((Date.now() - t0) / 60000));
  const btn = bg => ({ width: "100%", background: bg || FW.blue, color: "#fff", border: "none", borderRadius: 16, padding: 16, fontSize: 17, fontWeight: 900, cursor: "pointer" });
  const sb2 = { width: 34, height: 34, borderRadius: 10, border: "1px solid " + FW.line, background: FW.card2, color: "#fff", fontSize: 18, cursor: "pointer" };
  const step = (v, set, d, mn) => h("div", { style: { display: "flex", alignItems: "center", gap: 6 } }, h("button", { onClick: () => set(Math.max(mn, Math.round((v - d) * 10) / 10)), style: sb2 }, "−"), h("div", { style: { minWidth: 44, textAlign: "center", fontWeight: 900, fontSize: 20 } }, v), h("button", { onClick: () => set(Math.round((v + d) * 10) / 10), style: sb2 }, "+"));
  const lastTxt = hs ? "آخر مرة: " + (hs.kg ? hs.kg + " كجم × " : "") + (hs.reps || []).join("/") : "";
  const hint = hs && hs.reps && hs.reps.length && hs.reps.every(x => x >= hi) ? (usesW && hs.kg < (pf.dbMax || 10) ? "ممتاز! جرّب تزوّد الوزن المرة دي." : "وصلت للحد الأعلى — بطّئ النزول ٣ ثواني أو زوّد التكرار أو جرّب نسخة أصعب.") : "";
  return h("div", { dir: "rtl", style: { position: "fixed", inset: 0, zIndex: 90, background: FW.bg, color: "#fff", display: "flex", flexDirection: "column", fontFamily: "inherit" } },
    h("div", { style: { padding: "calc(12px + env(safe-area-inset-top)) 16px 8px", display: "flex", gap: 12, alignItems: "center", maxWidth: 520, width: "100%", margin: "0 auto", boxSizing: "border-box" } },
      h("button", { onClick: () => { if (confirm("تنهي التمرين من غير ما يتسجّل؟")) onClose(); }, style: { background: FW.card, border: "1px solid " + FW.line, color: "#fff", borderRadius: 12, width: 38, height: 38, fontSize: 16, cursor: "pointer" } }, "✕"),
      h("div", { style: { flex: 1, height: 6, background: FW.card2, borderRadius: 9, overflow: "hidden" } }, h("div", { style: { width: ((fin ? list.length : i) / list.length * 100) + "%", height: "100%", background: FW.blue, transition: "width .3s" } })),
      h("span", { style: { fontSize: 12, color: FW.mut, fontWeight: 800 } }, (fin ? list.length : i + 1) + "/" + list.length)),
    fin ? h("div", { className: "fade", style: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center", maxWidth: 520, margin: "0 auto" } },
      h("div", { style: { fontSize: 80 } }, "🏆"), h("div", { style: { fontSize: 26, fontWeight: 900, margin: "8px 0" } }, "عاش يا " + (pf.name || "بطل") + "!"), h("div", { style: { color: FW.mut, lineHeight: 2 } }, "خلّصت " + list.length + " تمرين في حوالي " + mins + " دقيقة."), h("div", { style: { color: "#cdd6f4", marginTop: 8, fontSize: 13 } }, "هيتأشّر في الأهداف اليومية ✅ وأوزانك هتتحفظ"),
      h("div", { style: { width: "100%", marginTop: 28 } }, h("button", { style: btn(FW.ok), onClick: () => onDone(mins, recRef.current) }, "تسجيل التمرين"))) :
    h("div", { key: i + "-" + s + "-" + (rest > 0), className: "fade", style: { flex: 1, overflowY: "auto", padding: "4px 18px", maxWidth: 520, width: "100%", margin: "0 auto", boxSizing: "border-box", textAlign: "center" } },
      rest > 0 ? h("div", { style: { paddingTop: 30 } }, h("div", { style: { color: FW.mut, fontWeight: 800 } }, "راحة"), h("div", { style: { fontSize: 96, fontWeight: 900, color: FW.blue2, lineHeight: 1.1 } }, rest), h("div", { style: { color: "#cdd6f4", marginTop: 6 } }, "الجاي: السيت " + s + " من " + sets + " — " + ex[1]), h("div", { style: { marginTop: 26, display: "grid", gap: 10 } }, h("button", { style: btn(FW.card2), onClick: () => setRest(r => r + 15) }, "+١٥ ثانية"), h("button", { style: btn(), onClick: () => setRest(0) }, "جاهز، كمّل")))
        : h("div", null, guide ? h(FitInfo, { id: it.id }) : h(FitAnim, { id: it.id, h: 190 }), h("div", { style: { color: FW.blue2, fontWeight: 800, fontSize: 13, marginTop: 8 } }, FIT_MN[ex[2]] || "كارديو"),
          h("div", { style: { fontSize: 23, fontWeight: 900, margin: "4px 0 8px", lineHeight: 1.5 } }, ex[1]),
          h("div", { style: { display: "flex", gap: 10, justifyContent: "center", marginBottom: 8 } }, h("div", { style: { background: FW.card, borderRadius: 14, padding: "8px 16px", border: "1px solid " + FW.line } }, h("div", { style: { fontSize: 11, color: FW.mut } }, "السيت"), h("div", { style: { fontSize: 20, fontWeight: 900 } }, s + "/" + sets)), h("div", { style: { background: FW.card, borderRadius: 14, padding: "8px 16px", border: "1px solid " + FW.line } }, h("div", { style: { fontSize: 11, color: FW.mut } }, "المطلوب"), h("div", { style: { fontSize: 20, fontWeight: 900 } }, it.reps))),
          h("button", { onClick: () => setGuide(!guide), style: { background: "none", border: "1px solid " + FW.line, color: FW.blue2, borderRadius: 12, padding: "7px 16px", fontWeight: 800, cursor: "pointer", marginBottom: 8 } }, guide ? "إخفاء الشرح" : "📖 شرح التمرين خطوة بخطوة"),
          !isT && h("div", { style: { display: "flex", gap: 18, justifyContent: "center", alignItems: "center", background: FW.card, border: "1px solid " + FW.line, borderRadius: 16, padding: 10, marginBottom: 6 } }, usesW && h("div", null, h("div", { style: { fontSize: 11, color: FW.mut, marginBottom: 2 } }, "الوزن (كجم)"), step(kg, setKg, 2.5, 0)), h("div", null, h("div", { style: { fontSize: 11, color: FW.mut, marginBottom: 2 } }, "عملت كام تكرار"), step(rp, setRp, 1, 1))),
          lastTxt && h("div", { style: { fontSize: 12, color: FW.mut } }, lastTxt), hint && h("div", { style: { fontSize: 12.5, color: "#86efac", marginTop: 3 } }, "💡 " + hint))),
    !fin && rest <= 0 && h("div", { style: { padding: "8px 18px calc(12px + env(safe-area-inset-bottom))", maxWidth: 520, width: "100%", margin: "0 auto", boxSizing: "border-box", display: "grid", gap: 6 } },
      h("button", { style: btn(), onClick: doneSet }, "خلّصت السيت ✓"),
      h("button", { onClick: nextEx, style: { background: "none", border: "none", color: FW.mut, fontWeight: 800, cursor: "pointer", padding: 4 } }, "تخطّي التمرين ⏭")));
}

function FitModule({ prof, go }) {
  const { get, set } = useData();
  const fit = get("fit", null);
  const [wiz, setWiz] = useState(false); const [tab, setTab] = useState("today"); const [play, setPlay] = useState(null);
  const [mday, setMday] = useState(fitDayIdx()); const [open, setOpen] = useState(null); const [aiTxt, setAiTxt] = useState(""); const [aiBusy, setAiBusy] = useState(false);
  const [sheet, setSheet] = useState(null); const [dr, setDr] = useState(null); const [mf, setMf] = useState({ waist: "", chest: "", arm: "" });
  const [toast, toastNode] = useToast();
  const wEntries = ((get("weight", { entries: [] }) || {}).entries || []).slice().sort((a, b) => a.date.localeCompare(b.date));
  const lastW = wEntries.length ? wEntries[wEntries.length - 1].kg : null;
  const pf = fit && fit.pf, plan = fit && fit.plan;
  // ربط الميزان: تغيّر الوزن يعدّل الخطة
  useEffect(() => {
    if (!pf || !plan || !lastW) return; const a = fitAdapt(pf, plan, lastW); if (!a) return;
    const np = fitBuildPlan(Object.assign({}, pf, { weight: lastW }), a.cardio); np.start = plan.start; np.refKg = lastW; np.ver = (plan.ver || 1) + 1;
    set("fit", d => Object.assign({}, d, { plan: np, adj: a.adj, adapt: a, pf: Object.assign({}, d.pf, { weight: lastW }) }));
  }, [lastW, !!plan]);
  useEffect(() => { if (pf) fitSchedule(pf); }, [pf && JSON.stringify(pf.days)]);
  const finish = p => {
    const np = fitBuildPlan(p, false);
    set("fit", { pf: p, plan: np, log: (fit && fit.log) || {}, adj: 0, adapt: null });
    if (!wEntries.length) set("weight", d => Object.assign({}, d || {}, { entries: [...((d && d.entries) || []), { id: uid8(), date: todayStr(), kg: p.weight, note: "من مدرّبي", photo: null }] }));
    if (!prof.heightCm) set("profile", d => Object.assign({}, d || {}, { heightCm: p.height }));
    setWiz(false); setTab("today");
  };
  if (wiz || !fit || !pf || !plan) return h(FitWizard, { initial: pf ? Object.assign({}, pf, { unit: "kg" }) : null, defaultName: prof.name, onExit: () => { if (wiz) setWiz(false); else go("home"); }, onFinish: finish });
  const onDays = pf.days.filter(x => x.on).map(x => x.i).sort((a, b) => a - b);
  const log = fit.log || {}; const today = todayStr(); const wk = fitWeekNo(plan); const ph = fitPhase(Math.min(wk, 12));
  const kgNow = lastW || pf.weight; const nut = fitNutrition(pf, kgNow, fit.adj || 0);
  const sIdx = d => { const k = onDays.indexOf(d); return k < 0 ? -1 : k % plan.sessions.length; };
  const todayS = sIdx(fitDayIdx()); const doneToday = !!log[today];
  const nextTrain = (() => { for (let k = 1; k <= 7; k++) { const dt = new Date(); dt.setDate(dt.getDate() + k); if (onDays.includes(fitDayIdx(dt))) return FIT_DAYS[fitDayIdx(dt)]; } return ""; })();
  const complete = (si, mins, rec) => {
    set("fit", d => Object.assign({}, d, { hist: Object.assign({}, (d && d.hist) || {}, Object.fromEntries(Object.entries(rec || {}).map(([k, v]) => [k, { kg: v.kg, reps: v.reps, at: today }]))), log: Object.assign({}, (d && d.log) || {}, { [today]: { s: si, name: plan.sessions[si].name, min: mins, n: plan.sessions[si].ex.length } }) }));
    dailyTick(set, today, x => nzAr(x.t).includes("تمرين"));
    setPlay(null); toast("اتسجّل التمرين وتأشّر في الأهداف اليومية ✅");
  };
  const dates = Object.keys(log).sort(); const total = dates.length;
  const streak = (() => { let n = 0; const dt = new Date(); const key = x => x.getFullYear() + "-" + pad(x.getMonth() + 1) + "-" + pad(x.getDate()); if (!log[key(dt)]) dt.setDate(dt.getDate() - 1); for (let g = 0; g < 400; g++) { if (key(dt) < plan.start) break; if (log[key(dt)]) n++; else if (onDays.includes(fitDayIdx(dt))) break; dt.setDate(dt.getDate() - 1); } return n; })();
  const last7 = [...Array(7)].map((_, k) => { const dt = new Date(); dt.setDate(dt.getDate() - (6 - k)); const key = dt.getFullYear() + "-" + pad(dt.getMonth() + 1) + "-" + pad(dt.getDate()); return { k: FIT_DAYS[fitDayIdx(dt)].slice(0, 3), on: !!log[key], plan: onDays.includes(fitDayIdx(dt)) }; });
  const weekDone = last7.filter(x => x.on).length;
  const minTot = dates.reduce((a, k) => a + (log[k].min || 0), 0);
  const card = (children, st) => h("div", { className: "card", style: Object.assign({ marginBottom: 12 }, st || {}) }, children);
  const exRow = (it, idx, sess) => { const e = fitEx(it.id); const o = open === sess + "-" + idx; return h("div", { key: idx, onClick: () => setOpen(o ? null : sess + "-" + idx), style: { padding: "10px 0", borderTop: idx ? "1px solid var(--line)" : "none", cursor: "pointer" } }, h("div", { style: { display: "flex", alignItems: "center", gap: 10 } }, h("span", { style: { width: 26, height: 26, borderRadius: 8, background: "var(--accent)", color: "var(--accent-ink)", fontWeight: 900, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 } }, idx + 1), h("div", { style: { flex: 1 } }, h("div", { style: { fontWeight: 800, fontSize: 14 } }, e[1]), h("div", { style: { fontSize: 11, color: "var(--muted)" } }, (FIT_MN[e[2]] || "كارديو") + " • " + fitSets(it, idx, Math.min(wk, 12)) + " × " + it.reps))), o && h("div", { onClick: ev => ev.stopPropagation(), style: { background: "#0a1128", borderRadius: 14, padding: 10, marginTop: 8, color: "#fff" } }, h(FitInfo, { id: it.id }))); };
  const tabs = [["today", "اليوم"], ["plan", "الخطة"], ["meals", "الأكل"], ["prog", "تقدّمي"]];
  let body;
  if (tab === "today") {
    const si = doneToday ? log[today].s : todayS;
    body = h("div", { className: "fade" },
      fit.adapt && card(h("div", null, h("div", { style: { fontWeight: 900, marginBottom: 4 } }, "⚖️ الخطة اتعدّلت حسب وزنك"), h("div", { style: { fontSize: 13, lineHeight: 1.8 } }, fit.adapt.note), h("div", { style: { fontSize: 11, color: "var(--muted)", marginTop: 4 } }, "سعراتك دلوقتي " + nut.kcal + " سعر/يوم")), { borderColor: "var(--accent)" }),
      card(h("div", null, h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, h("div", null, h("div", { style: { fontSize: 12, color: "var(--muted)", fontWeight: 700 } }, "الأسبوع " + Math.min(wk, 12) + " • " + ph[0]), h("div", { style: { fontSize: 20, fontWeight: 900 } }, doneToday ? "خلّصت تمرين النهارده 🎉" : todayS >= 0 ? plan.sessions[todayS].name : "النهارده يوم راحة 😴")), h("span", { style: { fontSize: 34 } }, doneToday ? "✅" : todayS >= 0 ? "💪" : "🛌")),
        h("div", { style: { fontSize: 12.5, color: "var(--muted)", margin: "6px 0 10px" } }, doneToday ? "اتسجّل " + log[today].n + " تمرين في " + log[today].min + " دقيقة." : todayS >= 0 ? plan.sessions[todayS].ex.length + " تمرين • حوالي " + Math.round(plan.sessions[todayS].ex.length * 5.5) + " دقيقة • " + ph[1] : "الراحة جزء من البناء. تمرينك الجاي: " + nextTrain),
        !doneToday && h("button", { className: "btn btn-primary", style: { width: "100%" }, onClick: () => setPlay(todayS >= 0 ? todayS : Math.max(0, onDays.length ? sIdx(onDays.find(d => d > fitDayIdx()) ?? onDays[0]) : 0)) }, todayS >= 0 ? "ابدأ التمرين ▶" : "تمرّن النهارده كمان ▶"))),
      todayS >= 0 && !doneToday && card(h("div", null, h("div", { style: { fontWeight: 900, marginBottom: 4 } }, "تمارين النهارده"), plan.sessions[todayS].ex.map((it, k) => exRow(it, k, "t")))),
      h("div", { style: { display: "flex", gap: 8 } }, h(Stat, { label: "سلسلة الالتزام", value: streak + " 🔥" }), h(Stat, { label: "الأسبوع ده", value: weekDone + "/" + onDays.length })),
      card(h("div", { style: { display: "flex", justifyContent: "space-between" } }, last7.map((x, k) => h("div", { key: k, style: { textAlign: "center" } }, h("div", { style: { width: 30, height: 30, borderRadius: 99, background: x.on ? "var(--ok)" : "var(--card2)", border: "1px solid " + (x.plan ? "var(--accent)" : "var(--line)"), color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 } }, x.on ? "✓" : ""), h("div", { style: { fontSize: 10, color: "var(--muted)", marginTop: 3 } }, x.k)))), { marginTop: 12 }));
  } else if (tab === "plan") {
    body = h("div", { className: "fade" }, card(h("div", null, h("div", { style: { fontWeight: 900 } }, "خطتك • ١٢ أسبوع"), h("div", { style: { fontSize: 12.5, color: "var(--muted)", marginTop: 4, lineHeight: 1.8 } }, "أسبوع ١–٤ تأسيس • ٥–٨ بناء (سيت زيادة في أول تمرينين) • ٩–١٢ تكثيف. إنت دلوقتي في الأسبوع " + Math.min(wk, 12) + (wk > 12 ? " — خلّصت الدورة، جدّد الخطة!" : ".")), h(Bar, { pct: Math.min(wk, 12) / 12 * 100 }))),
      plan.sessions.map((s, si) => card(h("div", null, h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 } }, h("div", { style: { fontWeight: 900 } }, "اليوم " + (si + 1) + " • " + s.name), h("span", { className: "chip", style: { cursor: "default" } }, onDays[si] != null ? FIT_DAYS[onDays[si]] + " " + (pf.days.find(x => x.i === onDays[si]) || {}).time : "")), s.ex.map((it, k) => exRow(it, k, "p" + si))))),
      h("div", { style: { display: "grid", gap: 8 } }, h("button", { className: "btn btn-ghost", onClick: () => { setDr(JSON.parse(JSON.stringify({ days: pf.days }))); setSheet("rem"); } }, "⏰ مواعيد التذكير (أي وقت تحبه)"), h("button", { className: "btn btn-ghost", onClick: () => { setDr({ equip: pf.equip || "none", eqParts: pf.eqParts || [], dbMax: pf.dbMax || 10 }); setSheet("eq"); } }, "🎒 أدواتي (دمبل / حبل نط…)"), h("button", { className: "btn btn-ghost", onClick: () => setWiz(true) }, "✏️ عدّل إجاباتي وأعد بناء الخطة"), h("button", { className: "btn btn-ghost", onClick: () => { const np = fitBuildPlan(pf, plan.cardio); np.refKg = plan.refKg; set("fit", d => Object.assign({}, d, { plan: np })); toast("اتجدّدت الخطة (أسبوع ١ من النهارده)."); } }, "🔄 جدّد الدورة من أسبوع ١")));
  } else if (tab === "meals") {
    const mp = fitMealPlan(nut)[mday];
    body = h("div", { className: "fade" },
      h("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 } }, h(Stat, { label: "سعراتك/يوم", value: nut.kcal }), h(Stat, { label: "بروتين", value: nut.protein + " جم" }), h(Stat, { label: "كارب", value: nut.carb + " جم" }), h(Stat, { label: "دهون", value: nut.fat + " جم" })),
      card(h("div", { style: { fontSize: 13, lineHeight: 1.9 } }, "💧 المياه: " + nut.water + " لتر يوميًا", h("br"), "🔥 حرق جسمك الأساسي: " + nut.bmr + " • الإجمالي مع نشاطك: " + nut.tdee, fit.adj ? h("div", { style: { color: "var(--accent2)", marginTop: 4 } }, "تعديل من الميزان: " + (fit.adj > 0 ? "+" : "") + fit.adj + " سعر") : null)),
      h("div", { style: { display: "flex", gap: 6, overflowX: "auto", marginBottom: 10, paddingBottom: 4 } }, FIT_DAYS.map((n, k) => h("button", { key: k, className: "chip" + (mday === k ? " on" : ""), onClick: () => setMday(k) }, n))),
      card(h("div", null, mp.meals.map((m, k) => h("div", { key: k, style: { padding: "10px 0", borderTop: k ? "1px solid var(--line)" : "none" } }, h("div", { style: { display: "flex", justifyContent: "space-between" } }, h("b", null, m.t), h("span", { style: { color: "var(--muted)", fontSize: 12 } }, "≈ " + m.kcal + " سعر")), h("div", { style: { fontSize: 13.5, marginTop: 3, lineHeight: 1.7 } }, m.txt), h("div", { style: { fontSize: 11.5, color: "var(--accent2)", marginTop: 2 } }, "حجم الحصة ×" + m.sc))))),
      h("button", { className: "btn btn-primary", style: { width: "100%", marginBottom: 8 }, onClick: () => {
        if (!confirm("أنقل خطة الأسبوع ده لـ«تنظيم الوجبات»؟ (هتتكتب على فطار/غداء/عشاء الأسبوع ده)")) return;
        const dts = weekDatesFor(0), mpA = fitMealPlan(nut);
        set("meals", d => { const x = d || {}; const p2 = Object.assign({}, x.plan || {}); dts.forEach((dt, i) => { const m = mpA[i].meals; const fm = q => q.txt + " (×" + q.sc + " ≈" + q.kcal + " سعر)"; p2[dt] = Object.assign({}, p2[dt] || {}, { breakfast: fm(m[0]), lunch: fm(m[1]), dinner: fm(m[3]), drinks: "مياه " + nut.water + " لتر", notes: "سناك: " + fm(m[2]) + " • إجمالي اليوم ≈" + nut.kcal + " سعر" }); }); return Object.assign({}, x, { plan: p2 }); });
        toast("اتنقلت الخطة لتنظيم الوجبات ✅"); } }, "📤 انقل خطة الأسبوع لتنظيم الوجبات"),
      h("button", { className: "btn btn-ghost", style: { width: "100%" }, disabled: aiBusy, onClick: async () => { setAiBusy(true); try { setAiTxt(await askAI("اعمل لي خطة أكل ليوم واحد بالأكل المصري البسيط بحوالي " + nut.kcal + " سعر وبروتين " + nut.protein + " جم لشخص هدفه " + ({ build: "بناء عضل", lose: "خسارة وزن", fit: "محافظة على اللياقة" }[pf.goal]) + "، وزنه " + kgNow + " كجم. " + (pf.extra ? "ملاحظات: " + pf.extra + ". " : "") + "اتكلم بالعامية المصرية وقسّم لفطار/غدا/سناك/عشا بأرقام تقريبية، ومتدّيش أدوية. في الآخر جملة إن استشارة أخصائي تغذية أهم.")); } catch (e) { toast(e.message); } setAiBusy(false); } }, aiBusy ? "بفكّر…" : "✨ اطلب خطة أكل بالذكاء الاصطناعي"),
      aiTxt && card(h("div", { style: { whiteSpace: "pre-wrap", fontSize: 13.5, lineHeight: 1.9 } }, aiTxt), { marginTop: 12 }));
  } else {
    const dW = lastW && wEntries.length > 1 ? Math.round((lastW - wEntries[0].kg) * 10) / 10 : 0;
    body = h("div", { className: "fade" }, h("div", { style: { display: "flex", gap: 8, marginBottom: 12 } }, h(Stat, { label: "تمارين خلّصتها", value: total }), h(Stat, { label: "دقايق تمرين", value: minTot })),
      h("div", { style: { display: "flex", gap: 8, marginBottom: 12 } }, h(Stat, { label: "وزنك الحالي", value: (kgNow || "—") + " كجم", sub: dW ? (dW > 0 ? "+" : "") + dW + " كجم من أول قياس" : "" }), h(Stat, { label: "BMI", value: (fitBmi(kgNow, pf.height) || 0).toFixed(1), sub: fitBmiInfo(fitBmi(kgNow, pf.height))[0] })),
      card(h("div", { style: { fontSize: 13, lineHeight: 1.9 } }, "⚖️ لما تسجّل وزنك الجديد في «وزني وتخسيسي» الخطة وسعراتك بيتعدّلوا تلقائي (لو الفرق ١٫٥ كجم أو أكتر).", h("div", { style: { marginTop: 8 } }, h("button", { className: "btn btn-primary", onClick: () => go("weight") }, "سجّل وزن دلوقتي")))),

      card(h("div", null, h("div", { style: { fontWeight: 900, marginBottom: 8 } }, "📏 قياسات الجسم (سم)"),
        h("div", { style: { display: "flex", gap: 8 } }, [["waist", "الوسط"], ["chest", "الصدر"], ["arm", "الدراع"]].map(([k, t]) => h("input", { key: k, type: "number", inputMode: "decimal", placeholder: t, value: mf[k], onChange: e => setMf(Object.assign({}, mf, { [k]: e.target.value })), style: { flex: 1, minWidth: 0, padding: 10, borderRadius: 10, border: "1px solid var(--line)", background: "var(--card2)", color: "var(--text)" } }))),
        h("button", { className: "btn btn-primary", style: { width: "100%", marginTop: 8 }, onClick: () => { const e = { date: today }; ["waist", "chest", "arm"].forEach(k => { const v = num(mf[k]); if (v > 0) e[k] = v; }); if (Object.keys(e).length < 2) return toast("اكتب قياس واحد على الأقل."); set("fit", d => Object.assign({}, d, { meas: ((d && d.meas) || []).filter(x => x.date !== today).concat(e) })); setMf({ waist: "", chest: "", arm: "" }); toast("اتسجّل ✓"); } }, "سجّل القياس"),
        [["waist", "الوسط", "#f59e0b"], ["chest", "الصدر", "#3b82f6"], ["arm", "الدراع", "#22c55e"]].map(([k, t, c]) => { const ser = (fit.meas || []).filter(x => x[k] > 0).map(x => x[k]); if (!ser.length) return null; const mn = Math.min.apply(null, ser) - 1, mx = Math.max.apply(null, ser) + 1; const pts = ser.map((v, q) => [ser.length > 1 ? 10 + q * 280 / (ser.length - 1) : 150, 50 - (v - mn) / (mx - mn) * 40]); const dl = Math.round((ser[ser.length - 1] - ser[0]) * 10) / 10;
          return h("div", { key: k, style: { marginTop: 12 } }, h("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 13 } }, h("b", null, t), h("span", { style: { color: "var(--muted)" } }, ser[ser.length - 1] + " سم" + (ser.length > 1 ? " (" + (dl > 0 ? "+" : "") + dl + ")" : ""))),
            h("svg", { viewBox: "0 0 300 60", width: "100%", height: 60 }, h("polyline", { points: pts.map(p => p.join(",")).join(" "), fill: "none", stroke: c, strokeWidth: 3, strokeLinecap: "round", strokeLinejoin: "round" }), pts.map((p, q) => h("circle", { key: q, cx: p[0], cy: p[1], r: 3.5, fill: c })))); }))),
      card(h("div", null, h("div", { style: { fontWeight: 900, marginBottom: 6 } }, "🏋️ آخر أوزانك"), Object.keys(fit.hist || {}).length ? Object.entries(fit.hist).slice(-8).reverse().map(([k, v]) => h("div", { key: k, style: { display: "flex", justifyContent: "space-between", padding: "6px 0", borderTop: "1px solid var(--line)", fontSize: 13 } }, h("span", null, (FIT_EXB[k] || [])[1] || k), h("span", { style: { color: "var(--muted)" } }, (v.kg ? v.kg + " كجم × " : "") + (v.reps || []).join("/")))) : h(Empty, { icon: "📈", text: "هتتسجّل أوزانك وتكراراتك أول ما تخلّص تمرين." }))),
      card(h("div", null, h("div", { style: { fontWeight: 900, marginBottom: 6 } }, "آخر التمارين"), dates.length ? dates.slice(-8).reverse().map(k => h("div", { key: k, style: { display: "flex", justifyContent: "space-between", padding: "7px 0", borderTop: "1px solid var(--line)", fontSize: 13 } }, h("span", null, k + " • " + log[k].name), h("span", { style: { color: "var(--muted)" } }, log[k].min + " د"))) : h(Empty, { icon: "🏋️", text: "لسه مفيش تمارين متسجّلة — ابدأ أول تمرين!" }))));
  }
  return h("div", null,
    h("div", { style: { display: "flex", gap: 6, marginBottom: 12, position: "sticky", top: 58, zIndex: 10, background: "var(--bg)", padding: "4px 0" } }, tabs.map(([k, t]) => h("button", { key: k, className: "chip" + (tab === k ? " on" : ""), style: { flex: 1, textAlign: "center" }, onClick: () => setTab(k) }, t))),
    body, toastNode,
    sheet === "rem" && dr && h(Sheet, { title: "⏰ مواعيد التذكير", onClose: () => setSheet(null) },
      h("div", { style: { fontSize: 12, color: "var(--muted)", marginBottom: 8, lineHeight: 1.8 } }, "فعّل الأيام واختار الميعاد اللي يناسبك، وتقدر تضيف أكتر من تذكير في اليوم."),
      dr.days.map((x, k) => h("div", { key: k, style: { padding: "8px 0", borderTop: k ? "1px solid var(--line)" : "none" } },
        h("div", { style: { display: "flex", alignItems: "center", gap: 8 } },
          h("input", { type: "checkbox", checked: x.on, onChange: () => setDr(d => ({ days: d.days.map((y, j) => j === k ? Object.assign({}, y, { on: !y.on }) : y) })) }),
          h("span", { style: { flex: 1, fontWeight: 800 } }, FIT_DAYS[k]),
          h("input", { type: "time", value: x.time, disabled: !x.on, onChange: e => setDr(d => ({ days: d.days.map((y, j) => j === k ? Object.assign({}, y, { time: e.target.value || "18:00" }) : y) })), style: { padding: 6, borderRadius: 8, border: "1px solid var(--line)", background: "var(--card2)", color: "var(--text)" } }),
          h("button", { className: "chip", disabled: !x.on, onClick: () => setDr(d => ({ days: d.days.map((y, j) => j === k ? Object.assign({}, y, { times: (y.times || []).concat("08:00").slice(0, 3) }) : y) })) }, "+")),
        (x.times || []).map((tm, q) => h("div", { key: q, style: { display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 6 } }, h("input", { type: "time", value: tm, onChange: e => setDr(d => ({ days: d.days.map((y, j) => j === k ? Object.assign({}, y, { times: y.times.map((z, w) => w === q ? (e.target.value || z) : z) }) : y) })), style: { padding: 6, borderRadius: 8, border: "1px solid var(--line)", background: "var(--card2)", color: "var(--text)" } }), h("button", { className: "chip", onClick: () => setDr(d => ({ days: d.days.map((y, j) => j === k ? Object.assign({}, y, { times: y.times.filter((z, w) => w !== q) }) : y) })) }, "✕"))))),
      h("button", { className: "btn btn-primary", style: { width: "100%", marginTop: 12 }, onClick: () => {
        const on = dr.days.filter(x => x.on); if (!on.length) return toast("اختار يوم واحد على الأقل.");
        const pf2 = Object.assign({}, pf, { days: dr.days, perWeek: on.length });
        if (on.length !== onDays.length) { const np = fitBuildPlan(pf2, plan.cardio); np.start = plan.start; np.refKg = plan.refKg; set("fit", d => Object.assign({}, d, { pf: pf2, plan: np })); } else set("fit", d => Object.assign({}, d, { pf: pf2 }));
        setSheet(null); toast("اتحفظت المواعيد ✓");
      } }, "حفظ")),
    sheet === "eq" && dr && h(Sheet, { title: "🎒 أدواتي", onClose: () => setSheet(null) },
      h("div", { style: { display: "grid", gap: 8 } }, Object.entries(FIT_EQ).map(([k, v]) => h("button", { key: k, className: "chip" + (dr.equip === k ? " on" : ""), style: { textAlign: "right", padding: 12 }, onClick: () => setDr(d => Object.assign({}, d, { equip: k })) }, v.i + " " + v.t))),
      dr.equip === "custom" && h("div", { style: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 } }, FIT_EQ_PARTS.map(([k, t]) => h("button", { key: k, className: "chip" + (dr.eqParts.includes(k) ? " on" : ""), onClick: () => setDr(d => Object.assign({}, d, { eqParts: d.eqParts.includes(k) ? d.eqParts.filter(x => x !== k) : d.eqParts.concat(k) })) }, t))),
      h("div", { style: { marginTop: 12 } }, h(Field, { label: "أتقل دمبل معاك (كجم)" }, h("input", { type: "number", value: dr.dbMax, onChange: e => setDr(d => Object.assign({}, d, { dbMax: parseFloat(e.target.value) || 10 })), style: { width: "100%" } }))),
      h("button", { className: "btn btn-primary", style: { width: "100%", marginTop: 8 }, onClick: () => { const pf2 = Object.assign({}, pf, { equip: dr.equip, eqParts: dr.eqParts, dbMax: dr.dbMax }); const np = fitBuildPlan(pf2, plan.cardio); np.start = plan.start; np.refKg = plan.refKg; set("fit", d => Object.assign({}, d, { pf: pf2, plan: np })); setSheet(null); toast("اتحدّثت الخطة على قد أدواتك ✓"); } }, "حفظ وأعد بناء الخطة")),
    play != null && h(FitPlayer, { sess: plan.sessions[play], week: Math.min(wk, 12), pf, onClose: () => setPlay(null), hist: fit.hist || {}, onDone: (m, rec) => complete(play, m, rec) }));
}

function MealsModule() {
  const { get, set } = useData();
  const doc = get("meals", { plan: {}, cal: {}, aiPlan: "" });
  const plan = doc.plan || {}, cal = doc.cal || {};
  const [off, setOff] = useState(0);
  const [loading, setLoading] = useState({});
  const [planBusy, setPlanBusy] = useState(false);
  const [toast, toastNode] = useToast();
  const dates = weekDatesFor(off);
  const weights = ((get("weight", { entries: [] }) || {}).entries || []).slice().sort((a, b) => a.date.localeCompare(b.date));
  const prof = get("profile", {});
  const setCell = (date, k, v) => set("meals", d => { const x = d || {}; return { ...x, plan: { ...(x.plan || {}), [date]: { ...((x.plan || {})[date] || {}), [k]: v } } }; });
  const calc = async date => {
    const d = plan[date] || {};
    const parts = MEAL_COLS.filter(([k]) => k !== "notes" && (d[k] || "").trim()).map(([k, l]) => l + ": " + d[k]);
    if (!parts.length) return toast("اكتب وجبة واحدة على الأقل.");
    setLoading(l => ({ ...l, [date]: true }));
    try {
      const t = await askAI("أنت خبير تغذية بترد بالعامية المصرية. دي وجبات يوم واحد، احسب تقريبًا السعرات لكل وجبة، وبعدين اكتب في آخر سطر بالشكل ده بالظبط: الإجمالي: 1850 (رقم فقط). خلّي الرد مختصر وبدون نصايح طبية.\n" + parts.join("\n"));
      const m = t.match(/الإجمالي:\s*([\d,٠-٩]+)/);
      const total = m ? String(num(m[1].replace(/,/g, "")) || "") : "";
      set("meals", d0 => { const x = d0 || {}; return { ...x, cal: { ...(x.cal || {}), [date]: { text: t || "معرفتش أحسب، جرّب تاني.", total } } }; });
    } catch (e) { toast(e.message); }
    setLoading(l => ({ ...l, [date]: false }));
  };
  const monthNow = todayStr().slice(0, 7);
  const monthDays = Object.keys(cal).filter(d => d.startsWith(monthNow) && cal[d] && cal[d].total);
  const monthTotal = monthDays.reduce((s, d) => s + (+cal[d].total || 0), 0);
  const monthAvg = monthDays.length ? Math.round(monthTotal / monthDays.length) : 0;
  const weekTotal = dates.reduce((s, d) => s + (+((cal[d] && cal[d].total) || 0)), 0);
  const genPlan = async () => {
    setPlanBusy(true);
    try {
      const last = weights[weights.length - 1];
      const wl = last ? "وزني الحالي " + last.kg + " كجم" + (prof.goalKg ? " وهدفي " + prof.goalKg + " كجم" : "") : "";
      const t = await askAI("أنت أخصائي تغذية مصري. اعمل خطة أكل أسبوعية (فطار وغداء وعشاء) بمنتجات مصرية متوفرة وميزانية معقولة. " + wl + (monthDays.length ? " متوسط سعراتي الفعلي حوالي " + monthAvg + " في اليوم." : "") + " اكتبها بالعامية المصرية مقسّمة بالأيام، مختصرة، وفي آخرها جملة إن ده إرشاد عام مش بديل لأخصائي تغذية.");
      set("meals", d => ({ ...(d || {}), aiPlan: t }));
    } catch (e) { toast(e.message); }
    setPlanBusy(false);
  };
  const [open, setOpen] = useState("");
  const fold = (id, title, body) => h("div", { className: "card", style: { marginBottom: 12 } },
    h("button", { onClick: () => setOpen(open === id ? "" : id), style: { width: "100%", background: "none", border: "none", display: "flex", justifyContent: "space-between", fontWeight: 900, fontSize: 14, cursor: "pointer", padding: 0 } }, h("span", null, title), h("span", null, open === id ? "▴" : "▾")),
    open === id && h("div", { style: { marginTop: 10 } }, body));
  return h("div", { className: "fade" },
    h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, gap: 6 } },
      h("button", { className: "btn btn-ghost", style: { padding: "8px 10px", fontSize: 12 }, onClick: () => setOff(o => o - 1) }, "‹ السابق"),
      h("span", { style: { fontSize: 12, fontWeight: 800, color: "var(--muted)", textAlign: "center" } }, off === 0 ? "📍 الأسبوع الحالي" : dates[0] + " ← " + dates[6]),
      h("button", { className: "btn btn-ghost", style: { padding: "8px 10px", fontSize: 12 }, disabled: off >= 0, onClick: () => setOff(o => Math.min(0, o + 1)) }, "التالي ›")),
    MEAL_DAYS.map((day, i) => {
      const date = dates[i], d = plan[date] || {}, c = cal[date] || {};
      return h("div", { key: date, className: "card", style: { marginBottom: 10 } },
        h("div", { style: { fontWeight: 900, fontSize: 13, color: "var(--accent)", marginBottom: 8 } }, "📅 " + day + " · " + date),
        MEAL_COLS.map(([k, l]) => h("div", { key: k, style: { marginBottom: 7 } }, h("div", { style: { fontSize: 11, color: "var(--muted)", marginBottom: 3 } }, l), h("input", { value: d[k] || "", placeholder: "اكتب هنا…", maxLength: 200, onChange: e => setCell(date, k, e.target.value), style: { fontSize: 13, padding: "9px 11px" } }))),
        h("button", { className: "btn btn-ghost", style: { width: "100%", marginTop: 4, fontSize: 13 }, disabled: loading[date], onClick: () => calc(date) }, loading[date] ? "بيحسب…" : "🔥 احسب السعرات بالذكاء الاصطناعي"),
        c.text && h("div", { style: { marginTop: 8, background: "var(--card2)", borderRadius: 12, padding: "9px 11px", fontSize: 12, lineHeight: 1.9, whiteSpace: "pre-wrap" } }, c.text),
        c.total && h("div", { style: { display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 13, fontWeight: 900 } }, h("span", { style: { color: "var(--muted)", fontWeight: 700 } }, "إجمالي اليوم"), h("span", { style: { color: "var(--warn)" } }, fmt(c.total, 0) + " سعر")));
    }),
    weekTotal > 0 && h("div", { className: "card", style: { textAlign: "center", marginBottom: 12, borderColor: "var(--ok)" } }, h("div", { style: { fontSize: 11, color: "var(--muted)" } }, "إجمالي سعرات الأسبوع (الأيام المحسوبة)"), h("div", { style: { fontSize: 24, fontWeight: 900, color: "var(--ok)" } }, fmt(weekTotal, 0))),
    fold("month", "📊 ملخص الشهر", monthDays.length === 0 ? h("div", { style: { color: "var(--muted)", fontSize: 12 } }, "لسه مفيش أيام محسوبة السعرات في الشهر ده.") : h("div", { style: { fontSize: 13, lineHeight: 2.2 } }, h("div", null, "الأيام المحسوبة: ", h("b", null, monthDays.length)), h("div", null, "إجمالي الشهر: ", h("b", null, fmt(monthTotal, 0))), h("div", null, "متوسط اليوم: ", h("b", null, fmt(monthAvg, 0))))),
    weights.length > 0 && fold("link", "🔗 الأكل مع وزنك", weights.slice(-10).reverse().map(w => h("div", { key: w.id, style: { display: "flex", justifyContent: "space-between", padding: "6px 0", borderTop: "1px solid var(--line)", fontSize: 12 } }, h("span", { style: { color: "var(--muted)" } }, w.date), h("b", null, fmt(w.kg, 1) + " كجم"), h("span", { style: { color: cal[w.date] ? "var(--warn)" : "var(--muted)" } }, cal[w.date] && cal[w.date].total ? fmt(cal[w.date].total, 0) + " سعر" : "—")))),
    fold("plan", "🥗 اعملّي خطة أكل", h("div", null, h("div", { style: { fontSize: 12, color: "var(--muted)", marginBottom: 10, lineHeight: 1.8 } }, "خطة أسبوعية بمنتجات مصرية، على أساس وزنك وهدفك (لو مسجّلهم)."), h("button", { className: "btn btn-primary", style: { width: "100%" }, disabled: planBusy, onClick: genPlan }, planBusy ? "بيجهّز…" : doc.aiPlan ? "حدّث الخطة" : "اعملّي الخطة"), doc.aiPlan && h("div", { style: { marginTop: 10, fontSize: 13, lineHeight: 2, whiteSpace: "pre-wrap" } }, doc.aiPlan))),
    toastNode);
}

// ══════════════════════════════════════════════════════════════
// الأذكار والمصحف (ملف athkar.js)
// ══════════════════════════════════════════════════════════════
const HOME_MOTIVATION = ["خطوة صغيرة النهارده، فرق كبير بعد شهر.","ربنا يعينك على يومك ويبارك في وقتك.","لسه قدامك وقت تنظّم بيه يومك كله.","كل يوم تحاول فيه، إنجاز يتحسبلك.","ابدأ بسم الله، والباقي هييجي بإذن الله.","الاستمرار أهم من الكمال.","يومك الجاي أحسن من اللي فات بإذن الله.","توكل على الله وامشي في طريقك بثقة.","شوية شوية، والحمل التقيل بيخف بإذن الله.","اللي بيبدأ بنية صافية، ربنا بيفتحله الأبواب.","قرش النهارده بيبني أمان بكرة.","نظّم فلوسك النهارده، وارتاح بالك بكرة.","التعب اللي بتتعبه دلوقتي، هتشوف تمرته قريب.","ماتستهونش بخطوة، كل الطرق الطويلة بتبدأ بخطوة.","استعن بالله ولا تعجز، وكمّل يومك بهمّة.","اللي يحافظ على القليل، ربنا يبارك له في الكتير.","ركّز في اللي في إيدك النهارده، وسيب الباقي على الله.","كل حاجة بتتظبط لما نصبر ونكمّل.","يوم جديد، فرصة جديدة، وبداية أحسن بإذن الله.","الالتزام الصغير كل يوم أقوى من الحماس المؤقت.","اشكر ربنا على اللي عندك، وابني عليه خطوة خطوة.","ربنا ما بيضيّع تعب حد، كمّل وانت مطمّن.","رتّب أولوياتك، والبركة هتيجي في وقتك وفلوسك.","كل ما تحاسب نفسك، بتبقى أقرب لهدفك."];
function HomeMotivation() {
  const pick = avoid => { let i = Math.floor(Math.random() * HOME_MOTIVATION.length); if (i === avoid) i = (i + 1) % HOME_MOTIVATION.length; lsSet("allinone:home_motiv", i); return i; };
  const [idx, setIdx] = useState(() => pick(lsGet("allinone:home_motiv", -1)));
  return h("div", { onClick: () => setIdx(pick), style: { fontSize: 13, color: "var(--muted)", margin: "0 2px 16px", lineHeight: 1.7, cursor: "pointer", userSelect: "none" } }, HOME_MOTIVATION[idx]);
}
function AthkarModule({ user }) {
  const { get, set } = useData();
  const MA = window.AllInOneAthkar;
  const ready = useRef(false);
  if (MA && !ready.current) {
    ready.current = true;
    MA.init(user.id, { all: () => get("athkar_prefs", {}), set: (k, v) => set("athkar_prefs", d => ({ ...(d || {}), [k]: v })) }, { sb });
  }
  if (!MA) return h(Empty, { icon: "📿", text: "تعذّر تحميل قسم الأذكار. اتأكد من النت وحدّث الصفحة." });
  return h("div", { className: "fade", style: { color: "var(--text)", padding: "0 0 14px", minHeight: "60vh", direction: "rtl" } }, h(MA.Screen, {}));
}

const st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st);
ReactDOM.createRoot(document.getElementById("root")).render(h(App, {}));
window.__ready = true;
}
