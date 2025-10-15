import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai';

//  PROMPTS


// Detection Phase (Bounding Boxes)
const DETECTION_PROMPT = `
You are SiyensyaGo, a fun and curious science guide for Filipino students.
Analyze the user-provided image and identify ALL distinct objects in it.
For each object, provide:
  - name
  - confidence (0–100)
  - boundingBox (x, y, width, height; normalized to a 1000x1000 grid)

Output ONLY valid JSON (no extra text) in this format:

{
  "message": "Multiple objects detected! Tap one to learn more.",
  "objects": [
    {
      "name": "OBJECT_NAME_1",
      "confidence": 95,
      "boundingBox": { "x": 421, "y": 343, "width": 288, "height": 354 }
    },
    {
      "name": "OBJECT_NAME_2",
      "confidence": 88,
      "boundingBox": { "x": 100, "y": 100, "width": 150, "height": 200 }
    }
  ]
}

If no objects are found, use an empty array for "objects".
`;

// Detailed Content Phase (User taps on an object)
const CONTENT_PROMPT = (objectName: string) => `
You are SiyensyaGo, a fun and curious science guide for Filipino students.
Analyze the user-provided image and explain the object named **"${objectName}"** for a Grade 5 Filipino student.

Academic Anchor: Identify a relevant DepEd learning competency for Grade 5 Science.
Core Task: Explain the science behind the selected object. Make it exciting and relatable to Filipino life (Tagalog-English mix if natural).
Keep the tone fun, simple, and curious.

Output ONLY valid JSON (no extra text) in this format:

{
  "name": "${objectName}",
  "quick_fact": "One fun fact.",
  "the_science_in_action": "Simple science explanation.",
  "why_it_matters_to_you": "How it connects to your life in PH.",
  "explore_further": "A thinking question."
}
`;

//  JSON SCHEMAS

const CONTENT_SCHEMA = {
  type: "object",
  properties: {
    name: { type: "string" },
    quick_fact: { type: "string" },
    the_science_in_action: { type: "string" },
    why_it_matters_to_you: { type: "string" },
    explore_further: { type: "string" }
  },
  required: ["name", "quick_fact", "the_science_in_action", "why_it_matters_to_you", "explore_further"]
};

const DETECTION_SCHEMA = {
  type: "object",
  properties: {
    message: { type: "string" },
    objects: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          confidence: { type: "number", minimum: 0, maximum: 100 },
          boundingBox: {
            type: "object",
            properties: {
              x: { type: "integer", minimum: 0, maximum: 1000 },
              y: { type: "integer", minimum: 0, maximum: 1000 },
              width: { type: "integer", minimum: 0, maximum: 1000 },
              height: { type: "integer", minimum: 0, maximum: 1000 }
            },
            required: ["x", "y", "width", "height"]
          }
        },
        required: ["name", "confidence", "boundingBox"]
      }
    }
  },
  required: ["objects"]
};


//  MAIN SERVER
serve(async (req) => {
  try {
    //  Parse and validate request body
    const rawBody = await req.text();
    if (!rawBody?.trim()) {
      return badRequest("Request body is empty. Expected JSON with 'image' (base64) and 'contentType'.");
    }

    let requestBody;
    try {
      requestBody = JSON.parse(rawBody);
    } catch (err) {
      return badRequest(`Invalid JSON: ${err.message}. Example: {"image":"base64...","contentType":"image/jpeg"}`);
    }

    const { image, contentType, selectedObjectName } = requestBody;
    if (!image || !contentType) return badRequest("Missing 'image' or 'contentType' fields.");

    // Clean and validate Base64 image
    const cleanImage = cleanBase64(image);
    validateBase64(cleanImage);

    if (!contentType.startsWith("image/")) {
      return badRequest("Invalid contentType. Must start with 'image/'.");
    }

    const imageParts = [{ inlineData: { data: cleanImage, mimeType: contentType } }];

    // Initialize Gemini
    const API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!API_KEY) throw new Error("Missing GEMINI_API_KEY environment variable.");

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Determine Mode
    const isContentMode = !!selectedObjectName;
    const PROMPT_TO_USE = isContentMode ? CONTENT_PROMPT(selectedObjectName) : DETECTION_PROMPT;
    const SCHEMA_TO_USE = isContentMode ? CONTENT_SCHEMA : DETECTION_SCHEMA;

    console.log(isContentMode ? `[CONTENT MODE] ${selectedObjectName}` : "[DETECTION MODE] Detecting objects...");

    // Call Gemini (with retry)
    const rawText = await generateWithRetry(model, PROMPT_TO_USE, SCHEMA_TO_USE, imageParts);
    if (!rawText?.trim()) throw new Error("Gemini returned empty response.");

    //  Parse and repair JSON if necessary
    const jsonResponse = safeParseJSON(rawText) || getDefaultResponse();

    //  Post-parse cleanup and normalization
    finalizeResponse(jsonResponse);

    return new Response(JSON.stringify(jsonResponse), {
      headers: { "Content-Type": "application/json" },
      status: 200
    });

  } catch (error) {
    console.error("Error in analyze-image:", error);
    return new Response(JSON.stringify({
      error: error.message,
      objects: [],
      selectedObject: getDefaultSelectedObject(),
      message: "Analysis encountered an issue. Try again with a clearer image."
    }), { headers: { "Content-Type": "application/json" }, status: 500 });
  }
});

//  HELPER FUNCTIONS


function badRequest(message: string) {
  return new Response(JSON.stringify({ error: message }), {
    headers: { "Content-Type": "application/json" },
    status: 400
  });
}

function cleanBase64(image: string) {
  let clean = image.toString().replace(/\s/g, "");
  if (clean.startsWith("data:image")) {
    clean = clean.split(",")[1] || "";
  }
  return clean;
}

function validateBase64(base64: string) {
  if (!base64) throw new Error("Invalid base64 image: Empty string.");
  const base64Regex = /^[A-Za-z0-9+/=]+$/;
  if (!base64Regex.test(base64)) throw new Error("Invalid base64 format detected.");
}

async function generateWithRetry(model, prompt, schema, imageParts, retries = 2) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }, ...imageParts] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1,
          maxOutputTokens: 4096,
          responseSchema: schema
        }
      });
      return await result.response.text();
    } catch (err) {
      console.warn(`Gemini API Error (attempt ${attempt + 1}):`, err.message);
      if (attempt === retries - 1) throw err;
    }
  }
}

function safeParseJSON(text: string) {
  try {
    return JSON.parse(text.trim());
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

function finalizeResponse(jsonResponse) {
  jsonResponse.objects = jsonResponse.objects || [];
  jsonResponse.objects.forEach(o => o.confidence = Math.round(o.confidence || 0));

  jsonResponse.message = jsonResponse.objects.length > 1
    ? "Multiple objects detected! Tap one to learn more."
    : jsonResponse.objects.length === 1
      ? "Object detected! Check out the science behind it."
      : "No clear objects detected. Try a clearer photo.";

  if (!jsonResponse.selectedObject) {
    jsonResponse.selectedObject = jsonResponse.objects[0] || getDefaultSelectedObject();
  }
}

function getDefaultResponse() {
  return {
    objects: [],
    selectedObject: getDefaultSelectedObject(),
    message: "Default analysis: No objects detected."
  };
}

function getDefaultSelectedObject() {
  return {
    name: "Unknown Object",
    confidence: 0,
    quick_fact: "",
    the_science_in_action: "",
    why_it_matters_to_you: "",
    explore_further: ""
  };
}
