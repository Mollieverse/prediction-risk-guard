import { useState } from "react";

function getRiskColor(level) {
  if (!level) return "#5a6070";
  if (level.toLowerCase().includes("low")) return "#00e5a0";
  if (level.toLowerCase().includes("medium")) return "#f5c542";
  if (level.toLowerCase().includes("high")) return "#ff4d6d";
  return "#5a6070";
}

function parseAnalysis(text) {
  console.log("RAW RESPONSE:", text);
  const result = {};
  const lines = text.split("\n");
  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;
    const colonIndex = trimmed.indexOf(":");
    if (colonIndex === -1) return;
    const key = trimmed.substring(0, colonIndex).trim().toLowerCase();
    const value = trimmed.substring(colonIndex + 1).trim();
    if (key.includes("risk level")) result.riskLevel = value;
    else if (key.includes("capital risk score")) result.capitalRiskScore = value.replace(/[^0-9]/g, "");
    else if (key.includes("position size verdict")) result.positionSizeVerdict = value;
    else if (key.includes("bias detected")) result.biasDetected = value;
    else if (key.includes("suggested safer")) result.suggestedSize = value;
    else if (key.includes("reasoning")) result.reasoning = value;
    else if (key.includes("final advice")) result.finalAdvice = value;
  });
  console.log("PARSED:", result);
  return result;
}

