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
html,body{margin:0;background:var(--bg);color:var(--text);font-family:'Cairo',system-ui,sans-serif}
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
function AuthScreen() {
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
  { id: "goals", icon: "🎯", title: "أهدافي المالية", desc: "حوّش لهدف (عربية، جواز، سفر…) وتابع التقدّم." },
  { id: "car", icon: "🚗", title: "عربيتي", desc: "سجل الصيانة، عداد ومواعيد بالكيلومتر، احتياجات، النقل الذكي، وتقرير شامل." },
  { id: "weight", icon: "⚖️", title: "وزني وتخسيسي", desc: "تابع وزنك وصورك، وحلّل تقدّمك بالذكاء الاصطناعي." },
  { id: "meals", icon: "🍽️", title: "تنظيم الوجبات", desc: "جدول أسبوعي لأكلك، مع حساب سعرات تقريبي وخطة أكل بالذكاء الاصطناعي." },
  { id: "athkar", icon: "📿", title: "الأذكار والمصحف", desc: "أذكار الصباح والمساء، المصحف بالصوت والتفسير، السبحة، والأدعية." },
  { id: "period", icon: "🩸", title: "متابعة الدورة", desc: "سجّلي بداية ونهاية الدورة وتابعي المسافة بينها.", only: "f" }
];
const modsFor = p => MODULES.filter(m => !m.only || m.only === (p && p.gender));
const SOON = [];
const modTitle = (id, prof) => id === "family" ? (prof.familyName || "ميزانية العائلة") : (MODULES.find(m => m.id === id) || {}).title;

// ══════════════════════════════════════════════════════════════
// أسئلة البداية (Onboarding)
// ══════════════════════════════════════════════════════════════
function Onboarding({ onDone, defaultName }) {
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
  const avail = modsFor({ gender });
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
  return h("div", { style: { minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: "24px 18px", maxWidth: 480, margin: "0 auto" } }, dots, h("div", { className: "card", style: { padding: 18 } }, body));
}

// ══════════════════════════════════════════════════════════════
// المصروفات (بتتستخدم كمان لميزانية فرد من العائلة بمفتاح بيانات مختلف)
// ══════════════════════════════════════════════════════════════
const EXP_CATS = [["🛒", "أكل وسوبر ماركت"], ["🏠", "البيت والفواتير"], ["🚗", "مواصلات"], ["💊", "صحة"], ["👕", "ملابس"], ["🎓", "تعليم"], ["🎉", "ترفيه"], ["🎁", "هدايا"], ["📱", "اتصالات ونت"], ["🧾", "أخرى"]];
const INC_CATS = [["💼", "مرتب"], ["➕", "دخل إضافي"], ["🎁", "هدية"], ["💵", "أخرى"]];
const catIcon = (cat, type, ic) => ic || ((type === "inc" ? INC_CATS : EXP_CATS).find(c => c[1] === cat) || ["🧾"])[0];

