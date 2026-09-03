(async function() {
  // 1. Automatically grab the unique client ID passed from the website
  const clientId = window.clientId || "bloom_hair";

  // 2. Load the official Supabase library dynamically into the client's page
  const supabaseScript = document.createElement('script');
  supabaseScript.src = 'https://jsdelivr.net';
  document.head.appendChild(supabaseScript);

  // Wait for the Supabase library to finish loading before running our database query
  supabaseScript.onload = async () => {
    // 3. SECURE INTEGRATION: Replace with your actual strings from your Supabase Dashboard Settings -> API
    const supabaseUrl = "https://supabase.co"; 
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-key-here";
    
    const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

    // 4. Fetch the client's status and their custom personalized JSON rules
    const { data, error } = await supabaseClient
      .from('clients')
      .select('status, chatbot_config')
      .eq('client_id', clientId)
      .single();

    // 5. GATEKEEPER FAILSAFE: If they haven't paid or don't exist, completely hide the bot
    if (error || !data || data.status === 'suspended') {
      console.warn(`Chatbot disabled for ${clientId}: Pending payment verification.`);
      return; 
    }

    // 6. Access your client's personalized text, chips, and QA metrics
    const config = data.chatbot_config;
    console.log(`Chatbot verified and loading profile for: ${clientId}`);

    // =========================================================================
    // PAST YOUR EXISTING CHAT BUBBLE RENDERING / UI VISUAL CODE DIRECTLY BELOW
    // =========================================================================
    
    // (Example code utilizing the dynamic config parameters)
    const chatBubble = document.createElement('div');
    chatBubble.id = 'chatbot-widget-bubble';
    chatBubble.style.cssText = 'position:fixed; bottom:20px; right:20px; width:60px; height:60px; border-radius:50%; background:#007bff; cursor:pointer; z-index:99999;';
    document.body.appendChild(chatBubble);

    // Your existing chatbot widget interface build code goes here...
    
  };
})();
