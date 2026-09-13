/* ============================================================
   LendLedger — Collection calendar (heatmap)
   Reusable across Home (all loanees) and Loanee detail.
   Each day is tinted by collection status; tap a day for the
   per-loanee / per-loan breakdown. Derives day status from the
   shared LOANS data anchored to TODAY (25 May 2026).
   ============================================================ */
const { useState: useStateCal } = React;

const CAL_MONTHS = ["January","February","March","April","May","June",
  "July","August","September","October","November","December"];
const CAL_WD = ["S","M","T","W","T","F","S"];
const CAL_DOW = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

function calSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return ((h >>> 0) % 10000) / 10000;
}
function calSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function calDaysBetween(a, b) { return Math.round((b - a) / 86400000); }

/* per-loan status for a single calendar date (or null if outside the loan window) */
function loanDayInfo(loan, date) {
  const start = new Date(2026, loan.start[0], loan.start[1]); start.setHours(0, 0, 0, 0);
  const d = new Date(date); d.setHours(0, 0, 0, 0);
  const idx = calDaysBetween(start, d);
  if (idx < 0 || idx >= loan.days) return null;
  const today = new Date(TODAY); today.setHours(0, 0, 0, 0);
  if (d.getTime() > today.getTime()) return { kind: "future", expected: loan.daily, received: 0, status: "Scheduled" };
  if (d.getTime() === today.getTime()) return { kind: "today", expected: loan.daily, received: 0, status: "Due" };
  let st;
  if (loan.pattern && loan.pattern.length > idx) st = loan.pattern[idx];
  else { const r = calSeed(loan.id + ":" + idx); st = r < 0.8 ? "Paid" : r < 0.92 ? "Partial" : "Unpaid"; }
  let received = 0;
  if (st === "Paid") received = loan.daily;
  else if (st === "Partial") { const f = 0.3 + 0.5 * calSeed(loan.id + ":p:" + idx); received = Math.round(loan.daily * f / 10) * 10; }
  return { kind: "past", expected: loan.daily, received, status: st };
}

/* aggregate all given loans for a date into a single cell verdict */
function aggregateDay(loans, date) {
  const items = [];
  let expected = 0, received = 0, hasToday = false, hasFuture = false, hasPast = false;
  for (const loan of loans) {
    const info = loanDayInfo(loan, date);
    if (!info) continue;
    items.push({ loan, ...info });
    if (info.kind === "today") { hasToday = true; expected += info.expected; }
    else if (info.kind === "future") { hasFuture = true; }
    else { hasPast = true; expected += info.expected; received += info.received; }
  }
  if (items.length === 0) return { kind: "empty", items };
  if (hasPast) {
    const ratio = expected > 0 ? received / expected : 0;
    const status = ratio >= 0.999 ? "full" : ratio > 0 ? "partial" : "missed";
    return { kind: "past", status, expected, received, ratio, items };
  }
  if (hasToday) return { kind: "today", expected, received, items };
  return { kind: "future", items };
}

const CAL_LEGEND = [
  { c: "var(--green)", label: "Full" },
  { c: "var(--amber)", label: "Partial" },
  { c: "var(--red)", label: "Missed" },
  { c: "var(--blue)", label: "Today" },
];

/* ---------- detail row pills ---------- */
function CalRightTag({ item }) {
  if (item.kind === "today")
    return <span style={{ fontSize: 11.5, fontWeight: 750, color: "var(--blue)", background: "var(--blue-tint)",
      padding: "4px 11px", borderRadius: 99 }}>Due today</span>;
  if (item.kind === "future")
    return <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-faint)", background: "var(--surface-sunken)",
      padding: "4px 11px", borderRadius: 99 }}>Scheduled</span>;
  if (item.status === "Paid") return <StatusPill status="Paid" />;
  if (item.status === "Partial") return <StatusPill status="Partial" />;
  return <StatusPill status="Unpaid" />;
}
function CalRowAmount(item) {
  if (item.kind === "future" || item.kind === "today")
    return { text: formatINR(item.expected), color: item.kind === "today" ? "var(--blue)" : "var(--text-faint)" };
  if (item.status === "Paid") return { text: formatINR(item.received), color: "var(--green)" };
  if (item.status === "Partial") return { text: formatINR(item.received) + " / " + formatINR(item.expected), color: "var(--amber)" };
  return { text: "Missed", color: "var(--text-faint)" };
}

/* ============================================================
   MAIN
   ============================================================ */
