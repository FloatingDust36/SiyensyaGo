// In supabase/functions/analyze-image/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai'

// This is our "Anchor and Bridge" prompt template
const PROMPT = `
You are SiyensyaGo, a fun and curious science guide for Filipino students. Your goal is to make science exciting and relevant.
Analyze the user-provided image.

Academic Anchor: Identify a relevant DepEd learning competency for Grade 5 Science.
Core Task: Explain the science of the object in the image. Go beyond a simple definition. Show a Grade 5 student why this is cool and how it connects to their life. Use a Filipino context.

Required JSON Output Structure:
{
  "name": "OBJECT_NAME",
  "confidence": CONFIDENCE_SCORE_0_100,
  "quick_fact": "A surprising, one-sentence fact about the topic.",
  "the_science_in_action": "A simple explanation of the core science.",
  "why_it_matters_to_you": "A clear, relatable example of how this applies to their life in the Philippines.",
  "explore_further": "A fun question to make them think."
}
`

serve(async (req) => {
  try {
    // 1. Get the image data and content type from the request
    const { image, contentType } = await req.json()
    // Convert the base64 image to the format Gemini needs
    const image_parts = [{
      inline_data: {
        data: image,
        mime_type: contentType,
      },
    }];

    // 2. Initialize the Gemini API with our secret key
    const API_KEY = Deno.env.get('GEMINI_API_KEY')
    if (!API_KEY) {
      throw new Error("Missing GEMINI_API_KEY")
    }
    const genAI = new GoogleGenerativeAI(API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' })

    // 3. Call the Gemini API
    const result = await model.generateContent([PROMPT, ...image_parts])
    const response = await result.response
    const text = response.text()

    // Log the raw response from Google so we can always see it, for debugging. Comment out in production if you want.
    // console.log("Raw response from Gemini:", text);

    // Intelligently find the start and end of the JSON object
    const startIndex = text.indexOf('{');
    const endIndex = text.lastIndexOf('}');
    
    if (startIndex === -1 || endIndex === -1) {
      throw new Error("Could not find a valid JSON object in the AI response.");
    }

    const jsonString = text.substring(startIndex, endIndex + 1);

    const jsonResponse = JSON.parse(jsonString);

    return new Response(JSON.stringify(jsonResponse), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    // Handle any errors
    console.error("Caught an error:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})