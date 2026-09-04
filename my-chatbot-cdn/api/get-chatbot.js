// api/get-chatbot.js
const { createClient } = require('@supabase/supabase-js');

// Server-side only — uses the SERVICE ROLE key so it can safely read
// protected columns, bypassing RLS. This key must NEVER be sent to the browser.
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async (req, res) => {
  // Client websites live on different domains than your Vercel deployment,
  // so CORS headers are required or the fetch() in loader.js will be blocked.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const clientId = req.query.clientId;
  if (!clientId) return res.status(400).json({ error: 'Missing clientId parameter' });

  try {
    const { data, error } = await supabase
      .from('clients')
      .select('status, bot_config')
      .eq('client_id', clientId)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Client not found' });
    }

    if (data.status !== 'active') {
      return res.status(403).json({ error: 'Subscription not active' });
    }

    // bot_config is a column in your Supabase 'clients' table holding
    // that client's personalised chatbot settings (JSON).
    return res.status(200).json({
      status: 'active',
      config: data.bot_config || {}
    });

  } catch (err) {
    console.error('get-chatbot error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
