/* ============================================================
   LendLedger — Loanees & Settings tabs
   ============================================================ */

/* ============================================================
   LOANEES
   ============================================================ */
function Loanees({ ctx }) {
  const { nav, tweaks } = ctx;
  const empty = tweaks.dataset === "empty";

  const loaneeStats = {
    rk: { active: 1, out: 5400 }, ps: { active: 1, out: 8000 },
    av: { active: 1, out: 6750 }, sd: { active: 1, out: 15200 },
  };

  return (
    <div style={{ animation: "ll-fade .3s" }}>
      <TabHeader title="Loanees" sub={empty ? "" : LOANEES.length + " people"}
        right={<IconBtn name="plus" active onClick={() => nav.push("loaneeForm")} />} />

      {empty ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "70px 32px 40px", gap: 8 }}>
          <div style={{ width: 110, height: 110, borderRadius: 28, background: "var(--card-grad-green)", display: "grid", placeItems: "center", marginBottom: 14, border: "1px solid var(--border-soft)" }}>
            <Icon name="people" size={48} stroke={1.4} style={{ color: "var(--green)" }} />
          </div>
          <h2 style={{ margin: 0, fontSize: 21, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>No loanees yet</h2>
          <p style={{ margin: "0 0 18px", fontSize: 14.5, color: "var(--text-soft)", lineHeight: 1.5, maxWidth: 250 }}>Add the people you lend to so you can track their daily repayments.</p>
          <PillButton variant="green" icon="plus" onClick={() => nav.push("loaneeForm")}>Add loanee</PillButton>
        </div>
      ) : (
        <div style={{ padding: "0 20px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          {LOANEES.map(ln => {
            const st = loaneeStats[ln.id];
            return (
              <Card key={ln.id} pad={14} onClick={() => nav.push("loaneeDetail", { loaneeId: ln.id })}>
                <Row style={{ padding: 0 }}>
                  <Avatar initials={ln.initials} size={48} hue={ln.hue} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15.5, fontWeight: 700, color: "var(--text)" }}>{ln.name}</div>
                    <div style={{ fontSize: 12.5, color: "var(--text-faint)", fontWeight: 600, marginTop: 2 }}>{ln.phone}</div>
                    <div style={{ fontSize: 12.5, color: "var(--text-soft)", fontWeight: 600, marginTop: 5, display: "flex", alignItems: "center", gap: 6 }}>
                      <span>{st.active} active loan{st.active>1?"s":""}</span>
                      <span style={{ width: 3, height: 3, borderRadius: 99, background: "var(--text-faint)" }} />
                      <span style={{ color: "var(--amber)", fontWeight: 700 }}>{formatINR(st.out)} out</span>
                    </div>
                  </div>
                  <Icon name="chevron" size={20} style={{ color: "var(--text-faint)", flexShrink: 0 }} />
                </Row>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   SETTINGS
   ============================================================ */
function SettingsSection({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-faint)", letterSpacing: "0.06em",
        textTransform: "uppercase", padding: "0 6px 9px" }}>{label}</div>
      <Card pad={0} style={{ overflow: "hidden" }}>{children}</Card>
    </div>
  );
}
function SettingRow({ icon, iconColor, title, sub, right, onClick, last }) {
  return (
    <div onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 13, padding: "14px 16px",
      borderBottom: last ? "none" : "1px solid var(--border-soft)", cursor: onClick ? "pointer" : "default" }}>
      {icon && <span style={{ width: 34, height: 34, borderRadius: 10, background: iconColor ? iconColor.bg : "var(--surface-sunken)",
        color: iconColor ? iconColor.c : "var(--text-soft)", display: "grid", placeItems: "center", flexShrink: 0 }}><Icon name={icon} size={18} /></span>}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 650, color: "var(--text)" }}>{title}</div>
        {sub && <div style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 2 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

function Settings({ ctx }) {
  const { theme, setTheme } = ctx;
  const [remind, setRemind] = React.useState(true);
  const [freq, setFreq] = React.useState("Once daily");
  const [times, setTimes] = React.useState(["7:00 PM", "9:00 AM"]);

  const themeVal = theme === "dark" ? "Dark" : "Light";

  return (
    <div style={{ animation: "ll-fade .3s" }}>
      <TabHeader title="Settings" />
      <div style={{ padding: "0 20px 16px", display: "flex", flexDirection: "column", gap: 22 }}>

        <SettingsSection label="Appearance">
          <div style={{ padding: 16 }}>
            <SettingRow icon="sun" iconColor={{ bg: "var(--amber-tint)", c: "var(--amber)" }} title="Theme" sub="Choose how LendLedger looks" last />
            <div style={{ marginTop: 4 }}>
              <Segmented options={["Light", "Dark", "System"]} value={themeVal}
                onChange={v => setTheme(v === "Dark" ? "dark" : "light")} />
            </div>
          </div>
        </SettingsSection>

        <SettingsSection label="Reminders">
          <SettingRow icon="bell" iconColor={{ bg: "var(--blue-tint)", c: "var(--blue)" }}
            title="Enable reminders" sub="Daily nudge to log collections"
            right={<Toggle on={remind} onChange={setRemind} />} />
          <div style={{ opacity: remind ? 1 : 0.4, pointerEvents: remind ? "auto" : "none", transition: "opacity .2s" }}>
            <SettingRow icon="clock" iconColor={{ bg: "var(--green-tint)", c: "var(--green)" }} title="Frequency"
              right={<MiniSelect value={freq} onChange={setFreq} options={["Once daily","Twice daily","Three times daily","Custom"]} />} />
            <div style={{ padding: "12px 16px 4px" }}>
              <div style={{ fontSize: 12.5, fontWeight: 650, color: "var(--text-soft)", marginBottom: 8 }}>Notification times</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {times.map((t, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, background: "var(--surface-sunken)",
                    borderRadius: 12, padding: "10px 12px" }}>
                    <Icon name="clock" size={17} style={{ color: "var(--blue)" }} />
                    <span style={{ flex: 1, fontSize: 14.5, fontWeight: 650, color: "var(--text)" }}>{t}</span>
                    <button onClick={() => setTimes(times.filter((_, j) => j !== i))}
                      style={{ color: "var(--text-faint)", display: "grid", placeItems: "center", width: 28, height: 28 }}>
                      <Icon name="trash" size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={() => setTimes([...times, "6:00 PM"])}
                style={{ display: "flex", alignItems: "center", gap: 7, color: "var(--blue)", fontSize: 13.5,
                  fontWeight: 700, marginTop: 11, padding: "4px 2px" }}>
                <Icon name="plus" size={17} /> Add time
              </button>
            </div>
          </div>
        </SettingsSection>

        <SettingsSection label="About">
          <SettingRow icon="info" title="App version" right={<span style={{ fontSize: 13.5, color: "var(--text-faint)", fontWeight: 600 }}>1.0.0</span>} />
          <SettingRow icon="shield" title="Privacy policy" right={<Icon name="chevron" size={18} style={{ color: "var(--text-faint)" }} />} onClick={()=>{}} />
          <div style={{ padding: "13px 16px", display: "flex", gap: 9, alignItems: "center" }}>
            <Icon name="phone" size={15} style={{ color: "var(--green)" }} />
            <span style={{ fontSize: 12.5, color: "var(--text-faint)", fontWeight: 600 }}>All data is stored on this device.</span>
          </div>
        </SettingsSection>

        <div style={{ textAlign: "center", padding: "6px 0 4px", display: "flex", flexDirection: "column", alignItems: "center", gap: 9 }}>
          <Logo size={34} />
          <span style={{ fontSize: 12, color: "var(--text-faint)", fontWeight: 600 }}>LendLedger · Made for daily lenders</span>
        </div>
      </div>
    </div>
  );
}

function MiniSelect({ value, onChange, options }) {
  return (
    <div style={{ position: "relative" }}>
      <select value={value} onChange={e => onChange(e.target.value)} style={{
        appearance: "none", background: "var(--surface-sunken)", border: "1px solid var(--border-soft)",
        color: "var(--text)", fontWeight: 650, fontSize: 13.5, borderRadius: 10, padding: "8px 30px 8px 12px",
        cursor: "pointer" }}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <span style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%) rotate(90deg)", pointerEvents: "none", color: "var(--text-faint)" }}><Icon name="chevron" size={15} /></span>
    </div>
  );
}

Object.assign(window, { Loanees, Settings, SettingsSection, SettingRow, MiniSelect });
