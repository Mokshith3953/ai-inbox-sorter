import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sender, subject, snippet, content } = await req.json();

    console.log('Classifying email:', { sender, subject });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Prepare the email content for classification
    const emailText = `
From: ${sender}
Subject: ${subject}
${snippet ? `Preview: ${snippet}` : ''}
${content ? `\nContent: ${content}` : ''}
    `.trim();

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-lite',
        messages: [
          {
            role: 'system',
            content: `You are an email classification assistant. Classify emails into exactly one of these categories:
- urgent: Time-sensitive emails requiring immediate attention, deadlines, important meetings
- promotional: Marketing emails, advertisements, sales, newsletters, offers
- personal: Personal communications from friends, family, social invitations
- work: Work-related emails, project updates, team communications, professional matters
- spam: Unwanted emails, suspicious content, phishing attempts

Respond ONLY with a JSON object in this exact format:
{"category": "one_of_the_categories", "confidence": 0.95, "reason": "brief explanation"}

The confidence should be a number between 0 and 1.`
          },
          {
            role: 'user',
            content: `Classify this email:\n\n${emailText}`
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    console.log('AI Response:', aiResponse);

    // Parse the JSON response
    let classification;
    try {
      // Extract JSON from response (handle potential markdown formatting)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      classification = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse);
      // Fallback classification
      classification = {
        category: 'work',
        confidence: 0.5,
        reason: 'Failed to parse AI response'
      };
    }

    return new Response(
      JSON.stringify({
        category: classification.category,
        confidence: classification.confidence,
        reason: classification.reason
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in classify-email function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        category: 'work',
        confidence: 0.5,
        reason: 'Error occurred during classification'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
