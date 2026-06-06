/* ============================================================
   LendLedger — shared library
   formatINR, icons, UI primitives, charts, sample data.
   Exports everything to window for cross-file use.
   ============================================================ */
const { useState, useRef, useEffect } = React;

/* ---------- Indian number formatting (lakh/crore grouping) ---------- */
function groupINR(n) {
  const neg = n < 0;
  let s = Math.abs(Math.round(n)).toString();
  let last3 = s.slice(-3);
  let rest = s.slice(0, -3);
  if (rest) last3 = "," + last3;
  rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return (neg ? "-" : "") + rest + last3;
}
function formatINR(n, paise) {
  const whole = groupINR(n);
  if (paise) {
    const p = Math.abs(n) % 1;
    return "₹" + whole + "." + (Math.round(p * 100)).toString().padStart(2, "0");
  }
  return "₹" + whole;
}
function fmtDate(d) {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return d.getDate() + " " + months[d.getMonth()] + " " + d.getFullYear();
}
function fmtDateShort(d) {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return d.getDate() + " " + months[d.getMonth()];
}

/* ---------- Icons (stroke, currentColor) ---------- */
function Icon({ name, size = 22, stroke = 1.9, fill, style }) {
  const p = {
    width: size, height: size, viewBox: "0 0 24 24", fill: fill || "none",
    stroke: "currentColor", strokeWidth: stroke, strokeLinecap: "round",
    strokeLinejoin: "round", style,
  };
  const paths = {
    home: <><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/></>,
    calc: <><rect x="5" y="2.5" width="14" height="19" rx="2.5"/><path d="M8 7h8"/><path d="M8 11h2M11.5 11h1M14 11h2M8 14.5h2M11.5 14.5h1M14 14.5h2M8 18h2M11.5 18h1M14 18h2"/></>,
    people: <><circle cx="9" cy="8" r="3.2"/><path d="M3.5 20c0-3.3 2.6-5.5 5.5-5.5s5.5 2.2 5.5 5.5"/><path d="M16 5.2a3.2 3.2 0 0 1 0 6M17.5 14.8c2.2.5 3.8 2.4 3.8 5.2"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M12 2.5v2.2M12 19.3v2.2M21.5 12h-2.2M4.7 12H2.5M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6M18.7 18.7l-1.6-1.6M6.9 6.9 5.3 5.3"/></>,
    sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"/></>,
    moon: <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/>,
    back: <path d="M15 19l-7-7 7-7"/>,
    chevron: <path d="M9 6l6 6-6 6"/>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    check: <path d="M5 12.5l4.5 4.5L19 6.5"/>,
    x: <path d="M6 6l12 12M18 6 6 18"/>,
    calendar: <><rect x="3.5" y="4.5" width="17" height="16" rx="2.5"/><path d="M3.5 9h17M8 2.5v4M16 2.5v4"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 2"/></>,
    bell: <><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z"/><path d="M10 20a2 2 0 0 0 4 0"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/></>,
    phone: <path d="M5 4h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5V18a2 2 0 0 1-2 2A15 15 0 0 1 5 6 2 2 0 0 1 5 4Z"/>,
    trash: <><path d="M4 7h16M9 7V4.5h6V7M6 7l1 13h10l1-13"/></>,
    edit: <><path d="M4 20h4L19 9l-4-4L4 16v4Z"/><path d="M14 6l4 4"/></>,
    wallet: <><rect x="3" y="6" width="18" height="13" rx="3"/><path d="M3 10h18M17 14.5h.5"/></>,
    arrowUp: <path d="M12 19V5M6 11l6-6 6 6"/>,
    arrowDown: <path d="M12 5v14M6 13l6 6 6-6"/>,
    grid: <><rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/></>,
    info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></>,
    shield: <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3Z"/>,
    extend: <><path d="M3 12h13M11 7l5 5-5 5"/><path d="M20 5v14"/></>,
    flag: <><path d="M5 21V4M5 4h11l-2 4 2 4H5"/></>,
    minus: <path d="M5 12h14"/>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.5-6 8-6s8 2 8 6"/></>,
    note: <><rect x="4" y="3.5" width="16" height="17" rx="2.5"/><path d="M8 8h8M8 12h8M8 16h5"/></>,
    coins: <><ellipse cx="9" cy="7" rx="6" ry="3"/><path d="M3 7v5c0 1.7 2.7 3 6 3s6-1.3 6-3"/><path d="M15 12.5c2.6.2 6 1.3 6 3.5 0 1.7-2.7 3-6 3s-6-1.3-6-3"/></>,
  };
  return <svg {...p}>{paths[name] || null}</svg>;
}

