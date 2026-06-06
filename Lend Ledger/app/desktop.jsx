/* ============================================================
   LendLedger — Desktop (web) layout
   Sidebar nav + multi-column dashboard. Reuses mobile screen
   components for forms/lists; stack screens open as centered modals.
   ============================================================ */

function DesktopApp({ theme, setTheme, tweaks }) {
  const [tab, setTab] = React.useState("home");
  const [stack, setStack] = React.useState([]);

  const nav = {
    push: (screen, params = {}) => setStack(s => [...s, { screen, params }]),
    pop: () => setStack(s => s.slice(0, -1)),
    setTab: (t) => { setStack([]); setTab(t); },
    finishOnboarding: () => setStack([]),
  };
  const ctx = { nav, theme, setTheme, tweaks };
  // share calc across desktop
  if (!window.__dtCalc) window.__dtCalc = {};
  ctx._calc = window.__dtCalc;

  const navItems = [
    { id: "home", icon: "home", label: "Dashboard" },
    { id: "calc", icon: "calc", label: "Calculator" },
    { id: "loanees", icon: "people", label: "Loanees" },
    { id: "settings", icon: "settings", label: "Settings" },
  ];

  const top = stack[stack.length - 1];
  const StackComp = top ? { loanDetail: LoanDetail, createLoan: CreateLoan, extendLoan: ExtendLoan,
    loaneeForm: LoaneeForm, loaneeDetail: LoaneeDetail }[top.screen] : null;

  return (
    <div data-theme={theme} className="ll-app" style={{ display: "flex", height: "100%", background: "var(--bg)", color: "var(--text)" }}>
      {/* Sidebar */}
      <aside style={{ width: 256, flexShrink: 0, background: "var(--bg-elev)", borderRight: "1px solid var(--border)",
        display: "flex", flexDirection: "column", padding: "22px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "0 8px 26px" }}>
          <Logo size={38} />
          <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.03em" }}>LendLedger</div>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {navItems.map(n => {
            const active = tab === n.id;
            return (
              <button key={n.id} onClick={() => nav.setTab(n.id)} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "11px 13px", borderRadius: 12,
                background: active ? "var(--blue-tint)" : "transparent", color: active ? "var(--blue)" : "var(--text-soft)",
                fontSize: 14.5, fontWeight: 650, transition: "all .15s", textAlign: "left" }}>
                <Icon name={n.icon} size={20} stroke={active ? 2.1 : 1.9} /> {n.label}
              </button>
            );
          })}
        </nav>
        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} style={{
            display: "flex", alignItems: "center", gap: 11, padding: "11px 13px", borderRadius: 12,
            background: "var(--surface)", border: "1px solid var(--border-soft)", color: "var(--text-soft)", fontSize: 14, fontWeight: 650 }}>
            <Icon name={theme === "dark" ? "sun" : "moon"} size={19} /> {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "0 8px" }}>
            <div style={{ fontSize: 11.5, color: "var(--text-faint)", fontWeight: 600 }}>v1.0.0 · data on this device</div>
          </div>
        </div>
      </aside>

      {/* Content */}
      <main className="ll-scroll" style={{ flex: 1, overflowY: "auto", position: "relative" }}>
        {tab === "home" && <DesktopDashboard ctx={ctx} />}
        {tab === "calc" && <DesktopCentered max={560}><Calculator ctx={ctx} /></DesktopCentered>}
        {tab === "loanees" && <DesktopCentered max={620}><Loanees ctx={ctx} /></DesktopCentered>}
        {tab === "settings" && <DesktopCentered max={560}><Settings ctx={ctx} /></DesktopCentered>}
      </main>

      {/* Stack modal */}
      {StackComp && (
        <div onClick={() => nav.pop()} style={{ position: "fixed", inset: 0, zIndex: 80, background: "var(--scrim)",
          display: "grid", placeItems: "center", padding: 30, animation: "ll-fade .2s" }}>
          <div onClick={e => e.stopPropagation()} className="ll-scroll" style={{ width: 460, maxHeight: "90vh", overflowY: "auto",
            background: "var(--bg)", borderRadius: 26, boxShadow: "var(--shadow-lg)", animation: "ll-pop .25s var(--ease)", position: "relative" }}>
            <StackComp ctx={ctx} params={top.params} />
          </div>
        </div>
      )}
    </div>
  );
}

function DesktopCentered({ children, max = 600 }) {
  return (
    <div style={{ padding: "26px 0 60px", display: "flex", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: max }}>{children}</div>
    </div>
  );
}

