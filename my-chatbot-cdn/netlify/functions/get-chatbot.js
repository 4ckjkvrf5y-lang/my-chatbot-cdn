const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

exports.handler = async (event) => {
  // Grab the client id from the query parameter (e.g., ?id=bloom_hair)
  const clientId = event.queryStringParameters.id; 

  if (!clientId) {
    return { statusCode: 400, body: "Missing client ID" };
  }

  // 1. Pull status and chatbot config from Supabase in a single quick call
  const { data, error } = await supabase
    .from('clients')
    .select('status, chatbot_config')
    .eq('client_id', clientId)
    .single();

  // 2. Gatekeeper Check: If suspended or not found, do not deliver the bot
  if (error || !data || data.status === 'suspended') {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/javascript', 'Access-Control-Allow-Origin': '*' },
      body: `console.warn("Chatbot disabled for ${clientId}: Pending payment verification.");`
    };
  }

  // 3. Deliver the active chatbot injected with their specific database config
  const activeChatbotScript = `
    (function() {
      // 1. Save the live Supabase JSON rules to a global variable
      window.ChatbotConfig = ${JSON.stringify(data.chatbot_config)};
      
      console.log("Chatbot verified and loading rules for ${clientId}...");
      
      // 2. Fetch and execute your core visual loader script from your Netlify assets
      const script = document.createElement('script');
      script.src = 'https://netlify.app';
      document.head.appendChild(script);
    })();
  `;

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/javascript', 'Access-Control-Allow-Origin': '*' },
    body: activeChatbotScript
  };


