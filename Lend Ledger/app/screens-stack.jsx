/* ============================================================
   LendLedger — stack screens (part 1)
   StackHeader · Onboarding · CreateLoan · LoaneeForm · LoaneeDetail
   ============================================================ */

function StackHeader({ title, onBack, right }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 16px 14px" }}>
      <button onClick={onBack} style={{ width: 42, height: 42, borderRadius: 13, background: "var(--surface)",
        border: "1px solid var(--border-soft)", display: "grid", placeItems: "center", color: "var(--text)",
        boxShadow: "var(--shadow-sm)" }}>
        <Icon name="back" size={21} />
      </button>
      <h1 style={{ flex: 1, margin: 0, fontSize: 19, fontWeight: 750, letterSpacing: "-0.02em", color: "var(--text)" }}>{title}</h1>
      {right}
    </div>
  );
}

/* sticky bottom action bar inside the phone */
function BottomBar({ children }) {
  return (
    <div style={{ position: "sticky", bottom: 0, padding: "14px 20px calc(14px + env(safe-area-inset-bottom))",
      background: "linear-gradient(to top, var(--bg) 72%, transparent)", display: "flex", flexDirection: "column",
      gap: 8, zIndex: 5 }}>{children}</div>
  );
}

/* ============================================================
   ONBOARDING (2 steps)
   ============================================================ */
function Onboarding({ ctx }) {
  const { nav } = ctx;
  const [step, setStep] = React.useState(0);
  const [remind, setRemind] = React.useState(true);
  const [freq, setFreq] = React.useState("Once daily");
  const [times, setTimes] = React.useState(["7:00 PM"]);

  if (step === 0) {
    return (
      <div style={{ minHeight: "100%", display: "flex", flexDirection: "column", animation: "ll-fade .3s" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          textAlign: "center", padding: "20px 34px", gap: 0 }}>
          <Logo size={84} radius={24} />
          <h1 style={{ margin: "28px 0 8px", fontSize: 33, fontWeight: 800, letterSpacing: "-0.04em", color: "var(--text)" }}>LendLedger</h1>
          <p style={{ margin: 0, fontSize: 16, color: "var(--text-soft)", fontWeight: 600 }}>Track daily lending, simply.</p>

          <div style={{ marginTop: 40, width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { icon: "people", c: "var(--blue)", bg: "var(--blue-tint)", t: "Track your loanees", s: "Keep every borrower in one place" },
              { icon: "check", c: "var(--green)", bg: "var(--green-tint)", t: "Mark daily payments", s: "Paid, unpaid or partial in one tap" },
              { icon: "grid", c: "var(--amber)", bg: "var(--amber-tint)", t: "See dashboard insights", s: "Totals and charts at a glance" },
            ].map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, textAlign: "left",
                background: "var(--surface)", border: "1px solid var(--border-soft)", borderRadius: 16, padding: 14, boxShadow: "var(--shadow-sm)" }}>
                <span style={{ width: 44, height: 44, borderRadius: 12, background: f.bg, color: f.c, display: "grid", placeItems: "center", flexShrink: 0 }}><Icon name={f.icon} size={22} /></span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>{f.t}</div>
                  <div style={{ fontSize: 12.5, color: "var(--text-faint)", marginTop: 2 }}>{f.s}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <BottomBar>
          <PillButton variant="primary" full onClick={() => setStep(1)}>Get started</PillButton>
        </BottomBar>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column", animation: "ll-fade .3s" }}>
      <StackHeader title="" onBack={() => setStep(0)} />
      <div style={{ flex: 1, padding: "8px 24px", display: "flex", flexDirection: "column", gap: 8 }}>
        <span style={{ width: 56, height: 56, borderRadius: 16, background: "var(--card-grad-blue)", border: "1px solid var(--border-soft)",
          display: "grid", placeItems: "center", color: "var(--blue)", marginBottom: 6 }}><Icon name="bell" size={28} /></span>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text)" }}>Stay on top of collections</h1>
        <p style={{ margin: "0 0 14px", fontSize: 14.5, color: "var(--text-soft)", lineHeight: 1.5 }}>
          Get a daily nudge to log who paid. You can change this anytime in Settings.
        </p>

        <Card pad={16} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>Enable reminders</div>
              <div style={{ fontSize: 12.5, color: "var(--text-faint)", marginTop: 2 }}>Recommended</div>
            </div>
            <Toggle on={remind} onChange={setRemind} />
          </div>

          <div style={{ opacity: remind ? 1 : 0.4, pointerEvents: remind ? "auto" : "none", transition: "opacity .2s", display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 650, color: "var(--text-soft)", marginBottom: 8 }}>Frequency</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {["Once daily","Twice daily","Three times daily","Custom"].map(f => (
                  <button key={f} onClick={() => setFreq(f)} style={{
                    padding: "11px 10px", borderRadius: 12, fontSize: 13, fontWeight: 650, textAlign: "left",
                    border: "1.5px solid " + (freq === f ? "var(--blue)" : "var(--border)"),
                    background: freq === f ? "var(--blue-tint)" : "var(--surface)",
                    color: freq === f ? "var(--blue)" : "var(--text-soft)" }}>{f}</button>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 13, fontWeight: 650, color: "var(--text-soft)", marginBottom: 8 }}>Reminder time</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {times.map((t, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, background: "var(--surface-sunken)", borderRadius: 12, padding: "12px 14px" }}>
                    <Icon name="clock" size={18} style={{ color: "var(--blue)" }} />
                    <span style={{ flex: 1, fontSize: 15, fontWeight: 700, color: "var(--text)" }}>{t}</span>
                    {times.length > 1 && <button onClick={() => setTimes(times.filter((_, j) => j !== i))} style={{ color: "var(--text-faint)" }}><Icon name="x" size={16} /></button>}
                  </div>
                ))}
              </div>
              <button onClick={() => setTimes([...times, "9:00 AM"])} style={{ display: "flex", alignItems: "center", gap: 7, color: "var(--blue)", fontSize: 13.5, fontWeight: 700, marginTop: 10 }}>
                <Icon name="plus" size={17} /> Add another time
              </button>
            </div>
          </div>
        </Card>
      </div>
      <BottomBar>
        <PillButton variant="primary" full onClick={() => nav.finishOnboarding()}>Continue to dashboard</PillButton>
      </BottomBar>
    </div>
  );
}