export default function Home() {
  const [form, setForm] = useState({
    event: "", marketProb: "", userConfidence: "",
    bankroll: "", positionSize: "", reason: "",
  });
  const [result, setResult] = useState(null);
  const [rawText, setRawText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const canSubmit = form.event && form.bankroll && form.positionSize && form.userConfidence;

  const analyze = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setRawText("");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setRawText(data.result);
      setResult(parseAnalysis(data.result));
    } catch (err) {
      setError(err.message || "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const scoreNum = result ? parseInt(result.capitalRiskScore) || 0 : 0;
  const capitalAtRisk = form.bankroll && form.positionSize
    ? ((parseFloat(form.positionSize) / parseFloat(form.bankroll)) * 100).toFixed(1)
    : null;
  const riskColor = getRiskColor(result?.riskLevel);

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
          {error && <div style={s.errorBox}>{error}</div>}
        </div>

        {loading && (
          <div style={s.card}>
            <div style={s.loadingWrap}>
              <div style={s.spinner} />
              <div style={{ fontSize: 11, letterSpacing: 3, color: "#5a6070" }}>RUNNING RISK ANALYSIS</div>
            </div>
          </div>
        )}

        {rawText && !loading && (
          <div style={s.card}>
            {result?.riskLevel && (
              <div style={s.riskHeader}>
                <div>
                  <div style={{ fontSize: 10, letterSpacing: 2, color: "#5a6070", marginBottom: 4 }}>RISK LEVEL</div>
                  <div style={{ ...s.riskBadge, color: riskColor }}>
                    <span style={{ ...s.dot, background: riskColor }} />
                    {result.riskLevel}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 10, letterSpacing: 2, color: "#5a6070", marginBottom: 4 }}>RISK SCORE</div>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 42, fontWeight: 800, color: riskColor, lineHeight: 1 }}>
                    {result.capitalRiskScore || "—"}<span style={{ fontSize: 16, color: "#5a6070" }}>/10</span>
                  </div>
                  <div style={s.barBg}>
                    <div style={{ ...s.barFill, width: `${scoreNum * 10}%`, background: riskColor }} />
                  </div>
                </div>
              </div>
            )}

            <div style={s.metrics}>
              <div style={s.metricBox}>
                <div style={s.metricName}>Position</div>
                <div style={{ ...s.metricVal, color: result?.positionSizeVerdict?.toLowerCase().includes("safe") ? "#00e5a0" : result?.positionSizeVerdict?.toLowerCase().includes("danger") ? "#ff4d6d" : "#f5c542" }}>
                  {result?.positionSizeVerdict || "—"}
                </div>
              </div>
              <div style={s.metricBox}>
                <div style={s.metricName}>Bias</div>
                <div style={{ ...s.metricVal, color: result?.biasDetected?.toLowerCase().includes("none") ? "#00e5a0" : "#ff4d6d" }}>
                  {result?.biasDetected || "—"}
                </div>
              </div>
              <div style={s.metricBox}>
                <div style={s.metricName}>At Risk</div>
                <div style={{ ...s.metricVal, color: riskColor }}>
                  {capitalAtRisk ? `${capitalAtRisk}%` : "—"}
                </div>
              </div>
            </div>

            {result?.suggestedSize && (
              <div style={{ marginBottom: 20 }}>
                <div style={s.metricName}>Suggested Safer Position</div>
                <div style={s.suggestedPill}>{result.suggestedSize}</div>
              </div>
            )}

            <div style={s.divider} />

            {result?.reasoning && (
              <>
                <div style={s.sectionTitle}>▸ Reasoning</div>
                <p style={s.reasoning}>{result.reasoning}</p>
              </>
            )}

            {result?.finalAdvice && (
              <div style={s.adviceBox}>
                <div style={{ ...s.sectionTitle, marginBottom: 8 }}>▸ Final Advice</div>
                {result.finalAdvice}
              </div>
            )}

            {!result?.riskLevel && (
              <div style={{ fontSize: 12, color: "#b0b8c8", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                {rawText}
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
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>
    </div>
  );
}

const s = {
  app: { minHeight: "100vh", background: "#0a0c0f", padding: "36px 16px 80px", fontFamily: "'DM Mono', monospace", color: "#e8ecf0" },
  container: { maxWidth: 700, margin: "0 auto" },
  header: { textAlign: "center", marginBottom: 40 },
  badge: { display: "inline-block", border: "1px solid #00e5a0", color: "#00e5a0", fontSize: 10, letterSpacing: 3, padding: "4px 14px", textTransform: "uppercase", marginBottom: 18 },
  title: { fontFamily: "'Syne', sans-serif", fontSize: "clamp(34px, 8vw, 60px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: -2, color: "#e8ecf0" },
  subtitle: { marginTop: 12, fontSize: 12, color: "#5a6070", lineHeight: 1.7 },
  card: { background: "#111318", border: "1px solid #1e2330", padding: "24px 20px", marginBottom: 20, animation: "fadeUp 0.4s ease" },
  sectionLabel: { fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#00e5a0", marginBottom: 20 },
  field: { display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  label: { fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "#5a6070" },
  input: { background: "#0a0c0f", border: "1px solid #1e2330", color: "#e8ecf0", fontFamily: "'DM Mono', monospace", fontSize: 13, padding: "11px 13px", width: "100%" },
  textarea: { background: "#0a0c0f", border: "1px solid #1e2330", color: "#e8ecf0", fontFamily: "'DM Mono', monospace", fontSize: 13, padding: "11px 13px", width: "100%", minHeight: 80, resize: "vertical" },
  btn: { width: "100%", padding: 15, background: "#00e5a0", color: "#0a0c0f", border: "none", fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer", marginTop: 8 },
  errorBox: { background: "rgba(255,77,109,0.1)", border: "1px solid rgba(255,77,109,0.3)", color: "#ff4d6d", padding: "12px 16px", fontSize: 12, marginTop: 12 },
  loadingWrap: { textAlign: "center", padding: "32px 0" },
  spinner: { width: 24, height: 24, border: "2px solid #1e2330", borderTopColor: "#00e5a0", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 14px" },
  riskHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
  riskBadge: { fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800, display: "flex", alignItems: "center", gap: 10 },
  dot: { width: 10, height: 10, borderRadius: "50%", display: "inline-block", animation: "pulse 2s infinite", flexShrink: 0 },
  barBg: { height: 3, background: "#1e2330", marginTop: 6, overflow: "hidden" },
  barFill: { height: "100%", transition: "width 0.8s ease" },
  metrics: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 },
  metricBox: { background: "#0a0c0f", border: "1px solid #1e2330", padding: "12px 10px" },
  metricName: { fontSize: 8, letterSpacing: 2, textTransform: "uppercase", color: "#5a6070", marginBottom: 5 },
  metricVal: { fontSize: 12, fontWeight: 500 },
  suggestedPill: { display: "inline-block", background: "rgba(0,229,160,0.1)", border: "1px solid rgba(0,229,160,0.3)", color: "#00e5a0", padding: "5px 14px", fontSize: 14, marginTop: 5 },
  divider: { border: "none", borderTop: "1px solid #1e2330", margin: "20px 0" },
  sectionTitle: { fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: "#5a6070", marginBottom: 10 },
  reasoning: { fontSize: 12, lineHeight: 1.85, color: "#b0b8c8" },
  adviceBox: { background: "#0a0c0f", borderLeft: "3px solid #00e5a0", padding: "16px 18px", marginTop: 18, fontSize: 12, lineHeight: 1.85, color: "#e8ecf0" },
};
