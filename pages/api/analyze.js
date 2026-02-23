export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { event, marketProb, userConfidence, bankroll, positionSize, reason } = req.body;

  if (!event || !userConfidence || !bankroll || !positionSize) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const prompt = `You are Prediction Risk Guard. Analyze this bet:
- Event: ${event}
- Market Odds: ${marketProb || "Not provided"}
- Confidence: ${userConfidence}%
- Bankroll: $${bankroll}
- Position Size: $${positionSize}
- Reason: ${reason || "Not provided"}

Reply in EXACTLY this format:
Risk Level: Low / Medium / High
Capital Risk Score: X
Position Size Verdict: Safe / Risky / Dangerous
Bias Detected: None / FOMO / Overconfidence / Revenge Trading
Suggested Safer Position Size: X% of bankroll
Reasoning: 2-3 sentences.
Final Advice: 2-3 sentences.`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: "llama3-70b-8192",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1024,
    })
  });

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || "";
  res.status(200).json({ result: text });
}