/* ---------- Monogram logo ---------- */
function Logo({ size = 38, radius = 11 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: radius, background: "var(--grad-primary)",
      display: "grid", placeItems: "center", color: "#fff", fontWeight: 800,
      fontSize: size * 0.42, letterSpacing: "-0.04em", boxShadow: "var(--shadow-sm)",
      flexShrink: 0,
    }}>LL</div>
  );
}

/* ---------- Primitives ---------- */
function Card({ children, style, grad, pad = 16, onClick, className = "", elev }) {
  const bg = grad === "blue" ? "var(--card-grad-blue)"
    : grad === "green" ? "var(--card-grad-green)" : "var(--surface)";
  return (
    <div onClick={onClick} className={className} style={{
      background: bg, borderRadius: "var(--radius-card)", padding: pad,
      border: "1px solid var(--border-soft)", boxShadow: elev ? "var(--shadow)" : "var(--shadow-sm)",
      ...(onClick ? { cursor: "pointer" } : {}), ...style,
    }}>{children}</div>
  );
}

function PillButton({ children, onClick, variant = "primary", size = "lg", icon, full, style, disabled }) {
  const press = useRef(null);
  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
    borderRadius: "var(--radius-pill)", fontWeight: 700, transition: "transform .12s var(--ease), filter .2s, opacity .2s",
    width: full ? "100%" : "auto", letterSpacing: "-0.01em",
    height: size === "lg" ? 54 : size === "sm" ? 38 : 46,
    fontSize: size === "lg" ? 16.5 : size === "sm" ? 13.5 : 15,
    padding: size === "sm" ? "0 16px" : "0 24px",
    opacity: disabled ? 0.45 : 1, pointerEvents: disabled ? "none" : "auto",
  };
  const variants = {
    primary: { background: "var(--grad-primary)", color: "var(--on-grad)", boxShadow: "0 6px 18px oklch(0.55 0.13 220 / .35)" },
    blue:    { background: "var(--grad-blue)", color: "var(--on-grad)", boxShadow: "0 6px 18px oklch(0.55 0.14 256 / .32)" },
    green:   { background: "var(--grad-green)", color: "var(--on-grad)", boxShadow: "0 6px 18px oklch(0.6 0.13 160 / .32)" },
    outline: { background: "var(--surface)", color: "var(--text)", border: "1.5px solid var(--border)" },
    soft:    { background: "var(--surface-2)", color: "var(--text)" },
    ghost:   { background: "transparent", color: "var(--blue)" },
    danger:  { background: "var(--red-tint)", color: "var(--red)" },
  };
  return (
    <button ref={press} onClick={onClick} disabled={disabled}
      onPointerDown={e => e.currentTarget.style.transform = "scale(0.955)"}
      onPointerUp={e => e.currentTarget.style.transform = ""}
      onPointerLeave={e => e.currentTarget.style.transform = ""}
      style={{ ...base, ...variants[variant], ...style }}>
      {icon && <Icon name={icon} size={size === "sm" ? 17 : 19} />}
      {children}
    </button>
  );
}

function Toggle({ on, onChange }) {
  return (
    <button onClick={() => onChange(!on)} style={{
      width: 50, height: 30, borderRadius: 99, padding: 3, flexShrink: 0,
      background: on ? "var(--grad-primary)" : "var(--surface-sunken)",
      border: on ? "none" : "1px solid var(--border)",
      transition: "background .25s", display: "flex",
      justifyContent: on ? "flex-end" : "flex-start", alignItems: "center",
    }}>
      <span style={{ width: 24, height: 24, borderRadius: 99, background: "#fff",
        boxShadow: "0 1px 3px rgba(0,0,0,.25)", transition: "all .2s var(--ease)" }} />
    </button>
  );
}

