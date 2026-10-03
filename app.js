// ══════════════════════════════════════════════════════════════
// مسار — تطبيق شخصي: مصروفات، أهداف مالية، عربية، فرد من العائلة، وزن وتخسيس
// كل مستخدم بحسابه (إيميل + باسورد)، وبياناته محمية في السحابة بسياسات RLS.
// ══════════════════════════════════════════════════════════════
const SUPABASE_URL = "https://nkcfosifswvaoqlfliww.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rY2Zvc2lmc3d2YW9xbGZsaXd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2NjY3ODksImV4cCI6MjA5NzI0Mjc4OX0.mKg8mXOrfDayAKuGGm9GzU-F2jnONp8hb0tJ9XmsMCI"; // مفتاح anon العام (مش سر) — الحماية الحقيقية من سياسات RLS
const AI_URL = "https://masar-ai.mohamedhossamomara01.workers.dev/ai"; // الـ Worker بتاع الذكاء الاصطناعي (شوف README)
const CLD_CLOUD = "tpzkvsa6";
const CLD_PRESET = "Mohamed";
const APP_NAME = "All In One";        // ← اسم التطبيق (غيّره هنا + في index.html و manifest.json)

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

// ── أدوات صغيرة ─────────────────────────────────────────────
const uid8 = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
const pad = n => String(n).padStart(2, "0");
const todayStr = () => { const d = new Date(); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); };
const monthOf = ds => ds.slice(0, 7);
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
  const lsKey = k => "masar:" + user.id + ":" + k;
  const [docs, setDocs] = useState(null);       // null = لسه بيحمّل
  const [sync, setSync] = useState("idle");     // idle | saving | error | offline
  const docsRef = useRef({});
  const timers = useRef({});
  const dirtyKey = "masar:" + user.id + ":__dirty";

  const flush = useCallback(async () => {
    const dirty = lsGet(dirtyKey, []);
    if (!dirty.length) return;
    setSync("saving");
    const left = [];
    for (const k of dirty) {
      const v = docsRef.current[k];
      if (v === undefined) continue;
      const { error } = await sb.from("masar_data").upsert({ user_id: user.id, key: k, value: v, updated_at: new Date().toISOString() }, { onConflict: "user_id,key" });
      if (error) left.push(k);
    }
    lsSet(dirtyKey, left);
    setSync(left.length ? (navigator.onLine ? "error" : "offline") : "idle");
  }, [user.id]);

  useEffect(() => {
    let dead = false;
    // 1) من الكاش المحلي فورًا
    const cached = lsGet("masar:" + user.id + ":__all", null);
    if (cached) { docsRef.current = cached; setDocs(cached); }
    // 2) من السحابة
    (async () => {
      const { data, error } = await sb.from("masar_data").select("key,value").eq("user_id", user.id);
      if (dead) return;
      if (error) { if (!cached) { docsRef.current = {}; setDocs({}); } setSync(navigator.onLine ? "error" : "offline"); return; }
      const dirty = lsGet(dirtyKey, []);
      const merged = {};
      (data || []).forEach(r => { merged[r.key] = r.value; });
      dirty.forEach(k => { if (docsRef.current[k] !== undefined) merged[k] = docsRef.current[k]; }); // التعديلات اللي لسه ماتبعتتش بتفضل
      docsRef.current = merged; setDocs(merged); lsSet("masar:" + user.id + ":__all", merged);
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
    lsSet("masar:" + user.id + ":__all", docsRef.current);
    const dirty = new Set(lsGet(dirtyKey, [])); dirty.add(k); lsSet(dirtyKey, [...dirty]);
    clearTimeout(timers.current[k]);
    timers.current[k] = setTimeout(flush, 700);
  }, [user.id, flush]);
  const wipe = useCallback(async () => {
    await sb.from("masar_data").delete().eq("user_id", user.id);
    docsRef.current = {}; setDocs({}); lsSet("masar:" + user.id + ":__all", {}); lsSet(dirtyKey, []);
  }, [user.id]);

  if (docs === null) return h(Splash, { text: "بنجهّز بياناتك…" });
  return h(DataCtx.Provider, { value: { get, set, wipe, sync, flush, user } }, children);
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
      mode !== "reset" && h(Field, { label: "كلمة السر", hint: mode === "up" ? "٨ حروف على الأقل." : null }, h("input", { type: "password", dir: "ltr", value: pw, onChange: e => setPw(e.target.value), autoComplete: mode === "in" ? "current-password" : "new-password" })),
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
  { id: "family", icon: "👨‍👩‍👧", title: "ميزانية فرد من العائلة", desc: "مصاريف شخص بعينه (زوجة، ابن…) في ميزانية منفصلة." },
  { id: "goals", icon: "🎯", title: "أهدافي المالية", desc: "حوّش لهدف (عربية، جواز، سفر…) وتابع التقدّم." },
  { id: "car", icon: "🚗", title: "عربيتي", desc: "بنزين وصيانة وغسيل، وتكلفة الكيلومتر." },
  { id: "weight", icon: "⚖️", title: "وزني وتخسيسي", desc: "تابع وزنك وصورك، وحلّل تقدّمك بالذكاء الاصطناعي." },
  { id: "meals", icon: "🍽️", title: "تنظيم الوجبات", desc: "جدول أسبوعي لأكلك، مع حساب سعرات تقريبي وخطة أكل بالذكاء الاصطناعي." },
  { id: "athkar", icon: "📿", title: "الأذكار والمصحف", desc: "أذكار الصباح والمساء، المصحف بالصوت والتفسير، السبحة، والأدعية." }
];
const SOON = [];
const modTitle = (id, prof) => id === "family" ? (prof.familyName ? "ميزانية " + prof.familyName : "ميزانية العائلة") : (MODULES.find(m => m.id === id) || {}).title;

// ══════════════════════════════════════════════════════════════
// أسئلة البداية (Onboarding)
// ══════════════════════════════════════════════════════════════
function Onboarding({ onDone, defaultName }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState(defaultName || "");
  const [mods, setMods] = useState(["expenses"]);
  const [family, setFamily] = useState("");
  const [car, setCar] = useState("");
  const [height, setHeight] = useState("");
  const [goalKg, setGoalKg] = useState("");
  const toggle = id => setMods(m => m.includes(id) ? m.filter(x => x !== id) : [...m, id]);
  const needs = [mods.includes("family"), mods.includes("car"), mods.includes("weight")].some(Boolean);
  const finish = () => onDone({ name: name.trim(), modules: mods, familyName: family.trim(), carName: car.trim(), heightCm: num(height) || null, goalKg: num(goalKg) || null, onboarded: true, createdAt: Date.now() });
  const total = needs ? 3 : 2;
  const dots = h("div", { style: { display: "flex", gap: 6, justifyContent: "center", marginBottom: 18 } }, Array.from({ length: total }).map((_, i) => h("div", { key: i, style: { width: i === step ? 26 : 8, height: 8, borderRadius: 9, background: i <= step ? "var(--accent)" : "var(--line)", transition: "all .25s" } })));
  let body;
  if (step === 0) body = h("div", { className: "fade" },
    h("div", { style: { fontSize: 24, fontWeight: 900, marginBottom: 6 } }, "أهلاً بيك 👋"),
    h("div", { style: { color: "var(--muted)", fontSize: 13, lineHeight: 1.9, marginBottom: 18 } }, "هنسألك كام سؤال سريع عشان نجهّز All In One على مقاسك. تقدر تغيّر أي حاجة بعدين."),
    h(Field, { label: "اسمك إيه؟" }, h("input", { value: name, onChange: e => setName(e.target.value), placeholder: "اسمك", maxLength: 40, autoFocus: true })),
    h("button", { className: "btn btn-primary", style: { width: "100%" }, disabled: !name.trim(), onClick: () => setStep(1) }, "التالي"));
  else if (step === 1) body = h("div", { className: "fade" },
    h("div", { style: { fontSize: 20, fontWeight: 900, marginBottom: 6 } }, "إيه اللي محتاجه؟"),
    h("div", { style: { color: "var(--muted)", fontSize: 13, marginBottom: 14 } }, "اختار الأقسام اللي تهمّك (واحد على الأقل)."),
    h("div", { style: { display: "grid", gap: 9, marginBottom: 12 } }, MODULES.map(m => {
      const on = mods.includes(m.id);
      return h("button", { key: m.id, onClick: () => toggle(m.id), "aria-pressed": on, style: { display: "flex", alignItems: "center", gap: 12, textAlign: "right", background: on ? "var(--card2)" : "var(--card)", border: "1.5px solid " + (on ? "var(--accent)" : "var(--line)"), borderRadius: 16, padding: "12px 13px", cursor: "pointer" } },
        h("span", { style: { fontSize: 26 } }, m.icon),
        h("span", { style: { flex: 1 } }, h("div", { style: { fontWeight: 900, fontSize: 14 } }, m.title), h("div", { style: { fontSize: 12, color: "var(--muted)", marginTop: 2, lineHeight: 1.7 } }, m.desc)),
        h("span", { style: { width: 22, height: 22, borderRadius: 7, border: "2px solid " + (on ? "var(--accent)" : "var(--line)"), background: on ? "var(--accent)" : "transparent", color: "var(--accent-ink)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 14 } }, on ? "✓" : ""));
    })),
    SOON.length > 0 && h("div", { style: { fontSize: 12, color: "var(--muted)", marginBottom: 14, lineHeight: 1.8 } }, "قريبًا: " + SOON.map(s => s.icon + " " + s.title).join("  •  ")),
    h("div", { style: { display: "flex", gap: 8 } },
      h("button", { className: "btn btn-ghost", onClick: () => setStep(0) }, "رجوع"),
      h("button", { className: "btn btn-primary", style: { flex: 1 }, disabled: !mods.length, onClick: () => needs ? setStep(2) : finish() }, needs ? "التالي" : "يلا نبدأ")));
  else body = h("div", { className: "fade" },
    h("div", { style: { fontSize: 20, fontWeight: 900, marginBottom: 14 } }, "كام تفصيلة كمان"),
    mods.includes("family") && h(Field, { label: "اسم الفرد (للميزانية المنفصلة)" }, h("input", { value: family, onChange: e => setFamily(e.target.value), placeholder: "مثلاً: ضحي", maxLength: 30 })),
    mods.includes("car") && h(Field, { label: "اسم/نوع عربيتك (اختياري)" }, h("input", { value: car, onChange: e => setCar(e.target.value), placeholder: "مثلاً: هيونداي النترا", maxLength: 40 })),
    mods.includes("weight") && h("div", { style: { display: "flex", gap: 10 } },
      h("div", { style: { flex: 1 } }, h(Field, { label: "طولك (سم)" }, h("input", { type: "number", inputMode: "decimal", value: height, onChange: e => setHeight(e.target.value), placeholder: "175" }))),
      h("div", { style: { flex: 1 } }, h(Field, { label: "وزنك المستهدف (كجم)" }, h("input", { type: "number", inputMode: "decimal", value: goalKg, onChange: e => setGoalKg(e.target.value), placeholder: "80" })))),
    h("div", { style: { display: "flex", gap: 8, marginTop: 6 } },
      h("button", { className: "btn btn-ghost", onClick: () => setStep(1) }, "رجوع"),
      h("button", { className: "btn btn-primary", style: { flex: 1 }, onClick: finish }, "يلا نبدأ")));
  return h("div", { style: { minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: "24px 18px", maxWidth: 480, margin: "0 auto" } }, dots, h("div", { className: "card", style: { padding: 18 } }, body));
}

// ══════════════════════════════════════════════════════════════
// المصروفات (بتتستخدم كمان لميزانية فرد من العائلة بمفتاح بيانات مختلف)
// ══════════════════════════════════════════════════════════════
const EXP_CATS = [["🛒", "أكل وسوبر ماركت"], ["🏠", "البيت والفواتير"], ["🚗", "مواصلات"], ["💊", "صحة"], ["👕", "ملابس"], ["🎓", "تعليم"], ["🎉", "ترفيه"], ["🎁", "هدايا"], ["📱", "اتصالات ونت"], ["🧾", "أخرى"]];
const INC_CATS = [["💼", "مرتب"], ["➕", "دخل إضافي"], ["🎁", "هدية"], ["💵", "أخرى"]];
const catIcon = (cat, type) => ((type === "inc" ? INC_CATS : EXP_CATS).find(c => c[1] === cat) || ["🧾"])[0];

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
  const openAdd = t => { setType(t); setAmount(""); setNote(""); setDate(todayStr()); setCat((t === "inc" ? INC_CATS : EXP_CATS)[0][1]); setSheet("add"); };
  const save = () => {
    const a = num(amount);
    if (!(a > 0)) return toast("اكتب مبلغ صحيح.");
    set(docKey, d => ({ ...(d || { budget: 0 }), items: [{ id: uid8(), type, amount: a, cat, note: note.trim(), date }, ...((d && d.items) || [])] }));
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
        h("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 } }, h("span", null, catIcon(c, "exp") + " " + c), h("span", { style: { color: "var(--muted)" } }, fmt(v, 0) + " • " + Math.round(v / exp * 100) + "%")),
        h(Bar, { pct: v / exp * 100 })))),
    h("div", { style: { display: "flex", gap: 8, marginBottom: 12 } },
      h("button", { className: "btn btn-primary", style: { flex: 1 }, onClick: () => openAdd("exp") }, "− مصروف"),
      h("button", { className: "btn btn-ghost", style: { flex: 1 }, onClick: () => openAdd("inc") }, "+ دخل")),
    byDay.length === 0 ? h(Empty, { icon: "💳", text: "مفيش عمليات في الشهر ده لسه.\nدوس على «مصروف» وابدأ." }) :
      byDay.map(([d, list]) => h("div", { key: d, style: { marginBottom: 12 } },
        h("div", { style: { fontSize: 12, color: "var(--muted)", fontWeight: 800, margin: "0 4px 6px" } }, dayLabel(d)),
        h("div", { className: "card", style: { padding: "4px 12px" } }, list.map((i, idx) => h("div", { key: i.id, style: { display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderTop: idx ? "1px solid var(--line)" : "none" } },
          h("span", { style: { fontSize: 20 } }, catIcon(i.cat, i.type)),
          h("div", { style: { flex: 1, minWidth: 0 } }, h("div", { style: { fontWeight: 800, fontSize: 13 } }, i.cat), i.note && h("div", { style: { fontSize: 12, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, i.note)),
          h("div", { style: { fontWeight: 900, color: i.type === "inc" ? "var(--ok)" : "var(--text)" } }, (i.type === "inc" ? "+" : "−") + fmt(i.amount)),
          h("button", { onClick: () => del(i.id), "aria-label": "مسح", style: { background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 16, padding: 4 } }, "✕")))))),
    sheet === "add" && h(Sheet, { title: type === "inc" ? "إضافة دخل" : "إضافة مصروف", onClose: () => setSheet(null) },
      h("div", { style: { display: "flex", gap: 8, marginBottom: 12 } }, [["exp", "مصروف"], ["inc", "دخل"]].map(([k, l]) => h("button", { key: k, className: "chip" + (type === k ? " on" : ""), style: { flex: 1, padding: 9 }, onClick: () => { setType(k); setCat((k === "inc" ? INC_CATS : EXP_CATS)[0][1]); } }, l))),
      h(Field, { label: "المبلغ" }, h("input", { type: "number", inputMode: "decimal", value: amount, onChange: e => setAmount(e.target.value), placeholder: "0", autoFocus: true, style: { fontSize: 22, fontWeight: 900 } })),
      h(Field, { label: "النوع" }, h("div", { style: { display: "flex", flexWrap: "wrap", gap: 7 } }, (type === "inc" ? INC_CATS : EXP_CATS).map(([ic, n]) => h("button", { key: n, type: "button", className: "chip" + (cat === n ? " on" : ""), onClick: () => setCat(n) }, ic + " " + n)))),
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
// العربية
// ══════════════════════════════════════════════════════════════
const CAR_TYPES = [["⛽", "بنزين"], ["🔧", "صيانة"], ["🧼", "غسيل"], ["📄", "رخصة / تأمين"], ["🧾", "أخرى"]];
function CarModule({ prof }) {
  const { get, set } = useData();
  const doc = get("car", { logs: [] });
  const logs = doc.logs || [];
  const [m, setM] = useState(monthOf(todayStr()));
  const [sheet, setSheet] = useState(false);
  const [type, setType] = useState("بنزين"); const [cost, setCost] = useState(""); const [km, setKm] = useState(""); const [liters, setLiters] = useState(""); const [note, setNote] = useState(""); const [date, setDate] = useState(todayStr());
  const [toast, toastNode] = useToast();
  const mLogs = logs.filter(l => monthOf(l.date) === m).sort((a, b) => b.date.localeCompare(a.date));
  const monthCost = mLogs.reduce((s, l) => s + l.cost, 0);
  const fuelMonth = mLogs.filter(l => l.type === "بنزين").reduce((s, l) => s + l.cost, 0);
  const withKm = logs.filter(l => l.km > 0).sort((a, b) => a.km - b.km);
  const dist = withKm.length >= 2 ? withKm[withKm.length - 1].km - withKm[0].km : 0;
  const totalAll = logs.reduce((s, l) => s + l.cost, 0);
  const perKm = dist > 0 ? totalAll / dist : null;
  const lastKm = withKm.length ? withKm[withKm.length - 1].km : null;
  const save = () => {
    const c = num(cost);
    if (!(c > 0)) return toast("اكتب التكلفة.");
    set("car", d => ({ logs: [{ id: uid8(), type, cost: c, km: num(km) > 0 ? num(km) : 0, liters: num(liters) > 0 ? num(liters) : 0, note: note.trim(), date }, ...((d && d.logs) || [])] }));
    setSheet(false); setM(monthOf(date)); toast("اتسجّل ✓");
  };
  const del = id => { if (confirmDo("تمسح السجل ده؟")) set("car", d => ({ logs: d.logs.filter(l => l.id !== id) })); };
  const icon = t => (CAR_TYPES.find(c => c[1] === t) || ["🧾"])[0];
  return h("div", { className: "fade" },
    prof.carName && h("div", { style: { fontSize: 13, color: "var(--muted)", marginBottom: 8, fontWeight: 700 } }, "🚘 " + prof.carName),
    h("div", { style: { display: "flex", gap: 8, marginBottom: 10 } },
      h(Stat, { label: "تكلفة الشهر", value: fmt(monthCost, 0), sub: "بنزين " + fmt(fuelMonth, 0) }),
      h(Stat, { label: "عدّاد آخر قراءة", value: lastKm ? fmt(lastKm, 0) : "—", sub: perKm ? "≈ " + fmt(perKm, 2) + " للكم" : "سجّل قراءات العدّاد" })),
    h("button", { className: "btn btn-primary", style: { width: "100%", marginBottom: 12 }, onClick: () => { setType("بنزين"); setCost(""); setKm(""); setLiters(""); setNote(""); setDate(todayStr()); setSheet(true); } }, "+ تسجيل جديد"),
    h(MonthNav, { m, setM }),
    mLogs.length === 0 ? h(Empty, { icon: "🚗", text: "مفيش سجلات في الشهر ده." }) :
      h("div", { className: "card", style: { padding: "4px 12px" } }, mLogs.map((l, idx) => h("div", { key: l.id, style: { display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderTop: idx ? "1px solid var(--line)" : "none" } },
        h("span", { style: { fontSize: 20 } }, icon(l.type)),
        h("div", { style: { flex: 1, minWidth: 0 } }, h("div", { style: { fontWeight: 800, fontSize: 13 } }, l.type + " • " + dayLabel(l.date)), h("div", { style: { fontSize: 12, color: "var(--muted)" } }, [l.km ? fmt(l.km, 0) + " كم" : "", l.liters ? fmt(l.liters, 1) + " لتر" : "", l.note].filter(Boolean).join(" • "))),
        h("div", { style: { fontWeight: 900 } }, fmt(l.cost)),
        h("button", { onClick: () => del(l.id), "aria-label": "مسح", style: { background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 16, padding: 4 } }, "✕")))),
    sheet && h(Sheet, { title: "تسجيل جديد", onClose: () => setSheet(false) },
      h(Field, { label: "النوع" }, h("div", { style: { display: "flex", flexWrap: "wrap", gap: 7 } }, CAR_TYPES.map(([ic, n]) => h("button", { key: n, type: "button", className: "chip" + (type === n ? " on" : ""), onClick: () => setType(n) }, ic + " " + n)))),
      h(Field, { label: "التكلفة" }, h("input", { type: "number", inputMode: "decimal", value: cost, onChange: e => setCost(e.target.value), autoFocus: true, style: { fontSize: 22, fontWeight: 900 } })),
      h("div", { style: { display: "flex", gap: 10 } },
        h("div", { style: { flex: 1 } }, h(Field, { label: "قراءة العدّاد (كم)" }, h("input", { type: "number", inputMode: "decimal", value: km, onChange: e => setKm(e.target.value) }))),
        type === "بنزين" && h("div", { style: { flex: 1 } }, h(Field, { label: "اللترات" }, h("input", { type: "number", inputMode: "decimal", value: liters, onChange: e => setLiters(e.target.value) })))),
      h(Field, { label: "ملاحظة" }, h("input", { value: note, onChange: e => setNote(e.target.value), maxLength: 80 })),
      h(Field, { label: "التاريخ" }, h("input", { type: "date", value: date, onChange: e => setDate(e.target.value) })),
      h("button", { className: "btn btn-primary", style: { width: "100%" }, onClick: save }, "حفظ")),
    toastNode);
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
  const fd = new FormData(); fd.append("file", blob); fd.append("upload_preset", CLD_PRESET); fd.append("folder", "masar");
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
function SettingsScreen({ prof, setProf, theme, setTheme, onLogout }) {
  const { user, wipe, get } = useData();
  const [toast, toastNode] = useToast();
  const [name, setName] = useState(prof.name || ""); const [family, setFamily] = useState(prof.familyName || ""); const [car, setCar] = useState(prof.carName || "");
  const [height, setHeight] = useState(prof.heightCm || ""); const [goal, setGoal] = useState(prof.goalKg || "");
  const mods = prof.modules || [];
  const toggle = id => { const n = mods.includes(id) ? mods.filter(x => x !== id) : [...mods, id]; if (!n.length) return toast("لازم قسم واحد على الأقل."); setProf({ ...prof, modules: n }); };
  const saveInfo = () => { setProf({ ...prof, name: name.trim() || prof.name, familyName: family.trim(), carName: car.trim(), heightCm: num(height) || null, goalKg: num(goal) || null }); toast("اتحفظ ✓"); };
  const exportJson = () => {
    const out = {}; ["profile", "expenses", "family", "goals", "car", "weight", "meals", "athkar_prefs"].forEach(k => { const v = get(k, undefined); if (v !== undefined) out[k] = v; });
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([JSON.stringify(out, null, 2)], { type: "application/json" })); a.download = "masar-backup-" + todayStr() + ".json"; a.click();
  };
  const wipeAll = async () => { if (confirmDo("هتمسح كل بياناتك من الجهاز والسحابة نهائيًا. متأكد؟") && confirmDo("آخر تأكيد: مفيش رجوع.")) { await wipe(); location.reload(); } };
  const sec = t => h("div", { style: { fontWeight: 900, fontSize: 14, margin: "16px 0 8px" } }, t);
  return h("div", { className: "fade" },
    h("div", { className: "card", style: { marginBottom: 4 } },
      h("div", { style: { fontSize: 12, color: "var(--muted)" } }, "الحساب"), h("div", { style: { fontWeight: 800, direction: "ltr", textAlign: "right" } }, user.email)),
    sec("بياناتك"),
    h("div", { className: "card" },
      h(Field, { label: "الاسم" }, h("input", { value: name, onChange: e => setName(e.target.value), maxLength: 40 })),
      h(Field, { label: "اسم الفرد (ميزانية العائلة)" }, h("input", { value: family, onChange: e => setFamily(e.target.value), maxLength: 30 })),
      h(Field, { label: "العربية" }, h("input", { value: car, onChange: e => setCar(e.target.value), maxLength: 40 })),
      h("div", { style: { display: "flex", gap: 10 } },
        h("div", { style: { flex: 1 } }, h(Field, { label: "الطول (سم)" }, h("input", { type: "number", inputMode: "decimal", value: height, onChange: e => setHeight(e.target.value) }))),
        h("div", { style: { flex: 1 } }, h(Field, { label: "الوزن المستهدف" }, h("input", { type: "number", inputMode: "decimal", value: goal, onChange: e => setGoal(e.target.value) })))),
      h("button", { className: "btn btn-primary", style: { width: "100%" }, onClick: saveInfo }, "حفظ")),
    sec("الأقسام"),
    h("div", { className: "card", style: { display: "flex", flexWrap: "wrap", gap: 8 } }, MODULES.map(m => h("button", { key: m.id, className: "chip" + (mods.includes(m.id) ? " on" : ""), onClick: () => toggle(m.id) }, m.icon + " " + modTitle(m.id, prof))),
      h("div", { style: { fontSize: 11, color: "var(--muted)", width: "100%" } }, "إخفاء قسم مابيمسحش بياناته.")),
    sec("المظهر"),
    h("div", { style: { display: "flex", gap: 8 } }, [["dark", "🌙 داكن"], ["light", "☀️ فاتح"]].map(([k, l]) => h("button", { key: k, className: "chip" + (theme === k ? " on" : ""), onClick: () => setTheme(k) }, l))),
    sec("بياناتك"),
    h("div", { style: { display: "grid", gap: 8 } },
      h("button", { className: "btn btn-ghost", onClick: exportJson }, "⬇️ نسخة احتياطية (JSON)"),
      h("button", { className: "btn btn-ghost", onClick: onLogout }, "تسجيل الخروج"),
      h("button", { className: "btn btn-danger", onClick: wipeAll }, "مسح كل بياناتي")),
    toastNode);
}

// ══════════════════════════════════════════════════════════════
// الهيكل الرئيسي
// ══════════════════════════════════════════════════════════════
function Shell({ user }) {
  const { get, set, sync, flush } = useData();
  const prof = get("profile", {});
  const setProf = p => set("profile", p);
  const [theme, setThemeS] = useState(lsGet("masar:theme", "light"));
  const setTheme = t => { setThemeS(t); lsSet("masar:theme", t); };
  useEffect(() => { document.documentElement.setAttribute("data-theme", theme); const m = document.querySelector('meta[name="theme-color"]'); if (m) m.content = theme === "dark" ? "#0d2326" : "#fef7e5"; }, [theme]);
  const [screen, setScreen] = useState(history.state && history.state.s || "home");
  useEffect(() => { const p = e => setScreen((e.state && e.state.s) || "home"); window.addEventListener("popstate", p); history.replaceState({ s: screen }, ""); return () => window.removeEventListener("popstate", p); }, []);
  const go = s => { history.pushState({ s }, ""); setScreen(s); window.scrollTo(0, 0); };
  const back = () => history.back();
  if (!prof.onboarded) return h(Onboarding, { defaultName: (user.user_metadata && user.user_metadata.name) || "", onDone: p => setProf(p) });
  const mods = (prof.modules || []).filter(id => MODULES.some(m => m.id === id));
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
  else if (cur === "family") body = h(ExpensesModule, { docKey: "family", who: prof.familyName || "" });
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
  useEffect(() => { document.documentElement.setAttribute("data-theme", lsGet("masar:theme", "light")); }, []);
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
    h(Field, { label: "الباسورد الجديد" }, h("input", { type: "password", value: pw, onChange: e => setPw(e.target.value), autoFocus: true })),
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
  const MA = window.MasarAthkar;
  const ready = useRef(false);
  if (MA && !ready.current) {
    ready.current = true;
    MA.init(user.id, { all: () => get("athkar_prefs", {}), set: (k, v) => set("athkar_prefs", d => ({ ...(d || {}), [k]: v })) });
  }
  if (!MA) return h(Empty, { icon: "📿", text: "تعذّر تحميل قسم الأذكار. اتأكد من النت وحدّث الصفحة." });
  return h("div", { className: "fade", style: { color: "var(--text)", padding: "0 0 14px", minHeight: "60vh", direction: "rtl" } }, h(MA.Screen, {}));
}

const st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st);
ReactDOM.createRoot(document.getElementById("root")).render(h(App, {}));
window.__ready = true;
}
