/**
 * ViralRestore AI Worker
 * Uses Cloudflare Workers AI (Llama 3.2 11B Vision)
 */

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(),
      });
    }

    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405);
    }

    try {
      const body = await request.json();
      const { image } = body;

      if (!image) {
        return json({ error: "No image provided" }, 400);
      }

      // Normalize to data URL
      const imageDataUrl = image.startsWith("data:")
        ? image
        : `data:image/jpeg;base64,${image}`;

      const systemPrompt = `You are an elite social media strategist and conversion copywriter. 
You specialize in creating English content that stops the scroll, creates emotional connection, and drives engagement or sales on Instagram, Facebook, TikTok and X.`;

      const userPrompt = `Carefully analyze the provided restored/enhanced photograph.

Return ONLY a valid JSON object with this exact structure (no markdown, no extra text):

{
  "description": "Clear 1-2 sentence description of what is in the image",
  "viral_captions": [
    "Emotional / nostalgia hook caption",
    "Curiosity-driven caption that makes people want to look closer",
    "Storytelling / relatable caption",
    "Short punchy high-energy caption"
  ],
  "ad_captions": [
    "Benefit-focused soft-sell caption with clear value",
    "Urgency + FOMO style caption",
    "Direct response caption with strong CTA"
  ],
  "hashtags": ["#RelevantTag1", "#RelevantTag2", "#RelevantTag3", "#RelevantTag4", "#RelevantTag5", "#RelevantTag6", "#RelevantTag7", "#RelevantTag8"],
  "best_format": "Recommended posting format and short reason why",
  "hook_score": "High or Medium - one sentence why it will perform well"
}

Guidelines:
- All text in natural, conversational American English
- Viral captions = pure organic engagement (no hard selling)
- Ad captions = clear value proposition + call-to-action
- Captions should feel human, not robotic
- Optimize for people stopping to look and engage
- Keep individual captions under 220 characters when possible`;

      const aiResponse = await env.AI.run(
        "@cf/meta/llama-3.2-11b-vision-instruct",
        {
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: [
                { type: "text", text: userPrompt },
                {
                  type: "image_url",
                  image_url: { url: imageDataUrl },
                },
              ],
            },
          ],
          max_tokens: 1400,
          temperature: 0.72,
        }
      );

      let result = aiResponse.response ?? aiResponse.result ?? aiResponse;

      // Clean and parse if string
      if (typeof result === "string") {
        result = result
          .replace(/```json\s*/gi, "")
          .replace(/```\s*/g, "")
          .trim();

        try {
          result = JSON.parse(result);
        } catch (parseErr) {
          // Fallback if model didn't return clean JSON
          result = {
            description: result.substring(0, 250),
            viral_captions: [result.substring(0, 200)],
            ad_captions: [],
            hashtags: ["#restored", "#beforeandafter", "#viral"],
            best_format: "Single image post",
            hook_score: "Medium - AI response was not fully structured",
          };
        }
      }

      // Ensure required fields exist
      result.viral_captions = result.viral_captions || [];
      result.ad_captions = result.ad_captions || [];
      result.hashtags = result.hashtags || [];

      return json(result);
    } catch (err) {
      console.error("Worker error:", err);
      return json(
        {
          error: "Failed to process image",
          details: err.message || "Unknown error",
        },
        500
      );
    }
  },
};

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(),
    },
  });
}
