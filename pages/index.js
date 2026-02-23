import { useState } from "react";

export default function Home() {
  const [event, setEvent] = useState("");
  const [marketProb, setMarketProb] = useState("");
  const [confidence, setConfidence] = useState("");
  const [bankroll, setBankroll] = useState("");
  const [position, setPosition] = useState("");
  const [reason, setReason] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyze = async () => {
    if (!event || !confidence || !bankroll || !position) {
      setError("Please fill in all required fields");
      return;
    }
    setLoading(true);
    setError("");
    setResult("");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event, marketProb, userConfidence: confidence,
          bankroll, positionSize: position, reason
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data.result);
    } catch (err) {
      setError(err.message || "Something went wrong");
    }
    setLoading(false);
  };

  const capitalAtRisk = bankroll && position
    ? ((parseFloat(position) / parseFloat(bankroll)) * 100).toFixed(1)
    : null;

  return (
    <div style={{ background: "#0a0c0f", minHeight: "100vh", padding: "30px 16px", fontFamily: "monospace", color: "#e8ecf0" }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ color: "#00e5a0", fontSize: 10, letterSpacing: 3, marginBottom: 12 }}>⚠ CAPITAL PROTECTION SYSTEM</div>
          <div style={{ fontSize: 42, fontWeight: 900, lineHeight: 1.1, letterSpacing: -2 }}>
            Prediction<br /><span style={{ color: "#00e5a0" }}>Risk Guard</span>
          </div>
          <div style={{ color: "#5a6070", fontSize: 12, marginTop: 10 }}>Submit your bet. Get an AI risk analysis before you commit capital.</div>
        </div>

        <div style={{ background: "#111318", border: "1px solid #1e2330", padding: 24, marginBottom: 16 }}>
          <div style={{ color: "#00e5a0", fontSize: 10, letterSpacing: 3, marginBottom: 20 }}>▸ BET DETAILS</div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 9, color: "#5a6070", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Event Description *</div>
            <textarea value={event} onChange={e => setEvent(e.target.value)}
              placeholder="e.g. Will Bitcoin hit $100k by end of 2025?"
              style={{ width: "100%", background: "#0a0c0f", border: "1px solid #1e2330", color: "#e8ecf0", padding: "11px 13px", fontSize: 13, fontFamily: "monospace", minHeight: 80, resize: "vertical" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 9, color: "#5a6070", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Market Odds</div>
              <input value={marketProb} onChange={e => setMarketProb(e.target.value)} placeholder="e.g. 45%"
                style={{ width: "100%", background: "#0a0c0f", border: "1px solid #1e2330", color: "#e8ecf0", padding: "11px 13px", fontSize: 13, fontFamily: "monospace" }} />
            </div>
            <div>
              <div style={{ fontSize: 9, color: "#5a6070", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Confidence % *</div>
              <input value={confidence} onChange={e => setConfidence(e.target.value)} placeholder="e.g. 80" type="number"
                style={{ width: "100%", background: "#0a0c0f", border: "1px solid #1e2330", color: "#e8ecf0", padding: "11px 13px", fontSize: 13, fontFamily: "monospace" }} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 9, color: "#5a6070", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Bankroll ($) *</div>
              <input value={bankroll} onChange={e => setBankroll(e.target.value)} placeholder="e.g. 1000" type="number"
                style={{ width: "100%", background: "#0a0c0f", border: "1px solid #1e2330", color: "#e8ecf0", padding: "11px 13px", fontSize: 13, fontFamily: "monospace" }} />
            </div>
            <div>
              <div style={{ fontSize: 9, color: "#5a6070", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Position Size ($) *</div>
              <input value={position} onChange={e => setPosition(e.target.value)} placeholder="e.g. 100" type="number"
                style={{ width: "100%", background: "#0a0c0f", border: "1px solid #1e2330", color: "#e8ecf0", padding: "11px 13px", fontSize: 13, fontFamily: "monospace" }} />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 9, color: "#5a6070", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Reason for Bet</div>
            <input value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Strong momentum, news catalyst..."
              style={{ width: "100%", background: "#0a0c0f", border: "1px solid #1e2330", color: "#e8ecf0", padding: "11px 13px", fontSize: 13, fontFamily: "monospace" }} />
          </div>

          <button onClick={analyze} disabled={loading}
            style={{ width: "100%", padding: 16, background: loading ? "#5a6070" : "#00e5a0", color: "#0a0c0f", border: "none", fontSize: 15, fontWeight: 900, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer", marginTop: 8 }}>
            {loading ? "Analyzing..." : "Analyze Risk →"}
          </button>

          {error && <div style={{ background: "rgba(255,77,109,0.1)", border: "1px solid rgba(255,77,109,0.3)", color: "#ff4d6d", padding: "12px 16px", fontSize: 12, marginTop: 12 }}>{error}</div>}
        </div>

        {loading && (
          <div style={{ background: "#111318", border: "1px solid #1e2330", padding: 40, textAlign: "center", color: "#5a6070", fontSize: 11, letterSpacing: 3 }}>
            RUNNING RISK ANALYSIS...
          </div>
        )}

        {result && !loading && (
          <div style={{ background: "#111318", border: "1px solid #1e2330", padding: 24 }}>

            {capitalAtRisk && (
              <div style={{ background: "#0a0c0f", border: "1px solid #1e2330", padding: "10px 14px", marginBottom: 20, fontSize: 12, color: "#f5c542" }}>
                ⚠ Capital at Risk: <strong>{capitalAtRisk}%</strong> of your bankroll
              </div>
            )}

            <div style={{ fontSize: 10, color: "#5a6070", letterSpacing: 3, marginBottom: 12 }}>▸ FULL ANALYSIS</div>
            <div style={{ fontSize: 13, lineHeight: 2, color: "#e8ecf0", whiteSpace: "pre-wrap" }}>
              {result}
            </div>

          </div>
        )}

      </div>
    </div>
  );
                  }
