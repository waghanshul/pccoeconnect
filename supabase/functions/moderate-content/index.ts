import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Curated list of common English profanity (word-boundary matched to avoid false positives)
const BAD_WORDS = [
  "ass","asshole","bastard","bitch","bollocks","bullshit","crap","cunt",
  "damn","dick","dickhead","dumbass","fag","faggot","fuck","fucker",
  "fucking","goddamn","hell","idiot","jackass","motherfucker","nigga",
  "nigger","piss","prick","pussy","retard","shit","slut","sob",
  "stfu","twat","wanker","whore","wtf"
];

// Build a single regex with word boundaries for all bad words
const badWordsPattern = new RegExp(
  "\\b(" + BAD_WORDS.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|") + ")\\b",
  "i"
);

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const { content } = await req.json();

    if (!content || typeof content !== "string") {
      return new Response(
        JSON.stringify({ flagged: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check content against bad words
    const match = content.match(badWordsPattern);

    if (match) {
      return new Response(
        JSON.stringify({
          flagged: true,
          reason: "Your content contains inappropriate language and cannot be posted.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ flagged: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Moderation error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
