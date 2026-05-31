require('dotenv').config({ path: './.env' });

async function callGroq(prompt, systemPrompt = "You are a helpful AI.") {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY is not configured.");
    
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: "llama3-70b-8192",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: prompt }
            ],
            temperature: 0.2
        })
    });
    
    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Groq API Error: ${errText}`);
    }
    
    const data = await res.json();
    return data.choices[0].message.content;
}

async function test() {
    try {
        console.log("Testing Groq...");
        const result = await callGroq("Hello, are you working?");
        console.log(result);
    } catch (e) {
        console.error(e);
    }
}
test();
