// AI provider: Groq (free, uses Llama 3.3 70B model)
// Get your free API key from: https://console.groq.com/keys

const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY;
const GROQ_MODEL = "llama-3.3-70b-versatile"; // Free, fast, and powerful

async function callGroq(prompt) {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
            model: GROQ_MODEL,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.4,
            max_tokens: 2048,
        }),
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Groq API error: ${err}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

function extractJSON(text) {
    // Remove markdown code fences if present
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    return JSON.parse(cleaned);
}

export const generateReportContent = async (reportType, data) => {
    const prompts = {
        drive: `You are a Training & Placement department report writer at JSPM's Jayawantrao Sawant College of Engineering, Pune. Generate a professional Drive Report summary and overview based on the following data. Write in a formal academic tone.
    
Company: ${data.companyName}
Date: ${data.date}
Batch: ${data.batch}
Branches: ${data.branches}
Total Students Attended: ${data.attendance}
Shortlisted: ${data.shortlisted}
Rounds: ${data.rounds}
Venue: ${data.venue}

Generate:
1. A brief summary (2-3 lines)
2. Drive Details paragraph (5-6 lines describing the event flow)
3. Company Profile paragraph (3-4 lines)

Return ONLY a valid JSON object with no markdown wrappers: {"summary": "...", "driveDetails": "...", "companyProfile": "..."}`,

        session: `You are a Training & Placement department report writer at JSPM's Jayawantrao Sawant College of Engineering, Pune. Generate a professional Session Report based on the following data. Write in a formal academic tone.

Company/Organization: ${data.companyName}
Topic: ${data.topic}
Date: ${data.date}
Batch: ${data.batch}
Branches: ${data.branches}
Total Students Attended: ${data.attendance}
Purpose: ${data.purpose}
Mode: ${data.mode}
Trainer: ${data.trainerName}

Generate:
1. A summary paragraph (2-3 lines)
2. Detailed overview paragraph (4-5 lines)
3. Outcome paragraph (2-3 lines)

Return ONLY a valid JSON object with no markdown wrappers: {"summary": "...", "overview": "...", "outcome": "..."}`,

        weekly: `You are a Training & Placement department report writer at JSPM's Jayawantrao Sawant College of Engineering, Pune. Generate a professional HOD Weekly Report summary based on the following agenda items. Write in a formal academic tone.

Week: ${data.weekRange}
Items: ${JSON.stringify(data.agendaItems)}

Generate a brief summary paragraph (3-4 lines) covering all the agenda items and their status.

Return ONLY a valid JSON object with no markdown wrappers: {"summary": "..."}`,
    };

    const text = await callGroq(prompts[reportType]);
    return extractJSON(text);
};

export const chatWithAI = async (message, context = "") => {
    const prompt = `You are an AI assistant for the Training & Placement department at JSPM's Jayawantrao Sawant College of Engineering (JSCOE), Pune. Help with placement-related queries, report drafting, and general T&P operations.

${context ? `Context: ${context}` : ""}

User: ${message}

Respond helpfully and professionally.`;

    return await callGroq(prompt);
};

export const autoFillSessionFromText = async (rawText) => {
    const prompt = `You are a data extractor for a Training Session Report.
Given the following raw text provided by a user, extract all relevant details and map them into this JSON object.
Guess the academic year or batch based on dates if possible. For dates, format as YYYY-MM-DD.
Write a professional overview, purpose, and outcome based on the context. If an explicit number is missing, use "0" or "".

Raw Text:
"""
${rawText}
"""

Return ONLY a valid JSON object with no markdown wrappers matching this structure EXACTLY:
{
  "companyName": "",
  "topic": "",
  "date": "",
  "time": "10:00",
  "batch": "",
  "branches": "",
  "academicYear": "",
  "venue": "Seminar Hall",
  "mode": "Offline",
  "registeredCount": "",
  "attendance": "",
  "feedback": "Good",
  "purpose": "",
  "outcome": "",
  "overview": "",
  "trainerName": "",
  "trainerContact": "",
  "trainerEmail": "",
  "trainerProfile": "",
  "departmentAttendance": {
    "CS": "",
    "IT": "",
    "ENTC": "",
    "Mech": ""
  }
}`;

    const text = await callGroq(prompt);
    return extractJSON(text);
};

export const autoFillDriveFromText = async (rawText) => {
    const prompt = `You are a data extractor for a Placement Drive Report at JSPM's JSCOE, Pune.
Given the following raw text from a user (informal notes, WhatsApp messages, or drive logs), extract all relevant placement drive details into this JSON object.
Use formal names for companies. Academic years are e.g. 2025-26. Date format is YYYY-MM-DD.

Raw Text:
"""
${rawText}
"""

Return ONLY a valid JSON object with no markdown wrappers matching this structure EXACTLY:
{
  "companyName": "",
  "academicYear": "",
  "date": "",
  "time": "10:00 AM",
  "batch": "",
  "branches": "",
  "venue": "Seminar Hall",
  "mode": "Offline",
  "criteria": "No backlogs",
  "registeredCount": "0",
  "attendance": "0",
  "shortlisted": "0",
  "shortlistedInfo": "",
  "hrFeedback": "Awaited",
  "rounds": "",
  "overview": "",
  "driveDetails": "",
  "selectedStudentsInfo": "",
  "companyProfile": ""
}`;

    const text = await callGroq(prompt);
    return extractJSON(text);
};

export const autoFillWeeklyFromText = async (rawText) => {
    const prompt = `You are a data extractor for a HOD Weekly Report at JSPM's JSCOE, Pune.
Given the following raw notes from a weekly meeting or staff activity, extract the Week Range (e.g. 1st to 5th Feb 2026) and a list of Agenda Items.
Each Agenda Item must have: "agenda", "resolution", and "actionTaken".

Raw Text:
"""
${rawText}
"""

Return ONLY a valid JSON object with no markdown wrappers matching this structure EXACTLY:
{
  "weekRange": "",
  "academicYear": "",
  "summary": "",
  "agendaItems": [
    {
      "agenda": "Discussion on ...",
      "resolution": "Decided to ...",
      "actionTaken": "Informed to ..."
    }
  ]
}`;

    const text = await callGroq(prompt);
    return extractJSON(text);
};
