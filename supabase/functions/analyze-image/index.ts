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
    const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' })

    // 3. Call the Gemini API
    const result = await model.generateContent([PROMPT, ...image_parts])
    const response = await result.response
    const text = response.text()

    // 4. Return the result to the mobile app
    return new Response(text, {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    // Handle any errors
    console.error(error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})