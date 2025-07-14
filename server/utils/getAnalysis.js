const getAnalysis = async (prompt) => {
  try {
    console.log("📤 Sending prompt to OpenRouter:", prompt.slice(0, 100));

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct",
        messages: [
          {
            role: "system",
            content: "You are a resume evaluator AI. ONLY respond with valid JSON like { \"score\": number, \"feedback\": string }"
          },
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    const text = await res.text();
    console.log("📥 Raw OpenRouter response:", text);

    const outer = JSON.parse(text);
    const innerContent = outer.choices?.[0]?.message?.content;

    if (!innerContent) {
      throw new Error("Missing message content");
    }

    // 🧠 Parse the stringified JSON inside 'content'
    const json = JSON.parse(innerContent);

    return json;
  } catch (error) {
    console.error("❌ Error during OpenRouter call:", error.message);
    return {
      score: 0,
      feedback: "Error fetching analysis from language model."
    };
  }
};

module.exports = getAnalysis;
