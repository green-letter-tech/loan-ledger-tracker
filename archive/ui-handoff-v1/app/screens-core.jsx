/* ============================================================
   LendLedger — core tab screens
   Dashboard · Calculator · Loanees · Settings
   ============================================================ */
const { useState: useStateC } = React;

function loaneeById(id) { return LOANEES.find(l => l.id === id); }

/* ---------- shared tab header ---------- */
function TabHeader({ title, right, sub }) {
  return (
    <div style={{ padding: "8px 20px 14px", display: "flex", alignItems: "flex-end",
      justifyContent: "space-between" }}>
      <div>
        {sub && <div style={{ fontSize: 13, color: "var(--text-faint)", fontWeight: 600, marginBottom: 2 }}>{sub}</div>}
        <h1 style={{ margin: 0, fontSize: 27, fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text)" }}>{title}</h1>
      </div>
      {right}
    </div>
  );
}

function IconBtn({ name, onClick, active }) {
  return (
    <button onClick={onClick} style={{ width: 42, height: 42, borderRadius: 13,
      background: active ? "var(--blue-tint)" : "var(--surface)", color: active ? "var(--blue)" : "var(--text-soft)",
      border: "1px solid var(--border-soft)", display: "grid", placeItems: "center",
      boxShadow: "var(--shadow-sm)" }}>
      <Icon name={name} size={21} />
    </button>
  );
}

/* ============================================================
   DASHBOARD
   ============================================================ */
function Dashboard({ ctx }) {
  const { nav, theme, setTheme, tweaks } = ctx;
  if (tweaks.dataset === "empty") return <DashboardEmpty ctx={ctx} />;

  const stats = [
    { label: "Total loaned", value: DASH.totalLoaned, icon: "arrowUp", grad: "blue", tone: "var(--blue)" },
    { label: "Total received", value: DASH.totalReceived, icon: "arrowDown", grad: "green", tone: "var(--green)" },
    { label: "Outstanding", value: DASH.outstanding, icon: "wallet", tone: "var(--amber)", amber: true },
    { label: "Active loans", value: DASH.activeLoans, icon: "coins", count: true, tone: "var(--text)" },
  ];

  return (
    <div style={{ animation: "ll-fade .3s" }}>
      {/* app bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "6px 20px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <Logo size={40} />
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text)", lineHeight: 1 }}>LendLedger</div>
            <div style={{ fontSize: 12, color: "var(--text-faint)", fontWeight: 600, marginTop: 3 }}>Tue, 25 May 2026</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 9 }}>
          <IconBtn name="bell" />
          <IconBtn name={theme === "dark" ? "sun" : "moon"} onClick={() => setTheme(theme === "dark" ? "light" : "dark")} />
        </div>
      </div>

      <div style={{ padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
        {/* 2x2 stat grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
          {stats.map((s, i) => (
            <Card key={i} grad={s.grad} pad={14} style={{ position: "relative", overflow: "hidden" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span style={{ fontSize: 12.5, color: "var(--text-soft)", fontWeight: 650 }}>{s.label}</span>
                <span style={{ color: s.tone, opacity: 0.85, display: "grid", placeItems: "center",
                  width: 26, height: 26, borderRadius: 8, background: s.amber ? "var(--amber-tint)" : "var(--surface-2)" }}>
                  <Icon name={s.icon} size={15} stroke={2.1} />
                </span>
              </div>
              <div style={{ fontSize: s.count ? 30 : 22, fontWeight: 800, letterSpacing: "-0.03em",
                color: s.amber ? "var(--amber)" : "var(--text)", marginTop: 10 }}>
                {s.count ? s.value : formatINR(s.value)}
              </div>
            </Card>
          ))}
        </div>

        {/* action buttons */}
        <div style={{ display: "flex", gap: 10 }}>
          <PillButton variant="primary" icon="calc" full size="md" onClick={() => nav.setTab("calc")}>New calculation</PillButton>
          <PillButton variant="outline" icon="plus" size="md" onClick={() => nav.push("loaneeForm")} style={{ flexShrink: 0 }}>Loanee</PillButton>
        </div>

        {/* Donut */}
        <Card pad={16}>
          <div style={{ fontSize: 15, fontWeight: 750, color: "var(--text)", marginBottom: 4 }}>Outstanding by loanee</div>
          <div style={{ fontSize: 12.5, color: "var(--text-faint)", marginBottom: 14 }}>{formatINR(DASH.outstanding)} across {DASH.activeLoans} loans</div>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <DonutChart data={DASH.donut} size={132} thickness={20} />
              <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center" }}>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.03em" }}>{formatINR(DASH.outstanding)}</div>
                  <div style={{ fontSize: 10.5, color: "var(--text-faint)", fontWeight: 600 }}>OUTSTANDING</div>
                </div>
              </div>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 9 }}>
              {DASH.donut.map((d, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 9, height: 9, borderRadius: 99, background: d.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12.5, color: "var(--text-soft)", fontWeight: 600, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.name}</span>
                  <span style={{ fontSize: 12.5, color: "var(--text)", fontWeight: 700 }}>{formatINR(d.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Bar */}
        <Card pad={16}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 750, color: "var(--text)" }}>This week</div>
              <div style={{ fontSize: 12.5, color: "var(--text-faint)" }}>Expected vs received</div>
            </div>
            <div style={{ display: "flex", gap: 12, fontSize: 11.5, fontWeight: 650 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--text-soft)" }}><span style={{ width: 9, height: 9, borderRadius: 3, background: "var(--surface-sunken)", border: "1px solid var(--border)" }} />Expected</span>
              <span style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--text-soft)" }}><span style={{ width: 9, height: 9, borderRadius: 3, background: "var(--grad-green)" }} />Received</span>
            </div>
          </div>
          <BarChartPair data={DASH.week} />
        </Card>

        {/* Line */}
        <Card pad={16}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 750, color: "var(--text)" }}>Collections</div>
              <div style={{ fontSize: 12.5, color: "var(--text-faint)" }}>Last 30 days</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: "var(--green)", letterSpacing: "-0.02em" }}>+{formatINR(DASH.line.reduce((a,b)=>a+b,0))}</div>
              <div style={{ fontSize: 11, color: "var(--text-faint)", fontWeight: 600 }}>collected</div>
            </div>
          </div>
          <LineChart points={DASH.line} />
        </Card>

        {/* Active loans */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
          <span style={{ fontSize: 16, fontWeight: 750, color: "var(--text)" }}>Active loans</span>
          <button onClick={() => nav.setTab("loanees")} style={{ fontSize: 13, fontWeight: 650, color: "var(--blue)" }}>See all</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {LOANS.slice(0, 3).map(loan => {
            const ln = loaneeById(loan.loaneeId);
            return (
              <Card key={loan.id} pad={14} onClick={() => nav.push("loanDetail", { loanId: loan.id })}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Avatar initials={ln.initials} size={42} hue={ln.hue} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>{ln.name}</span>
                      <span style={{ fontSize: 14, fontWeight: 750, color: "var(--green)" }}>{formatINR(loan.daily)}/day</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", margin: "7px 0 8px" }}>
                      <span style={{ fontSize: 12, color: "var(--text-faint)", fontWeight: 600 }}>{loan.logged} of {loan.days} days</span>
                      <span style={{ fontSize: 12, color: "var(--text-soft)", fontWeight: 600 }}>{formatINR(loan.outstanding)} left</span>
                    </div>
                    <Progress value={loan.logged} max={loan.days} h={7} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DashboardEmpty({ ctx }) {
  const { nav, theme, setTheme } = ctx;
  return (
    <div style={{ animation: "ll-fade .3s", minHeight: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 20px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <Logo size={40} /><div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text)" }}>LendLedger</div>
        </div>
        <IconBtn name={theme === "dark" ? "sun" : "moon"} onClick={() => setTheme(theme === "dark" ? "light" : "dark")} />
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "40px 32px", gap: 8 }}>
        <div style={{ width: 110, height: 110, borderRadius: 28, background: "var(--card-grad-blue)", display: "grid", placeItems: "center", marginBottom: 14, border: "1px solid var(--border-soft)" }}>
          <Icon name="coins" size={50} stroke={1.4} style={{ color: "var(--blue)" }} />
        </div>
        <h2 style={{ margin: 0, fontSize: 21, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>No loans yet</h2>
        <p style={{ margin: "0 0 18px", fontSize: 14.5, color: "var(--text-soft)", lineHeight: 1.5, maxWidth: 260 }}>
          Run a quick calculation to set up your first daily-repayment loan and start tracking collections.
        </p>
        <PillButton variant="primary" icon="calc" onClick={() => nav.setTab("calc")}>Open calculator</PillButton>
        <button onClick={() => nav.push("loaneeForm")} style={{ fontSize: 14, fontWeight: 650, color: "var(--blue)", marginTop: 4 }}>+ Add a loanee first</button>
      </div>
    </div>
  );
}

/* ============================================================
   CALCULATOR
   ============================================================ */
function Field({ label, children, hint }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      <label style={{ fontSize: 13, fontWeight: 650, color: "var(--text-soft)" }}>{label}</label>
      {children}
      {hint && <span style={{ fontSize: 11.5, color: "var(--text-faint)" }}>{hint}</span>}
    </div>
  );
}
const inputStyle = {
  height: 52, borderRadius: "var(--radius-input)", border: "1.5px solid var(--border)",
  background: "var(--surface)", color: "var(--text)", fontSize: 16, fontWeight: 600,
  padding: "0 15px", width: "100%", outline: "none", transition: "border-color .15s",
};
function NumInput({ value, onChange, prefix, placeholder, big }) {
  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
      {prefix && <span style={{ position: "absolute", left: 15, fontSize: big ? 22 : 16, fontWeight: 700, color: "var(--text-faint)" }}>{prefix}</span>}
      <input type="number" inputMode="decimal" value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)} onFocus={e => e.target.style.borderColor = "var(--blue)"}
        onBlur={e => e.target.style.borderColor = "var(--border)"}
        style={{ ...inputStyle, height: big ? 62 : 52, fontSize: big ? 24 : 16, fontWeight: big ? 800 : 600,
          paddingLeft: prefix ? (big ? 38 : 32) : 15, letterSpacing: big ? "-0.02em" : 0 }} />
    </div>
  );
}
function Select({ value, onChange, options }) {
  return (
    <div style={{ position: "relative" }}>
      <select value={value} onChange={e => onChange(e.target.value)} style={{ ...inputStyle, appearance: "none", paddingRight: 38, cursor: "pointer" }}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <span style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%) rotate(90deg)", pointerEvents: "none", color: "var(--text-faint)" }}><Icon name="chevron" size={18} /></span>
    </div>
  );
}

function Calculator({ ctx }) {
  const { nav } = ctx;
  const [principal, setP] = useStateC("10000");
  const [rate, setR] = useStateC("1");
  const [ratePeriod, setRP] = useStateC("Per day");
  const [duration, setD] = useStateC("50");
  const [durUnit, setDU] = useStateC("Days");

  const P = parseFloat(principal) || 0;
  const ratePerDay = ratePeriod === "Per day" ? (parseFloat(rate)||0) : ratePeriod === "Per month" ? (parseFloat(rate)||0)/30 : (parseFloat(rate)||0)/365;
  const totalDays = durUnit === "Days" ? (parseFloat(duration)||0) : durUnit === "Months" ? (parseFloat(duration)||0)*30 : (parseFloat(duration)||0)*365;
  const totalInterest = P * (ratePerDay/100) * totalDays;
  const totalRepay = P + totalInterest;
  const daily = totalDays > 0 ? totalRepay / totalDays : 0;

  ctx._calc = { P, rate, ratePeriod, duration, durUnit, totalDays, totalInterest, totalRepay, daily };

  return (
    <div style={{ animation: "ll-fade .3s", paddingBottom: 8 }}>
      <TabHeader title="Loan calculator" sub="Flat daily interest" />
      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 14 }}>
        <Card pad={18} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Field label="Principal amount">
            <NumInput value={principal} onChange={setP} prefix="₹" placeholder="10000" big />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.15fr", gap: 12 }}>
            <Field label="Interest rate"><NumInput value={rate} onChange={setR} prefix="%" placeholder="1" /></Field>
            <Field label="Rate period"><Select value={ratePeriod} onChange={setRP} options={["Per day","Per month","Per year"]} /></Field>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.15fr", gap: 12 }}>
            <Field label="Duration"><NumInput value={duration} onChange={setD} placeholder="50" /></Field>
            <Field label="Unit"><Select value={durUnit} onChange={setDU} options={["Days","Months","Years"]} /></Field>
          </div>
        </Card>

        {/* results */}
        <Card grad="green" pad={18} elev style={{ position: "relative", overflow: "hidden" }}>
          <div style={{ fontSize: 13, fontWeight: 650, color: "var(--text-soft)", marginBottom: 2 }}>Daily payment</div>
          <div style={{ fontSize: 46, fontWeight: 800, color: "var(--green)", letterSpacing: "-0.04em", lineHeight: 1.05 }}>
            {formatINR(daily, true)}
          </div>
          <div style={{ fontSize: 13, color: "var(--text-soft)", fontWeight: 600, marginTop: 2 }}>over {Math.round(totalDays)} days</div>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <div style={{ flex: 1, background: "var(--surface)", borderRadius: 13, padding: "12px 14px", border: "1px solid var(--border-soft)" }}>
              <div style={{ fontSize: 11.5, color: "var(--text-faint)", fontWeight: 600, marginBottom: 3 }}>Total repayable</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>{formatINR(totalRepay, true)}</div>
            </div>
            <div style={{ flex: 1, background: "var(--surface)", borderRadius: 13, padding: "12px 14px", border: "1px solid var(--border-soft)" }}>
              <div style={{ fontSize: 11.5, color: "var(--text-faint)", fontWeight: 600, marginBottom: 3 }}>Total interest</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "var(--blue)", letterSpacing: "-0.02em" }}>{formatINR(totalInterest, true)}</div>
            </div>
          </div>
        </Card>

        <div style={{ display: "flex", gap: 9, alignItems: "flex-start", padding: "2px 4px" }}>
          <Icon name="info" size={16} style={{ color: "var(--text-faint)", flexShrink: 0, marginTop: 1 }} />
          <p style={{ margin: 0, fontSize: 12.5, color: "var(--text-faint)", lineHeight: 1.5 }}>
            Flat interest spread evenly. Eg. ₹100 at 1%/day for 50 days → ₹50 interest, ₹150 total, ₹3.00 per day.
          </p>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Dashboard, Calculator, TabHeader, IconBtn, Field, NumInput, Select, inputStyle, loaneeById });
