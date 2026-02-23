export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { event, marketProb, userConfidence, bankroll, positionSize, reason } = req.body;

  if (!event || !userConfidence || !bankroll || !positionSize) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const prompt = `You are Prediction Risk Guard. Analyze this bet and respond in EXACTLY this format with no extra text:

Risk Level: High
Capital Risk Score: 7
Position Size Verdict: Risky
Bias Detected: None
Suggested Safer Position Size: 2% of bankroll
Reasoning: Write 2-3 sentences here.
Final Advice: Write 2-3 sentences here.

Now analyze this actual bet and replace the example values above:
- Event: ${event}
- Market Odds: ${marketProb || "Not provided"}
- Confidence: ${userConfidence}%
- Bankroll: $${bankroll}
- Position Size: $${positionSize}
- Reason: ${reason || "Not provided"}`;

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
      temperature: 0.3,
    })
  });

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || "";
  res.status(200).json({ result: text });
}
