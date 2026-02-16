import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PostRequest {
  imageUrl: string;
  caption: string;
  platforms: ('facebook' | 'instagram')[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { imageUrl, caption, platforms } = await req.json() as PostRequest;

    // Securely get your keys from Supabase Environment Variables
    const FB_PAGE_ID = Deno.env.get('FB_PAGE_ID');
    const IG_BUSINESS_ID = Deno.env.get('IG_BUSINESS_ID');
    const META_ACCESS_TOKEN = Deno.env.get('META_ACCESS_TOKEN');

    const results: any = {};

    // --- FACEBOOK POSTING LOGIC ---
    if (platforms.includes('facebook')) {
      const fbResponse = await fetch(
        `https://graph.facebook.com/v20.0/${FB_PAGE_ID}/photos`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: imageUrl,
            caption: caption,
            access_token: META_ACCESS_TOKEN,
          }),
        }
      );
      results.facebook = await fbResponse.json();
    }

    // --- INSTAGRAM POSTING LOGIC (2 Steps) ---
    if (platforms.includes('instagram')) {
      // Step 1: Create Media Container
      const igContainerReq = await fetch(
        `https://graph.facebook.com/v20.0/${IG_BUSINESS_ID}/media`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image_url: imageUrl,
            caption: caption,
            access_token: META_ACCESS_TOKEN,
          }),
        }
      );

      const containerData = await igContainerReq.json();

      if (containerData.id) {
        // Step 2: Publish the Container
        const igPublishReq = await fetch(
          `https://graph.facebook.com/v20.0/${IG_BUSINESS_ID}/media_publish`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              creation_id: containerData.id,
              access_token: META_ACCESS_TOKEN,
            }),
          }
        );
        results.instagram = await igPublishReq.json();
      } else {
        results.instagram = { error: "Failed to create IG container", details: containerData };
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});