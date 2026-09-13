/* ============================================================
   LendLedger — stack screens (part 2)
   LoanDetail · ExtendLoan · CustomAmountSheet · CloseLoanDialog
   ============================================================ */

/* ============================================================
   LOAN DETAIL
   ============================================================ */
function LoanDetail({ ctx, params }) {
  const { nav } = ctx;
  const loan = LOANS.find(l => l.id === params.loanId) || LOANS[0];
  const ln = LOANEES.find(l => l.id === loan.loaneeId);
  const [filter, setFilter] = React.useState("All");
  const [days, setDays] = React.useState(() => buildDays(loan.start, loan.days, loan.logged, loan.pattern.length ? loan.pattern : null));
  const [sheet, setSheet] = React.useState(null);     // {day} for custom amount
  const [closeDlg, setCloseDlg] = React.useState(false);

  const setStatus = (idx, status, received) => {
    setDays(ds => ds.map(d => d.idx === idx ? { ...d, status, received } : d));
  };

  const today = days.find(d => d.status === "Today");
  const past = days.filter(d => d.status !== "Future" && d.status !== "Today").reverse();
  const filtered = filter === "All" ? past : past.filter(d => d.status === filter);
  const paidCount = days.filter(d => d.status === "Paid").length;

  return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column", animation: "ll-fade .3s", position: "relative" }}>
      <StackHeader title={ln.name} onBack={() => nav.pop()} right={<StatusPill status={loan.status} />} />

      <div style={{ flex: 1, padding: "2px 20px 8px", display: "flex", flexDirection: "column", gap: 14 }}>
        {/* summary header card */}
        <div style={{ borderRadius: "var(--radius-lg)", padding: 18, background: "var(--header-grad)",
          color: "#fff", boxShadow: "var(--shadow)", position: "relative", overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 12.5, opacity: 0.85, fontWeight: 600 }}>Principal</div>
              <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em" }}>{formatINR(loan.principal)}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12.5, opacity: 0.85, fontWeight: 600 }}>Daily expected</div>
              <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em" }}>{formatINR(loan.daily)}</div>
            </div>
          </div>
          <div style={{ margin: "16px 0 8px", display: "flex", justifyContent: "space-between", fontSize: 12.5, fontWeight: 600, opacity: 0.92 }}>
            <span>{loan.logged} of {loan.days} days logged</span>
            <span>{Math.round(loan.logged/loan.days*100)}%</span>
          </div>
          <div style={{ height: 9, borderRadius: 99, background: "rgba(255,255,255,0.25)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: (loan.logged/loan.days*100)+"%", background: "#fff", borderRadius: 99 }} />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <div style={{ flex: 1, background: "rgba(255,255,255,0.16)", borderRadius: 13, padding: "11px 13px", backdropFilter: "blur(4px)" }}>
              <div style={{ fontSize: 11.5, opacity: 0.85, fontWeight: 600 }}>Outstanding</div>
              <div style={{ fontSize: 19, fontWeight: 800, marginTop: 2 }}>{formatINR(loan.outstanding)}</div>
            </div>
            <div style={{ flex: 1, background: "rgba(255,255,255,0.16)", borderRadius: 13, padding: "11px 13px", backdropFilter: "blur(4px)" }}>
              <div style={{ fontSize: 11.5, opacity: 0.85, fontWeight: 600 }}>Collected</div>
              <div style={{ fontSize: 19, fontWeight: 800, marginTop: 2 }}>{formatINR(loan.total - loan.outstanding)}</div>
            </div>
          </div>
          {loan.overpay > 0 && (
            <div style={{ marginTop: 11, fontSize: 12.5, fontWeight: 650, display: "flex", alignItems: "center", gap: 6,
              background: "rgba(255,255,255,0.16)", borderRadius: 10, padding: "8px 11px" }}>
              <Icon name="arrowUp" size={14} /> {formatINR(loan.overpay)} overpayment credit applied
            </div>
          )}
        </div>

        {/* TODAY pinned */}
        {today && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-faint)", letterSpacing: "0.05em", textTransform: "uppercase", margin: "2px 2px 9px" }}>Today</div>
            <DayRowToday day={today} expected={loan.daily} onSet={setStatus} onCustom={() => setSheet(today)} />
          </div>
        )}

        {/* filter + history */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "2px 2px 11px" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-faint)", letterSpacing: "0.05em", textTransform: "uppercase" }}>History</span>
            <span style={{ fontSize: 12, color: "var(--text-faint)", fontWeight: 600 }}>{paidCount} paid · {loan.unpaidDays} unpaid</span>
          </div>
          <div style={{ marginBottom: 12 }}>
            <Segmented small options={["All","Paid","Unpaid","Partial"]} value={filter} onChange={setFilter} />
          </div>
          <Card pad={0} style={{ overflow: "hidden" }}>
            {filtered.map((d, i) => (
              <DayRow key={d.idx} day={d} expected={loan.daily} last={i === filtered.length - 1} onClick={() => setSheet(d)} />
            ))}
            {filtered.length === 0 && <div style={{ padding: 28, textAlign: "center", fontSize: 13.5, color: "var(--text-faint)" }}>No {filter.toLowerCase()} days</div>}
          </Card>
        </div>
      </div>

      <BottomBar>
        <div style={{ display: "flex", gap: 10 }}>
          <PillButton variant="outline" full icon="extend" onClick={() => nav.push("extendLoan", { loanId: loan.id })}>Extend loan</PillButton>
          <PillButton variant="danger" full icon="flag" onClick={() => setCloseDlg(true)}>Close loan</PillButton>
        </div>
      </BottomBar>

      {sheet && <CustomAmountSheet day={sheet} expected={loan.daily} onClose={() => setSheet(null)}
        onSave={(amt) => { setStatus(sheet.idx, amt >= loan.daily ? "Paid" : amt <= 0 ? "Unpaid" : "Partial", amt); setSheet(null); }} />}
      {closeDlg && <CloseLoanDialog outstanding={loan.outstanding} onCancel={() => setCloseDlg(false)} onConfirm={() => { setCloseDlg(false); nav.pop(); }} />}
    </div>
  );
}

