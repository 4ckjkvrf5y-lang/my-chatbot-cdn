const { createClient } = require('@supabase/supabase-js');

// Server-side only. This key must never appear in any file sent to the browser.
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async (req, res) => {
  const origin = req.headers.origin || '';

  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(200).json({ status: 'suspended' });
  }

  const clientId = req.query.clientId;
  if (!clientId) {
    return res.status(200).json({ status: 'suspended' });
  }

  try {
    const { data, error } = await supabase
      .from('clients')
      .select('status, bot_config, allowed_domain')
      .or(`client_id.eq.${clientId},stripe_customer_id.eq.${clientId}`)
      .single();

    if (error || !data) {
      return res.status(200).json({ status: 'suspended' });
    }

    // Optional extra lock: only serve the bot to domains you've approved for this client.
    if (data.allowed_domain) {
      const allowedList = data.allowed_domain.split(',').map(d => d.trim());
      const isAllowed = allowedList.some(d => origin.includes(d));
      if (!isAllowed) {
        return res.status(200).json({ status: 'suspended' });
      }
    }

    res.setHeader('Access-Control-Allow-Origin', origin || '*');

    if (data.status !== 'active') {
      return res.status(200).json({ status: 'suspended' });
    }

    return res.status(200).json({
      status: 'active',
      code: data.bot_config
    });

  } catch (err) {
    console.error('get-chatbot error:', err.message);
    return res.status(200).json({ status: 'suspended' });
  }
};