function ExpensesModule({ docKey, who }) {
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
  const mItems = useMemo(() => items.filter(i => monthOf(i.date) === m), [items, m]);
  const inc = mItems.filter(i => i.type === "inc").reduce((s, i) => s + i.amount, 0);
  const exp = mItems.filter(i => i.type !== "inc").reduce((s, i) => s + i.amount, 0);
  const byCat = useMemo(() => { const o = {}; mItems.filter(i => i.type !== "inc").forEach(i => { o[i.cat] = (o[i.cat] || 0) + i.amount; }); return Object.entries(o).sort((a, b) => b[1] - a[1]); }, [mItems]);
  const byDay = useMemo(() => { const o = {}; mItems.forEach(i => { (o[i.date] = o[i.date] || []).push(i); }); return Object.entries(o).sort((a, b) => b[0].localeCompare(a[0])); }, [mItems]);
  const budget = Number(doc.budget) || 0;
  const icons = useMemo(() => { const o = {}; items.forEach(i => { if (i.ic && !o[i.cat]) o[i.cat] = i.ic; }); return o; }, [items]);
  const extraCats = useMemo(() => { const base = new Set(EXP_CATS.concat(INC_CATS).map(c => c[1])); const cnt = {}; items.forEach(i => { if (!base.has(i.cat)) { const k = (i.type === "inc" ? "i|" : "e|") + i.cat; cnt[k] = (cnt[k] || 0) + 1; } }); return Object.entries(cnt).sort((x, y) => y[1] - x[1]).slice(0, 40).map(([k]) => [k.slice(0, 1) === "i" ? "inc" : "exp", k.slice(2)]); }, [items]);
  const addCat = () => { const n = (window.prompt("اسم التصنيف الجديد؟") || "").trim().slice(0, 30); if (n) setCat(n); };
  const openAdd = t => { setType(t); setAmount(""); setNote(""); setDate(todayStr()); setCat((t === "inc" ? INC_CATS : EXP_CATS)[0][1]); setSheet("add"); };
  const save = () => {
    const a = num(amount);
    if (!(a > 0)) return toast("اكتب مبلغ صحيح.");
    set(docKey, d => ({ ...(d || { budget: 0 }), items: [{ id: uid8(), type, amount: a, cat, note: note.trim(), date, ...(icons[cat] ? { ic: icons[cat] } : {}) }, ...((d && d.items) || [])] }));
    setSheet(null); setM(monthOf(date)); toast("اتسجّل ✓");
  };
  const del = id => { if (confirmDo("تمسح العملية دي؟")) set(docKey, d => ({ ...d, items: d.items.filter(i => i.id !== id) })); };
  const saveBudget = () => { const b = num(bud); set(docKey, d => ({ ...(d || { items: [] }), budget: b > 0 ? b : 0 })); setSheet(null); };
  const left = inc - exp;
  return h("div", { className: "fade" },
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
    byCat.length > 0 && h("div", { className: "card", style: { marginBottom: 10 } },
      h("div", { style: { fontWeight: 900, fontSize: 14, marginBottom: 10 } }, "المصروف حسب النوع"),
      byCat.map(([c, v]) => h("div", { key: c, style: { marginBottom: 9 } },
        h("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 } }, h("span", null, (icons[c] || catIcon(c, "exp")) + " " + c), h("span", { style: { color: "var(--muted)" } }, fmt(v, 0) + " • " + Math.round(v / exp * 100) + "%")),
        h(Bar, { pct: v / exp * 100 })))),
    h("div", { style: { display: "flex", gap: 8, marginBottom: 12 } },
      h("button", { className: "btn btn-primary", style: { flex: 1 }, onClick: () => openAdd("exp") }, "− مصروف"),
      h("button", { className: "btn btn-ghost", style: { flex: 1 }, onClick: () => openAdd("inc") }, "+ دخل")),
    byDay.length === 0 ? h(Empty, { icon: "💳", text: "مفيش عمليات في الشهر ده لسه.\nدوس على «مصروف» وابدأ." }) :
      byDay.map(([d, list]) => h("div", { key: d, style: { marginBottom: 12 } },
        h("div", { style: { fontSize: 12, color: "var(--muted)", fontWeight: 800, margin: "0 4px 6px" } }, dayLabel(d)),
        h("div", { className: "card", style: { padding: "4px 12px" } }, list.map((i, idx) => h("div", { key: i.id, style: { display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderTop: idx ? "1px solid var(--line)" : "none" } },
          h("span", { style: { fontSize: 20 } }, catIcon(i.cat, i.type, i.ic || icons[i.cat])),
          h("div", { style: { flex: 1, minWidth: 0 } }, h("div", { style: { fontWeight: 800, fontSize: 13 } }, i.cat), i.note && h("div", { style: { fontSize: 12, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, i.note)),
          h("div", { style: { fontWeight: 900, color: i.type === "inc" ? "var(--ok)" : "var(--text)" } }, (i.type === "inc" ? "+" : "−") + fmt(i.amount)),
          h("button", { onClick: () => del(i.id), "aria-label": "مسح", style: { background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 16, padding: 4 } }, "✕")))))),
    sheet === "add" && h(Sheet, { title: type === "inc" ? "إضافة دخل" : "إضافة مصروف", onClose: () => setSheet(null) },
      h("div", { style: { display: "flex", gap: 8, marginBottom: 12 } }, [["exp", "مصروف"], ["inc", "دخل"]].map(([k, l]) => h("button", { key: k, className: "chip" + (type === k ? " on" : ""), style: { flex: 1, padding: 9 }, onClick: () => { setType(k); setCat((k === "inc" ? INC_CATS : EXP_CATS)[0][1]); } }, l))),
      h(Field, { label: "المبلغ" }, h("input", { type: "number", inputMode: "decimal", value: amount, onChange: e => setAmount(e.target.value), placeholder: "0", autoFocus: true, style: { fontSize: 22, fontWeight: 900 } })),
      h(Field, { label: "النوع" }, h("div", { style: { display: "flex", flexWrap: "wrap", gap: 7 } }, (type === "inc" ? INC_CATS : EXP_CATS).concat(extraCats.filter(x => x[0] === type).map(x => [icons[x[1]] || "🧾", x[1]])).concat(cat && ![...EXP_CATS, ...INC_CATS].some(c => c[1] === cat) && !extraCats.some(x => x[1] === cat) ? [["🧾", cat]] : []).map(([ic, n]) => h("button", { key: n, type: "button", className: "chip" + (cat === n ? " on" : ""), onClick: () => setCat(n) }, ic + " " + n)).concat([h("button", { key: "__new", type: "button", className: "chip", onClick: addCat }, "➕ تصنيف جديد")]))),
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
  const update = fn => set("goals", d => ({ goals: fn(((d && d.goals) || [])) }));
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
  const [toast, toastNode] = useToast();
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
    set("weight", d => ({ entries: [...((d && d.entries) || []), { id: uid8(), date, kg: Math.round(k * 10) / 10, note: note.trim(), photo }] }));
    setBusy(false); setSheet(false); toast("اتسجّل ✓");
  };
  const del = id => { if (confirmDo("تمسح القياس ده؟ (الصورة هتفضل مخزّنة عندنا لكن مش هتظهر)")) { set("weight", d => ({ entries: d.entries.filter(e => e.id !== id) })); setView(null); } };
  const trendText = () => entries.slice(-12).map(e => e.date + ": " + e.kg + " كجم").join("\n");
  const baseRules = "اتكلم بالعامية المصرية بأسلوب لطيف ومشجّع من غير جلد للذات. ده مش تشخيص طبي ومتدّيش أرقام سعرات أو أدوية. خلّي الرد في حدود 6 أسطر ومقسّم لنقط قصيرة. في الآخر جملة قصيرة إن استشارة دكتور/أخصائي تغذية أهم لو في حالة صحية.";
  const analyzeTrend = async () => {
    if (entries.length < 2) return toast("سجّل قياسين على الأقل.");
    setAiBusy(true);
    try {
      const t = await askAI("أنا بتابع وزني. الطول: " + (prof.heightCm || "غير معروف") + " سم، الهدف: " + (goal || "غير محدد") + " كجم. القياسات:\n" + trendText() + "\nحلّل التقدّم، ووضّح الاتجاه، ونصيحة عملية بسيطة للأسبوع الجاي.\n" + baseRules);
      set("weight", d => ({ ...d, trendAi: { text: t, at: Date.now() } }));
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
      set("weight", d => ({ ...d, entries: d.entries.map(x => x.id === e.id ? { ...x, ai: t } : x) }));
      setView(v => v && v.id === e.id ? { ...v, ai: t } : v);
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
        h("button", { className: "btn btn-ghost", disabled: aiBusy, onClick: analyzeTrend, style: { padding: "7px 12px", fontSize: 13 } }, aiBusy ? "بيحلّل…" : doc.trendAi ? "حدّث" : "حلّل")),
      doc.trendAi && h("div", { style: { fontSize: 13, lineHeight: 2, marginTop: 10, whiteSpace: "pre-wrap" } }, doc.trendAi.text)),
    photos.length > 0 && h("div", { style: { marginBottom: 12 } },
      h("div", { style: { fontWeight: 900, fontSize: 14, marginBottom: 8 } }, "📸 صور التقدّم"),
      h("div", { style: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 } }, photos.map(e => h("button", { key: e.id, onClick: () => setView(e), style: { position: "relative", padding: 0, border: "1px solid var(--line)", borderRadius: 14, overflow: "hidden", background: "var(--card2)", aspectRatio: "3/4", cursor: "pointer" } },
        h("img", { src: e.photo.replace("/upload/", "/upload/w_300,q_auto/"), alt: "صورة " + e.date, loading: "lazy", style: { width: "100%", height: "100%", objectFit: "cover", display: "block", padding: 0, border: "none", borderRadius: 0 } }),
        h("span", { style: { position: "absolute", bottom: 0, insetInline: 0, background: "rgba(0,0,0,.55)", color: "#fff", fontSize: 11, fontWeight: 800, padding: "3px 0" } }, fmt(e.kg, 1) + " كجم"))))),
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
  return h("div", null,
    girl && h("div", { style: { display: "flex", gap: 8, marginBottom: 12 } }, [["exp", "💳 المصروفات"], ["period", "🩸 متابعة الدورة"]].map(([k, l]) => h("button", { key: k, className: "chip" + (tab === k ? " on" : ""), style: { flex: 1, padding: 9 }, onClick: () => setTab(k) }, l))),
    girl && tab === "period" ? h(PeriodTracker, { docKey: "period_family" }) : h(ExpensesModule, { docKey: "family", who: prof.familyName || "" }));
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
  const applyData = async (data, patch, label) => {
    const keys = Object.keys(data || {}).filter(k => /^[a-z][a-z0-9_]{0,40}$/.test(k));
    if (!keys.length) return toast("النسخة دي فاضية.");
    if (!confirmDo("هتتبدّل بيانات (" + keys.length + " قسم) ببيانات " + label + ". هنعمل نسخة أمان قبلها تقدر ترجع لها. تكمل؟")) return;
    setBusy(true);
    try {
      await writeSnap(user, all(), "-pre");
      keys.forEach(k => set(k, data[k]));
      if (patch) set("profile", p => ({ ...(p || {}), ...patch }));
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
    await applyData(bk.data, bk.profile_patch, "الملف");
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
  const toggle = id => { const n = mods.includes(id) ? mods.filter(x => x !== id) : [...mods, id]; if (!n.length) return toast("لازم قسم واحد على الأقل."); setProf({ ...prof, modules: n }); };
  const saveInfo = () => {
    let nm = mods;
    if (gender === "f" && !nm.includes("period")) nm = [...nm, "period"];
    if (gender !== "f") nm = nm.filter(x => x !== "period");
    if (!nm.length) nm = ["expenses"];
    setProf({ ...prof, name: name.trim() || prof.name, gender, modules: nm, familyName: family.trim(), familyGender: famG, carName: car.trim(), ride, monthStartDay: clamp(parseInt(startDay) || 1, 1, 28), heightCm: num(height) || null, goalKg: num(goal) || null }); toast("اتحفظ ✓");
  };
  const wipeAll = async () => { if (confirmDo("هتمسح كل بياناتك من الجهاز والسحابة نهائيًا (وكل النسخ الاحتياطية كمان). متأكد؟") && confirmDo("آخر تأكيد: مفيش رجوع.")) { await wipe(); location.reload(); } };
  const sec = t => h("div", { style: { fontWeight: 900, fontSize: 14, margin: "16px 0 8px" } }, t);
  const pick = (val, cur, set, label) => h("button", { type: "button", className: "chip" + (cur === val ? " on" : ""), style: { flex: 1, padding: 10 }, onClick: () => set(val) }, label);
  return h("div", { className: "fade" },
    h("div", { className: "card", style: { marginBottom: 4 } },
      h("div", { style: { fontSize: 12, color: "var(--muted)" } }, "الحساب"), h("div", { style: { fontWeight: 800, direction: "ltr", textAlign: "right" } }, user.email)),
    sec("بياناتك"),
    h("div", { className: "card" },
      h(Field, { label: "الاسم" }, h("input", { value: name, onChange: e => setName(e.target.value), maxLength: 40 })),
      h(Field, { label: "أنا" }, h("div", { style: { display: "flex", gap: 8 } }, pick("m", gender, setGender, "👨 ولد"), pick("f", gender, setGender, "👩 بنت"))),
      h(Field, { label: "اسم الفرد (ميزانية العائلة)" }, h("input", { value: family, onChange: e => setFamily(e.target.value), maxLength: 30 })),
      h(Field, { label: "الفرد ده" }, h("div", { style: { display: "flex", gap: 8 } }, pick("m", famG, setFamG, "👦 ولد"), pick("f", famG, setFamG, "👧 بنت"))),
      h(Field, { label: "العربية" }, h("input", { value: car, onChange: e => setCar(e.target.value), maxLength: 40 })),
      h(Field, { label: "بشتغل بالعربية في النقل الذكي (إندرايف / أوبر)" }, h("div", { style: { display: "flex", gap: 8 } }, pick(true, ride, setRide, "أيوه"), pick(false, ride, setRide, "لأ"))),
      h(Field, { label: "الشهر المالي بيبدأ يوم", hint: "1 = الشهر العادي. لو مرتبك بينزل يوم 25 مثلاً اكتب 25، وكل شهر هيتحسب من 25 لـ 24 (في المصروفات والعربية)." }, h("input", { type: "number", inputMode: "numeric", min: 1, max: 28, value: startDay, onChange: e => setStartDay(e.target.value) })),
      h("div", { style: { display: "flex", gap: 10 } },
        h("div", { style: { flex: 1 } }, h(Field, { label: "الطول (سم)" }, h("input", { type: "number", inputMode: "decimal", value: height, onChange: e => setHeight(e.target.value) }))),
        h("div", { style: { flex: 1 } }, h(Field, { label: "الوزن المستهدف" }, h("input", { type: "number", inputMode: "decimal", value: goal, onChange: e => setGoal(e.target.value) })))),
      h("button", { className: "btn btn-primary", style: { width: "100%" }, onClick: saveInfo }, "حفظ")),
    sec("الأقسام"),
    h("div", { className: "card", style: { display: "flex", flexWrap: "wrap", gap: 8 } }, modsFor(prof).map(m => h("button", { key: m.id, className: "chip" + (mods.includes(m.id) ? " on" : ""), onClick: () => toggle(m.id) }, m.icon + " " + modTitle(m.id, prof))),
      h("div", { style: { fontSize: 11, color: "var(--muted)", width: "100%" } }, "إخفاء قسم مابيمسحش بياناته.")),
    sec("المظهر"),
    h("div", { style: { display: "flex", gap: 8 } }, [["dark", "🌙 داكن"], ["light", "☀️ فاتح"]].map(([k, l]) => h("button", { key: k, className: "chip" + (theme === k ? " on" : ""), onClick: () => setTheme(k) }, l))),
    sec("نسخك الاحتياطية"),
    h(BackupPanel, {}),
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
  useEffect(() => { const p = e => setScreen((e.state && e.state.s) || "home"); window.addEventListener("popstate", p); history.replaceState({ s: screen }, ""); return () => window.removeEventListener("popstate", p); }, []);
  const go = s => { history.pushState({ s }, ""); setScreen(s); window.scrollTo(0, 0); };
  const back = () => history.back();
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
  if (!prof.onboarded) return h(Onboarding, { defaultName: (user.user_metadata && user.user_metadata.name) || "", onDone: p => setProf(p) });
  const mods = (prof.modules || []).filter(id => modsFor(prof).some(m => m.id === id));
  const valid = screen === "home" || screen === "settings" || mods.includes(screen);
  const cur = valid ? screen : "home";
  let body;
  if (cur === "home") {
    const hr = new Date().getHours();
    const greet = hr < 5 ? "سهران؟" : hr < 12 ? "صباح الخير" : hr < 18 ? "نهارك سعيد" : "مساء الخير";
    body = h("div", { className: "fade" },
      h("div", { style: { margin: "6px 2px 18px" } }, h("div", { style: { fontSize: 13, color: "var(--muted)", fontWeight: 700 } }, greet), h("div", { style: { fontSize: 26, fontWeight: 900 } }, prof.name || "")),
      h("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 } }, mods.map(id => {
        const m = MODULES.find(x => x.id === id);
        return h("button", { key: id, onClick: () => go(id), className: "card", style: { textAlign: "right", cursor: "pointer", padding: 16, minHeight: 120, display: "flex", flexDirection: "column", justifyContent: "space-between", color: "var(--text)" } },
          h("span", { style: { fontSize: 32 } }, m.icon), h("span", { style: { fontWeight: 900, fontSize: 15, lineHeight: 1.5 } }, modTitle(id, prof)));
      })),
      SOON.length > 0 && h("div", { style: { marginTop: 18, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", color: "var(--muted)", fontSize: 12 } }, h("span", null, "قريبًا:"), SOON.map(s => h("span", { key: s.title, className: "chip", style: { opacity: .6, cursor: "default" } }, s.icon + " " + s.title))));
  } else if (cur === "settings") body = h(SettingsScreen, { prof, setProf, theme, setTheme, onLogout: async () => { await flush(); await sb.auth.signOut(); } });
  else if (cur === "expenses") body = h(ExpensesModule, { docKey: "expenses", who: "" });
  else if (cur === "family") body = h(FamilyModule, { prof });
  else if (cur === "period") body = h(PeriodTracker, { docKey: "period" });
  else if (cur === "goals") body = h(GoalsModule, {});
  else if (cur === "car") body = h(CarModule, { prof });
  else if (cur === "weight") body = h(WeightModule, { prof });
  else if (cur === "meals") body = h(MealsModule, {});
  else if (cur === "athkar") body = h(AthkarModule, { user });
  const title = cur === "home" ? APP_NAME : cur === "settings" ? "الإعدادات" : modTitle(cur, prof);
  const syncTxt = sync === "saving" ? "⏳" : sync === "error" ? "⚠️" : sync === "offline" ? "📴" : "☁️";
  return h("div", { style: { maxWidth: 520, margin: "0 auto", padding: "0 14px calc(40px + env(safe-area-inset-bottom))" } },
    h("header", { id: "app-top-header", style: { position: "sticky", top: 0, zIndex: 20, background: "var(--bg)", display: "flex", alignItems: "center", gap: 10, padding: "calc(12px + env(safe-area-inset-top)) 0 10px" } },
      cur !== "home" ? h("button", { className: "btn btn-ghost", onClick: back, "aria-label": "رجوع", style: { padding: "6px 13px" } }, "→") : h("img", { src: "icon-192.png", alt: "", width: 34, height: 34, style: { borderRadius: 10 } }),
      h("div", { style: { flex: 1, fontWeight: 900, fontSize: 18 } }, title),
      h("span", { title: sync === "error" ? "في تعديلات لسه ماتحفظتش على السحابة" : "", onClick: () => flush(), style: { fontSize: 15, cursor: "pointer" } }, syncTxt),
      cur !== "settings" && h("button", { className: "btn btn-ghost", onClick: () => go("settings"), "aria-label": "الإعدادات", style: { padding: "6px 11px" } }, "⚙️")),
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