function statusVisual(status) {
  if (status === "Paid") return { c: "var(--green)", bg: "var(--green-tint)", icon: "check", label: "Paid" };
  if (status === "Partial") return { c: "var(--amber)", bg: "var(--amber-tint)", icon: "coins", label: "Partial" };
  return { c: "var(--text-faint)", bg: "var(--surface-sunken)", icon: null, label: "Unpaid" };
}

function DayRow({ day, expected, last, onClick }) {
  const v = statusVisual(day.status);
  return (
    <div onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 13, padding: "13px 16px",
      borderBottom: last ? "none" : "1px solid var(--border-soft)", cursor: "pointer" }}>
      <span style={{ width: 34, height: 34, borderRadius: 10, background: v.bg, color: v.c, display: "grid", placeItems: "center", flexShrink: 0 }}>
        {v.icon ? <Icon name={v.icon} size={17} stroke={2.4} /> : <span style={{ width: 9, height: 9, borderRadius: 99, border: "2px solid currentColor" }} />}
      </span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--text)" }}>{fmtDate(day.date)}</div>
        <div style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 1 }}>
          Expected {formatINR(expected)}{day.status === "Partial" && day.received != null ? ` · paid ${formatINR(day.received)}` : ""}
        </div>
      </div>
      {day.status === "Partial" && day.received != null
        ? <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--amber)" }}>{formatINR(day.received)} / {formatINR(expected)}</span>
        : <StatusPill status={v.label} />}
    </div>
  );
}