/* ============================================================
   CREATE / CONFIRM LOAN
   ============================================================ */
function CreateLoan({ ctx }) {
  const { nav } = ctx;
  const calc = ctx._calc || { P: 100, rate: "1", ratePeriod: "Per day", totalDays: 50, daily: 3, totalRepay: 150, totalInterest: 50 };
  const [sel, setSel] = React.useState(null);
  const [query, setQuery] = React.useState("");
  const filtered = LOANEES.filter(l => l.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column", animation: "ll-fade .3s" }}>
      <StackHeader title="Create loan" onBack={() => nav.pop()} />
      <div style={{ flex: 1, padding: "4px 20px 8px", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* loanee picker */}
        <div>
          <SectionLabel n="1" text="Select loanee" />
          <div style={{ position: "relative", marginBottom: 11 }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-faint)" }}><Icon name="search" size={18} /></span>
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search loanees…"
              style={{ ...inputStyle, height: 48, paddingLeft: 42, fontSize: 14.5 }} />
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
            {filtered.map(l => (
              <button key={l.id} onClick={() => setSel(l.id)} style={{
                display: "flex", alignItems: "center", gap: 8, padding: "7px 13px 7px 7px", borderRadius: 99,
                border: "1.5px solid " + (sel === l.id ? "var(--blue)" : "var(--border)"),
                background: sel === l.id ? "var(--blue-tint)" : "var(--surface)" }}>
                <Avatar initials={l.initials} size={26} hue={l.hue} />
                <span style={{ fontSize: 13.5, fontWeight: 650, color: sel === l.id ? "var(--blue)" : "var(--text)" }}>{l.name}</span>
                {sel === l.id && <Icon name="check" size={15} style={{ color: "var(--blue)" }} />}
              </button>
            ))}
          </div>
          <button onClick={() => nav.push("loaneeForm")} style={{ display: "flex", alignItems: "center", gap: 7, color: "var(--blue)", fontSize: 14, fontWeight: 700 }}>
            <Icon name="plus" size={18} /> Add new loanee
          </button>
        </div>

        {/* terms summary */}
        <div>
          <SectionLabel n="2" text="Loan terms" />
          <Card grad="blue" pad={16}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 12px" }}>
              <Term label="Principal" value={formatINR(calc.P)} />
              <Term label="Rate" value={calc.rate + "% " + (calc.ratePeriod || "per day").toLowerCase()} />
              <Term label="Duration" value={Math.round(calc.totalDays) + " days"} />
              <Term label="Daily payment" value={formatINR(calc.daily, true)} accent="var(--green)" />
            </div>
            <div style={{ height: 1, background: "var(--border-soft)", margin: "14px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, color: "var(--text-soft)", fontWeight: 600 }}>Total repayable</span>
              <span style={{ fontSize: 19, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>{formatINR(calc.totalRepay, true)}</span>
            </div>
          </Card>
        </div>

        {/* start date */}
        <div>
          <SectionLabel n="3" text="Start date" />
          <button style={{ width: "100%", display: "flex", alignItems: "center", gap: 13, background: "var(--surface)",
            border: "1.5px solid var(--border)", borderRadius: "var(--radius-input)", padding: "14px 16px", textAlign: "left" }}>
            <span style={{ width: 40, height: 40, borderRadius: 11, background: "var(--blue-tint)", color: "var(--blue)", display: "grid", placeItems: "center" }}><Icon name="calendar" size={20} /></span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>Today, 25 May 2026</div>
              <div style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 1 }}>Daily entries start from this date</div>
            </div>
            <Icon name="chevron" size={19} style={{ color: "var(--text-faint)" }} />
          </button>
        </div>
      </div>

      <BottomBar>
        <PillButton variant="primary" full disabled={!sel} onClick={() => nav.push("loanDetail", { loanId: "l1" })}>Confirm &amp; create loan</PillButton>
        <button onClick={() => nav.setTab("calc")} style={{ fontSize: 13.5, fontWeight: 650, color: "var(--text-soft)", padding: 6 }}>Back to calculator</button>
      </BottomBar>
    </div>
  );
}
function SectionLabel({ n, text }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
      <span style={{ width: 22, height: 22, borderRadius: 7, background: "var(--grad-primary)", color: "#fff",
        fontSize: 12, fontWeight: 800, display: "grid", placeItems: "center" }}>{n}</span>
      <span style={{ fontSize: 15, fontWeight: 750, color: "var(--text)" }}>{text}</span>
    </div>
  );
}
function Term({ label, value, accent }) {
  return (
    <div>
      <div style={{ fontSize: 11.5, color: "var(--text-faint)", fontWeight: 600, marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 800, color: accent || "var(--text)", letterSpacing: "-0.02em" }}>{value}</div>
    </div>
  );
}

/* ============================================================
   ADD / EDIT LOANEE (modal-style screen)
   ============================================================ */
function LoaneeForm({ ctx }) {
  const { nav } = ctx;
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [notes, setNotes] = React.useState("");

  return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column", animation: "ll-fade .3s" }}>
      <StackHeader title="Add loanee" onBack={() => nav.pop()} />
      <div style={{ flex: 1, padding: "4px 20px", display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "flex", justifyContent: "center", padding: "6px 0 4px" }}>
          <div style={{ position: "relative" }}>
            <Avatar initials={name ? name.trim().slice(0,2).toUpperCase() : "?"} size={76} hue={254} />
            <span style={{ position: "absolute", bottom: -2, right: -2, width: 28, height: 28, borderRadius: 99, background: "var(--blue)", color: "#fff", display: "grid", placeItems: "center", border: "3px solid var(--bg)" }}><Icon name="edit" size={14} /></span>
          </div>
        </div>
        <Card pad={18} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Field label="Name" hint="Required">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Ravi Kumar" style={inputStyle}
              onFocus={e => e.target.style.borderColor = "var(--blue)"} onBlur={e => e.target.style.borderColor = "var(--border)"} />
          </Field>
          <Field label="Phone" hint="Optional">
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 " inputMode="tel" style={inputStyle}
              onFocus={e => e.target.style.borderColor = "var(--blue)"} onBlur={e => e.target.style.borderColor = "var(--border)"} />
          </Field>
          <Field label="Notes" hint="Optional">
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Shop name, location, anything useful…" rows={3}
              style={{ ...inputStyle, height: "auto", padding: "13px 15px", resize: "none", lineHeight: 1.5 }}
              onFocus={e => e.target.style.borderColor = "var(--blue)"} onBlur={e => e.target.style.borderColor = "var(--border)"} />
          </Field>
        </Card>
      </div>
      <BottomBar>
        <PillButton variant="primary" full disabled={!name.trim()} onClick={() => nav.pop()}>Save loanee</PillButton>
        <button onClick={() => nav.pop()} style={{ fontSize: 13.5, fontWeight: 650, color: "var(--text-soft)", padding: 6 }}>Cancel</button>
      </BottomBar>
    </div>
  );
}

/* ============================================================
   LOANEE DETAIL
   ============================================================ */
function LoaneeDetail({ ctx, params }) {
  const { nav } = ctx;
  const ln = LOANEES.find(l => l.id === params.loaneeId) || LOANEES[0];
  const active = LOANS.filter(l => l.loaneeId === ln.id);

  return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column", animation: "ll-fade .3s" }}>
      <StackHeader title="Loanee" onBack={() => nav.pop()}
        right={<IconBtn name="edit" onClick={() => nav.push("loaneeForm")} />} />
      <div style={{ flex: 1, padding: "4px 20px 8px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
          <Avatar initials={ln.initials} size={68} hue={ln.hue} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.03em" }}>{ln.name}</div>
            <a href="#" onClick={e=>e.preventDefault()} style={{ fontSize: 13.5, color: "var(--blue)", fontWeight: 650, marginTop: 3, display: "flex", alignItems: "center", gap: 6 }}>
              <Icon name="phone" size={15} /> {ln.phone}
            </a>
          </div>
        </div>

        {ln.notes && (
          <Card pad={14} style={{ display: "flex", gap: 10 }}>
            <Icon name="note" size={18} style={{ color: "var(--text-faint)", flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontSize: 13.5, color: "var(--text-soft)", lineHeight: 1.5 }}>{ln.notes}</span>
          </Card>
        )}

        <div style={{ display: "flex", gap: 11 }}>
          <Card pad={14} style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: "var(--text-faint)", fontWeight: 600 }}>Active loans</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text)", marginTop: 4 }}>{active.length}</div>
          </Card>
          <Card pad={14} style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: "var(--text-faint)", fontWeight: 600 }}>Outstanding</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "var(--amber)", marginTop: 4 }}>{formatINR(active.reduce((s,l)=>s+l.outstanding,0))}</div>
          </Card>
        </div>

        <div>
          <div style={{ fontSize: 14, fontWeight: 750, color: "var(--text)", margin: "4px 2px 10px" }}>Loans</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {active.map(loan => (
              <Card key={loan.id} pad={14} onClick={() => nav.push("loanDetail", { loanId: loan.id })}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 9 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 750, color: "var(--text)" }}>{formatINR(loan.principal)}</span>
                    <StatusPill status={loan.status} />
                  </div>
                  <Icon name="chevron" size={18} style={{ color: "var(--text-faint)" }} />
                </div>
                <Progress value={loan.logged} max={loan.days} h={7} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 12, fontWeight: 600 }}>
                  <span style={{ color: "var(--text-faint)" }}>{loan.logged}/{loan.days} days</span>
                  <span style={{ color: "var(--text-soft)" }}>{formatINR(loan.daily)}/day</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
      <BottomBar>
        <div style={{ display: "flex", gap: 10 }}>
          <PillButton variant="soft" full icon="trash" disabled style={{ flex: 1 }}>Delete</PillButton>
          <PillButton variant="primary" full icon="edit" onClick={() => nav.push("loaneeForm")} style={{ flex: 1 }}>Edit</PillButton>
        </div>
        <div style={{ textAlign: "center", fontSize: 11.5, color: "var(--text-faint)", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
          <Icon name="info" size={13} /> Close active loans before deleting
        </div>
      </BottomBar>
    </div>
  );
}

Object.assign(window, { StackHeader, BottomBar, Onboarding, CreateLoan, LoaneeForm, LoaneeDetail, SectionLabel, Term });