function LoanCalendar({ loans, ctx, title = "Collection calendar", sub, size = "mobile" }) {
  const desktop = size === "desktop";
  const today = new Date(TODAY);
  const [cursor, setCursor] = useStateCal(() => new Date(TODAY.getFullYear(), TODAY.getMonth(), 1));
  const [selected, setSelected] = useStateCal(() => new Date(TODAY));

  const y = cursor.getFullYear(), m = cursor.getMonth();
  const startPad = new Date(y, m, 1).getDay();
  const dim = new Date(y, m + 1, 0).getDate();
  const cellCount = Math.ceil((startPad + dim) / 7) * 7;
  const cells = [];
  for (let i = 0; i < cellCount; i++) cells.push(new Date(y, m, 1 - startPad + i));

  /* month summary (in-month past days only) */
  let mFull = 0, mPartial = 0, mMissed = 0, mCollected = 0, mExpected = 0;
  for (let dd = 1; dd <= dim; dd++) {
    const agg = aggregateDay(loans, new Date(y, m, dd));
    if (agg.kind === "past") {
      mCollected += agg.received; mExpected += agg.expected;
      if (agg.status === "full") mFull++; else if (agg.status === "partial") mPartial++; else mMissed++;
    }
  }
  const rate = mExpected > 0 ? Math.round(mCollected / mExpected * 100) : null;
  const selAgg = aggregateDay(loans, selected);

  const num = desktop ? 15 : 13.5;
  const navBtn = {
    width: desktop ? 38 : 34, height: desktop ? 38 : 34, borderRadius: 11, flexShrink: 0,
    background: "var(--surface-2)", border: "1px solid var(--border-soft)", color: "var(--text-soft)",
    display: "grid", placeItems: "center",
  };
  const shift = (n) => { const c = new Date(y, m + n, 1); setCursor(c); };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: desktop ? 16 : 13, animation: "ll-fade .3s" }}>
      {/* ---------- month summary ---------- */}
      <Card pad={desktop ? 18 : 15}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: desktop ? 15 : 13.5, fontWeight: 750, color: "var(--text)" }}>{title}</div>
            {sub && <div style={{ fontSize: 12.5, color: "var(--text-faint)", fontWeight: 600, marginTop: 2 }}>{sub}</div>}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: desktop ? 22 : 19, fontWeight: 800, color: "var(--green)", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
              {rate == null ? "—" : rate + "%"}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-faint)", fontWeight: 600 }}>collected</div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600, color: "var(--text-soft)", margin: "13px 0 6px" }}>
          <span>{formatINR(mCollected)} received</span>
          <span style={{ color: "var(--text-faint)" }}>of {formatINR(mExpected)} due</span>
        </div>
        <Progress value={mCollected} max={mExpected || 1} color="var(--grad-green)" h={7} />
        <div style={{ display: "flex", gap: desktop ? 16 : 13, marginTop: 13, flexWrap: "wrap" }}>
          {[{ n: mFull, c: "var(--green)", l: "full" }, { n: mPartial, c: "var(--amber)", l: "partial" }, { n: mMissed, c: "var(--red)", l: "missed" }].map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 9, height: 9, borderRadius: 99, background: s.c, flexShrink: 0 }} />
              <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text)" }}>{s.n}</span>
              <span style={{ fontSize: 12.5, color: "var(--text-faint)", fontWeight: 600 }}>{s.l}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* ---------- calendar grid ---------- */}
      <Card pad={desktop ? 18 : 14}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: desktop ? 16 : 13 }}>
          <button onClick={() => shift(-1)} style={navBtn}><Icon name="back" size={18} /></button>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: desktop ? 17 : 15.5, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>{CAL_MONTHS[m]} {y}</div>
            <button onClick={() => { setCursor(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1)); setSelected(new Date(TODAY)); }}
              style={{ fontSize: 11.5, fontWeight: 650, color: "var(--blue)", marginTop: 1, padding: 0 }}>Today</button>
          </div>
          <button onClick={() => shift(1)} style={{ ...navBtn, transform: "rotate(180deg)" }}><Icon name="back" size={18} /></button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: desktop ? 7 : 5, marginBottom: 4 }}>
          {CAL_WD.map((w, i) => (
            <div key={i} style={{ textAlign: "center", fontSize: desktop ? 12 : 11, fontWeight: 700, color: "var(--text-faint)", padding: "2px 0 6px" }}>{w}</div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: desktop ? 7 : 5 }}>
          {cells.map((date, i) => {
            const inMonth = date.getMonth() === m;
            const agg = aggregateDay(loans, date);
            const isToday = calSameDay(date, today);
            const isSel = calSameDay(date, selected);
            let bg = "transparent", fg = "var(--text)", weight = 600, dot = null;
            if (inMonth) {
              if (agg.kind === "past") {
                if (agg.status === "full") { bg = "var(--green-tint)"; fg = "var(--green)"; weight = 700; }
                else if (agg.status === "partial") { bg = "var(--amber-tint)"; fg = "var(--amber)"; weight = 700; }
                else { bg = "var(--red-tint)"; fg = "var(--red)"; weight = 700; }
              } else if (agg.kind === "today") { bg = "var(--blue-tint)"; fg = "var(--blue)"; weight = 750; }
              else if (agg.kind === "future") { fg = "var(--text-soft)"; dot = "var(--text-faint)"; }
              else { fg = "var(--text-faint)"; }
            } else fg = "var(--text-faint)";
            const ring = isSel ? "var(--text)" : isToday ? "var(--blue)" : "transparent";
            return (
              <button key={i} onClick={() => { setSelected(new Date(date)); if (!inMonth) setCursor(new Date(date.getFullYear(), date.getMonth(), 1)); }}
                style={{ aspectRatio: "1", borderRadius: desktop ? 12 : 10, background: inMonth ? bg : "transparent",
                  border: "2px solid " + ring, display: "flex", alignItems: "center", justifyContent: "center",
                  position: "relative", opacity: inMonth ? 1 : 0.38, transition: "background .12s, border-color .12s" }}>
                <span style={{ fontSize: num, fontWeight: isToday ? 800 : weight, color: fg, letterSpacing: "-0.01em" }}>{date.getDate()}</span>
                {dot && inMonth && <span style={{ width: 4, height: 4, borderRadius: 99, background: dot, position: "absolute", bottom: desktop ? 6 : 4 }} />}
              </button>
            );
          })}
        </div>

        {/* legend */}
        <div style={{ display: "flex", gap: desktop ? 16 : 12, flexWrap: "wrap", marginTop: desktop ? 16 : 13, paddingTop: 13, borderTop: "1px solid var(--border-soft)" }}>
          {CAL_LEGEND.map((l, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: l.c, flexShrink: 0 }} />
              <span style={{ fontSize: 11.5, color: "var(--text-soft)", fontWeight: 600 }}>{l.label}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* ---------- selected day breakdown ---------- */}
      <Card pad={0} style={{ overflow: "hidden" }}>
        <div style={{ padding: desktop ? "16px 18px" : "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between",
          borderBottom: selAgg.items.length ? "1px solid var(--border-soft)" : "none" }}>
          <div>
            <div style={{ fontSize: desktop ? 15.5 : 14.5, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.01em" }}>
              {calSameDay(selected, today) ? "Today · " : ""}{fmtDate(selected)}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-faint)", fontWeight: 600, marginTop: 2 }}>{CAL_DOW[selected.getDay()]}</div>
          </div>
          {selAgg.kind === "past" && (
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>{formatINR(selAgg.received)}</div>
              <div style={{ fontSize: 11, color: "var(--text-faint)", fontWeight: 600 }}>of {formatINR(selAgg.expected)}</div>
            </div>
          )}
        </div>

        {selAgg.items.length === 0 ? (
          <div style={{ padding: "30px 20px", textAlign: "center" }}>
            <Icon name="calendar" size={26} style={{ color: "var(--text-faint)", opacity: 0.6 }} />
            <div style={{ fontSize: 13, color: "var(--text-faint)", fontWeight: 600, marginTop: 8 }}>No loans active on this day</div>
          </div>
        ) : selAgg.items.map((item, i) => {
          const ln = LOANEES.find(l => l.id === item.loan.loaneeId);
          const amt = CalRowAmount(item);
          return (
            <div key={item.loan.id} onClick={() => ctx.nav.push("loanDetail", { loanId: item.loan.id })}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: desktop ? "13px 18px" : "12px 16px",
                borderBottom: i < selAgg.items.length - 1 ? "1px solid var(--border-soft)" : "none", cursor: "pointer" }}>
              <Avatar initials={ln.initials} size={desktop ? 40 : 38} hue={ln.hue} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--text)" }}>{ln.name}</div>
                <div style={{ fontSize: 12, color: "var(--text-faint)", fontWeight: 600, marginTop: 1 }}>{formatINR(item.loan.principal)} loan · {formatINR(item.loan.daily)}/day</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5 }}>
                <CalRightTag item={item} />
                <span style={{ fontSize: 12.5, fontWeight: 700, color: amt.color }}>{amt.text}</span>
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}

Object.assign(window, { LoanCalendar, aggregateDay, loanDayInfo });