/* ---------- Desktop dashboard ---------- */
function DesktopDashboard({ ctx }) {
  const { nav, theme, setTheme, tweaks } = ctx;
  if (tweaks.dataset === "empty") {
    return (
      <div style={{ display: "grid", placeItems: "center", height: "100%", textAlign: "center" }}>
        <div style={{ maxWidth: 360 }}>
          <div style={{ width: 120, height: 120, borderRadius: 30, background: "var(--card-grad-blue)", display: "grid", placeItems: "center", margin: "0 auto 20px", border: "1px solid var(--border-soft)" }}>
            <Icon name="coins" size={54} stroke={1.4} style={{ color: "var(--blue)" }} />
          </div>
          <h2 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 800 }}>No loans yet</h2>
          <p style={{ margin: "0 0 20px", color: "var(--text-soft)", fontSize: 15, lineHeight: 1.5 }}>Run a quick calculation to set up your first daily-repayment loan.</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <PillButton variant="primary" icon="calc" onClick={() => nav.setTab("calc")}>Open calculator</PillButton>
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Total loaned", value: DASH.totalLoaned, icon: "arrowUp", grad: "blue", tone: "var(--blue)" },
    { label: "Total received", value: DASH.totalReceived, icon: "arrowDown", grad: "green", tone: "var(--green)" },
    { label: "Outstanding", value: DASH.outstanding, icon: "wallet", tone: "var(--amber)", amber: true },
    { label: "Active loans", value: DASH.activeLoans, icon: "coins", count: true, tone: "var(--text)" },
  ];

  return (
    <div style={{ padding: "24px 32px 60px", maxWidth: 1180, margin: "0 auto", animation: "ll-fade .3s" }}>
      {/* top bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em" }}>Dashboard</h1>
          <div style={{ fontSize: 14, color: "var(--text-faint)", fontWeight: 600, marginTop: 3 }}>Tuesday, 25 May 2026</div>
        </div>
        <div style={{ display: "flex", gap: 11 }}>
          <PillButton variant="outline" icon="plus" size="md" onClick={() => nav.push("loaneeForm")}>Add loanee</PillButton>
          <PillButton variant="primary" icon="calc" size="md" onClick={() => nav.setTab("calc")}>New calculation</PillButton>
        </div>
      </div>

      {/* stat row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 16 }}>
        {stats.map((s, i) => (
          <Card key={i} grad={s.grad} pad={18}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13.5, color: "var(--text-soft)", fontWeight: 650 }}>{s.label}</span>
              <span style={{ color: s.tone, display: "grid", placeItems: "center", width: 32, height: 32, borderRadius: 10,
                background: s.amber ? "var(--amber-tint)" : "var(--surface-2)" }}><Icon name={s.icon} size={17} stroke={2.1} /></span>
            </div>
            <div style={{ fontSize: s.count ? 34 : 27, fontWeight: 800, letterSpacing: "-0.03em",
              color: s.amber ? "var(--amber)" : "var(--text)", marginTop: 12 }}>
              {s.count ? s.value : formatINR(s.value)}
            </div>
          </Card>
        ))}
      </div>

      {/* charts + active loans grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: 16, marginBottom: 16 }}>
        {/* donut */}
        <Card pad={20}>
          <div style={{ fontSize: 16, fontWeight: 750, marginBottom: 16 }}>Outstanding by loanee</div>
          <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <DonutChart data={DASH.donut} size={168} thickness={24} />
              <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center" }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.03em" }}>{formatINR(DASH.outstanding)}</div>
                  <div style={{ fontSize: 11, color: "var(--text-faint)", fontWeight: 600 }}>OUTSTANDING</div>
                </div>
              </div>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 11 }}>
              {DASH.donut.map((d, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 99, background: d.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 13.5, color: "var(--text-soft)", fontWeight: 600, flex: 1 }}>{d.name}</span>
                  <span style={{ fontSize: 13.5, color: "var(--text)", fontWeight: 700 }}>{formatINR(d.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* active loans */}
        <Card pad={20}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontSize: 16, fontWeight: 750 }}>Active loans</span>
            <button onClick={() => nav.setTab("loanees")} style={{ fontSize: 13, fontWeight: 650, color: "var(--blue)" }}>See all</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {LOANS.map((loan, i) => {
              const ln = LOANEES.find(l => l.id === loan.loaneeId);
              return (
                <div key={loan.id} onClick={() => nav.push("loanDetail", { loanId: loan.id })} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "11px 8px", borderRadius: 12, cursor: "pointer",
                  borderBottom: i < LOANS.length - 1 ? "1px solid var(--border-soft)" : "none" }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--surface-2)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <Avatar initials={ln.initials} size={38} hue={ln.hue} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{ln.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-faint)", fontWeight: 600, marginTop: 2 }}>{loan.logged}/{loan.days} days · {formatINR(loan.daily)}/day</div>
                  </div>
                  <div style={{ width: 80 }}><Progress value={loan.logged} max={loan.days} h={6} /></div>
                  <div style={{ width: 78, textAlign: "right", fontSize: 13.5, fontWeight: 700, color: "var(--amber)" }}>{formatINR(loan.outstanding)}</div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* bar + line */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 16 }}>
        <Card pad={20}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 750 }}>This week</div>
              <div style={{ fontSize: 12.5, color: "var(--text-faint)" }}>Expected vs received</div>
            </div>
            <div style={{ display: "flex", gap: 12, fontSize: 11.5, fontWeight: 650, alignItems: "center" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--text-soft)" }}><span style={{ width: 9, height: 9, borderRadius: 3, background: "var(--surface-sunken)", border: "1px solid var(--border)" }} />Expected</span>
              <span style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--text-soft)" }}><span style={{ width: 9, height: 9, borderRadius: 3, background: "var(--grad-green)" }} />Received</span>
            </div>
          </div>
          <BarChartPair data={DASH.week} height={150} />
        </Card>
        <Card pad={20}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 750 }}>Collections</div>
              <div style={{ fontSize: 12.5, color: "var(--text-faint)" }}>Last 30 days</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: "var(--green)", letterSpacing: "-0.02em" }}>+{formatINR(DASH.line.reduce((a,b)=>a+b,0))}</div>
              <div style={{ fontSize: 11, color: "var(--text-faint)", fontWeight: 600 }}>collected</div>
            </div>
          </div>
          <div style={{ paddingTop: 18 }}><LineChart points={DASH.line} width={520} height={150} /></div>
        </Card>
      </div>
    </div>
  );
}

Object.assign(window, { DesktopApp, DesktopDashboard, DesktopCentered });
