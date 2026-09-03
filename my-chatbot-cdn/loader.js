(async function() {
  const clientId = window.clientId || "bloom_hair";

  // 1. SAFE LOAD GATE: Only download the Supabase library if it doesn't exist yet
  if (!window.supabase) {
    await new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://jsdelivr.net';
      script.onload = () => resolve();
      document.head.appendChild(script);
    });
  }

  // 2. DATABASE AUTHENTICATION
  const supabaseUrl = "https://supabase.co"; 
  const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0ZW5md2d0ZXprb2RqbHRmZXdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjUwODExMDMsImV4cCI6MjA0MDY1NzEwM30.your-key-here"; // Make sure your exact public anon key string is intact here
  const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

  // 3. FETCH CLIENT PAYMENT ACCESS & PERSONALIZED QA CONFIG FROM DATABASE
  const { data, error } = await supabaseClient
    .from('clients')
    .select('status, chatbot_config')
    .eq('client_id', clientId)
    .single();

  // 4. GATEKEEPER CHECK: Stop execution immediately if suspended or missing
  if (error || !data || data.status === 'suspended') {
    console.warn(`Chatbot disabled for ${clientId}: Pending payment verification.`);
    return; 
  }

  const config = data.chatbot_config;
  console.log(`Chatbot verified and launching engine profile for: ${clientId}`);

  // =========================================================================
  // 5. PASTE ALL OF YOUR ORIGINAL VISUAL CHAT WIDGET UI GENERATION CODE BELOW
  // =========================================================================
  
  // (Paste your complete functions here that read config.chips, config.presetQA 
  // and build the layout, text divs, chat message window box, etc.)

})();