function DayRowToday({ day, expected, onSet, onCustom }) {
  const paid = day.status === "Paid";
  const partial = day.status === "Partial";
  return (
    <Card pad={15} style={{ border: "2px solid var(--blue)", boxShadow: "0 6px 20px oklch(0.55 0.13 250 / 0.18)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 13 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text)" }}>Today, {fmtDateShort(day.date)}</div>
          <div style={{ fontSize: 12.5, color: "var(--text-faint)", marginTop: 2 }}>Expected {formatINR(expected)}{partial && day.received != null ? ` · paid ${formatINR(day.received)}` : ""}</div>
        </div>
        <span style={{ width: 30, height: 30, borderRadius: 9, background: "var(--blue-tint)", color: "var(--blue)", display: "grid", placeItems: "center" }}><Icon name="clock" size={17} /></span>
      </div>
      {/* large toggles min 48px */}
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => onSet(day.idx, "Unpaid")} style={{
          flex: 1, height: 52, borderRadius: 14, fontWeight: 750, fontSize: 14.5, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          border: "1.5px solid " + (!paid && !partial ? "var(--text-faint)" : "var(--border)"),
          background: !paid && !partial ? "var(--surface-sunken)" : "var(--surface)",
          color: !paid && !partial ? "var(--text)" : "var(--text-soft)", transition: "all .15s" }}>
          <span style={{ width: 18, height: 18, borderRadius: 99, border: "2px solid currentColor" }} /> Unpaid
        </button>
        <button onClick={() => onSet(day.idx, "Paid")} style={{
          flex: 1, height: 52, borderRadius: 14, fontWeight: 750, fontSize: 14.5, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          border: "none", color: paid ? "#fff" : "var(--green)",
          background: paid ? "var(--grad-green)" : "var(--green-tint)", transition: "all .15s",
          boxShadow: paid ? "0 6px 16px oklch(0.6 0.13 160 / .3)" : "none" }}>
          <Icon name="check" size={19} stroke={2.6} /> Paid
        </button>
      </div>
      <button onClick={onCustom} style={{ width: "100%", marginTop: 10, fontSize: 13, fontWeight: 650, color: "var(--blue)", padding: "6px" }}>
        Enter custom amount
      </button>
    </Card>
  );
}

/* ============================================================
   CUSTOM AMOUNT BOTTOM SHEET
   ============================================================ */
function CustomAmountSheet({ day, expected, onClose, onSave }) {
  const [amt, setAmt] = React.useState(day.received != null ? String(day.received) : "");
  const val = parseFloat(amt) || 0;
  return (
    <SheetScrim onClose={onClose}>
      <div style={{ background: "var(--bg-elev)", borderRadius: "24px 24px 0 0", padding: "10px 20px calc(22px + env(safe-area-inset-bottom))",
        animation: "ll-sheet-up .3s var(--ease)" }}>
        <div style={{ width: 38, height: 4, borderRadius: 99, background: "var(--border)", margin: "0 auto 16px" }} />
        <div style={{ fontSize: 19, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>Custom amount</div>
        <div style={{ fontSize: 13, color: "var(--text-faint)", marginTop: 3, marginBottom: 18 }}>{fmtDate(day.date)} · expected {formatINR(expected)}</div>

        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
          <span style={{ fontSize: 32, fontWeight: 800, color: "var(--text-faint)", marginRight: 4 }}>₹</span>
          <input autoFocus type="number" inputMode="decimal" value={amt} onChange={e => setAmt(e.target.value)} placeholder="0"
            style={{ width: 160, border: "none", outline: "none", background: "transparent", fontSize: 44, fontWeight: 800,
              color: "var(--text)", textAlign: "center", letterSpacing: "-0.03em" }} />
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 20, flexWrap: "wrap" }}>
          {[expected, Math.round(expected/2), expected*2].map((q, i) => (
            <button key={i} onClick={() => setAmt(String(q))} style={{ padding: "8px 15px", borderRadius: 99, fontSize: 13, fontWeight: 700,
              background: "var(--surface-2)", color: "var(--text-soft)", border: "1px solid var(--border-soft)" }}>{formatINR(q)}</button>
          ))}
        </div>

        <div style={{ fontSize: 13, fontWeight: 650, textAlign: "center", marginBottom: 16,
          color: val >= expected ? "var(--green)" : val > 0 ? "var(--amber)" : "var(--text-faint)" }}>
          {val >= expected ? "Marks day as Paid" : val > 0 ? `Partial — ${formatINR(expected - val)} short` : "Marks day as Unpaid"}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <PillButton variant="soft" full onClick={onClose}>Cancel</PillButton>
          <PillButton variant="primary" full onClick={() => onSave(val)}>Save</PillButton>
        </div>
      </div>
    </SheetScrim>
  );
}

