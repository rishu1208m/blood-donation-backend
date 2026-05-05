const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY;
const configuredModel = process.env.GEMINI_MODEL;

const FALLBACK_MODELS = [
    configuredModel,
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.5-pro",
    "gemini-2.0-flash",
    "gemini-2.0-flash-001",
    "gemini-2.0-flash-lite",
    "gemini-1.5-flash",
    "gemini-1.5-flash-latest",
    "gemini-1.5-flash-002",
    "gemini-1.5-flash-001",
    "gemini-1.5-flash-8b",
    "gemini-1.5-flash-8b-latest",
    "gemini-1.5-pro",
    "gemini-1.5-pro-latest",
    "gemini-pro",
].filter(Boolean);

let genAI = null;
if (apiKey && apiKey !== "your_gemini_api_key_here") {
    genAI = new GoogleGenerativeAI(apiKey);
}

let workingModel = null;

function ensureClient() {
    if (!genAI) {
        const err = new Error("AI is not configured. Set GEMINI_API_KEY in server/.env (get a free key at https://aistudio.google.com/app/apikey).");
        err.status = 503;
        throw err;
    }
}

function shouldFallover(err) {
    const msg = String(err?.message || "");
    return (
        msg.includes("404") ||
        msg.includes("Not Found") ||
        msg.includes("not supported") ||
        msg.includes("limit: 0") ||
        msg.includes("PERMISSION_DENIED") ||
        msg.includes("403") ||
        msg.includes("503") ||
        msg.includes("Service Unavailable") ||
        msg.includes("UNAVAILABLE") ||
        msg.includes("overloaded") ||
        msg.includes("high demand")
    );
}

async function withFallback(buildModel, run) {
    ensureClient();
    const tried = new Set();
    const tryOrder = workingModel
        ? [workingModel, ...FALLBACK_MODELS.filter(m => m !== workingModel)]
        : FALLBACK_MODELS;

    let lastErr;
    for (const name of tryOrder) {
        if (tried.has(name)) continue;
        tried.add(name);
        try {
            const model = buildModel(name);
            const out = await run(model);
            if (workingModel !== name) {
                workingModel = name;
                console.log(`✅ Gemini using model: ${name}`);
            }
            return out;
        } catch (err) {
            lastErr = err;
            if (!shouldFallover(err)) throw err;
            console.warn(`⚠️  Model "${name}" unavailable: ${err.message.split("\n")[0]} — trying next…`);
        }
    }
    const err = new Error(
        "No Gemini model available for this API key. " +
        "Generate a fresh key at https://aistudio.google.com/app/apikey from a NEW project. " +
        `Last error: ${lastErr?.message?.split("\n")[0]}`
    );
    err.status = 503;
    throw err;
}

const CHAT_SYSTEM_PROMPT = `You are BloodBot, a warm and knowledgeable assistant for the BloodConnect app.
You help users with:
- Eligibility to donate blood (age, weight, health, deferral periods)
- Blood group compatibility (who can donate to whom)
- The donation process and what to expect
- Post-donation care and recovery
- Finding donors and creating requests inside the BloodConnect app
- General medical questions related to blood donation

Rules:
- Be concise (2–5 short paragraphs unless the user asks for detail).
- Be encouraging and reassuring. Donors are heroes.
- For medical emergencies, ALWAYS tell the user to call local emergency services first.
- Never provide a medical diagnosis. Recommend consulting a doctor when uncertain.
- If asked something unrelated to blood donation or the app, politely redirect.
- Use simple markdown: **bold** for emphasis, line breaks between ideas, bullet lists with "- " when listing things.`;

async function chat(messages = []) {
    let lastUserIdx = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].role === "user") { lastUserIdx = i; break; }
    }
    if (lastUserIdx === -1) {
        throw Object.assign(new Error("No user message found"), { status: 400 });
    }
    const last = messages[lastUserIdx];
    const priorMessages = messages.slice(0, lastUserIdx);

    const firstUserIdx = priorMessages.findIndex(m => m.role === "user");
    const trimmed = firstUserIdx === -1 ? [] : priorMessages.slice(firstUserIdx);
    const history = trimmed.map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
    }));

    return withFallback(
        (name) => genAI.getGenerativeModel({ model: name, systemInstruction: CHAT_SYSTEM_PROMPT }),
        async (model) => {
            const session = model.startChat({ history });
            const result = await session.sendMessage(last.content);
            return result.response.text();
        }
    );
}

