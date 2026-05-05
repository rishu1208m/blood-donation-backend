require("dotenv").config();
const https = require("https");

const key = process.env.GEMINI_API_KEY;
if (!key) { console.error("Missing GEMINI_API_KEY"); process.exit(1); }

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

https.get(url, (res) => {
    let data = "";
    res.on("data", c => data += c);
    res.on("end", () => {
        try {
            const j = JSON.parse(data);
            if (j.error) {
                console.error("API error:", j.error.message);
                console.error("\nFix: generate a NEW key from a NEW project at https://aistudio.google.com/app/apikey");
                process.exit(2);
            }
            const usable = (j.models || [])
                .filter(m => (m.supportedGenerationMethods || []).includes("generateContent"))
                .map(m => m.name.replace(/^models\//, ""));
            console.log(`\nFound ${usable.length} models supporting generateContent:\n`);
            usable.forEach(n => console.log("  - " + n));
            console.log("\nPick any one and put it in server/.env as GEMINI_MODEL=<name>\n");
        } catch (e) {
            console.error("Parse error:", e.message, "\nRaw:", data.slice(0, 500));
        }
    });
}).on("error", e => console.error("Network error:", e.message));