function Segmented({ options, value, onChange, small }) {
  return (
    <div style={{ display: "flex", background: "var(--surface-sunken)", borderRadius: 12,
      padding: 3, gap: 3, border: "1px solid var(--border-soft)" }}>
      {options.map(o => {
        const v = typeof o === "string" ? o : o.value;
        const label = typeof o === "string" ? o : o.label;
        const active = v === value;
        return (
          <button key={v} onClick={() => onChange(v)} style={{
            flex: 1, height: small ? 32 : 38, borderRadius: 9, fontWeight: 650,
            fontSize: small ? 12.5 : 14, transition: "all .2s var(--ease)",
            color: active ? "var(--text)" : "var(--text-soft)",
            background: active ? "var(--surface)" : "transparent",
            boxShadow: active ? "var(--shadow-sm)" : "none",
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}>{label}</button>
        );
      })}
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    Paid:    { c: "var(--green)", bg: "var(--green-tint)" },
    Unpaid:  { c: "var(--text-faint)", bg: "var(--surface-sunken)" },
    Partial: { c: "var(--amber)", bg: "var(--amber-tint)" },
    Active:  { c: "var(--green)", bg: "var(--green-tint)" },
    Closed:  { c: "var(--text-faint)", bg: "var(--surface-sunken)" },
    Overdue: { c: "var(--red)", bg: "var(--red-tint)" },
  };
  const s = map[status] || map.Unpaid;
  return <span style={{ color: s.c, background: s.bg, fontSize: 12, fontWeight: 700,
    padding: "4px 11px", borderRadius: 99, letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>{status}</span>;
}

function Avatar({ initials, size = 46, hue = 254 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: 99, flexShrink: 0,
      background: `linear-gradient(140deg, oklch(0.62 0.13 ${hue}), oklch(0.6 0.12 ${hue + 80}))`,
      color: "#fff", display: "grid", placeItems: "center", fontWeight: 700,
      fontSize: size * 0.36, letterSpacing: "-0.02em" }}>{initials}</div>
  );
}

function Progress({ value, max = 100, color = "var(--grad-primary)", h = 8 }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div style={{ height: h, borderRadius: 99, background: "var(--surface-sunken)", overflow: "hidden", width: "100%" }}>
      <div style={{ height: "100%", width: pct + "%", background: color, borderRadius: 99,
        transition: "width .5s var(--ease)" }} />
    </div>
  );
}

/* ---------- Charts (data-driven SVG) ---------- */
function DonutChart({ data, size = 150, thickness = 22 }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--surface-sunken)" strokeWidth={thickness} />
      {data.map((d, i) => {
        const frac = d.value / total;
        const dash = frac * c;
        const el = (
          <circle key={i} cx={size/2} cy={size/2} r={r} fill="none"
            stroke={d.color} strokeWidth={thickness} strokeLinecap="round"
            strokeDasharray={`${Math.max(dash - 4, 0)} ${c - dash + 4}`}
            strokeDashoffset={-offset}
            transform={`rotate(-90 ${size/2} ${size/2})`}
            style={{ transition: "stroke-dasharray .6s var(--ease)" }} />
        );
        offset += dash;
        return el;
      })}
    </svg>
  );
}

function BarChartPair({ data, height = 132 }) {
  // data: [{label, a, b}] a=expected b=received
  const max = Math.max(...data.flatMap(d => [d.a, d.b])) * 1.1 || 1;
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height, paddingTop: 6 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 7, height: "100%" }}>
          <div style={{ flex: 1, display: "flex", alignItems: "flex-end", gap: 4, width: "100%", justifyContent: "center" }}>
            <div title={"Expected"} style={{ width: "38%", height: (d.a/max*100)+"%", minHeight: 4,
              background: "var(--surface-sunken)", border: "1px solid var(--border)", borderRadius: "5px 5px 0 0" }} />
            <div title={"Received"} style={{ width: "38%", height: (d.b/max*100)+"%", minHeight: 4,
              background: "var(--grad-green)", borderRadius: "5px 5px 0 0" }} />
          </div>
          <span style={{ fontSize: 11, color: "var(--text-faint)", fontWeight: 600 }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function LineChart({ points, width = 320, height = 120 }) {
  const max = Math.max(...points) * 1.15 || 1;
  const min = Math.min(...points, 0);
  const pad = 6;
  const W = width - pad * 2, H = height - pad * 2;
  const xy = points.map((p, i) => {
    const x = pad + (i / (points.length - 1)) * W;
    const y = pad + H - ((p - min) / (max - min)) * H;
    return [x, y];
  });
  const path = xy.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const area = path + ` L ${xy[xy.length-1][0].toFixed(1)} ${height-pad} L ${pad} ${height-pad} Z`;
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ display: "block" }}>
      <defs>
        <linearGradient id="llline" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--blue)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--blue)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#llline)" />
      <path d={path} fill="none" stroke="var(--blue)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      {xy.filter((_,i)=>i===xy.length-1).map((p,i)=>(
        <circle key={i} cx={p[0]} cy={p[1]} r="4" fill="var(--blue)" stroke="var(--surface)" strokeWidth="2.5" />
      ))}
    </svg>
  );
}

/* ---------- List row helper ---------- */
function Row({ children, onClick, style }) {
  return (
    <div onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 12,
      padding: "13px 0", ...(onClick ? { cursor: "pointer" } : {}), ...style }}>{children}</div>
  );
}