async function classifyUrgency(description) {
    if (!description || description.trim().length < 5) {
        throw Object.assign(new Error("Description is too short"), { status: 400 });
    }
    const config = {
        responseMimeType: "application/json",
        responseSchema: {
            type: "object",
            properties: {
                urgency: { type: "string", enum: ["low", "medium", "high"] },
                bloodGroup: { type: "string" },
                unitsNeeded: { type: "integer" },
                reasoning: { type: "string" },
                suggestedAction: { type: "string" },
            },
            required: ["urgency", "reasoning"],
        },
    };
    const sys = `You analyse a blood-request description and extract structured data.
Urgency rules:
- "high": active bleeding, surgery within hours, accident/trauma, ICU, critical, life-threatening, words like emergency/urgent/dying.
- "medium": surgery within 1–3 days, ongoing treatment, anemia transfusion, chemotherapy.
- "low": planned future surgery, routine top-up, donation drive.
bloodGroup must be one of: A+, A-, B+, B-, AB+, AB-, O+, O-. If not stated, return "" .
unitsNeeded: integer if stated, else 1.
reasoning: 1 short sentence (max 25 words).
suggestedAction: 1 short sentence telling the user the next step inside the BloodConnect app.`;

    return withFallback(
        (name) => genAI.getGenerativeModel({ model: name, generationConfig: config, systemInstruction: sys }),
        async (model) => JSON.parse((await model.generateContent(description)).response.text())
    );
}

async function rankDonors({ request, donors }) {
    if (!Array.isArray(donors) || donors.length === 0) return [];

    const config = {
        responseMimeType: "application/json",
        responseSchema: {
            type: "object",
            properties: {
                ranked: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            donorId: { type: "string" },
                            score: { type: "number" },
                            reason: { type: "string" },
                        },
                        required: ["donorId", "score", "reason"],
                    },
                },
            },
            required: ["ranked"],
        },
    };
    const sys = `You are a donor-matching engine. Given a blood request and a list of candidate donors,
rank them from best to worst match. Score 0–100.

Consider (most important first):
1. Blood group compatibility (universal donor O- > exact match > compatible match).
2. Distance (closer is better).
3. Availability (isAvailable true).
4. Days since lastDonated (>90 days good; <56 days = score 0).
5. Donor rating.
6. For "high" urgency, prioritise distance heavily.

Return EVERY donorId. "reason" max 20 words.`;

    const payload = {
        request: { bloodGroup: request.bloodGroup, urgency: request.urgency || "medium", location: request.location },
        donors: donors.map(d => ({
            donorId: String(d._id || d.id),
            name: d.name, bloodGroup: d.bloodGroup,
            isAvailable: d.isAvailable, lastDonated: d.lastDonated || null,
            rating: d.rating || 0, distanceKm: d.distanceKm ?? null,
        })),
    };

    const parsed = await withFallback(
        (name) => genAI.getGenerativeModel({ model: name, generationConfig: config, systemInstruction: sys }),
        async (model) => JSON.parse((await model.generateContent(JSON.stringify(payload))).response.text())
    );
    return parsed.ranked || [];
}

async function screenEligibility(answers) {
    const config = {
        responseMimeType: "application/json",
        responseSchema: {
            type: "object",
            properties: {
                eligible: { type: "boolean" },
                deferralDays: { type: "integer" },
                reasons: { type: "array", items: { type: "string" } },
                advice: { type: "string" },
            },
            required: ["eligible", "reasons", "advice"],
        },
    };
    const sys = `You are a blood-donation eligibility screener following WHO/Red Cross guidelines.

Common deferrals:
- Age <18 or >65: not eligible.
- Weight <50kg: not eligible.
- Last donation <56 days: defer.
- Pregnant/breastfeeding (<6 mo): not eligible.
- Tattoo/piercing <4 months: defer.
- Surgery <6 months: defer.
- Active fever/cold: defer 1–2 weeks.
- HIV/hepatitis/heart disease/active cancer: not eligible.
- Antibiotics: defer until 7 days after course.
- Alcohol within 24h: defer 24h.

Output:
- eligible: true only if NO deferrals apply.
- deferralDays: 0 if eligible, else estimated days.
- reasons: array of short bullet points (max 8 words each).
- advice: 1-2 sentence friendly message.`;

    return withFallback(
        (name) => genAI.getGenerativeModel({ model: name, generationConfig: config, systemInstruction: sys }),
        async (model) => JSON.parse(
            (await model.generateContent("Screen this person:\n" + JSON.stringify(answers, null, 2)))
                .response.text()
        )
    );
}

module.exports = {
    isConfigured: () => !!genAI,
    getWorkingModel: () => workingModel,
    chat,
    classifyUrgency,
    rankDonors,
    screenEligibility,
};
