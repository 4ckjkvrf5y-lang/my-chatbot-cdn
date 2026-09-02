const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

exports.handler = async (event) => {
  const clientId = event.queryStringParameters.id; // e.g., ?id=client_abc_corp

  // 1. Look up the client status instantly
  const { data, error } = await supabase
    .from('clients')
    .select('status')
    .eq('client_id', clientId)
    .single();

  if (error || !data || data.status === 'suspended') {
    // Return an absolute blank script if they haven't paid
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/javascript', 'Access-Control-Allow-Origin': '*' },
      body: `console.warn("Chatbot disabled: Pending payment verification.");`
    };
  }

  // 2. Return your true chatbot initializer if they are active
  const activeChatbotScript = `
    (function() {
      console.log("Chatbot loading successfully...");
      // PASTE YOUR RAW CHATBOT INJECTION CODE RIGHT HERE
    })();
  `;

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/javascript', 'Access-Control-Allow-Origin': '*' },
    body: activeChatbotScript
  };
};