/* ============================================================
   SAMPLE DATA (realistic Indian)
   ============================================================ */
const TODAY = new Date(2026, 4, 25); // 25 May 2026

function buildDays(startMonthDay, total, logged, pattern) {
  // pattern: array describing statuses for logged days; rest unpaid/future
  const days = [];
  const start = new Date(2026, startMonthDay[0], startMonthDay[1]);
  for (let i = 0; i < total; i++) {
    const d = new Date(start); d.setDate(start.getDate() + i);
    let status = "Future";
    if (i < logged) status = pattern[i] || "Paid";
    else if (i === logged) status = "Today";
    days.push({ idx: i + 1, date: d, status });
  }
  return days;
}

const LOANEES = [
  { id: "rk", name: "Ravi Kumar", initials: "RK", phone: "+91 98200 11234", hue: 254, notes: "Vegetable vendor, Dadar market." },
  { id: "ps", name: "Priya Sharma", initials: "PS", phone: "+91 99300 55621", hue: 320, notes: "Tailoring shop, regular payer." },
  { id: "av", name: "Anil Verma", initials: "AV", phone: "+91 90040 22890", hue: 168, notes: "Tea stall owner." },
  { id: "sd", name: "Sunita Devi", initials: "SD", phone: "+91 70450 78012", hue: 30, notes: "" },
];

const LOANS = [
  { id: "l1", loaneeId: "rk", principal: 10000, ratePct: 1, days: 50, daily: 300,
    total: 15000, start: [4, 23], logged: 32, outstanding: 5400, status: "Active", overpay: 0,
    unpaidDays: 4, partialDays: 2,
    pattern: ["Paid","Paid","Paid","Partial","Paid","Paid","Paid","Paid","Unpaid","Paid","Paid","Paid","Paid","Paid","Paid","Unpaid","Paid","Paid","Partial","Paid","Paid","Paid","Paid","Paid","Paid","Unpaid","Paid","Paid","Paid","Paid","Unpaid","Paid"] },
  { id: "l2", loaneeId: "ps", principal: 25000, ratePct: 1, days: 60, daily: 500,
    total: 30000, start: [3, 28], logged: 44, outstanding: 8000, status: "Active", overpay: 0,
    unpaidDays: 3, partialDays: 1, pattern: [] },
  { id: "l3", loaneeId: "av", principal: 8000, ratePct: 1.2, days: 40, daily: 270,
    total: 10800, start: [4, 10], logged: 15, outstanding: 6750, status: "Active", overpay: 120,
    unpaidDays: 1, partialDays: 0, pattern: [] },
  { id: "l4", loaneeId: "sd", principal: 50000, ratePct: 0.8, days: 90, daily: 760,
    total: 68400, start: [2, 15], logged: 70, outstanding: 15200, status: "Active", overpay: 0,
    unpaidDays: 5, partialDays: 2, pattern: [] },
];

const DASH = {
  totalLoaned: 245000, totalReceived: 189500, outstanding: 55500, activeLoans: 4,
  donut: [
    { name: "Sunita Devi", value: 15200, color: "oklch(0.62 0.14 30)" },
    { name: "Priya Sharma", value: 8000, color: "oklch(0.6 0.13 320)" },
    { name: "Anil Verma", value: 6750, color: "oklch(0.64 0.13 168)" },
    { name: "Ravi Kumar", value: 5400, color: "oklch(0.6 0.14 254)" },
    { name: "Others (12)", value: 20150, color: "oklch(0.7 0.02 256)" },
  ],
  week: [
    { label: "Mon", a: 1830, b: 1830 }, { label: "Tue", a: 1830, b: 1530 },
    { label: "Wed", a: 1830, b: 1830 }, { label: "Thu", a: 1830, b: 1230 },
    { label: "Fri", a: 1830, b: 1830 }, { label: "Sat", a: 1830, b: 1600 },
    { label: "Sun", a: 1830, b: 900 },
  ],
  line: [4200,5100,4800,6200,5400,7100,6800,5900,7400,6600,8100,7200,6900,8400,7600,8200,7900,9100,8400,7700,9400,8800,8200,9600,8900,7400,9100,8600,9800,9200],
};

Object.assign(window, {
  formatINR, groupINR, fmtDate, fmtDateShort, Icon, Logo, Card, PillButton,
  Toggle, Segmented, StatusPill, Avatar, Progress, DonutChart, BarChartPair,
  LineChart, Row, LOANEES, LOANS, DASH, TODAY, buildDays,
});
