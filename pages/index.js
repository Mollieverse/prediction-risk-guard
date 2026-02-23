import { useState } from "react";

export default function Home() {
  const [form, setForm] = useState({
    event: "", marketProb: "", userConfidence: "",
    bankroll: "", positionSize: "", reason: "",
  });
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const canSubmit = form.event && form.bankroll && form.positionSize && form.userConfidence;

  const analyze = async () => {
    setLoading(true);
    setError(null);
    setAnalysis("");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAnalysis(data.result);
    } catch (err) {
      setError(err.message || "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const lines = analysis.split("\n").filter(l => l.trim());

  const getValue = (keyword) => {
    const idx = lines.findIndex(l => l.toLowerCase().includes(keyword.toLowerCase()));
    if (idx === -1) return null;
    const firstLine = lines[idx].split(":").slice(1).join(":").trim();
    const extraLines = [];
    for (let i = idx + 1; i < lines.length; i++) {
      if (lines[i].includes(":")) break;
      extraLines.push(lines[i].trim());
    }
    return [firstLine, ...extraLines].filter(Boolean).join(" ");
  };

  const riskLevel = getValue("risk level");
  const riskScore = getValue("capital risk score");
  const verdict = getValue("position size verdict");
  const bias = getValue("bias detected");
  const suggested = getValue("suggested safer");
  const reasoning = getValue("reasoning");
  const advice = getValue("final advice");

  const capitalAtRisk = form.bankroll && form.positionSize
    ? ((parseFloat(form.positionSize) / parseFloat(form.bankroll)) * 100).toFixed(1)
    : null;

  const riskColor = !riskLevel ? "#5a6070"
    : riskLevel.toLowerCase().includes("low") ? "#00e5a0"
    : riskLevel.toLowerCase().includes("medium") ? "#f5c542"
    : "#ff4d6d";

  return (
    <div style={s.app}>
      <div style={s.container}>

        <div style={s.header}>
          <div style={s.badge}>⚠ Capital Protection System</div>
          <h1 style={s.title}>Prediction<br /><span style={{ color: "#00e5a0" }}>Risk Guard</span></h1>
          <p style={s.subtitle}>Submit your bet. Get an AI risk analysis before you commit capital.</p>
        </div>

        <div style={s.card}>
          <div style={s.sectionLabel}>▸ Bet Details</div>
          <div style={s.field}>
            <label style={s.label}>Event Description *</label>
            <textarea style={s.textarea} name="event" value={form.event} onChange={handleChange} placeholder="e.g. Will Bitcoin hit $100k by end of 2025?" />
          </div>
          <div style={s.row}>
            <div style={s.field}>
              <label style={s.label}>Market Odds</label>
              <input style={s.input} name="marketProb" value={form.marketProb} onChange={handleChange} placeholder="e.g. 45%" />
            </div>
            <div style={s.field}>
              <label style={s.label}>Confidence % *</label>
              <input style={s.input} name="userConfidence" type="number" min="1" max="100" value={form.userConfidence} onChange={handleChange} placeholder="e.g. 80" />
            </div>
          </div>
          <div style={s.row}>
            <div style={s.field}>
              <label style={s.label}>Bankroll ($) *</label>
              <input style={s.input} name="bankroll" type="number" value={form.bankroll} onChange={handleChange} placeholder="e.g. 1000" />
            </div>
            <div style={s.field}>
              <label style={s.label}>Position Size ($) *</label>
              <input style={s.input} name="positionSize" type="number" value={form.positionSize} onChange={handleChange} placeholder="e.g. 100" />
            </div>
          </div>
          <div style={s.field}>
            <label style={s.label}>Reason for Bet</label>
            <input style={s.input} name="reason" value={form.reason} onChange={handleChange} placeholder="e.g. Strong momentum..." />
          </div>
          <button style={{ ...s.btn, opacity: (!canSubmit || loading) ? 0.4 : 1 }} onClick={analyze} disabled={!canSubmit || loading}>
            {loading ? "Analyzing..." : "Analyze Risk →"}
          </button>
          {error && <div style={s.errorBox}>⚠ {error}</div>}
        </div>

        {loading && (
          <div style={s.card}>
            <div style={s.loadingWrap}>
              <div style={s.spinner} />
              <div style={{ fontSize: 11, letterSpacing: 3, color: "#5a6070" }}>RUNNING RISK ANALYSIS</div>
            </div>
          </div>
        )}

        {analysis && !loading && (
          <div style={s.card}>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 9, letterSpacing: 2, color: "#5a6070", marginBottom: 6, textTransform: "uppercase" }}>Risk Level</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: riskColor, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: riskColor, display: "inline-block" }} />
                  {riskLevel || "—"}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 9, letterSpacing: 2, color: "#5a6070", marginBottom: 4, textTransform: "uppercase" }}>Risk Score</div>
                <div style={{ fontSize: 44, fontWeight: 800, color: riskColor, lineHeight: 1 }}>
                  {riskScore ? riskScore.replace(/[^0-9]/g, "") : "—"}
                  <span style={{ fontSize: 16, color: "#5a6070" }}>/10</span>
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
              <div style={s.metricBox}>
                <div style={s.metricName}>Position</div>
                <div style={{ fontSize: 12, fontWeight: 500, color: verdict?.toLowerCase().includes("safe") ? "#00e5a0" : verdict?.toLowerCase().includes("danger") ? "#ff4d6d" : "#f5c542" }}>
                  {verdict || "—"}
                </div>
              </div>
              <div style={s.metricBox}>
                <div style={s.metricName}>Bias</div>
                <div style={{ fontSize: 12, fontWeight: 500, color: bias?.toLowerCase().includes("none") ? "#00e5a0" : "#ff4d6d" }}>
                  {bias || "—"}
                </div>
              </div>
              <div style={s.metricBox}>
                <div style={s.metricName}>At Risk</div>
                <div style={{ fontSize: 12, fontWeight: 500, color: riskColor }}>
                  {capitalAtRisk ? `${capitalAtRisk}%` : "—"}
                </div>
              </div>
            </div>

            {suggested && (
              <div style={{ marginBottom: 20 }}>
                <div style={s.metricName}>Suggested Safer Position</div>
                <div style={{ display: "inline-block", background: "rgba(0,229,160,0.1)", border: "1px solid rgba(0,229,160,0.3)", color: "#00e5a0", padding: "5px 14px", fontSize: 14, marginTop: 5 }}>
                  {suggested}
                </div>
              </div>
            )}

            <div style={{ borderTop: "1px solid #1e2330", margin: "20px 0" }} />

            {reasoning && (
              <div style={{ marginBottom: 16 }}>
                <div style={s.metricName}>▸ Reasoning</div>
                <p style={{ fontSize: 12, lineHeight: 1.85, color: "#b0b8c8", marginTop: 8 }}>{reasoning}</p>
              </div>
            )}

            {advice && (
              <div style={{ background: "#0a0c0f", borderLeft: "3px solid #00e5a0", padding: "16px 18px", fontSize: 12, lineHeight: 1.85, color: "#e8ecf0" }}>
                <div style={s.metricName}>▸ Final Advice</div>
                <div style={{ marginTop: 8 }}>{advice}</div>
              </div>
            )}

          </div>
        )}

      </div>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0c0f; }
        input::placeholder, textarea::placeholder { color: #3a4050; }
        input:focus, textarea:focus { outline: none; border-color: #00e5a0 !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  );
}

const s = {
  app: { minHeight: "100vh", background: "#0a0c0f", padding: "36px 16px 80px", fontFamily: "'DM Mono', monospace", color: "#e8ecf0" },
  container: { maxWidth: 700, margin: "0 auto" },
  header: { textAlign: "center", marginBottom: 40 },
  badge: { display: "inline-block", border: "1px solid #00e5a0", color: "#00e5a0", fontSize: 10, letterSpacing: 3, padding: "4px 14px", textTransform: "uppercase", marginBottom: 18 },
  title: { fontSize: "clamp(34px, 8vw, 60px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: -2, color: "#e8ecf0" },
  subtitle: { marginTop: 12, fontSize: 12, color: "#5a6070", lineHeight: 1.7 },
  card: { background: "#111318", border: "1px solid #1e2330", padding: "24px 20px", marginBottom: 20 },
  sectionLabel: { fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#00e5a0", marginBottom: 20 },
  field: { display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  label: { fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "#5a6070" },
  input: { background: "#0a0c0f", border: "1px solid #1e2330", color: "#e8ecf0", fontFamily: "'DM Mono', monospace", fontSize: 13, padding: "11px 13px", width: "100%" },
  textarea: { background: "#0a0c0f", border: "1px solid #1e2330", color: "#e8ecf0", fontFamily: "'DM Mono', monospace", fontSize: 13, padding: "11px 13px", width: "100%", minHeight: 80, resize: "vertical" },
  btn: { width: "100%", padding: 15, background: "#00e5a0", color: "#0a0c0f", border: "none", fontSize: 14, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer", marginTop: 8 },
  errorBox: { background: "rgba(255,77,109,0.1)", border: "1px solid rgba(255,77,109,0.3)", color: "#ff4d6d", padding: "12px 16px", fontSize: 12, marginTop: 12 },
  loadingWrap: { textAlign: "center", padding: "32px 0" },
  spinner: { width: 24, height: 24, border: "2px solid #1e2330", borderTopColor: "#00e5a0", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 14px" },
  metricBox: { background: "#0a0c0f", border: "1px solid #1e2330", padding: "12px 10px" },
  metricName: { fontSize: 8, letterSpacing: 2, textTransform: "uppercase", color: "#5a6070", marginBottom: 5 },
};