function SheetScrim({ children, onClose }) {
  return (
    <div onClick={onClose} style={{ position: "absolute", inset: 0, zIndex: 50, background: "var(--scrim)",
      display: "flex", flexDirection: "column", justifyContent: "flex-end", animation: "ll-fade .2s" }}>
      <div onClick={e => e.stopPropagation()}>{children}</div>
    </div>
  );
}

/* ============================================================
   CLOSE LOAN DIALOG
   ============================================================ */
function CloseLoanDialog({ outstanding, onCancel, onConfirm }) {
  return (
    <div onClick={onCancel} style={{ position: "absolute", inset: 0, zIndex: 60, background: "var(--scrim)",
      display: "grid", placeItems: "center", padding: 28, animation: "ll-fade .2s" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "var(--bg-elev)", borderRadius: 22, padding: 24,
        width: "100%", maxWidth: 320, animation: "ll-pop .25s var(--ease)", boxShadow: "var(--shadow-lg)" }}>
        <div style={{ width: 52, height: 52, borderRadius: 15, background: "var(--red-tint)", color: "var(--red)",
          display: "grid", placeItems: "center", marginBottom: 15 }}><Icon name="flag" size={26} /></div>
        <div style={{ fontSize: 19, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em", marginBottom: 7 }}>Close this loan?</div>
        <p style={{ margin: 0, fontSize: 14, color: "var(--text-soft)", lineHeight: 1.5 }}>
          <b style={{ color: "var(--amber)" }}>{formatINR(outstanding)}</b> is still outstanding. Closing will stop daily tracking and mark the balance as written off.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 22 }}>
          <PillButton variant="primary" full onClick={onCancel}>Keep loan open</PillButton>
          <PillButton variant="danger" full onClick={onConfirm}>Close anyway</PillButton>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   EXTEND LOAN
   ============================================================ */
function ExtendLoan({ ctx, params }) {
  const { nav } = ctx;
  const loan = LOANS.find(l => l.id === params.loanId) || LOANS[0];
  const ln = LOANEES.find(l => l.id === loan.loaneeId);
  const [addDays, setAddDays] = React.useState(20);
  const [opt, setOpt] = React.useState("A");

  const recalcDaily = Math.round(loan.outstanding / addDays);
  const endDate = new Date(2026, 4, 25); endDate.setDate(endDate.getDate() + (loan.days - loan.logged) + addDays);

  return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column", animation: "ll-fade .3s" }}>
      <StackHeader title="Extend loan" onBack={() => nav.pop()} />
      <div style={{ flex: 1, padding: "2px 20px 8px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ marginTop: -4 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>{ln.name}</div>
          <div style={{ fontSize: 13, color: "var(--text-faint)", marginTop: 2 }}>Current end date · 12 Jul 2026</div>
        </div>

        {/* status summary */}
        <div style={{ display: "flex", gap: 10 }}>
          {[
            { label: "Unpaid days", value: loan.unpaidDays, c: "var(--text)" },
            { label: "Partial days", value: loan.partialDays, c: "var(--amber)" },
            { label: "Balance", value: formatINR(loan.outstanding), c: "var(--red)", wide: true },
          ].map((s, i) => (
            <Card key={i} pad={13} style={{ flex: s.wide ? 1.5 : 1 }}>
              <div style={{ fontSize: 11.5, color: "var(--text-faint)", fontWeight: 600 }}>{s.label}</div>
              <div style={{ fontSize: s.wide ? 18 : 22, fontWeight: 800, color: s.c, marginTop: 4, letterSpacing: "-0.02em" }}>{s.value}</div>
            </Card>
          ))}
        </div>

        {/* add days stepper */}
        <Card pad={16}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 12 }}>Add days</div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, justifyContent: "center" }}>
            <button onClick={() => setAddDays(Math.max(1, addDays - 5))} style={stepperBtn}><Icon name="minus" size={20} /></button>
            <div style={{ textAlign: "center", minWidth: 72 }}>
              <div style={{ fontSize: 38, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.03em", lineHeight: 1 }}>{addDays}</div>
              <div style={{ fontSize: 12, color: "var(--text-faint)", fontWeight: 600, marginTop: 2 }}>days</div>
            </div>
            <button onClick={() => setAddDays(addDays + 5)} style={stepperBtn}><Icon name="plus" size={20} /></button>
          </div>
        </Card>

        {/* options */}
        <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          <ChoiceCard active={opt === "A"} onClick={() => setOpt("A")} title="Keep same daily amount"
            value={formatINR(loan.daily) + "/day"} sub="New days continue at the original daily payment" />
          <ChoiceCard active={opt === "B"} onClick={() => setOpt("B")} title="Recalculate daily amount"
            value={formatINR(recalcDaily) + "/day"} sub="Spread the remaining balance evenly over the new days" />
        </div>

        {/* preview */}
        <Card grad="green" pad={16}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-faint)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 12 }}>After extension</div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 11 }}>
            <span style={{ fontSize: 13.5, color: "var(--text-soft)", fontWeight: 600 }}>New end date</span>
            <span style={{ fontSize: 14.5, fontWeight: 750, color: "var(--text)" }}>{fmtDate(endDate)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 11 }}>
            <span style={{ fontSize: 13.5, color: "var(--text-soft)", fontWeight: 600 }}>New daily amount</span>
            <span style={{ fontSize: 14.5, fontWeight: 750, color: "var(--green)" }}>{formatINR(opt === "A" ? loan.daily : recalcDaily)}/day</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13.5, color: "var(--text-soft)", fontWeight: 600 }}>Additional days</span>
            <span style={{ fontSize: 14.5, fontWeight: 750, color: "var(--text)" }}>+{addDays} days</span>
          </div>
        </Card>
      </div>
      <BottomBar>
        <PillButton variant="primary" full onClick={() => nav.pop()}>Confirm extension</PillButton>
        <button onClick={() => nav.pop()} style={{ fontSize: 13.5, fontWeight: 650, color: "var(--text-soft)", padding: 6 }}>Cancel</button>
      </BottomBar>
    </div>
  );
}
const stepperBtn = { width: 50, height: 50, borderRadius: 14, background: "var(--surface-2)", border: "1px solid var(--border)",
  color: "var(--text)", display: "grid", placeItems: "center" };

function ChoiceCard({ active, onClick, title, value, sub }) {
  return (
    <button onClick={onClick} style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 13,
      padding: 15, borderRadius: "var(--radius-card)", background: active ? "var(--blue-tint)" : "var(--surface)",
      border: "1.5px solid " + (active ? "var(--blue)" : "var(--border-soft)"), boxShadow: "var(--shadow-sm)", transition: "all .15s" }}>
      <span style={{ width: 24, height: 24, borderRadius: 99, flexShrink: 0, border: "2px solid " + (active ? "var(--blue)" : "var(--border)"),
        display: "grid", placeItems: "center", background: active ? "var(--blue)" : "transparent" }}>
        {active && <span style={{ width: 9, height: 9, borderRadius: 99, background: "#fff" }} />}
      </span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14.5, fontWeight: 750, color: "var(--text)" }}>{title}</div>
        <div style={{ fontSize: 12.5, color: "var(--text-faint)", marginTop: 2, lineHeight: 1.4 }}>{sub}</div>
      </div>
      <span style={{ fontSize: 15, fontWeight: 800, color: active ? "var(--blue)" : "var(--text-soft)", whiteSpace: "nowrap", letterSpacing: "-0.02em" }}>{value}</span>
    </button>
  );
}

Object.assign(window, { LoanDetail, ExtendLoan, CustomAmountSheet, CloseLoanDialog, DayRow, DayRowToday, ChoiceCard });
